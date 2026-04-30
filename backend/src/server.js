require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const { Server } = require('socket.io');
const prisma = require('./prisma');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
app.set('io', io);
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use('/uploads', express.static(process.env.UPLOAD_DIR || path.join(__dirname,'uploads')));

io.on('connection', (socket) => {
  socket.on('device:join', async (deviceCode) => {
    socket.join(`device:${deviceCode}`);
    await prisma.device.updateMany({ where:{deviceCode}, data:{isOnline:true,lastSeenAt:new Date()} });
    io.emit('devices:changed');
  });
  socket.on('disconnect', () => io.emit('devices:changed'));
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/doctors', require('./routes/doctors'));
app.use('/api/rooms', require('./routes/rooms'));
app.use('/api/devices', require('./routes/devices'));
app.use('/api/display', require('./routes/display'));
app.use('/api/reports', require('./routes/reports'));
app.get('/health', (_,res)=>res.json({ok:true}));

const port = process.env.PORT || 4000;
server.listen(port, () => console.log(`Backend running on :${port}`));
