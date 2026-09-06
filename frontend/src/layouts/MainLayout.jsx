import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Avatar from '../components/Avatar';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ClipboardList, FolderOpen, BookOpen, Target,
  TrendingUp, Brain, UmbrellaIcon, Bell, User, Settings,
  ChevronRight, LogOut, ShieldCheck, Search, Menu, X,
  Users, BarChart3, Briefcase, CheckSquare
} from 'lucide-react';

// ────────── Employee sidebar config ──────────
const employeeNav = [
  {
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    ]
  },
  {
    group: 'My Work',
    items: [
      { label: 'My Team',     icon: Users,         path: '/my-team' },
      { label: 'My Tasks',    icon: ClipboardList, path: '/tasks' },
      { label: 'My Projects', icon: FolderOpen,    path: '/projects' },
    ]
  },
  {
    group: 'Learning',
    items: [
      { label: 'My Goals',       icon: Target,      path: '/goals' },
      { label: 'My Performance', icon: TrendingUp,  path: '/performance' },
      { label: 'My Skills',      icon: Brain,        path: '/skills' },
      { label: 'Training',       icon: BookOpen,     path: '/training' },
    ]
  },
  {
    group: 'Time & Alerts',
    items: [
      { label: 'Attendance', icon: UmbrellaIcon, path: '/leave' },
      { label: 'Notifications',      icon: Bell,         path: '/notifications' },
    ]
  },
];

const employeeBottom = [
  { label: 'My Profile', icon: User,     path: '/profile' },
  { label: 'Settings',   icon: Settings, path: '/settings' },
];

// ────────── Manager top-bar config ──────────
const managerNav = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Employees', path: '/employees' },
  { label: 'Teams',     path: '/teams' },
  { label: 'Projects',  path: '/projects' },
  { label: 'Tasks',     path: '/tasks' },
  { label: 'Attendance', path: '/leave' },
  { label: 'Training',  path: '/training' },
  { label: 'Reports',   path: '/reports' },
];

// ────────── Shared components ──────────

const SidebarLink = ({ item, collapsed }) => {
  const location = useLocation();
  const isActive = location.pathname.startsWith(item.path);
  const Icon = item.icon;

  return (
    <Link
      to={item.path}
      title={collapsed ? item.label : undefined}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative ${
        isActive
          ? 'bg-crewix-dark text-white shadow-sm'
          : 'text-gray-500 hover:bg-white hover:text-gray-800'
      }`}
    >
      <Icon size={18} className="shrink-0" />
      {!collapsed && (
        <span className="text-sm font-medium leading-none">{item.label}</span>
      )}
      {!collapsed && isActive && (
        <ChevronRight size={14} className="ml-auto opacity-60" />
      )}
      {/* Tooltip when collapsed */}
      {collapsed && (
        <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
          {item.label}
        </div>
      )}
    </Link>
  );
};

// ────────── Employee Layout (sidebar) ──────────
const EmployeeLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const profileName = localStorage.getItem('name') || 'User';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-crewix-light flex font-sans">
      {/* Sidebar */}
      <aside className={`${collapsed ? 'w-16' : 'w-60'} shrink-0 h-screen sticky top-0 bg-white/70 backdrop-blur-xl border-r border-white shadow-sm flex flex-col transition-all duration-300 z-30`}>
        
        {/* Logo */}
        <div className={`flex items-center gap-3 px-4 py-5 border-b border-gray-100 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-lg bg-crewix-dark flex items-center justify-center shrink-0">
            <ShieldCheck size={16} className="text-crewix-accent" />
          </div>
          {!collapsed && (
            <div>
              <p className="text-sm font-black text-gray-800 leading-none">SwishView</p>
              <p className="text-[10px] text-gray-400 font-medium mt-0.5">Employee Portal</p>
            </div>
          )}
        </div>

        {/* Nav sections */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {employeeNav.map((section, si) => (
            <div key={si} className={section.group ? 'pt-3' : ''}>
              {section.group && !collapsed && (
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 mb-1">
                  {section.group}
                </p>
              )}
              {section.group && collapsed && <div className="border-t border-gray-100 my-2 mx-1" />}
              {section.items.map(item => (
                <SidebarLink key={item.path} item={item} collapsed={collapsed} />
              ))}
            </div>
          ))}
        </nav>

        {/* Bottom links */}
        <div className="border-t border-gray-100 px-2 py-3 space-y-1">
          {employeeBottom.map(item => (
            <SidebarLink key={item.path} item={item} collapsed={collapsed} />
          ))}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-50 hover:text-red-600 transition-all group relative"
            title={collapsed ? 'Logout' : undefined}
          >
            <LogOut size={18} className="shrink-0" />
            {!collapsed && <span className="text-sm font-medium">Logout</span>}
            {collapsed && (
              <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                Logout
              </div>
            )}
          </button>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-white border border-gray-200 rounded-full shadow-sm flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors"
        >
          {collapsed ? <ChevronRight size={12} /> : <X size={12} />}
        </button>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="sticky top-0 z-20 bg-white/60 backdrop-blur-md border-b border-white px-6 py-3 flex items-center justify-end">
          <div className="flex items-center gap-3">
            <span className="text-[10px] bg-crewix-accent text-white px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
              Employee
            </span>
            <Link to="/notifications" className="w-9 h-9 bg-white rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:text-crewix-dark transition-colors shadow-sm">
              <Bell size={16} />
            </Link>
            <Link to="/profile">
              <Avatar name={profileName} size="sm" className="border-2 border-white" />
            </Link>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// ────────── Manager Layout (top pill nav) ──────────
const ManagerLayout = () => {
  const profileName = localStorage.getItem('name') || 'User';
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-crewix-light text-gray-800 font-sans p-6">
      <header className="flex items-center justify-between mb-8">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-crewix-dark flex items-center justify-center shadow-sm">
            <ShieldCheck size={20} className="text-crewix-accent" />
          </div>
          <div>
            <p className="text-lg font-black text-gray-800 leading-none">SwishView</p>
            <p className="text-[10px] text-gray-400 font-medium">Manager Portal</p>
          </div>
        </div>

        {/* Top pill nav */}
        <nav className="flex items-center bg-white/60 backdrop-blur-md rounded-full p-1.5 shadow-sm border border-white gap-0.5">
          {managerNav.map(item => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link key={item.path} to={item.path}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  isActive ? 'bg-crewix-dark text-white shadow-md' : 'text-gray-500 hover:text-gray-800 hover:bg-white/50'
                }`}>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] bg-crewix-dark text-white px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">Manager</span>
          <button onClick={handleLogout}
            className="w-9 h-9 bg-white/60 backdrop-blur-md rounded-full border border-white flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-white shadow-sm transition-colors"
            title="Logout">
            <LogOut size={16} />
          </button>
          <Link to="/profile">
            <Avatar name={profileName} size="md" className="border-2 border-white hover:border-crewix-accent transition-colors" />
          </Link>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto">
        <Outlet />
      </main>
    </div>
  );
};

// ────────── Main Layout (role router) ──────────
const MainLayout = () => {
  const role = localStorage.getItem('role') || 'EMPLOYEE';
  return role === 'MANAGER' ? <ManagerLayout /> : <EmployeeLayout />;
};

export default MainLayout;
