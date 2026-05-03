import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  MapPin,
  Volume2,
  Loader2,
  ExternalLink,
  Pause,
  Bookmark,
  History,
  Trash2,
  BookmarkCheck,
  HardHat,
} from 'lucide-react';
import {
  searchJobsOnWeb,
  generateSpeech,
  stopSpeech,
  extractJobsFromHtml,
} from '../../services/infraScanService';

export default function InfraScan() {
  const [query, setQuery] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState(() => {
    const stored = localStorage.getItem('infraScan_savedJobs');
    return stored ? JSON.parse(stored) : [];
  });
  const [recentScans, setRecentScans] = useState(() => {
    const stored = localStorage.getItem('infraScan_history');
    return stored ? JSON.parse(stored) : [];
  });
  const [view, setView] = useState('results');
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    location: '',
    keywords: '',
    currency: 'USD',
    infraOnly: false,
  });
  const [playingId, setPlayingId] = useState(null);

  // Persistence
  React.useEffect(() => {
    localStorage.setItem('infraScan_savedJobs', JSON.stringify(savedJobs));
  }, [savedJobs]);

  React.useEffect(() => {
    localStorage.setItem('infraScan_history', JSON.stringify(recentScans));
  }, [recentScans]);

  const handleScan = async (e, overrideData) => {
    if (e) e.preventDefault();

    let finalQuery = overrideData?.query || query;

    // Fallback: build query from filters if header query is empty
    if (!finalQuery) {
      if (filters.keywords || filters.location) {
        finalQuery = `${filters.keywords || 'engineering jobs'} ${filters.location ? `in ${filters.location}` : ''}`;
      }
    }

    if (!finalQuery) return;

    setIsScanning(true);
    setError(null);
    setJobs([]);
    setView('results');

    try {
      const extractedJobs = await searchJobsOnWeb(finalQuery);
      setJobs(extractedJobs);

      const newScan = {
        query: finalQuery,
        type: 'search',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        jobCount: extractedJobs.length,
      };
      setRecentScans(prev =>
        [newScan, ...prev.filter(s => s.query !== finalQuery)].slice(0, 10)
      );
    } catch (err) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsScanning(false);
    }
  };

  const toggleSaveJob = (job) => {
    setSavedJobs(prev => {
      const isAlreadySaved = prev.find(
        s => s.id === job.id || (s.title === job.title && s.company === job.company)
      );
      if (isAlreadySaved) {
        return prev.filter(
          s => s.id !== job.id && !(s.title === job.title && s.company === job.company)
        );
      }
      return [...prev, { ...job, isSaved: true }];
    });
  };

  const clearHistory = () => setRecentScans([]);

  const filteredJobs = useMemo(() => {
    const listToFilter = view === 'results' ? jobs : savedJobs;
    return listToFilter.filter(job => {
      const matchesLocation = job.location
        .toLowerCase()
        .includes(filters.location.toLowerCase());

      const filterWords = filters.keywords
        .toLowerCase()
        .split(/[,\s]+/)
        .filter(w => w.length > 2);
      const matchesKeywords =
        filterWords.length === 0 ||
        filterWords.some(
          word =>
            job.title.toLowerCase().includes(word) ||
            job.company.toLowerCase().includes(word) ||
            job.description.toLowerCase().includes(word)
        );

      const matchesInfra = !filters.infraOnly || job.isInfrastructureRelated;

      return matchesLocation && matchesKeywords && matchesInfra;
    });
  }, [jobs, savedJobs, filters, view]);

  const handleTTS = async (job) => {
    if (playingId === job.id) {
      stopSpeech();
      setPlayingId(null);
      return;
    }
    setPlayingId(job.id);
    const text = `${job.title} at ${job.company}. Located in ${job.location}. ${job.description}`;
    await generateSpeech(text);
    setPlayingId(null);
  };

  const isJobSaved = (job) =>
    savedJobs.some(
      s => s.id === job.id || (s.title === job.title && s.company === job.company)
    );

  const getCurrencySymbol = (currency) => {
    switch (currency) {
      case 'USD': return '$';
      case 'GBP': return '£';
      case 'EUR': return '€';
      case 'AED': return 'د.إ';
      case 'ZAR': return 'R';
      case 'KES': return 'KSh';
      default: return '$';
    }
  };

  return (
    <div className="flex flex-col bg-gray-50 rounded-2xl overflow-hidden border border-slate-200" style={{ minHeight: '80vh' }}>

      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-sm">
            <HardHat size={18} />
          </div>
          <span className="text-lg font-extrabold text-blue-600 tracking-tight">
            Infra<span className="text-slate-800">Scan</span>
          </span>
          <span className="text-xs text-slate-400 font-medium ml-2">Job Intelligence</span>
        </div>

        <div className="flex items-center gap-4">
          <form onSubmit={handleScan} className="flex gap-2">
            <input
              type="text"
              placeholder="Search jobs (e.g. Civil Engineer Saudi)..."
              className="w-72 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button
              type="submit"
              disabled={isScanning}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-xl transition-all disabled:opacity-50 flex items-center gap-2 text-sm"
            >
              {isScanning ? <Loader2 className="animate-spin" size={16} /> : <Search size={16} />}
              {isScanning ? 'Scanning...' : 'Scan'}
            </button>
          </form>

          <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600">
            <div className={`w-2 h-2 rounded-full bg-emerald-500 ${isScanning ? 'animate-pulse' : ''}`}></div>
            {isScanning ? 'Scanning Live...' : 'Scanner Active'}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200 p-5 flex flex-col gap-6 overflow-y-auto shrink-0">
          <div className="space-y-5">

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Keywords</label>
              <input
                type="text"
                placeholder="e.g. Engineer, Mechanic"
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all w-full"
                value={filters.keywords}
                onChange={(e) => setFilters({ ...filters, keywords: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Target Location</label>
              <input
                type="text"
                placeholder="e.g. London, Remote"
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all w-full"
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Currency</label>
              <select
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all w-full"
                value={filters.currency}
                onChange={(e) => setFilters({ ...filters, currency: e.target.value })}
              >
                <option value="USD">USD ($) — US Dollar</option>
                <option value="GBP">GBP (£) — British Pound</option>
                <option value="EUR">EUR (€) — Euro</option>
                <option value="AED">AED (د.إ) — UAE Dirham</option>
                <option value="ZAR">ZAR (R) — South African Rand</option>
                <option value="KES">KES (KSh) — Kenyan Shilling</option>
              </select>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-4">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={filters.infraOnly}
                  onChange={(e) => setFilters({ ...filters, infraOnly: e.target.checked })}
                />
                <div className={`w-10 h-6 rounded-full transition-colors ${filters.infraOnly ? 'bg-blue-600' : 'bg-slate-200'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full mt-1 ml-1 transition-transform shadow-sm ${filters.infraOnly ? 'translate-x-4' : ''}`}></div>
                </div>
                <span className="text-sm font-semibold text-slate-700 group-hover:text-blue-600 transition-colors">
                  Infrastructure Only
                </span>
              </label>

              {recentScans.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Recent Scans</label>
                    <button
                      onClick={clearHistory}
                      className="text-xs text-red-400 hover:text-red-500 font-bold uppercase tracking-widest"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="flex flex-col gap-2">
                    {recentScans.map((scan, idx) => (
                      <button
                        key={idx}
                        onClick={() => { setQuery(scan.query); handleScan(undefined, { query: scan.query }); }}
                        className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl hover:border-blue-400 transition-all group text-left"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-700 truncate">"{scan.query}"</p>
                          <p className="text-xs text-slate-400">{scan.timestamp} · {scan.jobCount} jobs</p>
                        </div>
                        <History size={12} className="text-slate-400 group-hover:text-blue-500 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-auto space-y-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Global Search</p>
              <p className="text-xs text-slate-600 leading-relaxed">
                Search jobs <strong>worldwide</strong> — any role, any location, any industry.
              </p>
            </div>
            <button
              onClick={() => handleScan()}
              disabled={isScanning || (!query && !filters.location && !filters.keywords)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
            >
              {isScanning ? <Loader2 className="animate-spin" size={16} /> : <Search size={16} />}
              {isScanning ? 'Scanning...' : 'Search Web'}
            </button>
          </div>
        </aside>

        {/* Main Area */}
        <main className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            <button
              onClick={() => setView('results')}
              className={`p-4 rounded-2xl border flex flex-col gap-1 transition-all text-left ${
                view === 'results'
                  ? 'bg-blue-50 border-blue-400 shadow-sm'
                  : 'bg-white border-slate-200 hover:border-blue-300'
              }`}
            >
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Live Results</p>
              <p className="text-2xl font-bold text-slate-800">{jobs.length}</p>
            </button>
            <button
              onClick={() => setView('saved')}
              className={`p-4 rounded-2xl border flex flex-col gap-1 transition-all text-left ${
                view === 'saved'
                  ? 'bg-emerald-50 border-emerald-400 shadow-sm'
                  : 'bg-white border-slate-200 hover:border-emerald-300'
              }`}
            >
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Saved Jobs</p>
              <p className="text-2xl font-bold text-slate-800">{savedJobs.length}</p>
            </button>
            <div className="bg-white p-4 rounded-2xl shadow-sm border-l-4 border-blue-500">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Matches</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{filteredJobs.length}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm border-l-4 border-sky-400">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Infrastructure</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">
                {jobs.filter(j => j.isInfrastructureRelated).length}
              </p>
            </div>
          </div>

          {/* List header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-slate-800">
                {view === 'results' ? 'Current Scan Listings' : 'Bookmarks & Favorites'}
              </h2>
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              {isScanning ? 'Scanning...' : `Showing ${filteredJobs.length} listings`}
            </p>
          </div>

          {/* Jobs List */}
          <div className="flex flex-col gap-3">
            <AnimatePresence mode="popLayout">
              {filteredJobs.map((job, index) => (
                <motion.div
                  key={job.id || index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ delay: index * 0.03 }}
                  className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex items-center gap-5 hover:border-blue-300 transition-all group"
                >
                  {/* Company initial avatar */}
                  <div className="w-11 h-11 bg-slate-100 rounded-xl flex items-center justify-center font-black text-slate-400 text-lg shrink-0">
                    {job.company?.[0]?.toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-slate-800 mb-1 truncate group-hover:text-blue-600 transition-colors">
                      {job.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
                      <span className="font-semibold text-slate-700">{job.company}</span>
                      <span>·</span>
                      <span>{job.location}</span>
                      {job.salary && job.salary !== 'Not disclosed' && (
                        <>
                          <span>·</span>
                          <span className="text-blue-600 font-bold">
                            {getCurrencySymbol(filters.currency)}{job.salary}
                          </span>
                        </>
                      )}
                    </div>
                    {job.description && (
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1">{job.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold">
                      {job.postedDate || 'New'}
                    </span>

                    {/* Save */}
                    <button
                      onClick={() => toggleSaveJob(job)}
                      className={`p-2 rounded-lg transition-all ${
                        isJobSaved(job)
                          ? 'bg-emerald-500 text-white shadow-md'
                          : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                      }`}
                      title={isJobSaved(job) ? 'Remove from saved' : 'Save job'}
                    >
                      {isJobSaved(job) ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
                    </button>

                    {/* TTS */}
                    <button
                      onClick={() => handleTTS(job)}
                      className={`p-2 rounded-lg transition-all ${
                        playingId === job.id
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                      }`}
                      title="Read aloud"
                    >
                      {playingId === job.id ? <Pause size={15} /> : <Volume2 size={15} />}
                    </button>

                    {/* External link */}
                    {job.url && job.url !== '#' && (
                      <a
                        href={job.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-slate-800 text-white rounded-lg hover:opacity-90 transition-opacity"
                        title="View job posting"
                      >
                        <ExternalLink size={15} />
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Empty state */}
            {!isScanning && filteredJobs.length === 0 && (
              <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center gap-4 opacity-70">
                <Search size={40} className="text-slate-300" />
                <div className="space-y-1">
                  <p className="font-bold text-slate-600 text-lg">No matches found</p>
                  <p className="text-sm text-slate-400 max-w-xs mx-auto">
                    Try adjusting your keywords or clearing your location filter.
                  </p>
                </div>
              </div>
            )}

            {/* Loading skeleton */}
            {isScanning && (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-xl p-6 h-24 animate-pulse border border-slate-100"></div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 px-6 py-2.5 flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            Global Search
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            Engine: Groq Llama 3
          </div>
        </div>
        <div>© 2026 InfraScan · ResumeApp</div>
      </footer>
    </div>
  );
}
