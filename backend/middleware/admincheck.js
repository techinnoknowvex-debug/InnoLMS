const jwt=require("jsonwebtoken");

const admincheck=async (req,res,next)=>{
    const authHeader = req.headers.authorization;
    if(!authHeader){
        return res.status(401).json({message:"Your not authorized"})
    }
    const token=authHeader.split(" ")[1];
     if (!token) {
    return res.status(401).json({ message: "Invalid token format" });
  }
try{
    const decoded=jwt.verify(token,process.env.SCRT);
    req.user=decoded;
    next();
}catch(err){
    res.status(500).json({message:"Internal server error"});
}
 
}

module.exports=admincheck;
