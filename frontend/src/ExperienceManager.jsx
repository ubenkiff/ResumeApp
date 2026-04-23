import React, { useState } from 'react';
import api from './api';

function ExperienceManager({ experience, onRefresh }) {
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [isCurrent, setIsCurrent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const highlightsArray = formData.highlights ? formData.highlights.split('\n').filter(h => h.trim()) : [];
      const submitData = { ...formData, highlights: highlightsArray, current: isCurrent, end_date: isCurrent ? null : formData.end_date };
      if (editingItem.id) {
        await api.put(`/experience/${editingItem.id}`, submitData);
      } else {
        await api.post('/experience', submitData);
      }
      setEditingItem(null); setFormData({}); setIsCurrent(false); onRefresh();
    } catch (error) { console.error('Save error:', error); alert('Error saving experience'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure?')) return;
    try { await api.delete(`/experience/${id}`); onRefresh(); } catch (error) { console.error('Delete error:', error); }
  };

  const handleEdit = (item) => {
    const highlightsText = item.highlights ? item.highlights.join('\n') : '';
    setEditingItem(item); setFormData({ ...item, highlights: highlightsText }); setIsCurrent(item.current || false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6"><h1 className="text-2xl font-bold text-white">Work Experience</h1><button onClick={() => { setEditingItem({}); setFormData({}); setIsCurrent(false); }} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"><i className="fas fa-plus"></i> Add Experience</button></div>
      {editingItem !== null && (
        <form onSubmit={handleSubmit} className="bg-slate-800 rounded-2xl shadow-xl p-6 mb-8 border border-slate-700">
          <h2 className="text-lg font-semibold text-white mb-4">{editingItem.id ? 'Edit Experience' : 'Add Experience'}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div><label className="block text-sm font-medium text-slate-300 mb-2">Job Title</label><input type="text" value={formData.job_title || ''} onChange={(e) => setFormData({ ...formData, job_title: e.target.value })} className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white" required /></div>
            <div><label className="block text-sm font-medium text-slate-300 mb-2">Company</label><input type="text" value={formData.company || ''} onChange={(e) => setFormData({ ...formData, company: e.target.value })} className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white" required /></div>
          </div>
          <div className="mt-4"><label className="block text-sm font-medium text-slate-300 mb-2">Location</label><input type="text" value={formData.location || ''} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white" /></div>
          <div className="grid md:grid-cols-2 gap-6 mt-4">
            <div><label className="block text-sm font-medium text-slate-300 mb-2">Start Date</label><input type="text" placeholder="April 2026" value={formData.start_date || ''} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white" /></div>
            <div><label className="block text-sm font-medium text-slate-300 mb-2">End Date</label><input type="text" placeholder="March 2025 or leave blank if current" value={formData.end_date || ''} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} disabled={isCurrent} className={`w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white ${isCurrent ? 'opacity-50' : ''}`} /></div>
          </div>
          <div className="mt-4 flex items-center gap-3"><input type="checkbox" id="current" checked={isCurrent} onChange={(e) => { setIsCurrent(e.target.checked); if (e.target.checked) setFormData({ ...formData, end_date: '' }); }} className="w-4 h-4 text-blue-600" /><label htmlFor="current" className="text-slate-300 text-sm">I currently work here</label></div>
          <div className="mt-4"><label className="block text-sm font-medium text-slate-300 mb-2">Description</label><textarea rows="3" value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white" /></div>
          <div className="mt-4"><label className="block text-sm font-medium text-slate-300 mb-2">Key Highlights (One per line)</label><textarea rows="4" placeholder="Completed steel BBS for Phase #3&#10;Revised and confirmed variation orders" value={formData.highlights || ''} onChange={(e) => setFormData({ ...formData, highlights: e.target.value })} className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-sm" /><p className="text-slate-500 text-xs mt-1">Each line will become a bullet point</p></div>
          <div className="mt-6 flex gap-3"><button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg">Save Experience</button><button type="button" onClick={() => { setEditingItem(null); setFormData({}); setIsCurrent(false); }} className="bg-slate-700 hover:bg-slate-600 text-slate-300 px-6 py-2.5 rounded-lg">Cancel</button></div>
        </form>
      )}
      <div className="space-y-4">
        {experience.map((exp) => (
          <div key={exp.id} className="bg-slate-800 rounded-2xl shadow-xl p-6 border border-slate-700">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex flex-wrap justify-between items-start">
                  <div><h3 className="text-lg font-semibold text-white">{exp.job_title}</h3><p className="text-blue-400">{exp.company}</p><p className="text-slate-400 text-sm">{exp.location}</p></div>
                  <p className="text-slate-400 text-sm">{exp.start_date} — {exp.current ? 'Present' : exp.end_date}{exp.current && <span className="ml-2 inline-block px-2 py-0.5 bg-green-600 text-white text-xs rounded-full">Current</span>}</p>
                </div>
                <p className="text-slate-300 mt-3">{exp.description}</p>
                {exp.highlights && exp.highlights.length > 0 && <ul className="list-disc list-inside mt-3 space-y-1">{exp.highlights.map((h, i) => <li key={i} className="text-slate-400 text-sm">{h}</li>)}</ul>}
              </div>
              <div className="flex gap-2 ml-4"><button onClick={() => handleEdit(exp)} className="text-blue-400 hover:text-blue-300 p-2"><i className="fas fa-edit"></i></button><button onClick={() => handleDelete(exp.id)} className="text-red-400 hover:text-red-300 p-2"><i className="fas fa-trash"></i></button></div>
            </div>
          </div>
        ))}
        {experience.length === 0 && <div className="bg-slate-800 rounded-2xl shadow-xl p-12 border border-slate-700 text-center"><i className="fas fa-briefcase text-5xl text-slate-600 mb-4"></i><p className="text-slate-400">No experience entries yet. Click "Add Experience" to get started.</p></div>}
      </div>
    </div>
  );
}

export default ExperienceManager;