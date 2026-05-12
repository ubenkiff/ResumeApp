import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from './api';

function PrintableResume() {
  const { username } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState('free');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetchPublicData();
    fetchCurrentUser();
  }, [username]);

  const fetchCurrentUser = async () => {
    try {
      const res = await api.get('/auth/me');
      setCurrentUser(res.data);
      setSubscriptionStatus(res.data.subscription_status || 'free');
    } catch (err) {
      console.error('Not logged in');
    }
  };

  const fetchPublicData = async () => {
    try {
      const res = await api.get(`/public/${username}`);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'User not found');
    } finally {
      setLoading(false);
    }
  };

  const isOwner = currentUser?.username === username;
  const canPrint = subscriptionStatus === 'premium' || !isOwner;

  const handlePrint = () => {
    if (!canPrint) {
      alert('Upgrade to Premium to download and print your resume. Only $9.99/month!');
      return;
    }
    window.print();
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-100 flex items-center justify-center">Loading resume...</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500">Error</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  const { profile = {}, experience = [], education = [], skills = [], projects = [], achievements = [] } = data || {};

  const skillsByCategory = {};
  skills.forEach(s => {
    if (!skillsByCategory[s.category]) skillsByCategory[s.category] = [];
    skillsByCategory[s.category].push(s);
  });

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Toolbar */}
      <div className="no-print bg-slate-800 text-white px-6 py-3 flex justify-between sticky top-0 z-10">
        <a href="/" className="text-slate-300 hover:text-white">← Back to Dashboard</a>
        <button 
          onClick={handlePrint} 
          className={`px-4 py-2 rounded text-white ${canPrint ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-500 cursor-not-allowed'}`}
        >
          🖨️ Print / Download PDF
          {!canPrint && isOwner && <span className="ml-2 text-xs">(Upgrade)</span>}
        </button>
      </div>

      {/* Premium Upgrade Banner for Free Users */}
      {!canPrint && isOwner && (
        <div className="no-print bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-4 text-center">
          <p className="font-semibold">🔓 Unlock printing and PDF download!</p>
          <p className="text-sm opacity-90">Upgrade to Premium for only $9.99/month</p>
          <button className="mt-2 bg-white text-orange-600 px-4 py-1 rounded-lg text-sm font-semibold">
            Upgrade Now
          </button>
        </div>
      )}

      {/* Resume Content */}
      <div className="py-8 px-4 print:p-0 print:bg-white">
        <div className="max-w-[794px] mx-auto bg-white shadow-lg print:shadow-none">
          <div className="p-10 print:p-8">
            
            {/* Header */}
            <div className="border-b-2 border-blue-500 pb-4 mb-6">
              <div className="flex gap-6">
                {profile.avatar_url && <img src={profile.avatar_url} alt={profile.name} className="w-24 h-24 rounded-full object-cover border-2 border-blue-500" />}
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-800 mb-1">{profile.name || 'Your Name'}</h1>
                  <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-3">{profile.title || 'Professional Title'}</p>
                  <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-gray-600">
                    {profile.email && <span>📧 {profile.email}</span>}
                    {profile.phone && <span>📞 {profile.phone}</span>}
                    {profile.location && <span>📍 {profile.location}</span>}
                    {profile.linkedin && <span>🔗 {profile.linkedin}</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Two Column Layout */}
            <div className="flex gap-8">
              {/* Left Column */}
              <div className="flex-1 space-y-5">
                {profile.bio && (
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-2 border-b border-gray-200 pb-1">Personal Statement</h2>
                    <p className="text-xs leading-relaxed text-gray-700 whitespace-pre-line">{profile.bio}</p>
                  </div>
                )}

                {experience.length > 0 && (
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-3 border-b border-gray-200 pb-1">Professional Experience</h2>
                    <div className="space-y-4">
                      {experience.map((exp, idx) => (
                        <div key={exp.id}>
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-xs font-bold text-gray-800">{exp.job_title}</p>
                              <p className="text-xs text-blue-600 font-medium">{exp.company}{exp.location ? ` | ${exp.location}` : ''}</p>
                            </div>
                            <p className="text-xs text-gray-500 whitespace-nowrap ml-4">{exp.start_date} — {exp.current ? 'Present' : exp.end_date}</p>
                          </div>
                          {exp.description && <p className="text-xs text-gray-600 mt-1 leading-relaxed whitespace-pre-line">{exp.description}</p>}
                          {exp.highlights && exp.highlights.length > 0 && (
                            <ul className="mt-2 space-y-1">
                              {exp.highlights.map((h, i) => (
                                <li key={i} className="text-xs text-gray-600 flex items-start gap-2"><span className="text-blue-500 mt-0.5">•</span> {h}</li>
                              ))}
                            </ul>
                          )}
                          {idx < experience.length - 1 && <div className="border-b border-gray-200 mt-3"></div>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {projects.length > 0 && (
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-3 border-b border-gray-200 pb-1">Key Projects</h2>
                    <div className="space-y-3">
                      {projects.map((project, idx) => (
                        <div key={project.id}>
                          <div className="flex gap-3 items-start">
                            {project.image_urls && project.image_urls[0] && (
                              <img src={project.image_urls[0]} className="w-10 h-10 rounded object-cover" />
                            )}
                            <div className="flex-1">
                              <p className="text-xs font-bold text-gray-800">{project.title}</p>
                              <p className="text-xs text-gray-600 whitespace-pre-line">{project.description}</p>
                              {project.tech_stack && project.tech_stack.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {project.tech_stack.slice(0, 3).map((tech, i) => (
                                    <span key={i} className="text-xs text-gray-400">• {tech}</span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          {idx < projects.length - 1 && <div className="border-b border-gray-200 mt-2"></div>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {education.length > 0 && (
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-3 border-b border-gray-200 pb-1">Education</h2>
                    <div className="space-y-3">
                      {education.map((edu, idx) => (
                        <div key={edu.id}>
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-xs font-bold text-gray-800">{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</p>
                              <p className="text-xs text-gray-600">{edu.institution}{edu.location ? `, ${edu.location}` : ''}</p>
                              {edu.grade && <p className="text-xs text-yellow-600 mt-0.5">Grade: {edu.grade}</p>}
                            </div>
                            <p className="text-xs text-gray-500 whitespace-nowrap ml-4">{edu.start_year} — {edu.end_year || 'Present'}</p>
                          </div>
                          {idx < education.length - 1 && <div className="border-b border-gray-200 mt-2"></div>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column */}
              <div className="w-48 shrink-0 space-y-5">
                {Object.keys(skillsByCategory).map(cat => (
                  <div key={cat}>
                    <h2 className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-2 border-b border-gray-200 pb-1">{cat}</h2>
                    <ul className="space-y-1">
                      {skillsByCategory[cat].map(s => (
                        <li key={s.id} className="text-xs text-gray-700 flex items-center gap-1.5">
                          <span className="h-1 w-1 rounded-full bg-blue-500"></span> {s.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}

                {achievements.length > 0 && (
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-2 border-b border-gray-200 pb-1">Achievements</h2>
                    <div className="space-y-2">
                      {achievements.map((a, idx) => (
                        <div key={a.id}>
                          <p className="text-xs font-semibold text-gray-800 leading-tight">{a.title}</p>
                          {a.issuer && <p className="text-[10px] text-gray-500">{a.issuer} · {a.date}</p>}
                          {idx < achievements.length - 1 && <div className="border-b border-gray-200 mt-1"></div>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print-only CSS */}
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          button {
            display: none !important;
          }
          @page {
            size: letter;
            margin: 0.2in;
          }
        }
      `}</style>
    </div>
  );
}

export default PrintableResume;