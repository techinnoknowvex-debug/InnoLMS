const express=require("express");
const supabase = require("../config/supabase");
const { COURSES } = require("../models/tables");

const router=express.Router();

router.post("/addCourse",async (req,res)=>{
    const {title,description,total_weeks, pass_percentage,attendance_required}=req.body
    try{
        if(!title){
            return res.status(401).json({message:"Title is required to add course"})
        }

        const {data:course,error:checkerror}=await supabase
        .from(COURSES)
        .select("*")
        .eq("title",title)
        .single();

        if(course||checkerror){
            return res.status(409).json({message:"Course already exists with the title"});
        }

        const {error:Inserterror}=await supabase
        .from(COURSES)
        .insert([{
            title,
            description,
            total_weeks,
            pass_percentage,
            attendance_required}
        ])
        
        if(Inserterror){
            return res.status(409).json({message:Inserterror.message});
        }
        return res.status().json({message:`Course-${title} added successfully`})

    }catch(err){
        return res.status(500).json({message:err.message});
    }
})

module.exports = router;