import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, Mail, ShieldAlert } from 'lucide-react';
import api from '../services/api';

const Signup = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'EMPLOYEE' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/signup', formData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-crewix-light flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-8 text-center bg-crewix-dark text-white">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <span className="text-3xl font-bold text-crewix-accent">S</span>
          </div>
          <h2 className="text-3xl font-bold mb-2">Create Account</h2>
          <p className="text-white/80">Join SwishView WorkHub</p>
        </div>
        
        <div className="p-8">
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-xl text-sm mb-6 text-center font-medium">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-crewix-accent outline-none text-gray-700 text-sm"
                  placeholder="John Doe"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-crewix-accent outline-none text-gray-700 text-sm"
                  placeholder="john@swishview.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-crewix-accent outline-none text-gray-700 text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Role</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <ShieldAlert className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-crewix-accent outline-none text-gray-700 text-sm bg-white"
                >
                  <option value="EMPLOYEE">Employee</option>
                  <option value="MANAGER">Manager</option>
                </select>
              </div>
            </div>

            {formData.role === 'MANAGER' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admin Code</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password" required value={formData.adminCode || ''} onChange={e => setFormData({...formData, adminCode: e.target.value})}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-crewix-accent outline-none text-gray-700 text-sm"
                    placeholder="Enter admin code to register as Manager"
                  />
                </div>
              </div>
            )}

            <button
              type="submit" disabled={loading}
              className="w-full bg-crewix-accent hover:bg-[#a6d59f] text-gray-800 font-bold py-3 px-4 rounded-xl shadow-sm transition-all mt-4"
            >
              {loading ? 'Creating...' : 'Sign Up'}
            </button>
            <p className="text-center text-sm text-gray-500 mt-4">
              Already have an account? <Link to="/login" className="text-crewix-dark hover:underline font-bold">Login here</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
