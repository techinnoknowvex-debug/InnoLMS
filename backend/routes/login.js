const express=require("express")
const supabase=require("../config/supabase")
const {STUDENTS}=require("../models/tables")
const router=express.Router();

router.post("/login", async (req,res)=>{
     const {email,unicode}=req.body;
    try{

        if(!email ||!unicode){
            return res.status(409).json({message:"email & unicode required"})
        }
        const {data:student,error:studenterror}= await supabase
        .from(STUDENTS)
        .select("email,unicode")
        .eq("email",email)
        .eq("unicode",unicode)
        .maybeSingle();
        if(!student){
            return res.status(401).json({message:"plase check the email and unicode"});
        }
        if(studenterror){
            return res.status(400).json({message:studenterror.message});
        }
        return res.status(200).json({message:"Login success"})

    }catch(err){
          return res.status(500).json({message:err.message})
    }
})

module.exports=router;