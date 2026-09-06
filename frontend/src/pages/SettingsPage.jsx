import React from 'react';
import { Settings as SettingsIcon, Bell, Lock, Palette, Globe } from 'lucide-react';

const Settings = () => (
  <div className="space-y-6">
    <div className="mb-8">
      <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Settings</h2>
      <p className="text-gray-500 text-sm mt-1">Manage your account preferences.</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[
        { icon: Bell, title: 'Notifications', desc: 'Configure how you receive alerts and updates.', action: 'Configure' },
        { icon: Lock, title: 'Security', desc: 'Change password and manage two-factor authentication.', action: 'Manage' },
        { icon: Palette, title: 'Appearance', desc: 'Customize theme, language, and display options.', action: 'Customize' },
        { icon: Globe, title: 'Language & Region', desc: 'Set your timezone, date format, and locale.', action: 'Change' },
      ].map((setting, i) => {
        const Icon = setting.icon;
        return (
          <div key={i} className="bg-white/70 backdrop-blur-md rounded-[2rem] p-6 shadow-sm border border-white flex gap-4 items-start">
            <div className="w-12 h-12 bg-crewix-light rounded-2xl flex items-center justify-center text-crewix-accent shrink-0">
              <Icon size={22} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-800 mb-1">{setting.title}</h3>
              <p className="text-xs text-gray-500 mb-4">{setting.desc}</p>
              <button className="text-sm font-bold text-crewix-dark hover:text-black transition-colors">
                {setting.action} →
              </button>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

export default Settings;
