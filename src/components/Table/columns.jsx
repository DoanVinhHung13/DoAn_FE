import StatusBadge from "src/components/Common/StatusBadge"

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
