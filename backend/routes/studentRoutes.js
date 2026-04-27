const express = require('express');
const supabase = require('../config/supabase');
const { STUDENTS, ENROLLMENTS, COURSES } = require("../models/tables");
const admincheck = require("../middleware/admincheck")

const router = express.Router();

router.post("/student", async (req, res) => {
    const { name, email, phone, unicode } = req.body;
    try {
        if (!name || !email || !phone || !unicode) {
            return res.status(400).json({ message: "Please provide required details" });
        }

        const [{ data: existingByUnicode, error: unicodeError }, { data: existingByEmail, error: emailError }, { data: existingByPhone, error: phoneError }] = await Promise.all([
            supabase.from(STUDENTS).select("id").eq("unicode", unicode).maybeSingle(),
            supabase.from(STUDENTS).select("id").eq("email", email).maybeSingle(),
            supabase.from(STUDENTS).select("id").eq("phone", phone).maybeSingle(),
        ]);

        if (unicodeError || emailError || phoneError) {
            const errorMessage = unicodeError?.message || emailError?.message || phoneError?.message;
            return res.status(500).json({ message: `Error checking student uniqueness: ${errorMessage}` });
        }

        if (existingByUnicode) {
            return res.status(409).json({ message: "A student with this unicode already exists" });
        }
        if (existingByEmail) {
            return res.status(409).json({ message: "A student with this email already exists" });
        }
        if (existingByPhone) {
            return res.status(409).json({ message: "A student with this phone number already exists" });
        }

        const { error: insertError } = await supabase
            .from(STUDENTS)
            .insert({
                name,
                email,
                phone,
                unicode
            });

        if (insertError) {
            return res.status(500).json({ message: `Error in inserting data: ${insertError.message}` });
        }

        return res.status(200).json({
            success: true,
            message: "Student added in database"
        });

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

router.get("/student/:id",async (req,res)=>{
       const {id}=req.params;
     try{
        const {data: student, error: studentError} = await supabase
        .from(STUDENTS)
        .select("*")
        .eq("id",id)
        .maybeSingle();
        
        if(studentError) {
            return res.status(400).json({message: studentError.message});
        }
        
        if(!student) {
            return res.status(404).json({message: "Student not found"});
        }
        
        return res.status(200).json(student);

     }catch(err){
        return res.status(500).json({message:err.message})
     }
})

// Get courses for a specific student
router.get("/student/:id/courses", async (req, res) => {
    const { id } = req.params;

    try {
        const { data: enrollments, error: enrollError } = await supabase
            .from(ENROLLMENTS)
            .select(`
                *,
                courses (
                    id,
                    title,
                    description,
                    total_weeks,
                    pass_percentage,
                    attendance_required
                )
            `)
            .eq("student_id", id);

        if (enrollError) {
            return res.status(500).json({ message: `Error fetching enrollments: ${enrollError.message}` });
        }

        return res.status(200).json({ message: "Student courses fetched successfully", courses: enrollments });

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

// Get all students with their enrolled courses
router.get("/students/courses",async (req, res) => {
    try {
        const { data: students, error: studentsError } = await supabase
            .from(STUDENTS)
            .select(`
                *,
                enrollments (
                    id,
                    enrollment_date,
                    courses (
                        id,
                        title,
                        description,
                        total_weeks,
                        pass_percentage,
                        attendance_required
                    )
                )
            `);

        if (studentsError) {
            return res.status(500).json({ message: `Error fetching students: ${studentsError.message}` });
        }

        return res.status(200).json({ message: "Students with courses fetched successfully", students });

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

module.exports = router;