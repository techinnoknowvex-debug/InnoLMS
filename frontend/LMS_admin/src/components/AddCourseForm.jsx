import React from 'react';

const AddCourseForm = ({
  courseId,
  title,
  description,
  totalWeeks,
  passPercentage,
  attendance,
  setCourseId,
  setTitle,
  setDescription,
  setTotalWeeks,
  setPassPercentage,
  setAttendance,
  handleSubmit,
}) => {
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="form-row">
        <div className="form-group">
          <label>🔑 Course ID (Students will enter this to verify)</label>
          <input
            type="text"
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            required
            placeholder="Enter unique course ID (e.g., CS101, PYTHON-2024)"
          />
        </div>
        <div className="form-group">
          <label>📘 Course Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Enter course title"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>✏️ Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter course description"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>⏳ Total Weeks</label>
          <input
            type="number"
            value={totalWeeks}
            onChange={(e) => setTotalWeeks(e.target.value)}
            required
            placeholder="Enter total weeks"
          />
        </div>
        <div className="form-group">
          <label>✅ Pass % Required</label>
          <input
            type="number"
            value={passPercentage}
            onChange={(e) => setPassPercentage(e.target.value)}
            min="0"
            max="100"
            placeholder="Enter pass percentage"
          />
        </div>
        <div className="form-group">
          <label>📅 Attendance %</label>
          <input
            type="text"
            value={attendance}
            onChange={(e) => setAttendance(e.target.value)}
            placeholder="Enter attendance requirement"
          />
        </div>
      </div>

      <button type="submit" className="btn btn-primary btn-lg btn-block fade-in">
        ➕ Add Course
      </button>
    </form>
  );
};

export default AddCourseForm;