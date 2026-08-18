# Custom Menu Icons - Hướng dẫn sử dụng

## Mô tả

Thư mục này chứa các custom SVG icons được thiết kế riêng cho từng menu item trong hệ thống quản lý nông nghiệp.

## Danh sách Icons

### 1. Dashboard & Overview

- **DashboardIcon** - Icon tổng quan/dashboard
- **ReportIcon** - Icon báo cáo thống kê

### 2. User Management

- **UserManagementIcon** - Icon quản lý người dùng
- **FarmerManagementIcon** - Icon quản lý nông dân
- **MyTaskIcon** - Icon công việc của tôi

### 3. Land & Crop Management

- **LandManagementIcon** - Icon quản lý vùng trồng
- **CropCatalogIcon** - Icon danh mục cây trồng
- **CropIcon** - Icon cây trồng

### 4. Logbook & Planning

- **LogbookIcon** - Icon nhật ký canh tác
- **ApprovalLogbookIcon** - Icon duyệt nhật ký
- **PlanLogbookIcon** - Icon kế hoạch & nhật ký

### 5. Templates & Tasks

- **TemplateLibraryIcon** - Icon thư viện mẫu
- **TaskCatalogIcon** - Icon danh mục công việc

### 6. Materials Management

- **MaterialManagementIcon** - Icon quản lý vật tư
- **FertilizerIcon** - Icon phân bón
- **PesticideIcon** - Icon nông dược
- **ImportHistoryIcon** - Icon lịch sử nhập kho

### 7. Harvest & QR

- **HarvestBatchIcon** - Icon lô thu hoạch
- **QRManagementIcon** - Icon quản lý mã QR

### 8. Reference & Notification

- **ReferenceBookIcon** - Icon tra cứu cấp phép
- **NotificationIcon** - Icon thông báo

## Cách sử dụng trong Menu

Icons đã được tích hợp sẵn vào `MenuItem.jsx`. Menu sẽ tự động hiển thị icon tương ứng với kích thước 18px.

```jsx
// Ví dụ trong MenuItem.jsx
import {
  DashboardIcon,
  UserManagementIcon,
} from "src/assets/icon/menu/MenuIcons"

export const farmManagerItem = () => [
  {
    key: ROUTER.FM_DASHBOARD,
    icon: <DashboardIcon style={{ fontSize: "18px" }} />,
    label: "Tổng quan",
  },
  {
    key: ROUTER.FM_USERS,
    icon: <UserManagementIcon style={{ fontSize: "18px" }} />,
    label: "Quản lý người dùng",
  },
]
```

## Cách sử dụng trong Page Header

### Cách 1: Sử dụng PageHeader Component (Khuyến nghị)

```jsx
import PageHeader from "src/components/Common/PageHeader"
import { UserManagementIcon } from "src/assets/icon/menu/MenuIcons"

const UsersPage = () => {
  return (
    <>
      <PageHeader
        icon={UserManagementIcon}
        title="Quản lý người dùng"
        subtitle="Quản lý tài khoản và phân quyền người dùng trong hệ thống"
        extra={<Button type="primary">Thêm người dùng</Button>}
      />

      {/* Nội dung trang */}
    </>
  )
}
```

### Cách 2: Tự custom layout

```jsx
import { UserManagementIcon } from "src/assets/icon/menu/MenuIcons"

const UsersPage = () => {
  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "24px",
        }}
      >
        <UserManagementIcon style={{ fontSize: "32px", color: "#1890ff" }} />
        <h2>Quản lý người dùng</h2>
      </div>

      {/* Nội dung trang */}
    </>
  )
}
```

## Ví dụ áp dụng cho từng trang

### Farm Manager Pages

```jsx
// Dashboard
import { DashboardIcon } from "src/assets/icon/menu/MenuIcons"
;<PageHeader icon={DashboardIcon} title="Tổng quan" />

// Users Management
import { UserManagementIcon } from "src/assets/icon/menu/MenuIcons"
;<PageHeader icon={UserManagementIcon} title="Quản lý người dùng" />

// Land Management
import { LandManagementIcon } from "src/assets/icon/menu/MenuIcons"
;<PageHeader icon={LandManagementIcon} title="Quản lý vùng trồng" />

// Crop Catalogs
import { CropCatalogIcon } from "src/assets/icon/menu/MenuIcons"
;<PageHeader icon={CropCatalogIcon} title="Danh mục cây trồng" />

// Crops
import { CropIcon } from "src/assets/icon/menu/MenuIcons"
;<PageHeader icon={CropIcon} title="Cây trồng" />

// Template Library
import { TemplateLibraryIcon } from "src/assets/icon/menu/MenuIcons"
;<PageHeader icon={TemplateLibraryIcon} title="Thư viện mẫu" />

// Cultivation Logbook
import { LogbookIcon } from "src/assets/icon/menu/MenuIcons"
;<PageHeader icon={LogbookIcon} title="Nhật ký canh tác" />

// Logbook Approval
import { ApprovalLogbookIcon } from "src/assets/icon/menu/MenuIcons"
;<PageHeader icon={ApprovalLogbookIcon} title="Duyệt nhật ký canh tác" />

// Reports
import { ReportIcon } from "src/assets/icon/menu/MenuIcons"
;<PageHeader icon={ReportIcon} title="Báo cáo thống kê" />

// Task Catalogs
import { TaskCatalogIcon } from "src/assets/icon/menu/MenuIcons"
;<PageHeader icon={TaskCatalogIcon} title="Danh mục công việc" />

// Harvest Batches
import { HarvestBatchIcon } from "src/assets/icon/menu/MenuIcons"
;<PageHeader icon={HarvestBatchIcon} title="Quản lý lô thu hoạch" />

// Notifications
import { NotificationIcon } from "src/assets/icon/menu/MenuIcons"
;<PageHeader icon={NotificationIcon} title="Thông báo" />

// Fertilizers
import { FertilizerIcon } from "src/assets/icon/menu/MenuIcons"
;<PageHeader icon={FertilizerIcon} title="Quản lý phân bón" />

// Pesticides
import { PesticideIcon } from "src/assets/icon/menu/MenuIcons"
;<PageHeader icon={PesticideIcon} title="Quản lý nông dược" />

// Import History
import { ImportHistoryIcon } from "src/assets/icon/menu/MenuIcons"
;<PageHeader icon={ImportHistoryIcon} title="Lịch sử nhập kho" />
```

### Farm Supervisor Pages

```jsx
// Plan & Logbook
import { PlanLogbookIcon } from "src/assets/icon/menu/MenuIcons"
;<PageHeader icon={PlanLogbookIcon} title="Kế hoạch & Nhật ký" />

// Farmers Management
import { FarmerManagementIcon } from "src/assets/icon/menu/MenuIcons"
;<PageHeader icon={FarmerManagementIcon} title="Quản lý nông dân" />

// Lands
import { LandManagementIcon } from "src/assets/icon/menu/MenuIcons"
;<PageHeader icon={LandManagementIcon} title="Quản lý vùng trồng" />
```

### Farm Leader Pages

```jsx
// My Tasks
import { MyTaskIcon } from "src/assets/icon/menu/MenuIcons"
;<PageHeader icon={MyTaskIcon} title="Công việc của tôi" />
```

## Tùy chỉnh màu sắc

Icons sử dụng `currentColor`, vì vậy bạn có thể dễ dàng thay đổi màu qua style:

```jsx
// Màu xanh dương
<UserManagementIcon style={{ fontSize: '24px', color: '#1890ff' }} />

// Màu xanh lá
<LandManagementIcon style={{ fontSize: '24px', color: '#52c41a' }} />

// Màu cam
<NotificationIcon style={{ fontSize: '24px', color: '#fa8c16' }} />

// Màu đỏ
<ApprovalLogbookIcon style={{ fontSize: '24px', color: '#ff4d4f' }} />
```

## Responsive Size

Icons tự động scale theo `fontSize`:

```jsx
// Small - 16px (submenu items)
<UserManagementIcon style={{ fontSize: '16px' }} />

// Medium - 18px (main menu items)
<UserManagementIcon style={{ fontSize: '18px' }} />

// Large - 24px (page titles)
<UserManagementIcon style={{ fontSize: '24px' }} />

// Extra Large - 32px (page headers)
<UserManagementIcon style={{ fontSize: '32px' }} />

// Custom size
<UserManagementIcon style={{ fontSize: '48px' }} />
```

## Notes

- Tất cả icons đều hỗ trợ className để custom style
- Icons tự động kế thừa màu từ parent element
- Kích thước mặc định là `1em` (tương đương với font-size của parent)
- Icons đã được tối ưu cho accessibility với các thuộc tính ARIA khi cần

## Thêm Icon mới

Nếu cần thêm icon mới:

1. Mở file `MenuIcons.jsx`
2. Thêm component mới theo template:

```jsx
export const NewIcon = ({ className = "" }) => (
  <svg
    className={className}
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="YOUR_SVG_PATH_HERE" />
  </svg>
)
```

3. Export và sử dụng như các icon khác

## Support

Nếu có vấn đề hoặc cần thêm icon mới, vui lòng liên hệ team phát triển.
