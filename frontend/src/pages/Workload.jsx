import React, { useState, useEffect } from 'react';
import { Activity, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import api from '../services/api';
import Avatar from '../components/Avatar';

const Workload = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees');
      setEmployees(response.data);
    } catch (error) {
      console.error("Error fetching employees:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-crewix-accent" size={32}/></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Team Workload</h2>
          <p className="text-gray-500 text-sm mt-1">Monitor capacity and distribute work evenly.</p>
        </div>
      </div>

      <div className="bg-white/70 backdrop-blur-md rounded-[2rem] p-6 shadow-sm border border-white">
         <div className="space-y-6">
            {employees.map((emp) => {
               // Mock workload calculation for now
               const workload = Math.floor(Math.random() * 120) + 10;
               return (
               <div key={emp.id} className="p-4 bg-white rounded-2xl border border-gray-50 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                     <div className="flex items-center gap-3">
                        <Avatar name={`${emp.firstName} ${emp.lastName}`} size="md" />
                        <div>
                           <p className="text-sm font-bold text-gray-800">{emp.firstName} {emp.lastName}</p>
                           <p className="text-xs text-gray-500">{emp.role}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-2">
                        {workload > 100 ? <AlertTriangle size={16} className="text-red-500" /> : <CheckCircle size={16} className="text-green-500" />}
                        <span className={`text-xs font-bold ${workload > 100 ? 'text-red-500' : 'text-gray-600'}`}>{workload}% Capacity</span>
                     </div>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                     <div className={`h-full rounded-full ${workload > 100 ? 'bg-red-500' : workload > 80 ? 'bg-orange-400' : 'bg-crewix-accent'}`} style={{ width: `${Math.min(workload, 100)}%` }}></div>
                  </div>
               </div>
            )})}
            {employees.length === 0 && (
                <p className="text-gray-500 text-center py-4">No employees found.</p>
            )}
         </div>
      </div>
    </div>
  );
};
export default Workload;
