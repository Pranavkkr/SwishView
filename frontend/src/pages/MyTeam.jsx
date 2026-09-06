import React, { useState, useEffect } from 'react';
import { Users, Loader2, Mail, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';
import Avatar from '../components/Avatar';
import api from '../services/api';

const MyTeam = () => {
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyTeam();
  }, []);

  const fetchMyTeam = async () => {
    try {
      const res = await api.get('/employees/me/team');
      if (res.status === 200 && res.data) {
        setTeam(res.data);
      } else {
        setTeam(null);
      }
    } catch (err) {
      console.error("Error fetching team:", err);
      setTeam(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-crewix-accent" size={32} />
      </div>
    );
  }

  if (!team) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400">
        <Users size={64} className="mb-4 opacity-30" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">No Team Assigned</h2>
        <p className="font-medium text-sm">You are not currently assigned to any team.</p>
        <p className="text-xs mt-1">Please contact your manager to be added to a team.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 tracking-tight">My Team</h2>
        <p className="text-gray-500 text-sm mt-1">View your teammates and team leader.</p>
      </div>

      <div className="bg-white/70 backdrop-blur-md rounded-[2rem] p-8 shadow-sm border border-white">
        <div className="flex items-center gap-4 mb-6 border-b border-gray-100 pb-6">
          <div className="w-16 h-16 bg-crewix-dark text-crewix-accent rounded-2xl flex items-center justify-center shadow-md">
            <Users size={32} />
          </div>
          <div>
            <h3 className="text-2xl font-black text-gray-800">{team.name}</h3>
            <p className="text-gray-500 text-sm">{team.description || 'No description provided.'}</p>
          </div>
        </div>

        {team.manager && (
          <div className="mb-10">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Team Leader</h4>
            <div className="flex items-center gap-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-100 max-w-sm">
              <Avatar name={`${team.manager.firstName} ${team.manager.lastName}`} size="lg" className="border-2 border-white" />
              <div>
                <p className="font-bold text-gray-800">{team.manager.firstName} {team.manager.lastName}</p>
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                  <Mail size={12} /> {team.manager.email}
                </div>
              </div>
              <div className="ml-auto">
                <span className="text-[10px] bg-crewix-accent text-white px-2 py-1 rounded-md uppercase font-bold tracking-wider shadow-sm">Leader</span>
              </div>
            </div>
          </div>
        )}

        <div>
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Team Members ({team.members?.length || 0})</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {team.members && team.members.map(member => (
              <div key={member.id} className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-50 hover:shadow-md transition-shadow">
                <Avatar name={`${member.firstName} ${member.lastName}`} size="lg" className="border-2 border-white" />
                <div>
                  <p className="font-bold text-gray-800 text-sm">{member.firstName} {member.lastName}</p>
                  <p className="text-xs text-gray-500">{member.designation || 'Employee'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyTeam;
