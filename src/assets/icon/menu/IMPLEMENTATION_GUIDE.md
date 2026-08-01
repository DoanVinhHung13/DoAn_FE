# Hướng dẫn áp dụng Icons cho tất cả trang Index

## 📋 Danh sách các trang cần cập nhật

### Farm Manager Pages (14 trang)
- ✅ `/farm-manager/users` - Quản lý người dùng (Đã cập nhật)
- ⬜ `/farm-manager/dashboard` - Tổng quan
- ⬜ `/farm-manager/lands` - Quản lý vùng trồng
- ⬜ `/farm-manager/crop-catalogs` - Danh mục cây trồng
- ⬜ `/farm-manager/crops` - Cây trồng
- ⬜ `/farm-manager/process-templates` - Thư viện mẫu
- ⬜ `/farm-manager/cultivation-logbooks` - Nhật ký canh tác
- ⬜ `/farm-manager/logbooks` - Duyệt nhật ký canh tác
- ⬜ `/farm-manager/reports` - Báo cáo thống kê
- ⬜ `/farm-manager/task-catalogs` - Danh mục công việc
- ⬜ `/farm-manager/harvest-batches` - Quản lý lô thu hoạch
- ⬜ `/farm-manager/notifications` - Thông báo
- ⬜ `/farm-manager/fertilizers` - Quản lý phân bón
- ⬜ `/farm-manager/pesticides` - Quản lý nông dược

### Farm Supervisor Pages (3 trang)
- ⬜ `/farm-supervisor/cultivation-logbooks` - Kế hoạch & Nhật ký
- ⬜ `/farm-supervisor/farmers` - Quản lý nông dân
- ⬜ `/farm-supervisor/lands` - Quản lý vùng trồng

### Farm Leader Pages (1 trang)
- ⬜ `/farm-leader/tasks` - Công việc của tôi

---

## 🔧 Cách áp dụng cho từng trang

### Bước 1: Import icon tương ứng

```jsx
// Tìm dòng import từ "@ant-design/icons"
import { SomeIcon } from "@ant-design/icons"

// Thêm dòng import custom icon
import { UserManagementIcon } from "src/assets/icon/menu/MenuIcons"
```

### Bước 2: Thay thế icon trong title

**Trước:**
```jsx
<TitleCustom className="!mb-0 flex items-center gap-2">
  <TeamOutlined className="text-green-600" />
  Quản lý người dùng
</TitleCustom>
```

**Sau:**
```jsx
<TitleCustom className="!mb-0 flex items-center gap-2">
  <UserManagementIcon style={{ fontSize: '24px', color: '#16a34a' }} />
  Quản lý người dùng
</TitleCustom>
```

---

## 📝 Template chi tiết cho từng trang

### 1. Dashboard (`/farm-manager/dashboard`)
```jsx
// Import
import { DashboardIcon } from "src/assets/icon/menu/MenuIcons"

// Title
<DashboardIcon style={{ fontSize: '24px', color: '#1890ff' }} />
Tổng quan
```

### 2. Users (`/farm-manager/users`) ✅ Đã hoàn thành
```jsx
// Import
import { UserManagementIcon } from "src/assets/icon/menu/MenuIcons"

// Title
<UserManagementIcon style={{ fontSize: '24px', color: '#16a34a' }} />
Quản lý người dùng
```

### 3. Lands (`/farm-manager/lands`)
```jsx
// Import
import { LandManagementIcon } from "src/assets/icon/menu/MenuIcons"

// Title
<LandManagementIcon style={{ fontSize: '24px', color: '#10b981' }} />
Quản lý vùng trồng
```

### 4. Crop Catalogs (`/farm-manager/crop-catalogs`)
```jsx
// Import
import { CropCatalogIcon } from "src/assets/icon/menu/MenuIcons"

// Title
<CropCatalogIcon style={{ fontSize: '24px', color: '#059669' }} />
Danh mục cây trồng
```

### 5. Crops (`/farm-manager/crops`)
```jsx
// Import
import { CropIcon } from "src/assets/icon/menu/MenuIcons"

// Title
<CropIcon style={{ fontSize: '24px', color: '#22c55e' }} />
Cây trồng
```

### 6. Process Templates (`/farm-manager/process-templates`)
```jsx
// Import
import { TemplateLibraryIcon } from "src/assets/icon/menu/MenuIcons"

// Title
<TemplateLibraryIcon style={{ fontSize: '24px', color: '#06b6d4' }} />
Thư viện mẫu
```

### 7. Cultivation Logbooks (`/farm-manager/cultivation-logbooks`)
```jsx
// Import
import { LogbookIcon } from "src/assets/icon/menu/MenuIcons"

// Title
<LogbookIcon style={{ fontSize: '24px', color: '#f59e0b' }} />
Nhật ký canh tác
```

### 8. Logbook Approval (`/farm-manager/logbooks`)
```jsx
// Import
import { ApprovalLogbookIcon } from "src/assets/icon/menu/MenuIcons"

// Title
<ApprovalLogbookIcon style={{ fontSize: '24px', color: '#8b5cf6' }} />
Duyệt nhật ký canh tác
```

### 9. Reports (`/farm-manager/reports`)
```jsx
// Import
import { ReportIcon } from "src/assets/icon/menu/MenuIcons"

// Title
<ReportIcon style={{ fontSize: '24px', color: '#3b82f6' }} />
Báo cáo thống kê
```

### 10. Task Catalogs (`/farm-manager/task-catalogs`)
```jsx
// Import
import { TaskCatalogIcon } from "src/assets/icon/menu/MenuIcons"

// Title
<TaskCatalogIcon style={{ fontSize: '24px', color: '#6366f1' }} />
Danh mục công việc
```

### 11. Harvest Batches (`/farm-manager/harvest-batches`)
```jsx
// Import
import { HarvestBatchIcon } from "src/assets/icon/menu/MenuIcons"

// Title
<HarvestBatchIcon style={{ fontSize: '24px', color: '#f97316' }} />
Quản lý lô thu hoạch
```

### 12. Notifications (`/farm-manager/notifications`)
```jsx
// Import
import { NotificationIcon } from "src/assets/icon/menu/MenuIcons"

// Title
<NotificationIcon style={{ fontSize: '24px', color: '#ef4444' }} />
Thông báo
```

### 13. Fertilizers (`/farm-manager/fertilizers`)
```jsx
// Import
import { FertilizerIcon } from "src/assets/icon/menu/MenuIcons"

// Title
<FertilizerIcon style={{ fontSize: '24px', color: '#84cc16' }} />
Quản lý phân bón
```

### 14. Pesticides (`/farm-manager/pesticides`)
```jsx
// Import
import { PesticideIcon } from "src/assets/icon/menu/MenuIcons"

// Title
<PesticideIcon style={{ fontSize: '24px', color: '#a855f7' }} />
Quản lý nông dược
```

### 15. Import History (`/farm-manager/inventory-import-history`)
```jsx
// Import
import { ImportHistoryIcon } from "src/assets/icon/menu/MenuIcons"

// Title
<ImportHistoryIcon style={{ fontSize: '24px', color: '#64748b' }} />
Lịch sử nhập kho
```

---

## 🎨 Bảng màu sắc đề xuất

| Chức năng | Màu HEX | Màu Tailwind |
|-----------|---------|--------------|
| Dashboard | #1890ff | blue-500 |
| Users | #16a34a | green-600 |
| Lands | #10b981 | emerald-500 |
| Crops | #22c55e | green-500 |
| Catalogs | #059669 | emerald-600 |
| Templates | #06b6d4 | cyan-500 |
| Logbooks | #f59e0b | amber-500 |
| Approval | #8b5cf6 | violet-500 |
| Reports | #3b82f6 | blue-500 |
| Tasks | #6366f1 | indigo-500 |
| Harvest | #f97316 | orange-500 |
| Notifications | #ef4444 | red-500 |
| Fertilizers | #84cc16 | lime-500 |
| Pesticides | #a855f7 | purple-500 |
| History | #64748b | slate-600 |

---

## 🔍 Cách tìm title trong file

### Pattern 1: Sử dụng TitleCustom
```jsx
<TitleCustom>
  <SomeIcon /> 
  Tiêu đề trang
</TitleCustom>
```

### Pattern 2: Sử dụng Typography.Title
```jsx
import { Typography } from 'antd'
const { Title } = Typography

<Title level={2}>
  <SomeIcon />
  Tiêu đề trang
</Title>
```

### Pattern 3: Sử dụng h2, h3
```jsx
<h2 className="...">
  <SomeIcon />
  Tiêu đề trang
</h2>
```

---

## 🚀 Cách nhanh để áp dụng

### Sử dụng pageIconMapping.js (Khuyến nghị)

```jsx
import { PAGE_ICONS } from 'src/assets/icon/menu/pageIconMapping'

const MyPage = () => {
  const iconConfig = PAGE_ICONS['/farm-manager/users']
  const Icon = iconConfig.icon

  return (
    <TitleCustom>
      <Icon style={{ fontSize: '24px', color: iconConfig.color }} />
      {iconConfig.title}
    </TitleCustom>
  )
}
```

---

## ✅ Checklist khi cập nhật

- [ ] Import icon từ `src/assets/icon/menu/MenuIcons`
- [ ] Xóa import icon cũ từ `@ant-design/icons` (nếu không dùng nữa)
- [ ] Thay thế icon trong title với `style={{ fontSize: '24px', color: '...' }}`
- [ ] Kiểm tra icon hiển thị đúng trong trình duyệt
- [ ] Icon trong menu sidebar vẫn hoạt động bình thường (18px)
- [ ] Icon trong page title hiển thị lớn hơn (24px)

---

## 📖 Tài liệu tham khảo

- [MenuIcons.jsx](./MenuIcons.jsx) - Tất cả custom icons
- [pageIconMapping.js](./pageIconMapping.js) - Mapping icons theo route
- [README.md](./README.md) - Hướng dẫn chi tiết về icons

---

## 💡 Tips

1. **Tìm nhanh title:** Tìm kiếm `TitleCustom`, `<Title`, `<h2`, `<h3` trong file
2. **Tìm icon cũ:** Tìm kiếm `Outlined` để tìm các Ant Design icons
3. **Copy-paste:** Sử dụng template trên để copy-paste nhanh
4. **Kiểm tra:** Mở trang trong trình duyệt để đảm bảo icon hiển thị đúng

---

## 🐛 Troubleshooting

**Icon không hiển thị?**
- Kiểm tra import đúng đường dẫn: `src/assets/icon/menu/MenuIcons`
- Kiểm tra tên icon đúng chính tả

**Icon quá nhỏ/lớn?**
- Menu sidebar: `fontSize: '18px'`
- Page title: `fontSize: '24px'`
- Page header: `fontSize: '32px'`

**Màu sắc không đúng?**
- Sử dụng bảng màu đề xuất ở trên
- Hoặc tự chọn màu phù hợp với theme

---

Được tạo bởi: Kiro AI Assistant
Ngày cập nhật: 2026-08-01
