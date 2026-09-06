import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './layouts/MainLayout.jsx'
import Loader from './components/Loader.jsx'

const Login        = lazy(() => import('./pages/Login.jsx'));
const Signup       = lazy(() => import('./pages/Signup.jsx'));
const Dashboard    = lazy(() => import('./pages/Dashboard.jsx'));
const Employees    = lazy(() => import('./pages/Employees.jsx'));
const Teams        = lazy(() => import('./pages/Teams.jsx'));
const MyTeam       = lazy(() => import('./pages/MyTeam.jsx'));
const EmployeeProfile = lazy(() => import('./pages/EmployeeProfile.jsx'));
const Projects     = lazy(() => import('./pages/Projects.jsx'));
const Tasks        = lazy(() => import('./pages/Tasks.jsx'));
const Workload     = lazy(() => import('./pages/Workload.jsx'));
const Performance  = lazy(() => import('./pages/Performance.jsx'));
const Training     = lazy(() => import('./pages/Training.jsx'));
const Onboarding   = lazy(() => import('./pages/Onboarding.jsx'));
const LeaveManagement = lazy(() => import('./pages/LeaveManagement.jsx'));
const Notifications = lazy(() => import('./pages/Notifications.jsx'));
const Reports      = lazy(() => import('./pages/Reports.jsx'));
const Goals        = lazy(() => import('./pages/Goals.jsx'));
const Skills       = lazy(() => import('./pages/Skills.jsx'));
const Profile      = lazy(() => import('./pages/Profile.jsx'));
const SettingsPage = lazy(() => import('./pages/SettingsPage.jsx'));

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/login"  element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route path="/" element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard"     element={<Dashboard />} />
            <Route path="employees"     element={<Employees />} />
            <Route path="employees/:id" element={<EmployeeProfile />} />
            <Route path="teams"         element={<Teams />} />
            <Route path="my-team"       element={<MyTeam />} />
            <Route path="projects"      element={<Projects />} />
            <Route path="tasks"         element={<Tasks />} />
            <Route path="workload"      element={<Workload />} />
            <Route path="performance"   element={<Performance />} />
            <Route path="training"      element={<Training />} />
            <Route path="onboarding"    element={<Onboarding />} />
            <Route path="leave"         element={<LeaveManagement />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="reports"       element={<Reports />} />
            <Route path="goals"         element={<Goals />} />
            <Route path="skills"        element={<Skills />} />
            <Route path="profile"       element={<Profile />} />
            <Route path="settings"      element={<SettingsPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
