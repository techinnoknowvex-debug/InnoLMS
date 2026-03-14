import React, { useEffect, useState } from "react";
import StudentTable from "../components/studentTable";
import AddStudentForm from "../components/addStudentform";
import { notifyError, notifySuccess } from "../utils/toast";

const Student = () => {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [unicode, setUnicode] = useState("");

  const [studentData, setStudentData] = useState([]);
  const [showForm, setShowForm] = useState(false);


  const handleStudent = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/LMS/student", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          unicode,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        notifyError(data.message);
      } else {
        notifySuccess(data.message);
        setShowForm(false);
        setName("");
        setEmail("");
        setPhone("");
        setUnicode("");
        handleStudentdata();
      }
    } catch (error) {
      console.error(error);
      notifyError("Something went wrong");
    }
  };


  const handleStudentdata = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch("http://localhost:5000/LMS/students/courses", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: 'Bearer ' + token
        },
      });

      const data = await res.json();

      if (!res.ok) {
        notifyError(data.message);
      } else {
        setStudentData(data.students);
      }
    } catch (err) {
      notifyError("Something went wrong");
    }
  };

  useEffect(() => {
    handleStudentdata();
  }, []);

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-primary to-brand-secondary rounded-lg shadow-medium p-8 text-white">
        <h1 className="text-4xl font-bold mb-2">👥 Students Management</h1>
        <p className="text-gray-200 page-subtitle">Manage and view all student information</p>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="card slide-in">
          <div className="card-header">
            <h3>Add New Student</h3>
            <button
              onClick={() => setShowForm(false)}
              className="text-2xl text-brand-grey hover:text-brand-primary transition-colors"
            >
              ✕
            </button>
          </div>
          <AddStudentForm
            name={name}
            email={email}
            phone={phone}
            unicode={unicode}
            setName={setName}
            setEmail={setEmail}
            setPhone={setPhone}
            setUnicode={setUnicode}
            handleStudent={handleStudent}
          />
        </div>
      )}

      {/* Table Section */}
      <div className="card">
        <StudentTable
          studentData={studentData}
          setShowForm={setShowForm}
          showForm={showForm}
        />
      </div>
    </div>
  );
};

export default Student;