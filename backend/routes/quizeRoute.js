const express=require("express");
const supabase = require("../config/supabase");
const { QUIZZES } = require("../models/tables");
const admincheck=require("../middleware/admincheck")
const router=express.Router();

router.post("/addQuiz",admincheck,async (req, res) => {
    const { course_id, week_number, questions } = req.body;

    try {
        if (!course_id || !week_number || !questions || questions.length === 0) {
            return res.status(400).json({ message: "course_id, week_number, and questions are required" });
        }

        const { data: existingQuiz, error: checkError } = await supabase
            .from(QUIZZES)
            .select("*")
            .eq("course_id", course_id)
            .eq("week_number", week_number)
            .single();

        if (existingQuiz) {
            return res.status(409).json({ message: "Quiz already exists for this course and week" });
        }

        const quizData = questions.map(q => ({
            course_id,
            week_number,
            question:q.question,
            options:q.options, 
            correct_answer: q.correct_answer 
        }));

        const { error: insertError } = await supabase
            .from(QUIZZES)
            .insert(quizData);

        if (insertError) {
            return res.status(500).json({ message: `Error inserting quiz: ${insertError.message}` });
        }

        return res.status(200).json({ message: `Quiz for Week ${week_number} added successfully` });

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

router.get("/quiz/:course_id/:week_number", async (req, res) => {
    const { course_id, week_number } = req.params;

    try {
        const { data: quiz, error: quizError } = await supabase
            .from(QUIZZES)
            .select("*")
            .eq("course_id", course_id)
            .eq("week_number", week_number);

        if (quizError) {
            return res.status(500).json({ message: `Error fetching quiz: ${quizError.message}` });
        }

        if (!quiz || quiz.length === 0) {
            return res.status(404).json({ message: "Quiz not found for this course and week" });
        }

        return res.status(200).json({ message: "Quiz fetched successfully", quiz });

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

module.exports = router;