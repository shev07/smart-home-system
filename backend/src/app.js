require('dotenv').config();
const { validateEnv } = require('./config/env');
validateEnv(); // Fail-fast: crash ngay nếu thiếu env var

const express    = require('express');
const http       = require('http');
const { Server } = require('socket.io');
const cors       = require('cors');
const cron       = require('node-cron');

const swaggerUi   = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');

const { connectDB }      = require('./config/db');
const { errorHandler }   = require('./middleware/error.middleware');
const socketService      = require('./services/socket.service');

const swaggerSpec = swaggerJsDoc({
  definition: {
    openapi: '3.0.0',
    info: { title: 'Smart Home API', version: '1.0.0', description: 'Backend API for Smart Home IoT System' },
    servers: [{ url: 'http://localhost:5000', description: 'Local dev server' }],
    components: {
      securitySchemes: {
        BearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        DeviceKey:  { type: 'apiKey', in: 'header', name: 'X-Device-Key' },
      },
    },
  },
  apis: ['./src/routes/*.js'],
});

// ── Routes ─────────────────────────────────────────────────────
const authRoutes      = require('./routes/auth.routes');
const adminRoutes     = require('./routes/admin.routes');
const homeRoutes      = require('./routes/home.routes');
const deviceRoutes    = require('./routes/device.routes');
const sensorRoutes    = require('./routes/sensor.routes');
const thresholdRoutes = require('./routes/threshold.routes');
const scheduleRoutes  = require('./routes/schedule.routes');
const alertRoutes     = require('./routes/alert.routes');

const app    = express();
const server = http.createServer(app);

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (!process.env.CLIENT_URL || process.env.CLIENT_URL === '*') return true;

  const allowedOrigins = new Set([
    process.env.CLIENT_URL,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ]);

  if (allowedOrigins.has(origin)) return true;

  try {
    const url = new URL(origin);
    const isDevPort = url.port === '5173';
    const isLanHost =
      url.hostname.startsWith('192.168.') ||
      url.hostname.startsWith('10.') ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(url.hostname);

    return isDevPort && isLanHost;
  } catch {
    return false;
  }
};

const corsOptions = {
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`CORS blocked origin: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
};

// ── Socket.io setup ─────────────────────────────────────────────
const io = new Server(server, {
  cors: corsOptions,
});
socketService.init(io);

// ── Middleware ──────────────────────────────────────────────────
app.use(cors(corsOptions));
app.use(express.json());

// ── Swagger UI ──────────────────────────────────────────────────
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'Smart Home API Docs',
  swaggerOptions: { persistAuthorization: true },
}));

// ── API Routes ──────────────────────────────────────────────────
app.use('/api/auth',            authRoutes);
app.use('/api/admin',           adminRoutes);
app.use('/api/homes',           homeRoutes);
app.use('/api/devices',         deviceRoutes);
app.use('/api/sensors',         sensorRoutes);
app.use('/api/threshold-rules', thresholdRoutes);
app.use('/api/schedules',       scheduleRoutes);
app.use('/api/alerts',          alertRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'Server is running', data: { uptime: process.uptime() } });
});

// 404 handler cho routes không tồn tại
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found', code: 'NOT_FOUND' });
});

// ── Global Error Handler (PHẢI ở cuối) ─────────────────────────
app.use(errorHandler);

// ── Database & Start server ─────────────────────────────────────
const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();

  // ── Cron job: Schedule executor (chạy mỗi phút) ──────────────
  // Lazy require để tránh circular dependency khi khởi động
  cron.schedule('* * * * *', async () => {
    const automationService = require('./services/automation.service');
    await automationService.executeActiveSchedules();
  });

  server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`🔌 WebSocket ready on ws://localhost:${PORT}`);
  });
};

start();

module.exports = app;
