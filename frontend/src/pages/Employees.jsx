import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Loader2, User, Mail, Building2, Briefcase, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Modal from '../components/Modal';
import Avatar from '../components/Avatar';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const role = localStorage.getItem('role') || 'EMPLOYEE';

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '',
    department: '', designation: '', joiningDate: ''
  });

  useEffect(() => { fetchEmployees(); }, []);

  useEffect(() => {
    const q = searchTerm.toLowerCase();
    const safeEmployees = Array.isArray(employees) ? employees : [];
    setFiltered(
      safeEmployees.filter(e =>
        `${e?.firstName || ''} ${e?.lastName || ''}`.toLowerCase().includes(q) ||
        (e?.email || '').toLowerCase().includes(q) ||
        (e?.department || '').toLowerCase().includes(q)
      )
    );
  }, [searchTerm, employees]);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await api.get('/employees');
      const data = Array.isArray(res.data) ? res.data : [];
      setEmployees(data);
      setFiltered(data);
    } catch (err) {
      console.error('Error fetching employees:', err);
      setEmployees([]);
      setFiltered([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      // Step 1: Create a linked user account (with a temporary password)
      const signupRes = await api.post('/auth/signup', {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: 'Welcome@123', // temporary default password
        role: 'EMPLOYEE'
      });

      // Step 2: Fetch users to find the newly created user id by email
      // We'll pass employee data directly — the backend will link them
      await api.post('/employees', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        department: formData.department,
        designation: formData.designation,
        joiningDate: formData.joiningDate || null,
      });

      setIsModalOpen(false);
      setFormData({ firstName: '', lastName: '', email: '', department: '', designation: '', joiningDate: '' });
      fetchEmployees();
    } catch (err) {
      let errorMsg = 'Failed to add employee. Email may already exist.';
      if (err.response?.data) {
        errorMsg = typeof err.response.data === 'string' ? err.response.data : err.response.data.message || errorMsg;
      }
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this employee?')) return;
    try {
      await api.delete(`/employees/${id}`);
      setEmployees(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      alert('Failed to delete employee. They may have linked records.');
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <Loader2 className="animate-spin text-crewix-accent" size={32} />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Employees</h2>
          <p className="text-gray-500 text-sm mt-1">{employees?.length || 0} team members in company</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text" placeholder="Search employees..."
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:border-crewix-accent w-56 shadow-sm"
            />
          </div>
          {role === 'MANAGER' && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-crewix-dark hover:bg-black text-white px-5 py-2.5 rounded-full flex items-center gap-2 shadow-sm transition-colors text-sm font-medium"
            >
              <Plus size={18} /> Add Employee
            </button>
          )}
        </div>
      </div>

      <div className="bg-white/70 backdrop-blur-md rounded-[2rem] shadow-sm border border-white overflow-hidden">
        <table className="w-full text-left">
          <thead className="border-b border-gray-100 bg-gray-50/50">
            <tr className="text-xs text-gray-400 uppercase tracking-wider">
              <th className="py-4 px-6 font-semibold">Employee</th>
              <th className="py-4 font-semibold">Department</th>
              <th className="py-4 font-semibold">Designation</th>
              <th className="py-4 font-semibold">Joined</th>
              <th className="py-4 font-semibold">Status</th>
              <th className="py-4 pr-6 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {(filtered || []).map(emp => (
              <tr key={emp.id} className="hover:bg-white/80 transition-colors group">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <Avatar
                      name={`${emp.firstName} ${emp.lastName}`}
                      size="md"
                      className="border-2 border-white"
                    />
                    <div>
                      <Link to={`/employees/${emp.id}`} className="font-bold text-sm text-gray-800 hover:text-crewix-accent transition-colors">
                        {emp.firstName} {emp.lastName}
                      </Link>
                      <p className="text-xs text-gray-400">{emp.email}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 text-sm text-gray-600 font-medium">{emp.department || '—'}</td>
                <td className="py-4 text-sm text-gray-500">{emp.designation || '—'}</td>
                <td className="py-4 text-sm text-gray-400">{emp.joiningDate || '—'}</td>
                <td className="py-4">
                  <span className="text-[10px] bg-green-50 text-green-600 px-2.5 py-1 rounded-full font-bold tracking-wider uppercase">Active</span>
                </td>
                <td className="py-4 pr-6 text-right">
                  {role === 'MANAGER' && (
                    <button
                      onClick={() => handleDelete(emp.id)}
                      className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-50"
                      title="Remove employee"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <User size={48} className="mx-auto mb-4 opacity-30" />
            <p className="font-medium">{searchTerm ? 'No employees match your search.' : 'No employees yet. Add your first team member!'}</p>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setError(''); }} title="Add New Employee">
        <form onSubmit={handleAddEmployee} className="space-y-4">
          {error && <div className="bg-red-50 text-red-500 p-3 rounded-xl text-sm font-medium">{error}</div>}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">First Name</label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" required value={formData.firstName}
                  onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-crewix-accent text-sm"
                  placeholder="John" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Last Name</label>
              <input type="text" required value={formData.lastName}
                onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-crewix-accent text-sm"
                placeholder="Doe" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Work Email</label>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="email" required value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-crewix-accent text-sm"
                placeholder="john.doe@company.com" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Department</label>
              <div className="relative">
                <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" value={formData.department}
                  onChange={e => setFormData({ ...formData, department: e.target.value })}
                  className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-crewix-accent text-sm"
                  placeholder="Engineering" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Designation</label>
              <div className="relative">
                <Briefcase size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" value={formData.designation}
                  onChange={e => setFormData({ ...formData, designation: e.target.value })}
                  className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-crewix-accent text-sm"
                  placeholder="Software Engineer" />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Joining Date</label>
            <div className="relative">
              <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="date" value={formData.joiningDate}
                onChange={e => setFormData({ ...formData, joiningDate: e.target.value })}
                className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-crewix-accent text-sm text-gray-600" />
            </div>
          </div>
          <p className="text-xs text-gray-400 bg-gray-50 p-2 rounded-lg">
            💡 A login account will be created with default password <strong>Welcome@123</strong>. The employee can change it after first login.
          </p>
          <div className="pt-2 flex gap-3">
            <button type="button" onClick={() => { setIsModalOpen(false); setError(''); }}
              className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold py-2.5 rounded-xl transition-colors text-sm">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="flex-1 bg-crewix-dark hover:bg-black text-white font-bold py-2.5 rounded-xl transition-colors text-sm flex justify-center items-center gap-2">
              {submitting ? <Loader2 size={16} className="animate-spin" /> : 'Add Employee'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Employees;
