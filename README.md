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
│   ├── ANONYMOUS/  # Trang công khai (Home, ForgotPassword, ResetPassword, VerifyOTP, Errors)
│   └── SUPPORTPAGES/ # Các trang bổ trợ (NotFound, SvgViewer...)
├── redux/          # Redux Toolkit (Slices, Store)
├── router/         # Cấu hình Routing và Route Guards (ProtectedRoute, GuestRoute)
├── services/       # Lớp API Services (AuthService, JournalService, InventoryService...)
├── theme/          # Cấu hình giao diện (GlobalThemeConfig, Antd Theme)
└── utils/          # Các hàm tiện ích logic
```

## 🔐 Luồng Xác Thực (Auth Flow)

1. **Auth Modal trung tâm**: Đăng nhập/đăng ký sử dụng modal tại `src/components/Layout/Header/AuthModal.jsx`, không dùng trang `/login` và `/register` riêng cho luồng chính.
2. **Route Guard**: `ProtectedRoute` bảo vệ route cần đăng nhập, khi chưa login sẽ điều hướng về `ROUTER.HOME` kèm state mở login modal (`openLogin` + `returnUrl`).
3. **Redirect Logic sau login**: Ưu tiên `returnUrl` nếu có; nếu không có thì điều hướng theo vai trò (`ADMIN_DASHBOARD` hoặc `USER_DASHBOARD`).
4. **Session Management**: Quản lý bởi `src/services/core/authSession.js`. Token được lưu trữ và đính kèm tự động vào mọi request.
5. **Refresh Token / 401**: Axios Interceptor xử lý tập trung; khi hết phiên sẽ quay về Home và mở modal login theo query `?auth=login`.

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
  - Header hiển thị dropdown theo vai trò thông qua `getDropMenuByRole`, và hiển thị cặp nút `Register/Login` cho guest.
- **Components**: Ưu tiên tính tái sử dụng cao. Mọi component phải nhận props rõ ràng và không phụ thuộc vào dữ liệu fix cứng.

## 🛠 Hướng Dẫn Phát Triển

1. **Thêm trang mới**: Tạo thư mục trang bên trong `src/pages/` tương ứng với vai trò. Đăng ký route trong `src/router/ROUTER.js` và `src/router/AppRouter.jsx`.
2. **Thêm menu**: Cập nhật menu sidebar/dropdown tại `src/router/MenuItem.jsx` theo đúng role.
3. **Kết nối API**: Tạo Service mới trong `src/services/`. Sử dụng instance `http` từ `01_axios` để thực hiện call.
4. **Auth action ở trang public**: Khi cần mở login/register, dùng `authModalStore.setAuthModal({ open: true, type: "login" | "register" })` thay vì `navigate(ROUTER.LOGIN/REGISTER)`.

## 📏 Quy Định Code (Coding Convention)

- **Naming**: 
  - Component: `PascalCase`.
  - Hằng số: `UPPER_SNAKE_CASE`.
  - Service/Hook: `camelCase`.
- **Separation of Concerns**: Tách biệt rõ ràng giữa giao diện (UI) và logic xử lý dữ liệu.
- **Generic First**: Luôn ưu tiên viết component theo hướng generic trước khi viết cho một nghiệp vụ cụ thể.

## 🤝 Quy Ước Làm Việc Nhóm (Bắt Buộc Thống Nhất)

1. **Tách component theo trang khi trang phức tạp**  
   - Nếu một trang có từ 2-3 block UI độc lập trở lên (filter, bảng, form, modal, chart...), bắt buộc tách component con.
   - Tạo thư mục `components` ngay trong thư mục của trang đó.

2. **Cấu trúc thư mục trang đề xuất**

```text
src/pages/<ROLE>/<PageName>/
├── index.jsx                # Container page, điều phối dữ liệu và ghép layout
├── components/              # UI con chỉ dùng trong trang này
│   ├── FilterBar.jsx
│   ├── DataTable.jsx
│   └── EditModal.jsx
├── hooks/                   # Hook riêng của trang (nếu có)
│   └── use<PageName>.js
├── constants.js             # Hằng số riêng của trang
└── styles.scss              # Style riêng của trang (nếu cần)
```

3. **Nguyên tắc chia trách nhiệm**
   - `index.jsx` của page không chứa JSX quá dài: chỉ giữ orchestration (state chính, gọi service, truyền props).
   - `components/*` chỉ xử lý hiển thị và callback.
   - Logic gọi API/transform data ưu tiên đưa vào `services` hoặc hook riêng.

4. **Quy ước kích thước file để tránh file "quá tải"**
   - Một file component nên giữ dưới khoảng 250-300 dòng.
   - Nếu vượt ngưỡng, phải tách nhỏ theo khối chức năng.

5. **Quy ước route & menu**
   - Mọi path phải khai báo trong `src/router/ROUTER.js`, không hard-code string route rải rác.
   - Mọi mục menu tương ứng route phải cập nhật trong `src/router/MenuItem.jsx`.

6. **Quy ước auth khi phát triển tính năng mới**
   - Không tạo thêm luồng đăng nhập rời bằng trang mới nếu chưa có quyết định kiến trúc từ team.
   - Chuẩn hiện tại: auth qua modal + guard điều hướng về Home.
