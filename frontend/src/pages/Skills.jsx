import React from 'react';
import { Brain, Plus, Star } from 'lucide-react';

const skillsList = [
  { name: 'React', level: 85, category: 'Frontend' },
  { name: 'Spring Boot', level: 70, category: 'Backend' },
  { name: 'System Design', level: 55, category: 'Architecture' },
  { name: 'SQL / Databases', level: 75, category: 'Data' },
  { name: 'Git & CI/CD', level: 80, category: 'DevOps' },
  { name: 'Communication', level: 90, category: 'Soft Skills' },
];

const Skills = () => (
  <div className="space-y-6">
    <div className="flex justify-between items-center mb-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-800 tracking-tight">My Skills</h2>
        <p className="text-gray-500 text-sm mt-1">Your expertise and competency map.</p>
      </div>
      <button className="bg-crewix-dark hover:bg-black text-white px-5 py-2.5 rounded-full flex items-center gap-2 shadow-sm transition-colors text-sm font-medium">
        <Plus size={18} /> Add Skill
      </button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {skillsList.map((skill, i) => (
        <div key={i} className="bg-white/70 backdrop-blur-md rounded-[2rem] p-6 shadow-sm border border-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-crewix-light rounded-xl flex items-center justify-center text-crewix-accent">
                <Brain size={18} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-sm">{skill.name}</h3>
                <p className="text-xs text-gray-400">{skill.category}</p>
              </div>
            </div>
            <span className="text-sm font-black text-gray-700">{skill.level}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${skill.level >= 80 ? 'bg-crewix-accent' : skill.level >= 60 ? 'bg-crewix-dark' : 'bg-orange-400'}`}
              style={{ width: `${skill.level}%` }}
            />
          </div>
          <div className="flex mt-2 gap-0.5">
            {[1,2,3,4,5].map(s => (
              <Star key={s} size={10} className={s <= Math.round(skill.level / 20) ? 'text-crewix-accent fill-crewix-accent' : 'text-gray-200 fill-gray-200'} />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default Skills;
