const router = require('express').Router();
const { authenticate, deviceAuth } = require('../middleware/auth.middleware');
const deviceCtrl = require('../controllers/device.controller');

/**
 * @swagger
 * tags:
 *   name: Devices
 *   description: Quản lý thiết bị và điều khiển
 */

/**
 * @swagger
 * /api/devices/command:
 *   get:
 *     summary: "[ESP32] Poll lệnh pending của device"
 *     tags: [Devices]
 *     security:
 *       - DeviceKey: []
 *     parameters:
 *       - in: query
 *         name: deviceId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Lệnh cần thực thi
 *       204:
 *         description: Không có lệnh nào đang chờ
 */
router.get('/command',  deviceAuth, deviceCtrl.pollCommand);

/**
 * @swagger
 * /api/devices/command/ack:
 *   post:
 *     summary: "[ESP32] Xác nhận đã thực thi lệnh"
 *     tags: [Devices]
 *     security:
 *       - DeviceKey: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [commandId, success]
 *             properties:
 *               commandId:
 *                 type: string
 *               success:
 *                 type: boolean
 *               message:
 *                 type: string
 *                 example: OK
 *     responses:
 *       200:
 *         description: Xác nhận thành công
 */
router.post('/command/ack', deviceAuth, deviceCtrl.acknowledgeCommand);

router.use(authenticate);

/**
 * @swagger
 * /api/devices:
 *   get:
 *     summary: Danh sách devices trong home
 *     tags: [Devices]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: homeId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: unassigned
 *         description: Chỉ lấy devices chưa thuộc area nào
 *         schema: { type: boolean }
 *     responses:
 *       200:
 *         description: Danh sách devices
 *   post:
 *     summary: Thêm device mới vào home
 *     tags: [Devices]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [homeId, name, type]
 *             properties:
 *               homeId:
 *                 type: string
 *               name:
 *                 type: string
 *                 example: Quạt phòng khách
 *               type:
 *                 type: string
 *                 enum: [light, fan]
 *               areaId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Device đã được thêm
 */
router.get('/',  deviceCtrl.getDevicesByHome);
router.post('/', deviceCtrl.addDevice);

/**
 * @swagger
 * /api/devices/{id}:
 *   get:
 *     summary: Chi tiết device
 *     tags: [Devices]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Chi tiết device
 *   delete:
 *     summary: Xóa device
 *     tags: [Devices]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Đã xóa
 */
router.get('/:id',    deviceCtrl.getDeviceById);
router.delete('/:id', deviceCtrl.deleteDevice);

/**
 * @swagger
 * /api/devices/{id}/status:
 *   patch:
 *     summary: Điều khiển device (FE → tạo CommandQueue → ESP32)
 *     tags: [Devices]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [action]
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [on, off]
 *     responses:
 *       200:
 *         description: Lệnh đã được tạo, trả về commandId
 */
router.patch('/:id/status', deviceCtrl.controlDevice);

/**
 * @swagger
 * /api/devices/{id}/area:
 *   patch:
 *     summary: Gán/xóa device khỏi area
 *     tags: [Devices]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               areaId:
 *                 type: string
 *                 description: null để unassign khỏi area
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Area đã được cập nhật
 */
router.patch('/:id/area', deviceCtrl.updateDeviceArea);

module.exports = router;
