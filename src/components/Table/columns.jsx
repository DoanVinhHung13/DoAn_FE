/**
 * Reusable table column definitions
 *
 * Factory functions to create common column configurations
 * Used across multiple list management pages to reduce duplication
 */

import StatusBadge from "src/components/Common/StatusBadge"

/**
 * Create STT (sequential number) column
 *
 * @param {number} page - Current page number
 * @param {number} pageSize - Page size
 * @param {Object} options - Optional configuration
 * @param {number} options.width - Column width (default: 56)
 * @param {string} options.title - Column title (default: 'STT')
 * @returns {Object} Ant Design table column config
 *
 * @example
 * const columns = [
 *   createSTTColumn(page, pageSize),
 *   { title: 'Name', dataIndex: 'name' },
 * ]
 */
export const createSTTColumn = (page, pageSize, options = {}) => ({
  title: options.title || "STT",
  key: "stt",
  width: options.width || 56,
  align: "center",
  render: (_, __, index) => (
    <span className="text-sm font-medium text-gray-400">
      {(page - 1) * pageSize + index + 1}
    </span>
  ),
})

/**
 * Create status badge column (active/inactive)
 *
 * Automatically handles both API formats:
 * - Priority: record.status (string: 'ACTIVE'/'INACTIVE')
 * - Fallback: record.isActive (boolean)
 *
 * @param {Object} options - Column configuration
 * @param {string} options.title - Column title (default: 'Trạng thái')
 * @param {number} options.width - Column width (default: 165)
 * @param {Function} options.getLabel - Custom label getter function (receives isActive boolean)
 * @returns {Object} Ant Design table column config
 *
 * @example
 * // Simple usage
 * const columns = [
 *   createStatusColumn(),
 * ]
 *
 * @example
 * // With custom label from SystemKey
 * const columns = [
 *   createStatusColumn({
 *     getLabel: (isActive) => {
 *       const sysVal = isActive ? 'ACTIVE' : 'INACTIVE'
 *       return getDescription(SYSTEM_KEY.STATUS, sysVal) || (isActive ? 'Hoạt động' : 'Vô hiệu')
 *     }
 *   })
 * ]
 */
export const createStatusColumn = (options = {}) => {
  const { title = "Trạng thái", width = 165, getLabel = null } = options

  return {
    title,
    key: "status",
    width,
    render: (_, record) => {
      // Priority: use status field if available, fallback to isActive
      let active
      if (record.status !== undefined && record.status !== null) {
        active = String(record.status).toUpperCase() === "ACTIVE"
      } else {
        active = record.isActive !== false
      }

      if (getLabel) {
        const label = getLabel(active)
        return (
          <StatusBadge
            isActive={active}
            activeLabel={label}
            inactiveLabel={label}
          />
        )
      }

      return <StatusBadge isActive={active} />
    },
  }
}

/**
 * Create actions column with common settings
 *
 * @param {Object} options - Column configuration
 * @param {Function} options.render - Render function for actions
 * @param {number} options.width - Column width (default: 120)
 * @param {string} options.title - Column title (default: 'Hành động')
 * @returns {Object} Ant Design table column config
 */
export const createActionsColumn = (options = {}) => {
  const { render, width = 120, title = "Hành động" } = options

  return {
    title,
    key: "actions",
    fixed: "right",
    width,
    align: "center",
    render,
  }
}
