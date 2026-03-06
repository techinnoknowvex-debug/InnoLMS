const express = require('express');
const supabase = require('../config/supabase');
const {STUDENTS} = require("../models/tables");

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

module.exports = router;