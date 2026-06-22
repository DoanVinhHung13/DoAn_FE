<div align="center">
  <img src="https://raw.githubusercontent.com/tandp53/DoAn_FE/main/src/assets/logo-eapls.jpg" alt="EAPLS Logo" width="120" />
  <h1>🌱 EAPLS - Nhật Ký Sản Xuất Nông Nghiệp Điện Tử</h1>
  <p><i>Hệ thống quản lý quy trình sản xuất nông nghiệp thông minh, minh bạch và an toàn</i></p>

  [![React](https://img.shields.io/badge/React-19.x-61DAFB.svg?style=for-the-badge&logo=react)](https://reactjs.org/)
  [![Vite](https://img.shields.io/badge/Vite-6.x-646CFF.svg?style=for-the-badge&logo=vite)](https://vitejs.dev/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC.svg?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
  [![Ant Design](https://img.shields.io/badge/Ant_Design-6.x-0170FE.svg?style=for-the-badge&logo=ant-design)](https://ant.design/)
  [![Redux Toolkit](https://img.shields.io/badge/Redux-2.x-764ABC.svg?style=for-the-badge&logo=redux)](https://redux-toolkit.js.org/)
</div>

<br />

## 📖 Giới thiệu dự án

**EAPLS (Nhật ký sản xuất điện tử)** là nền tảng quản lý nông nghiệp số toàn diện, giúp các hợp tác xã, trang trại và nông dân số hóa toàn bộ quy trình sản xuất. 

Dự án cung cấp một hệ sinh thái khép kín từ việc quản lý nhân sự, phân bổ vùng trồng, kiểm soát vật tư, đến việc truy xuất nguồn gốc nông sản bằng QR Code. Qua đó, EAPLS giúp nâng cao tính minh bạch, tối ưu năng suất và đảm bảo an toàn chất lượng nông sản.

## ✨ Tính năng nổi bật

- 🔐 **Phân quyền đa lớp (Role-Based Access Control):** 
  - **Quản lý HTX (Farm Manager):** Quản lý tổng thể, duyệt tài khoản, xem thống kê báo cáo.
  - **Quản lý vùng trồng (Land Manager):** Theo dõi mùa vụ, phân công lô đất.
  - **Quản lý vật tư (Material Manager):** Quản lý kho phân bón, thuốc bảo vệ thực vật, hạt giống.
  - **Nông dân (Farmer):** Ghi chép nhật ký sản xuất hằng ngày.
- ⚡ **Luồng xác thực bảo mật (Auth Flow):** Tích hợp JWT, tự động khôi phục phiên đăng nhập, cấu trúc "Single Source of Truth" với Redux.
- 📊 **Thống kê trực quan:** Biểu đồ đa chiều, xuất dữ liệu báo cáo ra Excel/PDF.
- 📱 **Truy xuất nguồn gốc:** Tích hợp tạo mã QR, quét mã kiểm tra lịch sử chăm sóc cây trồng.
- 📚 **Tra cứu TCVN:** Tích hợp cổng tra cứu Tiêu chuẩn Quốc gia (TCVN) trực tiếp trên ứng dụng.
- 🎨 **Giao diện hiện đại & Responsive:** Kết hợp sức mạnh của Ant Design và Tailwind CSS.

## 🛠 Công nghệ sử dụng

Hệ thống Front-end được xây dựng trên nền tảng các công nghệ hiện đại nhất:

### Core & Build
- **[React 19](https://react.dev/):** Thư viện UI cốt lõi.
- **[Vite](https://vitejs.dev/):** Build tool siêu tốc, HMR cực nhanh.
- **[React Router DOM v7](https://reactrouter.com/):** Quản lý điều hướng và Router Guards bảo mật.

### State Management & Data Fetching
- **[Redux Toolkit](https://redux-toolkit.js.org/):** Quản lý Global State (Theme, User Info).
- **[TanStack Query (React Query)](https://tanstack.com/query/latest):** Quản lý Server State, caching, synchronization.

### UI / Styling
- **[Ant Design 6](https://ant.design/):** Hệ thống Component UI doanh nghiệp.
- **[Tailwind CSS](https://tailwindcss.com/):** Utility-first CSS framework.
- **[Styled Components](https://styled-components.com/) & SCSS:** Xử lý các UI logic phức tạp.

### Forms & Validation
- **[React Hook Form](https://react-hook-form.com/):** Quản lý Form tối ưu hiệu năng.
- **[Yup](https://github.com/jquense/yup):** Schema validation.

### Utils & Extensions
- **[Axios](https://axios-http.com/):** HTTP Client với hệ thống Interceptors tự động bắt lỗi và xử lý Token.
- **Biểu đồ & Xuất file:** `recharts`, `jspdf`, `xlsx`.

## ⚙️ Yêu cầu hệ thống

- **Node.js**: Phiên bản `v18.0.0` trở lên.
- **NPM / Yarn / pnpm**.

## 🚀 Hướng dẫn cài đặt và chạy dự án

1. **Clone kho lưu trữ về máy:**
   ```bash
   git clone https://github.com/your-username/DoAn_FE.git
   cd DoAn_FE
   ```

2. **Cài đặt các thư viện phụ thuộc:**
   ```bash
   npm install
   ```

3. **Cấu hình biến môi trường (`.env`):**
   Đảm bảo bạn có file `.env` tại thư mục gốc với nội dung:
   ```env
   VITE_API_ROOT=https://api.eapls.io.vn/api
   VITE_API_URL=https://api.eapls.io.vn/api
   ```

4. **Khởi chạy môi trường phát triển (Development):**
   ```bash
   npm run dev
   ```
   > Ứng dụng sẽ chạy tại địa chỉ: `https://eapls.io.vn/`. Vite proxy đã được thiết lập tự động để giải quyết vấn đề CORS.

5. **Build cho môi trường Production:**
   ```bash
   npm run build
   ```

## 📁 Cấu trúc thư mục

```text
DoAn_FE/
├── src/
│   ├── assets/            # Hình ảnh, icon, styles (css, scss)
│   ├── components/        # Component tái sử dụng (Layout, UI chung, Providers)
│   ├── constants/         # Các hằng số (Roles, Status...)
│   ├── contexts/          # React Context (UI settings, Theme)
│   ├── hooks/             # Custom React Hooks
│   ├── lib/               # Utility functions (Utils, Formatters)
│   ├── pages/             # Các trang chia theo phân quyền (ANONYMOUS, MANAGER, FARMER...)
│   ├── redux/             # Redux Store, Slices
│   ├── router/            # Định nghĩa Route, Menu, Guards bảo mật
│   ├── services/          # HTTP Request (Axios configs, API endpoints)
│   └── store/             # Quản lý LocalStorage, AuthSession
├── public/                # Tài nguyên tĩnh
├── .env                   # Biến môi trường
├── vite.config.js         # Cấu hình Vite & Proxy CORS
└── package.json           # Dependencies
```

## 🤝 Đóng góp (Contributing)
Mọi đóng góp nhằm cải thiện hệ thống đều được hoan nghênh. Vui lòng tạo `Pull Request` hoặc mở `Issue` để thảo luận.

## 📝 Giấy phép (License)
Dự án được phân phối dưới giấy phép **MIT License**.
