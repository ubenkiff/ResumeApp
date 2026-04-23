import React, { useState } from 'react';
import api from './api';

function SkillsManager({ skills, onRefresh }) {
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem.id) {
        await api.put(`/skills/${editingItem.id}`, formData);
      } else {
        await api.post('/skills', formData);
      }
      setEditingItem(null); setFormData({}); onRefresh();
    } catch (error) { console.error('Save error:', error); alert('Error saving skill'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure?')) return;
    try { await api.delete(`/skills/${id}`); onRefresh(); } catch (error) { console.error('Delete error:', error); }
  };

  const categories = [...new Set(skills.map(s => s.category))];

  return (
    <div>
      <div className="flex justify-between items-center mb-6"><h1 className="text-2xl font-bold text-white">Skills</h1><button onClick={() => { setEditingItem({}); setFormData({}); }} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">+ Add Skill</button></div>
      {editingItem !== null && (
        <form onSubmit={handleSubmit} className="bg-slate-800 rounded-2xl shadow-xl p-6 mb-8 border border-slate-700">
          <h2 className="text-lg font-semibold text-white mb-4">{editingItem.id ? 'Edit' : 'Add'} Skill</h2>
          <div className="space-y-3">
            <input type="text" placeholder="Skill Name" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white" required />
            <input type="text" placeholder="Category (e.g., Structural Design, CAD/BIM)" value={formData.category || ''} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white" required />
            <select value={formData.level || ''} onChange={(e) => setFormData({ ...formData, level: e.target.value })} className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white"><option value="">Select Level</option><option value="Beginner">Beginner</option><option value="Intermediate">Intermediate</option><option value="Advanced">Advanced</option><option value="Expert">Expert</option></select>
          </div>
          <div className="mt-6 flex gap-3"><button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg">Save</button><button type="button" onClick={() => { setEditingItem(null); setFormData({}); }} className="bg-slate-700 hover:bg-slate-600 text-slate-300 px-6 py-2.5 rounded-lg">Cancel</button></div>
        </form>
      )}
      {categories.map(category => (
        <div key={category} className="mb-6"><h2 className="text-lg font-semibold text-blue-400 mb-3">{category}</h2><div className="space-y-2">{skills.filter(s => s.category === category).map((skill) => (<div key={skill.id} className="bg-slate-800 rounded-lg shadow p-4 flex justify-between items-center border border-slate-700"><div><span className="font-medium text-white">{skill.name}</span>{skill.level && <span className="text-sm text-slate-400 ml-2">({skill.level})</span>}</div><div className="flex gap-2"><button onClick={() => { setEditingItem(skill); setFormData(skill); }} className="text-blue-400 hover:text-blue-300">Edit</button><button onClick={() => handleDelete(skill.id)} className="text-red-400 hover:text-red-300">Delete</button></div></div>))}</div></div>
      ))}
    </div>
  );
}

export default SkillsManager;