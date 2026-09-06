import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, ChevronRight, Loader2 } from 'lucide-react';
import api from '../services/api';

const Onboarding = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await api.get('/onboarding-tasks');
      setTasks(response.data);
    } catch (error) {
      console.error("Error fetching onboarding tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-crewix-accent" size={32}/></div>;

  const completedTasks = tasks.filter(t => t.isCompleted).length;
  const totalTasks = tasks.length || 1; // prevent div by zero
  const progress = Math.round((completedTasks / totalTasks) * 100);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Onboarding Tracker</h2>
          <p className="text-gray-500 text-sm mt-1">Get up to speed with your new role.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white/70 backdrop-blur-md rounded-[2rem] p-6 shadow-sm border border-white flex flex-col items-center justify-center text-center">
            <div className="relative w-32 h-32 mb-4">
               <svg className="w-full h-full transform -rotate-90">
                  <circle cx="64" cy="64" r="56" className="stroke-gray-100" strokeWidth="12" fill="none" />
                  <circle cx="64" cy="64" r="56" className="stroke-crewix-accent" strokeWidth="12" fill="none" strokeDasharray="351.85" strokeDashoffset={351.85 - (351.85 * progress) / 100} style={{ transition: 'stroke-dashoffset 1s ease-in-out' }} />
               </svg>
               <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-2xl font-black text-gray-800">{progress}%</span>
               </div>
            </div>
            <h3 className="font-bold text-gray-800">Completion Status</h3>
            <p className="text-sm text-gray-500 mt-1">{completedTasks} of {tasks.length} tasks done</p>
         </div>

         <div className="md:col-span-2 bg-white/70 backdrop-blur-md rounded-[2rem] p-6 shadow-sm border border-white">
            <h3 className="font-bold text-gray-800 mb-6">Your Checklist</h3>
            <div className="space-y-3">
               {tasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-gray-50 hover:shadow-md transition-shadow cursor-pointer group">
                     <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${task.isCompleted ? 'bg-crewix-accent text-white' : 'bg-gray-100 text-gray-400 group-hover:text-crewix-accent'}`}>
                           {task.isCompleted ? <CheckCircle size={16} /> : <div className="w-3 h-3 rounded-full border-2 border-current"></div>}
                        </div>
                        <div>
                           <p className={`text-sm font-bold transition-colors ${task.isCompleted ? 'text-gray-400 line-through' : 'text-gray-800'}`}>{task.title}</p>
                           <p className="text-xs text-gray-500 mt-0.5">{task.description}</p>
                        </div>
                     </div>
                     <ChevronRight size={18} className="text-gray-300 group-hover:text-crewix-accent transition-colors" />
                  </div>
               ))}
               {tasks.length === 0 && (
                   <p className="text-gray-500 text-center py-4">No onboarding tasks assigned.</p>
               )}
            </div>
         </div>
      </div>
    </div>
  );
};
export default Onboarding;
