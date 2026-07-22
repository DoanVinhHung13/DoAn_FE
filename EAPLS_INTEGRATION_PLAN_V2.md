# EAPLS Frontend Integration Plan — v2

> **Ngày tạo:** 2026-07-22  
> **Trạng thái:** ĐÃ XÁC NHẬN — sẵn sàng code  
> **Swagger:** https://api.eapls.io.vn/swagger/index.html  
> **Swagger JSON:** https://api.eapls.io.vn/swagger/v1/swagger.json  

### Tài khoản test

```json
{ "identifier": "farmmanager@eapls.com", "password": "Abc@1234" }
{ "identifier": "farmsupervisor@eapls.com", "password": "Abc@1234" }
```

### Tài liệu nghiệp vụ tham chiếu

- `Luồng góp ý.docx`
- `Luồng góp ý (1).docx`

---

## 0. Phạm vi đã xác nhận

### Phân loại đúng

| Loại | Thuộc luồng chính? | Làm trong v2? |
|------|--------------------|---------------|
| **6 bước luồng chính** (kể cả Manager Review + Duyệt/Từ chối + **Tạo QR**) | ✅ Có | ✅ Bắt buộc, theo thứ tự |
| Equipment\*, Reports\*, Products\* (CRUD master), SoilTypes\*, DataBackupLogs\* | ❌ Không — **luồng phụ** | ❌ Chưa tính / chưa làm |
| Legacy Journal / HTX | ❌ Không — legacy | ❌ Xóa khỏi kế hoạch |

> **Làm rõ:** QrCodes / harvest-batches **NẰM TRONG luồng chính** (bước 6 tài liệu).  
> Equipment / Reports / … **KHÔNG nằm trong luồng chính** — là module phụ, để sau.

### Trong phạm vi v2

1. **Luồng chính 6 bước** (bắt buộc làm theo thứ tự) — gồm bước 6 **Tạo QR**
2. **Sửa màn đã có nhưng gọi sai API / dùng mock**
3. **Migrate FM StandardTasks → `/task-catalogs`**
4. **Migrate CropProtection → `/pesticides`** (khi block daily log selection)
5. Service `HarvestBatchService` + `QrCodeService` phục vụ bước 6

### Luồng phụ — chưa làm (KHÔNG thuộc luồng chính)

| Hạng mục | Ghi chú |
|----------|---------|
| Equipment\* | Quản lý thiết bị — luồng phụ |
| Reports\* | Báo cáo dashboard — luồng phụ |
| Products\* (CRUD danh mục) | Master data phụ — khác với tạo harvest-batch trong bước 6 |
| SoilTypes\* | Master data phụ |
| DataBackupLogs\* | Hệ thống phụ |
| MATERIAL_MANAGER router | Role/module phụ — chưa wire |
| Legacy Journal / HTX | Xóa khỏi kế hoạch — không migrate |

### Quy tắc bắt buộc

1. **Không fallback nhiều tên field** — dùng đúng DTO Backend (`item.planName`, không `item.planName || item.name`).
2. API qua **Service layer** `src/services/{Domain}Service/` — không gọi axios trực tiếp trong page.
3. **Giữ UI/style hiện tại** — AntD, layout, spacing, component tái sử dụng.
4. Response unwrap: `res?.data?.data`; list phân trang: `data.items`.
5. **Không đổi** folder structure, coding style, naming convention hiện tại.
6. Trước mỗi màn: ghi rõ API / components / API còn thiếu. Sau mỗi màn: checklist + báo cáo ngắn.

### Response Backend chuẩn

```json
{ "success": true, "message": "...", "data": { ... }, "errors": [] }
```

FE:

```js
const unwrap = (res) => res?.data?.data ?? res?.data
// list phân trang:
const page = unwrap(res)
const items = page.items || []
```

> **Lưu ý axios:** Service paths kiểu `/cultivation-logbooks` (không prefix `/api`).  
> `VITE_API_ROOT` phải đã include `/api` (hoặc baseURL tương đương). Kiểm tra trước khi code.

---

## 1. Business Flow (luồng chính — 6 bước bắt buộc)

> Nguồn: `Luồng góp ý.docx` — làm **theo đúng thứ tự**. Không nhảy bước.

```
1. FM: Tạo kế hoạch (POST /cultivation-logbooks) → plan / start
2. FS: Tạo Work Tasks (bulk + assign + start)
3. FL: Ghi nhật ký hằng ngày (POST /cultivation-daily-logs)
4. FL: Tạo / gửi Summary (POST /cultivation-tasks/{id}/summary)
5. FS: Biên soạn nhật ký chính thức (PATCH description + approve) + Chốt sổ (submit-completion)
6. FM: Review → Duyệt/Từ chối → Tạo lô (harvest-batches) → Tạo QR
```

### Bảng 6 bước (theo tài liệu)

| # | Bước | Role | API chính |
|---|------|------|-----------|
| 1 | Tạo kế hoạch | FM | `POST /cultivation-logbooks`, land-plots/available, crops, users?Role=FARM_SUPERVISOR, plan/start |
| 2 | Tạo Work Tasks | FS | `GET task-catalogs`, `POST cultivation-tasks/bulk`, `PUT tasks/{id}`, `POST tasks/{id}/start` |
| 3 | Ghi nhật ký hằng ngày | FL | `POST cultivation-daily-logs`, fertilizers/selection, pesticides/selection, media/upload |
| 4 | Leader Summary | FL | `GET tasks/{id}/leader-summary`, `POST tasks/{id}/summary` |
| 5 | Biên soạn + chốt sổ | FS | `PATCH logs/{id}/description`, `POST logs/{id}/approve`, `GET stages/{id}/summary`, `POST logbooks/{id}/submit-completion` |
| 6 | **Review + Duyệt/Từ chối + Tạo QR** | FM | `GET closing-reviews`, approve/reject-completion, **`POST /harvest-batches`**, **`POST /qr-codes/generate/{harvestBatchId}`**, `GET /qr-codes/{traceCode}/image`, `GET /traceability/{traceCode}` |

> **Bước 6 gồm đủ 3 phần:** Review → Duyệt/Từ chối → **Tạo QR**. Không dừng ở approve/reject.

### Điều kiện chuyển bước

| Từ | Đến | Điều kiện |
|----|-----|-----------|
| 1 Create | 2 FS Tasks | Logbook đã PLANNED/ACTIVE |
| 2 Task tab | 3 Daily Log | Task đã `start` (ACTIVE/IN_PROGRESS) |
| 3 Daily Log | 4 Summary | `progress >= 100` |
| 4 Summary | 5 Compile | Leader đã submit summary |
| 5 Compile + chốt | 6 FM Review | `submit-completion` thành công |
| 6 Approve | **Tạo QR** | Logbook **COMPLETED + APPROVED** (theo tài liệu: QR chỉ tạo được sau khi duyệt) |

### Role → Route

| Role | Route | File chính |
|------|-------|------------|
| FARM_MANAGER | `/farm-manager/cultivation-logbooks` | `src/pages/FARM_MANAGER/CultivationLogbooks/` |
| FARM_MANAGER | `/farm-manager/logbooks` | `src/pages/FARM_MANAGER/Logbooks/` |
| FARM_MANAGER | `/farm-manager/standard-tasks` | `src/pages/FARM_MANAGER/StandardTasks/` → migrate TaskCatalogs |
| FARM_SUPERVISOR | `/farm-supervisor/plans` | `src/pages/FARM_SUPERVISOR/Plans/` |
| FARM_LEADER | `/farm-leader/tasks` | `src/pages/FARM_LEADER/Tasks/` |
| FARM_LEADER | `/farm-leader/tasks/:taskId/log` | `src/pages/FARM_LEADER/Tasks/DailyLog.jsx` |

---

## 2. Mâu thuẫn Tài liệu ↔ Swagger (đã xử lý cho FE)

| # | Tài liệu | Swagger | FE phải dùng |
|---|----------|---------|--------------|
| 1 | Daily log = `/cultivation-daily-logs` | ✅ | `/cultivation-daily-logs` |
| 2 | Summary = `POST .../summary` | ✅ | `POST /cultivation-tasks/{id}/summary` |
| 3 | Sửa mô tả = `PATCH .../description` | ✅ | `PATCH /cultivation-logs/{id}/description` |
| 4 | Thuốc = `/pesticides` | ✅ | `/pesticides` (không `/crop-protection`) |
| 5 | Task catalog = `/task-catalogs` | ✅ | `/task-catalogs` (không `/standard-tasks`) |
| 6 | Doc: `POST /product-batches` | Swagger: `POST /harvest-batches` | **FE dùng `/harvest-batches`** |
| 7 | Doc: `generate/{productBatchId}` | Swagger: `generate/{harvestBatchId}` | **FE dùng `harvestBatchId`** |
| 8 | QR sau COMPLETED+APPROVED | ✅ | Bắt buộc trong bước 6 — sau approve-completion |

---

## 3. Lỗi hiện tại cần sửa

| # | File | Đang sai | Phải đúng | Priority |
|---|------|----------|-----------|----------|
| 1 | `FARM_LEADER/Tasks/DailyLog.jsx` | `POST /cultivation-logs` | `POST /cultivation-daily-logs` | 🔴 |
| 2 | `DailyLog.jsx` summary | `PUT /cultivation-tasks/{id}` status | `POST /cultivation-tasks/{id}/summary` | 🔴 |
| 3 | `DailyLog.jsx` preview | Không có | `GET /cultivation-tasks/{id}/leader-summary` | 🔴 |
| 4 | `DailyLog.jsx` vật tư | Text tự do | `GET /fertilizers/selection` + `GET /pesticides/selection` | 🔴 |
| 5 | `CompileLogModal.jsx` | `FakeCultivationService` | `PATCH description` + `POST approve` | 🔴 |
| 6 | `LogbookFinalizationTab.jsx` | `mockStageSummary` | stage summary/logs + submit-completion | 🔴 |
| 7 | `FM/Logbooks/index.jsx` | Mock fallback | `GET /cultivation-logbooks/closing-reviews` | 🟠 |
| 8 | `FM/Logbooks/LogbookReview.jsx` | 100% mock | logs + audit-logs + approve/reject-completion | 🟠 |
| 9 | `StageTaskManagementTab.jsx` | Không picker | `GET /task-catalogs` | 🟠 |
| 10 | `StandardTaskService` + FM StandardTasks page | `/standard-tasks` | `/task-catalogs` | 🟠 **ĐÃ XÁC NHẬN migrate** |
| 11 | `CropProtectionService` | `/crop-protection` | `/pesticides` | 🟠 |
| 12 | `CultivationLogbookCreate.jsx` | `GET /land-plots` | `GET /land-plots/available-for-logbook` | 🟡 |
| 13 | `FARM_LEADER/Tasks/index.jsx` | `MOCK_SUPERVISOR_PLAN` | Data từ task/logbook API | 🟡 |

### Mock files cần loại bỏ (sau khi ghép API)

- `src/pages/FARM_SUPERVISOR/Logbooks/mockData.js` (FakeCultivationService)
- Mock trong `CompileLogModal.jsx`, `LogbookFinalizationTab.jsx`
- Mock fallback trong `FM/Logbooks/index.jsx`, `LogbookReview.jsx`
- `MOCK_SUPERVISOR_PLAN` trong `FL/Tasks/index.jsx`

---

## 4. Service Layer Plan

### 4.1. Tạo mới

#### A. `src/services/CultivationDailyLogService/`

**urls.js**

```js
export const apiCreateCultivationDailyLog = '/cultivation-daily-logs'
export const apiGetDailyLogsByTask = (taskId) => `/cultivation-daily-logs/task/${taskId}`
export const apiGetDailyLogsByStage = (stageId) => `/cultivation-daily-logs/stage/${stageId}`
export const apiGetDailyLogTaskSummary = (taskId) => `/cultivation-daily-logs/task/${taskId}/summary`
```

**Body POST daily log (đúng DTO):**

```json
{
  "taskId": "...",
  "date": "2026-07-22",
  "progress": 50,
  "description": "...",
  "fertilizers": [
    {
      "fertilizerId": "...",
      "materialId": "...",
      "quantity": 500,
      "quantityUnit": "g",
      "area": 1,
      "areaUnit": "ha"
    }
  ],
  "pesticides": [
    {
      "pesticideId": "...",
      "materialId": "...",
      "quantity": 250,
      "quantityUnit": "ml",
      "area": 1,
      "areaUnit": "ha"
    }
  ],
  "images": [{ "url": "https://..." }]
}
```

> FE **không** nhập phân/thuốc dạng text tự do — phải chọn từ selection để có `materialId`. BE tự quy đổi đơn vị và trừ kho.

#### B. `src/services/TaskCatalogService/`

**urls.js**

```js
export const apiGetTaskCatalogs = '/task-catalogs'
export const apiCreateTaskCatalog = '/task-catalogs'
export const apiGetTaskCatalogById = (id) => `/task-catalogs/${id}`
export const apiUpdateTaskCatalog = (id) => `/task-catalogs/${id}`
export const apiDeleteTaskCatalog = (id) => `/task-catalogs/${id}`
```

> Thay thế `StandardTaskService` (`/standard-tasks` — **không có trong Swagger**).

#### C. `src/services/PesticideService/`

**urls.js**

```js
export const apiGetPesticides = '/pesticides'
export const apiCreatePesticide = '/pesticides'
export const apiGetPesticideById = (id) => `/pesticides/${id}`
export const apiUpdatePesticide = (id) => `/pesticides/${id}`
export const apiDeletePesticide = (id) => `/pesticides/${id}`
export const apiTogglePesticideStatus = (id) => `/pesticides/${id}/status`
export const apiGetPesticideSelection = '/pesticides/selection'
```

> Thay thế `CropProtectionService` (`/crop-protection` — **không có trong Swagger**).

### 4.2. Bổ sung vào service hiện có

#### `CultivationTaskService/urls.js` — THÊM

```js
export const apiGetLeaderSummary = (id) => `/cultivation-tasks/${id}/leader-summary`
export const apiSubmitTaskSummary = (id) => `/cultivation-tasks/${id}/summary`
```

**Body submit summary:**

```json
{
  "descriptionSummary": "Tổng kết công việc...",
  "completedAt": "2026-07-22"
}
```

> FE **không** gửi TotalFertilizers / TotalPesticides / Images — BE tự rebuild từ daily logs.

#### `CultivationLogService/urls.js` — THÊM

```js
export const apiPatchLogDescription = (id) => `/cultivation-logs/${id}/description`
```

**Body:**

```json
{ "description": "Mô tả đã biên soạn theo văn phong chuẩn" }
```

> Chỉ sửa mô tả — không sửa ảnh/số liệu/đơn vị/diện tích.

#### `CultivationLogbookService/urls.js` — THÊM (nếu chưa có method gọi)

```js
export const apiGetClosingReviews = '/cultivation-logbooks/closing-reviews'
```

(Các endpoint `submit-completion`, `approve-completion`, `reject-completion` **đã có** trong urls.js hiện tại — kiểm tra `index.js` đã export method chưa.)

#### `FertilizerService/urls.js` — THÊM

```js
export const apiGetFertilizerSelection = '/fertilizers/selection'
```

#### `LandPlotService/urls.js` — THÊM

```js
export const apiGetLandPlotsAvailableForLogbook = '/land-plots/available-for-logbook'
```

### 4.3. Style service hiện tại (bắt buộc follow)

Xem mẫu: `src/services/CultivationTaskService/index.js`, `urls.js`

- Export default object methods: `getAll`, `getById`, `create`, `update`, `delete`...
- Import axios từ `src/services/01_axios` hoặc `src/services/api`
- Path không có `/api` prefix nếu baseURL đã có

---

## 5. Thứ tự triển khai (CHI TIẾT)

---

### PHASE 1 — Service Layer

**Mục tiêu:** Tất cả endpoint luồng chính có trong Service trước khi sửa UI.

#### Checklist Phase 1

- [ ] Tạo `CultivationDailyLogService` (urls + index)
- [ ] Tạo `TaskCatalogService` (urls + index)
- [ ] Tạo `PesticideService` (urls + index) — ít nhất selection + CRUD cơ bản
- [ ] Tạo `HarvestBatchService` (urls + index) — phục vụ bước 6 Tạo QR
- [ ] Tạo `QrCodeService` (urls + index) — generate + image
- [ ] Bổ sung `CultivationTaskService`: leader-summary, summary
- [ ] Bổ sung `CultivationLogService`: PATCH description
- [ ] Bổ sung `CultivationLogbookService`: closing-reviews method (nếu thiếu)
- [ ] Bổ sung `FertilizerService`: selection
- [ ] Bổ sung `LandPlotService`: available-for-logbook
- [ ] Smoke-check import không lỗi build

**Không đụng UI trong Phase 1.**

#### D. `src/services/HarvestBatchService/` (bước 6)

```js
export const apiGetHarvestBatches = '/harvest-batches'
export const apiCreateHarvestBatch = '/harvest-batches'
export const apiGetHarvestBatchById = (id) => `/harvest-batches/${id}`
export const apiGetHarvestBatchTraceability = (id) => `/harvest-batches/${id}/traceability`
```

#### E. `src/services/QrCodeService/` (bước 6)

```js
export const apiGenerateQrCode = (harvestBatchId) => `/qr-codes/generate/${harvestBatchId}`
export const apiGetQrCodeImage = (traceCode) => `/qr-codes/${traceCode}/image`
```

> Doc ghi `product-batches` / `productBatchId` — **Swagger dùng `harvest-batches` / `harvestBatchId`**. Always follow Swagger.

---

### PHASE 2 — Sửa màn gọi sai API

---

#### MÀN 2.1 — Farm Leader Daily Log 🔴

**File:** `src/pages/FARM_LEADER/Tasks/DailyLog.jsx`  
**Route:** `/farm-leader/tasks/:taskId/log`

##### API sử dụng

```
GET  /cultivation-tasks/{id}
GET  /cultivation-daily-logs/task/{taskId}
GET  /fertilizers/selection
GET  /pesticides/selection
POST /v1/media/upload?folder=eapls/daily-logs
POST /cultivation-daily-logs
GET  /cultivation-tasks/{id}/leader-summary
POST /cultivation-tasks/{id}/summary
```

##### Components

Form, DatePicker, Select, InputNumber, Upload/Dragger, Modal, Progress, Image

##### Việc cần làm

1. Thay `CultivationLogService.create(payload)` → `CultivationDailyLogService.create(payload)`
2. Load selection fertilizers/pesticides khi mở form
3. Khi chọn item: lưu cả `fertilizerId`/`pesticideId` + `materialId` + `name`
4. Upload ảnh qua UploadService → lấy URL → đưa vào `images: [{ url }]`
5. Khi progress >= 100: mở modal summary
6. Preview: `GET leader-summary`
7. Submit: `POST .../summary` với `{ descriptionSummary, completedAt }` — **không** PUT task status
8. Bỏ multi-fallback field nếu có

##### Body summary

```json
{
  "descriptionSummary": "Tổng kết...",
  "completedAt": "2026-07-22"
}
```

##### Checklist sau màn

- [ ] UI giữ style cũ
- [ ] API hoạt động với farmsupervisor / farm leader account
- [ ] Loading / empty / error
- [ ] Validate form
- [ ] Không còn gọi `/cultivation-logs` để tạo daily log
- [ ] Selection có materialId

##### Báo cáo sau màn (điền khi xong)

```
API đã ghép:
API còn thiếu:
Vấn đề phát hiện:
Đề xuất:
```

---

#### MÀN 2.2 — FS CompileLogModal 🔴

**File:** `src/pages/FARM_SUPERVISOR/Plans/components/CompileLogModal.jsx`

##### API sử dụng

```
GET   /cultivation-tasks/{id}              (hoặc data đã có từ parent: leaderSummary)
PATCH /cultivation-logs/{id}/description
POST  /cultivation-logs/{id}/approve
(POST /cultivation-logs/{id}/reject — nếu UI có nút từ chối)
```

##### Components

Modal, Form, TextArea, Collapse, Image, Alert

##### Việc cần làm

1. Xóa import `FakeCultivationService`
2. Chỉ cho sửa `description` — số liệu/ảnh read-only
3. Lưu: `PATCH .../description` rồi `POST .../approve` (hoặc theo UX hiện tại)
4. Body approve có thể gửi `{ "comment": "..." }`

##### Checklist sau màn

- [ ] Không còn FakeCultivationService
- [ ] Không cho sửa ảnh/số liệu
- [ ] Approve hoạt động

##### Báo cáo sau màn

```
API đã ghép:
API còn thiếu:
Vấn đề phát hiện:
Đề xuất:
```

---

#### MÀN 2.3 — FS LogbookFinalizationTab 🔴

**File:** `src/pages/FARM_SUPERVISOR/Plans/components/LogbookFinalizationTab.jsx`  
**Parent:** `PlanDetail.jsx` (cần truyền `planId` / `logbookId` nếu chưa có)

##### API sử dụng

```
GET  /cultivation-stages/{id}/summary
GET  /cultivation-stages/{id}/logs
POST /cultivation-logbooks/{id}/submit-completion
```

##### Components

List stages, Table materials, Image gallery, Form, Button submit

##### Việc cần làm

1. Xóa `mockStageSummary`
2. Khi chọn stage → fetch summary + logs
3. Bind đúng field DTO (không `stage.stageName || stage.name`)
4. Nút gửi chốt sổ → `submit-completion`
5. Đảm bảo `planId` được truyền từ `PlanDetail`

##### Checklist sau màn

- [ ] Không còn mock
- [ ] Summary/logs thật
- [ ] Submit completion hoạt động

##### Báo cáo sau màn

```
API đã ghép:
API còn thiếu:
Vấn đề phát hiện:
Đề xuất:
```

---

#### MÀN 2.4 — FM Logbooks List + Review + Tạo QR 🟠

**Files:**
- `src/pages/FARM_MANAGER/Logbooks/index.jsx`
- `src/pages/FARM_MANAGER/Logbooks/LogbookReview.jsx`
- (hoặc Tab Nhật ký chính thức trong `CultivationLogbookDetail` — theo tài liệu URL)

> Đây là **bước 6 luồng chính** đầy đủ: Review → Duyệt/Từ chối → **Tạo lô + QR**.

##### API sử dụng

```
GET  /cultivation-logbooks/closing-reviews
GET  /cultivation-logbooks/{id}/logs
GET  /audit-logs
POST /cultivation-logbooks/{id}/approve-completion
POST /cultivation-logbooks/{id}/reject-completion

# Sau khi APPROVED — Tạo QR (bắt buộc trong bước 6)
POST /harvest-batches
POST /qr-codes/generate/{harvestBatchId}
GET  /qr-codes/{traceCode}/image
GET  /traceability/{traceCode}          (xem trước / public)
GET  /harvest-batches/{id}/traceability (nếu cần)
```

**Body reject:**

```json
{ "reason": "Nội dung chưa đủ căn cứ..." }
```

> Doc ghi `product-batches` — **Swagger thực tế là `harvest-batches`**. Dùng đúng Swagger.

##### Components

Table, Search/Filter, Descriptions, Modal reject, Timeline/audit, Form tạo lô, hiển thị ảnh QR

##### Việc cần làm

1. List: `closing-reviews` — bỏ `MOCK_SUBMITTED_LOGBOOKS`
2. Review: load logs + audit-logs
3. Approve / Reject completion
4. **Sau approve:** form/modal tạo harvest-batch → generate QR → hiển thị ảnh QR
5. Chỉ cho tạo QR khi logbook đã COMPLETED + APPROVED (theo tài liệu)

##### Service cần tạo/bổ sung (Phase 1)

- `HarvestBatchService` — `POST /harvest-batches`, `GET /harvest-batches/{id}`, `GET .../traceability`
- `QrCodeService` — `POST /qr-codes/generate/{harvestBatchId}`, `GET /qr-codes/{traceCode}/image`

##### Checklist sau màn

- [ ] Không còn mock
- [ ] Approve/reject hoạt động
- [ ] Audit logs hiển thị (nếu API trả data)
- [ ] Tạo harvest-batch + generate QR sau approve
- [ ] Hiển thị ảnh QR
- [ ] Không gọi `/product-batches` (sai tên doc)

##### Báo cáo sau màn

```
API đã ghép:
API còn thiếu:
Vấn đề phát hiện:
Đề xuất:
```
---

#### MÀN 2.5 — FS Task Catalog Picker 🟠

**File:** `src/pages/FARM_SUPERVISOR/Plans/components/StageTaskManagementTab.jsx`  
(+ modal add task nếu có / tạo mới theo style cũ)

##### API sử dụng

```
GET  /task-catalogs
POST /cultivation-tasks/bulk   (đã có)
POST /cultivation-tasks        (create nhanh 1 task — đã có)
```

##### Body bulk (đã hỗ trợ null)

```json
{
  "cultivationLogbookId": "...",
  "cultivationStageId": "...",
  "tasks": [
    {
      "taskCatalogId": null,
      "name": "Bón lót",
      "description": "Bón phân hữu cơ",
      "leaderId": null,
      "farmerIds": null
    }
  ]
}
```

##### Việc cần làm

1. Modal/select: chọn task từ catalog hoặc tạo mới (`taskCatalogId: null` + `name`)
2. Dùng `TaskCatalogService`, **không** dùng `StandardTaskService`

##### Checklist sau màn

- [ ] Picker load từ `/task-catalogs`
- [ ] Bulk vẫn hoạt động
- [ ] Có thể tạo task custom (không catalog)

##### Báo cáo sau màn

```
API đã ghép:
API còn thiếu:
Vấn đề phát hiện:
Đề xuất:
```

---

#### MÀN 2.6 — FM Create Logbook (available-for-logbook) 🟡

**File:** `src/pages/FARM_MANAGER/CultivationLogbooks/CultivationLogbookCreate.jsx`

##### API bổ sung

```
GET /land-plots/available-for-logbook
```

(Các API khác giữ nguyên: crops, users?Role=FARM_SUPERVISOR, POST cultivation-logbooks)

##### Body tạo kế hoạch

```json
{
  "landPlotId": "...",
  "cropId": "...",
  "planName": "...",
  "description": "...",
  "assignedFarmSupervisorId": "...",
  "cultivationStages": [
    {
      "stageName": "Làm đất",
      "stageOrder": 1,
      "description": "Mô tả giai đoạn"
    }
  ]
}
```

##### Việc cần làm

1. Select thửa đất gọi `available-for-logbook`
2. Refactor `getCreatedPlanId` / `normalizeResponse` — bỏ multi-fallback, dùng đúng DTO

##### Checklist sau màn

- [ ] Chỉ hiện thửa đất available
- [ ] Không fallback field

##### Báo cáo sau màn

```
API đã ghép:
API còn thiếu:
Vấn đề phát hiện:
Đề xuất:
```

---

#### MÀN 2.7 — FL Tasks List cleanup 🟡

**File:** `src/pages/FARM_LEADER/Tasks/index.jsx`

##### Việc cần làm

1. Bỏ `MOCK_SUPERVISOR_PLAN`
2. Lấy plan/land info từ task API response hoặc fetch logbook by id từ task

##### Báo cáo sau màn

```
API đã ghép:
API còn thiếu:
Vấn đề phát hiện:
Đề xuất:
```

---

### PHASE 3 — Migrate master data path sai

---

#### MÀN 3.1 — FM StandardTasks → TaskCatalogs 🟠 (ĐÃ XÁC NHẬN)

**Files hiện tại:**
- `src/pages/FARM_MANAGER/StandardTasks/` (index, TaskCreate, TaskDetail, TaskEdit)
- `src/services/StandardTaskService/`

##### API mới

```
GET    /task-catalogs
POST   /task-catalogs
GET    /task-catalogs/{id}
PUT    /task-catalogs/{id}
DELETE /task-catalogs/{id}
```

##### Việc cần làm

1. Chuyển page dùng `TaskCatalogService` thay `StandardTaskService`
2. Field UI map đúng DTO TaskCatalog (đọc Swagger schema trước khi map — **không đoán field**)
3. Có thể giữ URL route `/farm-manager/standard-tasks` tạm thời (không đổi router user-facing) **HOẶC** đổi sang `/farm-manager/task-catalogs` nếu muốn đúng resource — **ưu tiên đổi sang task-catalogs theo quy tắc naming**, cập nhật `ROUTER.js` + `AppRouter.jsx` + MenuItem
4. Sau khi ổn: deprecate `StandardTaskService` (có thể giữ file trống comment, hoặc xóa nếu không còn import)

##### Quyết định URL (mặc định theo plan)

```
ROUTER.FM_TASKS → '/farm-manager/task-catalogs'
ROUTER.FM_TASK_CREATE → '/farm-manager/task-catalogs/create'
ROUTER.FM_TASK_DETAIL → '/farm-manager/task-catalogs/:id'
ROUTER.FM_TASK_EDIT → '/farm-manager/task-catalogs/:id/edit'
```

Cập nhật menu label: "Danh mục công việc" / "Task Catalogs".

##### Checklist sau màn

- [ ] CRUD qua `/task-catalogs`
- [ ] Không còn gọi `/standard-tasks`
- [ ] Menu + router cập nhật
- [ ] FS picker dùng cùng service

##### Báo cáo sau màn

```
API đã ghép:
API còn thiếu:
Vấn đề phát hiện:
Đề xuất:
```

---

#### MÀN 3.2 — CropProtection → Pesticides 🟠

**Files:**
- `src/pages/FARM_MANAGER/ViewCropProtections/`
- `src/services/CropProtectionService/`

##### API

```
GET/POST/PUT/DELETE /pesticides
PATCH /pesticides/{id}/status
GET /pesticides/selection
```

##### Việc cần làm

1. Page dùng `PesticideService`
2. Giữ UI hiện tại, chỉ đổi API path + field DTO
3. Route có thể giữ `/farm-manager/view-crop-protections` tạm, hoặc rename sang `/farm-manager/pesticides` — **ưu tiên `/farm-manager/pesticides`** nếu ít ảnh hưởng menu

##### Checklist sau màn

- [ ] Không còn `/crop-protection`
- [ ] Selection dùng được cho Daily Log

---

## 6. Checklist chung sau mỗi màn

- [ ] UI đúng thiết kế cũ
- [ ] API hoạt động (test bằng account FM/FS)
- [ ] Loading state
- [ ] Empty state
- [ ] Error handling
- [ ] Permission theo Role
- [ ] Validate Form
- [ ] Pagination / Search / Filter (nếu API hỗ trợ)
- [ ] **Không** fallback nhiều tên attribute
- [ ] Không còn mock trong màn đó

---

## 7. Prompt mẫu để AI tiếp tục (khi hết token)

Copy prompt sau vào chat mới:

```
Đọc file EAPLS_INTEGRATION_PLAN_V2.md trong repo DoAn_FE.

Phạm vi đã xác nhận v2:
- Luồng chính 6 bước BẮT BUỘC theo thứ tự (kể cả bước 6: Review + Duyệt/Từ chối + Tạo QR)
- Sửa màn đã có nhưng gọi sai API / mock
- Migrate StandardTasks → task-catalogs
- Migrate CropProtection → pesticides khi cần
- Luồng phụ CHƯA làm: Equipment, Reports, Products CRUD, SoilTypes, DataBackupLogs
- Legacy Journal/HTX: xóa khỏi kế hoạch

Quy tắc:
- Không fallback nhiều tên field
- Giữ UI/style/structure hiện tại
- API qua Service layer
- Dùng đúng DTO Backend
- Doc ghi product-batches → Swagger harvest-batches (dùng Swagger)

Hãy tiếp tục từ bước tiếp theo chưa hoàn thành trong checklist của file plan.
Trước khi code mỗi màn: ghi rõ Màn hình / API / Components / API còn thiếu.
Sau mỗi màn: checklist + báo cáo ngắn.
Không code luồng phụ (Equipment, Reports, ...).
```

---

## 8. Progress Tracker

Đánh dấu khi hoàn thành:

### Phase 1 — Services

- [x] CultivationDailyLogService
- [x] TaskCatalogService
- [x] PesticideService
- [x] HarvestBatchService (bước 6)
- [x] QrCodeService (bước 6)
- [x] CultivationTaskService (+ leader-summary, summary)
- [x] CultivationLogService (+ PATCH description)
- [x] CultivationLogbookService (+ closing-reviews method)
- [x] FertilizerService (+ selection)
- [x] LandPlotService (+ available-for-logbook)

### Phase 2 — Screens (theo thứ tự luồng)

> **Nghiệm thu / test E2E:** làm và verify theo bước **1 → 2 → 3 → 4 → 5 → 6**.  
> **Thứ tự code dưới đây** ưu tiên sửa màn đang sai API trước, nhưng bước 6 phải đủ Review + Duyệt/Từ chối + **Tạo QR**.

- [x] 2.1 FL DailyLog (bước 3–4)
- [x] 2.2 FS CompileLogModal (bước 5)
- [x] 2.3 FS LogbookFinalizationTab (bước 5)
- [x] 2.4 FM Logbooks + Review + **Tạo QR** (bước 6 đầy đủ)
- [x] 2.5 FS Task Catalog picker (bước 2)
- [x] 2.6 FM Create Logbook available-for-logbook (bước 1)
- [x] 2.7 FL Tasks List cleanup

### Phase 3 — Migrations

- [x] 3.1 FM StandardTasks → TaskCatalogs (route + service)
- [x] 3.2 CropProtection → Pesticides

### Luồng phụ — chưa làm

- [ ] Equipment\*
- [ ] Reports\*
- [ ] Products\* CRUD
- [ ] SoilTypes\*
- [ ] DataBackupLogs\*
- [ ] MATERIAL_MANAGER router
---

## 9. Ghi chú kỹ thuật quan trọng

1. **Stage ACTIVE:** Tài liệu mới — giai đoạn chỉ chuyển ACTIVE khi work task được start (không auto sau khi tạo). Verify khi test BE.
2. **Bulk task:** `leaderId` và `farmerIds` cho phép `null`.
3. **Daily log ≠ cultivation-logs:** Daily = `/cultivation-daily-logs`; Official log = `/cultivation-logs`.
4. **Supervisor biên soạn:** dùng `PATCH .../description`, không dùng PUT full log.
5. **QR chỉ tạo sau COMPLETED + APPROVED:** thuộc **bước 6 luồng chính** — implement trong Màn 2.4 sau approve-completion.
6. **Doc `product-batches` vs Swagger `harvest-batches`:** luôn follow Swagger.
7. **React Query:** project dùng mixed (inline useQuery + useState/useEffect). Follow pattern của file đang sửa — không tạo convention mới.
8. **Roles:** `src/constants/roles.js` — FARM_MANAGER, FARM_SUPERVISOR, FARM_LEADER, FARMER.
9. **Luồng phụ** (Equipment, Reports, Products CRUD, SoilTypes, DataBackupLogs): không thuộc 6 bước chính — không code trong v2.

---

## 10. File tham chiếu nhanh trong repo

| Mục đích | Path |
|----------|------|
| Router constants | `src/router/ROUTER.js` |
| Route wiring | `src/router/AppRouter.jsx` |
| Menu | `src/router/MenuItem.jsx` |
| Axios | `src/services/01_axios/index.js` |
| Roles | `src/constants/roles.js` |
| FS Plans | `src/pages/FARM_SUPERVISOR/Plans/` |
| FL DailyLog | `src/pages/FARM_LEADER/Tasks/DailyLog.jsx` |
| FM Logbooks | `src/pages/FARM_MANAGER/Logbooks/` |
| FM CultivationLogbooks | `src/pages/FARM_MANAGER/CultivationLogbooks/` |
| FM StandardTasks | `src/pages/FARM_MANAGER/StandardTasks/` |
| Mock cần xóa | `src/pages/FARM_SUPERVISOR/Logbooks/mockData.js` |
| Swagger dump local | `swagger_apis.json` (nếu còn) |

---

## 11. Báo cáo cuối (điền khi hoàn tất toàn bộ v2)

### 1. Các màn đã ghép API

_(điền)_

### 2. Các màn dựng mới

_(điền — v2 ưu tiên sửa màn có sẵn, hạn chế dựng mới)_

### 3. Các API chưa sử dụng (trong phạm vi còn lại)

_(điền)_

### 4. Các API bị thiếu

_(điền)_

### 5. Lỗi Swagger phát hiện

_(điền)_

### 6. Đề xuất cải thiện

_(điền)_

---

**END OF PLAN v2**  
Bắt đầu code từ **PHASE 1 — Service Layer**, sau đó **Màn 2.1 DailyLog**.
