const router        = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const alertCtrl     = require('../controllers/alert.controller');

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Alerts
 *   description: Thông báo khi ThresholdRule bị kích hoạt
 */

/**
 * @swagger
 * /api/alerts:
 *   get:
 *     summary: Danh sách alerts của home (phân trang)
 *     tags: [Alerts]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: homeId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: isRead
 *         schema: { type: boolean }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *     responses:
 *       200:
 *         description: Danh sách alerts có phân trang
 */
router.get('/', alertCtrl.getAlerts);

/**
 * @swagger
 * /api/alerts/read-all:
 *   patch:
 *     summary: Đánh dấu tất cả alerts là đã đọc
 *     tags: [Alerts]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: homeId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Số alerts đã được cập nhật
 */
router.patch('/read-all', alertCtrl.markAllRead);

/**
 * @swagger
 * /api/alerts/{id}/read:
 *   patch:
 *     summary: Đánh dấu 1 alert là đã đọc
 *     tags: [Alerts]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Alert đã được đánh dấu đọc
 */
router.patch('/:id/read', alertCtrl.markAsRead);

module.exports = router;
