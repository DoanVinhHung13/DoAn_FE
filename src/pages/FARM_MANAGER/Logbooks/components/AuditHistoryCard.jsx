import { CalendarOutlined } from "@ant-design/icons"
import { Card, Empty, Tag, Timeline } from "antd"
import { formatDate } from "src/utils/dateFormatters"
import { getAuditAction, getAuditActionLabel } from "./reviewHelpers"

const AuditHistoryCard = ({ auditLogs = [] }) => {
  return (
    <Card
      bordered={false}
      className="shadow-sm rounded-2xl"
      title={
        <span className="flex items-center gap-2">
          <CalendarOutlined className="text-orange-500" />
          Lịch sử chỉnh sửa
          {auditLogs.length > 0 && (
            <Tag color="orange" className="ml-1 font-semibold rounded-full">
              {auditLogs.length}
            </Tag>
          )}
        </span>
      }
    >
      {auditLogs.length === 0 ? (
        <Empty
          description="Chưa có lịch sử chỉnh sửa"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <Timeline
          items={auditLogs.map((item, index) => {
            const createdAt = item.createdAt || item.CreatedAt
            const actorName = item.actorName || item.ActorName
            const message = item.message || item.Message
            const key = item.id || item.Id || `${getAuditAction(item)}-${index}`

            return {
              key,
              children: (
                <div className="text-sm">
                  <div className="font-semibold text-gray-800">
                    {getAuditActionLabel(item)}
                  </div>
                  <div className="text-gray-500 text-xs">
                    {createdAt && formatDate(createdAt)}{" "}
                    {actorName && `— ${actorName}`}
                  </div>
                  {message && (
                    <div className="text-gray-600 mt-0.5">{message}</div>
                  )}
                </div>
              ),
            }
          })}
        />
      )}
    </Card>
  )
}

export default AuditHistoryCard
