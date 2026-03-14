import React, { useEffect, useState } from 'react';
import ClassForm from '../components/ClassForm';
import { notifyError, notifySuccess } from '../utils/toast';

const Classes = () => {
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState('');
  const [weekNumber, setWeekNumber] = useState('');
  const [classNumber, setClassNumber] = useState('');
  const [title, setTitle] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [uploading, setUploading] = useState(false);
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

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!courseId || !weekNumber || !classNumber || !title || (!videoFile && !videoUrl)) {
      notifyError('Please fill out all fields (upload a video file or provide a video URL)');
      return;
    }

    if (videoFile) {
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append('video', videoFile);
        formData.append('course_id', courseId);
        formData.append('week_number', weekNumber);
        formData.append('class_number', classNumber);
        formData.append('title', title);

        const res = await fetch('http://localhost:5000/LMS/uploadVideo', {
          method: 'POST',
          headers: {
            Authorization: 'Bearer ' + token,
          },
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) {
          notifyError(data.message);
          return;
        }

        notifySuccess(data.message);
        setCourseId('');
        setWeekNumber('');
        setClassNumber('');
        setTitle('');
        setVideoFile(null);
        setVideoUrl('');
        return;
      } catch (err) {
        console.error(err);
        notifyError('Failed to upload video');
        return;
      } finally {
        setUploading(false);
      }
    }

    try {
      const res = await fetch('http://localhost:5000/LMS/addClasses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        body: JSON.stringify({
          course_id: courseId,
          week_number: weekNumber,
          class_number: classNumber,
          title,
          video_url: videoUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        notifyError(data.message);
      } else {
        notifySuccess(data.message);
        setCourseId('');
        setWeekNumber('');
        setClassNumber('');
        setTitle('');
        setVideoFile(null);
        setVideoUrl('');
      }
    } catch (err) {
      console.error(err);
      notifyError('Failed to add class');
    }
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-primary to-brand-secondary rounded-lg shadow-medium p-8 text-white">
        <h1 className="text-4xl font-bold mb-2">📝 Class Management</h1>
        <p className="text-gray-200 page-subtitle">Add and manage class sessions for your courses</p>
      </div>

      {/* Form */}
      <div className="card max-w-3xl mx-auto slide-in">
        <div className="card-header">
          <h3>Create New Class</h3>
        </div>
        <ClassForm
          courses={courses}
          courseId={courseId}
          weekNumber={weekNumber}
          classNumber={classNumber}
          title={title}
          videoFile={videoFile}
          videoUrl={videoUrl}
          setCourseId={setCourseId}
          setWeekNumber={setWeekNumber}
          setClassNumber={setClassNumber}
          setTitle={setTitle}
          setVideoFile={setVideoFile}
          setVideoUrl={setVideoUrl}
          handleSubmit={handleAdd}
          uploading={uploading}
        />
      </div>

      {/* Guidelines */}
      <div className="card bg-brand-light-grey border-l-4 border-brand-primary">
        <div className="card-header">
          <h3>📚 Class Guidelines</h3>
        </div>
        <ul className="space-y-3">
          <li className="flex items-center space-x-3">
            <span className="w-6 h-6 bg-brand-success text-white rounded-full flex items-center justify-center text-sm font-bold">✓</span>
            <span className="text-brand-secondary">Select the course first</span>
          </li>
          <li className="flex items-center space-x-3">
            <span className="w-6 h-6 bg-brand-success text-white rounded-full flex items-center justify-center text-sm font-bold">✓</span>
            <span className="text-brand-secondary">Enter the week and class numbers</span>
          </li>
          <li className="flex items-center space-x-3">
            <span className="w-6 h-6 bg-brand-success text-white rounded-full flex items-center justify-center text-sm font-bold">✓</span>
            <span className="text-brand-secondary">Provide a descriptive title</span>
          </li>
          <li className="flex items-center space-x-3">
            <span className="w-6 h-6 bg-brand-success text-white rounded-full flex items-center justify-center text-sm font-bold">✓</span>
            <span className="text-brand-secondary">Upload a video file (stored in S3) or paste a video URL</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Classes;