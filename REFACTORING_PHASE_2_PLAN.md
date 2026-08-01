# 🔄 REFACTORING PHASE 2 - PLAN

**Date:** 2026-08-01 20:17 UTC+7
**Status:** Planning next files to refactor

---

## 📊 CURRENT STATUS

### ✅ Phase 1 Complete (7 files - 100%)
1. ViewFertilizers/index.jsx ✅
2. ViewPesticides/index.jsx ✅
3. Users/index.jsx ✅
4. PlanTemplates/index.jsx ✅
5. Lands/index.jsx ✅
6. StandardTasks/index.jsx ✅
7. InventoryImportHistory/index.jsx ✅

---

## 📋 REMAINING FILES ANALYSIS

### Category 1: Simple List Pages (Can Refactor)

#### 1. **Logbooks/index.jsx** - Danh sách nhật ký chờ duyệt
**Current State:**
```javascript
- useState for: loading, logbooks, searchInput, search, reloadKey
- useEffect for API call
- Custom filtering logic
```

**Refactoring Potential:** ⭐⭐⭐⭐ (High)
- Can use `useListManagement` hook
- Remove manual state management
- No status column (skip createStatusColumn)
- **Estimated time:** 15-20 minutes

---

#### 2. **Notifications/index.jsx** - Quản lý thông báo
**Current State:**
```javascript
- Uses React Query ✅
- useState for: keyword, status, category, isCreating, recipientType, activeTab
- Complex notification creation modal
- Tabs: received/sent
```

**Refactoring Potential:** ⭐⭐ (Medium-Low)
- Already uses React Query (good architecture)
- Too many custom states for modal/tabs
- Better to keep as-is
- **Decision:** SKIP (complex business logic)

---

### Category 2: Complex Pages (React Query + Custom Logic)

#### 3. **Crops/index.jsx** - Quản lý cây trồng
**Current State:**
```javascript
- Uses React Query + useMutation
- Client-side filtering/sorting (FE does filter/sort)
- Complex state: keyword, status, category, sortBy, statusTarget, page, pageSize
```

**Refactoring Potential:** ⭐⭐⭐ (Medium)
- Need architecture decision: Keep React Query or migrate?
- Client-side filtering should move to backend
- **Decision:** PENDING (need backend API changes)

---

#### 4. **CropCatalogs/index.jsx** - Danh mục cây trồng
**Current State:**
```javascript
- Uses React Query + useMutation
- Similar to Crops (client-side filtering)
- useState: keyword, status, editingCatalog, selectedCatalogId, statusTarget, page, pageSize
```

**Refactoring Potential:** ⭐⭐⭐ (Medium)
- Same as Crops
- **Decision:** PENDING (same architecture decision needed)

---

### Category 3: Special Pages (Don't Refactor)

#### 5. **QRManagement/index.jsx** - Quản lý mã QR
**Current State:**
```javascript
- Complex QR generation/preview logic
- useSearchParams, useRef, Form hooks
- Multiple React Query for batches/QR data
- Custom QR display & printing
```

**Decision:** ⛔ SKIP
- Not a list page
- Complex form + QR generation logic
- Keep as-is

---

#### 6. **Batches/index.jsx** - Lô thu hoạch
**Decision:** ⛔ SKIP
- Custom QR status (NOT_CREATED/CREATED)
- Already documented in Phase 1

---

#### 7. **CultivationLogbooks/index.jsx** - Nhật ký canh tác
**Decision:** ⛔ SKIP
- Complex cultivation workflow
- Already documented in Phase 1

---

#### 8. **Dashboard/index.jsx** - Tổng quan
**Decision:** ⛔ SKIP
- Not a list page
- Dashboard/stats page

---

#### 9. **Reports/index.jsx** - Báo cáo
**Decision:** ⛔ SKIP (need to check)

---

## 🎯 PHASE 2 PLAN

### Immediate Actions (Next 30 minutes)

#### File to Refactor: **Logbooks/index.jsx**

**Changes Needed:**
```javascript
// Before:
const [loading, setLoading] = useState(true)
const [logbooks, setLogbooks] = useState([])
const [searchInput, setSearchInput] = useState('')
const [search, setSearch] = useState('')
const [reloadKey, setReloadKey] = useState(0)

// After:
const {
  searchInput, setSearchInput, search, handleSearch,
  listData: logbooks, setListData: setLogbooks,
  loading, setLoading
} = useListManagement({
  initialPageSize: 100,
  initialFilters: {}
})

// Remove reloadKey pattern, use direct refetch
```

**Steps:**
1. Import `useListManagement`
2. Replace 5 useState with 1 hook call
3. Remove manual handlers
4. Keep custom filtering (canApproveClosing)
5. Test functionality

**Expected Result:**
- ~20 lines saved
- Consistent pattern with other pages

---

### After Logbooks (If Time Permits)

#### Option A: Make React Query Decision
- Review all React Query usage (Crops, CropCatalogs, Notifications, Batches)
- Decide: Keep or migrate
- Document decision

#### Option B: Check Reports Page
- Analyze Reports/index.jsx
- See if it's a simple list page
- Refactor if applicable

---

## 📊 SUMMARY

### Can Refactor Now:
- ✅ Logbooks/index.jsx (1 file)

### Pending Decision:
- ⏳ Crops/index.jsx
- ⏳ CropCatalogs/index.jsx
- ⏳ Reports/index.jsx (need analysis)

### Skip (Too Complex):
- ⛔ QRManagement/index.jsx
- ⛔ Notifications/index.jsx
- ⛔ Batches/index.jsx
- ⛔ CultivationLogbooks/index.jsx
- ⛔ Dashboard/index.jsx

---

**Next Action:** Refactor Logbooks/index.jsx
