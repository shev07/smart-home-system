const router = require('express').Router();
const { authenticate, deviceAuth } = require('../middleware/auth.middleware');
const sensorCtrl = require('../controllers/sensor.controller');

/**
 * @swagger
 * tags:
 *   name: Sensors
 *   description: Dữ liệu cảm biến — ESP32 push + FE đọc
 */

/**
 * @swagger
 * /api/sensors/data:
 *   post:
 *     summary: "[ESP32] Gửi dữ liệu cảm biến — tự động tạo Device/SensorDevice nếu chưa tồn tại"
 *     tags: [Sensors]
 *     description: |
 *       ESP32 gửi payload với `deviceId` là string ID vật lý (VD: "esp32-01").
 *       - Nếu Device chưa tồn tại → **tự động tạo mới** với `homeId = null`
 *       - Nếu SensorDevice chưa có → **tự động tạo** cho từng sensor type
 *       - Chỉ emit WebSocket + trigger automation nếu device đã được gán vào home
 *     security:
 *       - DeviceKey: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [deviceId]
 *             properties:
 *               deviceId:
 *                 type: string
 *                 example: "esp32-01"
 *                 description: String ID vật lý của thiết bị ESP32
 *               temperature:
 *                 type: number
 *                 example: 28.50
 *               humidity:
 *                 type: number
 *                 example: 65.30
 *               anomalyScore:
 *                 type: number
 *                 example: 0.28
 *               dataQuality:
 *                 type: number
 *                 example: 0.98
 *     responses:
 *       201:
 *         description: Dữ liệu đã lưu — trả về danh sách sensor records đã ghi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 deviceId:
 *                   type: string
 *                   description: MongoDB ObjectId của Device
 *                 externalId:
 *                   type: string
 *                   example: esp32-01
 *                 isNewDevice:
 *                   type: boolean
 *                   description: true nếu device vừa được tạo mới (chưa gán home)
 *                 records:
 *                   type: array
 *                   items:
 *                     type: object
 */
router.post('/data', deviceAuth, sensorCtrl.ingestData);

router.use(authenticate);

/**
 * @swagger
 * /api/sensors/latest:
 *   get:
 *     summary: Giá trị cảm biến mới nhất của device (cho Dashboard)
 *     tags: [Sensors]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: deviceId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Danh sách SensorDevices kèm giá trị mới nhất
 */
router.get('/latest', sensorCtrl.getLatest);

/**
 * @swagger
 * /api/sensors/history:
 *   get:
 *     summary: Lịch sử dữ liệu cảm biến (cho Recharts)
 *     tags: [Sensors]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sensorDeviceId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 50 }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *     responses:
 *       200:
 *         description: Dữ liệu lịch sử có phân trang
 */
router.get('/history', sensorCtrl.getHistory);

/**
 * @swagger
 * /api/sensors/devices:
 *   get:
 *     summary: Danh sách SensorDevices của 1 Device
 *     tags: [Sensors]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: deviceId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Danh sách sensor sub-devices
 */
router.get('/devices', sensorCtrl.getSensorDevices);

/**
 * @swagger
 * /api/sensors/devices/{id}/status:
 *   patch:
 *     summary: Cập nhật connectionStatus của SensorDevice
 *     tags: [Sensors]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               connectionStatus:
 *                 type: string
 *               activeStatus:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Đã cập nhật
 */
router.patch('/devices/:id/status', sensorCtrl.updateSensorDeviceStatus);

module.exports = router;
