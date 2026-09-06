import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, User, Briefcase, Loader2, AlertCircle } from 'lucide-react';
import api from '../services/api';

const Login = () => {
  const [selectedRole, setSelectedRole] = useState('EMPLOYEE');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', { email, password });

      if (!res.data.token) {
        setError('Authentication failed. Please try again.');
        return;
      }

      // Validate that the role matches what user selected
      const returnedRole = res.data.role?.toUpperCase();
      if (returnedRole !== selectedRole) {
        setError(
          `Access denied. This account is registered as ${returnedRole === 'MANAGER' ? 'a Manager' : 'an Employee'}. Please select the correct role.`
        );
        return;
      }

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', returnedRole);

      // Fetch linked employee record to get employeeId for future requests
      try {
        const empRes = await api.get('/employees/me', {
          headers: { Authorization: `Bearer ${res.data.token}` }
        });
        if (empRes.data?.id) {
          localStorage.setItem('employeeId', empRes.data.id);
        }
      } catch (_) {
        // Manager accounts may not have an employee record — that's fine
      }

      navigate('/dashboard');
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Invalid email or password. Please try again.');
      } else {
        setError('Unable to connect to server. Please try later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-crewix-light flex items-center justify-center p-4 font-sans">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-crewix-accent/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-crewix-dark/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-md w-full">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-crewix-dark rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-crewix-dark/20">
            <ShieldCheck size={32} className="text-crewix-accent" />
          </div>
          <h1 className="text-3xl font-black text-gray-800 tracking-tight">SwishView</h1>
          <p className="text-gray-500 text-sm mt-1">Secure WorkHub Portal</p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-gray-200 border border-white p-8">
          
          {/* Role Selector */}
          <div className="mb-8">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center mb-3">I am a...</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedRole('EMPLOYEE')}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                  selectedRole === 'EMPLOYEE'
                    ? 'border-crewix-accent bg-crewix-light shadow-sm'
                    : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  selectedRole === 'EMPLOYEE' ? 'bg-crewix-accent text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  <User size={20} />
                </div>
                <span className={`text-sm font-bold ${selectedRole === 'EMPLOYEE' ? 'text-gray-800' : 'text-gray-400'}`}>
                  Employee
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('MANAGER')}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                  selectedRole === 'MANAGER'
                    ? 'border-crewix-dark bg-gray-50 shadow-sm'
                    : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  selectedRole === 'MANAGER' ? 'bg-crewix-dark text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  <Briefcase size={20} />
                </div>
                <span className={`text-sm font-bold ${selectedRole === 'MANAGER' ? 'text-gray-800' : 'text-gray-400'}`}>
                  Manager
                </span>
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-6 border border-red-100">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email" required
                  value={email} onChange={e => { setEmail(e.target.value); setError(''); }}
                  className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-crewix-accent focus:border-transparent outline-none text-gray-700 bg-gray-50/50 transition-all"
                  placeholder={selectedRole === 'MANAGER' ? 'manager@company.com' : 'employee@company.com'}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'} required
                  value={password} onChange={e => { setPassword(e.target.value); setError(''); }}
                  className="block w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-crewix-accent focus:border-transparent outline-none text-gray-700 bg-gray-50/50 transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className={`w-full flex justify-center items-center gap-2 font-bold py-3 px-4 rounded-xl shadow-md transition-all active:scale-95 mt-2 ${
                selectedRole === 'MANAGER'
                  ? 'bg-crewix-dark hover:bg-black text-white shadow-crewix-dark/20'
                  : 'bg-crewix-accent hover:bg-[#a6d59f] text-gray-800 shadow-crewix-accent/30'
              }`}
            >
              {loading
                ? <Loader2 className="animate-spin" size={20} />
                : <>
                    <ShieldCheck size={18} />
                    Sign In as {selectedRole === 'MANAGER' ? 'Manager' : 'Employee'}
                  </>
              }
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">
              New to SwishView?{' '}
              <Link to="/signup" className="text-crewix-dark hover:underline font-bold">Create an account</Link>
            </p>
          </div>
        </div>

        {/* Security badge */}
        <p className="text-center text-xs text-gray-400 mt-6 flex items-center justify-center gap-1">
          <ShieldCheck size={12} /> Secured with JWT authentication
        </p>
      </div>
    </div>
  );
};

export default Login;
