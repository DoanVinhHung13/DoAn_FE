import { Card, Pagination } from 'antd'

const AdminPaginationCard = ({ pagination, className = '' }) => {
  if (!pagination || pagination === false) return null

  const { className: paginationClassName, ...paginationProps } = pagination
  const normalizedPaginationProps = {
    ...paginationProps,
    showTotal: (total, range) => (
      <span className="text-xs text-gray-500">
        {range[0]}–{range[1]} / <strong>{total}</strong>
      </span>
    ),
  }

  return (
    <Card
      variant="borderless"
      className={`admin-pagination-card rounded-lg shadow-sm ${className}`.trim()}
      styles={{ body: { padding: '10px 16px' } }}
    >
      <Pagination {...normalizedPaginationProps} className={paginationClassName} />
    </Card>
  )
}

export default AdminPaginationCard
