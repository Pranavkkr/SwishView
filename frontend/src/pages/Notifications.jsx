import React, { useState, useEffect } from 'react';
import { Bell, AlertCircle, Info, Calendar, Loader2 } from 'lucide-react';
import api from '../services/api';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-crewix-accent" size={32}/></div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Notifications</h2>
          <p className="text-gray-500 text-sm mt-1">Your recent alerts and updates.</p>
        </div>
        <button className="text-sm text-crewix-accent font-medium hover:text-crewix-dark transition-colors">
           Mark all as read
        </button>
      </div>

      <div className="bg-white/70 backdrop-blur-md rounded-[2rem] p-6 shadow-sm border border-white">
         <div className="space-y-1">
            {notifications.map((notif, i) => (
               <div key={notif.id} className={`flex gap-4 p-4 rounded-2xl transition-colors ${!notif.isRead ? 'bg-white shadow-sm border border-gray-50' : 'hover:bg-white/50'}`}>
                  <div className={`mt-1 w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${!notif.isRead ? 'bg-crewix-accent text-white' : 'bg-gray-100 text-gray-400'}`}>
                     <Bell size={18}/>
                  </div>
                  <div>
                     <div className="flex justify-between items-start mb-1">
                        <p className={`text-sm ${!notif.isRead ? 'font-bold text-gray-800' : 'font-medium text-gray-600'}`}>{notif.title}</p>
                        <span className="text-[10px] text-gray-400 font-medium">{new Date(notif.timestamp).toLocaleString()}</span>
                     </div>
                     <p className="text-xs text-gray-500 leading-relaxed">{notif.message}</p>
                  </div>
               </div>
            ))}
            {notifications.length === 0 && (
                <p className="text-gray-500 text-center py-4">No notifications.</p>
            )}
         </div>
      </div>
    </div>
  );
};
export default Notifications;
