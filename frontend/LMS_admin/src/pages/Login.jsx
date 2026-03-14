import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { notifyError } from '../utils/toast';
import logo from '../assets/logo.png';

const Login = ({ setToken }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/LMS/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        notifyError(data.message);
        return;
      }
      localStorage.setItem('token', data.token);
      setToken(data.token);
      navigate('/');
    } catch (err) {
      console.error(err);
      notifyError('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-brand-light-grey">
      {/* Left Side - Branding */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-brand-secondary to-brand-dark-grey text-white flex-col items-center justify-center p-8">
        <div className="text-center fade-in">
          <img
            src={logo}
            alt="Innoknowvex"
            className="w-28 h-28 bg-white rounded-2xl p-3 mb-6 shadow-lg object-contain mx-auto"
          />
          <h1 className="text-4xl font-bold text-orange-500 mb-2">INNOKNOWVEX</h1>
          <p className="text-xl text-gray-300 mb-12">Learning Management System</p>
          <div className="space-y-4 text-left inline-block">
            <div className="flex items-center space-x-4 bg-orange-400 bg-opacity-10 p-4 rounded-lg hover:bg-opacity-20 transition-all">
              <i className="fa-solid fa-book text-2xl text-brand-primary w-8 text-center" aria-hidden="true"></i>
              <span className="text-lg text-gray-100">Manage Courses & Classes</span>
            </div>
            <div className="flex items-center space-x-4 bg-orange-400 bg-opacity-10 p-4 rounded-lg hover:bg-opacity-20 transition-all">
              <i className="fa-solid fa-user-group text-2xl text-brand-primary w-8 text-center" aria-hidden="true"></i>
              <span className="text-lg text-gray-100">Track Student Progress</span>
            </div>
            <div className="flex items-center space-x-4 bg-orange-400 bg-opacity-10 p-4 rounded-lg hover:bg-opacity-20 transition-all">
              <i className="fa-solid fa-chart-line text-2xl text-brand-primary w-8 text-center" aria-hidden="true"></i>
              <span className="text-lg text-gray-100">View Analytics & KPIs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md fade-in">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold text-brand-secondary mb-2">Admin Login</h2>
            <p className="text-brand-grey text-lg page-subtitle">Secure access to your LMS dashboard</p>
          </div>

          <div className="card shadow-medium">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="form-group">
                <label className="text-brand-secondary font-semibold flex items-center gap-2">
                  <i className="fa-solid fa-user text-brand-primary" aria-hidden="true"></i>
                  <span>Username</span>
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="Enter your username"
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label className="text-brand-secondary font-semibold flex items-center gap-2">
                  <i className="fa-solid fa-key text-brand-primary" aria-hidden="true"></i>
                  <span>Password</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-lg btn-block disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <i className="fa-solid fa-spinner fa-spin" aria-hidden="true"></i>
                    <span>Logging in...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <i className="fa-solid fa-right-to-bracket" aria-hidden="true"></i>
                    <span>Login</span>
                  </span>
                )}
              </button>
            </form>
          </div>

         
        </div>
      </div>
    </div>
  );
};

export default Login;