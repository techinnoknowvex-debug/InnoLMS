const express = require('express');
const supabase = require('../config/supabase');
const { ENROLLMENTS, STUDENTS, COURSES } = require("../models/tables");

const router = express.Router();

router.post("/enroll", async (req, res) => {
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
