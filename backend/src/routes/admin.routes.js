const router     = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');
const adminCtrl  = require('../controllers/admin.controller');

router.use(authenticate, authorize('admin'));

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Quản trị hệ thống (chỉ admin)
 */

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Danh sách tất cả users
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: role
 *         schema: { type: string, enum: [admin, user] }
 *     responses:
 *       200:
 *         description: Danh sách users có phân trang
 *       403:
 *         description: Không phải admin
 */
router.get('/users', adminCtrl.getAllUsers);

/**
 * @swagger
 * /api/admin/users/{id}/role:
 *   patch:
 *     summary: Thay đổi role của user
 *     tags: [Admin]
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
 *               role:
 *                 type: string
 *                 enum: [admin, user]
 *                 example: admin
 *     responses:
 *       200:
 *         description: Role đã được cập nhật
 *       400:
 *         description: Không thể tự đổi role chính mình
 */
router.patch('/users/:id/role', adminCtrl.changeUserRole);

/**
 * @swagger
 * /api/admin/homes:
 *   get:
 *     summary: Danh sách tất cả homes
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Danh sách homes
 *   post:
 *     summary: Admin tạo home mới cho user
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, ownerUserId]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Nhà của An
 *               ownerUserId:
 *                 type: string
 *                 example: 664abc123def456
 *     responses:
 *       201:
 *         description: Home đã được tạo
 */
router.get('/homes',  adminCtrl.getAllHomes);
router.post('/homes', adminCtrl.createHome);

/**
 * @swagger
 * /api/admin/homes/{homeId}/users:
 *   post:
 *     summary: Thêm user vào home
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: homeId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId]
 *             properties:
 *               userId:
 *                 type: string
 *               asOwner:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       200:
 *         description: User đã được thêm vào home
 */
router.post('/homes/:homeId/users', adminCtrl.addUserToHome);

/**
 * @swagger
 * /api/admin/homes/{homeId}/users/{userId}:
 *   delete:
 *     summary: Xóa user khỏi home
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: homeId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: User đã bị xóa khỏi home
 *       400:
 *         description: Không thể xóa owner cuối cùng
 */
router.delete('/homes/:homeId/users/:userId', adminCtrl.removeUserFromHome);

/**
 * @swagger
 * /api/admin/devices:
 *   get:
 *     summary: Danh sách tất cả devices trong hệ thống
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: homeId
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Danh sách devices
 */
router.get('/devices',              adminCtrl.getAllDevices);

/**
 * @swagger
 * /api/admin/devices/unassigned:
 *   get:
 *     summary: Devices mới từ ESP32 chưa được gán vào home
 *     tags: [Admin]
 *     description: Khi ESP32 gửi data lần đầu, device tự tạo với homeId = null. Admin cần gán vào đúng home.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách devices chưa gán
 */
router.get('/devices/unassigned',   adminCtrl.getUnassignedDevices);

/**
 * @swagger
 * /api/admin/devices/{id}/assign:
 *   patch:
 *     summary: Gán device vào home (sau khi ESP32 tự đăng ký)
 *     tags: [Admin]
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
 *             required: [homeId]
 *             properties:
 *               homeId:
 *                 type: string
 *               areaId:
 *                 type: string
 *                 description: Tuỳ chọn — gán luôn vào area
 *     responses:
 *       200:
 *         description: Device đã được gán vào home
 */
router.patch('/devices/:id/assign', adminCtrl.assignDeviceToHome);

module.exports = router;
