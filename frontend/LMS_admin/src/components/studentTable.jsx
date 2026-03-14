import React from "react";

const StudentTable = ({ studentData, setShowForm, showForm }) => {
  return (
    <div>
      <div className="p-6 border-b border-brand-border">
        <button 
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary flex items-center space-x-2"
        >
          <span>➕</span>
          <span>Add Student</span>
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Unicode</th>
              <th>Courses Enrolled</th>
              <th>Courses Taken</th>
            </tr>
          </thead>
          <tbody>
            {studentData && studentData.length > 0 ? (
              studentData.map((student, index) => (
                <tr key={student.id || index}>
                  <td className="font-semibold text-brand-secondary">{student.name}</td>
                  <td className="text-brand-grey">{student.email}</td>
                  <td className="text-brand-secondary">{student.phone || '-'}</td>
                  <td className="text-brand-secondary font-mono text-sm">{student.unicode}</td>
                  <td>
                    <span className="badge badge-primary">
                      {student.enrollments ? student.enrollments.length : 0}
                    </span>
                  </td>
                  <td className="text-brand-grey">
                    {student.enrollments && student.enrollments.length > 0
                      ? student.enrollments
                          .map((e) => e?.courses?.title)
                          .filter(Boolean)
                          .join(', ')
                      : '-'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">
                  <div className="table-empty">
                    <div className="table-empty-icon">📋</div>
                    <p className="font-medium">No Students Found</p>
                    <p className="text-sm text-brand-grey">Click "Add Student" to create your first student</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentTable;