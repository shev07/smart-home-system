const router = require('express').Router();
const { authenticate }  = require('../middleware/auth.middleware');
const { validateBody }  = require('../middleware/validate.middleware');
const {
  registerSchema,
  loginSchema,
  recoveryVerifySchema,
  resetPasswordSchema,
} = require('../validators/auth.validator');
const authController    = require('../controllers/auth.controller');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Xác thực người dùng
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Đăng ký tài khoản mới
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, passwordHash]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Nguyen Van A
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               passwordHash:
 *                 type: string
 *                 example: password123
 *               phoneNumber:
 *                 type: string
 *                 example: "0901234567"
 *     responses:
 *       201:
 *         description: Đăng ký thành công, trả về token
 *       409:
 *         description: Email đã tồn tại
 */
router.post('/register', validateBody(registerSchema), authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Đăng nhập
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login thành công, trả về JWT token
 *       401:
 *         description: Sai email hoặc mật khẩu
 */
router.post('/login', validateBody(loginSchema), authController.login);

router.post('/forgot-password/verify', validateBody(recoveryVerifySchema), authController.verifyRecoveryIdentity);
router.post('/reset-password', validateBody(resetPasswordSchema), authController.resetPassword);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Lấy thông tin người dùng hiện tại
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Thông tin user
 *       401:
 *         description: Chưa đăng nhập
 */
router.get('/me', authenticate, authController.getMe);

module.exports = router;
