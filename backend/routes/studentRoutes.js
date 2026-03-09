const express = require('express');
const supabase = require('../config/supabase');
const { STUDENTS, ENROLLMENTS, COURSES } = require("../models/tables");
const admincheck = require("../middleware/admincheck")

const router = express.Router();

router.post("/student", async (req, res) => {
    const { name, email, phone, unicode } = req.body;
    try {
        if (!name || !email || !phone || !unicode) {
            return res.status(401).json({ message: "Please provide required details" });
        }
        const { data: student, error: student_error } = await supabase
            .from(STUDENTS)
            .select("*")
            .eq("unicode", unicode)
            .single();
        if (student_error) {
            return res.status(500).json({ message: `Error in student data: ${student_error.message}` });
        }
        if (student) {
            return res.status(409).json({ message: "Already a student with the unicode exists" });
        }
        const { error: checkerror } = await supabase
            .from(STUDENTS)
            .insert({
                name,
                email,
                phone,
                unicode
            });
        if (checkerror) {
            return res.status(500).json({ message: `Error in inserting data: ${checkerror.message}` });
        }
        return res.status(200).json({
            success: true,
            message: "Student added in database"
        });

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});


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
router.get("/students/courses", admincheck, async (req, res) => {
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