import React from 'react';

const ClassForm = ({
  courses,
  courseId,
  courseBatch,
  weekNumber,
  classNumber,
  title,
  videoFile,
  videoUrl,
  setCourseId,
  setCourseBatch,
  setWeekNumber,
  setClassNumber,
  setTitle,
  setVideoFile,
  setVideoUrl,
  handleSubmit,
  uploading,
}) => {
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
      <div className="form-group">
        <label>📅 Select Batch</label>
        <select
          value={courseBatch}
          onChange={(e) => setCourseBatch(e.target.value)}
          required
        >
          <option value="">-- Select Batch --</option>
          <option value="January">January</option>
          <option value="February">February</option>
          <option value="March">March</option>
          <option value="April">April</option>
          <option value="May">May</option>
          <option value="June">June</option>
          <option value="July">July</option>
          <option value="August">August</option>
          <option value="September">September</option>
          <option value="October">October</option>
          <option value="November">November</option>
          <option value="December">December</option>
        </select>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>📅 Week Number</label>
          <input
            type="number"
            value={weekNumber}
            onChange={(e) => setWeekNumber(e.target.value)}
            required
            placeholder="Enter week number"
          />
        </div>
        <div className="form-group">
          <label>🔢 Class Number</label>
          <input
            type="number"
            value={classNumber}
            onChange={(e) => setClassNumber(e.target.value)}
            required
            placeholder="Enter class number"
          />
        </div>
      </div>
      <div className="form-group">
        <label>📖 Class Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="Enter class title"
        />
      </div>
      <div className="form-group">
        <label>🎥 Upload Video (recommended)</label>
        <input
          type="file"
          accept="video/*"
          onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
        />
        <p className="text-xs text-brand-grey mt-2">
          If you upload a file, it will be stored in S3 automatically.
        </p>
      </div>
      <div className="form-group">
        <label>🔗 Or Video URL</label>
        <input
          type="url"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="Enter video URL"
        />
      </div>
      <button
        type="submit"
        disabled={uploading}
        className="btn btn-primary btn-lg btn-block fade-in disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {uploading ? 'Uploading...' : '➕ Add Class'}
      </button>
    </form>
  );
};

export default ClassForm;