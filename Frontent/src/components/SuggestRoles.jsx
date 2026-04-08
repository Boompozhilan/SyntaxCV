import React, { useState } from 'react';

export default function SuggestRoles() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDiscover = async () => {
    if (!file) {
      setError("Please upload a resume first.");
      return;
    }

    setLoading(true);
    setError("");
    setResults(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
        // Calling your brand new backend endpoint!
        const response = await fetch("http://localhost:8000/suggest-roles", {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            throw new Error("Server failed to process the request.");
        }

        const data = await response.json();
        if (data.suggestions) {
            setResults(data.suggestions);
        } else {
            throw new Error("AI returned an invalid format.");
        }
    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-8">
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl">
        <h2 className="text-2xl font-bold text-white mb-2">Discover Your Next Role ✨</h2>
        <p className="text-slate-400 mb-6">Upload your resume and let AI match your skills to the perfect IT careers.</p>

        {/* Upload Section */}
        <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center mb-6 hover:border-blue-500 transition-colors">
            <input 
              type="file" 
              accept=".pdf,.docx" 
              onChange={handleFileChange}
              className="text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
            />
        </div>

        {error && <div className="text-red-400 bg-red-900/20 p-3 rounded mb-4">{error}</div>}

        <button 
          onClick={handleDiscover}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-all disabled:opacity-50"
        >
          {loading ? "Scanning Profile..." : "Analyze Career Paths"}
        </button>
      </div>

      {/* Results Display Area */}
      {results && (
        <div className="mt-8 space-y-4">
          <h3 className="text-xl font-bold text-white mb-4">Top Career Matches:</h3>
          {results.map((role, index) => (
            <div key={index} className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg border-l-4 border-l-blue-500">
                <div className="flex justify-between items-start mb-2">
                    <h4 className="text-xl font-bold text-blue-400">{role.role_title}</h4>
                    <span className="bg-green-900/50 text-green-400 font-bold px-3 py-1 rounded-full text-sm">
                        {role.match_confidence}% Match
                    </span>
                </div>
                <p className="text-slate-300 mt-2">{role.reason}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
