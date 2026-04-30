const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../prisma');
router.post('/login', async (req,res)=>{
  const {email,password}=req.body;
  const user=await prisma.user.findUnique({where:{email}});
  if(!user || !(await bcrypt.compare(password,user.passwordHash))) return res.status(401).json({error:'Credenciais inválidas'});
  const token=jwt.sign({id:user.id,email:user.email,role:user.role},process.env.JWT_SECRET,{expiresIn:'8h'});
  res.json({token,user:{id:user.id,name:user.name,email:user.email,role:user.role}});
});
module.exports=router;
