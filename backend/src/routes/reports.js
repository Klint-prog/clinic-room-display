const router = require('express').Router();
const PDFDocument = require('pdfkit');
const prisma = require('../prisma');
const auth = require('../middleware/auth');

router.use(auth);

const statusLabels = {
  AVAILABLE: 'Disponível',
  IN_SERVICE: 'Em atendimento',
  PAUSED: 'Em pausa',
  CLOSED: 'Encerrado',
  UNAVAILABLE: 'Indisponível'
};

async function getSummary() {
  const [doctors, rooms, devices, logs] = await Promise.all([
    prisma.doctor.findMany({ where: { active: true }, orderBy: { name: 'asc' } }),
    prisma.room.findMany({ where: { active: true }, include: { doctor: true, devices: true }, orderBy: { name: 'asc' } }),
    prisma.device.findMany({ include: { room: true }, orderBy: { name: 'asc' } }),
    prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 20, include: { user: true } })
  ]);

  const roomsByStatus = rooms.reduce((acc, room) => {
    acc[room.status] = (acc[room.status] || 0) + 1;
    return acc;
  }, {});

  return {
    generatedAt: new Date().toISOString(),
    totals: {
      doctors: doctors.length,
      rooms: rooms.length,
      devices: devices.length,
      onlineDevices: devices.filter(d => d.isOnline).length,
      roomsInService: rooms.filter(r => r.status === 'IN_SERVICE').length
    },
    roomsByStatus,
    rooms,
    devices,
    logs
  };
}

router.get('/summary', async (_, res) => {
  res.json(await getSummary());
});

router.get('/summary.pdf', async (_, res) => {
  const report = await getSummary();
  const doc = new PDFDocument({ margin: 42, size: 'A4' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="relatorio-clinic-room-display.pdf"');
  doc.pipe(res);

  doc.fontSize(20).text('Relatório - Clinic Room Display', { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(10).fillColor('#6b7280').text(`Gerado em: ${new Date(report.generatedAt).toLocaleString('pt-BR')}`, { align: 'center' });
  doc.moveDown(1.5).fillColor('#111827');

  doc.fontSize(14).text('Resumo geral');
  doc.moveDown(0.5);
  [
    ['Médicos ativos', report.totals.doctors],
    ['Salas ativas', report.totals.rooms],
    ['Tablets cadastrados', report.totals.devices],
    ['Tablets online', report.totals.onlineDevices],
    ['Salas em atendimento', report.totals.roomsInService]
  ].forEach(([label, value]) => doc.fontSize(11).text(`${label}: ${value}`));

  doc.moveDown(1.2);
  doc.fontSize(14).text('Salas');
  doc.moveDown(0.5);
  report.rooms.forEach(room => {
    const doctor = room.doctor ? room.doctor.name : 'Sem médico vinculado';
    const devices = room.devices.length ? room.devices.map(d => d.name).join(', ') : 'Sem tablet';
    doc.fontSize(10).fillColor('#111827').text(`${room.name} - ${statusLabels[room.status] || room.status}`);
    doc.fillColor('#4b5563').text(`Médico: ${doctor} | Andar/setor: ${room.floor || '-'} | Tablets: ${devices}`);
    doc.moveDown(0.35);
  });

  doc.moveDown(0.7);
  doc.fillColor('#111827').fontSize(14).text('Tablets');
  doc.moveDown(0.5);
  report.devices.forEach(device => {
    doc.fontSize(10).fillColor('#111827').text(`${device.name} - ${device.isOnline ? 'Online' : 'Offline'}`);
    doc.fillColor('#4b5563').text(`Código: ${device.deviceCode} | Sala: ${device.room?.name || 'Sem sala'}`);
    doc.moveDown(0.35);
  });

  doc.end();
});

module.exports = router;
