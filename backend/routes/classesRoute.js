const express=require("express");
const supabase = require("../config/supabase");
const {CLASSES} = require("../models/tables");
const admincheck = require("../middleware/admincheck");

const router=express.Router();

router.post("/addClasses",admincheck,async (req, res) => {
    const { course_id, week_number, class_number, title, video_url, thumbnail_url, duration} = req.body;

    try {
        if (!course_id || !week_number || !class_number || !title || !video_url) {
            return res.status(400).json({ message: "course_id, week_number, class_number, title, and video_url are required" });
        }
        const { data: existingClass, error: checkError } = await supabase
            .from(CLASSES)
            .select("*")
            .eq("course_id", course_id)
            .eq("week_number", week_number)
            .eq("class_number", class_number)
            .single();

        if (existingClass) {
            return res.status(409).json({ message: "Class already exists for this course, week, and class number" });
        }

        const { error: insertError } = await supabase
            .from(CLASSES)
            .insert([{
                course_id,
                week_number,
                class_number,
                title,
                video_url,
                thumbnail_url,
                duration
            }]);

        if (insertError) {
            return res.status(500).json({ message: `Error inserting class: ${insertError.message}` });
        }

        return res.status(200).json({ message: `Class "${title}" added successfully` });

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

router.get("/classes/:course_id/:week_number", async (req, res) => {
    const { course_id, week_number } = req.params;

    try {
        const { data: classes, error: classesError } = await supabase
            .from(CLASSES)
            .select("*")
            .eq("course_id", course_id)
            .eq("week_number", week_number)
            .order("class_number", { ascending: true });

        if (classesError) {
            return res.status(500).json({ message: `Error fetching classes: ${classesError.message}` });
        }

        return res.status(200).json({ message: "Classes fetched successfully", classes });

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

module.exports = router;