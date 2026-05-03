import React, { useState, useEffect } from 'react';
import api from '../api';

function ReferencesManager() {
  const [references, setReferences] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [includeInCoverLetter, setIncludeInCoverLetter] = useState(false);

  useEffect(() => {
    fetchReferences();
  }, []);

  const fetchReferences = async () => {
    try {
      const res = await api.get('/user/references');
      setReferences(res.data);
      // Check if any reference is marked to include
      setIncludeInCoverLetter(res.data.some(r => r.include_in_letter));
    } catch (error) {
      console.error('Error fetching references:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem.id) {
        await api.put(`/user/references/${editingItem.id}`, formData);
      } else {
        await api.post('/user/references', formData);
      }
      setEditingItem(null);
      setFormData({});
      fetchReferences();
    } catch (error) {
      console.error('Save error:', error);
      alert('Error saving reference');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure?')) return;
    try {
      await api.delete(`/user/references/${id}`);
      fetchReferences();
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleToggleInclude = async (id, currentStatus) => {
    try {
      await api.patch(`/user/references/${id}/toggle`, { include_in_letter: !currentStatus });
      fetchReferences();
    } catch (error) {
      console.error('Toggle error:', error);
    }
  };

  if (loading) {
    return <div className="text-white text-center py-8">Loading references...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Professional References</h2>
        <button
          onClick={() => { setEditingItem({}); setFormData({}); }}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <i className="fas fa-plus"></i> Add Reference
        </button>
      </div>

      <p className="text-slate-400 text-sm mb-4">
        Add professional references that can be included in your cover letter when requested.
      </p>

      {/* Add/Edit Form */}
      {editingItem !== null && (
        <form onSubmit={handleSubmit} className="bg-slate-800 rounded-2xl shadow-xl p-6 mb-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">
            {editingItem.id ? 'Edit' : 'Add'} Reference
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Title / Position</label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Company</label>
              <input
                type="text"
                value={formData.company || ''}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Phone</label>
              <input
                type="text"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Relationship</label>
              <input
                type="text"
                value={formData.relationship || ''}
                onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white"
                placeholder="Former Manager, Colleague, Client"
              />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <input
              type="checkbox"
              id="include_in_letter"
              checked={formData.include_in_letter || false}
              onChange={(e) => setFormData({ ...formData, include_in_letter: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <label htmlFor="include_in_letter" className="text-slate-300 text-sm">
              Include this reference in cover letter when applicable
            </label>
          </div>
          <div className="mt-6 flex gap-3">
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg">
              Save Reference
            </button>
            <button
              type="button"
              onClick={() => { setEditingItem(null); setFormData({}); }}
              className="bg-slate-700 hover:bg-slate-600 text-slate-300 px-6 py-2.5 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* References List */}
      <div className="space-y-3">
        {references.length === 0 ? (
          <div className="bg-slate-800 rounded-2xl p-12 text-center border border-slate-700">
            <i className="fas fa-users text-5xl text-slate-600 mb-4"></i>
            <p className="text-slate-400">No references added yet. Click "Add Reference" to get started.</p>
          </div>
        ) : (
          references.map((ref) => (
            <div key={ref.id} className="bg-slate-800 rounded-2xl shadow-xl p-5 border border-slate-700">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex flex-wrap justify-between items-start">
                    <div>
                      <h3 className="text-md font-semibold text-white">{ref.name}</h3>
                      <p className="text-blue-400 text-sm">{ref.title} at {ref.company}</p>
                      <p className="text-slate-400 text-sm">{ref.relationship}</p>
                      {ref.email && <p className="text-slate-400 text-xs mt-1">📧 {ref.email}</p>}
                      {ref.phone && <p className="text-slate-400 text-xs">📞 {ref.phone}</p>}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {ref.include_in_letter && (
                        <span className="px-2 py-0.5 bg-green-600 text-white text-xs rounded-full">
                          Include in letter
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleToggleInclude(ref.id, ref.include_in_letter)}
                    className={`text-sm px-2 py-1 rounded ${ref.include_in_letter ? 'bg-yellow-600' : 'bg-green-600'} text-white hover:opacity-80`}
                  >
                    {ref.include_in_letter ? 'Remove from letter' : 'Add to letter'}
                  </button>
                  <button
                    onClick={() => { setEditingItem(ref); setFormData(ref); }}
                    className="text-blue-400 hover:text-blue-300 p-1"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button
                    onClick={() => handleDelete(ref.id)}
                    className="text-red-400 hover:text-red-300 p-1"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ReferencesManager;
