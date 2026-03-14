import React from 'react';

const CourseTable = ({ courses }) => {
  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Weeks</th>
            <th>Pass %</th>
            <th>Attendance</th>
          </tr>
        </thead>
        <tbody>
          {courses && courses.length > 0 ? (
            courses.map((course, index) => (
              <tr key={course.id || index}>
                <td className="font-semibold text-brand-secondary">{course.title}</td>
                <td className="font-semibold text-brand-secondary">{course.total_weeks}</td>
                <td>
                  <span className="badge badge-success">
                    {course.pass_percentage}%
                  </span>
                </td>
                <td className="text-brand-secondary">{course.attendance_required}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4">
                <div className="table-empty">
                  <div className="table-empty-icon">📚</div>
                  <p className="font-medium">No courses found</p>
                  <p className="text-sm text-brand-grey">Click "Add Course" to create your first course</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CourseTable;