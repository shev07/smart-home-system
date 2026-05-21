/**
 * env.js — Environment variable validation
 * Fail-fast: nếu thiếu biến quan trọng, server crash ngay khi khởi động
 * thay vì crash âm thầm sau này khi gọi đến function cần biến đó
 */

const REQUIRED_VARS = [
  'MONGODB_URI',
  'JWT_SECRET',
  'PORT',
  'DEVICE_SECRET_KEY',
];

const validateEnv = () => {
  const missing = REQUIRED_VARS.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach((key) => console.error(`   - ${key}`));
    console.error('\n💡 Copy .env.example to .env and fill in the values.');
    process.exit(1);
  }

  console.log('✅ Environment variables validated');
};

module.exports = { validateEnv };
