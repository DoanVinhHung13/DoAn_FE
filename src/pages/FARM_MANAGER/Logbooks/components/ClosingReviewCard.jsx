import {
  CalendarOutlined,
  EnvironmentOutlined,
  EyeOutlined,
  UserOutlined,
} from "@ant-design/icons"
import { Button, Card, Tag, Typography } from "antd"
import { useCultivationStatus } from "src/hooks/useCultivationStatus"
import { formatDate } from "src/utils/dateFormatters"
import { getLandPlotNamesDisplay } from "src/utils/helpers"

const { Text } = Typography

const ClosingReviewCard = ({ logbook, onReview }) => {
  const { getLogbookStatus, getReviewStatus } = useCultivationStatus()

  const statusConfig = getLogbookStatus(logbook.status)
  const reviewConfig = logbook.reviewStatus
    ? getReviewStatus(logbook.reviewStatus)
    : null

  const handleCardClick = () => {
    if (onReview) {
      onReview(logbook.id)
    }
  }

  const handleButtonClick = e => {
    e.stopPropagation()
    if (onReview) {
      onReview(logbook.id)
    }
  }

  return (
    <Card
      bordered={false}
      className="overflow-hidden border border-gray-100 shadow-sm rounded-2xl hover:border-green-300 hover:shadow-md cursor-pointer transition"
      styles={{ body: { padding: 0 } }}
      onClick={handleCardClick}
    >
      {/* ── Card Header ── */}
      <div className="p-5 border-b bg-gradient-to-r from-green-50 to-white">
        <div className="flex flex-wrap justify-between gap-2 mb-2">
          <div className="flex flex-wrap gap-2">
            <Tag color={statusConfig.color} className="rounded-full">
              {statusConfig.label}
            </Tag>
            {reviewConfig && (
              <Tag color={reviewConfig.color} className="rounded-full">
                Duyệt: {reviewConfig.label}
              </Tag>
            )}
          </div>
          <Text type="secondary" className="text-xs">
            <CalendarOutlined className="mr-1" />
            {logbook.submittedAt ? formatDate(logbook.submittedAt) : "—"}
          </Text>
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">
          {logbook.logbookName}
        </h3>
        <Text type="secondary">{logbook.cropName}</Text>
      </div>

      {/* ── Card Content ── */}
      <div className="p-5 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <Text type="secondary">Vùng trồng</Text>
          <div className="mt-1 font-semibold">
            <EnvironmentOutlined className="mr-1 text-green-600" />
            {getLandPlotNamesDisplay(logbook)}
          </div>
        </div>
        <div>
          <Text type="secondary">Giám sát nông trại</Text>
          <div className="mt-1 font-semibold">
            <UserOutlined className="mr-1 text-green-600" />
            {logbook.supervisorName || "Chưa phân công"}
          </div>
        </div>
        <div className="sm:col-span-2">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            size="small"
            onClick={handleButtonClick}
            className="w-full h-9 font-semibold bg-green-600 rounded-lg"
          >
            Xem & Duyệt nhật ký
          </Button>
        </div>
      </div>
    </Card>
  )
}

export default ClosingReviewCard
