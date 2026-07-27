import { CheckCircleOutlined, StopOutlined } from '@ant-design/icons'

const StatusBadge = ({ isActive, activeLabel = 'Hoạt động', inactiveLabel = 'Ngừng hoạt động', className = '' }) => {
  const active = isActive !== false
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold select-none ${
        active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
      } ${className}`}
    >
      {active ? <CheckCircleOutlined /> : <StopOutlined />}
      <span>{active ? activeLabel : inactiveLabel}</span>
    </div>
  )
}

export default StatusBadge
