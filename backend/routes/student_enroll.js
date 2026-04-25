const express=require("express");
const supabase=require("../config/supabase")
const router=express.Router();
const { STUDENT_ENROLL } = require("../models/tables");
router.post("/student_enroll", async (req,res)=>{
     const {name,phone_number,email,course}=req.body;
     try{

        const {error:enrollerror}=await supabase
        .from(STUDENT_ENROLL)
        .insert({
            "Full name":name,
            "Phone number":phone_number,
            "Email":email,
            "Course_Intersted":course,
        })

        if(enrollerror){
            return res.status(401).json({ message: `Error in uploading data: ${enrollerror.message}`})
        }
        return res.status(201).json({message:"The Details are recorded, one of team memeber will contact you soon"})

     }catch(err){
        return res.status(500).json({Message:err.Message})
     }
})

module.exports=router;