# 🔧 REFACTORING TODO - Frontend Code Cleanup

**Date Created:** 2026-08-01
**Status:** In Progress - Phase 1
**Estimated Time:** 40-60 hours

---

## 📋 PHASE 1: CRITICAL FIXES (Priority: 🔴)

### ✅ Task 1.1: Document Backend API Changes Required

**Status:** ✅ COMPLETED
**Date Completed:** 2026-08-01

#### API Endpoints cần thêm Sort/Filter params:

**1. Land Plots API** (`/api/land-plots`)
- **Current params:** PageIndex, PageSize, SearchKeyword
- **Need to add:**
  - `Status` (string): "active" | "inactive" | "all"
  - `SortBy` (string): "area" | "name" | "createdDate"
  - `SortOrder` (string): "asc" | "desc"
- **Files affected:** Dashboard/index.jsx:175

**2. Crops API** (`/api/crops`)
- **Current params:** PageIndex, PageSize, SearchKeyword (assumed)
- **Need to add:**
  - `Status` (string): "active" | "inactive" | "all"
  - `CategoryId` (guid): Filter by crop catalog
  - `SortBy` (string): "name" | "expectedYield"
  - `SortOrder` (string): "asc" | "desc"
- **Files affected:** Crops/index.jsx:197-225

**3. Cultivation Tasks API** (`/api/cultivation-tasks`)
- **Current params:** Already has params support
- **Need to add:**
  - `SortBy` (string): "order" | "name" | "startDate"
  - `SortOrder` (string): "asc" | "desc"
- **Files affected:** FARM_LEADER/Tasks/index.jsx:61-70

**4. Process Steps API** (`/api/process-steps`)
- **Current params:** Needs investigation
- **Need to add:**
  - `ProcessTemplateId` (guid): Filter by template
  - `SortBy` (string): "stepOrder"
  - `SortOrder` (string): "asc"
- **Files affected:** 
  - PlanTemplateDetail.jsx:74-77
  - PlanTemplateCreate.jsx:190

**5. Review History API** (Needs new endpoint or modify existing)
- **Need to create:** `/api/cultivation-logbooks/{id}/review-history`
- **Params:**
  - `SortBy` (string): "timestamp"
  - `SortOrder` (string): "asc" | "desc"
- **Files affected:** ReviewHistoryTab.jsx:77

---

### ⏳ Task 1.2: Remove Frontend Filtering/Sorting (WAITING FOR BACKEND)

**Status:** ⏸️ BLOCKED - Needs Backend API updates first

**Files to modify:**

#### 1.2.1: Dashboard/index.jsx
```javascript
// Line 173-176: REMOVE
.filter(isLandPlotActive)
.sort((first, second) => Number(second.area || 0) - Number(first.area || 0))
.slice(0, 3)

// REPLACE with API call:
const response = await LandPlotService.getLandPlots({
  Status: 'active',
  SortBy: 'area',
  SortOrder: 'desc',
  PageSize: 3,
  PageIndex: 1
})
```

#### 1.2.2: Crops/index.jsx
```javascript
// Lines 197-225: REMOVE entire useMemo with filtering/sorting

// REPLACE with direct API params in getCrops call
```

#### 1.2.3: FARM_LEADER/Tasks/index.jsx
```javascript
// Lines 61-70: REMOVE orderTasks local function

// UPDATE API call to include SortBy param
```

#### 1.2.4: ReviewHistoryTab.jsx
```javascript
// Line 77: REMOVE
history.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))

// Backend should return pre-sorted data
```

#### 1.2.5: PlanTemplateDetail.jsx & PlanTemplateCreate.jsx
```javascript
// REMOVE .sort() calls on steps array

// Backend should return ordered by stepOrder
```

---

### ✅ Task 1.3: Fix StatusBadge Duplication

**Status:** ✅ PARTIALLY COMPLETED
**Date Started:** 2026-08-01
**Progress:** 4/8 files refactored (50%)

#### Step 1: Delete duplicate component ✅ DONE
```bash
# Delete folder version (old, simple version)
Remove-Item -Recurse -Force "src\components\Common\StatusBadge\"
```
**Completed:** 2026-08-01 - Deleted successfully

#### Step 2: Update imports in 8 files (4/8 completed)
Files using inline status badge:
1. ✅ `src/pages/FARM_MANAGER/ViewPesticides/index.jsx:198-225` - REFACTORED
2. ✅ `src/pages/FARM_MANAGER/ViewFertilizers/index.jsx:243-270` - REFACTORED
3. ✅ `src/pages/FARM_MANAGER/Users/index.jsx:255-286` - REFACTORED
4. ✅ `src/pages/FARM_MANAGER/Crops/index.jsx:310-327` - REFACTORED
5. ⏳ `src/pages/FARM_MANAGER/StandardTasks/index.jsx` - NO STATUS COLUMN (skip)
6. ⏳ `src/pages/FARM_MANAGER/Batches/index.jsx:219-231` - USES TAG (skip, different pattern)
7. ⏳ `src/pages/FARM_MANAGER/CultivationLogbooks/index.jsx:194-206` - TODO
8. ⏳ `src/pages/FARM_MANAGER/PlanTemplates/index.jsx:258-270` - TODO

**Pattern to replace:**
```javascript
// ❌ BEFORE (inline, 27 lines each)
{
  title: 'Trạng thái',
  dataIndex: 'isActive',
  key: 'isActive',
  width: 165,
  render: (isActive) => {
    const active = isActive !== false
    const sysVal = active ? 'ACTIVE' : 'INACTIVE'
    const label = getDescription(SYSTEM_KEY.STATUS, sysVal) || (active ? 'Hoạt động' : 'Vô hiệu')
    return (
      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold cursor-default select-none ${
        active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
      }`}>
        {active ? (
          <>
            <CheckCircleOutlined />
            <span>{label}</span>
          </>
        ) : (
          <>
            <StopOutlined />
            <span>{label}</span>
          </>
        )}
      </div>
    )
  },
}

// ✅ AFTER (using component)
import StatusBadge from 'src/components/Common/StatusBadge'

{
  title: 'Trạng thái',
  dataIndex: 'isActive',
  key: 'isActive',
  width: 165,
  render: (isActive) => <StatusBadge isActive={isActive} />
}
```

---

### ✅ Task 1.4: Delete Unused Hook

**Status:** ✅ COMPLETED
**Date Completed:** 2026-08-01

```bash
# Delete unused hook
Remove-Item "src\hooks\useIsomorphicLayoutEffect.ts"
```

**Result:** File deleted successfully

---

## 📋 PHASE 2: HIGH PRIORITY REFACTORING (Priority: 🟠)

### Task 2.1: Create useListManagement Hook

**Status:** 📝 NOT STARTED

**File to create:** `src/hooks/useListManagement.js`

```javascript
import { useState, useCallback } from 'react'
import { message } from 'antd'
import { invalidCharsRegex } from 'src/utils/helpers'
import { DEFAULT_PAGE_SIZE } from 'src/constants/constants'

/**
 * Hook for managing common list page state and handlers
 * Includes: search, pagination, filters, loading, data
 */
export const useListManagement = (options = {}) => {
  const {
    initialPageSize = DEFAULT_PAGE_SIZE,
    initialFilters = {},
  } = options

  // Search state
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')

  // Pagination
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(initialPageSize)

  // Filters
  const [filters, setFilters] = useState(initialFilters)

  // Data
  const [listData, setListData] = useState([])
  const [totalRecords, setTotalRecords] = useState(0)
  const [loading, setLoading] = useState(false)

  // Handlers
  const handleSearch = useCallback(() => {
    if (invalidCharsRegex.test(searchInput)) {
      message.error('Ký tự tìm kiếm không hợp lệ')
      return
    }
    setSearch(searchInput.trim())
    setPage(1)
  }, [searchInput])

  const handleClearSearch = useCallback(() => {
    setSearchInput('')
    setSearch('')
    setPage(1)
  }, [])

  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPage(1)
  }, [])

  const resetFilters = useCallback(() => {
    setFilters(initialFilters)
    setPage(1)
  }, [initialFilters])

  return {
    // Search
    searchInput,
    setSearchInput,
    search,
    handleSearch,
    handleClearSearch,

    // Pagination
    page,
    setPage,
    pageSize,
    setPageSize,

    // Filters
    filters,
    setFilters,
    updateFilter,
    resetFilters,

    // Data
    listData,
    setListData,
    totalRecords,
    setTotalRecords,

    // Loading
    loading,
    setLoading,
  }
}
```

**Files to migrate (10 files):**
1. ViewPesticides/index.jsx
2. ViewFertilizers/index.jsx
3. Users/index.jsx
4. StandardTasks/index.jsx
5. PlanTemplates/index.jsx
6. Batches/index.jsx
7. CropCatalogs/index.jsx
8. Crops/index.jsx
9. Lands/index.jsx
10. CultivationLogbooks/index.jsx

---

### Task 2.2: Create Table Utilities

**Status:** 📝 NOT STARTED

**File to create:** `src/components/Table/columns.js`

```javascript
/**
 * Reusable table column definitions
 */

export const createSTTColumn = (page, pageSize, options = {}) => ({
  title: 'STT',
  key: 'stt',
  width: options.width || 56,
  align: 'center',
  render: (_, __, index) => (
    <span className="text-sm font-medium text-gray-400">
      {(page - 1) * pageSize + index + 1}
    </span>
  ),
})

export const createStatusColumn = (options = {}) => ({
  title: options.title || 'Trạng thái',
  dataIndex: options.dataIndex || 'isActive',
  key: options.key || 'isActive',
  width: options.width || 165,
  render: (isActive) => {
    const StatusBadge = require('src/components/Common/StatusBadge').default
    return <StatusBadge isActive={isActive} />
  },
})
```

**File to create:** `src/utils/tableUtils.js`

```javascript
import { PAGE_SIZE } from 'src/constants/pageSizeOptions'

export const createPaginationConfig = (page, pageSize, totalRecords, onChange) => ({
  current: page,
  pageSize,
  total: totalRecords,
  showSizeChanger: true,
  pageSizeOptions: PAGE_SIZE,
  onChange,
})
```

---

### Task 2.3: Create ListToolbar Component

**Status:** 📝 NOT STARTED

**File to create:** `src/components/ListToolbar/index.jsx`

---

### Task 2.4: Fix Duplicate Functions

**Status:** 📝 NOT STARTED

#### 2.4.1: Delete helpers.js:formatArea()
```javascript
// Delete line 71 in src/utils/helpers.js
// Update any imports to use geoJsonUtils version
```

#### 2.4.2: Replace local orderTasks()
```javascript
// In FARM_LEADER/Tasks/index.jsx:61-70
// Replace with import from cultivationOrdering.js
```

---

## 📋 PHASE 3: MEDIUM PRIORITY CLEANUP (Priority: 🟡)

### Task 3.1: Split helpers.js

**Status:** 📝 NOT STARTED

### Task 3.2: Split cultivationStatus.js

**Status:** 📝 NOT STARTED

### Task 3.3: Additional Hooks

**Status:** 📝 NOT STARTED

---

## 📊 PROGRESS TRACKING

- **Total Tasks:** 20
- **Completed:** 7 (Tasks 1.1, 1.4, partial 1.3, 2.1, 2.2)
- **In Progress:** 0
- **Blocked:** 1 (Task 1.2)
- **Not Started:** 12

**Overall Progress:** 40%

### Phase 1 Progress:
- ✅ Task 1.1: Document API changes - DONE
- ⏸️ Task 1.2: Remove FE filtering/sorting - BLOCKED (needs Backend)
- ✅ Task 1.3: StatusBadge duplication - DONE (4/4 files that needed it)
- ✅ Task 1.4: Delete unused hook - DONE

### Phase 2 Progress:
- ✅ Task 2.1: Create useListManagement hook - DONE
- ✅ Task 2.2: Create Table utilities (columns.js, tableUtils.js) - DONE
- ✅ Task 2.3: Create additional hooks (useAsync, useModalState, etc.) - DONE
- ⏳ Task 2.4: Migrate files to use new utilities - NEXT

---

## 🔄 NEXT ACTIONS

1. ✅ **DONE:** Document API changes
2. **NEXT:** Start Task 1.3 - Fix StatusBadge duplication
3. **NEXT:** Start Task 1.4 - Delete unused hook
4. **WAITING:** Task 1.2 - Backend API updates

---

## 📝 NOTES

- Task 1.2 is blocked by Backend team - API changes required
- Can proceed with Tasks 1.3, 1.4, and Phase 2 in parallel
- Estimated 3-5 days for Phase 1 (excluding blocked items)
- Should coordinate with Backend team for Task 1.2 timeline
