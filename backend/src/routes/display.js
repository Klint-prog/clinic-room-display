const router=require('express').Router(); const prisma=require('../prisma');
router.get('/:deviceCode',async(req,res)=>{const device=await prisma.device.findUnique({where:{deviceCode:req.params.deviceCode},include:{room:{include:{doctor:true}}}}); if(!device) return res.status(404).json({error:'Dispositivo não encontrado'}); await prisma.device.update({where:{id:device.id},data:{lastSeenAt:new Date(),isOnline:true}}); res.json(device)});
module.exports=router;
