import React, { useState, useEffect } from 'react';
import { Users, Plus, Trash2, Loader2, MoreVertical } from 'lucide-react';
import { Link } from 'react-router-dom';
import Avatar from '../components/Avatar';
import api from '../services/api';
import Modal from '../components/Modal';

const Teams = () => {
  const [teams, setTeams] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', managerId: '', memberIds: [] });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchTeams(); }, []);

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const [teamsRes, empRes] = await Promise.all([
        api.get('/teams'),
        api.get('/employees')
      ]);
      setTeams(teamsRes.data);
      setEmployees(empRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
      };
      if (formData.managerId) {
        payload.manager = { id: parseInt(formData.managerId) };
      }
      if (formData.memberIds.length > 0) {
        payload.members = formData.memberIds.map(id => ({ id: parseInt(id) }));
      }
      await api.post('/teams', payload);
      setIsModalOpen(false);
      setFormData({ name: '', description: '', managerId: '', memberIds: [] });
      fetchTeams();
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this team?')) return;
    try {
      await api.delete(`/teams/${id}`);
      setTeams(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      alert('Could not delete team. It may have members assigned.');
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-crewix-accent" size={32} /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Teams</h2>
          <p className="text-gray-500 text-sm mt-1">{teams.length} active team{teams.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setIsModalOpen(true)}
          className="bg-crewix-dark hover:bg-black text-white px-5 py-2.5 rounded-full flex items-center gap-2 shadow-sm transition-colors text-sm font-medium">
          <Plus size={18} /> New Team
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map(team => (
          <div key={team.id} className="bg-white/70 backdrop-blur-md rounded-[2rem] p-6 shadow-sm border border-white hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-crewix-light rounded-2xl flex items-center justify-center text-crewix-accent shadow-sm">
                <Users size={22} />
              </div>
              <button onClick={() => handleDelete(team.id)}
                className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50"
                title="Delete team">
                <Trash2 size={15} />
              </button>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-1">{team.name}</h3>
            <p className="text-sm text-gray-500 mb-6 line-clamp-2 min-h-[2.5rem]">{team.description || 'No description'}</p>
            {team.manager && (
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[10px] bg-crewix-accent text-white px-2 py-0.5 rounded uppercase font-bold tracking-wider">Leader</span>
                <span className="text-sm font-medium text-gray-800">{team.manager.firstName} {team.manager.lastName}</span>
              </div>
            )}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100/50">
              <div className="flex -space-x-2">
                {[...Array(Math.min(team.members ? team.members.length : 0, 3))].map((_, i) => (
                  <Avatar key={i} name={team.members[i] ? `${team.members[i].firstName} ${team.members[i].lastName}` : `E ${i}`} size="sm" className="border-2 border-white -ml-2 first:ml-0" />
                ))}
              </div>
              <span className="text-xs font-bold text-gray-400">{team.members ? team.members.length : 0} Members</span>
            </div>
          </div>
        ))}
        {teams.length === 0 && (
          <div className="col-span-3 text-center py-16 text-gray-400">
            <Users size={48} className="mx-auto mb-4 opacity-30" />
            <p className="font-medium">No teams yet. Create your first one!</p>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Team">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Team Name</label>
            <input type="text" required value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-crewix-accent text-sm"
              placeholder="e.g. Engineering" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
            <textarea rows="2" value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-crewix-accent text-sm resize-none"
              placeholder="What does this team do?" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Team Leader</label>
            <select value={formData.managerId} onChange={e => setFormData({ ...formData, managerId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-crewix-accent text-sm text-gray-600">
              <option value="">Select a leader</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Team Members</label>
            <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-xl p-3 grid grid-cols-2 gap-2 bg-gray-50/50">
              {employees.map(emp => (
                <label key={emp.id} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input type="checkbox" 
                    checked={formData.memberIds.includes(emp.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData(prev => ({ ...prev, memberIds: [...prev.memberIds, emp.id] }));
                      } else {
                        setFormData(prev => ({ ...prev, memberIds: prev.memberIds.filter(id => id !== emp.id) }));
                      }
                    }}
                    className="rounded text-crewix-accent focus:ring-crewix-accent"
                  />
                  {emp.firstName} {emp.lastName}
                </label>
              ))}
              {employees.length === 0 && <span className="text-xs text-gray-400">No employees available</span>}
            </div>
          </div>
          <div className="pt-2 flex gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)}
              className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold py-2.5 rounded-xl transition-colors text-sm">Cancel</button>
            <button type="submit" disabled={submitting}
              className="flex-1 bg-crewix-dark hover:bg-black text-white font-bold py-2.5 rounded-xl transition-colors text-sm flex justify-center items-center">
              {submitting ? <Loader2 size={18} className="animate-spin" /> : 'Create Team'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default Teams;
