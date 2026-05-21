const router        = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const scheduleCtrl  = require('../controllers/schedule.controller');

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Schedules
 *   description: Lịch tự động điều khiển thiết bị theo thời gian
 */

/**
 * @swagger
 * /api/schedules:
 *   post:
 *     summary: Tạo lịch mới
 *     tags: [Schedules]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, action, startDay, endDay, startTime, endTime, deviceIds]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Bật đèn buổi tối
 *               action:
 *                 type: string
 *                 enum: [on, off]
 *               startDay:
 *                 type: string
 *                 format: date
 *                 example: "2025-01-01"
 *               endDay:
 *                 type: string
 *                 format: date
 *                 example: "2025-12-31"
 *               startTime:
 *                 type: string
 *                 example: "18:00"
 *               endTime:
 *                 type: string
 *                 example: "23:00"
 *               scheduledDays:
 *                 type: array
 *                 items: { type: integer }
 *                 example: [1, 2, 3, 4, 5]
 *                 description: 0=CN, 1=T2, ..., 6=T7
 *               exceptions:
 *                 type: array
 *                 items: { type: string, format: date }
 *               deviceIds:
 *                 type: array
 *                 items: { type: string }
 *     responses:
 *       201:
 *         description: Lịch đã được tạo
 *   get:
 *     summary: Danh sách lịch của user
 *     tags: [Schedules]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách schedules
 */
router.post('/', scheduleCtrl.createSchedule);
router.get('/',  scheduleCtrl.getSchedules);

/**
 * @swagger
 * /api/schedules/{id}:
 *   get:
 *     summary: Chi tiết lịch
 *     tags: [Schedules]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Chi tiết schedule
 *   patch:
 *     summary: Cập nhật lịch
 *     tags: [Schedules]
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
 *               name: { type: string }
 *               startTime: { type: string }
 *               endTime: { type: string }
 *     responses:
 *       200:
 *         description: Đã cập nhật
 *   delete:
 *     summary: Xóa lịch
 *     tags: [Schedules]
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
router.get('/:id',    scheduleCtrl.getScheduleById);
router.patch('/:id',  scheduleCtrl.updateSchedule);
router.delete('/:id', scheduleCtrl.deleteSchedule);

/**
 * @swagger
 * /api/schedules/{id}/toggle:
 *   patch:
 *     summary: Bật/tắt lịch (toggle activeStatus)
 *     tags: [Schedules]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Trạng thái activeStatus đã được đảo ngược
 */
router.patch('/:id/toggle', scheduleCtrl.toggleSchedule);

module.exports = router;
