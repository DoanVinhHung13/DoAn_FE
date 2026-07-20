# Hướng Dẫn Test API EAPLS

## 📚 Tài Liệu API
- **Swagger UI**: https://api.eapls.io.vn/swagger/index.html
- **Base URL**: `https://api.eapls.io.vn`

## 🔐 Thông Tin Đăng Nhập (Farm Supervisor)
```json
{
  "identifier": "farmsupervisor@eapls.com",
  "password": "Abc@1234"
}
```

## 🚀 Cách Sử Dụng API Test Helper

### 1. Chạy Test Script
```bash
node api-test-helper.js
```

Script sẽ tự động:
- ✅ Đăng nhập và lấy token
- ✅ Lấy thông tin user
- ✅ Test các endpoint phổ biến

### 2. Sử Dụng Trong Code

```javascript
const apiHelper = require('./api-test-helper.js');

// Đăng nhập
await apiHelper.login();

// Lấy thông tin user
await apiHelper.getCurrentUser();

// Test endpoint bất kỳ
await apiHelper.testEndpoint('/api/crops', 'GET');

// Lấy danh sách Production Plans
await apiHelper.getProductionPlans(1, 10);

// Lấy danh sách Tasks
await apiHelper.getTasks(1, 10);
```

## 📋 Các Endpoint Chính

### Authentication
```
POST /api/auth/login - Đăng nhập
GET  /api/auth/me - Lấy thông tin user hiện tại
POST /api/auth/refresh-token - Refresh token
POST /api/auth/logout - Đăng xuất
POST /api/auth/change-password - Đổi mật khẩu
```

### Cultivation Logbooks (Production Plans)
```
GET    /api/cultivation-logbooks - Danh sách kế hoạch sản xuất
POST   /api/cultivation-logbooks - Tạo mới kế hoạch
GET    /api/cultivation-logbooks/{id} - Chi tiết kế hoạch
PUT    /api/cultivation-logbooks/{id} - Cập nhật kế hoạch
DELETE /api/cultivation-logbooks/{id} - Xóa kế hoạch
POST   /api/cultivation-logbooks/{id}/submit-review - Gửi duyệt
POST   /api/cultivation-logbooks/{id}/approve-review - Phê duyệt
POST   /api/cultivation-logbooks/{id}/start - Khởi động kế hoạch
POST   /api/cultivation-logbooks/{id}/complete - Hoàn thành kế hoạch
```

### Cultivation Tasks
```
GET    /api/cultivation-tasks - Danh sách công việc
POST   /api/cultivation-tasks - Tạo công việc mới
GET    /api/cultivation-tasks/{id} - Chi tiết công việc
PUT    /api/cultivation-tasks/{id} - Cập nhật công việc
DELETE /api/cultivation-tasks/{id} - Xóa công việc
POST   /api/cultivation-tasks/{id}/assign - Phân công
POST   /api/cultivation-tasks/{id}/start - Bắt đầu công việc
POST   /api/cultivation-tasks/{id}/complete - Hoàn thành công việc
```

### Cultivation Logs (Daily Logs)
```
GET    /api/cultivation-logs - Danh sách nhật ký
POST   /api/cultivation-logs - Tạo nhật ký mới
GET    /api/cultivation-logs/{id} - Chi tiết nhật ký
PUT    /api/cultivation-logs/{id} - Cập nhật nhật ký
DELETE /api/cultivation-logs/{id} - Xóa nhật ký
POST   /api/cultivation-logs/{id}/approve - Phê duyệt nhật ký
POST   /api/cultivation-logs/{id}/reject - Từ chối nhật ký
POST   /api/cultivation-logs/{id}/images - Upload ảnh minh chứng
```

### Crops
```
GET    /api/crops - Danh sách cây trồng
POST   /api/crops - Tạo cây trồng mới
GET    /api/crops/{id} - Chi tiết cây trồng
PUT    /api/crops/{id} - Cập nhật cây trồng
DELETE /api/crops/{id} - Xóa cây trồng
POST   /api/crops/{id}/activate - Kích hoạt
POST   /api/crops/{id}/deactivate - Vô hiệu hóa
```

### Land Plots
```
GET    /api/land-plots - Danh sách thửa đất
POST   /api/land-plots - Tạo thửa đất mới
GET    /api/land-plots/{id} - Chi tiết thửa đất
PUT    /api/land-plots/{id} - Cập nhật thửa đất
DELETE /api/land-plots/{id} - Xóa thửa đất
POST   /api/land-plots/{id}/activate - Kích hoạt
POST   /api/land-plots/{id}/deactivate - Vô hiệu hóa
```

### Users
```
GET    /api/users - Danh sách người dùng
POST   /api/users - Tạo người dùng mới
GET    /api/users/{id} - Chi tiết người dùng
PUT    /api/users/{id} - Cập nhật người dùng
DELETE /api/users/{id} - Xóa người dùng
POST   /api/users/{id}/lock - Khóa tài khoản
POST   /api/users/{id}/unlock - Mở khóa tài khoản
```

### Warehouses & Materials
```
GET    /api/warehouses - Danh sách kho
POST   /api/warehouses - Tạo kho mới
GET    /api/materials - Danh sách vật tư
POST   /api/materials - Tạo vật tư mới
POST   /api/materials/import - Nhập kho
POST   /api/materials/export - Xuất kho
```

## 🔧 Test với cURL

### Login
```bash
curl -X POST https://api.eapls.io.vn/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "farmsupervisor@eapls.com",
    "password": "Abc@1234"
  }'
```

### Get Current User (cần token)
```bash
curl -X GET https://api.eapls.io.vn/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Get Production Plans
```bash
curl -X GET "https://api.eapls.io.vn/api/cultivation-logbooks?PageIndex=1&PageSize=10" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 🧪 Test với Postman

1. Import Swagger JSON: `https://api.eapls.io.vn/swagger/v1/swagger.json`
2. Tạo Collection mới với Base URL: `https://api.eapls.io.vn`
3. Thêm Authorization → Bearer Token vào Collection
4. Login để lấy token và set vào Collection variable

## 📝 Ghi Chú

- Token có thời hạn, cần refresh khi hết hạn
- Các endpoint có phân trang thường dùng `PageIndex` và `PageSize`
- Search keyword dùng parameter `SearchKeyword`
- Một số endpoint yêu cầu quyền cụ thể (Farm Manager, Supervisor, Leader)

## 🔍 Debug Tips

1. Kiểm tra network tab trong browser DevTools
2. Log request/response trong console
3. Verify token còn hạn hay không
4. Check response status code và error message
