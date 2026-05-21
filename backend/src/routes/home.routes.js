const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');
const homeCtrl   = require('../controllers/home.controller');

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Homes & Areas
 *   description: Quản lý nhà và khu vực
 */

/**
 * @swagger
 * /api/homes:
 *   post:
 *     summary: Tạo nhà mới
 *     tags: [Homes & Areas]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Nhà Hà Nội
 *     responses:
 *       201:
 *         description: Tạo thành công
 */
router.post('/', homeCtrl.createHome);

/**
 * @swagger
 * /api/homes/mine:
 *   get:
 *     summary: Danh sách nhà của tôi (owner + member)
 *     tags: [Homes & Areas]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách homes
 */
router.get('/mine', homeCtrl.getUserHomes);

/**
 * @swagger
 * /api/homes/{homeId}:
 *   get:
 *     summary: Chi tiết 1 nhà
 *     tags: [Homes & Areas]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: homeId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Chi tiết home
 *       404:
 *         description: Không tìm thấy
 */
router.get('/:homeId', homeCtrl.getHomeById);

/**
 * @swagger
 * /api/homes/{homeId}/areas:
 *   post:
 *     summary: Tạo khu vực mới trong nhà
 *     tags: [Homes & Areas]
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
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Phòng khách
 *               description:
 *                 type: string
 *                 example: Khu vực sinh hoạt chính
 *     responses:
 *       201:
 *         description: Area đã được tạo
 *   get:
 *     summary: Danh sách khu vực trong nhà (kèm số device)
 *     tags: [Homes & Areas]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: homeId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Danh sách areas
 */
router.post('/:homeId/areas', homeCtrl.createArea);
router.get('/:homeId/areas',  homeCtrl.getAreasByHome);

/**
 * @swagger
 * /api/homes/{homeId}/areas/{areaId}:
 *   get:
 *     summary: Chi tiết area (kèm danh sách devices bên trong)
 *     tags: [Homes & Areas]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: homeId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: areaId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Chi tiết area kèm devices
 *   patch:
 *     summary: Cập nhật area
 *     tags: [Homes & Areas]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: homeId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: areaId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Area đã cập nhật
 *   delete:
 *     summary: Xóa area (devices bên trong sẽ bị unassign)
 *     tags: [Homes & Areas]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: homeId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: areaId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Area đã xóa
 */
router.get('/:homeId/areas/:areaId',    homeCtrl.getAreaById);
router.patch('/:homeId/areas/:areaId',  homeCtrl.updateArea);
router.delete('/:homeId/areas/:areaId', homeCtrl.deleteArea);

module.exports = router;
