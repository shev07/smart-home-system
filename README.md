# Smart Home System

Monorepo cho hệ thống Smart Home gồm:

- `.`: React/Vite frontend
- `backend/`: Node.js/Express backend

## Tính năng chính

- Đăng ký, đăng nhập JWT
- Quản lý Home, Area, Device
- Điều khiển thiết bị `light` / `fan`
- Nhận dữ liệu cảm biến từ ESP32
- Lịch tự động bật/tắt thiết bị
- Luật ngưỡng cảm biến và cảnh báo
- Trang admin cho user, home, device chưa gán

## Yêu cầu

- Node.js 20+
- MongoDB Atlas hoặc MongoDB local
- Tài khoản MongoDB có quyền đọc/ghi database

## Chạy backend

```powershell
cd backend
npm install
copy .env.example .env
notepad .env
npm run dev
```

Ví dụ `.env` backend:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster-host>/smart-home?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=change_this_jwt_secret
JWT_EXPIRES_IN=7d
DEVICE_SECRET_KEY=smart_home_esp32_secret_key
CLIENT_URL=http://127.0.0.1:5173
```

Backend chạy tại:

```text
http://localhost:5000
```

## Cấu hình .env cho nhóm

Repo không commit `.env` thật để tránh lộ MongoDB password, JWT secret và ESP32 key. Cả nhóm dùng cùng database thì chia sẻ nội dung `.env` qua kênh riêng, rồi mỗi máy tự tạo file:

Backend:

```powershell
cd backend
copy .env.example .env
notepad .env
```

Frontend:

```powershell
copy .env.example .env
notepad .env
```

Các file cần có trên máy từng thành viên:

```text
backend/.env
.env
```

Health check:

```text
http://localhost:5000/api/health
```

## Chạy frontend

Mở terminal thứ hai:

```powershell
npm install
copy .env.example .env
notepad .env
npm run dev -- --host
```

Ví dụ `.env` frontend:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Frontend chạy tại:

```text
http://127.0.0.1:5173/
```

Nên dùng thống nhất `127.0.0.1:5173` để tránh khác origin với `localhost:5173`.

## Luồng sử dụng

1. Mở frontend.
2. Chọn **Create account** để tạo tài khoản.
3. Tạo **Home**.
4. Chọn Home vừa tạo.
5. Tạo **Area** trong Home đó.
6. Tạo **Device** và gán vào Area nếu cần.
7. Tạo **Schedule** hoặc **Threshold Rule** trong tab Automation.

## ESP32 gửi dữ liệu cảm biến

Endpoint:

```text
POST http://localhost:5000/api/sensors/data
```

Header:

```text
X-Device-Key: smart_home_esp32_secret_key
Content-Type: application/json
```

Body ví dụ:

```json
{
  "deviceId": "esp32-01",
  "temperature": 28.5,
  "humidity": 65.3,
  "anomalyScore": 0.12,
  "dataQuality": 0.98
}
```

Thiết bị ESP32 mới sẽ được tạo dạng chưa gán Home. Admin vào tab **Admin** để assign device vào Home.

## Ghi chú bảo mật

Không commit file `.env`. Repo chỉ giữ `.env.example`. Nếu đã lộ MongoDB URI hoặc password, hãy đổi password trong MongoDB Atlas.
