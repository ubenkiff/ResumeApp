import React, { useState, useEffect } from 'react';
import api from './api';
import ProfileForm from './ProfileForm';
import ExperienceManager from './ExperienceManager';
import EducationManager from './EducationManager';
import SkillsManager from './SkillsManager';
import ProjectsManager from './ProjectsManager';
import AchievementsManager from './AchievementsManager';

function Dashboard({ user, onLogout }) {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [profile, setProfile] = useState({});
  const [experience, setExperience] = useState([]);
  const [education, setEducation] = useState([]);
  const [skills, setSkills] = useState([]);
  const [projects, setProjects] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [profileRes, expRes, eduRes, skillsRes, projectsRes, achievementsRes] = await Promise.all([
        api.get('/profile'),
        api.get('/experience'),
        api.get('/education'),
        api.get('/skills'),
        api.get('/projects'),
        api.get('/achievements')
      ]);
      setProfile(profileRes.data || {});
      setExperience(expRes.data);
      setEducation(eduRes.data);
      setSkills(skillsRes.data);
      setProjects(projectsRes.data);
      setAchievements(achievementsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    fetchAllData();
  };

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: 'fas fa-tachometer-alt' },
    { id: 'profile', name: 'Profile', icon: 'fas fa-user' },
    { id: 'experience', name: 'Experience', icon: 'fas fa-briefcase' },
    { id: 'education', name: 'Education', icon: 'fas fa-graduation-cap' },
    { id: 'skills', name: 'Skills', icon: 'fas fa-code' },
    { id: 'projects', name: 'Projects', icon: 'fas fa-folder-open' },
    { id: 'achievements', name: 'Achievements', icon: 'fas fa-trophy' }
  ];

  const renderContent = () => {
    if (loading) {
      return <div className="text-white text-center py-8">Loading...</div>;
    }

    switch (currentPage) {
      case 'dashboard':
        return (
          <div>
            <h1 className="text-2xl font-bold text-white mb-4">Dashboard</h1>
            <p className="text-slate-300 mb-6">Welcome back, {user?.username}!</p>
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              <div className="bg-slate-700 p-6 rounded-xl">
                <i className="fas fa-user text-blue-400 text-3xl mb-3"></i>
                <h3 className="text-white font-semibold">Profile</h3>
                <p className="text-slate-400 text-sm">Edit your personal information</p>
              </div>
              <div className="bg-slate-700 p-6 rounded-xl">
                <i className="fas fa-share-alt text-blue-400 text-3xl mb-3"></i>
                <h3 className="text-white font-semibold">Share Your Resume</h3>
                <p className="text-slate-400 text-sm break-all">/u/{user?.username}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 no-print">
              <button onClick={() => window.open(`/view/${user?.username}`, '_blank')} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition">
                <i className="fas fa-eye"></i> View Public Portfolio
              </button>
              <button onClick={() => window.open(`/resume/${user?.username}`, '_blank')} className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition">
                <i className="fas fa-print"></i> View Printable Resume
              </button>
            </div>
          </div>
        );
      case 'profile':
        return <ProfileForm profile={profile} onRefresh={refreshData} />;
      case 'experience':
        return <ExperienceManager experience={experience} onRefresh={refreshData} />;
      case 'education':
        return <EducationManager education={education} onRefresh={refreshData} />;
      case 'skills':
        return <SkillsManager skills={skills} onRefresh={refreshData} />;
      case 'projects':
        return <ProjectsManager projects={projects} onRefresh={refreshData} />;
      case 'achievements':
        return <AchievementsManager achievements={achievements} onRefresh={refreshData} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex">
      <div className="w-64 bg-slate-800 shadow-md">
        <div className="p-4 border-b border-slate-700"><h1 className="text-xl font-bold text-white">ResumeApp</h1></div>
        <nav className="p-4">
          {menuItems.map((item) => (
            <button key={item.id} onClick={() => setCurrentPage(item.id)} className={`w-full flex items-center px-4 py-3 rounded-lg mb-1 transition-colors ${currentPage === item.id ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}>
              <i className={`${item.icon} w-5 mr-3`}></i>{item.name}
            </button>
          ))}
        </nav>
        <div className="absolute bottom-0 w-64 p-4 border-t border-slate-700">
          <button onClick={onLogout} className="block w-full text-left text-slate-400 hover:text-white py-2">
            <i className="fas fa-sign-out-alt w-5 mr-3"></i> Logout
          </button>
        </div>
      </div>
      <div className="flex-1 p-8 overflow-auto">{renderContent()}</div>
    </div>
  );
}

export default Dashboard;