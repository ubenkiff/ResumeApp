import React, { useState } from 'react';
import api from './api';

function AchievementsManager({ achievements, onRefresh }) {
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem.id) {
        await api.put(`/achievements/${editingItem.id}`, formData);
      } else {
        await api.post('/achievements', formData);
      }
      setEditingItem(null); setFormData({}); onRefresh();
    } catch (error) { console.error('Save error:', error); alert('Error saving achievement'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure?')) return;
    try { await api.delete(`/achievements/${id}`); onRefresh(); } catch (error) { console.error('Delete error:', error); }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6"><h1 className="text-2xl font-bold text-white">Achievements</h1><button onClick={() => { setEditingItem({}); setFormData({}); }} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">+ Add Achievement</button></div>
      {editingItem !== null && (
        <form onSubmit={handleSubmit} className="bg-slate-800 rounded-2xl shadow-xl p-6 mb-8 border border-slate-700">
          <h2 className="text-lg font-semibold text-white mb-4">{editingItem.id ? 'Edit' : 'Add'} Achievement</h2>
          <div className="space-y-3">
            <input type="text" placeholder="Title" value={formData.title || ''} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white" required />
            <input type="text" placeholder="Issuer" value={formData.issuer || ''} onChange={(e) => setFormData({ ...formData, issuer: e.target.value })} className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white" />
            <input type="text" placeholder="Date" value={formData.date || ''} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white" />
            <textarea placeholder="Description" rows="2" value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white" />
            <select value={formData.category || ''} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white"><option value="">Select Category</option><option value="Award">Award</option><option value="Certification">Certification</option><option value="Publication">Publication</option><option value="Speaking">Speaking</option><option value="Other">Other</option></select>
          </div>
          <div className="mt-6 flex gap-3"><button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg">Save</button><button type="button" onClick={() => { setEditingItem(null); setFormData({}); }} className="bg-slate-700 hover:bg-slate-600 text-slate-300 px-6 py-2.5 rounded-lg">Cancel</button></div>
        </form>
      )}
      <div className="space-y-3">{achievements.map((ach) => (<div key={ach.id} className="bg-slate-800 rounded-2xl shadow-xl p-5 border border-slate-700"><div className="flex justify-between items-start"><div><h3 className="text-md font-semibold text-white">{ach.title}</h3><p className="text-slate-400 text-sm">{ach.issuer} • {ach.date}</p>{ach.description && <p className="text-slate-300 text-sm mt-1">{ach.description}</p>}{ach.category && <span className="inline-block mt-2 px-2 py-1 bg-slate-700 rounded text-xs text-slate-300">{ach.category}</span>}</div><div className="flex gap-2"><button onClick={() => { setEditingItem(ach); setFormData(ach); }} className="text-blue-400">Edit</button><button onClick={() => handleDelete(ach.id)} className="text-red-400">Delete</button></div></div></div>))}{achievements.length === 0 && <p className="text-slate-400 text-center py-8">No achievements yet. Click "Add Achievement" to get started.</p>}</div>
    </div>
  );
}

export default AchievementsManager;