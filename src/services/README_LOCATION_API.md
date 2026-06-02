# Location Service - API Địa phương Việt Nam

Service này sử dụng API công khai từ [provinces.open-api.vn](https://provinces.open-api.vn) để lấy dữ liệu địa phương đầy đủ của Việt Nam, **có cập nhật sáp nhập mới nhất**.

## ⚠️ Cập nhật sáp nhập đơn vị hành chính

### TP. Hồ Chí Minh (01/01/2021)
- ✅ **Thành lập TP. Thủ Đức** từ:
  - Quận 2 (cũ)
  - Quận 9 (cũ)  
  - Quận Thủ Đức (cũ)

### Các sáp nhập khác
- Hà Nội: Mở rộng địa giới hành chính các quận nội thành (2019-2023)
- Các tỉnh khác: Cập nhật theo Nghị quyết của Quốc hội

## Tính năng

- ✅ **63 tỉnh/thành phố** đầy đủ
- ✅ **Tất cả quận/huyện** của mỗi tỉnh/thành (cập nhật sáp nhập)
- ✅ **Tất cả phường/xã** của mỗi quận/huyện
- ✅ **Cảnh báo sáp nhập** tự động
- ✅ **Backup API** tự động chuyển đổi khi API chính lỗi
- ✅ Dữ liệu cập nhật theo chuẩn Bộ Nội vụ
- ✅ Hỗ trợ tìm kiếm
- ✅ Miễn phí, không cần API key

## API Endpoints

### 1. Lấy danh sách tỉnh/thành
```javascript
import { getProvinces } from '../services/locationService';

const provinces = await getProvinces();
// Returns: [{ code, name, nameEn, fullName, fullNameEn, codeName }, ...]
```

### 2. Lấy quận/huyện theo tỉnh
```javascript
import { getDistrictsByProvince } from '../services/locationService';

const districts = await getDistrictsByProvince(79); // 79 = TP.HCM
// Returns: [{ code, name, nameEn, fullName, fullNameEn, codeName }, ...]
// Bao gồm "Thành phố Thủ Đức" (sáp nhập mới)
```

### 3. Lấy phường/xã theo quận/huyện
```javascript
import { getWardsByDistrict } from '../services/locationService';

const wards = await getWardsByDistrict(769); // TP. Thủ Đức
// Returns: [{ code, name, nameEn, fullName, fullNameEn, codeName }, ...]
```

### 4. Kiểm tra cảnh báo sáp nhập
```javascript
import { checkMergeWarning } from '../services/locationService';

const warning = checkMergeWarning('Hồ Chí Minh', 'Quận 2');
// Returns: { type: 'warning', message: 'Quận 2 đã được sáp nhập...' }
```

### 5. Tìm kiếm tỉnh/thành
```javascript
import { searchProvinces } from '../services/locationService';

const results = await searchProvinces('Hà Nội');
```

### 6. Lấy thông tin chi tiết (bao gồm cả quận/huyện và phường/xã)
```javascript
import { getProvinceDetail } from '../services/locationService';

const detail = await getProvinceDetail(79); // TP.HCM
// Returns: { code, name, districts: [{ code, name, wards: [...] }] }
```

## Sử dụng Component

### LocationSelector Component
Component có sẵn để chọn địa phương:

```jsx
import LocationSelector from '../components/LocationSelector';

<LocationSelector
  value={{ province: 'Hà Nội', district: 'Ba Đình', ward: 'Phường Điện Biên' }}
  onChange={(location) => console.log(location)}
  disabled={false}
/>
```

### Trong Form
```jsx
<Form.Item name="location">
  <LocationSelector />
</Form.Item>
```

## Cấu trúc dữ liệu

### Province
```javascript
{
  code: 1,
  name: "Hà Nội",
  nameEn: "Ha Noi",
  fullName: "Thành phố Hà Nội",
  fullNameEn: "Ha Noi City",
  codeName: "ha_noi"
}
```

### District
```javascript
{
  code: 1,
  name: "Ba Đình",
  nameEn: "Ba Dinh",
  fullName: "Quận Ba Đình",
  fullNameEn: "Ba Dinh District",
  codeName: "ba_dinh"
}
```

### Ward
```javascript
{
  code: 1,
  name: "Phường Phúc Xá",
  nameEn: "Phuc Xa Ward",
  fullName: "Phường Phúc Xá",
  fullNameEn: "Phuc Xa Ward",
  codeName: "phuc_xa"
}
```

## Lưu ý

- API hoàn toàn miễn phí, không cần đăng ký
- Dữ liệu được cập nhật định kỳ theo Bộ Nội vụ
- Không có rate limit
- Hỗ trợ CORS
- Response time trung bình: 100-300ms

## Nguồn dữ liệu

- API: https://provinces.open-api.vn
- GitHub: https://github.com/kenzouno1/DiaGioiHanhChinhVN
- Dữ liệu gốc: Tổng cục Thống kê Việt Nam
