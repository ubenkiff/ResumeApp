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
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500 text-center">
            <i className="fas fa-spinner fa-spin text-3xl mb-3"></i>
            <p>Loading your data...</p>
          </div>
        </div>
      );
    }

    switch (currentPage) {
      case 'dashboard':
        return (
          <div>
            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
              <p className="text-gray-500">Welcome back, {user?.username}!</p>
            </div>

            {/* Stats Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-user text-blue-600 text-xl"></i>
                  </div>
                  <span className="text-2xl font-bold text-gray-800">1</span>
                </div>
                <h3 className="text-gray-900 font-semibold">Profile</h3>
                <p className="text-gray-500 text-sm mt-1">Complete your personal information</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-chart-line text-green-600 text-xl"></i>
                  </div>
                  <span className="text-2xl font-bold text-gray-800">{experience.length}</span>
                </div>
                <h3 className="text-gray-900 font-semibold">Work Experience</h3>
                <p className="text-gray-500 text-sm mt-1">Add your professional journey</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-share-alt text-purple-600 text-xl"></i>
                  </div>
                  <span className="text-2xl font-bold text-gray-800">1</span>
                </div>
                <h3 className="text-gray-900 font-semibold">Share Your Resume</h3>
                <p className="text-gray-500 text-sm break-all mt-1">
                  /u/{user?.username}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 mb-8">
              <button
                onClick={() => window.open(`/view/${user?.username}`, '_blank')}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition shadow-sm"
              >
                <i className="fas fa-eye"></i> View Public Portfolio
              </button>
              <button
                onClick={() => window.open(`/resume/${user?.username}`, '_blank')}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 transition shadow-sm"
              >
                <i className="fas fa-print"></i> View Printable Resume
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`/u/${user?.username}`);
                  alert('Link copied to clipboard!');
                }}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg flex items-center gap-2 transition shadow-sm"
              >
                <i className="fas fa-copy"></i> Copy Shareable Link
              </button>
            </div>

            {/* Quick Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="text-blue-800 font-semibold mb-2 flex items-center gap-2">
                <i className="fas fa-lightbulb text-yellow-500"></i> Quick Tips
              </h3>
              <ul className="text-gray-600 text-sm space-y-1">
                <li>• Add your profile information to get started</li>
                <li>• Upload a professional profile photo</li>
                <li>• Add your work experience with key highlights</li>
                <li>• List your skills and projects to showcase your expertise</li>
                <li>• Share your public link with employers</li>
              </ul>
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
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Dark */}
      <div className="w-64 bg-gray-900 shadow-lg">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-xl font-bold text-white">ResumeApp</h1>
        </div>
        <nav className="p-4">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center px-4 py-3 rounded-lg mb-1 transition-colors ${
                currentPage === item.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <i className={`${item.icon} w-5 mr-3`}></i>
              {item.name}
            </button>
          ))}
        </nav>
        <div className="absolute bottom-0 w-64 p-4 border-t border-gray-800">
          <button
            onClick={onLogout}
            className="block w-full text-left text-gray-400 hover:text-white py-2 transition"
          >
            <i className="fas fa-sign-out-alt w-5 mr-3"></i> Logout
          </button>
        </div>
      </div>

      {/* Main Content - White Background */}
      <div className="flex-1 p-8 overflow-auto bg-gray-50">
        {renderContent()}
      </div>
    </div>
  );
}

export default Dashboard;