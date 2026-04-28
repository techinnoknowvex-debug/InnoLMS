const express = require("express");
const supabase = require("../config/supabase");
const { OTP_REQUESTS, STUDENTS, ENROLLMENTS, EMAIL_VERIFICATIONS } = require("../models/tables");
const router = express.Router();
const SibApiV3Sdk = require('sib-api-v3-sdk');

// Configure Brevo with new API endpoint
const defaultClient = SibApiV3Sdk.ApiClient.instance;
defaultClient.basePath = 'https://api.brevo.com/v3';
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

// Generate verification token (valid for 10 minutes)
const generateVerificationToken = () => {
  return require('crypto').randomBytes(32).toString('hex');
};

// Send Email via Brevo
const sendEmailViaBrevo = async (toEmail, toName, verificationLink) => {
  try {

    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.subject = "Verify Your Login - INNOKNOWVEX LMS";
    sendSmtpEmail.htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #FFA366, #FFB399); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
            .content { background: #f9f9f9; padding: 20px; }
            .button { background: #FFA366; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; text-align: center; }
            .footer { text-align: center; font-size: 12px; color: #999; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>INNOKNOWVEX LMS</h1>
              <p>Email Verification</p>
            </div>
            <div class="content">
              <p>Hello ${toName},</p>
              <p>Thank you for logging into INNOKNOWVEX LMS. To complete your login, please verify your email by clicking the link below:</p>
              <br/>
              <center>
                <a href="${verificationLink}" class="button">Verify Email</a>
              </center>
              <br/>
              <p>Or copy this link: <a href="${verificationLink}">${verificationLink}</a></p>
              <p><strong>This link expires in 10 minutes.</strong></p>
              <p>If you didn't request this verification, please ignore this email.</p>
              <br/>
              <p>Best regards,<br/>INNOKNOWVEX Team</p>
            </div>
            <div class="footer">
              <p>© 2026 INNOKNOWVEX LMS. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
    sendSmtpEmail.sender = { name: "INNOKNOWVEX", email: process.env.BREVO_FROM_EMAIL};
    sendSmtpEmail.to = [{ email: toEmail, name: toName }];

    

    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    return { success: true, messageId: data.messageId };
  } catch (error) {
    console.error('[Brevo] Email error details:', {
      status: error.status,
      statusCode: error.statusCode,
      message: error.message,
      response: error.response?.body || error.response?.text || 'No response body'
    });
    throw error;
  }
};

// Send Email Verification Link
router.post("/sendEmailVerification", async (req, res) => {
  const { phone, studentId } = req.body;

  try {
    if (!phone || !studentId) {
      return res.status(400).json({ message: "Phone and Student ID are required" });
    }

    // Step 1: Get student details
    const { data: student, error: studentError } = await supabase
      .from(STUDENTS)
      .select("id, name, email, phone, email_verified")
      .eq("id", studentId)
      .eq("phone", phone)
      .maybeSingle();

    if (!student) {
      return res.status(401).json({ message: "Student details not found" });
    }

    if (studentError) {
      return res.status(400).json({ message: studentError.message });
    }

    // Check if email is already verified
    if (student.email_verified) {
      return res.status(200).json({
        message: "Email already verified",
        email_verified: true,
        email: student.email,
        skip_verification: true,
      });
    }

    if (!student.email) {
      return res.status(400).json({ message: "Email not registered for this student" });
    }

    // Step 2: Check if student has any enrollments
    
    const { data: enrollments, error: enrollmentError } = await supabase
      .from(ENROLLMENTS)
      .select("id, course_id")
      .eq("student_id", studentId);

    if (enrollmentError) {
      return res.status(400).json({ message: enrollmentError.message });
    }

    // If no enrollments found, deny access
    if (!enrollments || enrollments.length === 0) {
      return res.status(403).json({ 
        message: "You are not enrolled in any courses. Please enroll in a course first to login.",
        enrolled: false
      });
    }


    const verificationToken = generateVerificationToken();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes


    const { data, error } = await supabase
      .from(EMAIL_VERIFICATIONS)
      .insert([
        {
          student_id: studentId,
          phone,
          token: verificationToken,
          created_at: new Date().toISOString(),
          expires_at: expiresAt,
          verified: false,
        },
      ])
      .select();

    if (error) {
      console.error('Email verification token storage error:', error);
      return res.status(400).json({ message: error.message });
    }

  
    const verificationLink = `${process.env.BASE_URL}/verify-email.html?token=${verificationToken}&studentId=${studentId}`;
    
    try {
      const emailResult = await sendEmailViaBrevo(student.email, student.name, verificationLink);


      return res.status(200).json({
        message: "Verification email sent successfully",
        email: student.email,
        expiresIn: 600, // 10 minutes in seconds
        messageId: emailResult.messageId,
        enrolled: true,
        enrollmentCount: enrollments.length
      });
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError.message);
      
 
      return res.status(200).json({
        message: "Verification email sending initiated",
        email: student.email,
        expiresIn: 600,
        warning: "Email delivery is being processed",
        enrolled: true,
        enrollmentCount: enrollments.length
      });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.post("/verifyEmailToken", async (req, res) => {
  const { token, studentId } = req.body;

  try {
    if (!token || !studentId) {
      return res.status(400).json({ message: "Token and Student ID are required" });
    }

    
    const { data: emailToken, error: tokenError } = await supabase
      .from(EMAIL_VERIFICATIONS)
      .select("*")
      .eq("token", token)
      .eq("verified", false)
      .maybeSingle();

    if (!emailToken) {
      return res.status(401).json({ message: "Invalid or expired verification link" });
    }

    if (tokenError) {
      return res.status(400).json({ message: tokenError.message });
    }

    // Check if token expired
    const now = new Date().getTime();
    let expiresAtStr = emailToken.expires_at;
    if (expiresAtStr && !expiresAtStr.endsWith('Z')) {
      expiresAtStr += 'Z';
    }
    const expiresAtTime = new Date(expiresAtStr).getTime();

    if (now > expiresAtTime) {
      return res.status(401).json({ message: "Verification link expired" });
    }

  
    await supabase
      .from(EMAIL_VERIFICATIONS)
      .update({ verified: true })
      .eq("id", emailToken.id);

    // Update student's email_verified status
    const { error: updateError } = await supabase
      .from(STUDENTS)
      .update({ 
        email_verified: true,
        verified_at: new Date().toISOString()
      })
      .eq("id", studentId);

    if (updateError) {
      console.error('Error updating email_verified status:', updateError);
    }

   
    const { data: student, error: studentError } = await supabase
      .from(STUDENTS)
      .select("*")
      .eq("id", studentId)
      .maybeSingle();

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (studentError) {
      return res.status(400).json({ message: studentError.message });
    }

    return res.status(200).json({
      message: "Email verified successfully",
      success: true,
      id: student.id,
      name: student.name,
      email: student.email,
      phone: student.phone,
      user_uuid: student.id,
      email_verified: true,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});


router.post("/checkEmailVerification", async (req, res) => {
  const { phone, studentId } = req.body;

  try {
    if (!phone || !studentId) {
      return res.status(400).json({ message: "Phone and Student ID are required" });
    }

    // Check if there's a verified email verification record for this student
    const { data: emailVerification, error: checkError } = await supabase
      .from(EMAIL_VERIFICATIONS)
      .select("*")
      .eq("student_id", studentId)
      .eq("phone", phone)
      .eq("verified", true)
      .maybeSingle();

    if (checkError) {
      return res.status(400).json({ message: checkError.message });
    }

    if (!emailVerification) {
      return res.status(403).json({ 
        message: "Email not verified yet. Please verify your email first.",
        verified: false
      });
    }


    const { data: student, error: studentError } = await supabase
      .from(STUDENTS)
      .select("*")
      .eq("id", studentId)
      .maybeSingle();

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (studentError) {
      return res.status(400).json({ message: studentError.message });
    }

    return res.status(200).json({
      message: "Login successful - Email verified",
      success: true,
      verified: true,
      id: student.id,
      name: student.name,
      email: student.email,
      phone: student.phone,
      user_uuid: student.id,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;
