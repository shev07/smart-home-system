const router        = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const thresholdCtrl = require('../controllers/threshold.controller');

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Threshold Rules
 *   description: Quy tắc tự động hóa theo ngưỡng cảm biến
 */

/**
 * @swagger
 * /api/threshold-rules:
 *   post:
 *     summary: Tạo rule mới
 *     tags: [Threshold Rules]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [deviceId, name, ruleType, dataType, thresholdValue, alertValue]
 *             properties:
 *               deviceId:
 *                 type: string
 *               name:
 *                 type: string
 *                 example: Bật quạt khi nhiệt độ cao
 *               ruleType:
 *                 type: string
 *                 enum: [ALERT_ONLY, AUTO_CONTROL]
 *                 description: ALERT_ONLY chỉ gửi thông báo, AUTO_CONTROL còn điều khiển device
 *               dataType:
 *                 type: string
 *                 example: temperature
 *               thresholdValue:
 *                 type: number
 *                 example: 35
 *               thresholdUnit:
 *                 type: string
 *                 example: "°C"
 *               alertValue:
 *                 type: number
 *                 example: 35
 *               alertUnit:
 *                 type: string
 *                 example: "°C"
 *               action:
 *                 type: string
 *                 enum: [on, off]
 *                 description: Bắt buộc nếu ruleType = AUTO_CONTROL
 *               cooldownTime:
 *                 type: number
 *                 description: Số giây chờ giữa 2 lần trigger
 *                 example: 300
 *     responses:
 *       201:
 *         description: Rule đã được tạo
 *   get:
 *     summary: Danh sách rules của user
 *     tags: [Threshold Rules]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: deviceId
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Danh sách rules
 */
router.post('/', thresholdCtrl.createRule);
router.get('/',  thresholdCtrl.getRules);

/**
 * @swagger
 * /api/threshold-rules/{id}:
 *   get:
 *     summary: Chi tiết rule
 *     tags: [Threshold Rules]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Chi tiết rule
 *   patch:
 *     summary: Cập nhật rule
 *     tags: [Threshold Rules]
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
 *               thresholdValue: { type: number }
 *               action: { type: string, enum: [on, off] }
 *               cooldownTime: { type: number }
 *     responses:
 *       200:
 *         description: Đã cập nhật
 *   delete:
 *     summary: Xóa rule
 *     tags: [Threshold Rules]
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
router.get('/:id',    thresholdCtrl.getRuleById);
router.patch('/:id',  thresholdCtrl.updateRule);
router.delete('/:id', thresholdCtrl.deleteRule);

/**
 * @swagger
 * /api/threshold-rules/{id}/toggle:
 *   patch:
 *     summary: Bật/tắt rule (toggle isActive)
 *     tags: [Threshold Rules]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Trạng thái isActive đã được đảo ngược
 */
router.patch('/:id/toggle', thresholdCtrl.toggleRule);

module.exports = router;
