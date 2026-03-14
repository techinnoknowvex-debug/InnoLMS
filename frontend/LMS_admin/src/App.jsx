import './index.css'
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import Students from './pages/Student';
import Enrollment from './pages/Enrollment';
import Classes from './pages/Classes';
import Login from './pages/Login';
import SideNav from './components/SideNav';
import logo from './assets/logo.png';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setSidebarOpen(false);
  };

  return (
    <Router>
      <ToastContainer newestOnTop closeOnClick pauseOnHover />
      {/* make sure even the login page is inside the router context */}
      {!token ? (
        <Login setToken={setToken} />
      ) : (
        <div className="flex h-screen bg-brand-cream">
          <SideNav onLogout={handleLogout} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Mobile Header */}
            <div className="lg:hidden bg-gradient-to-r from-brand-secondary to-brand-dark-grey text-white p-4 flex items-center justify-between shadow-medium">
              <div className="flex items-center gap-3">
                <img src={logo} alt="Innoknowvex" className="w-10 h-10 rounded-md object-contain bg-white p-1" />
                <h2 className="text-xl font-extrabold tracking-wide text-white">Innoknowvex</h2>
              </div>
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-2xl hover:text-brand-primary transition-colors"
              >
                {sidebarOpen ? '✕' : '☰'}
              </button>
            </div>
            
            {/* Main Content */}
            <div className="flex-1 overflow-auto p-4 md:p-6 bg-brand-cream">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/students" element={<Students />} />
                <Route path="/enroll" element={<Enrollment />} />
                <Route path="/classes" element={<Classes />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </div>
          </div>
        </div>
      )}
    </Router>
  );
}

export default App
