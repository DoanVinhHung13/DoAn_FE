/**
 * StatusBadge — Badge trạng thái dùng chung
 * Supports both old API (status string) and new API (isActive boolean)
 */
import PropTypes from 'prop-types'
import { CheckCircleOutlined, StopOutlined } from '@ant-design/icons'

const STATUS_MAP = {
  // Season / general statuses
  active:        { label: 'Active',          bg: 'bg-green-50',  text: 'text-green-700', dot: 'bg-green-500' },
  completed:     { label: 'Hoàn thành',      bg: 'bg-gray-100',  text: 'text-gray-600',  dot: 'bg-gray-400' },
  draft:         { label: 'Draft',           bg: 'bg-gray-50',   text: 'text-gray-500',  dot: 'bg-gray-300' },

  // Stage statuses
  done:          { label: 'Hoàn thành',      bg: 'bg-green-50',  text: 'text-green-700', dot: 'bg-green-500' },
  inProgress:    { label: 'Đang thực hiện',  bg: 'bg-amber-50',  text: 'text-amber-700', dot: 'bg-amber-500' },
  notStarted:    { label: 'Chưa bắt đầu',   bg: 'bg-gray-50',   text: 'text-gray-500',  dot: 'bg-gray-300' },

  // Vietnamese aliases
  'đang diễn ra':  { label: 'Đang diễn ra',   bg: 'bg-green-50',  text: 'text-green-700', dot: 'bg-green-500' },
  'hoàn thành':    { label: 'Hoàn thành',      bg: 'bg-gray-100',  text: 'text-gray-600',  dot: 'bg-gray-400' },
  'đang thực hiện': { label: 'Đang thực hiện', bg: 'bg-amber-50',  text: 'text-amber-700', dot: 'bg-amber-500' },
  'chưa bắt đầu':  { label: 'Chưa bắt đầu',  bg: 'bg-gray-50',   text: 'text-gray-500',  dot: 'bg-gray-300' },
}

const FALLBACK = { label: '', bg: 'bg-gray-50', text: 'text-gray-500', dot: 'bg-gray-300' }

const StatusBadge = ({ 
  status, 
  isActive, 
  activeLabel, 
  inactiveLabel, 
  label, 
  showDot = true, 
  showIcon = false,
  className = '' 
}) => {
  // Support both old API (status string) and new API (isActive boolean)
  if (isActive !== undefined) {
    const active = isActive !== false
    const displayLabel = active ? (activeLabel || 'Hoạt động') : (inactiveLabel || 'Vô hiệu')
    const bgColor = active ? 'bg-green-50' : 'bg-red-50'
    const textColor = active ? 'text-green-700' : 'text-red-600'
    const dotColor = active ? 'bg-green-500' : 'bg-red-500'
    const Icon = active ? CheckCircleOutlined : StopOutlined

    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold cursor-default select-none ${bgColor} ${textColor} ${className}`}>
        {showIcon && <Icon className="text-xs" />}
        {showDot && !showIcon && <span className={`h-2 w-2 rounded-full ${dotColor}`} />}
        <span>{displayLabel}</span>
      </span>
    )
  }

  // Old behavior for status string
  const key = String(status || '').toLowerCase()
  const config = STATUS_MAP[key] || FALLBACK
  const displayLabel = label || config.label || status

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${config.bg} ${config.text} ${className}`}
    >
      {showDot && (
        <span className={`h-2 w-2 rounded-full ${config.dot}`} />
      )}
      {displayLabel}
    </span>
  )
}

StatusBadge.propTypes = {
  status: PropTypes.string,
  isActive: PropTypes.bool,
  activeLabel: PropTypes.string,
  inactiveLabel: PropTypes.string,
  label: PropTypes.string,
  showDot: PropTypes.bool,
  showIcon: PropTypes.bool,
  className: PropTypes.string,
}

export default StatusBadge
