APK Guard AI 🛡️
AI-Powered APK Fraud Detection & Cyber Forensics Platform

APK Guard AI is an advanced AI-driven cyber-security web application designed to scan, inspect, and analyze Android APK files for fraudulent behavior, malicious permissions, suspicious network endpoints, and hidden security risks using Gemini AI.

The platform combines static APK analysis, intelligent threat reasoning, and immersive cybersecurity visualization to deliver a modern forensic investigation experience.

🚀 Features
🔍 Heuristic APK Analysis

Extracts and analyzes:

Package Name
Version Information
SDK Requirements
APK Size & Metadata
Android Manifest Data
Dangerous Permissions
Structural APK Characteristics
🌐 Network Endpoint Detection

Scans APK internals to identify:

Embedded URLs
Suspicious Domains
Hardcoded IP Addresses
Tracking Endpoints
Potential Command & Control Servers
🤖 Gemini AI Threat Intelligence

Gemini AI performs:

Permission Risk Analysis
Fraud Pattern Recognition
Malicious Naming Detection
Structural Threat Reasoning
AI-generated Security Recommendations
Explainable Threat Findings
📊 Intelligence Dashboard

Interactive security dashboard powered by Recharts:

Threat Distribution Charts
Permission Frequency Analysis
Historic Threat Trends
Risk Category Visualizations
Endpoint Monitoring Insights
🧹 Secure Sandbox Cleanup

Implements a zero-persistence security architecture:

Temporary APK processing
Secure parser isolation
Automatic file cleanup
No permanent APK storage
🌌 UI & Experience

APK Guard AI features a futuristic cyber-security interface with:

Ambient dark theme
Cyan & emerald neon accents
Animated hex-grid overlays
Smooth motion transitions
Interactive diagnostics viewport
Modern forensic dashboard design
🏗️ Tech Stack
Frontend
React
TypeScript
Vite
Tailwind CSS
Framer Motion
Recharts
Backend
Node.js
Express.js
Gemini AI API
APK Parsing Engine
Security
Sandbox File Isolation
Metadata Sanitization
Temporary File Cleanup
Secure Upload Handling
⚙️ Installation
1️⃣ Clone Repository
git clone https://github.com/your-username/apk-guard-ai.git
cd apk-guard-ai
2️⃣ Install Dependencies
Frontend
cd client
npm install
Backend
cd server
npm install
3️⃣ Configure Environment Variables

Create a .env file inside the server directory:

GEMINI_API_KEY=your_api_key_here
PORT=5000
4️⃣ Run Development Servers
Frontend
npm run dev
Backend
npm start
📂 Project Structure
APK-GUARD-AI/
│
├── client/
│   ├── components/
│   ├── pages/
│   ├── charts/
│   ├── animations/
│   └── utils/
│
├── server/
│   ├── routes/
│   ├── controllers/
│   ├── parsers/
│   ├── services/
│   ├── sandbox/
│   └── ai/
│
├── uploads/
├── README.md
└── package.json
🛡️ Security Workflow
APK Upload
    ↓
Metadata Extraction
    ↓
Manifest & Permission Analysis
    ↓
Endpoint Discovery
    ↓
Gemini AI Intelligence Audit
    ↓
Threat Scoring
    ↓
Interactive Dashboard Report
    ↓
Secure File Cleanup
🎯 Objectives

APK Guard AI aims to:

Detect malicious APK applications
Prevent fraud & phishing attacks
Identify risky permission abuse
Reveal hidden communication endpoints
Provide explainable AI-based threat reports
Improve Android cyber-security awareness
🔮 Future Enhancements
Dynamic Malware Sandbox
Banking Trojan Detection
AI Reverse Engineering Assistant
Threat Intelligence API Integration
IOC Feed Monitoring
APK Similarity Detection
SOC Dashboard Integration
Real-time Behavioral Analysis
📸 Preview

Add screenshots of:

Upload Interface
AI Threat Dashboard
Endpoint Analysis Panel
Risk Visualization Charts
🤝 Contributing

Contributions, improvements, and feature suggestions are welcome.

Fork → Clone → Develop → Pull Request
📜 License

This project is licensed under the MIT License.

⚠️ Disclaimer

APK Guard AI is developed for:

Educational Purposes
Cyber Security Research
Malware Awareness
Ethical Security Analysis

Do not use this platform for unauthorized or illegal activities.

👨‍💻 Author

HARSH GUPTA
AI • Cyber Security • Data Science • Threat Intelligence

⭐ Support

If you like this project:

Star the repository ⭐
Share with developers 🚀
Contribute improvements 🔥

<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/7e824868-1b84-4018-b152-7138f1d83bfa

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
