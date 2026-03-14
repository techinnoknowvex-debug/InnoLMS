import React, { useEffect, useState } from 'react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    totalEnrollments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');

    const fetchStats = async () => {
      try {
        const res = await fetch('http://localhost:5000/LMS/stats', {
          headers: { Authorization: 'Bearer ' + token },
        });
        const data = await res.json();
        if (res.ok && data.stats) {
          setStats(data.stats);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const StatCard = ({ title, value, icon, accentColor }) => (
    <div className="stat-card" style={{ borderTopColor: accentColor }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="stat-label">{title}</p>
          <p className="stat-value" style={{ color: accentColor }}>{value}</p>
        </div>
        <div className="text-4xl opacity-50">{icon}</div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="spinner"></div>
          <p className="text-brand-grey text-lg mt-4">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-secondary via-brand-dark-grey to-brand-primary rounded-lg p-8 text-white shadow-lg">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Welcome to LMS Dashboard</h1>
        <p className="text-gray-200 page-subtitle">Monitor your learning management system metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="dashboard-grid">
        <StatCard
          title="Total Students"
          value={stats.totalStudents}
          icon="👥"
          accentColor="#ff6b35"
        />
        <StatCard
          title="Total Courses"
          value={stats.totalCourses}
          icon="📚"
          accentColor="#1a1a1a"
        />
        <StatCard
          title="Active Enrollments"
          value={stats.totalEnrollments}
          icon="✅"
          accentColor="#27ae60"
        />
      </div>

      {/* Summary Boxes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Summary */}
        <div className="card">
          <div className="card-header">
            <h3>📊 Quick Summary</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-brand-light-grey rounded-lg hover:bg-brand-pale-grey transition-colors">
              <span className="font-semibold text-brand-secondary">Avg Courses per Student</span>
              <span className="bg-brand-primary text-white font-bold px-4 py-2 rounded-lg shadow-primary">
                {stats.totalStudents > 0 ? (stats.totalEnrollments / stats.totalStudents).toFixed(1) : 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard
