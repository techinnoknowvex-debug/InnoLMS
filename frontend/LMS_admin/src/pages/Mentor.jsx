import React, { useEffect, useState } from 'react';
import { notifyError, notifySuccess } from '../utils/toast';

const Mentor = () => {
  const [mentorUsername, setMentorUsername] = useState('');
  const [mentorPassword, setMentorPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [token, setToken] = useState('');
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState('');
  const [sessionTitle, setSessionTitle] = useState('');
  const [teachmintLink, setTeachmintLink] = useState('');
  const [sessionDate, setSessionDate] = useState('');
  const [sessionTime, setSessionTime] = useState('');
  const [sessionDuration, setSessionDuration] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const res = await fetch('http://localhost:5000/LMS/course');
        const data = await res.json();
        if (res.ok) {
          setCourses(data.courses || []);
        } else {
          notifyError(data.message || 'Unable to fetch courses');
        }
      } catch (err) {
        console.error(err);
        notifyError('Unable to fetch courses');
      }
    };
    loadCourses();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!mentorUsername.trim() || !mentorPassword.trim()) {
      notifyError('Username and password are required');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/LMS/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: mentorUsername, password: mentorPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        notifyError(data.message || 'Login failed');
        setLoading(false);
        return;
      }

      setToken(data.token);
      setLoggedIn(true);
      notifySuccess('Mentor login successful');
    } catch (err) {
      console.error(err);
      notifyError('Login error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();

    if (!courseId || !sessionTitle.trim() || !teachmintLink.trim() || !sessionDate || !sessionTime || !sessionDuration.trim()) {
      notifyError('Please fill out all session fields');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/LMS/mentorSession', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          courseId,
          sessionTitle,
          teachmintLink,
          sessionDate,
          sessionTime,
          sessionDuration,
          description,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        notifyError(data.message || 'Failed to create session');
        return;
      }

      notifySuccess('Session created and stored successfully');
      setCourseId('');
      setSessionTitle('');
      setTeachmintLink('');
      setSessionDate('');
      setSessionTime('');
      setSessionDuration('');
      setDescription('');
    } catch (err) {
      console.error(err);
      notifyError('Error creating session: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setToken('');
    setMentorUsername('');
    setMentorPassword('');
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="bg-gradient-to-r from-brand-secondary via-brand-dark-grey to-brand-primary rounded-lg shadow-lg p-8 text-white">
        <h1 className="text-4xl font-bold mb-2">🧑‍🏫 Mentor Session</h1>
        <p className="text-gray-200 page-subtitle">Mentor access and online class session creation via Teachmint.</p>
      </div>

      {!loggedIn ? (
        <div className="card max-w-2xl mx-auto p-8">
          <div className="card-header">
            <h3>Mentor Login</h3>
          </div>
          <form onSubmit={handleLogin} className="space-y-5 mt-6">
            <div className="form-group">
              <label>Mentor Username</label>
              <input
                type="text"
                value={mentorUsername}
                onChange={(e) => setMentorUsername(e.target.value)}
                placeholder="Enter mentor username"
                required
              />
            </div>
            <div className="form-group">
              <label>Mentor Password</label>
              <input
                type="password"
                value={mentorPassword}
                onChange={(e) => setMentorPassword(e.target.value)}
                placeholder="Enter mentor password"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}>
              {loading ? 'Logging in...' : 'Login as Mentor'}
            </button>
          </form>
        </div>
      ) : (
        <div className="card max-w-4xl mx-auto p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3>New Online Class Session</h3>
              <p className="text-brand-grey">Create a Teachmint session for students.</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="btn btn-secondary"
            >
              Mentor Logout
            </button>
          </div>
          <form onSubmit={handleCreateSession} className="space-y-5">
            <div className="form-group">
              <label>📚 Select Course</label>
              <select value={courseId} onChange={(e) => setCourseId(e.target.value)} required>
                <option value="">-- Select Course --</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>📝 Session Title</label>
              <input
                type="text"
                value={sessionTitle}
                onChange={(e) => setSessionTitle(e.target.value)}
                placeholder="Enter session title"
                required
              />
            </div>
            <div className="form-group">
              <label>🔗 Teachmint Class Link</label>
              <input
                type="url"
                value={teachmintLink}
                onChange={(e) => setTeachmintLink(e.target.value)}
                placeholder="Enter Teachmint class link"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="form-group">
                <label>📅 Session Date</label>
                <input
                  type="date"
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>⏰ Session Time</label>
                <input
                  type="time"
                  value={sessionTime}
                  onChange={(e) => setSessionTime(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>⏳ Duration</label>
                <input
                  type="text"
                  value={sessionDuration}
                  onChange={(e) => setSessionDuration(e.target.value)}
                  placeholder="e.g. 60 minutes"
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>🧾 Session Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional notes for students"
                rows="4"
              />
            </div>
            <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}>
              {loading ? 'Creating Session...' : 'Create Session'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Mentor;
