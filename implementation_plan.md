# Kịch Bản Hoàn Chỉnh - Luồng Canh Tác (Phiên Bản Final)

Dưới đây là kịch bản chi tiết, từng bước một cho toàn bộ quy trình từ lúc Farm Manager lên kế hoạch cho đến khi duyệt và tạo mã QR. Kịch bản này đã bao gồm tất cả các lưu ý mới nhất về Work Tasks, Summary, tổng hợp ảnh và cấu trúc Logbook cuối cùng.

---

## Tóm Tắt Luồng Chảy (Workflow)

```
[1] Farm Manager
  → Tạo Kế hoạch tổng thể: Chỉ định Farm Supervisor + Định nghĩa các Giai đoạn (Tên, Mô tả, Thời gian dự kiến).
  → KHÔNG tạo Work Task. Mô tả của giai đoạn sẽ là cơ sở cho Supervisor.
       ↓
[2] Farm Supervisor
  → Dựa vào mô tả của từng Giai đoạn → Tạo hàng loạt "Work Tasks" chi tiết.
  → Đối với mỗi Work Task: Phân công cho 1 Farm Leader và nhiều Farmer, sau đó "Active" công việc đó.
       ↓
[3] Farm Leader
  → Xem được tổng quan kế hoạch, vùng trồng, giai đoạn.
  → Ghi nhật ký hàng ngày cho Work Task đang phụ trách.
  → Form ghi hàng ngày bao gồm:
      - Bảng Phân bón (Tên, Lượng, ĐV, Diện tích, ĐV)
      - Bảng Thuốc BVTV (Tên, Lượng, ĐV, Diện tích, ĐV)
      - Ảnh minh chứng (Có thể tải lên nhiều ảnh)
      - Mô tả công việc ngày hôm đó.
  → Ngày ghi nhật ký đầu tiên sẽ được tính là ngày bắt đầu thực tế của Giai đoạn.
  → Khi Task đạt tiến độ 100% → Bấm nút "Tạo Summary".
       ↓
[4] Hệ Thống (Tự động) & Farm Leader
  → Khi tạo Summary, hệ thống tự động:
      - Cộng dồn số liệu Phân bón, Thuốc BVTV từ tất cả các ngày của Task đó.
      - Gom toàn bộ Ảnh minh chứng đã chụp trong các ngày của Task đó.
  → Farm Leader tự viết thêm "Mô tả tổng kết" (Description) cho Task.
  → Gửi Summary hoàn chỉnh của Work Task này lên cho Supervisor.
       ↓
[5] Farm Supervisor
  → Vào xem Giai đoạn, thấy danh sách các "Summary của từng Work Task".
  → "Biên soạn nhật ký chính thức" cho từng Work Task:
      - Số liệu và Ảnh (do hệ thống tự động ghép) KHÔNG được phép sửa.
      - Supervisor chỉnh sửa/biên tập lại Mô tả (Description) của Leader thành văn phong chuẩn.
      - Kết quả: "Nhật ký chính thức của 1 Work Task".
  → Giai đoạn hoàn chỉnh = Tập hợp nhiều "Nhật ký chính thức của nhiều Work Tasks".
  → Khi tất cả các Giai đoạn hoàn thành, gửi toàn bộ Logbook lên Manager.
       ↓
[6] Farm Manager
  → Vào màn hình Logbook Review.
  → Xem toàn bộ nhật ký (Bản Final của 1 Giai đoạn gồm nhiều Summary của nhiều Work Tasks).
  → Xem được lịch sử chỉnh sửa của Supervisor.
  → Quyết định:
      - [Duyệt]: Cho phép tạo mã QR truy xuất nguồn gốc.
      - [Từ chối]: Ghi rõ lý do (văn phong chính thức) bắt Supervisor sửa lại.
```

---

## Chi tiết các thay đổi trên Giao Diện (UI)

### 1. Farm Manager: Trang Tạo Kế Hoạch (`/farm-manager/production-plans/create`)
- **Thay đổi:** **Xóa hoàn toàn** phần giao diện "Chi tiết công việc" (Work Tasks) trong form tạo Giai đoạn.
- **Lý do:** Farm Manager chỉ vạch ra định hướng (Tên Giai đoạn, Mô tả công việc cần làm). Farm Supervisor mới là người bóc tách mô tả đó thành các Work Tasks.

### 2. Farm Supervisor: Trang Chi Tiết Kế Hoạch (`/farm-supervisor/plans/:planId`)
- URL đổi thành `/plans` cho hợp lý hơn `/logbooks` ở giai đoạn lên plan.
- Hiển thị danh sách Giai đoạn.
- Có nút **"Thêm Công việc"** (Add Work Task) bên trong mỗi Giai đoạn.
- Form tạo Work Task: Tên công việc, Mô tả. Có thể tạo hàng loạt.
- Nhấp vào một Work Task → Trỏ đến màn hình **Chi tiết Work Task** (`.../tasks/:taskId`).
  - Tại đây có Form **"Gán Farm Leader & Farmer"**.
  - Có nút **"Kích hoạt (Active)"** để Farm Leader bắt đầu thấy được việc.

### 3. Farm Leader: Trang Công Việc (`/farm-leader/tasks`)
- **Danh sách công việc:** Hiển thị các Work Tasks được gán (Kèm context: Thuốc kế hoạch nào, Giai đoạn nào, Vùng trồng nào).
- **Ghi nhật ký hàng ngày:**
  - `Bảng Số Liệu`: Sử dụng đơn vị cố định đã chốt (Phân bón: kg, g, tấn, lít, ml, bao | TBVTV: ml, lít, g, kg, chai, gói | Diện tích: ha, m², sào).
  - `Ảnh minh chứng`: Nút upload ảnh (Dragger).
  - `Mô tả hôm nay`: TextArea.
  - Cập nhật `% tiến độ`.
- **Tạo Summary (Khi tiến độ 100%):**
  - Hiển thị Popup/Card xác nhận.
  - **Phần tự động (Readonly):** Tổng Phân bón, Tổng TBVTV, **Toàn bộ Ảnh** đã upload trong các ngày trước đó.
  - **Phần nhập (Editable):** `TextArea` để Leader viết Mô tả tổng kết toàn bộ quá trình làm Work Task này.
  - Nút **"Gửi báo cáo lên Supervisor"**.

### 4. Farm Supervisor: Trang Biên Soạn (`/farm-supervisor/plans/:planId/stages/:stageId`)
- Hiển thị danh sách các "Báo cáo Summary" từ các Work Tasks thuộc Giai đoạn này.
- **Biên soạn nhật ký chính thức cho từng Work Task:**
  - **[Preview Số Liệu]**: Câu hệ thống tự ghép (VD: *"Đã bón 25 kg Phân Urê cho 5 ha trong 2 ngày (21/08/2026: 10 kg/2 ha; 22/08/2026: 15 kg/3 ha)"*).
  - **[Ảnh Đính Kèm]**: Toàn bộ ảnh của Task (KHÔNG được xóa/sửa).
  - **[Mô Tả]**: Pre-fill bằng Mô tả tổng kết của Leader. Supervisor được quyền sửa lại câu chữ cho chuyên nghiệp.
  - Lưu lại thành bản chính thức của Work Task.
- Khi toàn bộ Work Tasks trong Giai đoạn đã được biên soạn xong → Giai đoạn hoàn tất.
- Có nút **"Gửi Logbook lên Farm Manager"** (Chỉ hiện khi mọi giai đoạn đều xong).

### 5. Farm Manager: Trang Review Logbook (`/farm-manager/logbooks/:id/review`)
- Hiển thị bản nháp cuối cùng.
- **Bản Final:** Được phân chia theo từng Giai đoạn. Bên trong mỗi Giai đoạn sẽ liệt kê chi tiết các Nhật ký chính thức của từng Work Task (Gồm Câu số liệu, Ảnh, và Mô tả đã được Supervisor trau chuốt).
- Bên cạnh có **Lịch sử chỉnh sửa** để đối chiếu.
- Nút **"Duyệt & Tạo QR"**.
- Nút **"Từ chối"** kèm popup ghi lý do.

---

## 🛠 Danh Sách Công Việc (Task List) Cần Thực Hiện

1. **Khởi tạo Routing & Role:** Đổi URL, thêm `FARM_LEADER` role, setup mock data cho Work Tasks & Summary.
2. **Cập nhật ProductionPlanCreate (FM):** Xóa toàn bộ logic liên quan đến Work Tasks.
3. **Xây dựng PlanDetail & TaskDetail (FS):** Cho phép FS tạo Work Tasks, gán Leader/Farmer và Active.
4. **Xây dựng Giao diện Farm Leader (FL):** Màn danh sách việc, Màn ghi nhật ký hàng ngày (có Ảnh), Logic tự động gom Số liệu + Ảnh khi tạo Summary.
5. **Cập nhật StageLog (FS):** Hiển thị danh sách Summary của nhiều Tasks, chức năng biên soạn (chỉ sửa chữ, không sửa data/ảnh).
6. **Xây dựng LogbookReview (FM):** Màn duyệt nhật ký cuối cùng, hiển thị theo Giai đoạn -> Multiple Tasks, logic Duyệt/Từ chối.

> **Bạn hãy kiểm tra kỹ lại Kịch bản (V4) này.** 
> Nếu luồng này đã mô tả chính xác 100% mong muốn của bạn (bao gồm chi tiết về Summary, Ảnh, và cấu trúc Final Logbook), hãy duyệt `Implementation Plan` này, và tôi sẽ bắt đầu viết code ngay lập tức!
