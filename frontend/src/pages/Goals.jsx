import React from 'react';
import { Target, Plus, TrendingUp } from 'lucide-react';

const Goals = () => (
  <div className="space-y-6">
    <div className="flex justify-between items-center mb-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-800 tracking-tight">My Goals</h2>
        <p className="text-gray-500 text-sm mt-1">Track your personal and professional objectives.</p>
      </div>
      <button className="bg-crewix-dark hover:bg-black text-white px-5 py-2.5 rounded-full flex items-center gap-2 shadow-sm transition-colors text-sm font-medium">
        <Plus size={18} /> Add Goal
      </button>
    </div>

    {/* Placeholder cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[
        { title: 'Complete System Design course', progress: 65, due: '2026-10-01', type: 'Learning' },
        { title: 'Improve code review turnaround', progress: 40, due: '2026-09-30', type: 'Performance' },
        { title: 'Mentor a junior developer', progress: 20, due: '2026-12-31', type: 'Leadership' },
      ].map((goal, i) => (
        <div key={i} className="bg-white/70 backdrop-blur-md rounded-[2rem] p-6 shadow-sm border border-white">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 bg-crewix-light rounded-xl flex items-center justify-center text-crewix-accent">
              <Target size={20} />
            </div>
            <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded-full font-bold uppercase tracking-wider">{goal.type}</span>
          </div>
          <h3 className="font-bold text-gray-800 mb-4">{goal.title}</h3>
          <div className="space-y-1.5 mb-4">
            <div className="flex justify-between text-xs text-gray-500 font-medium">
              <span>Progress</span><span>{goal.progress}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-crewix-accent rounded-full transition-all" style={{ width: `${goal.progress}%` }} />
            </div>
          </div>
          <p className="text-xs text-gray-400">Due: {goal.due}</p>
        </div>
      ))}
    </div>
  </div>
);

export default Goals;
