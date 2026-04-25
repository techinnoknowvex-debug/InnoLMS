const express = require("express");
const supabase = require("../config/supabase");
const { STUDENTS, OTP_REQUESTS } = require("../models/tables");
const router = express.Router();


router.post("/login", async (req, res) => {
  const { phone, device_id, device_name } = req.body;

  try {
    if (!phone || !device_id) {
      return res.status(400).json({ message: "Phone and Device ID are required" });
    }

    // Check if OTP was verified
    const { data: otpData, error: otpError } = await supabase
      .from(OTP_REQUESTS)
      .select("*")
      .eq("phone", phone)
      .eq("verified", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!otpData) {
      return res.status(401).json({ message: "OTP not verified. Please verify OTP first" });
    }

    if (otpError) {
      return res.status(400).json({ message: otpError.message });
    }

    // Get student by phone
    const { data: student, error: studentError } = await supabase
      .from(STUDENTS)
      .select("*")
      .eq("phone", phone)
      .maybeSingle();

    if (!student) {
      return res.status(401).json({ message: "Student not found" });
    }

    if (studentError) {
      return res.status(400).json({ message: studentError.message });
    }

    // Check if phone is verified (mark as verified during login)
    let phoneVerified = student.phone_verified || false;
    if (!phoneVerified) {
      await supabase
        .from(STUDENTS)
        .update({ phone_verified: true })
        .eq("id", student.id);
      phoneVerified = true;
    }

    // Check if email is already verified
    const emailAlreadyVerified = student.email_verified || false;

    return res.status(200).json({
      message: "Login success",
      id: student.id,
      name: student.name,
      email: student.email,
      phone: student.phone,
      user_uuid: student.id,
      phone_verified: phoneVerified,
      email_verified: emailAlreadyVerified,
      needs_email_verification: !emailAlreadyVerified,  // ← Flag for frontend
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;