/**
 * Automated Refactoring Script - Find & Replace Patterns
 * 
 * This file contains regex patterns to automate the refactoring process
 * Use these with your IDE's Find & Replace feature (Regex mode enabled)
 * 
 * USAGE:
 * 1. Open file in VS Code
 * 2. Press Ctrl+H (Find & Replace)
 * 3. Enable Regex mode (.*) button
 * 4. Copy FIND pattern, then REPLACE pattern
 * 5. Review changes before accepting
 */

// ============================================================================
// PATTERN 1: Remove duplicate state declarations
// ============================================================================

/**
 * FIND: State declaration block (8 lines)
 */
const FIND_STATE_BLOCK = `
  const \\[searchInput, setSearchInput\\] = useState\\(''\\)
  const \\[search, setSearch\\] = useState\\(''\\)
  const \\[statusFilter, setStatusFilter\\] = useState\\('all'\\)
  const \\[page, setPage\\] = useState\\(1\\)
  const \\[pageSize, setPageSize\\] = useState\\(DEFAULT_PAGE_SIZE\\)

  const \\[listData, setListData\\] = useState\\(\\[\\]\\)
  const \\[totalRecords, setTotalRecords\\] = useState\\(0\\)
  const \\[loading, setLoading\\] = useState\\(false\\)
`.trim()

/**
 * REPLACE: With useListManagement hook
 */
const REPLACE_WITH_HOOK = `
  // Use List Management Hook
  const {
    searchInput, setSearchInput, search, handleSearch, handleClearSearch,
    page, setPage, pageSize, setPageSize,
    filters, updateFilter,
    listData, setListData, totalRecords, setTotalRecords,
    loading, setLoading
  } = useListManagement({
    initialPageSize: DEFAULT_PAGE_SIZE,
    initialFilters: { status: 'all' }
  })

  const statusFilter = filters.status
`.trim()

// ============================================================================
// PATTERN 2: Remove handleSearch function
// ============================================================================

const FIND_HANDLE_SEARCH = `
  const handleSearch = useCallback\\(\\(\\) => \\{
    if \\(invalidCharsRegex\\.test\\(searchInput\\)\\) \\{
      message\\.error\\('Ký tự tìm kiếm không hợp lệ'\\)
      return
    \\}
    setSearch\\(searchInput\\.trim\\(\\)\\)
    setPage\\(1\\)
  \\}, \\[searchInput\\]\\)
`.trim()

const REPLACE_HANDLE_SEARCH = `
  // handleSearch is now provided by useListManagement hook
`.trim()

// ============================================================================
// PATTERN 3: Remove handleClearSearch function
// ============================================================================

const FIND_HANDLE_CLEAR = `
  const handleClearSearch = \\(\\) => \\{
    setSearchInput\\(''\\)
    setSearch\\(''\\)
    setPage\\(1\\)
  \\}
`.trim()

const REPLACE_HANDLE_CLEAR = `
  // handleClearSearch is now provided by useListManagement hook
`.trim()

// ============================================================================
// PATTERN 4: Replace STT column
// ============================================================================

const FIND_STT_COLUMN = `
    \\{
      title: 'STT',
      key: 'stt',
      width: 56,
      align: 'center',
      render: \\(_, __, index\\) => \\(
        <span className="text-sm font-medium text-gray-400">
          \\{\\(page - 1\\) \\* pageSize \\+ index \\+ 1\\}
        </span>
      \\),
    \\},
`.trim()

const REPLACE_STT_COLUMN = `
    createSTTColumn(page, pageSize),
`.trim()

// ============================================================================
// PATTERN 5: Replace Status column (complex version)
// ============================================================================

const FIND_STATUS_COLUMN = `
    \\{
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 165,
      render: \\(isActive\\) => \\{
        const active = isActive !== false
        const sysVal = active \\? 'ACTIVE' : 'INACTIVE'
        const label = getDescription\\(SYSTEM_KEY\\.STATUS, sysVal\\) \\|\\| \\(active \\? 'Hoạt động' : 'Vô hiệu'\\)
        return \\(
          <div
            className=\\{\\`inline-flex items-center gap-1\\.5 px-3 py-1 rounded-full text-\\[11px\\] font-bold cursor-default select-none \\$\\{active \\? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
              \\}\\`\\}
          >
            \\{active \\? \\(
              <>
                <CheckCircleOutlined />
                <span>\\{label\\}</span>
              </>
            \\) : \\(
              <>
                <StopOutlined />
                <span>\\{label\\}</span>
              </>
            \\)\\}
          </div>
        \\)
      \\},
    \\},
`.trim()

const REPLACE_STATUS_COLUMN = `
    createStatusColumn({
      getLabel: (isActive) => {
        const active = isActive !== false
        const sysVal = active ? 'ACTIVE' : 'INACTIVE'
        return getDescription(SYSTEM_KEY.STATUS, sysVal) || (active ? 'Hoạt động' : 'Vô hiệu')
      }
    }),
`.trim()

// ============================================================================
// PATTERN 6: Replace pagination config
// ============================================================================

const FIND_PAGINATION = `
        pagination=\\{\\{
          current: page,
          pageSize,
          total: totalRecords,
          showSizeChanger: true,
          pageSizeOptions: PAGE_SIZE,
          onChange: \\(p, ps\\) => \\{
            setPage\\(p\\)
            setPageSize\\(ps\\)
          \\},
        \\}\\}
`.trim()

const REPLACE_PAGINATION = `
        pagination={createPaginationConfig(page, pageSize, totalRecords, (p, ps) => {
          setPage(p)
          setPageSize(ps)
        })}
`.trim()

// ============================================================================
// PATTERN 7: Replace filter onChange
// ============================================================================

const FIND_FILTER_ONCHANGE = `
            onChange=\\{\\(val\\) => \\{
              setStatusFilter\\(val\\)
              setPage\\(1\\)
            \\}\\}
`.trim()

const REPLACE_FILTER_ONCHANGE = `
            onChange={(val) => updateFilter('status', val)}
`.trim()

// ============================================================================
// PATTERN 8: Update imports - Add new utilities
// ============================================================================

const FIND_IMPORTS = `
import \\{ DEFAULT_PAGE_SIZE \\} from 'src/constants/constants'
import \\{ PAGE_SIZE \\} from 'src/constants/pageSizeOptions'
`.trim()

const REPLACE_IMPORTS = `
import { createSTTColumn, createStatusColumn } from 'src/components/Table/columns'
import { createPaginationConfig } from 'src/utils/tableUtils'
import { DEFAULT_PAGE_SIZE } from 'src/constants/constants'
import { useListManagement } from 'src/hooks/useListManagement'
`.trim()

// ============================================================================
// PATTERN 9: Remove unused imports
// ============================================================================

const REMOVE_IMPORTS = [
  "import { message } from 'antd'  // Remove if only used for search validation",
  "import { invalidCharsRegex } from 'src/utils/helpers'  // Moved to hook",
  "import { PAGE_SIZE } from 'src/constants/pageSizeOptions'  // In utility",
  "CheckCircleOutlined, StopOutlined  // Remove from icon imports if only used for status"
]

// ============================================================================
// EXPORT PATTERNS FOR REFERENCE
// ============================================================================

export const REFACTORING_PATTERNS = {
  state: { find: FIND_STATE_BLOCK, replace: REPLACE_WITH_HOOK },
  handleSearch: { find: FIND_HANDLE_SEARCH, replace: REPLACE_HANDLE_SEARCH },
  handleClear: { find: FIND_HANDLE_CLEAR, replace: REPLACE_HANDLE_CLEAR },
  sttColumn: { find: FIND_STT_COLUMN, replace: REPLACE_STT_COLUMN },
  statusColumn: { find: FIND_STATUS_COLUMN, replace: REPLACE_STATUS_COLUMN },
  pagination: { find: FIND_PAGINATION, replace: REPLACE_PAGINATION },
  filterChange: { find: FIND_FILTER_ONCHANGE, replace: REPLACE_FILTER_ONCHANGE },
  imports: { find: FIND_IMPORTS, replace: REPLACE_IMPORTS },
  removeImports: REMOVE_IMPORTS
}

// ============================================================================
// QUICK REFERENCE GUIDE
// ============================================================================

/**
 * STEP-BY-STEP GUIDE FOR EACH FILE:
 * 
 * 1. Add imports (Pattern 8)
 * 2. Replace state block (Pattern 1)  
 * 3. Remove handleSearch (Pattern 2)
 * 4. Remove handleClearSearch (Pattern 3)
 * 5. Replace STT column (Pattern 4)
 * 6. Replace Status column (Pattern 5)
 * 7. Replace pagination (Pattern 6)
 * 8. Replace filter onChange (Pattern 7)
 * 9. Remove unused imports (Pattern 9)
 * 10. Add hook dependencies to getList useCallback
 * 11. Test thoroughly
 * 
 * ESTIMATED TIME PER FILE: 10-15 minutes
 * TOTAL TIME FOR 8 FILES: 2-3 hours
 */

/**
 * FILES TO MIGRATE (Priority Order):
 * 
 * 1. ✅ ViewPesticides/index.jsx - DONE
 * 2. 🔄 ViewFertilizers/index.jsx - IN PROGRESS
 * 3. ⏳ Users/index.jsx
 * 4. ⏳ StandardTasks/index.jsx  
 * 5. ⏳ PlanTemplates/index.jsx
 * 6. ⏳ Batches/index.jsx
 * 7. ⏳ Crops/index.jsx
 * 8. ⏳ CultivationLogbooks/index.jsx
 * 9. ⏳ Lands/index.jsx
 * 10. ⏳ CropCatalogs/index.jsx
 */

/**
 * TESTING CHECKLIST (After each file):
 * 
 * □ File loads without errors
 * □ Search works
 * □ Clear search works
 * □ Pagination changes page
 * □ Pagination changes page size
 * □ Filter changes work
 * □ STT numbers correct
 * □ Status badges display correctly
 * □ Table data loads
 * □ Row clicks navigate
 * □ No console errors
 */
