import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from './api';
import WhatsAppButton from './components/WhatsAppButton';

function PublicView() {
  const { username } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [carouselIndices, setCarouselIndices] = useState({});

  useEffect(() => {
    fetchData();
  }, [username]);

  const fetchData = async () => {
    try {
      const res = await api.get(`/public/${username}`);
      setData(res.data);
      // Initialize carousel indices
      const indices = {};
      res.data.projects?.forEach((_, idx) => { indices[idx] = 0; });
      setCarouselIndices(indices);
    } catch (err) {
      setError(err.response?.data?.error || 'User not found');
    } finally {
      setLoading(false);
    }
  };

  const prevImage = (projectId) => {
    const items = document.querySelectorAll(`#carousel-inner-${projectId} .carousel-item`);
    if (carouselIndices[projectId] > 0) {
      const newIndex = carouselIndices[projectId] - 1;
      setCarouselIndices(prev => ({ ...prev, [projectId]: newIndex }));
      const inner = document.getElementById(`carousel-inner-${projectId}`);
      if (inner) inner.style.transform = `translateX(-${newIndex * (100 / items.length)}%)`;
      updateDots(projectId, newIndex);
    }
  };

  const nextImage = (projectId) => {
    const items = document.querySelectorAll(`#carousel-inner-${projectId} .carousel-item`);
    if (carouselIndices[projectId] < items.length - 1) {
      const newIndex = carouselIndices[projectId] + 1;
      setCarouselIndices(prev => ({ ...prev, [projectId]: newIndex }));
      const inner = document.getElementById(`carousel-inner-${projectId}`);
      if (inner) inner.style.transform = `translateX(-${newIndex * (100 / items.length)}%)`;
      updateDots(projectId, newIndex);
    }
  };

  const goToImage = (projectId, index) => {
    const items = document.querySelectorAll(`#carousel-inner-${projectId} .carousel-item`);
    setCarouselIndices(prev => ({ ...prev, [projectId]: index }));
    const inner = document.getElementById(`carousel-inner-${projectId}`);
    if (inner) inner.style.transform = `translateX(-${index * (100 / items.length)}%)`;
    updateDots(projectId, index);
  };

  const updateDots = (projectId, activeIndex) => {
    const dots = document.querySelectorAll(`#carousel-dots-${projectId} .carousel-dot`);
    dots.forEach((dot, idx) => {
      if (idx === activeIndex) dot.classList.add('active');
      else dot.classList.remove('active');
    });
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-xl">Loading portfolio...</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold text-red-400">Error</h1>
          <p className="text-slate-400">{error}</p>
        </div>
        <WhatsAppButton />
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
    <div className="min-h-screen bg-slate-900">
      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 no-print">
        <button onClick={() => window.print()} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 transition text-sm">
          <i className="fas fa-print"></i> Printable Resume
        </button>
        <a href="/#/" className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 transition text-sm no-print">
          <i className="fas fa-home"></i> Home
        </a>
      </div>

      <div className="max-w-6xl mx-auto p-8">
        {/* Header */}
        <div className="bg-slate-800 rounded-2xl p-8 mb-8 border border-slate-700">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} className="w-32 h-32 rounded-full object-cover border-4 border-blue-500" alt={profile.name} />
            ) : (
              <div className="w-32 h-32 rounded-full bg-slate-700 flex items-center justify-center border-4 border-slate-600">
                <i className="fas fa-user text-4xl text-slate-500"></i>
              </div>
            )}
            <div className="text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-bold text-white">{profile.name || 'Your Name'}</h1>
              <p className="text-xl text-blue-400 mt-2">{profile.title || 'Professional Title'}</p>
              <p className="text-slate-300 mt-4 leading-relaxed whitespace-pre-line">{profile.bio}</p>
              <div className="flex flex-wrap gap-4 mt-4 justify-center md:justify-start text-slate-400">
                {profile.email && <span><i className="fas fa-envelope text-blue-400 mr-1"></i> {profile.email}</span>}
                {profile.phone && <span><i className="fas fa-phone text-green-400 mr-1"></i> {profile.phone}</span>}
                {profile.location && <span><i className="fas fa-map-marker-alt text-red-400 mr-1"></i> {profile.location}</span>}
                {profile.linkedin && <a href={profile.linkedin} target="_blank" className="hover:text-blue-400 transition"><i className="fab fa-linkedin text-blue-400 mr-1"></i> LinkedIn</a>}
              </div>
            </div>
          </div>
        </div>

        {/* Experience */}
        <div className="bg-slate-800 rounded-2xl p-8 mb-8 border border-slate-700">
          <h2 className="text-xl font-bold text-white mb-4"><i className="fas fa-briefcase text-blue-400 mr-2"></i>Work Experience</h2>
          {experience.map((exp, index) => (
            <div key={exp.id} className="mb-6">
              <div className="flex flex-wrap justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-white">{exp.job_title}</h3>
                  <p className="text-blue-400">{exp.company}{exp.location ? ` | ${exp.location}` : ''}</p>
                </div>
                <span className="text-slate-400 text-sm">{exp.start_date} — {exp.current ? 'Present' : exp.end_date}</span>
              </div>
              <p className="text-slate-300 mt-2 whitespace-pre-line">{exp.description}</p>
              {exp.highlights && exp.highlights.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {exp.highlights.map((h, i) => (
                    <li key={i} className="text-slate-400 text-sm flex items-start gap-2">
                      <i className="fas fa-circle text-blue-500 text-xs mt-1.5"></i>{h}
                    </li>
                  ))}
                </ul>
              )}
              {index < experience.length - 1 && <div className="border-b border-slate-700 mt-4 pt-2"></div>}
            </div>
          ))}
        </div>

        {/* Skills */}
        <div className="bg-slate-800 rounded-2xl p-8 mb-8 border border-slate-700">
          <h2 className="text-xl font-bold text-white mb-4"><i className="fas fa-code text-blue-400 mr-2"></i>Technical Skills</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {Object.entries(skillsByCategory).map(([category, catSkills]) => (
              <div key={category}>
                <h3 className="text-md font-semibold text-blue-400 mb-3">{category}</h3>
                <div className="flex flex-wrap gap-2">
                  {catSkills.map(skill => (
                    <span key={skill.id} className="px-3 py-1.5 bg-slate-700 rounded-lg text-sm text-slate-300">
                      {skill.name} {skill.level && <span className="text-blue-400">({skill.level})</span>}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Projects with Carousel */}
        <div className="bg-slate-800 rounded-2xl p-8 mb-8 border border-slate-700">
          <h2 className="text-xl font-bold text-white mb-4"><i className="fas fa-folder-open text-blue-400 mr-2"></i>Key Projects</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {projects.map((project, projectIndex) => {
              const hasImages = project.image_urls && project.image_urls.length > 0;
              const imageUrls = hasImages ? project.image_urls : [];
              return (
                <div key={project.id} className="bg-slate-700 rounded-xl overflow-hidden">
                  {hasImages && (
                    <div className="carousel relative" id={`carousel-${projectIndex}`}>
                      <div className="carousel-inner flex transition-transform duration-300" id={`carousel-inner-${projectIndex}`} style={{ width: `${imageUrls.length * 100}%` }}>
                        {imageUrls.map((url, imgIndex) => (
                          <div key={imgIndex} className="carousel-item" style={{ width: `${100 / imageUrls.length}%` }}>
                            <img src={url} className="w-full h-56 object-cover cursor-pointer hover:opacity-90 transition" onClick={() => window.open(url, '_blank')} alt={`${project.title} - ${imgIndex + 1}`} />
                          </div>
                        ))}
                      </div>
                      {imageUrls.length > 1 && (
                        <>
                          <button className="carousel-btn carousel-btn-prev absolute top-1/2 left-2 transform -translate-y-1/2 bg-black/50 text-white rounded-full p-2 z-10" onClick={() => prevImage(projectIndex)}><i className="fas fa-chevron-left"></i></button>
                          <button className="carousel-btn carousel-btn-next absolute top-1/2 right-2 transform -translate-y-1/2 bg-black/50 text-white rounded-full p-2 z-10" onClick={() => nextImage(projectIndex)}><i className="fas fa-chevron-right"></i></button>
                          <div className="carousel-dots flex justify-center gap-2 mt-2" id={`carousel-dots-${projectIndex}`}>
                            {imageUrls.map((_, idx) => (
                              <div key={idx} className={`carousel-dot w-2 h-2 rounded-full bg-slate-500 cursor-pointer ${idx === 0 ? 'active bg-blue-500' : ''}`} onClick={() => goToImage(projectIndex, idx)}></div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-white mb-2">{project.title}</h3>
                    <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">{project.description}</p>
                    {project.tech_stack && project.tech_stack.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {project.tech_stack.map((tech, i) => (
                          <span key={i} className="px-2 py-1 bg-slate-600 rounded-md text-xs text-slate-300">{tech}</span>
                        ))}
                      </div>
                    )}
                    {project.live_url && (
                      <div className="mt-3">
                        <a href={project.live_url} target="_blank" className="text-blue-400 hover:text-blue-300 text-sm"><i className="fas fa-external-link-alt mr-1"></i>View Project</a>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Education & Achievements Row */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4"><i className="fas fa-graduation-cap text-blue-400 mr-2"></i>Education</h2>
            {education.map(edu => (
              <div key={edu.id} className="mb-4 last:mb-0">
                <div className="flex flex-wrap justify-between items-start">
                  <div>
                    <h3 className="text-md font-semibold text-white">{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</h3>
                    <p className="text-blue-400">{edu.institution}{edu.location ? `, ${edu.location}` : ''}</p>
                  </div>
                  <span className="text-slate-400 text-sm">{edu.start_year} — {edu.end_year || 'Present'}</span>
                </div>
                {edu.grade && <p className="text-yellow-500 text-sm mt-1"><i className="fas fa-star mr-1"></i>Grade: {edu.grade}</p>}
              </div>
            ))}
          </div>

          <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4"><i className="fas fa-trophy text-yellow-500 mr-2"></i>Achievements</h2>
            {achievements.map(ach => (
              <div key={ach.id} className="mb-3 last:mb-0 border-l-2 border-yellow-500 pl-3">
                <h3 className="text-md font-semibold text-white">{ach.title}</h3>
                <p className="text-slate-400 text-sm">{ach.issuer} • {ach.date}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-slate-500 text-sm mt-8 pt-4 border-t border-slate-800">
          <p>© {new Date().getFullYear()} {profile.name} • Powered by ResumeApp</p>
        </div>
      </div>

      {/* WhatsApp Floating Button */}
      <WhatsAppButton />
    </div>
  );
}

export default PublicView;