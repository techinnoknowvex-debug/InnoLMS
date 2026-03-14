import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/logo.png';

const SideNav = ({ onLogout, sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Dashboard' },
    { path: '/students', label: 'Students' },
    { path: '/courses', label: 'Courses' },
    { path: '/enroll', label: 'Enrollments' },
    { path: '/classes', label: 'Classes' },
  ];

  const navContent = (
    <>
      <div className="mb-8 pb-6 border-b border-brand-dark-grey border-opacity-50">
        <div className="flex items-center space-x-3 mb-2">
          <img
            src={logo}
            alt="Innoknowvex"
            className="w-16 h-16 rounded-lg object-contain bg-white p-1 shadow-medium"
          />
          <div>
            <h3 className="text-lg font-extrabold text-brand-secondary">Innoknowvex</h3>
          </div>
        </div>
        <p className="text-xs text-brand-grey mt-2 ml-12">Learning Management System</p>
      </div>

      <nav className="space-y-2 flex-1">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setSidebarOpen(false)}
            className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
          >
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <button
        onClick={onLogout}
        className="w-full btn btn-primary flex items-center justify-center"
      >
        <span>Logout</span>
      </button>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-64 bg-white text-brand-secondary p-6 shadow-lg flex-col border-r border-brand-border">
        {navContent}
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`lg:hidden fixed left-0 top-0 h-full w-64 bg-white text-brand-secondary p-6 shadow-lg flex flex-col z-50 transform transition-transform duration-300 border-r border-brand-border ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {navContent}
      </div>
    </>
  );
};

export default SideNav;