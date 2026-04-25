const express = require("express");
const supabase = require("../config/supabase");
const { ENROLLMENTS, DEVICES, COURSES } = require("../models/tables");
const router = express.Router();

// Verify course access with course_id (first time access)
router.post("/verifyCourse", async (req, res) => {
  const { student_id, course_id, device_id } = req.body;

  try {
    if (!student_id || !course_id || !device_id) {
      return res.status(400).json({
        message: "Student ID, Course ID, and Device ID are required",
      });
    }

    const {data:course,error:courseerror}=await supabase
    .from(COURSES)
    .select("*")
    .eq("course_id",course_id)
    .maybeSingle();

    if(courseerror){
      return res.status(400).json(courseerror.message)
    }

    if(!course){
      return res.status(404).json({message:"please enter correct course id"})
    }

    // Find enrollment
    const { data: enrollment, error: enrollmentError } = await supabase
      .from(ENROLLMENTS)
      .select("*")
      .eq("student_id", student_id)
      .eq("course_id", course.id)
      .maybeSingle();

    if (enrollmentError) {
      return res.status(400).json({ message: enrollmentError.message });
    }

    if (!enrollment) {
      return res.status(404).json({
        message: "Course Enrollment not found",
      });
    }

    // If not verified, verify now
    if (!enrollment.is_verified) {
      const { data: updatedEnrollment, error: updateError } = await supabase
        .from(ENROLLMENTS)
        .update({
          is_verified: true,
          verified_at: new Date().toISOString(),
          active_device_id: device_id,
        })
        .eq("id", enrollment.id)
        .select();

      if (updateError) {
        return res.status(400).json({ message: updateError.message });
      }

      return res.status(200).json({
        message: "Course verified successfully",
        verified: true,
        enrollment: updatedEnrollment[0],
        can_stream: true,
      });
    } else {
      // Already verified - check if device is allowed to stream
      if (enrollment.active_device_id && enrollment.active_device_id !== device_id) {
        return res.status(403).json({
          message: "Course is being accessed from another device",
          verified: true,
          can_stream: false,
          action_required: "device_conflict",
        });
      }

      // Update last active device
      await supabase
        .from(ENROLLMENTS)
        .update({
          active_device_id: device_id,
        })
        .eq("id", enrollment.id);

      return res.status(200).json({
        message: "Course access allowed",
        verified: true,
        enrollment,
        can_stream: true,
      });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// Stop streaming (release device lock)
router.post("/stopStreaming", async (req, res) => {
  const { student_id, course_id } = req.body;

  try {
    if (!student_id || !course_id) {
      return res.status(400).json({
        message: "Student ID and Course ID are required",
      });
    }

    const { data, error } = await supabase
      .from(ENROLLMENTS)
      .update({
        active_device_id: null,
      })
      .eq("student_id", student_id)
      .eq("course_id", course_id)
      .select();

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    return res.status(200).json({
      message: "Streaming stopped",
      enrollment: data[0],
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;
