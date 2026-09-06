import React, { useState, useEffect } from 'react';
import { Sparkles, Calendar, Clock, Loader2, Plus, MoreHorizontal, Printer, Download, CheckCircle2, FileText, User } from 'lucide-react';
import api from '../services/api';
import Modal from '../components/Modal';
import Avatar from '../components/Avatar';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', status: 'TO_DO', dueDate: '', projectId: '', assigneeId: '' });
  const [submitting, setSubmitting] = useState(false);
  
  const [isProofModalOpen, setIsProofModalOpen] = useState(false);
  const [activeTask, setActiveTask] = useState(null);
  const [proofFormData, setProofFormData] = useState({ link: '', note: '', file: null });
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [taskToVerify, setTaskToVerify] = useState(null);

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportFile, setReportFile] = useState(null);
  const [uploadingReport, setUploadingReport] = useState(false);

  const role = localStorage.getItem('role') || 'EMPLOYEE';
  const currentEmployeeId = localStorage.getItem('employeeId');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tasksRes, projRes, empRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/projects'),
        api.get('/employees')
      ]);
      setTasks(Array.isArray(tasksRes.data) ? tasksRes.data : []);
      setProjects(Array.isArray(projRes.data) ? projRes.data : []);
      setEmployees(Array.isArray(empRes.data) ? empRes.data : []);
    } catch (error) {
      console.error("Error fetching data:", error);
      setTasks([]);
      setProjects([]);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // API expects { title, description, status, dueDate, project: { id } }
      const payload = {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        dueDate: formData.dueDate,
        project: { id: parseInt(formData.projectId) }
      };
      if (formData.assigneeId) {
        payload.assignee = { id: parseInt(formData.assigneeId) };
      }
      await api.post('/tasks', payload);
      setIsModalOpen(false);
      setFormData({ title: '', description: '', status: 'TO_DO', dueDate: '', projectId: '', assigneeId: '' });
      fetchData();
    } catch (error) {
      console.error("Error creating task:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus, proofData = null) => {
    try {
      const form = new FormData();
      form.append('status', newStatus);
      if (proofData) {
        if (proofData.submissionLink) form.append('submissionLink', proofData.submissionLink);
        if (proofData.submissionNote) form.append('submissionNote', proofData.submissionNote);
        if (proofData.proofFile) form.append('proofFile', proofData.proofFile);
      }
      
      await api.put(`/tasks/${taskId}/status`, form);
      fetchData();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleUploadReport = async (e) => {
    e.preventDefault();
    if (!reportFile || !activeTask) return;
    setUploadingReport(true);
    try {
      const formData = new FormData();
      formData.append('reportFile', reportFile);
      await api.post(`/tasks/${activeTask.id}/report`, formData);
      setIsReportModalOpen(false);
      setReportFile(null);
      setActiveTask(null);
      fetchData();
    } catch (err) {
      console.error('Error uploading report:', err);
    } finally {
      setUploadingReport(false);
    }
  };

  const handleProofSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await handleStatusChange(activeTask.id, 'REVIEW', {
      submissionLink: proofFormData.link,
      submissionNote: proofFormData.note,
      proofFile: proofFormData.file
    });
    setIsProofModalOpen(false);
    setSubmitting(false);
  };

  const columns = [
    { id: 'TO_DO', title: 'To Do', color: 'bg-gray-100/50' },
    { id: 'IN_PROGRESS', title: 'In Progress', color: 'bg-blue-50/50' },
    { id: 'REVIEW', title: 'In Review', color: 'bg-orange-50/50' },
    { id: 'COMPLETED', title: 'Completed', color: 'bg-green-50/50' }
  ];

  if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-crewix-accent" size={32}/></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Tasks</h2>
          <p className="text-gray-500 text-sm mt-1">
            {role === 'MANAGER' ? 'Kanban board for all ongoing work.' : 'Your assigned tasks.'}
          </p>
        </div>
        {role === 'MANAGER' && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-crewix-dark hover:bg-black text-white px-5 py-2.5 rounded-full flex items-center gap-2 shadow-sm transition-colors text-sm font-medium"
          >
            <Plus size={18} /> New Task
          </button>
        )}
      </div>

      <div className="bg-gradient-to-r from-crewix-light to-white p-6 rounded-[2rem] border border-crewix-accent/20 shadow-sm flex items-start gap-4">
        <div className="mt-1 w-12 h-12 rounded-full bg-crewix-accent flex items-center justify-center text-white shrink-0 shadow-md shadow-crewix-accent/30">
           <Sparkles size={24} />
        </div>
        <div>
           <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-1">AI Task Recommendations</h3>
           <p className="text-sm text-gray-600">Based on your recent activity, we recommend tackling the <strong>"Database Migration Schema"</strong> next. It blocks 3 other tasks and you have high historical velocity on schema tasks.</p>
        </div>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-4 snap-x">
        {columns.map(col => (
          <div key={col.id} className={`${col.color} w-80 shrink-0 rounded-[2rem] p-4 border border-white/40 snap-start`}>
            <div className="flex justify-between items-center mb-4 px-2">
               <h3 className="font-bold text-gray-800">{col.title}</h3>
               <span className="text-xs bg-white text-gray-500 px-2.5 py-1 rounded-full font-medium shadow-sm border border-gray-100">
                  {tasks.filter(t => (t.status || 'TO_DO') === col.id).length}
               </span>
            </div>

            <div className="space-y-4">
              {tasks
                .filter(t => (role === 'MANAGER' || (t.assignee && t.assignee.id === parseInt(currentEmployeeId))))
                .filter(t => (t.status || 'TO_DO') === col.id)
                .map(task => (
                <div key={task.id} className="bg-white/80 backdrop-blur-md p-5 rounded-3xl shadow-sm border border-white hover:shadow-md transition-shadow cursor-pointer group">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded uppercase tracking-wider font-bold">
                       {task.project?.name || 'General'}
                    </span>
                    <button className="text-gray-300 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"><MoreHorizontal size={16} /></button>
                  </div>
                  <h4 className="font-bold text-gray-800 text-sm mb-2">{task.title}</h4>
                  {task.description && <p className="text-xs text-gray-500 line-clamp-2 mb-4">{task.description}</p>}
                  
                  {role === 'EMPLOYEE' && task.submissionNote && (
                    <div className="mb-4 bg-gray-50 p-3 rounded-xl border border-gray-100 text-xs">
                      <h5 className="font-bold text-gray-700 mb-1">Your Submission</h5>
                      <p className="text-gray-600 italic mb-2">"{task.submissionNote}"</p>
                      {task.submissionLink && (
                        <a href={task.submissionLink} target="_blank" rel="noopener noreferrer" className="text-crewix-accent hover:underline break-all mb-2 block truncate">
                          {task.submissionLink}
                        </a>
                      )}
                      {task.submissionFileUrl && (
                        task.submissionFileUrl.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                          <img src={`http://localhost:8080${task.submissionFileUrl}?token=${localStorage.getItem('token')}`} alt="Proof" className="w-full rounded-lg border border-gray-200 mt-2 max-h-32 object-cover" />
                        ) : (
                          <a href={`http://localhost:8080${task.submissionFileUrl}?token=${localStorage.getItem('token')}`} target="_blank" rel="noopener noreferrer" className="inline-block bg-white border border-gray-200 px-3 py-1 rounded shadow-sm hover:bg-gray-50 mt-2">Attached File</a>
                        )
                      )}
                    </div>
                  )}

                    <div className="flex items-center justify-between mt-4 border-b border-gray-100/50 pb-4 mb-3">
                      <div className="flex items-center gap-2">
                        <Avatar 
                          name={task.assignee ? `${task.assignee.firstName} ${task.assignee.lastName}` : 'Unassigned'} 
                          size="sm" 
                          className="border-2 border-white shadow-sm" 
                        />
                        {role === 'MANAGER' && task.assignee && (
                          <span className="text-xs text-gray-500 font-medium">
                            {task.assignee.firstName} {task.assignee.lastName}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                        <Clock size={12} className="text-crewix-accent"/> {task.dueDate || 'No Due Date'}
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-2 items-center">
                      {role === 'EMPLOYEE' && (!task.status || task.status === 'TO_DO') && (
                        <button onClick={() => handleStatusChange(task.id, 'IN_PROGRESS')} className="text-[11px] bg-crewix-accent text-white px-3 py-1.5 rounded-lg font-bold hover:bg-opacity-90 transition-colors shadow-sm">Start Task</button>
                      )}
                      {role === 'EMPLOYEE' && task.status === 'IN_PROGRESS' && (
                        <button onClick={() => { setActiveTask(task); setProofFormData({ link: '', note: '', file: null }); setIsProofModalOpen(true); }} className="text-[11px] bg-orange-500 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-opacity-90 transition-colors shadow-sm">Submit for Review</button>
                      )}
                      {role === 'EMPLOYEE' && task.status === 'REVIEW' && (
                        <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">Pending Approval</span>
                      )}
                      {role === 'MANAGER' && task.status === 'REVIEW' && (
                        <button onClick={() => { setTaskToVerify(task); setIsVerifyModalOpen(true); }} className="text-[11px] bg-crewix-accent text-white px-3 py-1.5 rounded-lg font-bold hover:bg-opacity-90 transition-colors shadow-sm w-full">
                          Verify Submission
                        </button>
                      )}
                      {task.status === 'COMPLETED' && (
                        <div className="flex flex-col gap-2 w-full">
                          <span className="text-[10px] font-bold text-green-500 uppercase tracking-wider">Done</span>
                          {role === 'EMPLOYEE' && !task.reportFileUrl && (
                            <button 
                              onClick={() => { setActiveTask(task); setReportFile(null); setIsReportModalOpen(true); }} 
                              className="text-[11px] bg-crewix-accent text-white px-3 py-1.5 rounded-lg font-bold hover:bg-opacity-90 transition-colors shadow-sm flex items-center justify-center gap-1 w-full"
                            >
                              <FileText size={12} /> Submit Report (PDF)
                            </button>
                          )}
                          {task.reportFileUrl && (
                            <a 
                              href={`http://localhost:8080${task.reportFileUrl}?token=${localStorage.getItem('token')}`} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-[11px] bg-green-50 text-green-600 px-3 py-1.5 rounded-lg font-bold hover:bg-green-100 transition-colors shadow-sm w-full flex items-center justify-center gap-1 border border-green-200"
                            >
                              <Download size={12}/> Download Report
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {tasks
                  .filter(t => (role === 'MANAGER' || (t.assignee && t.assignee.id === parseInt(currentEmployeeId))))
                  .filter(t => (t.status || 'TO_DO') === col.id).length === 0 && (
                  <div className="h-24 border-2 border-dashed border-gray-300/50 rounded-3xl flex items-center justify-center text-gray-400 text-sm">
                      Drop here
                  </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Task">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Task Title</label>
            <input 
              type="text" required value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-crewix-accent text-sm"
              placeholder="What needs to be done?"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Project</label>
            <select 
              required
              value={formData.projectId}
              onChange={(e) => setFormData({...formData, projectId: e.target.value})}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-crewix-accent text-sm text-gray-600"
            >
              <option value="" disabled>Select a project</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Assign To</label>
            <select 
              value={formData.assigneeId}
              onChange={(e) => setFormData({...formData, assigneeId: e.target.value})}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-crewix-accent text-sm text-gray-600"
            >
              <option value="">Unassigned</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
            <textarea 
              rows="2" value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-crewix-accent text-sm resize-none"
              placeholder="Details..."
            ></textarea>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-bold text-gray-700 mb-1">Due Date</label>
              <input 
                type="date" value={formData.dueDate}
                onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-crewix-accent text-sm text-gray-600"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-bold text-gray-700 mb-1">Status</label>
              <select 
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-crewix-accent text-sm text-gray-600"
              >
                <option value="TO_DO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="REVIEW">In Review</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>
          <div className="pt-4 flex gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold py-2.5 rounded-xl transition-colors text-sm">Cancel</button>
            <button type="submit" disabled={submitting} className="flex-1 bg-crewix-dark hover:bg-black text-white font-bold py-2.5 rounded-xl transition-colors text-sm flex justify-center items-center">
              {submitting ? <Loader2 size={18} className="animate-spin" /> : 'Create Task'}
            </button>
          </div>
        </form>
      </Modal>
      <Modal isOpen={isProofModalOpen} onClose={() => setIsProofModalOpen(false)} title="Submit Task for Review">
        <form onSubmit={handleProofSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Completion Notes <span className="text-red-500">*</span></label>
            <textarea 
              required rows="3" value={proofFormData.note}
              onChange={(e) => setProofFormData({...proofFormData, note: e.target.value})}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-crewix-accent text-sm resize-none"
              placeholder="What did you accomplish?"
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Work Link (URL)</label>
            <input 
              type="url" value={proofFormData.link}
              onChange={(e) => setProofFormData({...proofFormData, link: e.target.value})}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-crewix-accent text-sm"
              placeholder="https://github.com/... or Figma link"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Upload Picture/Video Proof</label>
            <input 
              type="file" accept="image/*,video/*"
              onChange={(e) => setProofFormData({...proofFormData, file: e.target.files[0]})}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-crewix-accent text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-crewix-light file:text-crewix-accent hover:file:bg-crewix-accent/20 transition-all"
            />
          </div>
          <div className="pt-4 flex gap-3">
            <button type="button" onClick={() => setIsProofModalOpen(false)} className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold py-2.5 rounded-xl transition-colors text-sm">Cancel</button>
            <button type="submit" disabled={submitting} className="flex-1 bg-crewix-dark hover:bg-black text-white font-bold py-2.5 rounded-xl transition-colors text-sm flex justify-center items-center">
              {submitting ? <Loader2 size={18} className="animate-spin" /> : 'Submit for Review'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isVerifyModalOpen} onClose={() => setIsVerifyModalOpen(false)} title="Verify Submission">
        {taskToVerify && (
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-bold text-gray-800 mb-1">{taskToVerify.title}</h4>
              <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-xl border border-gray-100">
                <span className="font-bold text-gray-700 block mb-1">Employee Notes:</span>
                "{taskToVerify.submissionNote}"
              </p>
            </div>
            
            {taskToVerify.submissionLink && (
              <div>
                <span className="font-bold text-gray-700 block text-sm mb-1">Work Link:</span>
                <a href={taskToVerify.submissionLink} target="_blank" rel="noopener noreferrer" className="text-crewix-accent text-sm hover:underline break-all bg-crewix-light/30 p-2 rounded-lg inline-block w-full border border-crewix-accent/20">
                  {taskToVerify.submissionLink}
                </a>
              </div>
            )}

            {taskToVerify.submissionFileUrl && (
              <div>
                <span className="font-bold text-gray-700 block text-sm mb-2">Attached Proof:</span>
                <div className="bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                  {taskToVerify.submissionFileUrl.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                    <a href={`http://localhost:8080${taskToVerify.submissionFileUrl}?token=${localStorage.getItem('token')}`} target="_blank" rel="noopener noreferrer" className="cursor-zoom-in block">
                      <img src={`http://localhost:8080${taskToVerify.submissionFileUrl}?token=${localStorage.getItem('token')}`} alt="Proof" className="w-full object-contain max-h-64 hover:opacity-90 transition-opacity" title="Click to view full size" />
                    </a>
                  ) : taskToVerify.submissionFileUrl.match(/\.(mp4|webm|ogg)$/i) ? (
                    <video src={`http://localhost:8080${taskToVerify.submissionFileUrl}?token=${localStorage.getItem('token')}`} controls className="w-full max-h-64"></video>
                  ) : (
                    <div className="p-4 text-center">
                      <a href={`http://localhost:8080${taskToVerify.submissionFileUrl}?token=${localStorage.getItem('token')}`} target="_blank" rel="noopener noreferrer" className="inline-block bg-white border border-gray-200 px-4 py-2 rounded-lg font-bold text-crewix-accent shadow-sm hover:bg-gray-50 transition-colors">
                        Download / View File
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="pt-4 flex gap-3 border-t border-gray-100 mt-4">
              <button 
                type="button" 
                onClick={() => {
                  handleStatusChange(taskToVerify.id, 'IN_PROGRESS');
                  setIsVerifyModalOpen(false);
                }} 
                className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-bold py-3 rounded-xl transition-colors text-sm border border-red-100"
              >
                Reject & Re-assign
              </button>
              <button 
                type="button" 
                onClick={() => {
                  handleStatusChange(taskToVerify.id, 'COMPLETED');
                  setIsVerifyModalOpen(false);
                }} 
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl transition-colors text-sm shadow-md shadow-green-500/20"
              >
                Accept & Approve
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Task Report Upload Modal */}
      <Modal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} title="Submit Task Report">
        <form onSubmit={handleUploadReport} className="space-y-4">
          <p className="text-sm text-gray-600 mb-2">Upload a PDF report for this completed task.</p>
          {activeTask && (
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
              <p className="text-sm font-bold text-gray-700">{activeTask.title}</p>
              <p className="text-xs text-gray-500 mt-1">{activeTask.project?.name}</p>
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
export default Tasks;
