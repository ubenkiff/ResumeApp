import React, { useState } from 'react';
import api from './api';

function EducationManager({ education, onRefresh }) {
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem.id) {
        await api.put(`/education/${editingItem.id}`, formData);
      } else {
        await api.post('/education', formData);
      }
      setEditingItem(null); setFormData({}); onRefresh();
    } catch (error) { console.error('Save error:', error); alert('Error saving education'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure?')) return;
    try { await api.delete(`/education/${id}`); onRefresh(); } catch (error) { console.error('Delete error:', error); }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6"><h1 className="text-2xl font-bold text-white">Education</h1><button onClick={() => { setEditingItem({}); setFormData({}); }} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"><i className="fas fa-plus"></i> Add Education</button></div>
      {editingItem !== null && (
        <form onSubmit={handleSubmit} className="bg-slate-800 rounded-2xl shadow-xl p-6 mb-8 border border-slate-700">
          <h2 className="text-lg font-semibold text-white mb-4">{editingItem.id ? 'Edit' : 'Add'} Education</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-slate-300 mb-2">Degree</label><input type="text" value={formData.degree || ''} onChange={(e) => setFormData({ ...formData, degree: e.target.value })} className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white" required /></div>
            <div><label className="block text-sm font-medium text-slate-300 mb-2">Field of Study</label><input type="text" value={formData.field || ''} onChange={(e) => setFormData({ ...formData, field: e.target.value })} className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white" /></div>
            <div><label className="block text-sm font-medium text-slate-300 mb-2">Institution</label><input type="text" value={formData.institution || ''} onChange={(e) => setFormData({ ...formData, institution: e.target.value })} className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white" required /></div>
            <div><label className="block text-sm font-medium text-slate-300 mb-2">Location</label><input type="text" value={formData.location || ''} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white" placeholder="Eldoret, Kenya" /></div>
            <div><label className="block text-sm font-medium text-slate-300 mb-2">Start Year</label><input type="text" value={formData.start_year || ''} onChange={(e) => setFormData({ ...formData, start_year: e.target.value })} className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white" /></div>
            <div><label className="block text-sm font-medium text-slate-300 mb-2">End Year</label><input type="text" value={formData.end_year || ''} onChange={(e) => setFormData({ ...formData, end_year: e.target.value })} className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white" placeholder="Present or 2025" /></div>
            <div><label className="block text-sm font-medium text-slate-300 mb-2">Grade / GPA</label><input type="text" value={formData.grade || ''} onChange={(e) => setFormData({ ...formData, grade: e.target.value })} className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white" placeholder="First Class Honours, A-, 3.8 GPA" /></div>
            <div className="md:col-span-2"><label className="block text-sm font-medium text-slate-300 mb-2">Description</label><textarea rows="3" value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white" /></div>
          </div>
          <div className="mt-6 flex gap-3"><button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg">Save Education</button><button type="button" onClick={() => { setEditingItem(null); setFormData({}); }} className="bg-slate-700 hover:bg-slate-600 text-slate-300 px-6 py-2.5 rounded-lg">Cancel</button></div>
        </form>
      )}
      <div className="space-y-4">
        {education.map((edu) => (
          <div key={edu.id} className="bg-slate-800 rounded-2xl shadow-xl p-6 border border-slate-700">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex flex-wrap justify-between items-start">
                  <div><h3 className="text-lg font-semibold text-white">{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</h3><p className="text-blue-400">{edu.institution}</p>{edu.location && <p className="text-slate-400 text-sm">{edu.location}</p>}{edu.grade && <p className="text-yellow-500 text-sm mt-1"><i className="fas fa-star mr-1"></i>Grade: {edu.grade}</p>}</div>
                  <p className="text-slate-400 text-sm">{edu.start_year} — {edu.end_year || 'Present'}</p>
                </div>
                {edu.description && <p className="text-slate-300 mt-2 text-sm">{edu.description}</p>}
              </div>
              <div className="flex gap-2 ml-4"><button onClick={() => { setEditingItem(edu); setFormData(edu); }} className="text-blue-400 hover:text-blue-300 p-1"><i className="fas fa-edit"></i></button><button onClick={() => handleDelete(edu.id)} className="text-red-400 hover:text-red-300 p-1"><i className="fas fa-trash"></i></button></div>
            </div>
          </div>
        ))}
        {education.length === 0 && <p className="text-slate-400 text-center py-8">No education entries yet. Click "Add Education" to get started.</p>}
      </div>
    </div>
  );
}

export default EducationManager;