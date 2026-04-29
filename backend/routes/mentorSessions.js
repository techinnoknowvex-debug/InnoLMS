const express = require("express");
const supabase = require("../config/supabase");
const { MENTOR_SESSIONS } = require("../models/tables");
const admincheck = require("../middleware/admincheck");
const router = express.Router();

// Create/Store mentor session
router.post("/mentorSession", admincheck, async (req, res) => {
    const { courseId, sessionTitle, teachmintLink, sessionDate, sessionTime, sessionDuration, description } = req.body;
    
    try {
        if (!courseId || !sessionTitle || !teachmintLink || !sessionDate || !sessionTime || !sessionDuration) {
            return res.status(400).json({ message: "All session fields are required" });
        }

        const { data, error } = await supabase
            .from(MENTOR_SESSIONS)
            .insert([
                {
                    course_id: courseId,
                    title: sessionTitle,
                    teachmint_link: teachmintLink,
                    session_date: sessionDate,
                    session_time: sessionTime,
                    duration: sessionDuration,
                    description: description || '',
                    created_at: new Date().toISOString(),
                }
            ])
            .select();

        if (error) {
            return res.status(500).json({ message: `Error creating session: ${error.message}` });
        }

        return res.status(201).json({ 
            message: "Session created successfully", 
            session: data[0] 
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

// Get all mentor sessions
router.get("/mentorSessions", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from(MENTOR_SESSIONS)
            .select("*")
            .order("session_date", { ascending: false });

        if (error) {
            return res.status(500).json({ message: error.message });
        }

        return res.status(200).json({ sessions: data });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

// Get sessions by course ID
router.get("/mentorSessions/:courseId", async (req, res) => {
    const { courseId } = req.params;
    
    try {
        const { data, error } = await supabase
            .from(MENTOR_SESSIONS)
            .select("*")
            .eq("course_id", courseId)
            .order("session_date", { ascending: false });

        if (error) {
            return res.status(500).json({ message: error.message });
        }

        return res.status(200).json({ sessions: data });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

module.exports = router;
