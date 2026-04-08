import React, { useState } from 'react';
import Upload from './components/upload'; 
import SuggestRoles from './components/SuggestRoles';

export default function App() {
  // ==========================================
  // TAB NAVIGATION STATE
  // ==========================================
  const [activeTab, setActiveTab] = useState('analyze');

  // ==========================================
  // ANALYZER STATE (Your original code)
  // ==========================================
  const [file, setFile] = useState(null);
  const [role, setRole] = useState("");
  const [description, setDescription] = useState(""); 
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    if (!file || !role) {
      alert("Please upload a file and enter a job role.");
      return;
    }

    setLoading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("role", role);
    formData.append("description", description);

    try {
      const res = await fetch("https://syntaxcv.onrender.com/analyze", {
        method: "POST",
        body: formData,
      });
      
      if (!res.ok) throw new Error("Server error. Make sure your Python backend is running.");
      
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans pb-20">
      
      {/* ========================================== */}
      {/* NEW TABBED HEADER                        */}
      {/* ========================================== */}
      <nav className="border-b border-slate-800 p-6 mb-10 bg-[#1e293b] sticky top-0 z-50 shadow-md">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          
          <h1 
            className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent cursor-pointer"
            onClick={() => setActiveTab('analyze')}
          >
            SyntaxCV <span className="text-slate-500 text-sm font-normal ml-2">| AI Resume Rechecker</span>
          </h1>

          {/* Tab Buttons */}
          <div className="flex space-x-2 bg-[#0f172a] p-1.5 rounded-lg border border-slate-700">
            <button 
              onClick={() => setActiveTab('analyze')}
              className={`px-5 py-2 rounded-md font-bold transition-all text-sm ${
                activeTab === 'analyze' 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Score Resume
            </button>
            <button 
              onClick={() => setActiveTab('suggest')}
              className={`px-5 py-2 rounded-md font-bold transition-all text-sm ${
                activeTab === 'suggest' 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Discover Roles ✨
            </button>
          </div>

        </div>
      </nav>

      {/* ========================================== */}
      {/* MAIN CONTENT AREA                        */}
      {/* ========================================== */}
      <main className="max-w-6xl mx-auto px-4">
        
        {activeTab === 'analyze' ? (
          
          /* --- YOUR ORIGINAL ANALYZER UI --- */
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 animate-fade-in">
            {/* Left Column: Input Form */}
            <div className="lg:col-span-2 space-y-6">
              <section className="bg-[#1e293b] p-6 rounded-2xl border border-slate-800 shadow-xl">
                <h2 className="text-xl font-semibold mb-6 text-white border-b border-slate-700 pb-2">Analysis Parameters</h2>
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-400">Target Job Role</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Frontend Developer"
                      className="w-full bg-[#0f172a] border border-slate-700 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-400">Job Description (Optional)</label>
                    <textarea 
                      placeholder="Paste the job requirements here for better AI matching..."
                      className="w-full bg-[#0f172a] border border-slate-700 p-3 rounded-lg h-24 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-400">Upload Resume</label>
                    <Upload onFileSelect={(selectedFile) => setFile(selectedFile)} />
                  </div>

                  <button 
                    onClick={handleAnalyze}
                    disabled={loading}
                    className={`w-full py-4 rounded-xl font-bold text-white transition-all shadow-lg mt-4
                      ${loading ? "bg-slate-700 cursor-not-allowed opacity-50" : "bg-blue-600 hover:bg-blue-500 active:scale-95"}`}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin h-5 w-5 mr-3 border-t-2 border-white rounded-full" viewBox="0 0 24 24"></svg>
                        AI Analyzing...
                      </span>
                    ) : "Check Score"}
                  </button>

                  {error && (
                    <div className="bg-red-900/20 border border-red-500/50 p-3 rounded-lg text-red-400 text-sm text-center">
                      {error}
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* Right Column: Results Dashboard */}
            <div className="lg:col-span-3">
              {!result && !loading && (
                <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-2xl p-10 text-slate-500 bg-[#1e293b]/30 min-h-[400px]">
                  <svg className="w-16 h-16 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-lg">Waiting for resume upload...</p>
                  <p className="text-sm opacity-60">Upload your file to generate the SWOT analysis.</p>
                </div>
              )}

              {result && (
                <div className="space-y-6 animate-in fade-in duration-500">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-[#1e293b] p-6 rounded-2xl border-l-4 border-blue-500 shadow-xl">
                      <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Match Score</p>
                      <h3 className="text-5xl font-black text-white mt-1">{result.score}%</h3>
                    </div>
                    <div className={`bg-[#1e293b] p-6 rounded-2xl border-l-4 shadow-xl ${result.ats_friendly ? 'border-emerald-500' : 'border-amber-500'}`}>
                      <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">ATS Scan</p>
                      <h3 className="text-2xl font-bold text-white mt-1">
                        {result.ats_friendly ? "🚀 Optimized" : "⚠️ Needs Improvement"}
                      </h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-[#064e3b]/10 p-6 rounded-2xl border border-emerald-500/20 backdrop-blur-sm">
                      <h4 className="text-emerald-400 font-bold mb-4 flex items-center text-lg">
                        <span className="mr-2">✔️</span> Key Advantages
                      </h4>
                      <ul className="space-y-3">
                        {result.advantages.map((item, i) => (
                          <li key={i} className="text-sm text-slate-300 flex items-start">
                            <span className="text-emerald-500 mr-2">•</span> {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-[#7f1d1d]/10 p-6 rounded-2xl border border-red-500/20 backdrop-blur-sm">
                      <h4 className="text-red-400 font-bold mb-4 flex items-center text-lg">
                        <span className="mr-2">❌</span> Critical Gaps
                      </h4>
                      <ul className="space-y-3">
                        {result.disadvantages.map((item, i) => (
                          <li key={i} className="text-sm text-slate-300 flex items-start">
                            <span className="text-red-500 mr-2">•</span> {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="bg-[#1e293b] p-8 rounded-2xl border border-slate-700 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                      <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1a1 1 0 112 0v1a1 1 0 11-2 0zM13.333 16h-1a1 1 0 110-2h1a1 1 0 110 2zM15.657 14.243a1 1 0 010 1.414l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 0z" /></svg>
                    </div>
                    <h4 className="text-blue-400 font-bold mb-6 text-xl tracking-tight">Improvement Roadmap</h4>
                    <div className="space-y-4">
                      {result.suggestions.map((item, i) => (
                        <div key={i} className="bg-[#0f172a] p-4 rounded-xl text-sm text-slate-300 border border-slate-800 flex items-center hover:border-blue-500/50 transition-colors">
                          <span className="w-8 h-8 rounded-full bg-blue-900/30 text-blue-400 flex items-center justify-center mr-4 font-bold shrink-0">
                            {i + 1}
                          </span>
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}
            </div>
          </div>

        ) : (

          /* --- YOUR NEW AI FEATURE --- */
          <div className="animate-fade-in">
            <SuggestRoles />
          </div>

        )}

      </main>
    </div>
  );
}
