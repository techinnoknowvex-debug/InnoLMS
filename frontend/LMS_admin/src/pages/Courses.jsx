import React, { useState, useEffect } from 'react';
import CourseTable from '../components/CourseTable';
import AddCourseForm from '../components/AddCourseForm';
import { notifyError, notifySuccess } from '../utils/toast';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [totalWeeks, setTotalWeeks] = useState('');
  const [passPercentage, setPassPercentage] = useState('');
  const [attendance, setAttendance] = useState('');

  const token = localStorage.getItem('token');

  const loadCourses = async () => {
    try {
      const res = await fetch('http://localhost:5000/LMS/course');
      const data = await res.json();
      if (res.ok) {
        setCourses(data.courses || []);
      } else {
        notifyError(data.message);
      }
    } catch (err) {
      console.error(err);
      notifyError('Unable to fetch courses');
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const handleAddCourse = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/LMS/addCourse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        body: JSON.stringify({
          title,
          description,
          total_weeks: totalWeeks,
          pass_percentage: passPercentage,
          attendance_required: attendance,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        notifyError(data.message);
      } else {
        notifySuccess(data.message);
        setShowForm(false);
        setTitle('');
        setDescription('');
        setTotalWeeks('');
        setPassPercentage('');
        setAttendance('');
        loadCourses();
      }
    } catch (err) {
      console.error(err);
      notifyError('Something went wrong');
    }
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-primary to-brand-secondary rounded-lg shadow-medium p-8 text-white">
        <h1 className="text-4xl font-bold mb-2">📚 Courses Management</h1>
        <p className="text-gray-200 page-subtitle">Create and manage all your courses</p>
      </div>

      {/* Add Course Form */}
      <div>
        <div className="mb-6">
          <button 
            onClick={() => setShowForm(!showForm)} 
            className={`btn ${showForm ? 'btn-secondary' : 'btn-primary'} flex items-center space-x-2`}
          >
            <span>{showForm ? '✕' : '➕'}</span>
            <span>{showForm ? 'Hide Form' : 'Add New Course'}</span>
          </button>
        </div>

        {showForm && (
          <div className="card slide-in">
            <div className="card-header">
              <h3>Add New Course</h3>
            </div>
            <AddCourseForm
              title={title}
              description={description}
              totalWeeks={totalWeeks}
              passPercentage={passPercentage}
              attendance={attendance}
              setTitle={setTitle}
              setDescription={setDescription}
              setTotalWeeks={setTotalWeeks}
              setPassPercentage={setPassPercentage}
              setAttendance={setAttendance}
              handleSubmit={handleAddCourse}
            />
          </div>
        )}
      </div>

      {/* Courses Table */}
      <div className="card">
        <div className="card-header">
          <h3>All Courses ({courses.length})</h3>
        </div>
        <CourseTable courses={courses} />
      </div>
    </div>
  );
};

export default Courses
