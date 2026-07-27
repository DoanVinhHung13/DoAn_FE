import {
  HistoryOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { Card, Empty, Timeline, Tag, Spin } from 'antd'
import { useEffect, useState } from 'react'
import { formatDateTime } from 'src/utils/dateFormatters'
import SectionTitle from 'src/components/Common/SectionTitle'

const ReviewHistoryTab = ({ item }) => {
  const [reviewHistory, setReviewHistory] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Parse lịch sử từ item data
    const parseReviewHistory = () => {
      const history = []

      // 1. Tạo kế hoạch
      if (item.createdAt) {
        history.push({
          action: 'CREATED',
          actor: 'Farm Manager',
          actorName: item.createdByName || item.managerName || 'Farm Manager',
          timestamp: item.createdAt,
          description: 'Tạo kế hoạch sản xuất và phân công cho Supervisor',
        })
      }

      // 2. Gửi duyệt
      if (item.submittedAt) {
        history.push({
          action: 'SUBMITTED_FOR_REVIEW',
          actor: 'Farm Supervisor',
          actorName: item.submittedByName || item.supervisorName || 'Farm Supervisor',
          timestamp: item.submittedAt,
          description: 'Gửi yêu cầu phê duyệt nhật ký',
        })
      }

      // 3. Chỉnh sửa (nếu có history field)
      if (item.editHistory && Array.isArray(item.editHistory)) {
        item.editHistory.forEach(edit => {
          history.push({
            action: 'EDITED',
            actor: edit.role || 'Farm Supervisor',
            actorName: edit.editorName || edit.userName || 'Farm Supervisor',
            timestamp: edit.editedAt || edit.timestamp,
            description: edit.description || `Biên tập mô tả của công việc "${edit.taskName || 'công việc'}"`,
            changes: edit.changes ? {
              before: edit.changes.before || edit.changes.oldValue,
              after: edit.changes.after || edit.changes.newValue,
            } : null,
          })
        })
      }

      // 4. Phê duyệt hoặc Từ chối
      if (item.reviewedAt) {
        history.push({
          action: item.reviewStatus === 'APPROVED' ? 'APPROVED' : item.reviewStatus === 'REJECTED' ? 'REJECTED' : 'REVIEWED',
          actor: 'Farm Manager',
          actorName: item.reviewedByName || item.reviewerName || 'Farm Manager',
          timestamp: item.reviewedAt,
          description: item.reviewStatus === 'APPROVED' 
            ? 'Phê duyệt nhật ký và cho phép tạo mã QR truy xuất nguồn gốc'
            : item.reviewStatus === 'REJECTED'
            ? 'Từ chối nhật ký và yêu cầu chỉnh sửa lại'
            : 'Xét duyệt nhật ký',
          reason: item.rejectionReason,
        })
      }

      // Sort by timestamp
      history.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      
      setReviewHistory(history)
    }

    parseReviewHistory()
  }, [item])

  const getTimelineColor = (action) => {
    switch (action) {
      case 'APPROVED':
        return 'green'
      case 'REJECTED':
        return 'red'
      case 'SUBMITTED_FOR_REVIEW':
        return 'blue'
      case 'EDITED':
        return 'orange'
      default:
        return 'gray'
    }
  }

  const getTimelineIcon = (action) => {
    switch (action) {
      case 'APPROVED':
        return <CheckCircleOutlined />
      case 'REJECTED':
        return <CloseCircleOutlined />
      case 'EDITED':
        return <EditOutlined />
      default:
        return <UserOutlined />
    }
  }

  const getActionLabel = (action) => {
    const labels = {
      CREATED: 'Tạo kế hoạch',
      SUBMITTED_FOR_REVIEW: 'Gửi duyệt',
      EDITED: 'Chỉnh sửa',
      APPROVED: 'Phê duyệt',
      REJECTED: 'Từ chối',
      REVIEWED: 'Xét duyệt',
    }
    return labels[action] || action
  }

  return (
    <div className="space-y-6">
      <Card bordered={false} className="shadow-sm rounded-2xl">
        <SectionTitle>Lịch sử xét duyệt và chỉnh sửa</SectionTitle>

        {reviewHistory.length > 0 ? (
          <Timeline
            mode="left"
            items={reviewHistory.map((history) => ({
              color: getTimelineColor(history.action),
              dot: getTimelineIcon(history.action),
              children: (
                <div className="pb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Tag color={getTimelineColor(history.action)} className="font-semibold">
                      {getActionLabel(history.action)}
                    </Tag>
                    <span className="text-sm font-medium text-gray-800">
                      {history.actorName}
                    </span>
                    <span className="text-xs text-gray-400">
                      ({history.actor})
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">
                    {formatDateTime(history.timestamp)}
                  </p>
                  <p className="text-sm text-gray-700 mb-0">
                    {history.description}
                  </p>

                  {/* Hiển thị chi tiết thay đổi nếu có */}
                  {history.changes && (
                    <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <p className="text-xs font-semibold text-gray-600 mb-2">
                        Chi tiết thay đổi:
                      </p>
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-red-600 font-semibold mb-1">
                            ❌ Trước:
                          </p>
                          <p className="text-sm text-gray-600 bg-red-50 p-2 rounded border border-red-100">
                            {history.changes.before}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-green-600 font-semibold mb-1">
                            ✅ Sau:
                          </p>
                          <p className="text-sm text-gray-600 bg-green-50 p-2 rounded border border-green-100">
                            {history.changes.after}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Lý do từ chối nếu có */}
                  {history.action === 'REJECTED' && history.reason && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-xs font-semibold text-red-700 mb-1">
                        Lý do từ chối:
                      </p>
                      <p className="text-sm text-red-800 mb-0">
                        {history.reason}
                      </p>
                    </div>
                  )}
                </div>
              ),
            }))}
          />
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Chưa có lịch sử xét duyệt"
          />
        )}
      </Card>

      {/* Thông tin xét duyệt hiện tại */}
      <Card bordered={false} className="shadow-sm rounded-2xl">
        <SectionTitle>Trạng thái xét duyệt hiện tại</SectionTitle>
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 pb-4 border-b border-gray-100">
            <span className="text-sm text-gray-500">Trạng thái</span>
            <Tag
              color={item.reviewStatus === 'APPROVED' ? 'green' : item.reviewStatus === 'REJECTED' ? 'red' : 'gold'}
              className="px-3 py-1 font-semibold"
            >
              {item.reviewStatus === 'APPROVED' ? 'Đã duyệt' : item.reviewStatus === 'REJECTED' ? 'Bị từ chối' : 'Chờ duyệt'}
            </Tag>
          </div>
          
          {[
            {
              label: 'Gửi duyệt',
              value: item.submittedAt ? formatDateTime(item.submittedAt) : 'Chưa gửi duyệt',
            },
            {
              label: 'Xét duyệt',
              value: item.reviewedAt ? formatDateTime(item.reviewedAt) : 'Chưa xét duyệt',
            },
            {
              label: 'Người xét duyệt',
              value: item.reviewedByName || item.reviewerName || 'Chưa chỉ định',
            },
          ].map((field) => (
            <div key={field.label}>
              <p className="mb-1 text-xs font-semibold tracking-wide text-gray-400 uppercase">
                {field.label}
              </p>
              <p className="m-0 text-sm font-medium text-gray-700 break-words">
                {field.value}
              </p>
            </div>
          ))}

          {item.rejectionReason && (
            <div className="p-3 text-sm text-red-700 border border-red-100 rounded-xl bg-red-50">
              <p className="mb-1 font-semibold">Lý do từ chối</p>
              <p className="m-0">{item.rejectionReason}</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

export default ReviewHistoryTab
