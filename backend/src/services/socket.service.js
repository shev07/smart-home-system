/**
 * socket.service.js — Socket.io room manager & emit helpers
 *
 * Strategy: Room-based per homeId
 * - Mỗi frontend client join room "home:{homeId}" sau khi authenticate
 * - Khi có event (sensor data, alert, device ack...) → emit đến đúng room
 * - Không cần track từng connection thủ công
 */

let _io = null;

/**
 * Khởi tạo socket service với io instance
 * Gọi một lần duy nhất trong app.js sau khi tạo server
 * @param {import('socket.io').Server} io
 */
const init = (io) => {
  _io = io;

  io.on('connection', (socket) => {
    // Client yêu cầu join room của một home cụ thể
    socket.on('subscribe:home', ({ homeId }) => {
      if (!homeId) return;
      socket.join(`home:${homeId}`);
      socket.emit('subscribed', { homeId, message: `Joined home:${homeId}` });
    });

    socket.on('disconnect', () => {
      // socket.io tự xử lý cleanup khi disconnect
    });
  });
};

/**
 * Emit event đến tất cả clients đang theo dõi home này
 * @param {string} homeId
 * @param {string} event   - Tên event (từ WS_EVENTS constants)
 * @param {object} payload - Data đính kèm
 */
const emitToHome = (homeId, event, payload) => {
  if (!_io) return;
  _io.to(`home:${homeId}`).emit(event, payload);
};

/**
 * Broadcast đến tất cả client (dùng cho global announcements)
 * @param {string} event
 * @param {object} payload
 */
const broadcast = (event, payload) => {
  if (!_io) return;
  _io.emit(event, payload);
};

module.exports = { init, emitToHome, broadcast };
