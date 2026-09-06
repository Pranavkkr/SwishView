import React, { useState, useEffect } from 'react';
import { PlayCircle, Clock, Plus, Trash2, Sparkles, Loader2, BookOpen } from 'lucide-react';
import api from '../services/api';
import Modal from '../components/Modal';

const Training = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const role = localStorage.getItem('role') || 'EMPLOYEE';

  const [formData, setFormData] = useState({
    title: '', description: '', category: '', durationMinutes: ''
  });

  useEffect(() => { fetchCourses(); }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/training-courses');
      setCourses(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/training-courses', {
        ...formData,
        durationMinutes: formData.durationMinutes ? parseInt(formData.durationMinutes) : null
      });
      setIsModalOpen(false);
      setFormData({ title: '', description: '', category: '', durationMinutes: '' });
      fetchCourses();
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this course?')) return;
    try {
      await api.delete(`/training-courses/${id}`);
      setCourses(prev => prev.filter(c => c.id !== id));
    } catch (err) { alert('Could not delete course.'); }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-crewix-accent" size={32} /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Learning & Development</h2>
          <p className="text-gray-500 text-sm mt-1">Enhance your skills with company courses.</p>
        </div>
        {role === 'MANAGER' && (
          <button onClick={() => setIsModalOpen(true)}
            className="bg-crewix-dark hover:bg-black text-white px-5 py-2.5 rounded-full flex items-center gap-2 shadow-sm transition-colors text-sm font-medium">
            <Plus size={18} /> Add Course
          </button>
        )}
      </div>

      <div className="bg-gradient-to-r from-crewix-light to-white p-6 rounded-[2rem] border border-crewix-accent/20 shadow-sm flex flex-col md:flex-row gap-6 items-center">
        <div className="w-16 h-16 rounded-full bg-crewix-accent flex items-center justify-center text-white shrink-0 shadow-md shadow-crewix-accent/30">
          <Sparkles size={28} />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h3 className="font-bold text-gray-800 mb-1">AI Course Recommendation</h3>
          <p className="text-sm text-gray-600">Based on your role and recent performance metrics, <strong>"Advanced System Design"</strong> is highly recommended for career growth.</p>
        </div>
        <button className="bg-crewix-dark hover:bg-black text-white px-6 py-3 rounded-xl text-sm font-bold transition-colors whitespace-nowrap">
          Start Course
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map(course => (
          <div key={course.id} className="bg-white/70 backdrop-blur-md rounded-[2rem] p-6 shadow-sm border border-white hover:shadow-md transition-all group cursor-pointer flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] px-2.5 py-1 bg-crewix-light text-crewix-dark rounded-full font-bold uppercase tracking-wider">
                  {course.category || 'General'}
                </span>
                {role === 'MANAGER' && (
                  <button onClick={() => handleDelete(course.id)}
                    className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-50">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <h3 className="font-bold text-gray-800 mb-2 group-hover:text-crewix-accent transition-colors">{course.title}</h3>
              <p className="text-xs text-gray-500 line-clamp-3 mb-6">{course.description}</p>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
              <div className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                <Clock size={14} />
                {course.durationMinutes ? `${course.durationMinutes} min` : 'Self-paced'}
              </div>
              <button className="text-sm font-bold text-crewix-dark flex items-center gap-2 group-hover:text-crewix-accent transition-colors">
                <PlayCircle size={18} /> Start
              </button>
            </div>
          </div>
        ))}
        {courses.length === 0 && (
          <div className="col-span-3 text-center py-16 text-gray-400">
            <BookOpen size={48} className="mx-auto mb-4 opacity-30" />
            <p className="font-medium">{role === 'MANAGER' ? 'No courses yet. Add the first one!' : 'No courses available.'}</p>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Training Course">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Course Title</label>
            <input type="text" required value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-crewix-accent text-sm"
              placeholder="e.g. Advanced System Design" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
            <textarea rows="3" value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-crewix-accent text-sm resize-none"
              placeholder="What will learners gain?" />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
              <input type="text" value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-crewix-accent text-sm"
                placeholder="e.g. Engineering" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-bold text-gray-700 mb-1">Duration (mins)</label>
              <input type="number" min="1" value={formData.durationMinutes}
                onChange={e => setFormData({ ...formData, durationMinutes: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-crewix-accent text-sm"
                placeholder="e.g. 90" />
            </div>
          </div>
          <div className="pt-2 flex gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)}
              className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold py-2.5 rounded-xl transition-colors text-sm">Cancel</button>
            <button type="submit" disabled={submitting}
              className="flex-1 bg-crewix-dark hover:bg-black text-white font-bold py-2.5 rounded-xl transition-colors text-sm flex justify-center items-center">
              {submitting ? <Loader2 size={18} className="animate-spin" /> : 'Add Course'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default Training;
