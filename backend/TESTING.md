# 📋 Smart Home Backend — Tài liệu kiểm thử & vận hành

> **Stack**: Node.js + Express 5 + MongoDB Atlas + Socket.io  
> **Swagger UI**: http://localhost:5000/api-docs  
> **Server**: http://localhost:5000

---

## 🛠️ Yêu cầu hệ thống

| Công cụ | Phiên bản tối thiểu | Kiểm tra |
|---|---|---|
| Node.js | v18+ | `node -v` |
| npm | v9+ | `npm -v` |
| Git | bất kỳ | `git --version` |
| MongoDB Atlas | account free | [mongodb.com/atlas](https://www.mongodb.com/atlas) |

---

## 🚀 Cách chạy chương trình

### Lần đầu tiên (First-time setup)

**Bước 1 — Clone & cài dependencies**
```bash
# Di chuyển vào thư mục backend
cd smart-home-backend

# Cài tất cả packages
npm install
```

**Bước 2 — Tạo file `.env`**
```bash
# Copy file mẫu
copy .env.example .env
```

Sau đó mở `.env` và điền đầy đủ:
```env
PORT=5000
NODE_ENV=development

MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?appName=Cluster0

JWT_SECRET=your_super_secret_jwt_key_at_least_32_chars

# Key ESP32 dùng để xác thực — đặt gì cũng được, nhớ để trùng với ESP32
DEVICE_SECRET_KEY=smart_home_esp32_secret_key

# Origin của Frontend (để CORS + Socket.io không bị block)
CLIENT_URL=http://localhost:3000
```

> 💡 **Lấy `MONGODB_URI`**: Vào [MongoDB Atlas](https://cloud.mongodb.com) → Cluster → Connect → Drivers → Copy connection string

**Bước 3 — Chạy server**
```bash
npm run dev
```

**Kết quả thành công:**
```
[nodemon] starting `node src/app.js`
✅ Environment variables validated
✅ MongoDB connected: cluster0-shard-00-00.xxxxx.mongodb.net
🚀 Server running on http://localhost:5000
🔌 WebSocket ready on ws://localhost:5000
```

---

### Chạy hàng ngày (Daily usage)

```bash
cd smart-home-backend
npm run dev
```

Sau đó mở trình duyệt: **http://localhost:5000/api-docs**

---

### Các lệnh npm

| Lệnh | Dùng khi nào |
|---|---|
| `npm run dev` | Phát triển — tự restart khi sửa code (dùng nodemon) |
| `npm start` | Chạy production — không tự restart |
| `npm install` | Sau khi pull code mới hoặc lần đầu setup |

---

### ❌ Lỗi thường gặp khi chạy

| Lỗi | Nguyên nhân | Cách sửa |
|---|---|---|
| `Missing required env vars` | Thiếu biến trong `.env` | Kiểm tra `.env` đủ 5 biến chưa |
| `MongoServerError: bad auth` | Sai username/password Atlas | Vào Atlas → Database Access → kiểm tra lại |
| `EADDRINUSE: port 5000` | Port đang bị dùng | Chạy `npx kill-port 5000` rồi thử lại |
| `Cannot find module` | Chưa `npm install` | Chạy `npm install` |
| `JsonWebTokenError` | Token sai hoặc hết hạn | Đăng nhập lại để lấy token mới |




## 👤 Hệ thống phân quyền

```
admin → Toàn quyền: xem tất cả, quản lý users/homes/devices
user  → Chỉ truy cập homes được gán vào (owner hoặc member)
ESP32 → Dùng header X-Device-Key thay JWT
```

**Tạo admin đầu tiên:**
1. Register user bình thường qua Swagger
2. Vào MongoDB Atlas → Collection `users` → Tìm user vừa tạo → Sửa `role: "admin"`
3. Login lại → copy token mới → paste vào Swagger Authorize

---

## 🧪 Quy trình test từng bước

### BƯỚC 1 — Auth

| # | Endpoint | Body | Kết quả mong đợi |
|---|---|---|---|
| 1.1 | `POST /api/auth/register` | `{"name":"Test","email":"test@test.com","passwordHash":"123456"}` | 201, trả `token` |
| 1.2 | `POST /api/auth/login` | `{"email":"test@test.com","password":"123456"}` | 200, `token` mới |
| 1.3 | `GET /api/auth/me` | — (cần Bearer token) | 200, thông tin user |

> 💡 **Swagger**: Sau khi login, copy `data.token` → Click **Authorize 🔒** → Paste vào `BearerAuth`

---

### BƯỚC 2 — Admin setup (cần role admin)

| # | Endpoint | Body | Kết quả mong đợi |
|---|---|---|---|
| 2.1 | `GET /api/admin/users` | — | Danh sách users |
| 2.2 | `PATCH /api/admin/users/:id/role` | `{"role":"admin"}` | User được nâng admin |
| 2.3 | `POST /api/admin/homes` | `{"name":"Nhà mẫu","ownerUserId":"<userId>"}` | Home tạo thành công |
| 2.4 | `GET /api/admin/homes` | — | Danh sách tất cả homes |

---

### BƯỚC 3 — Home & Area (user thường)

| # | Endpoint | Body | Kết quả mong đợi |
|---|---|---|---|
| 3.1 | `POST /api/homes` | `{"name":"Nhà tôi"}` | 201, home mới |
| 3.2 | `GET /api/homes/mine` | — | Danh sách homes của tôi |
| 3.3 | `POST /api/homes/:homeId/areas` | `{"name":"Phòng khách","description":"Khu vực chính"}` | 201, area mới |
| 3.4 | `GET /api/homes/:homeId/areas` | — | Danh sách areas + `deviceCount` |
| 3.5 | `GET /api/homes/:homeId/areas/:areaId` | — | Area + `devices[]` bên trong |

---

### BƯỚC 4 — Device management

| # | Endpoint | Body/Query | Kết quả mong đợi |
|---|---|---|---|
| 4.1 | `POST /api/devices` | `{"homeId":"...","name":"Đèn phòng khách","type":"light"}` | Device mới |
| 4.2 | `GET /api/devices?homeId=...` | — | Danh sách devices |
| 4.3 | `GET /api/devices?homeId=...&unassigned=true` | — | Chỉ devices chưa có area |
| 4.4 | `PATCH /api/devices/:id/area` | `{"areaId":"..."}` | Gán device vào area |
| 4.5 | `PATCH /api/devices/:id/area` | `{"areaId":null}` | Unassign khỏi area |
| 4.6 | `PATCH /api/devices/:id/status` | `{"action":"on"}` | Tạo CommandQueue → trả `commandId` |
| 4.7 | `DELETE /api/devices/:id` | — | Xóa device |

---

### BƯỚC 5 — Giả lập ESP32 gửi sensor data

> **Header bắt buộc**: `X-Device-Key: smart_home_esp32_secret_key`
> Trong Swagger: Click **Authorize 🔒** → **DeviceKey** → nhập `smart_home_esp32_secret_key`

| # | Endpoint | Body | Kết quả mong đợi |
|---|---|---|---|
| 5.1 | `POST /api/sensors/data` | Xem payload bên dưới | 201, `isNewDevice: true` nếu mới |

**Payload ESP32:**
```json
{
  "deviceId": "esp32-01",
  "temperature": 28.50,
  "humidity": 65.30,
  "anomalyScore": 0.28,
  "dataQuality": 0.98
}
```

**Response khi device mới lần đầu:**
```json
{
  "success": true,
  "data": {
    "deviceId": "<MongoDB ObjectId>",
    "externalId": "esp32-01",
    "isNewDevice": true,
    "records": [
      { "sensorType": "temperature", "value": 28.5, "unit": "°C" },
      { "sensorType": "humidity",    "value": 65.3, "unit": "%" }
    ]
  }
}
```

> 🔔 **Log server** sẽ in: `🆕 Auto-created Device: esp32-01`  
> 🔔 Sau đó admin cần gán device vào home (bước 5.2)

| 5.2 | `GET /api/admin/devices/unassigned` | — | "esp32-01" xuất hiện |
| 5.3 | `PATCH /api/admin/devices/:id/assign` | `{"homeId":"..."}` | Device được gán home |
| 5.4 | Gửi lại `POST /api/sensors/data` với cùng payload | — | `isNewDevice: false`, WebSocket emit |

---

### BƯỚC 6 — ESP32 poll lệnh (giả lập)

| # | Endpoint | Query/Body | Kết quả mong đợi |
|---|---|---|---|
| 6.1 | `GET /api/devices/command?deviceId=<MongoDB_id>` | Header: `X-Device-Key` | 204 nếu không có lệnh |
| 6.2 | Gửi `PATCH /api/devices/:id/status {"action":"on"}` trước | — | Tạo CommandQueue |
| 6.3 | `GET /api/devices/command?deviceId=<id>` | Header: `X-Device-Key` | 200, trả `commandId + action` |
| 6.4 | `POST /api/devices/command/ack` | `{"commandId":"...","success":true}` | Cập nhật status + WebSocket broadcast |

> ⚠️ `deviceId` trong query là **MongoDB ObjectId** (field `_id`), không phải `externalId`

---

### BƯỚC 7 — Xem sensor history & data mới nhất

| # | Endpoint | Query | Kết quả mong đợi |
|---|---|---|---|
| 7.1 | `GET /api/sensors/latest?deviceId=<id>` | — | SensorDevices + giá trị mới nhất |
| 7.2 | `GET /api/sensors/history?sensorDeviceId=<id>&limit=20` | — | Lịch sử có phân trang |
| 7.3 | `GET /api/sensors/devices?deviceId=<id>` | — | Danh sách SensorDevices của device |

---

### BƯỚC 8 — Threshold Rule (tự động hóa)

| # | Endpoint | Body | Kết quả mong đợi |
|---|---|---|---|
| 8.1 | `POST /api/threshold-rules` | Xem payload bên dưới | Rule được tạo |
| 8.2 | `GET /api/threshold-rules?deviceId=<id>` | — | Danh sách rules |
| 8.3 | `PATCH /api/threshold-rules/:id/toggle` | — | Bật/tắt rule |

**Payload tạo rule `ALERT_ONLY` (chỉ thông báo):**
```json
{
  "deviceId": "<device MongoDB ObjectId>",
  "name": "Cảnh báo nhiệt độ cao",
  "ruleType": "ALERT_ONLY",
  "dataType": "temperature",
  "thresholdValue": 35,
  "thresholdUnit": "°C",
  "alertValue": 35,
  "alertUnit": "°C",
  "cooldownTime": 300
}
```

**Payload tạo rule `AUTO_CONTROL` (tự bật/tắt thiết bị):**
```json
{
  "deviceId": "<device MongoDB ObjectId>",
  "name": "Bật quạt khi nhiệt độ cao",
  "ruleType": "AUTO_CONTROL",
  "dataType": "temperature",
  "thresholdValue": 32,
  "thresholdUnit": "°C",
  "alertValue": 32,
  "alertUnit": "°C",
  "action": "on",
  "cooldownTime": 300
}
```

**Test automation:**
1. Tạo rule với `thresholdValue: 30` cho temperature
2. Gửi `POST /api/sensors/data` với `temperature: 35` (vượt ngưỡng)
3. → Alert tự tạo trong DB
4. → WebSocket emit `alert:new` đến frontend
5. → Nếu AUTO_CONTROL: CommandQueue tự tạo cho ESP32

---

### BƯỚC 9 — Schedule (lịch tự động)

| # | Endpoint | Body | Kết quả mong đợi |
|---|---|---|---|
| 9.1 | `POST /api/schedules` | Xem payload bên dưới | Schedule tạo thành công |
| 9.2 | `PATCH /api/schedules/:id/toggle` | — | Bật/tắt lịch |

**Payload:**
```json
{
  "name": "Bật đèn buổi tối",
  "action": "on",
  "startDay": "2025-01-01",
  "endDay": "2025-12-31",
  "startTime": "18:00",
  "endTime": "23:00",
  "scheduledDays": [0, 1, 2, 3, 4, 5, 6],
  "deviceIds": ["<device ObjectId 1>", "<device ObjectId 2>"]
}
```

> ⏰ Cron job chạy mỗi phút → kiểm tra schedule nào đang active → tạo CommandQueue cho ESP32

---

### BƯỚC 10 — Alerts

| # | Endpoint | Query | Kết quả mong đợi |
|---|---|---|---|
| 10.1 | `GET /api/alerts?homeId=<id>` | `isRead=false` | Alerts chưa đọc |
| 10.2 | `PATCH /api/alerts/:id/read` | — | Đánh dấu đọc |
| 10.3 | `PATCH /api/alerts/read-all?homeId=<id>` | — | Đánh dấu tất cả đọc |

---

## 🔌 WebSocket Events (Frontend)

Kết nối từ frontend:
```js
const socket = io('http://localhost:5000');

// Subscribe vào home room
socket.emit('subscribe:home', { homeId: '<homeId>' });

// Nhận dữ liệu realtime
socket.on('sensor:data',          (data) => console.log('Sensor:', data));
socket.on('alert:new',            (data) => console.log('Alert:', data));
socket.on('device:command:ack',   (data) => console.log('Command ACK:', data));
socket.on('schedule:executed',    (data) => console.log('Schedule ran:', data));
```

**Payload các events:**

| Event | Khi nào | Payload chính |
|---|---|---|
| `sensor:data` | ESP32 gửi data (device đã có homeId) | `{ sensorType, value, unit, deviceId }` |
| `alert:new` | ThresholdRule bị kích hoạt | `{ alertContent, deviceId, ruleId }` |
| `device:command:ack` | ESP32 xác nhận thực thi lệnh | `{ commandId, status, newStatus }` |
| `schedule:executed` | Cron job thực thi schedule | `{ scheduleId, deviceIds, action }` |

---

## 📊 Sơ đồ dữ liệu nhanh

```
User ──────────── owns ──────────── Home
                                     │
                               contains │
                                     │
                                    Area ──── has ──── Device (type: light|fan)
                                                           │
                                                    has many │
                                                           │
                                                      SensorDevice (temperature, humidity...)
                                                           │
                                                    records │
                                                           │
                                                       SensorData
                                                           │
                                                   triggers │
                                                           │
                                                    ThresholdRule ──→ Alert
                                                                  ──→ CommandQueue

Schedule ──── targets ──── Device[]
                               │
                        via CommandQueue
                               │
                            ESP32 polls every 10s
```

---

## ⚠️ Lưu ý quan trọng

| Vấn đề | Giải pháp |
|---|---|
| Swagger mất token sau reload | Đã có `persistAuthorization: true` — token giữ lại |
| Device type chỉ có `light`, `fan` | Đúng theo model. ESP32 auto-create dùng `type: 'light'` mặc định |
| `deviceId` trong ESP32 poll là ObjectId | Không phải `externalId`. Lấy từ response của `POST /api/sensors/data` |
| Command hết hạn sau 60s | TTL index tự xóa. ESP32 phải poll trong vòng 60s |
| ThresholdRule cooldown | Sau khi trigger, phải chờ `cooldownTime` giây mới trigger lại |
| Admin không thể tự đổi role mình | Bảo vệ tránh tự lock out |

---

## 🛠️ Debug tips

```bash
# Xem logs realtime
npm run dev

# Kiểm tra server sống
curl http://localhost:5000/api/health

# Giả lập ESP32 gửi data (PowerShell)
$headers = @{ "X-Device-Key" = "smart_home_esp32_secret_key"; "Content-Type" = "application/json" }
$body = '{"deviceId":"esp32-01","temperature":28.5,"humidity":65.3}'
Invoke-RestMethod -Uri "http://localhost:5000/api/sensors/data" -Method POST -Headers $headers -Body $body
```
