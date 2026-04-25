const express=require("express");
const supabase = require("../config/supabase");
const { COURSES } = require("../models/tables");
const admincheck = require("../middleware/admincheck");

const router=express.Router();

router.post("/addCourse", admincheck, async (req, res) => {
    const { course_id, title, description, total_weeks, pass_percentage, attendance_required } = req.body;

    try {
        if (!title) {
            return res.status(400).json({ message: "Title is required to add course" });
        }

        if (!course_id) {
            return res.status(400).json({ message: "Course ID is required to add course" });
        }

        // Check if course_id already exists
        const { data: existingCourse, error: checkError } = await supabase
            .from(COURSES)
            .select("id")
            .eq("course_id", course_id)
            .maybeSingle();

        if (checkError) {
            return res.status(500).json({ message: checkError.message });
        }

        if (existingCourse) {
            return res.status(409).json({ message: "Course with this Course ID already exists" });
        }

        // Check if title already exists
        const { data: titleExists, error: titleCheckError } = await supabase
            .from(COURSES)
            .select("id")
            .eq("title", title)
            .maybeSingle();

        if (titleCheckError) {
            return res.status(500).json({ message: titleCheckError.message });
        }

        if (titleExists) {
            return res.status(409).json({ message: "Course already exists with this title" });
        }

        const { error: insertError } = await supabase
            .from(COURSES)
            .insert([
                {
                    course_id,
                    title,
                    description,
                    total_weeks,
                    pass_percentage,
                    attendance_required
                }
            ]);

        if (insertError) {
            return res.status(500).json({ message: insertError.message });
        }

        return res.status(201).json({
            message: `Course ${title} added successfully with Course ID: ${course_id}`
        });

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

router.get("/course",async (req,res)=>{
    try{
        const {data:courses,error:courses_error}=await supabase
        .from(COURSES)
        .select("*");

        if(!courses||courses_error){
            return res.status(401).json({message:"Error in fetching course data"});
        }

        return res.status(200).json({message:"Courses are displayed succesfully",courses})
    }catch(err){
        return res.status(500).json({message:err.message})
    }
})

router.get("/course/:id",async (req,res)=>{
    const {id}=req.params;
    try{
        const {data:course,error:courses_error}=await supabase
        .from(COURSES)
        .select("*")
        .eq("id",id);

        if(!course||courses_error){
            return res.status(401).json({message:"Error in course data"});
        }
        
        return res.status(200).json({message:"Courses are displayed succesfully",course})
    }catch(err){
        return res.status(500).json({message:err.message})
    }
})

module.exports = router;