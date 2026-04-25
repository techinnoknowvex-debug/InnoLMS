import React, { useEffect, useState } from 'react';
import EnrollmentForm from '../components/EnrollmentForm';
import { notifyError, notifySuccess } from '../utils/toast';

const Enrollment = () => {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [studentId, setStudentId] = useState('');
  const [courseId, setCourseId] = useState('');
  const token = localStorage.getItem('token');

  const loadData = async () => {
    try {
      const res = await fetch('http://localhost:5000/LMS/students/courses', {
        headers: { Authorization: 'Bearer ' + token },
      });
      const data = await res.json();
      if (res.ok) {
        setStudents(data.students || []);
      } else {
        notifyError(data.message);
      }
    } catch (err) {
      console.error(err);
      notifyError('Unable to fetch students');
    }

    try {
      const res2 = await fetch('http://localhost:5000/LMS/course');
      const data2 = await res2.json();
      if (res2.ok) {
        setCourses(data2.courses || []);
      } else {
        notifyError(data2.message);
      }
    } catch (err) {
      console.error(err);
      notifyError('Unable to fetch courses');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEnroll = async (e) => {
    e.preventDefault();
    if (!studentId || !courseId) {
      notifyError('Please select both student and course');
      return;
    }
    try {
      const res = await fetch('http://localhost:5000/LMS/enroll', {
        method: 'POST',
        headers: {  'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token, },
        body: JSON.stringify({ student_id: studentId, course_id: courseId }),
      });
      const data = await res.json();
      if (!res.ok) {
        notifyError(data.message);
      } else {
        notifySuccess(data.message);
        setStudentId('');
        setCourseId('');
      }
    } catch (err) {
      console.error(err);
      notifyError('Enrollment failed');
    }
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-primary to-brand-secondary rounded-lg shadow-medium p-8 text-white">
        <h1 className="text-4xl font-bold mb-2">✅ Enrollment Management</h1>
        <p className="text-gray-200 page-subtitle">Enroll students in courses</p>
      </div>

      {/* Form */}
      <div className="card max-w-2xl mx-auto slide-in">
        <div className="card-header">
          <h3>Enroll Student in Course</h3>
        </div>
        <EnrollmentForm
          students={students}
          courses={courses}
          studentId={studentId}
          courseId={courseId}
          setStudentId={setStudentId}
          setCourseId={setCourseId}
          handleSubmit={handleEnroll}
        />
      </div>
    </div>
  );
};

export default Enrollment;