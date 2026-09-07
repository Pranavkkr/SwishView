import React, { useState, useEffect } from 'react';
import { Briefcase, Plus, Calendar, Trash2, Loader2, FileText, Download, Upload } from 'lucide-react';
import api from '../services/api';
import Modal from '../components/Modal';
import Avatar from '../components/Avatar';

const statusColors = {
  ACTIVE: 'bg-blue-50 text-blue-600',
  COMPLETED: 'bg-green-50 text-green-600',
  PLANNING: 'bg-orange-50 text-orange-600',
};

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const role = localStorage.getItem('role') || 'EMPLOYEE';
  const employeeId = parseInt(localStorage.getItem('employeeId'));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', startDate: '', endDate: '', status: 'PLANNING' });
  const [submitting, setSubmitting] = useState(false);

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportProject, setReportProject] = useState(null);
  const [reportFile, setReportFile] = useState(null);
  const [uploadingReport, setUploadingReport] = useState(false);

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const [projRes, tasksRes] = await Promise.all([
        api.get('/projects'),
        api.get('/tasks')
      ]);
      setProjects(projRes.data);
      setTasks(tasksRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/projects', formData);
      setIsModalOpen(false);
      setFormData({ name: '', description: '', startDate: '', endDate: '', status: 'PLANNING' });
      fetchProjects();
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project? This will also delete its tasks.')) return;
    try {
      await api.delete(`/projects/${id}`);
      await fetchProjects();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving project:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (projectId, newStatus) => {
    try {
      await api.put(`/projects/${projectId}/status`, { status: newStatus });
      await fetchProjects();
    } catch (error) {
      console.error("Error updating project status:", error);
    }
  };

  const handleUploadProjectReport = async (e) => {
    e.preventDefault();
    if (!reportFile || !reportProject) return;
    setUploadingReport(true);
    try {
      const formData = new FormData();
      formData.append('reportFile', reportFile);
      await api.post(`/projects/${reportProject.id}/report`, formData);
      setIsReportModalOpen(false);
      setReportFile(null);
      setReportProject(null);
      fetchProjects();
    } catch (err) {
      console.error('Error uploading project report:', err);
    } finally {
      setUploadingReport(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-[60vh]"><Loader2 className="animate-spin text-crewix-accent" size={32} /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 tracking-tight">{role === 'MANAGER' ? 'Projects' : 'My Projects'}</h2>
          <p className="text-gray-500 text-sm mt-1">
            {role === 'MANAGER' ? `${projects.length} project${projects.length !== 1 ? 's' : ''} total` : 'Projects you are currently contributing to.'}
          </p>
        </div>
        {role === 'MANAGER' && (
          <button onClick={() => setIsModalOpen(true)}
            className="bg-crewix-dark hover:bg-black text-white px-5 py-2.5 rounded-full flex items-center gap-2 shadow-sm transition-colors text-sm font-medium">
            <Plus size={18} /> New Project
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.filter(project => {
          if (role === 'MANAGER') return true;
          // Show project if the employee is assigned to any task in it
          return tasks.some(t => t.project?.id === project.id && t.assignee?.id === employeeId);
        }).map(project => {
          const status = project.status || 'PLANNING';
          const projectTasks = tasks.filter(t => t.project?.id === project.id);
          const myTasks = role === 'MANAGER' ? projectTasks : projectTasks.filter(t => t.assignee?.id === employeeId);
          const totalTasks = myTasks.length;
          const completedTasks = myTasks.filter(t => t.status === 'COMPLETED').length;
          const progressPercent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
          const membersCount = project.members ? project.members.length : 0;
          return (
            <div key={project.id} className="bg-white/70 backdrop-blur-md rounded-[2rem] p-6 shadow-sm border border-white hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-crewix-accent border border-gray-50">
                  <Briefcase size={22} />
                </div>
                <button onClick={() => handleDelete(project.id)}
                  className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50"
                  title="Delete project">
                  <Trash2 size={15} />
                </button>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{project.name}</h3>
              {project.description && <p className="text-xs text-gray-500 mb-4 line-clamp-2">{project.description}</p>}
              
              <div className="space-y-1.5 mb-6">
                <div className="flex justify-between text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                  <span>{role === 'MANAGER' ? 'Project Progress' : 'My Progress'}</span>
                  <span>{progressPercent}% ({completedTasks}/{totalTasks} tasks)</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-crewix-accent rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                </div>
              </div>

              <div className="flex items-center gap-2 mb-6">
                {role === 'MANAGER' ? (
                  <select 
                    value={status} 
                    onChange={(e) => handleStatusChange(project.id, e.target.value)}
                    className={`text-[10px] px-2 py-1 rounded-md font-medium uppercase tracking-wider cursor-pointer border-none focus:ring-0 ${statusColors[status] || statusColors.PLANNING}`}
                  >
                    <option value="PLANNING">PLANNING</option>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="COMPLETED">COMPLETED</option>
                  </select>
                ) : (
                  <span className={`text-[10px] px-2 py-1 rounded-md font-medium uppercase tracking-wider ${statusColors[status] || statusColors.PLANNING}`}>
                    {status}
                  </span>
                )}
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Calendar size={12} /> {project.endDate || 'No deadline'}
                </span>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-100/50">
                <div className="flex -space-x-2">
                  {[...Array(Math.min(membersCount, 3))].map((_, i) => (
                    <Avatar key={i} name={`E ${i}`} size="sm" className="border-2 border-white -ml-2 first:ml-0" />
                  ))}
                  {membersCount > 3 && (
                    <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 text-[10px] font-medium text-gray-600 flex items-center justify-center shadow-sm">
                      +{membersCount - 3}
                    </div>
                  )}
                </div>
                <span className="text-xs text-gray-400 font-medium">{project.startDate || 'Not started'}</span>
              </div>

              {/* Report section for completed projects */}
              {status === 'COMPLETED' && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  {!project.reportFileUrl ? (
                    <button 
                      onClick={() => { setReportProject(project); setReportFile(null); setIsReportModalOpen(true); }}
                      className="w-full text-sm bg-crewix-accent text-white px-4 py-2.5 rounded-xl font-bold hover:bg-opacity-90 transition-colors shadow-sm flex items-center justify-center gap-2"
                    >
                      <Upload size={14} /> Upload Completion Report
                    </button>
                  ) : (
                    <a 
                      href={`${api.defaults.baseURL.replace('/api', '')}${project.reportFileUrl}?token=${localStorage.getItem('token')}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="w-full text-sm bg-green-50 text-green-600 px-4 py-2.5 rounded-xl font-bold hover:bg-green-100 transition-colors shadow-sm flex items-center justify-center gap-2 border border-green-200"
                    >
                      <Download size={14}/> Download Project Report
                    </a>
                  )}
                </div>
              )}
            </div>
          );
        })}
        
        {projects.filter(project => {
          if (role === 'MANAGER') return true;
          return tasks.some(t => t.project?.id === project.id && t.assignee?.id === employeeId);
        }).length === 0 && (
          <div className="col-span-3 text-center py-16 text-gray-400">
            <Briefcase size={48} className="mx-auto mb-4 opacity-30" />
            <p className="font-medium">
              {role === 'MANAGER' 
                ? 'No projects yet. Create your first one!' 
                : 'You are not assigned to any tasks in any active projects.'}
            </p>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Project">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Project Name</label>
            <input type="text" required value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-crewix-accent text-sm"
              placeholder="e.g. Website Redesign" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
            <textarea rows="2" value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-crewix-accent text-sm resize-none"
              placeholder="Goals and scope..." />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-bold text-gray-700 mb-1">Start Date</label>
              <input type="date" value={formData.startDate}
                onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-crewix-accent text-sm text-gray-600" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-bold text-gray-700 mb-1">End Date</label>
              <input type="date" value={formData.endDate}
                onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-crewix-accent text-sm text-gray-600" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Status</label>
            <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-crewix-accent text-sm text-gray-600">
              <option value="PLANNING">Planning</option>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
          <div className="pt-2 flex gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)}
              className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold py-2.5 rounded-xl transition-colors text-sm">Cancel</button>
            <button type="submit" disabled={submitting}
              className="flex-1 bg-crewix-dark hover:bg-black text-white font-bold py-2.5 rounded-xl transition-colors text-sm flex justify-center items-center">
              {submitting ? <Loader2 size={18} className="animate-spin" /> : 'Create Project'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Project Report Upload Modal */}
      <Modal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} title="Upload Project Completion Report">
        <form onSubmit={handleUploadProjectReport} className="space-y-4">
          <p className="text-sm text-gray-600 mb-2">Upload a PDF completion report for this project.</p>
          {reportProject && (
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
              <p className="text-sm font-bold text-gray-700">{reportProject.name}</p>
              <p className="text-xs text-gray-500 mt-1">{reportProject.description}</p>
            </div>
          )}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Report File (PDF only)</label>
            <input 
              type="file" 
              accept=".pdf"
              onChange={(e) => setReportFile(e.target.files[0])}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-crewix-accent text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-crewix-light file:text-crewix-accent hover:file:bg-crewix-accent/20 transition-all"
              required
            />
          </div>
          <div className="pt-4 flex gap-3">
            <button type="button" onClick={() => setIsReportModalOpen(false)} className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold py-2.5 rounded-xl transition-colors text-sm">Cancel</button>
            <button type="submit" disabled={uploadingReport} className="flex-1 bg-crewix-dark hover:bg-black text-white font-bold py-2.5 rounded-xl transition-colors text-sm flex justify-center items-center gap-2">
              {uploadingReport ? <Loader2 size={16} className="animate-spin" /> : 'Upload Report'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default Projects;
