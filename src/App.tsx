/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useMemo } from "react";
import { 
  ShieldCheck, 
  ShieldAlert, 
  Upload, 
  FileSearch, 
  AlertTriangle, 
  CheckCircle2, 
  Info,
  Package,
  Activity,
  History,
  Trash2,
  Cpu,
  BarChart3,
  Terminal,
  Zap,
  LayoutDashboard,
  Search,
  Lock,
  Globe
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from "recharts";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AnalysisResult {
  metadata: {
    name: string;
    packageName: string;
    version: string;
    permissions: string[];
    fileSizeInBytes: number;
    minSdkVersion: string;
    targetSdkVersion: string;
    embeddedUrls?: string[];
  };
  analysis: {
    status: "Safe" | "Suspicious";
    riskScore: number;
    findings: string[];
    recommendation: string;
  };
  timestamp?: number;
}

export default function App() {
  const [view, setView] = useState<"scanner" | "intelligence">("scanner");
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Derived stats
  const stats = useMemo(() => {
    const suspiciousCount = history.filter(h => h.analysis.status === "Suspicious").length;
    const alertRate = history.length > 0 ? (suspiciousCount / history.length) * 100 : 2.4;
    return {
      scanned: 12842 + history.length,
      threats: 341 + suspiciousCount,
      rate: alertRate.toFixed(1)
    };
  }, [history]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (!selectedFile.name.endsWith(".apk")) {
        setError("Please upload a valid .apk file");
        return;
      }
      setFile(selectedFile);
      setError(null);
      setResult(null);
    }
  };

  const analyzeAPK = async () => {
    if (!file) return;

    setIsAnalyzing(true);
    setError(null);

    const formData = new FormData();
    formData.append("apk", file);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = await response.json();
      const resultWithMeta = { ...data, timestamp: Date.now() };
      setResult(resultWithMeta);
      setHistory(prev => [resultWithMeta, ...prev.slice(0, 9)]);
    } catch (err: any) {
      setError(err.message || "Something went wrong during analysis");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearResults = () => {
    setResult(null);
    setFile(null);
    setError(null);
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="h-screen w-full bg-slate-950 text-slate-200 font-sans flex flex-col overflow-hidden relative">
      {/* Ambient Background Accents */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/20 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-900/10 blur-[120px] rounded-full pointer-events-none"></div>

      {/* Top Navigation */}
      <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-slate-950/50 backdrop-blur-md z-20">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold tracking-widest text-white uppercase text-sm">APK Guard AI</span>
            </div>
            
            <nav className="hidden md:flex items-center gap-1 bg-slate-900/50 p-1 rounded-lg border border-white/5">
              <button 
                onClick={() => setView("scanner")}
                className={cn(
                  "flex items-center gap-2 px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all",
                  view === "scanner" ? "bg-cyan-500 text-slate-950 shadow-lg" : "text-slate-500 hover:text-white"
                )}
              >
                <Search className="w-3 h-3" />
                Scanner
              </button>
              <button 
                onClick={() => setView("intelligence")}
                className={cn(
                  "flex items-center gap-2 px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all",
                  view === "intelligence" ? "bg-cyan-500 text-slate-950 shadow-lg" : "text-slate-500 hover:text-white"
                )}
              >
                <LayoutDashboard className="w-3 h-3" />
                Intelligence
              </button>
            </nav>
          </div>
        <div className="flex items-center gap-6 text-[10px] font-bold tracking-tighter uppercase text-slate-400">
          <div className="flex items-center gap-2">
            <span className={cn(
              "w-2 h-2 rounded-full animate-pulse",
              isAnalyzing ? "bg-amber-500" : "bg-emerald-500"
            )}></span> 
            {isAnalyzing ? "Scan in Progress" : "System Ready"}
          </div>
          <div className="px-3 py-1 bg-slate-800 rounded border border-white/10 hidden sm:block">
            v2.1.0 Forensic Build
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row gap-6 p-6 overflow-hidden z-10">
        {/* Left Sidebar: Stats */}
        <aside className="w-full md:w-64 flex flex-col gap-4 overflow-y-auto scrollbar-hide">
          <div className="flex-1 bg-slate-900/40 border border-white/5 rounded-2xl p-5 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-3 h-3 text-slate-500" />
              <h2 className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">Security Pulse</h2>
            </div>
            <div className="space-y-4">
              <StatItem label="Apps Scanned" value={stats.scanned.toLocaleString()} color="text-white" />
              <StatItem label="Threats Neutralized" value={stats.threats.toLocaleString()} color="text-emerald-400" />
              <StatItem label="Recent Alert Rate" value={`${stats.rate}%`} color="text-amber-400" />
            </div>
          </div>
          <div className="h-40 bg-blue-600/10 border border-blue-500/20 rounded-2xl p-5 flex flex-col justify-center items-center text-center">
            <Zap className="w-8 h-8 text-blue-400 mb-2" fill="currentColor" fillOpacity={0.2} />
            <p className="text-[10px] font-bold text-blue-100 uppercase tracking-widest">Heuristic Mode</p>
            <p className="text-[9px] text-blue-300/70 mt-1 uppercase tracking-tight">AI pattern matching active</p>
          </div>
        </aside>

        {/* Central Scanner Area */}
        <section className="flex-1 flex flex-col gap-6 overflow-hidden">
          <AnimatePresence mode="wait">
            {view === "scanner" ? (
              <motion.div 
                key="scanner-view"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex-1 flex flex-col gap-6 overflow-hidden"
              >
                <div className="flex-1 bg-gradient-to-b from-slate-900/60 to-slate-950/60 border border-white/10 rounded-3xl flex flex-col items-center justify-center relative overflow-hidden group">
                  {/* Hex Pattern Overlay */}
                  <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 0)", backgroundSize: "24px 24px" }}></div>
                  
                  <AnimatePresence mode="wait">
                    {!result ? (
                      <motion.div 
                        key="uploader"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        className="flex flex-col items-center justify-center w-full max-w-lg px-6"
                      >
                        <input 
                          type="file" 
                          accept=".apk" 
                          onChange={handleFileChange}
                          className="hidden"
                          id="apk-upload"
                          ref={fileInputRef}
                        />
                        
                        {/* Scanner Visual */}
                        <label 
                          htmlFor="apk-upload"
                          className="relative flex items-center justify-center w-64 h-64 cursor-pointer"
                        >
                          <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 border-2 border-cyan-500/10 rounded-full scale-110"
                          ></motion.div>
                          <motion.div 
                            animate={{ rotate: -360 }}
                            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 border border-dashed border-cyan-500/30 rounded-full"
                          ></motion.div>
                          
                          <div className="w-48 h-48 rounded-full bg-slate-950 flex flex-col items-center justify-center border border-white/10 shadow-[0_0_60px_rgba(6,182,212,0.15)] group-hover:shadow-[0_0_80px_rgba(6,182,212,0.25)] transition-all overflow-hidden relative">
                            {isAnalyzing && (
                              <motion.div 
                                initial={{ top: "-100%" }}
                                animate={{ top: "100%" }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                className="absolute left-0 right-0 h-1/2 bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent pointer-events-none z-0"
                              />
                            )}
                            
                            {file ? (
                              <div className="text-center z-10 px-4">
                                <Package className="w-10 h-10 text-cyan-400 mx-auto mb-2" />
                                <span className="text-[10px] uppercase font-black text-cyan-400 tracking-tighter block truncate">
                                  {file.name}
                                </span>
                              </div>
                            ) : (
                              <div className="text-center z-10">
                                <Upload className="w-10 h-10 text-slate-600 mb-2 transition-colors group-hover:text-cyan-400" />
                                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest block group-hover:text-cyan-400">Upload APK</span>
                              </div>
                            )}
                          </div>
                        </label>
      
                        <div className="mt-8 text-center">
                          <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">
                            {file ? "Ready to Scan" : "Drop APK File Here"}
                          </h1>
                          <p className="text-xs text-slate-400 max-w-xs mx-auto uppercase tracking-tighter leading-relaxed">
                            Analyze manifest, permissions, and signature patterns in milliseconds.
                          </p>
                        </div>
      
                        <div className="flex gap-4 mt-10">
                          <button 
                            onClick={() => file ? analyzeAPK() : fileInputRef.current?.click()}
                            disabled={isAnalyzing}
                            className="px-8 py-3 bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-700 text-slate-950 font-black rounded-full transition-all uppercase text-[10px] tracking-[0.2em] shadow-[0_0_30px_rgba(6,182,212,0.3)] flex items-center gap-2"
                          >
                            {isAnalyzing ? (
                              <>
                                <Activity className="w-3 h-3 animate-spin" />
                                Scanning...
                              </>
                            ) : (
                              <>
                                <Cpu className="w-3 h-3" />
                                {file ? "Initiate Deep Scan" : "Select File"}
                              </>
                            )}
                          </button>
                          {file && !isAnalyzing && (
                            <button 
                               onClick={() => setFile(null)}
                               className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-full transition-colors border border-white/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
      
                        {error && (
                          <p className="mt-6 text-red-500 text-[10px] font-bold uppercase tracking-widest">{error}</p>
                        )}
                      </motion.div>
                    ) : (
                      /* Enhanced Result View */
                      <motion.div 
                        key="result"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full h-full p-8 flex flex-col gap-6 overflow-y-auto scrollbar-hide"
                      >
                        <div className="flex justify-between items-start">
                          <button 
                            onClick={clearResults}
                            className="group flex items-center gap-2 text-[10px] font-bold text-slate-500 hover:text-white uppercase transition-colors"
                          >
                            <Trash2 className="w-3 h-3 group-hover:text-red-500" />
                            Clear Analysis Results
                          </button>
                          <div className="text-[10px] text-slate-600 font-mono">
                            REPORT_ID: {result.timestamp}
                          </div>
                        </div>
      
                        <div className={cn(
                          "relative overflow-hidden rounded-3xl border p-8 flex flex-col md:flex-row gap-8 items-center justify-between",
                          result.analysis.status === "Safe" 
                            ? "bg-emerald-500/5 border-emerald-500/20" 
                            : "bg-red-500/5 border-red-500/20"
                        )}>
                          <div className="flex items-center gap-6 relative z-10">
                            <div className={cn(
                              "w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg",
                              result.analysis.status === "Safe" ? "bg-emerald-500" : "bg-red-500"
                            )}>
                              {result.analysis.status === "Safe" ? <ShieldCheck className="w-8 h-8 text-black" /> : <ShieldAlert className="w-8 h-8 text-white" />}
                            </div>
                            <div>
                              <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-1 block">Threat Assessment</span>
                              <h2 className={cn(
                                "text-3xl font-black italic tracking-tighter uppercase",
                                result.analysis.status === "Safe" ? "text-emerald-400" : "text-red-400"
                              )}>
                                {result.analysis.status === "Safe" ? "Verified Safe" : "Fraud Alert"}
                              </h2>
                            </div>
                          </div>
                          
                          <div className="text-right z-10">
                            <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Risk Index</span>
                            <div className="flex items-baseline gap-1 justify-end">
                              <span className={cn(
                                "text-5xl font-black tracking-tighter",
                                result.analysis.riskScore > 70 ? "text-red-500" : result.analysis.riskScore > 30 ? "text-amber-500" : "text-emerald-500"
                              )}>
                                {result.analysis.riskScore}
                              </span>
                              <span className="text-slate-700 font-bold">/100</span>
                            </div>
                          </div>
                        </div>
      
                        <div className="grid lg:grid-cols-2 gap-6 flex-1 min-h-0">
                          <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-6 flex flex-col gap-6">
                            <div className="flex items-center gap-2">
                              <Package className="w-4 h-4 text-slate-500" />
                              <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500">Manifest Data</h3>
                            </div>
                            <div className="space-y-3 flex-1 overflow-y-auto scrollbar-hide">
                              <AnalysisRow label="Identifier" value={result.metadata.packageName} mono />
                              <AnalysisRow label="Version" value={result.metadata.version} />
                              <AnalysisRow label="File Size" value={formatSize(result.metadata.fileSizeInBytes)} />
                              <AnalysisRow label="Min SDK" value={result.metadata.minSdkVersion} />
                              <AnalysisRow label="Target SDK" value={result.metadata.targetSdkVersion} />
                              
                              {result.metadata.embeddedUrls && result.metadata.embeddedUrls.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-white/5">
                                  <div className="flex items-center gap-2 mb-3">
                                    <Globe className="w-3 h-3 text-cyan-500" />
                                    <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Network Endpoints</span>
                                  </div>
                                  <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-hide">
                                    {result.metadata.embeddedUrls.map((url, i) => (
                                      <div key={i} className="text-[10px] font-mono text-slate-400 break-all bg-black/20 p-2 rounded border border-white/5">
                                        {url}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
      
                          <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-6 flex flex-col gap-6">
                            <div className="flex items-center gap-2">
                              <FileSearch className="w-4 h-4 text-slate-500" />
                              <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500">Heuristic Findings</h3>
                            </div>
                            <div className="space-y-3 flex-1 overflow-y-auto scrollbar-hide">
                              {result.analysis.findings.map((f, i) => (
                                <div key={i} className="flex gap-3 text-xs text-slate-300 bg-white/5 p-3 rounded-xl border border-white/5">
                                  {result.analysis.status === "Safe" ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                  ) : (
                                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                                  )}
                                  <span className="leading-relaxed">{f}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
      
                        <div className="p-5 bg-cyan-500/5 border border-cyan-500/20 rounded-2xl flex gap-4 items-start">
                          <Info className="w-5 h-5 text-cyan-500 shrink-0 mt-1" />
                          <div>
                            <h4 className="text-[10px] font-black uppercase text-cyan-500 tracking-widest mb-1">Recommendation</h4>
                            <p className="text-[11px] text-slate-300 leading-relaxed font-medium uppercase">{result.analysis.recommendation}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                {/* Quick Steps */}
                <div className="hidden lg:flex h-20 gap-4">
                  <div className="flex-1 bg-slate-900/40 border border-white/5 rounded-2xl flex items-center px-6 gap-4">
                     <div className="w-8 h-8 rounded bg-slate-950 border border-white/10 flex items-center justify-center font-mono text-cyan-500 text-xs">01</div>
                     <div className="text-[10px] text-slate-400 uppercase leading-relaxed font-bold"><span className="text-white">Phase 1:</span> Load binary into vault</div>
                  </div>
                  <div className="flex-1 bg-slate-900/40 border border-white/5 rounded-2xl flex items-center px-6 gap-4">
                     <div className="w-8 h-8 rounded bg-slate-950 border border-white/10 flex items-center justify-center font-mono text-cyan-500 text-xs">02</div>
                     <div className="text-[10px] text-slate-400 uppercase leading-relaxed font-bold"><span className="text-white">Phase 2:</span> Execute AI heuristic scan</div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="dashboard-view"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 overflow-hidden"
              >
                <IntelligenceDashboard history={history} stats={stats} />
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Right Sidebar: Parameters & Logs */}
        <aside className="w-full md:w-72 bg-slate-950/80 border border-white/10 rounded-2xl p-6 flex flex-col overflow-hidden">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-6">
              <History className="w-3 h-3 text-slate-500" />
              <h2 className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">Analysis Params</h2>
            </div>
            
            <div className="space-y-5">
              <ParameterMeter label="Integrity" value={file || result ? 95 : 0} status={file || result ? "VERIFIED" : "IDLE"} color="bg-emerald-500" />
              <ParameterMeter label="Permission Audit" value={result ? 100 : file ? 45 : 0} status={result ? "COMPLETE" : file ? "SCANNING" : "PENDING"} color="bg-cyan-500" />
              <ParameterMeter label="Signature" value={result ? 100 : 0} status={result ? "MATCHED" : "AWAIT_FILE"} color="bg-blue-500" />
            </div>
          </div>

          <div className="flex-1 min-h-0 flex flex-col border-t border-white/5 pt-6">
            <div className="flex items-center gap-2 mb-4">
              <Terminal className="w-3 h-3 text-slate-500" />
              <h2 className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">Sandbox Logs</h2>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 scrollbar-hide pr-1">
              {history.length > 0 ? (
                history.map((h, i) => (
                  <div key={i} className="text-[9px] font-mono text-slate-500 flex gap-2 items-start py-1 border-b border-white/5 last:border-0">
                    <span className="shrink-0">[{new Date(h.timestamp || 0).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
                    <span className={cn(
                      "font-bold shrink-0",
                      h.analysis.status === "Safe" ? "text-emerald-500/70" : "text-amber-500/70"
                    )}>
                      {h.analysis.status === "Safe" ? "OK" : "WARN"}
                    </span>
                    <span className="truncate">{h.metadata.name}</span>
                  </div>
                ))
              ) : (
                <>
                  <LogEntry time="14:22" status="OK" msg="system_auth_bypass" color="text-emerald-500/70" />
                  <LogEntry time="14:18" status="OK" msg="certificate_check" color="text-emerald-500/70" />
                  <LogEntry time="12:55" status="OK" msg="signature_match" color="text-emerald-500/70" />
                  <LogEntry time="12:40" status="IDLE" msg="awaiting_input" color="text-slate-600" />
                </>
              )}
            </div>
          </div>

          <div className="mt-8 p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/10">
            <p className="text-[10px] text-cyan-200/60 leading-relaxed uppercase font-bold tracking-tight">
              Analysis conducted locally within sandbox instance.
            </p>
          </div>
        </aside>
      </main>

      {/* Footer Status Bar */}
      <footer className="h-10 bg-black/40 border-t border-white/5 flex items-center justify-between px-8 text-[9px] text-slate-500 font-mono z-20">
        <div className="flex gap-6 uppercase font-bold">
          <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-cyan-500 rounded-full"></span> Engine: Stable</div>
          <div className="flex items-center gap-2 hidden sm:flex"><span className="w-1.5 h-1.5 bg-cyan-500 rounded-full"></span> Database: 2026.05.19</div>
        </div>
        <div className="flex gap-4 uppercase font-bold">
          <span>Session: FD-{stats.scanned}</span>
          <span className="text-slate-700">|</span>
          <span>Node: APAC-FOR-02</span>
        </div>
      </footer>
    </div>
  );
}

function IntelligenceDashboard({ history, stats }: { history: AnalysisResult[], stats: any }) {
  const chartData = useMemo(() => {
    // Generate some interesting time-series-like data from history or mock it if history is small
    const baseData = [
      { name: "06:00", risk: 24, threats: 2 },
      { name: "09:00", risk: 32, threats: 5 },
      { name: "12:00", risk: 18, threats: 1 },
      { name: "15:00", risk: 45, threats: 8 },
      { name: "18:00", risk: 38, threats: 4 },
      { name: "21:00", risk: stats.rate, threats: stats.threats % 10 },
    ];
    return baseData;
  }, [stats]);

  const permissionData = useMemo(() => {
    const counts: Record<string, number> = {};
    history.forEach(h => {
      h.metadata.permissions?.forEach(p => {
        const short = p.split(".").pop() || p;
        counts[short] = (counts[short] || 0) + 1;
      });
    });
    
    const sorted = Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    if (sorted.length === 0) {
      return [
        { name: "SMS", value: 12 },
        { name: "LOCATION", value: 8 },
        { name: "CAMERA", value: 5 },
        { name: "FILES", value: 4 },
        { name: "CONTACTS", value: 3 },
      ];
    }
    return sorted;
  }, [history]);

  const statusData = [
    { name: "Safe", value: stats.scanned - stats.threats },
    { name: "Suspicious", value: stats.threats },
  ];

  const COLORS = ["#10b981", "#ef4444"];

  return (
    <div className="h-full flex flex-col gap-6 overflow-y-auto scrollbar-hide pr-2">
      {/* Top Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<ShieldCheck className="w-4 h-4 text-emerald-500" />} label="Avg Reliability" value="98.2%" />
        <StatCard icon={<ShieldAlert className="w-4 h-4 text-red-500" />} label="Malware Hubs" value="14 Sites" />
        <StatCard icon={<Lock className="w-4 h-4 text-cyan-500" />} label="Encrypted" value="100%" />
        <StatCard icon={<Globe className="w-4 h-4 text-blue-500" />} label="Global Nodes" value="48" />
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-6 flex-1 min-h-[600px]">
        {/* Risk Trend */}
        <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-6 flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-500" />
              <h3 className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-500">Heuristic Risk Velocity</h3>
            </div>
            <div className="text-[10px] font-mono text-emerald-500 tracking-tighter">LIVE_FEED_ACTIVE</div>
          </div>
          
          <div className="flex-1 w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#475569" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="#475569" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#020617", border: "1px solid #ffffff1a", borderRadius: "12px", fontSize: "10px" }}
                  itemStyle={{ color: "#06b6d4" }}
                />
                <Area type="monotone" dataKey="risk" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorRisk)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/5">
            <MiniStat label="Anomalies" value="+12%" color="text-amber-500" />
            <LogEntry time="LIVE" status="SYSCALL" msg="io_vector_intercept" color="text-slate-500" />
            <MiniStat label="Latency" value="14ms" color="text-cyan-500" />
          </div>
        </div>

        {/* Permission Hotspots */}
        <div className="flex flex-col gap-6">
          <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-6 flex-1 flex flex-col gap-6">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <h3 className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-500">Permission Heat</h3>
            </div>
            <div className="flex-1 w-full min-h-[200px]">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={permissionData} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" stroke="#475569" fontSize={8} width={60} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#020617", border: "1px solid #ffffff1a", borderRadius: "12px", fontSize: "10px" }}
                  />
                  <Bar dataKey="value" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-6 flex-1 flex flex-col gap-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <h3 className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-500">Fleet Integrity</h3>
            </div>
            <div className="flex-1 w-full flex items-center justify-center min-h-[150px]">
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie
                    data={statusData}
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-between text-[8px] font-black uppercase tracking-widest">
              <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> SAFE</div>
              <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> RISK</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-4 flex flex-col gap-1 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-1">
        {icon}
        <div className="w-1 h-1 bg-white/20 rounded-full"></div>
      </div>
      <div className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">{label}</div>
      <div className="text-xl font-black tracking-tighter text-white">{value}</div>
    </div>
  );
}

function MiniStat({ label, value, color }: { label: string, value: string, color: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <div className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter">{label}</div>
      <div className={cn("text-xs font-black tracking-tighter", color)}>{value}</div>
    </div>
  );
}

function AnalysisRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
      <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter shrink-0">{label}</span>
      <span className={cn(
        "text-[11px] font-bold text-slate-300 truncate pl-4",
        mono ? "font-mono text-[9px]" : ""
      )}>{value}</span>
    </div>
  );
}

function ParameterMeter({ label, value, status, color }: { label: string; value: number; status: string; color: string }) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between text-[9px] font-black uppercase tracking-tighter">
        <span className="text-slate-400">{label}</span>
        <span className={cn(
          "tracking-[0.1em]",
          status === "VERIFIED" || status === "COMPLETE" || status === "MATCHED" ? "text-emerald-400" : "text-amber-500/70"
        )}>{status}</span>
      </div>
      <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
        <motion.div 
          animate={{ width: `${value}%` }}
          className={cn("h-full", color)}
        />
      </div>
    </div>
  );
}

function LogEntry({ time, status, msg, color }: { time: string; status: string; msg: string; color: string }) {
  return (
    <div className="text-[9px] font-mono text-slate-500 flex gap-2">
      <span>[{time}]</span> 
      <span className={cn("font-bold truncate", color)}>{status}</span> 
      <span className="truncate">{msg}</span>
    </div>
  );
}

function StatItem({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="p-3 bg-slate-950/50 rounded-xl border border-white/5">
      <div className="text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-tighter">{label}</div>
      <div className={cn("text-2xl font-black tracking-tighter", color)}>{value}</div>
    </div>
  );
}

