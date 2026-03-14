import React from 'react';

const EnrollmentForm = ({
  students,
  courses,
  studentId,
  courseId,
  setStudentId,
  setCourseId,
  handleSubmit,
}) => {
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="form-group">
        <label>👤 Select Student</label>
        <select
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          required
        >
          <option value="">-- Select Student --</option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.unicode})
            </option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label>📚 Select Course</label>
        <select
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          required
        >
          <option value="">-- Select Course --</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>
      <button type="submit" className="btn btn-primary btn-lg btn-block fade-in">
        ➕ Enroll Student
      </button>
    </form>
  );
};

export default EnrollmentForm;