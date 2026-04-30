const { PrismaClient, RoomStatus } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const prisma = new PrismaClient();
async function main(){
  const email = process.env.ADMIN_EMAIL || 'admin@clinic.local';
  const pass = process.env.ADMIN_PASSWORD || 'admin123456';
  await prisma.user.upsert({ where:{email}, update:{}, create:{ name:'Administrador', email, passwordHash: await bcrypt.hash(pass,10) }});
  const docs = await Promise.all([
    prisma.doctor.upsert({where:{id:'seed-doc-1'},update:{},create:{id:'seed-doc-1',name:'Dra. Ana Ribeiro',specialty:'Clínica Geral',crm:'CRM 00001'}}),
    prisma.doctor.upsert({where:{id:'seed-doc-2'},update:{},create:{id:'seed-doc-2',name:'Dr. Bruno Costa',specialty:'Cardiologia',crm:'CRM 00002'}}),
    prisma.doctor.upsert({where:{id:'seed-doc-3'},update:{},create:{id:'seed-doc-3',name:'Dra. Camila Souza',specialty:'Dermatologia',crm:'CRM 00003'}})
  ]);
  for (let i=1;i<=3;i++) await prisma.room.upsert({where:{id:`seed-room-${i}`},update:{},create:{id:`seed-room-${i}`,name:`Sala ${i}`,floor:'Térreo',doctorId:docs[i-1].id,status:i===1?RoomStatus.IN_SERVICE:RoomStatus.AVAILABLE}});
  for (let i=1;i<=3;i++) await prisma.device.upsert({where:{deviceCode:`tablet-sala-${i}`},update:{},create:{name:`Tablet Sala ${i}`,deviceCode:`tablet-sala-${i}`,pairingCode:`PAIR-${i}000`,roomId:`seed-room-${i}`}});
}
main().finally(()=>prisma.$disconnect());
