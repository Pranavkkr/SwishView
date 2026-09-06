import React, { useState, useEffect } from 'react';
import { FileText, Download, BarChart2, Loader2, X, Activity, Calendar, CheckCircle2, AlertTriangle, Briefcase, Users, LayoutDashboard, PieChart, TrendingUp, CheckSquare } from 'lucide-react';
import api from '../services/api';
import Modal from '../components/Modal';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [reportType, setReportType] = useState('Project Status');
  const [dateRange, setDateRange] = useState('Last 30 Days');
  const [department, setDepartment] = useState('All Departments');
  const [statusFilter, setStatusFilter] = useState('All');
  const [format, setFormat] = useState('PDF');
  const employeeId = parseInt(localStorage.getItem('employeeId'));

  // Report Viewer State
  const [viewingReport, setViewingReport] = useState(null);
  const [projectData, setProjectData] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await api.get('/saved-reports');
      setReports(response.data);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    setGenerating(true);
    try {
      const newReport = {
        name: `${reportType} Report`,
        type: reportType,
        generatedDate: new Date().toISOString().split('T')[0],
        generatedBy: { id: employeeId || 1 }
      };
      const res = await api.post('/saved-reports', newReport);
      await fetchReports();
      alert('Report generated and saved!');
      handleViewReport(res.data);
    } catch (error) {
      console.error("Error generating report:", error);
      alert('Failed to generate report.');
    } finally {
      setGenerating(false);
    }
  };

  const handleViewReport = async (report) => {
    setViewingReport(report);
    setLoadingData(true);
    try {
      if (report.type === 'Project Status') {
        const res = await api.get('/projects');
        setProjectData(res.data);
      } else if (report.type === 'Employee Productivity' || report.type === 'Team Performance') {
        const [empRes, taskRes] = await Promise.all([api.get('/employees'), api.get('/tasks')]);
        setEmpData(empRes.data);
        setTaskData(taskRes.data);
      } else if (report.type === 'Leave Balances') {
        const empRes = await api.get('/employees');
        setEmpData(empRes.data);
      }
    } catch (err) {
      console.error("Error fetching report data", err);
    } finally {
      setLoadingData(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-crewix-accent" size={32}/></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Reports & Analytics</h2>
          <p className="text-gray-500 text-sm mt-1">Generate and view organization insights to industry standards.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {/* Generator Form */}
         <div className="bg-white/70 backdrop-blur-md rounded-[2rem] p-6 shadow-sm border border-white">
            <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2"><BarChart2 size={18} className="text-crewix-accent"/> Generate Report</h3>
            <div className="space-y-4">
               <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Report Type</label>
                    <select value={reportType} onChange={e => setReportType(e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-crewix-accent text-gray-700">
                       <option>Project Status</option>
                       <option>Employee Productivity</option>
                       <option>Team Performance</option>
                       <option>Leave Balances</option>
                    </select>
                 </div>
                 <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Date Range</label>
                    <select value={dateRange} onChange={e => setDateRange(e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-crewix-accent text-gray-700">
                       <option>Last 30 Days</option>
                       <option>This Quarter</option>
                       <option>Year to Date</option>
                    </select>
                 </div>
                 <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Department</label>
                    <select value={department} onChange={e => setDepartment(e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-crewix-accent text-gray-700">
                       <option>All Departments</option>
                       <option>Engineering</option>
                       <option>Design</option>
                       <option>Sales</option>
                       <option>HR</option>
                    </select>
                 </div>
                 <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Status Filter</label>
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-crewix-accent text-gray-700">
                       <option>All</option>
                       <option>Active / Pending</option>
                       <option>Completed / Approved</option>
                    </select>
                 </div>
               </div>
               <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2 mt-4">Export Format</label>
                  <div className="flex gap-4">
                    {['PDF', 'Excel', 'CSV'].map(f => (
                      <label key={f} className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl border cursor-pointer font-bold text-sm transition-colors ${format === f ? 'bg-crewix-accent/10 border-crewix-accent text-crewix-accent' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                        <input type="radio" name="format" value={f} checked={format === f} onChange={() => setFormat(f)} className="hidden" />
                        {f}
                      </label>
                    ))}
                  </div>
               </div>
               <button onClick={handleGenerateReport} disabled={generating} className="w-full flex justify-center items-center gap-2 bg-crewix-dark hover:bg-black text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all active:scale-95 mt-4">
                  {generating ? <Loader2 size={18} className="animate-spin" /> : 'Generate & View Report'}
               </button>
            </div>
         </div>

         {/* Saved Reports */}
         <div className="bg-white/70 backdrop-blur-md rounded-[2rem] p-6 shadow-sm border border-white">
            <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2"><FileText size={18} className="text-crewix-accent"/> Saved Reports</h3>
            <div className="space-y-3 h-64 overflow-y-auto pr-2">
               {reports.slice().reverse().map(report => (
                  <div key={report.id} onClick={() => handleViewReport(report)} className="flex justify-between items-center p-4 bg-white rounded-2xl border border-gray-50 shadow-sm hover:shadow-md hover:border-crewix-accent/30 transition-all cursor-pointer">
                     <div>
                        <p className="text-sm font-bold text-gray-800">{report.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{report.generatedDate} • {report.type}</p>
                     </div>
                     <button className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-crewix-accent hover:text-white transition-colors">
                        <FileText size={14} />
                     </button>
                  </div>
               ))}
               {reports.length === 0 && (
                   <div className="text-center py-10">
                     <FileText size={32} className="mx-auto text-gray-300 mb-3" />
                     <p className="text-gray-500 text-sm font-medium">No saved reports yet.</p>
                   </div>
               )}
            </div>
         </div>
      </div>

      {/* Report Viewer Modal */}
      {viewingReport && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-crewix-accent/10 text-crewix-accent flex items-center justify-center">
                  <BarChart2 size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-800">{viewingReport.name}</h2>
                  <p className="text-xs text-gray-500 font-medium">Generated on {viewingReport.generatedDate} • {viewingReport.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-colors">
                  <Download size={16} /> Export PDF
                </button>
                <button onClick={() => setViewingReport(null)} className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-red-50 hover:text-red-500 text-gray-500 rounded-xl transition-colors">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 overflow-y-auto bg-white flex-1">
              {loadingData ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-4">
                  <Loader2 className="animate-spin" size={32}/>
                  <p className="font-medium text-sm">Compiling industry standard report...</p>
                </div>
              ) : viewingReport.type === 'Project Status' ? (
                <div className="space-y-8">
                  
                  {/* Executive Summary Cards */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">1. Executive Summary</h3>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="bg-blue-50/50 border border-blue-100 p-5 rounded-2xl">
                        <div className="text-blue-500 mb-2"><Briefcase size={20}/></div>
                        <p className="text-2xl font-black text-gray-800">{projectData.length}</p>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-1">Total Projects</p>
                      </div>
                      <div className="bg-green-50/50 border border-green-100 p-5 rounded-2xl">
                        <div className="text-green-500 mb-2"><CheckCircle2 size={20}/></div>
                        <p className="text-2xl font-black text-gray-800">{projectData.filter(p => p.status === 'COMPLETED').length}</p>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-1">Completed</p>
                      </div>
                      <div className="bg-orange-50/50 border border-orange-100 p-5 rounded-2xl">
                        <div className="text-orange-500 mb-2"><Activity size={20}/></div>
                        <p className="text-2xl font-black text-gray-800">{projectData.filter(p => p.status === 'ACTIVE').length}</p>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-1">In Progress</p>
                      </div>
                      <div className="bg-purple-50/50 border border-purple-100 p-5 rounded-2xl">
                        <div className="text-purple-500 mb-2"><AlertTriangle size={20}/></div>
                        <p className="text-2xl font-black text-gray-800">
                           {projectData.length > 0 ? Math.round((projectData.filter(p => p.status === 'COMPLETED').length / projectData.length) * 100) : 0}%
                        </p>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-1">Completion Rate</p>
                      </div>
                    </div>
                  </div>

                  {/* Portfolio Details */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">2. Project Portfolio Breakdown</h3>
                    <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
                      <table className="w-full text-left bg-white">
                        <thead className="bg-gray-50">
                          <tr className="text-xs uppercase tracking-wider text-gray-500 border-b border-gray-200">
                            <th className="px-6 py-4 font-bold">Project Name</th>
                            <th className="px-6 py-4 font-bold">Status</th>
                            <th className="px-6 py-4 font-bold">Start Date</th>
                            <th className="px-6 py-4 font-bold">End Date</th>
                            <th className="px-6 py-4 font-bold">Timeline Health</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {projectData.map(project => {
                            const isDelayed = project.status === 'ACTIVE' && project.endDate && new Date(project.endDate) < new Date();
                            return (
                            <tr key={project.id} className="hover:bg-gray-50/50 transition-colors">
                              <td className="px-6 py-4">
                                <p className="font-bold text-gray-800 text-sm">{project.name}</p>
                                <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[200px]">{project.description}</p>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`text-[10px] px-2.5 py-1 rounded-md font-bold uppercase tracking-wider ${
                                  project.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                  project.status === 'ACTIVE' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                                }`}>
                                  {project.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600 font-medium">{project.startDate || 'TBD'}</td>
                              <td className="px-6 py-4 text-sm text-gray-600 font-medium">{project.endDate || 'TBD'}</td>
                              <td className="px-6 py-4">
                                {isDelayed ? (
                                  <span className="flex items-center gap-1.5 text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-md w-fit">
                                    <AlertTriangle size={12}/> Overdue
                                  </span>
                                ) : project.status === 'COMPLETED' ? (
                                  <span className="flex items-center gap-1.5 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md w-fit">
                                    <CheckCircle2 size={12}/> On Track
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md w-fit">
                                    <Activity size={12}/> In Progress
                                  </span>
                                )}
                              </td>
                            </tr>
                          )})}
                          {projectData.length === 0 && (
                            <tr><td colSpan="5" className="px-6 py-10 text-center text-gray-500 font-medium">No projects to report.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Analysis Notes */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">3. Strategic Insights & Recommendations</h3>
                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                      <ul className="space-y-3 text-sm text-gray-700 leading-relaxed list-disc pl-5">
                        <li><strong>Portfolio Health:</strong> Overall project portfolio health remains stable with {projectData.filter(p => p.status === 'ACTIVE').length} active concurrent initiatives.</li>
                        <li><strong>Risk Assessment:</strong> Projects past their designated end date represent potential bottleneck risks and should be audited immediately for scope creep.</li>
                        <li><strong>Resource Allocation:</strong> Consider transitioning resources from COMPLETED sectors towards PLANNING phase projects to maintain high velocity pipeline standards.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              ) : viewingReport.type === 'Employee Productivity' ? (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">1. Productivity Overview</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-purple-50/50 border border-purple-100 p-5 rounded-2xl">
                        <div className="text-purple-500 mb-2"><Users size={20}/></div>
                        <p className="text-2xl font-black text-gray-800">{empData.length}</p>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-1">Total Workforce</p>
                      </div>
                      <div className="bg-blue-50/50 border border-blue-100 p-5 rounded-2xl">
                        <div className="text-blue-500 mb-2"><CheckSquare size={20}/></div>
                        <p className="text-2xl font-black text-gray-800">{taskData.filter(t => t.status === 'COMPLETED').length}</p>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-1">Tasks Completed</p>
                      </div>
                      <div className="bg-green-50/50 border border-green-100 p-5 rounded-2xl">
                        <div className="text-green-500 mb-2"><TrendingUp size={20}/></div>
                        <p className="text-2xl font-black text-gray-800">
                           {taskData.length ? Math.round((taskData.filter(t => t.status === 'COMPLETED').length / taskData.length) * 100) : 0}%
                        </p>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-1">Org Velocity</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">2. Employee Performance Metrics</h3>
                    <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
                      <table className="w-full text-left bg-white">
                        <thead className="bg-gray-50">
                          <tr className="text-xs uppercase tracking-wider text-gray-500 border-b border-gray-200">
                            <th className="px-6 py-4 font-bold">Employee</th>
                            <th className="px-6 py-4 font-bold">Role</th>
                            <th className="px-6 py-4 font-bold">Tasks Completed</th>
                            <th className="px-6 py-4 font-bold">Pending Tasks</th>
                            <th className="px-6 py-4 font-bold">Efficiency Score</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {empData.map(emp => {
                            const myTasks = taskData.filter(t => t.assigneeId === emp.id);
                            const completed = myTasks.filter(t => t.status === 'COMPLETED').length;
                            const pending = myTasks.length - completed;
                            const score = myTasks.length ? Math.round((completed / myTasks.length) * 100) : 0;
                            return (
                              <tr key={emp.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4 font-bold text-sm text-gray-800">{emp.firstName} {emp.lastName}</td>
                                <td className="px-6 py-4 text-xs text-gray-500 font-medium">{emp.designation || 'Staff'}</td>
                                <td className="px-6 py-4 text-sm font-bold text-green-600">{completed}</td>
                                <td className="px-6 py-4 text-sm font-bold text-orange-500">{pending}</td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-2">
                                    <div className="w-full bg-gray-100 rounded-full h-1.5"><div className="bg-crewix-accent h-1.5 rounded-full" style={{width: `${score}%`}}></div></div>
                                    <span className="text-xs font-bold text-gray-600">{score}%</span>
                                  </div>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : viewingReport.type === 'Team Performance' ? (
                <div className="space-y-8">
                  <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-4 bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
                    <PieChart size={48} className="opacity-30 text-crewix-accent" />
                    <p className="font-bold text-gray-600">Cross-Functional Team Velocity</p>
                    <p className="text-xs font-medium text-gray-400 text-center max-w-md">Aggregated team metrics are calculated at the end of each sprint cycle. Ensure all team leaders have submitted their end-of-week reviews to generate this matrix.</p>
                  </div>
                </div>
              ) : viewingReport.type === 'Leave Balances' ? (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">1. Department Leave Liabilities</h3>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="bg-blue-50/50 border border-blue-100 p-5 rounded-2xl">
                        <p className="text-2xl font-black text-gray-800">{empData.length * 15}</p>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-1">Total Available Days</p>
                      </div>
                      <div className="bg-orange-50/50 border border-orange-100 p-5 rounded-2xl">
                        <p className="text-2xl font-black text-gray-800">12%</p>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-1">Current Utilization</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">2. Accrual Register</h3>
                    <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
                      <table className="w-full text-left bg-white">
                        <thead className="bg-gray-50">
                          <tr className="text-xs uppercase tracking-wider text-gray-500 border-b border-gray-200">
                            <th className="px-6 py-4 font-bold">Employee</th>
                            <th className="px-6 py-4 font-bold">Department</th>
                            <th className="px-6 py-4 font-bold">Annual Allowance</th>
                            <th className="px-6 py-4 font-bold">Taken</th>
                            <th className="px-6 py-4 font-bold">Remaining</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {empData.map(emp => (
                            <tr key={emp.id} className="hover:bg-gray-50/50 transition-colors">
                              <td className="px-6 py-4 font-bold text-sm text-gray-800">{emp.firstName} {emp.lastName}</td>
                              <td className="px-6 py-4 text-xs text-gray-500 font-medium">{emp.department || 'General'}</td>
                              <td className="px-6 py-4 text-sm font-medium text-gray-600">15 Days</td>
                              <td className="px-6 py-4 text-sm font-medium text-gray-600">2 Days</td>
                              <td className="px-6 py-4 text-sm font-bold text-crewix-accent">13 Days</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-4">
                  <LayoutDashboard size={48} className="opacity-30" />
                  <p className="font-medium text-sm">Detailed template for {viewingReport.type} is under development.</p>
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 text-center text-xs text-gray-400 font-medium">
              Confidential & Proprietary • SwishView Enterprise Reporting System • Generated on {viewingReport.generatedDate}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Reports;
