import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from './api';

function ATSScore() {
  const { username } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (username) {
      fetchData();
    }
  }, [username]);

  const fetchData = async () => {
    try {
      const res = await api.get(`/public/${username}`);
      setData(res.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('User not found');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-white text-center py-8">Loading ATS version...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-8">{error}</div>;
  }

  const { profile = {}, experience = [], education = [], skills = [], projects = [], achievements = [] } = data || {};

  const skillsByCategory = {};
  skills.forEach(s => {
    if (!skillsByCategory[s.category]) skillsByCategory[s.category] = [];
    skillsByCategory[s.category].push(s);
  });

  return (
    <div>
      <div className="mb-6 flex justify-between items-center no-print">
        <div>
          <h1 className="text-2xl font-bold text-white">ATS Resume Optimizer</h1>
          <p className="text-slate-400 text-sm mt-1">Simple, single-column format optimized for ATS scanners</p>
        </div>
        <button 
          onClick={() => window.print()} 
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
        >
          <i className="fas fa-print mr-2"></i> Print ATS Resume
        </button>
      </div>

      <div className="ats-resume-container bg-white rounded-lg shadow-lg p-8" style={{ fontFamily: 'Arial, Calibri, sans-serif' }}>
        <div className="border-b-2 border-gray-300 pb-4 mb-6">
          <h1 className="text-2xl font-bold text-black mb-1">{profile.name || 'Your Name'}</h1>
          <p className="text-md text-gray-700 mb-2">{profile.title || 'Professional Title'}</p>
          <div className="text-sm text-gray-600">
            {profile.email && <div>Email: {profile.email}</div>}
            {profile.phone && <div>Phone: {profile.phone}</div>}
            {profile.location && <div>Location: {profile.location}</div>}
            {profile.linkedin && <div>LinkedIn: {profile.linkedin}</div>}
          </div>
        </div>

        {profile.bio && (
          <div className="mb-5">
            <h2 className="text-md font-bold text-black uppercase border-b border-gray-300 pb-1 mb-2">Professional Summary</h2>
            <p className="text-sm text-gray-800 leading-relaxed">{profile.bio}</p>
          </div>
        )}

        {experience.length > 0 && (
          <div className="mb-5">
            <h2 className="text-md font-bold text-black uppercase border-b border-gray-300 pb-1 mb-3">Work Experience</h2>
            {experience.map((exp) => (
              <div key={exp.id} className="mb-4">
                <div className="flex justify-between flex-wrap">
                  <div>
                    <h3 className="text-sm font-bold text-black">{exp.job_title}</h3>
                    <p className="text-sm text-gray-700">{exp.company}{exp.location ? `, ${exp.location}` : ''}</p>
                  </div>
                  <p className="text-sm text-gray-500">{exp.start_date} — {exp.current ? 'Present' : exp.end_date}</p>
                </div>
                {exp.description && <p className="text-sm text-gray-700 mt-1">{exp.description}</p>}
                {exp.highlights && exp.highlights.length > 0 && (
                  <ul className="mt-2 list-disc list-inside">
                    {exp.highlights.map((h, i) => (
                      <li key={i} className="text-sm text-gray-700">{h}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {skills.length > 0 && (
          <div className="mb-5">
            <h2 className="text-md font-bold text-black uppercase border-b border-gray-300 pb-1 mb-2">Skills</h2>
            {Object.entries(skillsByCategory).map(([cat, catSkills]) => (
              <div key={cat} className="mb-3">
                <h3 className="text-sm font-semibold text-gray-800">{cat}</h3>
                <p className="text-sm text-gray-700">{catSkills.map(s => s.name).join(', ')}</p>
              </div>
            ))}
          </div>
        )}

        {projects.length > 0 && (
          <div className="mb-5">
            <h2 className="text-md font-bold text-black uppercase border-b border-gray-300 pb-1 mb-2">Key Projects</h2>
            {projects.map((p) => (
              <div key={p.id} className="mb-3">
                <h3 className="text-sm font-bold text-black">{p.title}</h3>
                <p className="text-sm text-gray-700">{p.description}</p>
                {p.tech_stack && p.tech_stack.length > 0 && (
                  <p className="text-sm text-gray-600 mt-1">Technologies: {p.tech_stack.join(', ')}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {education.length > 0 && (
          <div className="mb-5">
            <h2 className="text-md font-bold text-black uppercase border-b border-gray-300 pb-1 mb-2">Education</h2>
            {education.map((edu) => (
              <div key={edu.id} className="mb-3">
                <div className="flex justify-between flex-wrap">
                  <div>
                    <h3 className="text-sm font-bold text-black">{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</h3>
                    <p className="text-sm text-gray-700">{edu.institution}{edu.location ? `, ${edu.location}` : ''}</p>
                  </div>
                  <p className="text-sm text-gray-500">{edu.start_year} — {edu.end_year || 'Present'}</p>
                </div>
                {edu.grade && <p className="text-sm text-gray-600 mt-1">Grade: {edu.grade}</p>}
              </div>
            ))}
          </div>
        )}

        {achievements.length > 0 && (
          <div className="mb-5">
            <h2 className="text-md font-bold text-black uppercase border-b border-gray-300 pb-1 mb-2">Achievements</h2>
            {achievements.map((a) => (
              <div key={a.id} className="mb-2">
                <h3 className="text-sm font-bold text-black">{a.title}</h3>
                <p className="text-sm text-gray-600">{a.issuer} — {a.date}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .ats-resume-container, .ats-resume-container * {
            visibility: visible;
          }
          .ats-resume-container {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            margin: 0;
            padding: 0.2in;
            box-shadow: none;
          }
          .no-print {
            display: none !important;
          }
          button {
            display: none !important;
          }
          @page {
            size: letter;
            margin: 0.3in;
          }
        }
      `}</style>
    </div>
  );
}

export default ATSScore;