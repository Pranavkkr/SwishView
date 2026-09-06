import React, { useState, useEffect } from 'react';
import { Calendar, Umbrella, Plus, Check, X, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import Modal from '../components/Modal';

const LeaveManagement = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const role = localStorage.getItem('role') || 'EMPLOYEE';
  const employeeId = localStorage.getItem('employeeId');

  // Employee Specific Data
  const [employeeData, setEmployeeData] = useState(null);
  const [markingDate, setMarkingDate] = useState(null);
  const [submittingStatus, setSubmittingStatus] = useState('');

  // Manager Specific Data
  const [allEmployees, setAllEmployees] = useState([]);
  const [allAttendance, setAllAttendance] = useState([]);

  const [formData, setFormData] = useState({
    type: 'Vacation', startDate: '', endDate: '', reason: ''
  });

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => { 
    fetchData(); 
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const leavesRes = await api.get('/leave-requests');
      setLeaves(leavesRes.data);

      if (role === 'MANAGER') {
        const empRes = await api.get('/employees');
        setAllEmployees(empRes.data);
        const attRes = await api.get('/attendance');
        setAllAttendance(attRes.data);
      } else if (employeeId) {
        const analyticsRes = await api.get(`/employees/${employeeId}/analytics`);
        setEmployeeData(analyticsRes.data);
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = async (dateStr, status, targetEmpId) => {
    try {
      setSubmittingStatus(`${targetEmpId}-${dateStr}`);
      await api.post('/attendance/mark', {
        employeeId: targetEmpId,
        date: dateStr,
        status: status
      });
      fetchData(); // Refresh all data
    } catch (error) {
      console.error("Error marking attendance:", error);
    } finally {
      setSubmittingStatus('');
      setMarkingDate(null);
    }
  };

  const handleSubmitLeave = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    if (!employeeId) {
      setError('Your account is not linked to an employee profile.');
      setSubmitting(false);
      return;
    }

    if (formData.startDate && formData.endDate && formData.endDate < formData.startDate) {
      setError('End date cannot be before start date.');
      setSubmitting(false);
      return;
    }

    try {
      await api.post('/leave-requests', {
        type: formData.type,
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason,
        status: 'PENDING',
        employee: { id: parseInt(employeeId) }
      });
      setIsModalOpen(false);
      setFormData({ type: 'Vacation', startDate: '', endDate: '', reason: '' });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit leave request.');
    } finally {
      setSubmitting(false);
    }
  };

  const updateLeaveStatus = async (id, status) => {
    try {
      await api.put(`/leave-requests/${id}/status?status=${status}`);
      fetchData();
    } catch (err) {
      alert('Could not update leave status.');
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <Loader2 className="animate-spin text-crewix-accent" size={32} />
    </div>
  );

  // --- EMPLOYEE VIEW COMPONENTS ---
  const renderEmployeeGrid = () => {
    if (!employeeData) return null;
    const attendance = employeeData.attendance || [];
    
    const days = [];
    for (let i = 364; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().split('T')[0]);
    }

    const getAttendanceColor = (dateStr) => {
      const record = attendance.find(a => a.date === dateStr);
      if (!record) return 'bg-gray-100 hover:bg-gray-200';
      if (record.status === 'PRESENT') return 'bg-green-400 hover:bg-green-500';
      if (record.status === 'LEAVE') return 'bg-yellow-400 hover:bg-yellow-500';
      if (record.status === 'ABSENT') return 'bg-red-400 hover:bg-red-500';
      return 'bg-gray-100';
    };

    return (
      <div className="bg-white/70 backdrop-blur-md rounded-[2rem] p-8 shadow-sm border border-white mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h3 className="text-xl font-bold text-gray-800">My Attendance History</h3>
            <p className="text-sm text-gray-500 mt-1">Track your daily presence and leaves.</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => handleMarkAttendance(todayStr, 'PRESENT', employeeId)} 
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-sm transition-colors"
            >
              <CheckCircle2 size={16} /> Mark Present Today
            </button>
            <button 
              onClick={() => handleMarkAttendance(todayStr, 'LEAVE', employeeId)} 
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-sm transition-colors"
            >
              <Umbrella size={16} /> Mark Leave Today
            </button>
          </div>
        </div>
        
        <div className="flex gap-4 text-xs font-bold text-gray-500 mb-4">
           <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-green-400"></div> Present</span>
           <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-yellow-400"></div> Leave</span>
           <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-red-400"></div> Absent</span>
        </div>
        
        <div className="overflow-x-auto pb-4">
          <div className="flex flex-wrap gap-1 w-[800px]">
            {days.map(dateStr => (
              <div key={dateStr} className="relative group">
                <div 
                  onClick={() => setMarkingDate(markingDate === dateStr ? null : dateStr)}
                  className={`w-4 h-4 rounded-sm cursor-pointer transition-colors ${getAttendanceColor(dateStr)}`}
                ></div>
                {markingDate === dateStr && (
                  <div className="absolute z-10 bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white rounded-xl shadow-xl border border-gray-200 p-2 w-32">
                    <p className="text-xs text-center font-bold text-gray-500 mb-2 border-b border-gray-100 pb-1">{dateStr}</p>
                    <div className="flex flex-col gap-1">
                      <button onClick={() => handleMarkAttendance(dateStr, 'PRESENT', employeeId)} className="text-[10px] font-bold text-white bg-green-500 hover:bg-green-600 px-2 py-1.5 rounded-lg">Mark Present</button>
                      <button onClick={() => handleMarkAttendance(dateStr, 'LEAVE', employeeId)} className="text-[10px] font-bold text-white bg-yellow-500 hover:bg-yellow-600 px-2 py-1.5 rounded-lg">Mark Leave</button>
                    </div>
                  </div>
                )}
                {markingDate !== dateStr && (
                  <div className="opacity-0 group-hover:opacity-100 pointer-events-none absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-1 bg-gray-800 text-white text-[10px] font-bold py-1 px-2 rounded-md whitespace-nowrap">
                    {dateStr}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // --- MANAGER VIEW COMPONENTS ---
  const renderManagerRollCall = () => {
    return (
      <div className="bg-white/70 backdrop-blur-md rounded-[2rem] p-8 shadow-sm border border-white mb-8">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Daily Roll Call (Today: {todayStr})</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-gray-100 bg-gray-50/50">
              <tr className="text-xs text-gray-400 uppercase tracking-wider">
                <th className="py-4 px-6 font-semibold">Employee</th>
                <th className="py-4 font-semibold">Department</th>
                <th className="py-4 font-semibold">Today's Status</th>
                <th className="py-4 font-semibold text-right">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {allEmployees.map(emp => {
                const todaysRecord = allAttendance.find(a => a.employee.id === emp.id && a.date === todayStr);
                const status = todaysRecord ? todaysRecord.status : 'NOT MARKED';
                
                return (
                  <tr key={emp.id} className="hover:bg-white/80 transition-colors">
                    <td className="py-4 px-6 font-bold text-sm text-gray-800">{emp.firstName} {emp.lastName}</td>
                    <td className="py-4 text-sm text-gray-600">{emp.department || '—'}</td>
                    <td className="py-4">
                      <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                        status === 'PRESENT' ? 'bg-green-100 text-green-700' :
                        status === 'LEAVE' ? 'bg-yellow-100 text-yellow-700' :
                        status === 'ABSENT' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-500'
                      }`}>
                        {status}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleMarkAttendance(todayStr, 'PRESENT', emp.id)} className="px-3 py-1 bg-green-50 text-green-600 hover:bg-green-500 hover:text-white rounded-lg text-xs font-bold transition-colors">P</button>
                        <button onClick={() => handleMarkAttendance(todayStr, 'ABSENT', emp.id)} className="px-3 py-1 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-lg text-xs font-bold transition-colors">A</button>
                        <button onClick={() => handleMarkAttendance(todayStr, 'LEAVE', emp.id)} className="px-3 py-1 bg-yellow-50 text-yellow-600 hover:bg-yellow-500 hover:text-white rounded-lg text-xs font-bold transition-colors">L</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Attendance & Leave Portal</h2>
          <p className="text-gray-500 text-sm mt-1">
            {role === 'MANAGER' ? 'Monitor daily attendance and action leave requests.' : 'Track your attendance history and submit leave requests.'}
          </p>
        </div>
        {role === 'EMPLOYEE' && (
          <button onClick={() => { setError(''); setIsModalOpen(true); }} className="bg-crewix-dark hover:bg-black text-white px-5 py-2.5 rounded-full flex items-center gap-2 shadow-sm transition-colors text-sm font-medium">
            <Plus size={18} /> Request Leave
          </button>
        )}
      </div>

      {role === 'EMPLOYEE' && !employeeId && (
        <div className="flex items-start gap-3 bg-orange-50 border border-orange-200 text-orange-700 p-4 rounded-2xl text-sm">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <div><p className="font-bold">Employee profile not linked</p><p className="mt-0.5">Please ask your manager to set up your profile.</p></div>
        </div>
      )}

      {/* Primary Attendance View based on Role */}
      {role === 'MANAGER' ? renderManagerRollCall() : renderEmployeeGrid()}

      {/* Leave Requests Section */}
      <div className="bg-white/70 backdrop-blur-md rounded-[2rem] p-6 shadow-sm border border-white">
        <h3 className="font-bold text-gray-800 mb-6">{role === 'MANAGER' ? 'Employee Leave Requests' : 'My Leave Requests'}</h3>
        
        {leaves.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Calendar size={48} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">No leave requests found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {leaves.map(leave => {
              const status = leave.status || 'PENDING';
              const empName = leave.employee ? `${leave.employee.firstName} ${leave.employee.lastName}` : 'Unknown';
              return (
                <div key={leave.id} className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-gray-50 gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${status === 'APPROVED' ? 'bg-green-50 text-green-500' : status === 'REJECTED' ? 'bg-red-50 text-red-400' : 'bg-orange-50 text-orange-500'}`}>
                    {status === 'APPROVED' ? <Check size={18} /> : status === 'REJECTED' ? <X size={18} /> : <Umbrella size={18} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    {role === 'MANAGER' && <p className="text-xs font-bold text-crewix-dark mb-0.5">{empName}</p>}
                    <p className="text-sm font-bold text-gray-800">{leave.type} Leave</p>
                    <p className="text-xs text-gray-400">{leave.startDate} → {leave.endDate}</p>
                    {leave.reason && <p className="text-xs text-gray-500 mt-0.5 italic truncate">"{leave.reason}"</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {role === 'MANAGER' && status === 'PENDING' && (
                      <>
                        <button onClick={() => updateLeaveStatus(leave.id, 'APPROVED')} className="flex items-center gap-1 bg-green-50 hover:bg-green-100 text-green-600 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"><Check size={12} /> Approve</button>
                        <button onClick={() => updateLeaveStatus(leave.id, 'REJECTED')} className="flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-500 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"><X size={12} /> Reject</button>
                      </>
                    )}
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold tracking-wider uppercase ${status === 'APPROVED' ? 'bg-green-100 text-green-700' : status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                      {status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Leave Request Modal */}
      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setError(''); }} title="Request Leave">
        <form onSubmit={handleSubmitLeave} className="space-y-4">
          {error && <div className="flex items-start gap-2 bg-red-50 text-red-600 p-3 rounded-xl text-sm border border-red-100"><AlertCircle size={15} className="shrink-0 mt-0.5" /><span>{error}</span></div>}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Leave Type</label>
            <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-crewix-accent text-sm text-gray-700">
              <option>Vacation</option><option>Sick</option><option>Personal</option>
            </select>
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-bold text-gray-700 mb-1">Start Date</label>
              <input type="date" required min={todayStr} value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-crewix-accent text-sm text-gray-600"/>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-bold text-gray-700 mb-1">End Date</label>
              <input type="date" required min={formData.startDate || todayStr} value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-crewix-accent text-sm text-gray-600"/>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Reason (optional)</label>
            <textarea rows="3" value={formData.reason} onChange={e => setFormData({ ...formData, reason: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-crewix-accent text-sm resize-none"/>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => { setIsModalOpen(false); setError(''); }} className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold py-2.5 rounded-xl transition-colors text-sm">Cancel</button>
            <button type="submit" disabled={submitting} className="flex-1 bg-crewix-dark hover:bg-black text-white font-bold py-2.5 rounded-xl transition-colors text-sm flex justify-center items-center gap-2">
              {submitting ? <Loader2 size={16} className="animate-spin" /> : 'Submit Request'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default LeaveManagement;
