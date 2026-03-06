const express = require('express');
const app = express();
require("dotenv").config();
app.use(express.json());
const supabase = require("./config/supabase");
const admin=require("./routes/admin");
const student=require("./routes/studentRoutes")
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

app.listen(process.env.PORT,()=>{
    console.log(`server started on the ${process.env.PORT} successfully`);
})

