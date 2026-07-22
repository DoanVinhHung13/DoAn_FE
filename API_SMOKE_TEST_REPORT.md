# API Smoke Test Report — 2026-07-22

**Base URL:** `https://api.eapls.io.vn/api` (from `.env` `VITE_API_ROOT`)  
**Script:** `node scripts/smoke-test-api.cjs`

## Kết quả tổng

| | |
|--|--|
| Passed | **24** |
| Failed | **2** (legacy paths cố ý) |
| Login FM | OK |
| Login FS | OK |
| Login FL (`farmleader@eapls.com`) | OK |

## Failed (đúng kỳ vọng sau migrate)

| Endpoint | Status | Ghi chú |
|----------|--------|---------|
| `GET /standard-tasks` | 404 | Đã chuyển sang `/task-catalogs` |
| `GET /crop-protection` | 404 | Đã chuyển sang `/pesticides` |

## API luồng chính — OK

- Auth login/me
- cultivation-logbooks (+ detail, logs, closing-reviews)
- land-plots/available-for-logbook
- crops, users?Role=..., task-catalogs
- pesticides + selection, fertilizers/selection
- products, audit-logs
- cultivation-tasks, leader-summary, daily-logs/task/{id}
- cultivation-stages/logbook/{id}

## DTO lệch so với FE cũ (đã/đang sửa)

| Field FE cũ | Field API thật | Ảnh hưởng |
|-------------|----------------|-----------|
| `planName` | **`logbookName`** | List/Create/Detail/Review |
| Create body `planName` | **`logbookName`** (required) | Create logbook |
| leader-summary `descriptionSummary` | **`description`** | Compile modal |
| leader-summary `totalFertilizers` | **`fertilizers`** | Compile modal |
| leader-summary `totalPesticides` | **`pesticides`** | Compile modal |
| image `url` (official logs) | **`imageUrl`** | Review images |
| Task list `planName`/`landPlotName` | **Không có** — chỉ `cultivationLogbookId` | FL Tasks |

## Tài khoản test đã verify

```
farmmanager@eapls.com / Abc@1234     → FARM_MANAGER
farmsupervisor@eapls.com / Abc@1234  → FARM_SUPERVISOR
farmleader@eapls.com / Abc@1234      → FARM_LEADER
```

## Data mẫu hữu ích

- Logbook COMPLETED: `0b920b87-0f7d-45ef-bcd7-964f2ea5235e`
- Logbook PLANNED (FS): `ee9898d9-8476-4ac1-ab6c-363bd843072f`
- Task IN_PROGRESS (FL): `4ccf925f-6fdc-4434-91b7-ca48afbf0c1d`

## Cách chạy lại

```bash
node scripts/smoke-test-api.cjs
```
