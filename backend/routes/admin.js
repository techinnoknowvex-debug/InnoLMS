const express=require("express");
const bcrypt=require("bcrypt");
const jwt=require('jsonwebtoken');
const router=express.Router();
require("dotenv").config();


router.post("/admin",async (req,res)=>{
    const {username,password}=req.body;
try{
    if(!username||!password){
        return res.status(401).json({message:"Please provide the all creditials"});
    }
    console.log(process.env.ADMIN_PASSWORD)
    console.log(process.env.ADMIN_USERNAME)
    if(process.env.ADMIN_USERNAME!==username || process.env.ADMIN_PASSWORD!==password){
        return res.status(401).json({message:"Invalid username or password"})
    }

    const token=jwt.sign({username:username,role:"admin"},process.env.SCRT,{expiresIn:"1h"})
    
    const convert_password=bcrypt.compare(password,process.env.ADMIN_PASSWORD);
     if(!convert_password){
        return res.status(401).json({message:"Invalid password"})
     }
    
     return res.status(200).json({message:"Admin login success",token});
}catch(err){
    return res.status(500).json({message:err});
}
})

module.exports=router
