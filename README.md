# EbookFarm - Hệ Thống Nhật Ký Sản Xuất Điện Tử Nông Nghiệp

EbookFarm là một nền tảng quản lý nông nghiệp hiện đại, tập trung vào việc số hóa sổ nhật ký sản xuất, quản lý kho vật tư và quy trình canh tác theo tiêu chuẩn Enterprise SaaS.

## 🚀 Công Nghệ Sử Dụng

- **Core**: React + Vite
- **UI Framework**: Ant Design (Antd) + TailwindCSS
- **Iconography**: Lucide React + Ant Design Icons
- **State Management**: Redux Toolkit & React Context API
- **Networking**: Axios (Centralized Instance)
- **Routing**: React Router v6 (Lazy Loading & Route Guards)

## 📁 Cấu Trúc Thư Mục (Kiến Trúc Chuẩn)

Dự án tuân thủ nghiêm ngặt cấu trúc thư mục hiện tại để đảm bảo tính ổn định và khả năng mở rộng:

```text
src/
├── assets/         # Tài nguyên tĩnh (Images, Global CSS, SCSS)
├── components/     # Các thành phần giao diện Reusable (Table, Modal, FormWrapper, Header, Footer...)
├── constants/      # Định nghĩa hằng số (Routes, Roles, Permissions)
├── contexts/       # React Context cho UI state và Session
├── hooks/          # Custom hooks dùng chung
├── lib/            # Thư viện tiện ích (Storage, StringUtils, Utils)
├── modules/        # Các module nghiệp vụ đặc thù
├── pages/          # Thư mục chứa các trang theo vai trò:
│   ├── ADMIN/      # Quản trị viên (Dashboard, Journal, Inventory, User Management)
│   ├── USER/       # Nông dân/Người dùng (My Journal, Warehouse, Production)
│   ├── ANONYMOUS/  # Trang công khai (Home, Login, Register, Errors)
│   └── SUPPORTPAGES/ # Các trang bổ trợ (NotFound, SvgViewer...)
├── redux/          # Redux Toolkit (Slices, Store)
├── router/         # Cấu hình Routing và Route Guards (ProtectedRoute, GuestRoute)
├── services/       # Lớp API Services (AuthService, JournalService, InventoryService...)
├── theme/          # Cấu hình giao diện (GlobalThemeConfig, Antd Theme)
└── utils/          # Các hàm tiện ích logic
```

## 🔐 Luồng Xác Thực (Auth Flow)

1. **Route Guard**: Bảo vệ các route yêu cầu đăng nhập bằng `ProtectedRoute`. Lưu lại `returnUrl` để chuyển hướng sau khi đăng nhập.
2. **Redirect Logic**: Sau khi đăng nhập thành công, hệ thống ưu tiên quay lại trang người dùng đang truy cập trước đó. Nếu không có, sẽ điều hướng về Dashboard theo vai trò (Admin/User).
3. **Session Management**: Quản lý bởi `src/services/core/authSession.js`. Token được lưu trữ và đính kèm tự động vào mọi request.
4. **Refresh Token**: Tự động xử lý qua Axios Interceptor khi mã lỗi 401 được trả về.

## 📡 Quản Lý API (Networking)

- **Centralized Axios**: Mọi yêu cầu API đi qua `src/services/01_axios/index.js`.
- **Interceptors**: 
  - Tự động đính kèm Bearer Token.
  - Xử lý lỗi tập trung và hiển thị thông báo qua hệ thống `Notice` (Toast).
  - Ngăn chặn các request trùng lặp (Duplicate Guard).
- **Mock Services**: Trong giai đoạn phát triển, các service trong `src/services/` sử dụng dữ liệu giả lập (Mock Data) để kiểm thử giao diện và logic flow trước khi kết nối Backend thật.

## 🎨 Giao Diện & Trải Nghiệm (UI/UX)

- **Primary Color**: `#16A34A` (Màu xanh nông nghiệp thông minh).
- **Secondary Color**: `#ECFDF5`.
- **Layouts**: 
  - Tích hợp **GlobalHeader** và **GlobalFooter** đồng nhất.
  - Header tự động hiển thị Menu tương ứng với vai trò (Role) của người dùng hiện tại thông qua hàm `getMenuByRole`.
- **Components**: Ưu tiên tính tái sử dụng cao. Mọi component phải nhận props rõ ràng và không phụ thuộc vào dữ liệu fix cứng.

## 🛠 Hướng Dẫn Phát Triển

1. **Thêm trang mới**: Tạo thư mục trang bên trong `src/pages/` tương ứng với vai trò. Đăng ký route trong `src/router/ROUTER.js` và `src/router/AppRouter.jsx`.
2. **Thêm menu**: Cập nhật hàm `MenuItemAdmin` hoặc `MenuItemUser` trong `src/router/MenuItem.jsx`.
3. **Kết nối API**: Tạo Service mới trong `src/services/`. Sử dụng instance `http` từ `01_axios` để thực hiện call.

## 📏 Quy Định Code (Coding Convention)

- **Naming**: 
  - Component: `PascalCase`.
  - Hằng số: `UPPER_SNAKE_CASE`.
  - Service/Hook: `camelCase`.
- **Separation of Concerns**: Tách biệt rõ ràng giữa giao diện (UI) và logic xử lý dữ liệu.
- **Generic First**: Luôn ưu tiên viết component theo hướng generic trước khi viết cho một nghiệp vụ cụ thể.
