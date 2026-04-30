const router = require('express').Router();
const prisma = require('../prisma');
const auth = require('../middleware/auth');
const { audit } = require('../services/audit');
router.use(auth);

router.get('/', async (_, res) => {
  res.json(await prisma.room.findMany({ where: { active: true }, include: { doctor: true, devices: true }, orderBy: { name: 'asc' } }));
});

router.post('/', async (req, res) => {
  const r = await prisma.room.create({ data: req.body, include: { doctor: true, devices: true } });
  await audit(req.user.id, 'CREATE', 'Room', r.id, r);
  req.app.get('io').emit('rooms:changed');
  res.json(r);
});

router.put('/:id', async (req, res) => {
  const r = await prisma.room.update({ where: { id: req.params.id }, data: req.body, include: { doctor: true, devices: true } });
  await audit(req.user.id, 'UPDATE', 'Room', r.id, req.body);
  const io = req.app.get('io');
  r.devices.forEach(d => io.to(`device:${d.deviceCode}`).emit('display:update'));
  io.emit('display:changed');
  io.emit('rooms:changed');
  res.json(r);
});

router.patch('/:id/status', async (req, res) => {
  const r = await prisma.room.update({ where: { id: req.params.id }, data: { status: req.body.status }, include: { doctor: true, devices: true } });
  await audit(req.user.id, 'STATUS', 'Room', r.id, { status: req.body.status });
  const io = req.app.get('io');
  r.devices.forEach(d => io.to(`device:${d.deviceCode}`).emit('display:update'));
  io.emit('rooms:changed');
  res.json(r);
});

router.delete('/:id', async (req, res) => {
  const r = await prisma.room.update({ where: { id: req.params.id }, data: { active: false, devices: { set: [] } }, include: { devices: true } });
  await audit(req.user.id, 'DEACTIVATE', 'Room', r.id);
  const io = req.app.get('io');
  io.emit('display:changed');
  io.emit('rooms:changed');
  res.json(r);
});

module.exports = router;
