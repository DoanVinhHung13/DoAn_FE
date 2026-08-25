import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons"
import { Button, Tag } from "antd"
import TitleCustom from "src/components/TitleCustom"
import { useCultivationStatus } from "src/hooks/useCultivationStatus"

const LogbookReviewHeader = ({
  logbook,
  canApprove = false,
  approving = false,
  onBack,
  onOpenApproveModal,
  onOpenRejectModal,
}) => {
  const { getLogbookStatus, getReviewStatus } = useCultivationStatus()

  if (!logbook) return null

  const statusConfig = getLogbookStatus(logbook.status)
  const reviewConfig = logbook.reviewStatus
    ? getReviewStatus(logbook.reviewStatus)
    : null

  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={onBack}
          className="mb-3 -ml-2 text-gray-600 h-9 hover:text-green-700"
        >
          Quay lại danh sách
        </Button>
        <TitleCustom className="!mb-1">{logbook.logbookName}</TitleCustom>
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
      </div>

      {canApprove && (
        <div className="flex flex-wrap gap-2">
          <Button
            type="default"
            icon={<CloseCircleOutlined />}
            onClick={onOpenRejectModal}
            className="h-10 px-6 font-semibold rounded-xl"
          >
            Từ chối
          </Button>
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={onOpenApproveModal}
            loading={approving}
            className="h-10 px-6 font-semibold bg-green-600 rounded-xl"
          >
            Duyệt
          </Button>
        </div>
      )}
    </div>
  )
}

export default LogbookReviewHeader
