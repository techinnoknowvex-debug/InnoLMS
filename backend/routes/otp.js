const express = require("express");
const supabase = require("../config/supabase");
const { OTP_REQUESTS, STUDENTS } = require("../models/tables");
const router = express.Router();

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Request OTP
router.post("/requestOTP", async (req, res) => {
  const { phone } = req.body;

  try {
    if (!phone) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    // Check if phone exists in students table
    const { data: student, error: studentError } = await supabase
      .from(STUDENTS)
      .select("id, phone")
      .eq("phone", phone)
      .maybeSingle();

    if (!student) {
      return res.status(401).json({ message: "Phone number not registered" });
    }

    if (studentError) {
      return res.status(400).json({ message: studentError.message });
    }

    // Generate OTP
    const otp = generateOTP();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 3 * 60 * 1000); 

  
    const createdAtISO = now.toISOString();

    // Store OTP in database
    const { data, error } = await supabase
      .from(OTP_REQUESTS)
      .insert([
        {
          phone,
          otp,
          created_at: createdAtISO,
          expires_at: expiresAt.toISOString(),
          verified: false,
          attempts: 0,
        },
      ])
      .select();

    if (error) {
      return res.status(400).json({ message: error.message });
    }

  
    console.log(`OTP for ${phone}: ${otp}`);
   

    return res.status(200).json({
      message: "OTP sent successfully",
      phone,
      expiresIn: 300, 
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});




router.post("/verifyOTP", async (req, res) => {
  const { phone, otp } = req.body;

  try {
    if (!phone || !otp) {
      return res.status(400).json({ message: "Phone and OTP are required" });
    }

    // Get latest OTP for this phone
    const { data: otpData, error: otpError } = await supabase
      .from(OTP_REQUESTS)
      .select("*")
      .eq("phone", phone)
      .eq("verified", false)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!otpData) {
      return res.status(401).json({ message: "No pending OTP found" });
    }

    if (otpError) {
      return res.status(400).json({ message: otpError.message });
    }

 
    const now = new Date();
    
    
    let createdAtStr = otpData.created_at;
    if (createdAtStr && !createdAtStr.endsWith('Z')) {
      createdAtStr += 'Z';
    }
    const createdAt = new Date(createdAtStr);
    
    const expiryBuffer = 1 * 60 * 1000; 
    const expiryTime = 3 * 60 * 1000; 
    const timeDifference = now - createdAt;
    const adjustedExpiryTime = expiryTime + expiryBuffer; 



    if (timeDifference > adjustedExpiryTime) {
      return res.status(401).json({ 
        message: "OTP expired",
      });
    }

    // Check if OTP matches
    if (otpData.otp !== otp) {
      const newAttempts = (otpData.attempts || 0) + 1;
      if (newAttempts >= 3) {
        await supabase
          .from(OTP_REQUESTS)
          .update({ verified: false, attempts: newAttempts })
          .eq("id", otpData.id);
        return res.status(401).json({ message: "Too many failed attempts. Request new OTP" });
      }

      await supabase
        .from(OTP_REQUESTS)
        .update({ attempts: newAttempts })
        .eq("id", otpData.id);

      return res.status(401).json({ message: "Invalid OTP" });
    }

    await supabase
      .from(OTP_REQUESTS)
      .update({ verified: true })
      .eq("id", otpData.id);


    const { data: student, error: studentError } = await supabase
      .from(STUDENTS)
      .select("id, name, email")
      .eq("phone", phone)
      .maybeSingle();

    if (studentError) {
      console.error("Error getting student details:", studentError);
    }

    return res.status(200).json({
      message: "OTP verified",
      phone,
      verified: true,
      studentId: student?.id || null,
      studentName: student?.name || null,
      studentEmail: student?.email || null,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;
