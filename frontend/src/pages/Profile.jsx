import React, { useState, useEffect } from 'react';
import { User, Mail, Building2, Calendar, Edit3, Shield, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import Avatar from '../components/Avatar';
import Modal from '../components/Modal';

const Profile = () => {
  const [employee, setEmployee] = useState(null);
  const [user, setUser] = useState(null);
  const [isEmployee, setIsEmployee] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Edit Profile State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', department: '', designation: '' });
  const [updating, setUpdating] = useState(false);
  
  // Password State
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [pwdForm, setPwdForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [pwdUpdating, setPwdUpdating] = useState(false);
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/employees/me');
      setEmployee(res.data);
      setIsEmployee(true);
      setEditForm({
        firstName: res.data.firstName || '',
        lastName: res.data.lastName || '',
        department: res.data.department || '',
        designation: res.data.designation || ''
      });
      localStorage.setItem('name', `${res.data.firstName} ${res.data.lastName}`);
    } catch (err) {
      try {
        const userRes = await api.get('/auth/me');
        setUser(userRes.data);
        setIsEmployee(false);
        const nameParts = (userRes.data.name || '').split(' ');
        setEditForm({
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
          department: '',
          designation: ''
        });
        localStorage.setItem('name', userRes.data.name);
      } catch (authErr) {
        console.error("Failed to load profile", authErr);
        setError("Failed to load profile. Please make sure your account is linked.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError('');
    try {
      if (isEmployee) {
        await api.put(`/employees/${employee.id}`, editForm);
      } else {
        await api.put(`/auth/update-profile`, { name: `${editForm.firstName} ${editForm.lastName}`.trim() });
      }
      await fetchProfile();
      setIsEditModalOpen(false);
    } catch (err) {
      setError("Failed to update profile.");
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdError('');
    setPwdSuccess('');
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      setPwdError("New passwords do not match.");
      return;
    }
    
    setPwdUpdating(true);
    try {
      await api.post('/auth/change-password', {
        oldPassword: pwdForm.oldPassword,
        newPassword: pwdForm.newPassword
      });
      setPwdSuccess("Password changed successfully!");
      setPwdForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setIsPasswordModalOpen(false), 2000);
    } catch (err) {
      setPwdError(err.response?.data || "Failed to change password.");
    } finally {
      setPwdUpdating(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-[60vh]"><Loader2 className="animate-spin text-crewix-accent" size={32} /></div>;
  if (!employee && !user) return (
    <div className="p-6 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3">
      <AlertCircle /> Profile not found or not linked.
    </div>
  );

  const profileData = isEmployee ? employee : user;
  const fullName = isEmployee ? `${employee.firstName} ${employee.lastName}` : user.name;
  const email = isEmployee ? employee.email : user.email;
  const designation = isEmployee ? employee.designation : 'Administrator';

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 tracking-tight">My Profile</h2>
          <p className="text-gray-500 text-sm mt-1">Manage your personal information and security settings.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => { setIsPasswordModalOpen(true); setPwdError(''); setPwdSuccess(''); }} className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-full flex items-center gap-2 shadow-sm transition-colors text-sm font-medium">
            <Shield size={16} /> Security
          </button>
          <button onClick={() => setIsEditModalOpen(true)} className="bg-crewix-dark hover:bg-black text-white px-5 py-2.5 rounded-full flex items-center gap-2 shadow-sm transition-colors text-sm font-medium">
            <Edit3 size={16} /> Edit Profile
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avatar Card */}
        <div className="bg-white/70 backdrop-blur-md rounded-[2rem] p-8 shadow-sm border border-white text-center flex flex-col items-center">
          <Avatar name={fullName} size="3xl" className="mb-4 shadow-lg border-4 border-white" />
          <h3 className="text-xl font-black text-gray-800">{fullName}</h3>
          <p className="text-sm text-gray-500 mb-4">{designation}</p>
          <span className="text-[10px] bg-crewix-light text-crewix-dark px-4 py-1.5 rounded-full font-bold uppercase tracking-wider">
            {localStorage.getItem('role') || 'Employee'}
          </span>
        </div>

        {/* Details */}
        <div className="lg:col-span-2 bg-white/70 backdrop-blur-md rounded-[2rem] p-8 shadow-sm border border-white">
          <h3 className="font-bold text-gray-800 mb-6 text-lg">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              { icon: User,      label: 'Full Name',   value: fullName },
              { icon: Mail,      label: 'Email',        value: email },
              { icon: Building2, label: 'Department',   value: isEmployee ? employee.department || 'Not Assigned' : 'System Administration' },
              { icon: Calendar,  label: 'Joined',       value: isEmployee ? employee.joiningDate || 'Unknown' : 'Since Setup' },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-crewix-accent shadow-sm shrink-0">
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{item.label}</p>
                    <p className="text-sm font-bold text-gray-800 truncate">{item.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Profile">
        <form onSubmit={handleEditProfile} className="space-y-4">
          {error && <p className="text-red-500 text-sm bg-red-50 p-2 rounded-lg font-medium">{error}</p>}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">First Name</label>
              <input type="text" required value={editForm.firstName} onChange={e => setEditForm({...editForm, firstName: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-crewix-accent text-sm" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Last Name</label>
              <input type="text" required value={editForm.lastName} onChange={e => setEditForm({...editForm, lastName: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-crewix-accent text-sm" />
            </div>
          </div>
          {!isEmployee && (
            <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded-lg">
              You are signed in as an administrator without a linked employee record. You can only update your name.
            </p>
          )}
          {isEmployee && (
            <>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Department</label>
                <input type="text" value={editForm.department} onChange={e => setEditForm({...editForm, department: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-crewix-accent text-sm" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Designation</label>
                <input type="text" value={editForm.designation} onChange={e => setEditForm({...editForm, designation: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-crewix-accent text-sm" />
              </div>
            </>
          )}
          <button type="submit" disabled={updating} className="w-full bg-crewix-dark hover:bg-black text-white font-bold py-2.5 rounded-xl flex justify-center mt-2">
            {updating ? <Loader2 className="animate-spin" size={18} /> : 'Save Changes'}
          </button>
        </form>
      </Modal>

      {/* Change Password Modal */}
      <Modal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} title="Change Password">
        <form onSubmit={handleChangePassword} className="space-y-4">
          {pwdError && <div className="text-red-500 text-sm bg-red-50 p-3 rounded-xl flex gap-2"><AlertCircle size={16}/> {pwdError}</div>}
          {pwdSuccess && <div className="text-green-600 text-sm bg-green-50 p-3 rounded-xl flex gap-2"><CheckCircle2 size={16}/> {pwdSuccess}</div>}
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Current Password</label>
            <input type="password" required value={pwdForm.oldPassword} onChange={e => setPwdForm({...pwdForm, oldPassword: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-crewix-accent text-sm" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">New Password</label>
            <input type="password" required value={pwdForm.newPassword} onChange={e => setPwdForm({...pwdForm, newPassword: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-crewix-accent text-sm" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Confirm New Password</label>
            <input type="password" required value={pwdForm.confirmPassword} onChange={e => setPwdForm({...pwdForm, confirmPassword: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-crewix-accent text-sm" />
          </div>
          <button type="submit" disabled={pwdUpdating} className="w-full bg-crewix-dark hover:bg-black text-white font-bold py-2.5 rounded-xl flex justify-center mt-2">
            {pwdUpdating ? <Loader2 className="animate-spin" size={18} /> : 'Update Password'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Profile;
