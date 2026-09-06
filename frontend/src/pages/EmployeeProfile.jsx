import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Mail, Briefcase, Calendar, Loader2, Target, CheckSquare, XCircle, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import Avatar from '../components/Avatar';

const EmployeeProfile = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [markingDate, setMarkingDate] = useState(null);
  const [submittingStatus, setSubmittingStatus] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, [id]);

  const fetchAnalytics = async () => {
    try {
      const response = await api.get(`/employees/${id}/analytics`);
      setData(response.data);
    } catch (error) {
      console.error("Error fetching employee analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = async (dateStr, status) => {
    try {
      setSubmittingStatus(dateStr);
      await api.post('/attendance/mark', {
        employeeId: id,
        date: dateStr,
        status: status
      });
      fetchAnalytics();
    } catch (error) {
      console.error("Error marking attendance:", error);
    } finally {
      setSubmittingStatus('');
      setMarkingDate(null);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-crewix-accent" size={32}/></div>;
  if (!data || !data.employee) return <div className="text-center py-10 text-gray-500">Employee not found.</div>;

  const { employee, tasks, productivityScore, attendance } = data;

  // Generate last 365 days for GitHub style grid
  const today = new Date();
  const days = [];
  for (let i = 364; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }

  const getAttendanceColor = (dateStr) => {
    const record = attendance.find(a => a.date === dateStr);
    if (!record) return 'bg-gray-100 hover:bg-gray-200'; // No record = implicit present/unknown
    if (record.status === 'PRESENT') return 'bg-green-400 hover:bg-green-500';
    if (record.status === 'LEAVE') return 'bg-yellow-400 hover:bg-yellow-500';
    if (record.status === 'ABSENT') return 'bg-red-400 hover:bg-red-500';
    return 'bg-gray-100 hover:bg-gray-200';
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <Link to="/employees" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-crewix-accent transition-colors">
        <ArrowLeft size={16} /> Back to Directory
      </Link>
      
      {/* Profile Header */}
      <div className="bg-white/70 backdrop-blur-md rounded-[2rem] p-8 shadow-sm border border-white">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <Avatar name={`${employee.firstName} ${employee.lastName}`} size="3xl" className="shadow-md" />
          
          <div className="flex-1 space-y-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">{employee.firstName} {employee.lastName}</h2>
              <p className="text-crewix-accent font-medium mt-1">{employee.designation || 'Employee'}</p>
            </div>
            
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                <Briefcase size={16} className="text-gray-400" /> {employee.department || 'N/A'}
              </div>
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                <Mail size={16} className="text-gray-400" /> {employee.email}
              </div>
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                <Calendar size={16} className="text-gray-400" /> Joined {employee.joiningDate || 'N/A'}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100 text-center min-w-[150px]">
             <h3 className="text-4xl font-black text-crewix-accent mb-1">{productivityScore}%</h3>
             <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Productivity</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Attendance Grid */}
        <div className="lg:col-span-2 bg-white/70 backdrop-blur-md rounded-[2rem] p-8 shadow-sm border border-white">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-800">Attendance & Leaves</h3>
            <div className="flex gap-4 text-xs font-bold text-gray-500">
               <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-green-400"></div> Present</span>
               <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-yellow-400"></div> Leave</span>
               <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-red-400"></div> Absent</span>
            </div>
          </div>
          
          <div className="overflow-x-auto pb-4">
            <div className="flex flex-wrap gap-1 w-[800px]">
              {days.map(dateStr => (
                <div key={dateStr} className="relative group">
                  <div 
                    onClick={() => setMarkingDate(markingDate === dateStr ? null : dateStr)}
                    className={`w-4 h-4 rounded-sm cursor-pointer transition-colors ${getAttendanceColor(dateStr)}`}
                  ></div>
                  
                  {/* Tooltip & Actions */}
                  {markingDate === dateStr && (
                    <div className="absolute z-10 bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white rounded-xl shadow-xl border border-gray-200 p-2 w-32">
                      <p className="text-xs text-center font-bold text-gray-500 mb-2 border-b border-gray-100 pb-1">{dateStr}</p>
                      <div className="flex flex-col gap-1">
                        <button onClick={() => handleMarkAttendance(dateStr, 'PRESENT')} className="text-[10px] font-bold text-white bg-green-500 hover:bg-green-600 px-2 py-1.5 rounded-lg flex items-center justify-center gap-1">
                          {submittingStatus === dateStr ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12}/>} Mark Present
                        </button>
                        <button onClick={() => handleMarkAttendance(dateStr, 'LEAVE')} className="text-[10px] font-bold text-white bg-yellow-500 hover:bg-yellow-600 px-2 py-1.5 rounded-lg flex items-center justify-center gap-1">
                           Mark Leave
                        </button>
                        <button onClick={() => handleMarkAttendance(dateStr, 'ABSENT')} className="text-[10px] font-bold text-white bg-red-500 hover:bg-red-600 px-2 py-1.5 rounded-lg flex items-center justify-center gap-1">
                           Mark Absent
                        </button>
                      </div>
                    </div>
                  )}
                  {markingDate !== dateStr && (
                    <div className="opacity-0 group-hover:opacity-100 pointer-events-none absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-1 bg-gray-800 text-white text-[10px] font-bold py-1 px-2 rounded-md whitespace-nowrap transition-opacity">
                      {dateStr}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tasks List */}
        <div className="bg-white/70 backdrop-blur-md rounded-[2rem] p-8 shadow-sm border border-white">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <CheckSquare className="text-crewix-accent" /> Assigned Tasks
          </h3>
          <div className="space-y-4">
            {tasks && tasks.length > 0 ? (
              tasks.map(task => (
                <div key={task.id} className="bg-gray-50 p-4 rounded-2xl border border-gray-100 hover:border-crewix-accent/30 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-sm text-gray-800">{task.title}</h4>
                    <span className={`text-[9px] px-2 py-0.5 rounded uppercase font-black tracking-wider ${
                      task.status === 'COMPLETED' ? 'bg-green-100 text-green-600' : 
                      task.status === 'REVIEW' ? 'bg-orange-100 text-orange-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {task.status || 'TO DO'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2">{task.description}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400 text-center py-8">No tasks assigned yet.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default EmployeeProfile;
