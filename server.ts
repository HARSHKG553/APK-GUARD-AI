import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import multer from "multer";
import AppInfoParser from "app-info-parser";
import { GoogleGenAI } from "@google/genai";
import fs from "fs";

const UPLOAD_DIR = "uploads/";
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR);
}

const upload = multer({ dest: UPLOAD_DIR });


async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Gemini Setup
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || "",
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });

  // API Route for APK Analysis
  app.post("/api/analyze", upload.single("apk"), async (req, res) => {
    let filePath = "";
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const originalPath = req.file.path;
      filePath = originalPath + ".apk";
      fs.renameSync(originalPath, filePath);

      const parser = new AppInfoParser(filePath);
      const info = await parser.parse();
      const fileSize = req.file.size;

      // Extract relevant data for Gemini
      // Helper to find URLs in nested objects
      const findUrls = (obj: any): string[] => {
        const urls: string[] = [];
        const urlRegex = /(https?:\/\/[^\s"'<>]+)/g;
        const traverse = (current: any) => {
          if (typeof current === "string") {
            const matches = current.match(urlRegex);
            if (matches) urls.push(...matches);
          } else if (current && typeof current === "object") {
            Object.values(current).forEach(traverse);
          }
        };
        traverse(obj);
        return [...new Set(urls)];
      };

      const embeddedUrls = findUrls(info);

      const apkMetadata = {
        name: info.application?.label || info.package,
        packageName: info.package,
        version: info.versionName,
        minSdkVersion: info.sdkVersion,
        targetSdkVersion: info.targetSdkVersion,
        permissions: info.usesPermission || [],
        fileSizeInBytes: fileSize,
        embeddedUrls,
      };

      // Clean up uploaded file
      try {
        if (filePath && fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (cleanupErr) {
        console.error("Cleanup error:", cleanupErr);
      }

      // Prompt Gemini for fraud analysis
      const prompt = `
        Analyze the following APK metadata for potential fraud or security risks. 
        Focus on:
        1. Suspicious permissions (e.g., SMS, call logs, location, overlay permissions without obvious need).
        2. Suspicious package names (e.g., mimicking legitimate apps like com.google.chrome.update).
        3. File size anomalies (e.g., too small for a complex app).
        4. Embedded URLs: Check if any URLs belong to known malicious domains or look like phishing/adware command & control servers.
        
        APK Metadata: ${JSON.stringify(apkMetadata, null, 2)}
        
        Return the result as a raw JSON object (no markdown formatting) with these fields:
        {
          "status": "Safe" | "Suspicious",
          "riskScore": number (0-100),
          "findings": string[],
          "recommendation": string
        }

        Special instruction: If embedded URLs contain domains like "update-installer.com", "get-free-coins.xyz", or suspicious IP addresses, increase the riskScore significantly and add them to findings.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-flash-latest",
        contents: prompt,
      });
      
      const responseText = response.text;
      
      // Basic JSON cleaning if Gemini includes markdown
      const cleanedJson = responseText?.replace(/```json|```/g, "").trim() || "{}";
      const analysis = JSON.parse(cleanedJson);

      res.json({
        metadata: apkMetadata,
        analysis
      });
    } catch (error: any) {
      // Clean up on error
      try {
        if (filePath && fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (ce) {}
      
      console.error("Analysis Error:", error);
      res.status(500).json({ error: "Failed to analyze APK: " + error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
