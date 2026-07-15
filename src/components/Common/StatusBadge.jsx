/**
 * StatusBadge — Badge trạng thái dùng chung
 * Dùng nhất quán qua các màn: Plan Template, Season, Field Log
 */
import PropTypes from 'prop-types'

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

const StatusBadge = ({ status, label, showDot = true, className = '' }) => {
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
  status: PropTypes.string.isRequired,
  label: PropTypes.string,
  showDot: PropTypes.bool,
  className: PropTypes.string,
}

export default StatusBadge
