const express = require('express');
const cors=require("cors")
const app = express();
require("dotenv").config();
app.use(express.json());
app.use(cors());
app.use(express.static('public'));
const supabase = require("./config/supabase");
const admin=require("./routes/admin");
const student=require("./routes/studentRoutes")
const course=require("./routes/courseRoute");
const enroll=require("./routes/enrollRoute");
const classes=require("./routes/classesRoute");
const quize=require("./routes/quizeRoute");
const stats=require("./routes/statsRoute");
const login=require("./routes/login")
const st_enroll=require("./routes/student_enroll")
const otp=require("./routes/otp")
const devices=require("./routes/devices")
const courseVerification=require("./routes/courseVerification")
const emailVerification=require("./routes/emailVerification")
const mentorSessions=require("./routes/mentorSessions")

//supabase checking
supabase.from('students').select('count').limit(1)
  .then(() => {
    console.log("Supabase connected successfully");
  })
  .catch((err) => {
    console.error("Supabase connection failed:", err);
  });


//health check
app.get("/hc",(req,res)=>{
    res.send("Health check done")
})

app.use("/LMS",admin)
app.use("/LMS",student)
app.use("/LMS",course)
app.use("/LMS",enroll)
app.use("/LMS",classes)
app.use("/LMS",quize)
app.use("/LMS",enroll)
app.use("/LMS",classes)
app.use("/LMS",quize)
app.use("/LMS",stats)
app.use("/LMS",login)
app.use("/LMS",st_enroll)
app.use("/LMS",otp)
app.use("/LMS",devices)
app.use("/LMS",courseVerification)
app.use("/LMS",emailVerification)
app.use("/LMS",mentorSessions)


app.listen(process.env.PORT,()=>{
    console.log(`server started on the ${process.env.PORT} successfully`);
})

