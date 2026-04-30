const prisma = require('../prisma');
async function audit(userId, action, entity, entityId, metadata={}){
  try { await prisma.auditLog.create({data:{userId, action, entity, entityId, metadata}}); } catch(e){ console.error(e.message); }
}
module.exports = { audit };
