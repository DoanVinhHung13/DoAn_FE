/**
 * VerticalTimeline — Timeline dọc dùng chung
 * UI thuần, không chứa data-fetching logic
 *
 * Sử dụng ở: Màn 1, 2, 3, 6, 7
 */
import PropTypes from 'prop-types'

/**
 * @param {Object[]} items           — mảng dữ liệu giai đoạn
 * @param {Function} renderItem      — (item, index) => JSX cho phần nội dung bên phải
 * @param {Function} [renderCircle]  — (item, index) => JSX custom cho vòng tròn bên trái
 * @param {string}   [lineColor]     — màu đường kẻ dọc (Tailwind class), mặc định 'border-gray-200'
 * @param {string}   [className]     — class bổ sung cho wrapper
 */
const VerticalTimeline = ({
  items = [],
  renderItem,
  renderCircle,
  lineColor = 'border-gray-200',
  className = '',
}) => {
  if (!items.length) return null

  const defaultCircle = (item, index) => {
    const status = item.status || item.isDraft === false ? 'filled' : 'empty'
    const isFilled = status === 'filled' || item.status === 'done' || item.status === 'inProgress'

    return (
      <div
        className={`relative z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold ${
          isFilled
            ? 'bg-green-600 text-white shadow-md shadow-green-200'
            : 'bg-gray-100 text-gray-400 border-2 border-gray-200'
        }`}
      >
        {index + 1}
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1

        return (
          <div key={item.id || item.order || index} className="relative flex gap-4">
            {/* Cột trái: vòng tròn + đường kẻ dọc */}
            <div className="flex flex-col items-center">
              {renderCircle ? renderCircle(item, index) : defaultCircle(item, index)}
              {!isLast && (
                <div className={`w-0 flex-1 border-l-2 ${lineColor} my-1`} />
              )}
            </div>

            {/* Cột phải: nội dung */}
            <div className={`flex-1 ${!isLast ? 'pb-6' : 'pb-0'}`}>
              {renderItem(item, index)}
            </div>
          </div>
        )
      })}
    </div>
  )
}

VerticalTimeline.propTypes = {
  items: PropTypes.array.isRequired,
  renderItem: PropTypes.func.isRequired,
  renderCircle: PropTypes.func,
  lineColor: PropTypes.string,
  className: PropTypes.string,
}

export default VerticalTimeline
