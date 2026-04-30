const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const prisma = require('../prisma');
const auth = require('../middleware/auth');
const { audit } = require('../services/audit');

const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '../uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (_, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/[^a-zA-Z0-9.]/g, '_'))
});
const upload = multer({ storage });

router.use(auth);

router.get('/', async (_, res) => {
  res.json(await prisma.doctor.findMany({
    where: { active: true },
    orderBy: { name: 'asc' }
  }));
});

router.post('/', async (req, res) => {
  const d = await prisma.doctor.create({ data: req.body });
  await audit(req.user.id, 'CREATE', 'Doctor', d.id, d);
  req.app.get('io').emit('display:changed');
  res.json(d);
});

router.put('/:id', async (req, res) => {
  const d = await prisma.doctor.update({ where: { id: req.params.id }, data: req.body });
  await audit(req.user.id, 'UPDATE', 'Doctor', d.id, req.body);
  req.app.get('io').emit('display:changed');
  res.json(d);
});

router.delete('/:id', async (req, res) => {
  const doctorId = req.params.id;

  const linkedRooms = await prisma.room.findMany({
    where: { doctorId, active: true },
    include: { devices: true }
  });

  const d = await prisma.$transaction(async (tx) => {
    await tx.room.updateMany({
      where: { doctorId },
      data: { doctorId: null }
    });

    return tx.doctor.update({
      where: { id: doctorId },
      data: { active: false }
    });
  });

  await audit(req.user.id, 'DEACTIVATE', 'Doctor', d.id, {
    unlinkedRooms: linkedRooms.map(r => r.id)
  });

  const io = req.app.get('io');
  linkedRooms.forEach(room => {
    room.devices.forEach(device => io.to(`device:${device.deviceCode}`).emit('display:update'));
  });
  io.emit('display:changed');
  io.emit('rooms:changed');

  res.json(d);
});

router.post('/:id/photo', upload.single('photo'), async (req, res) => {
  const photoUrl = `/uploads/${req.file.filename}`;
  const d = await prisma.doctor.update({ where: { id: req.params.id }, data: { photoUrl } });
  req.app.get('io').emit('display:changed');
  res.json(d);
});

module.exports = router;
