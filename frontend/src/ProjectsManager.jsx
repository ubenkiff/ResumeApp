import React, { useState } from 'react';
import api from './api';

function ProjectsManager({ projects, onRefresh }) {
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [uploading, setUploading] = useState(false);
  const [imageUrls, setImageUrls] = useState([]);

  const handleMultipleImageUpload = async (files) => {
    setUploading(true);
    const uploadedUrls = [];
    for (const file of files) {
      const formData = new FormData();
      formData.append('image', file);
      try {
        const res = await api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        uploadedUrls.push(res.data.url);
      } catch (error) { console.error('Upload error:', error); }
    }
    setImageUrls([...imageUrls, ...uploadedUrls]);
    setFormData({ ...formData, image_urls: [...imageUrls, ...uploadedUrls] });
    setUploading(false);
  };

  const removeImage = (indexToRemove) => {
    const newUrls = imageUrls.filter((_, index) => index !== indexToRemove);
    setImageUrls(newUrls);
    setFormData({ ...formData, image_urls: newUrls });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = { ...formData, image_urls: imageUrls };
      if (editingItem.id) {
        await api.put(`/projects/${editingItem.id}`, submitData);
      } else {
        await api.post('/projects', submitData);
      }
      setEditingItem(null); setFormData({}); setImageUrls([]); onRefresh();
    } catch (error) { console.error('Save error:', error); alert('Error saving project'); }
  };

  const handleEdit = (item) => { setEditingItem(item); setFormData(item); setImageUrls(item.image_urls || []); };
  const handleDelete = async (id) => { if (!confirm('Are you sure?')) return; try { await api.delete(`/projects/${id}`); onRefresh(); } catch (error) { console.error('Delete error:', error); } };

  return (
    <div>
      <div className="flex justify-between items-center mb-6"><h1 className="text-2xl font-bold text-white">Projects</h1><button onClick={() => { setEditingItem({}); setFormData({}); setImageUrls([]); }} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">+ Add Project</button></div>
      {editingItem !== null && (
        <form onSubmit={handleSubmit} className="bg-slate-800 rounded-2xl shadow-xl p-6 mb-8 border border-slate-700">
          <h2 className="text-lg font-semibold text-white mb-4">{editingItem.id ? 'Edit' : 'Add'} Project</h2>
          <div className="space-y-3">
            <input type="text" placeholder="Project Title" value={formData.title || ''} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white" required />
            <textarea placeholder="Description" rows="3" value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white" />
            <input type="text" placeholder="Tech Stack (comma separated)" value={formData.tech_stack || ''} onChange={(e) => setFormData({ ...formData, tech_stack: e.target.value.split(',') })} className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white" />
            <input type="text" placeholder="Live URL" value={formData.live_url || ''} onChange={(e) => setFormData({ ...formData, live_url: e.target.value })} className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white" />
            <input type="text" placeholder="GitHub URL" value={formData.github_url || ''} onChange={(e) => setFormData({ ...formData, github_url: e.target.value })} className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white" />
            <div><label className="block text-sm font-medium text-slate-300 mb-1">Project Images (select multiple)</label><input type="file" accept="image/*" multiple onChange={(e) => handleMultipleImageUpload(Array.from(e.target.files))} className="w-full" />{uploading && <p className="text-blue-400 text-sm mt-1">Uploading images...</p>}{imageUrls.length > 0 && (<div className="flex flex-wrap gap-2 mt-3">{imageUrls.map((url, index) => (<div key={index} className="relative"><img src={url} className="w-16 h-16 object-cover rounded" /><button type="button" onClick={() => removeImage(index)} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 text-xs">×</button></div>))}</div>)}</div>
            <label className="flex items-center gap-2"><input type="checkbox" checked={formData.featured || false} onChange={(e) => setFormData({ ...formData, featured: e.target.checked })} /><span className="text-slate-300">Feature this project on portfolio</span></label>
          </div>
          <div className="mt-6 flex gap-3"><button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg">Save</button><button type="button" onClick={() => { setEditingItem(null); setFormData({}); setImageUrls([]); }} className="bg-slate-700 hover:bg-slate-600 text-slate-300 px-6 py-2.5 rounded-lg">Cancel</button></div>
        </form>
      )}
      <div className="grid md:grid-cols-2 gap-4">{projects.map((project) => (<div key={project.id} className="bg-slate-800 rounded-2xl shadow-xl p-4 border border-slate-700">{project.image_urls && project.image_urls.length > 0 && (<div className="flex gap-2 mb-3 overflow-x-auto">{project.image_urls.slice(0, 3).map((url, idx) => (<img key={idx} src={url} className="w-16 h-16 object-cover rounded cursor-pointer" onClick={() => window.open(url, '_blank')} />))}</div>)}<h3 className="font-semibold text-white">{project.title}</h3><p className="text-slate-300 text-sm mt-1">{project.description}</p><div className="flex justify-between items-center mt-3"><div className="flex gap-2">{project.live_url && <a href={project.live_url} target="_blank" className="text-blue-400 text-sm">Live</a>}</div><div className="flex gap-2"><button onClick={() => handleEdit(project)} className="text-blue-400 text-sm">Edit</button><button onClick={() => handleDelete(project.id)} className="text-red-400 text-sm">Delete</button></div></div></div>))}</div>
    </div>
  );
}

export default ProjectsManager;