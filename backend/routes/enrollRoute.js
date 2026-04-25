const express = require('express');
const supabase = require('../config/supabase');
const { ENROLLMENTS, STUDENTS, COURSES } = require("../models/tables");
const admincheck=require("../middleware/admincheck")
const router = express.Router();

// Get enrolled courses for a student
router.get("/student_enrollments/:student_id", async (req, res) => {
    const { student_id } = req.params;
    try {
        if (!student_id) {
            return res.status(400).json({ message: "student_id is required" });
        }

        const { data: enrollments, error: enrollError } = await supabase
            .from(ENROLLMENTS)
            .select("course_id")
            .eq("student_id", student_id);

        if (enrollError) {
            return res.status(400).json({ message: enrollError.message });
        }

        const enrolledCourseIds = enrollments.map(e => e.course_id);
        return res.status(200).json({ 
            message: "Enrolled courses fetched",
            enrolled_course_ids: enrolledCourseIds 
        });

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

router.post("/enroll", admincheck,async (req, res) => {
    const { student_id, course_id } = req.body;
    try {
        if (!student_id || !course_id) {
            return res.status(400).json({ message: "student_id and course_id are required" });
        }
        const { data: student, error: studentError } = await supabase
            .from(STUDENTS)
            .select("*")
            .eq("id", student_id)
            .single();

        if (studentError || !student) {
            return res.status(404).json({ message: "Student not found" });
        }

        const { data: course, error: courseError } = await supabase
            .from(COURSES)
            .select("*")
            .eq("id", course_id)
            .single();

        if (courseError || !course) {
            return res.status(404).json({ message: "Course not found" });
        }

        const { data: existingEnrollment, error: enrollError } = await supabase
            .from(ENROLLMENTS)
            .select("*")
            .eq("student_id", student_id)
            .eq("course_id", course_id)
            .single();

        if (existingEnrollment) {
            return res.status(409).json({ message: "Student is already enrolled in this course" });
        }

        const { error: insertError } = await supabase
            .from(ENROLLMENTS)
            .insert({
                student_id,
                course_id,
                enrollment_date: new Date().toISOString()
            });

        if (insertError) {
            return res.status(500).json({ message: `Error enrolling student: ${insertError.message}` });
        }

        return res.status(200).json({
            success: true,
            message: "Student enrolled successfully"
        });

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

module.exports = router;

       