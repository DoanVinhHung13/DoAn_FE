/**
 * Farm Manager: Review chốt sổ + Duyệt/Từ chối
 * Route: /farm-manager/logbooks/:id/review
 *
 * API:
 *   GET  /cultivation-logbooks/{id}
 *   GET  /cultivation-logbooks/{id}/logs
 *   POST /cultivation-logbooks/{id}/approve-completion
 *   POST /cultivation-logbooks/{id}/reject-completion
 */
import {
  ArrowLeftOutlined,
  BookOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EnvironmentOutlined,
  UserOutlined,
} from "@ant-design/icons"
import {
  Alert,
  Button,
  Card,
  Descriptions,
  Empty,
  Image,
  Input,
  Modal,
  Spin,
  Tag,
  Timeline,
  Typography,
  message,
} from "antd"
import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

import TitleCustom from "src/components/TitleCustom"
import { useCultivationStatus } from "src/hooks/useCultivationStatus"
import ROUTER from "src/router/ROUTER"
import CultivationLogbookService from "src/services/CultivationLogbookService"
import CultivationLogService from "src/services/CultivationLogService"
import AuditLogService from "src/services/AuditLogService"
import { canApproveClosing } from "src/utils/cultivationStatus"
import { formatDate } from "src/utils/dateFormatters"
import { getLandPlotNamesDisplay } from "src/utils/helpers"

const { Text, Paragraph } = Typography

const unwrap = res => res?.data?.data ?? res?.data ?? res

/** Một log entry — hiển thị phẳng: ngày → mô tả → materialsText → ảnh */
const LogEntry = ({ log }) => {
  const workStartDate = log.workStartDate || log.startDate
  const workEndDate = log.workEndDate || log.endDate
  const description =
    log.description || log.descriptionSummary || log.supervisorDescription
  const materialsText = log.materialsText

  const rawImages = log.images || log.attachmentImages || []
  const images = rawImages
    .map(img => {
      if (typeof img === "string") return img
      return (
        img.url || img.imageUrl || img.path || img.src || img.fileUrl || null
      )
    })
    .filter(Boolean)

  return (
    <div className="flex gap-3">
      {/* ── Đường kẻ dọc + chấm tròn ── */}
      <div className="flex flex-col items-center shrink-0 w-6">
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white shadow-sm mt-2 z-10" />
        <div className="w-0.5 flex-1 bg-emerald-300 mt-1" />
      </div>

      {/* ── Nội dung log ── */}
      <div className="flex-1 py-2 pb-4 transition-colors">
        {(workStartDate || workEndDate) && (
          <div className="mb-1 text-sm font-semibold text-gray-800">
            {workStartDate && `  ${formatDate(workStartDate)}`}
            {workEndDate && ` -  ${formatDate(workEndDate)}`}
          </div>
        )}

        {/* 2. Mô tả */}
        {description && (
          <Paragraph className="!mb-1 !mt-0 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
            {description}
          </Paragraph>
        )}

        {/* 3. Materials text */}
        {materialsText && (
          <Paragraph className="!mb-1 !mt-0 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
            {materialsText}
          </Paragraph>
        )}

        {/* 4. Ảnh minh chứng */}
        {images.length > 0 && (
          <div className="mt-2">
            <Image.PreviewGroup items={images}>
              <div className="flex flex-wrap gap-2">
                {images.map((src, i) => (
                  <div
                    key={i}
                    className="h-16 w-16 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden cursor-pointer hover:border-emerald-400 hover:shadow-md transition-all [&_.ant-image]:!h-full [&_.ant-image]:!w-full [&_.ant-image-img]:!h-full [&_.ant-image-img]:!w-full [&_.ant-image-img]:!object-cover"
                  >
                    <Image src={src} preview={{ src }} />
                  </div>
                ))}
              </div>
            </Image.PreviewGroup>
          </div>
        )}
      </div>
    </div>
  )
}

const LogbookReview = () => {
  const { getLogbookStatus, getReviewStatus } = useCultivationStatus()
  const { id } = useParams()
  const navigate = useNavigate()
  const [logbook, setLogbook] = useState(null)
  const [logs, setLogs] = useState([])
  const [auditLogs, setAuditLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [rejectModal, setRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [rejecting, setRejecting] = useState(false)
  const [approving, setApproving] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const [detailRes, logsRes, auditRes] = await Promise.all([
        CultivationLogbookService.getById(id),
        CultivationLogService.getLogbookLogs(id),
        AuditLogService.getAll({ PageIndex: 1, PageSize: 50, SearchKeyword: id }),
      ])
      setLogbook(unwrap(detailRes))
      const logsData = unwrap(logsRes)
      setLogs(Array.isArray(logsData) ? logsData : logsData?.items || [])
      const auditData = unwrap(auditRes)
      setAuditLogs(Array.isArray(auditData) ? auditData : auditData?.items || [])
    } catch (error) {
      console.error(error)
      message.error(error.message || "Không thể tải nhật ký.")
      setLogbook(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [id])

  const handleApprove = async () => {
    try {
      setApproving(true)
      await CultivationLogbookService.approveCompletion(id)
      message.success("Đã duyệt chốt sổ.")
      await loadData()
    } catch (error) {
      console.error(error)
      message.error(error.message || "Duyệt nhật ký thất bại.")
    } finally {
      setApproving(false)
    }
  }

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      message.warning("Vui lòng nhập lý do từ chối.")
      return
    }
    try {
      setRejecting(true)
      await CultivationLogbookService.rejectCompletion(id, {
        reason: rejectReason.trim(),
      })
      message.success("Đã từ chối yêu cầu chốt sổ.")
      navigate(ROUTER.FM_LOGBOOKS)
    } catch (error) {
      console.error(error)
      message.error(error.message || "Từ chối nhật ký thất bại.")
    } finally {
      setRejecting(false)
      setRejectModal(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Spin size="large" tip="Đang tải nhật ký..." />
      </div>
    )
  }

  if (!logbook) {
    return (
      <div className="py-16 text-center">
        <Empty description="Không tìm thấy nhật ký." />
        <Button onClick={() => navigate(ROUTER.FM_LOGBOOKS)} className="mt-4">
          Quay lại
        </Button>
      </div>
    )
  }

  const statusCfg = getLogbookStatus(logbook.status)
  const reviewCfg = logbook.reviewStatus
    ? getReviewStatus(logbook.reviewStatus)
    : null
  const showApprove = canApproveClosing(logbook)

  return (
    <div className="space-y-6 duration-500 animate-in fade-in slide-in-from-bottom-4">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(ROUTER.FM_LOGBOOKS)}
            className="mb-3 -ml-2 text-gray-600 h-9 hover:text-green-700"
          >
            Quay lại danh sách
          </Button>
          <TitleCustom className="!mb-1">{logbook.logbookName}</TitleCustom>
          <div className="flex flex-wrap gap-2">
            <Tag color={statusCfg.color} className="rounded-full">
              {statusCfg.label}
            </Tag>
            {reviewCfg && (
              <Tag color={reviewCfg.color} className="rounded-full">
                Duyệt: {reviewCfg.label}
              </Tag>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {showApprove && (
            <>
              <Button
                type="default"
                icon={<CloseCircleOutlined />}
                onClick={() => setRejectModal(true)}
                className="h-10 px-6 font-semibold rounded-xl"
              >
                Từ chối
              </Button>
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={handleApprove}
                loading={approving}
                className="h-10 px-6 font-semibold bg-green-600 rounded-xl"
              >
                Duyệt
              </Button>
            </>
          )}
        </div>
      </div>

      {/* ── Thông tin Logbook ── */}
      <Card bordered={false} className="shadow-sm rounded-2xl">
        <Descriptions column={{ xs: 1, sm: 2, lg: 3 }} size="small">
          <Descriptions.Item
            label={
              <>
                <EnvironmentOutlined className="mr-1" />
                Vùng trồng
              </>
            }
          >
            {getLandPlotNamesDisplay(logbook)}
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <>
                <BookOutlined className="mr-1" />
                Cây trồng
              </>
            }
          >
            {logbook.cropName}
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <>
                <UserOutlined className="mr-1" />
                Giám sát viên
              </>
            }
          >
            {logbook.supervisorName}
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <>
                <CalendarOutlined className="mr-1" />
                Trạng thái
              </>
            }
          >
            {statusCfg.label}
          </Descriptions.Item>
          {reviewCfg && (
            <Descriptions.Item label="Trạng thái duyệt">
              {reviewCfg.label}
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      {/* ── Nhật ký chính thức — hiển thị phẳng full ── */}
      <Card
        bordered={false}
        className="shadow-sm rounded-2xl"
        title={
          <span className="flex items-center gap-2">
            <BookOutlined className="text-green-600" />
            Nhật ký chính thức
            <Tag color="green" className="ml-1 font-semibold rounded-full">
              {logs.length} mục
            </Tag>
          </span>
        }
      >
        {logs.length === 0 ? (
          <Empty description="Chưa có nhật ký" />
        ) : (
          <div className="space-y-1">
            {logs.map((log, idx) => (
              <LogEntry key={log.id || idx} log={log} />
            ))}
          </div>
        )}
      </Card>

      {/* ── Lịch sử chỉnh sửa (Audit) ── */}
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
          <Empty description="Chưa có lịch sử chỉnh sửa" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          <Timeline
            items={auditLogs.map(item => ({
              children: (
                <div className="text-sm">
                  <div className="font-semibold text-gray-800">
                    {item.action || item.eventType}
                  </div>
                  <div className="text-gray-500 text-xs">
                    {item.createdAt ? formatDate(item.createdAt) : ''}{" "}
                    {item.actorName ? `— ${item.actorName}` : ''}
                  </div>
                  {item.message && (
                    <div className="text-gray-600 mt-0.5">{item.message}</div>
                  )}
                </div>
              ),
            }))}
          />
        )}
      </Card>

      {/* ── Modal Từ chối ── */}
      <Modal
        open={rejectModal}
        onCancel={() => setRejectModal(false)}
        title={
          <div className="flex items-center gap-2 text-red-600">
            <CloseCircleOutlined />
            Từ chối chốt sổ
          </div>
        }
        onOk={handleReject}
        okText="Xác nhận từ chối"
        cancelText="Hủy"
        confirmLoading={rejecting}
        okButtonProps={{ danger: true }}
      >
        <Alert
          className="mb-3 rounded-xl"
          type="warning"
          showIcon
          message="Supervisor sẽ nhận lý do và chỉnh sửa lại."
        />
        <Input.TextArea
          rows={4}
          value={rejectReason}
          onChange={e => setRejectReason(e.target.value)}
          placeholder="Lý do từ chối..."
        />
      </Modal>
    </div>
  )
}

export default LogbookReview

