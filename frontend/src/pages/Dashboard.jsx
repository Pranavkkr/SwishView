import React, { useState, useEffect } from 'react';
import { Users, Briefcase, CheckSquare, Target, Loader2, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const role = localStorage.getItem('role') || 'EMPLOYEE';
  const employeeId = parseInt(localStorage.getItem('employeeId'));

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [empRes, projRes, taskRes] = await Promise.all([
         api.get('/employees'),
         api.get('/projects'),
         api.get('/tasks')
      ]);

      const employees = empRes.data;
      const allProjects = projRes.data;
      const allTasks = taskRes.data;

      // Filter data for employees
      const tasks = role === 'MANAGER' ? allTasks : allTasks.filter(t => t.assignee?.id === employeeId || t.assigneeId === employeeId);
      const projects = role === 'MANAGER' ? allProjects : allProjects.filter(p => allTasks.some(t => (t.project?.id === p.id || t.projectId === p.id) && (t.assignee?.id === employeeId || t.assigneeId === employeeId)));

      const activeProjects = projects.filter(p => p.status && p.status.toUpperCase() === 'ACTIVE');
      const completedTasks = tasks.filter(t => t.status === 'COMPLETED');
      const completionRate = tasks.length ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

      // Calculate completed tasks per project for the chart
      const projectCompletionStats = projects.map(p => {
         const projTasks = completedTasks.filter(t => t.projectId === p.id);
         return { name: p.name.substring(0, 8) + (p.name.length > 8 ? '...' : ''), value: projTasks.length };
      }).filter(p => p.value > 0).slice(0, 7); // Show top 7 projects with completed tasks

      const now = new Date();
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(now.getDate() + 7);

      const urgentTasks = tasks.filter(t => {
         if (t.status === 'COMPLETED' || !t.dueDate) return false;
         const due = new Date(t.dueDate);
         return due <= sevenDaysFromNow;
      }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)).slice(0, 4);

      setStats({
          employees: employees.length,
          activeProjects: activeProjects.length,
          totalTasks: tasks.length,
          completedTasks: completedTasks.length,
          completionRate: completionRate,
          recentProjects: activeProjects.slice(-3).reverse(), // Show recent ACTIVE projects
          recentTasks: tasks.slice(-4).reverse(),
          urgentTasks: urgentTasks,
          projectCompletionStats: projectCompletionStats.length > 0 ? projectCompletionStats : [{ name: 'No Data', value: 0 }]
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-[80vh]"><Loader2 className="animate-spin text-crewix-accent" size={40}/></div>;

  if (!stats) return (
    <div className="flex flex-col justify-center items-center h-[80vh] text-center">
       <AlertCircle size={48} className="text-red-500 mb-4 opacity-50" />
       <h2 className="text-2xl font-bold text-gray-800">Connection Error</h2>
       <p className="text-gray-500 mt-2 max-w-sm">The server appears to be offline or restarting. Please wait a moment and refresh the page.</p>
    </div>
  );

  const statCards = [
    { title: role === 'MANAGER' ? 'Total Employees' : 'My Active Projects', value: role === 'MANAGER' ? (stats?.employees || 0) : (stats?.activeProjects || 0), icon: role === 'MANAGER' ? <Users size={24} /> : <Briefcase size={24} />, color: 'bg-blue-50 text-blue-500' },
    { title: role === 'MANAGER' ? 'Active Projects' : 'My Pending Tasks', value: role === 'MANAGER' ? (stats?.activeProjects || 0) : (stats?.totalTasks - stats?.completedTasks || 0), icon: role === 'MANAGER' ? <Briefcase size={24} /> : <Clock size={24} />, color: 'bg-purple-50 text-purple-500' },
    { title: role === 'MANAGER' ? 'Tasks Assigned' : 'My Completed Tasks', value: role === 'MANAGER' ? (stats?.totalTasks || 0) : (stats?.completedTasks || 0), icon: <CheckSquare size={24} />, color: 'bg-orange-50 text-orange-500' },
    { title: 'Completion Rate', value: `${stats?.completionRate || 0}%`, icon: <Target size={24} />, color: 'bg-green-50 text-green-500' },
  ];

  // Find max value for chart scaling
  const maxChartValue = Math.max(...(stats?.projectCompletionStats?.map(d => d.value) || [1])) || 1;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-gray-800 tracking-tight">Dashboard Overview</h2>
          <p className="text-gray-500 text-sm mt-2 font-medium">Real-time metrics and activity across the organization.</p>
        </div>
        <button className="bg-crewix-dark hover:bg-black text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-md transition-colors flex items-center gap-2">
          <TrendingUp size={16} /> Generate Report
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white/70 backdrop-blur-xl rounded-[2rem] p-6 shadow-sm border border-white hover:shadow-lg transition-all hover:-translate-y-1 relative overflow-hidden group">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm transition-transform group-hover:scale-110 ${stat.color}`}>
              {stat.icon}
            </div>
            <h3 className="text-4xl font-black text-gray-800 mb-1">{stat.value}</h3>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{stat.title}</p>
            {/* Decorative background element */}
            <div className={`absolute -bottom-10 -right-10 w-32 h-32 rounded-full opacity-10 blur-2xl ${stat.color.split(' ')[0]}`}></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Activity Chart Section (Left 2 Columns) */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] p-8 shadow-sm border border-white relative overflow-hidden">
             <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                   <TrendingUp className="text-crewix-accent" /> Completed Tasks by Project
                </h3>
             </div>
             
             <div className="h-64 flex items-end justify-between gap-4 px-2 pb-4 border-b-2 border-gray-100 relative">
                {/* Horizontal Grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between pb-4 opacity-5 pointer-events-none z-0">
                   {[1,2,3,4,5].map(i => <div key={i} className="border-t-2 border-gray-800 w-full"></div>)}
                </div>
                
                {/* Real Data Bars */}
                {stats?.projectCompletionStats?.map((data, index) => {
                  const heightPercent = data.value === 0 ? 0 : Math.max(10, (data.value / maxChartValue) * 100);
                  return (
                    <div key={index} className="flex flex-col items-center flex-1 z-10 group h-full justify-end">
                      <div className="w-full relative flex items-end justify-center h-full pb-2">
                        <div 
                          className="w-full max-w-[48px] bg-gradient-to-t from-crewix-accent to-[#7b5cff] rounded-t-xl transition-all duration-500 group-hover:opacity-80 shadow-md group-hover:shadow-xl relative"
                          style={{ height: `${heightPercent}%` }}
                        >
                          {/* Tooltip */}
                          <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[11px] font-black py-1.5 px-3 rounded-lg shadow-xl whitespace-nowrap transition-all duration-300 pointer-events-none z-50 scale-95 group-hover:scale-100">
                            {data.value} Completed
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-black text-gray-400 mt-3 tracking-widest uppercase truncate w-full text-center">{data.name}</span>
                    </div>
                  );
                })}
             </div>
          </div>

          {/* Recent Tasks */}
          <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] p-8 shadow-sm border border-white">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Recent Tasks</h3>
                <Link to="/tasks" className="text-sm font-bold text-crewix-accent hover:underline">View All</Link>
             </div>
             <div className="space-y-3">
                {stats?.recentTasks?.map(task => (
                  <div key={task.id} className="flex items-center justify-between p-4 bg-gray-50/50 hover:bg-white rounded-2xl border border-gray-100 transition-colors">
                     <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${task.status === 'COMPLETED' ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                        <p className="text-sm font-bold text-gray-700">{task.title}</p>
                     </div>
                     <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">{task.status}</span>
                  </div>
                ))}
                {(!stats?.recentTasks || stats.recentTasks.length === 0) && (
                   <p className="text-sm text-gray-400 py-4 text-center font-medium">No tasks found.</p>
                )}
             </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
           
           {/* Task Deadline Alerts */}
           <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] p-8 shadow-sm border border-red-100">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2"><AlertCircle className="text-red-500"/> Urgent Deadlines</h3>
                <Link to="/tasks" className="text-sm font-bold text-red-500 hover:underline">View All</Link>
             </div>
             
             <div className="space-y-4">
                {stats?.urgentTasks?.map(task => {
                   const isOverdue = new Date(task.dueDate) < new Date();
                   return (
                   <div key={task.id} className="group cursor-pointer bg-red-50/50 hover:bg-red-50 p-4 rounded-2xl border border-red-100 transition-colors">
                      <div className="flex justify-between items-start mb-1">
                         <div>
                            <h4 className="font-bold text-sm text-gray-800">{task.title}</h4>
                            <p className={`text-xs font-bold mt-1 flex items-center gap-1 ${isOverdue ? 'text-red-500' : 'text-orange-500'}`}>
                               <Clock size={12}/> {isOverdue ? 'Overdue:' : 'Due:'} {task.dueDate}
                            </p>
                         </div>
                         <span className={`text-[9px] px-2 py-1 rounded font-black tracking-wider uppercase ${isOverdue ? 'bg-red-500 text-white' : 'bg-orange-500 text-white'}`}>
                            {isOverdue ? 'Overdue' : 'Approaching'}
                         </span>
                      </div>
                   </div>
                )})}
                {(!stats?.urgentTasks || stats.urgentTasks.length === 0) && (
                   <div className="text-center py-6 bg-green-50/50 rounded-2xl border border-green-100">
                      <CheckSquare size={24} className="mx-auto text-green-500 mb-2"/>
                      <p className="text-sm text-green-700 font-bold">No urgent or overdue tasks!</p>
                   </div>
                )}
             </div>
           </div>

           {/* Active Projects Feed */}
           <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] p-8 shadow-sm border border-white">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Active Projects</h3>
                <Link to="/projects" className="text-sm font-bold text-crewix-accent hover:underline">View All</Link>
             </div>
             
             <div className="space-y-4">
                {stats?.recentProjects?.map(project => (
                   <div key={project.id} className="group cursor-pointer">
                      <div className="flex justify-between items-start mb-2">
                         <div>
                            <h4 className="font-bold text-sm text-gray-800 group-hover:text-crewix-accent transition-colors">{project.name}</h4>
                            <p className="text-xs text-gray-400 font-medium mt-1 flex items-center gap-1"><Clock size={12}/> Due: {project.endDate || 'Ongoing'}</p>
                         </div>
                         <span className="text-[9px] bg-crewix-accent/10 text-crewix-accent px-2 py-1 rounded font-black tracking-wider uppercase">Active</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5 mt-3">
                         <div className="bg-crewix-accent h-1.5 rounded-full w-[65%]"></div>
                      </div>
                   </div>
                ))}
                {(!stats?.recentProjects || stats.recentProjects.length === 0) && (
                   <div className="text-center py-6">
                      <AlertCircle size={24} className="mx-auto text-gray-300 mb-2"/>
                      <p className="text-sm text-gray-400 font-medium">No active projects right now.</p>
                   </div>
                )}
             </div>
           </div>

           {/* Quick Action Widget */}
           {role === 'MANAGER' && (
             <div className="bg-gradient-to-br from-crewix-dark to-[#2a2d3e] rounded-[2rem] p-8 shadow-lg text-white relative overflow-hidden">
                <div className="relative z-10">
                   <h3 className="text-xl font-black mb-2">Need to assign work?</h3>
                   <p className="text-sm text-gray-300 mb-6 font-medium">Create a new task and assign it to your team instantly.</p>
                   <Link to="/tasks" className="inline-block bg-white text-crewix-dark font-black text-sm px-6 py-3 rounded-full hover:bg-gray-50 transition-colors shadow-md hover:shadow-lg">
                      Create Task
                   </Link>
                </div>
                {/* Decorative shapes */}
                <div className="absolute -top-12 -right-12 w-40 h-40 bg-white opacity-5 rounded-full"></div>
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white opacity-5 rounded-full"></div>
             </div>
           )}

        </div>

      </div>
    </div>
  );
};

export default Dashboard;
