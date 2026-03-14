import React from 'react'

const AddStudentForm = ({ name, email, phone, unicode, setName, setEmail, setPhone, setUnicode, handleStudent }) => {
  return (
    <form onSubmit={handleStudent} className="space-y-6">
      <div className="form-row">
        <div className="form-group">
          <label>👤 Student Name</label>
          <input 
            type='text' 
            placeholder="Enter student name" 
            value={name} 
            onChange={(e)=>setName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>📧 Student Email</label>
          <input 
            type='email' 
            placeholder="Enter student email" 
            value={email} 
            onChange={(e)=>setEmail(e.target.value)}
            required
          />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>📞 Phone Number</label>
          <input 
            type='tel' 
            placeholder="Enter student phone number" 
            value={phone} 
            onChange={(e)=>setPhone(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>🔢 Unicode</label>
          <input 
            type='text' 
            placeholder="Enter Unicode" 
            value={unicode} 
            onChange={(e)=>setUnicode(e.target.value)}
            required
          />
        </div>
      </div>
      <button type="submit" className="btn btn-primary btn-lg btn-block fade-in">
        ➕ Add Student
      </button>
    </form>
  )
}

export default AddStudentForm
