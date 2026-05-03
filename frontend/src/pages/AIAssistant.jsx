import React, { useState } from 'react';
import api from '../api';
import InfraScan from '../components/InfraScan/InfraScan';
import ReferencesManager from '../components/ReferencesManager';

function AIAssistant() {
  const [activeTab, setActiveTab] = useState('infrascan');
  const [jobDescription, setJobDescription] = useState('');
  const [keywords, setKeywords] = useState([]);
  const [coverLetter, setCoverLetter] = useState('');
  const [generating, setGenerating] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');

  const extractKeywords = async () => {
    if (!jobDescription) {
      alert('Please paste a job description first');
      return;
    }
    setExtracting(true);
    try {
      const res = await api.post('/ai/extract-keywords', { jobDescription });
      setKeywords(res.data.keywords);
    } catch (error) {
      console.error('Error extracting keywords:', error);
      alert('Failed to extract keywords');
    } finally {
      setExtracting(false);
    }
  };

  const generateCoverLetter = async () => {
    if (!jobDescription) {
      alert('Please paste a job description first');
      return;
    }
    setGenerating(true);
    try {
      const res = await api.post('/ai/generate-cover-letter', {
        jobTitle: jobTitle || 'the position',
        companyName: companyName || 'your company',
        jobDescription,
      });
      setCoverLetter(res.data.coverLetter);
    } catch (error) {
      console.error('Error generating cover letter:', error);
      alert('Failed to generate cover letter');
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(coverLetter);
    alert('Cover letter copied to clipboard!');
  };

  const tabs = [
    { id: 'infrascan', label: 'InfraScan', icon: 'fas fa-search-location' },
    { id: 'keywords', label: 'Keyword Extractor', icon: 'fas fa-tags' },
    { id: 'cover', label: 'Cover Letter', icon: 'fas fa-envelope' },
    { id: 'references', label: 'References', icon: 'fas fa-users' },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-white mb-6">AI Assistant</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-700 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-t-lg transition ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <i className={`${tab.icon} mr-2`}></i>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: InfraScan */}
      {activeTab === 'infrascan' && (
        <InfraScan />
      )}

      {/* Tab 2: Keyword Extractor */}
      {activeTab === 'keywords' && (
        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
          <h2 className="text-xl font-semibold text-white mb-4">Keyword Extractor</h2>
          <p className="text-slate-400 mb-4">Paste a job description to extract key skills and requirements.</p>
          <textarea
            rows="8"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste job description here..."
            className="w-full p-4 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500"
          />
          <button
            onClick={extractKeywords}
            disabled={extracting}
            className="mt-4 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition disabled:opacity-50"
          >
            {extracting ? (
              <i className="fas fa-spinner fa-spin mr-2"></i>
            ) : (
              <i className="fas fa-magic mr-2"></i>
            )}
            {extracting ? 'Extracting...' : 'Extract Keywords'}
          </button>
          {keywords.length > 0 && (
            <div className="mt-6">
              <h3 className="text-md font-semibold text-white mb-3">Extracted Keywords:</h3>
              <div className="flex flex-wrap gap-2">
                {keywords.map((keyword, i) => (
                  <span key={i} className="px-3 py-1.5 bg-slate-700 rounded-lg text-sm text-slate-300">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Cover Letter Generator */}
      {activeTab === 'cover' && (
        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
          <h2 className="text-xl font-semibold text-white mb-4">Cover Letter Generator</h2>
          <p className="text-slate-400 mb-4">Generate a personalized cover letter using AI.</p>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Job Title"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="p-3 bg-slate-900 border border-slate-700 rounded-lg text-white"
            />
            <input
              type="text"
              placeholder="Company Name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="p-3 bg-slate-900 border border-slate-700 rounded-lg text-white"
            />
          </div>
          <textarea
            rows="6"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste job description here..."
            className="w-full p-4 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500"
          />
          <button
            onClick={generateCoverLetter}
            disabled={generating}
            className="mt-4 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition disabled:opacity-50"
          >
            {generating ? (
              <i className="fas fa-spinner fa-spin mr-2"></i>
            ) : (
              <i className="fas fa-magic mr-2"></i>
            )}
            {generating ? 'Generating...' : 'Generate Cover Letter'}
          </button>
          {coverLetter && (
            <div className="mt-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-md font-semibold text-white">Generated Cover Letter:</h3>
                <button onClick={copyToClipboard} className="text-blue-400 hover:text-blue-300 text-sm">
                  <i className="fas fa-copy mr-1"></i> Copy
                </button>
              </div>
              <div className="bg-white rounded-lg p-6 max-h-96 overflow-y-auto">
                <pre className="text-gray-800 whitespace-pre-wrap font-sans text-sm">{coverLetter}</pre>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: References */}
      {activeTab === 'references' && (
        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
          <ReferencesManager />
        </div>
      )}
    </div>
  );
}

export default AIAssistant;
