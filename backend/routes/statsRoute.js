const express = require("express");
const supabase = require("../config/supabase");
const { STUDENTS, COURSES, ENROLLMENTS } = require("../models/tables");
const admincheck = require("../middleware/admincheck");

const router = express.Router();

router.get("/stats", admincheck, async (req, res) => {
  try {
    // Students count
    const { count: studentCount, error: studentError } = await supabase
      .from(STUDENTS)
      .select("*", { count: "exact", head: true });

    if (studentError) throw studentError;

    // Courses count
    const { count: courseCount, error: courseError } = await supabase
      .from(COURSES)
      .select("*", { count: "exact", head: true });

    if (courseError) throw courseError;

    // Enrollments count
    const { count: enrollmentCount, error: enrollmentError } = await supabase
      .from(ENROLLMENTS)
      .select("*", { count: "exact", head: true });

    if (enrollmentError) throw enrollmentError;

    const stats = {
      totalStudents: studentCount || 0,
      totalCourses: courseCount || 0,
      totalEnrollments: enrollmentCount || 0,
    };

    return res.status(200).json({
      message: "Stats fetched successfully",
      stats,
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message || "Server error",
    });
  }
});

module.exports = router;