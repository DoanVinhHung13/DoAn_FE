/**
 * Farm Manager: Review chốt sổ + Duyệt/Từ chối
 * Route: /farm-manager/cultivation-logbooks/:id/review
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
  ExperimentOutlined,
  FileImageOutlined,
  UserOutlined,
} from "@ant-design/icons"
import {
  Alert,
  Button,
  Card,
  Descriptions,
  Empty,
  Form,
  Image,
  Input,
  InputNumber,
  Modal,
  Spin,
  Tag,
  Timeline,
  Typography,
  message,
} from "antd"
import { useCallback, useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

import TitleCustom from "src/components/TitleCustom"
import { useCultivationStatus } from "src/hooks/useCultivationStatus"
import ROUTER from "src/router/ROUTER"
import CultivationLogbookService from "src/services/CultivationLogbookService"
import CultivationLogService from "src/services/CultivationLogService"
import CultivationStageService from "src/services/CultivationStageService"
import AuditLogService from "src/services/AuditLogService"
import { getQuantityUnit, MEASUREMENT_UNITS } from "src/constants/measurementUnits"
import { canApproveClosing } from "src/utils/cultivationStatus"
import { formatDate } from "src/utils/dateFormatters"
import { getLandPlotNamesDisplay } from "src/utils/helpers"
import { getUserDisplayName } from "src/utils/userDisplayName"
import { getOrderedStageLogs } from "src/utils/cultivationOrdering"

const { Paragraph } = Typography

const unwrap = res => res?.data?.data ?? res?.data ?? res

const asList = value => (Array.isArray(value) ? value : [])

const extractList = response => {
  const data = unwrap(response)
  if (Array.isArray(data)) return data
  return asList(data?.items || data?.data)
}

const AUDIT_ACTION_LABELS = {
  CULTIVATION_LOGBOOK_SUBMIT_COMPLETION: "Gửi yêu cầu duyệt hoàn tất",
  CULTIVATION_LOGBOOK_APPROVE_COMPLETION: "Duyệt hoàn tất nhật ký",
  CULTIVATION_LOGBOOK_REJECT_COMPLETION: "Từ chối hoàn tất nhật ký",
  CULTIVATION_LOGBOOK_CREATE: "Tạo nhật ký canh tác",
  CULTIVATION_LOGBOOK_UPDATE: "Cập nhật nhật ký canh tác",
  PRODUCTION_LOG_DESCRIPTION_EDIT: "Chỉnh sửa mô tả nhật ký",
  CULTIVATION_STAGE_COMPLETED: "Hoàn tất giai đoạn canh tác",
  CREATE: "Tạo mới",
  UPDATE: "Cập nhật",
  DELETE: "Xóa",
  APPROVE: "Duyệt",
  REJECT: "Từ chối",
  COMPLETE: "Hoàn tất",
  ASSIGN: "Phân công",
  GENERATE: "Tạo mã",
  DISABLE: "Vô hiệu hóa",
  CANCEL: "Hủy",
  IMPORT: "Nhập dữ liệu",
  EXPORT: "Xuất dữ liệu",
  ADJUST: "Điều chỉnh",
}

const getAuditAction = item =>
  String(
    item?.action ??
      item?.Action ??
      item?.eventType ??
      item?.EventType ??
      "",
  )
    .trim()
    .toUpperCase()

const getAuditEntityId = item =>
  item?.entityId ?? item?.EntityId ?? item?.entityID ?? item?.EntityID ?? null

const getAuditTimestamp = item => {
  const value = item?.createdAt ?? item?.CreatedAt
  const timestamp = value ? new Date(value).getTime() : NaN
  return Number.isFinite(timestamp) ? timestamp : null
}

const getAuditActionLabel = item => {
  const action = getAuditAction(item)
  if (AUDIT_ACTION_LABELS[action]) return AUDIT_ACTION_LABELS[action]
  if (action.endsWith("_SUBMIT_COMPLETION")) return "Gửi yêu cầu duyệt hoàn tất"
  if (action.endsWith("_APPROVE_COMPLETION")) return "Duyệt hoàn tất nhật ký"
  if (action.endsWith("_REJECT_COMPLETION")) return "Từ chối hoàn tất nhật ký"

  return action
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

const getExpectedGenericAction = action => {
  if (action.endsWith("_APPROVE_COMPLETION")) return "APPROVE"
  if (action.endsWith("_REJECT_COMPLETION")) return "REJECT"
  if (action.endsWith("_SUBMIT_COMPLETION")) return "CREATE"
  return null
}

const isDuplicateAuditPair = (genericItem, detailedItem) => {
  const genericAction = getAuditAction(genericItem)
  const detailedAction = getAuditAction(detailedItem)
  if (getExpectedGenericAction(detailedAction) !== genericAction) return false

  const genericEntityId = getAuditEntityId(genericItem)
  const detailedEntityId = getAuditEntityId(detailedItem)
  if (genericEntityId && detailedEntityId && genericEntityId !== detailedEntityId) {
    return false
  }

  const genericTime = getAuditTimestamp(genericItem)
  const detailedTime = getAuditTimestamp(detailedItem)
  if (genericTime === null || detailedTime === null) return true

  return Math.abs(genericTime - detailedTime) <= 30 * 1000
}

const normalizeAuditLogs = logs => {
  const duplicateIndexes = new Set()

  logs.forEach((item, index) => {
    const action = getAuditAction(item)
    if (!action.endsWith("_COMPLETION")) return

    logs.forEach((candidate, candidateIndex) => {
      if (candidateIndex === index || duplicateIndexes.has(candidateIndex)) return
      if (isDuplicateAuditPair(candidate, item)) duplicateIndexes.add(candidateIndex)
    })
  })

  return logs.filter((_, index) => !duplicateIndexes.has(index))
}

/** Display one official log with the same fields as the cultivation-logbook view. */
const LogEntry = ({ log }) => {
  const summary = log.summary || log.officialLog || {}
  const taskName =
    log.cultivationTaskName ||
    log.taskName ||
    log.name ||
    log.title ||
    summary.taskName ||
    summary.name
  const description =
    summary.supervisorDescription ||
    log.supervisorDescription ||
    summary.descriptionSummary ||
    log.descriptionSummary ||
    summary.description ||
    log.description ||
    log.summaryDescription ||
    log.finalDescription
  const materialsText = summary.materialsText || log.materialsText
  const workStartDate =
    log.workStartDate || summary.workStartDate || log.startDate
  const workEndDate = log.workEndDate || summary.workEndDate || log.endDate
  const editorCandidates = [
    summary.editedBy,
    summary.editedByName,
    summary.editorName,
    summary.updatedBy,
    log.editedByName,
    log.editedBy,
    log.updatedByName,
    log.updatedBy,
    log.supervisorEditorName,
    summary.supervisorName,
    summary.performedByName,
    summary.performedBy,
    log.performedByName,
    log.performedBy,
  ]
  const editedBy = editorCandidates.some(Boolean)
    ? getUserDisplayName(...editorCandidates)
    : ""
  const editedAt = summary.editedAt || log.editedAt || log.updatedAt
  const totalFertilizers = asList(
    summary.totalFertilizers ||
      summary.fertilizers ||
      log.totalFertilizers ||
      log.fertilizers,
  )
  const totalPesticides = asList(
    summary.totalPesticides ||
      summary.pesticides ||
      log.totalPesticides ||
      log.pesticides,
  )
  const summaryImages = asList(summary.images)
  const rawImages = summaryImages.length
    ? summaryImages
    : asList(log.images || log.attachmentImages)
  const images = rawImages
    .map(img => {
      if (typeof img === "string") return img
      return (
        img.url ||
        img.imageUrl ||
        img.filePath ||
        img.path ||
        img.src ||
        img.fileUrl ||
        null
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
        {taskName && (
          <div className="mb-1 text-sm font-bold text-gray-800">{taskName}</div>
        )}

        {(workStartDate || workEndDate) && (
          <div className="mb-2 text-sm font-semibold text-gray-800">
            {workStartDate && formatDate(workStartDate)}
            {workEndDate && ` - ${formatDate(workEndDate)}`}
          </div>
        )}

        {(editedBy || editedAt) && (
          <div className="mb-2 text-xs text-gray-500">
            Cập nhật bởi {editedBy}
            {editedAt ? ` · ${formatDate(editedAt)}` : ""}
          </div>
        )}

        {description && (
          <Paragraph className="!mb-1 !mt-0 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
            {description}
          </Paragraph>
        )}

        {materialsText && (
          <Paragraph className="!mb-1 !mt-0 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
            {materialsText}
          </Paragraph>
        )}

        {(totalFertilizers.length > 0 || totalPesticides.length > 0) && (
          <div className="p-3 my-2 bg-gray-50 border border-gray-200 rounded-lg">
            {totalFertilizers.length > 0 && (
              <div className="mb-2">
                <p className="mb-1 text-xs font-medium text-gray-500">
                  <ExperimentOutlined className="mr-1 text-green-600" />
                  Phân bón:
                </p>
                <div className="space-y-1">
                  {totalFertilizers.map((fert, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs text-gray-700">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full shrink-0" />
                      <span className="font-medium">
                        {fert.name || fert.fertilizerName || fert.materialName}
                      </span>
                      <span className="text-gray-400">-</span>
                      <span className="font-medium text-green-700">
                        {fert.quantity || fert.totalQuantity} {fert.unit || fert.quantityUnit || "kg"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {totalPesticides.length > 0 && (
              <div>
                <p className="mb-1 text-xs font-medium text-gray-500">
                  <ExperimentOutlined className="mr-1 text-orange-600" />
                  Nông dược:
                </p>
                <div className="space-y-1">
                  {totalPesticides.map((pest, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs text-gray-700">
                      <span className="w-1.5 h-1.5 bg-orange-500 rounded-full shrink-0" />
                      <span className="font-medium">
                        {pest.name || pest.pesticideName || pest.materialName}
                      </span>
                      <span className="text-gray-400">-</span>
                      <span className="font-medium text-orange-700">
                        {pest.quantity || pest.totalQuantity} {pest.unit || pest.quantityUnit || "lít"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {images.length > 0 && (
          <div className="mt-2">
            <p className="mb-1.5 text-xs font-semibold text-gray-500">
              <FileImageOutlined className="mr-1" />
              Ảnh minh chứng ({images.length})
            </p>
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

const getLogDate = (log, type) => {
  const summary = log?.summary || log?.officialLog || {}
  const dateKey = type === "start" ? "workStartDate" : "workEndDate"
  const fallbackKey = type === "start" ? "startDate" : "endDate"
  return log?.[dateKey] || summary?.[dateKey] || log?.[fallbackKey] || summary?.[fallbackKey]
}

const StageSectionHeader = ({ stage, index, stageLogs }) => {
  if (!stage) return null

  const firstLog = stageLogs[0]
  const lastLog = stageLogs[stageLogs.length - 1]
  const stageName = stage.stageName || stage.name || stage.title || `Giai đoạn ${index + 1}`
  const plannedStart = stage.startDate || stage.plannedStartDate
  const plannedEnd = stage.endDate || stage.plannedEndDate
  const actualStart = stage.actualStartDate || getLogDate(firstLog, "start")
  const actualEnd = stage.actualEndDate || getLogDate(lastLog, "end")

  return (
    <div className="flex items-start gap-3 pb-3 border-b border-green-100">
      <div className="flex items-center justify-center w-8 h-8 font-bold text-white bg-green-600 rounded-full shrink-0">
        {index + 1}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="mb-1 text-base font-bold text-gray-800">{stageName}</h3>
        <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs">
          <span className="text-gray-500">
            Kế hoạch: {plannedStart ? formatDate(plannedStart) : "Chưa xác định"} - {plannedEnd ? formatDate(plannedEnd) : "Chưa xác định"}
          </span>
          <span className="font-medium text-green-600">
            Thực tế: {actualStart ? formatDate(actualStart) : "Chưa bắt đầu"} - {actualEnd ? formatDate(actualEnd) : actualStart ? "Đang thực hiện" : "Chưa xác định"}
          </span>
        </div>
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
  const [stageGroups, setStageGroups] = useState([])
  const [auditLogs, setAuditLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [rejectModal, setRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [rejecting, setRejecting] = useState(false)
  const [approving, setApproving] = useState(false)
  const [approveModal, setApproveModal] = useState(false)
  const [approveForm] = Form.useForm()

  const harvestUnit = getQuantityUnit(
    logbook?.product?.unit || logbook?.productUnit || logbook?.unit,
    MEASUREMENT_UNITS.KILOGRAM,
  )

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [detailRes, logsRes, auditRes, stagesRes] = await Promise.all([
        CultivationLogbookService.getById(id),
        CultivationLogService.getLogbookLogs(id),
        AuditLogService.getAll({ PageIndex: 1, PageSize: 50, SearchKeyword: id }),
        CultivationStageService.getByLogbookId(id).catch(() => null),
      ])

      const logbookData = unwrap(detailRes)
      const fallbackLogs = extractList(logsRes)
      const stages = asList(logbookData?.cultivationStages).length
        ? asList(logbookData.cultivationStages)
        : extractList(stagesRes)

      const fetchedStageGroups = await Promise.all(
        stages.map(async stage => {
          const stageId = stage.id || stage.stageId
          if (!stageId) return { stage, logs: [] }

          try {
            const stageLogsRes = await CultivationStageService.getStageLogs(stageId, {
              cultivationLogbookId: id,
            })
            return {
              stage,
              logs: getOrderedStageLogs(
                extractList(stageLogsRes),
                stage.tasks || stage.cultivationTasks || [],
              ),
            }
          } catch {
            return { stage, logs: [] }
          }
        }),
      )
      const hasStageLogs = fetchedStageGroups.some(group => group.logs.length > 0)
      const fallbackStageGroups = stages.length
        ? stages.map((stage, index) => ({
            stage,
            logs:
              index === 0
                ? getOrderedStageLogs(
                    fallbackLogs,
                    stage.tasks || stage.cultivationTasks || [],
                  )
                : [],
          }))
        : fallbackLogs.length
          ? [{ stage: null, logs: fallbackLogs }]
          : []
      const displayStageGroups =
        fetchedStageGroups.length && hasStageLogs
          ? fetchedStageGroups
          : fallbackStageGroups

      setLogbook(logbookData)
      setStageGroups(displayStageGroups)
      setLogs(displayStageGroups.flatMap(group => group.logs))
      setAuditLogs(normalizeAuditLogs(extractList(auditRes)))
    } catch {
      setLogbook(null)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleApprove = async () => {
    try {
      const values = await approveForm.validateFields()
      setApproving(true)
      await CultivationLogbookService.approveCompletion(id, {
        quantity: values.quantity,
        unit: harvestUnit,
      })
      setApproveModal(false)
      approveForm.resetFields()
      await loadData()
    } catch (error) {
      if (error?.errorFields) return // form validation
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
      navigate(ROUTER.FM_LOGBOOKS)
    } catch {
      // Rejection failure is already handled by the shared interceptor.
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
                onClick={() => setApproveModal(true)}
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

      {/* ── Nhật ký chính thức — stages and logs in one vertical flow ── */}
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
        {stageGroups.length === 0 ? (
          <Empty description="Chưa có nhật ký" />
        ) : (
          <div className="space-y-6">
            {stageGroups.map((group, stageIndex) => (
              <section key={group.stage?.id || stageIndex}>
                <StageSectionHeader
                  stage={group.stage}
                  index={stageIndex}
                  stageLogs={group.logs}
                />
                {group.logs.length > 0 ? (
                  <div className={group.stage ? "mt-3" : ""}>
                    {group.logs.map((log, logIndex) => (
                      <LogEntry key={log.id || logIndex} log={log} />
                    ))}
                  </div>
                ) : (
                  <div className="py-3 pl-11 text-sm text-gray-500">
                    Chưa có nhật ký chính thức cho giai đoạn này
                  </div>
                )}
              </section>
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
            items={auditLogs.map((item, index) => ({
              key: item.id || item.Id || `${getAuditAction(item)}-${index}`,
              children: (
                <div className="text-sm">
                  <div className="font-semibold text-gray-800">
                    {getAuditActionLabel(item)}
                  </div>
                  <div className="text-gray-500 text-xs">
                    {item.createdAt || item.CreatedAt
                      ? formatDate(item.createdAt || item.CreatedAt)
                      : ""}{" "}
                    {item.actorName || item.ActorName
                      ? `— ${item.actorName || item.ActorName}`
                      : ""}
                  </div>
                  {(item.message || item.Message) && (
                    <div className="text-gray-600 mt-0.5">
                      {item.message || item.Message}
                    </div>
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

      {/* ── Modal Duyệt — nhập sản lượng thu hoạch ── */}
      <Modal
        open={approveModal}
        onCancel={() => { setApproveModal(false); approveForm.resetFields() }}
        title={
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircleOutlined /> Xác nhận duyệt chốt sổ
          </div>
        }
        footer={[
          <Button
            key="cancel"
            onClick={() => { setApproveModal(false); approveForm.resetFields() }}
            disabled={approving}
          >
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={approving}
            onClick={handleApprove}
            className="bg-green-600 border-green-600 hover:bg-green-700"
          >
            Xác nhận duyệt
          </Button>,
        ]}
      >
        <Alert
          className="mb-4 rounded-xl"
          type="info"
          showIcon
          message="Vui lòng nhập thông tin sản lượng thu hoạch để hoàn tất phê duyệt."
        />
        <Form form={approveForm} layout="vertical">
          <Form.Item
            name="quantity"
            label="Sản lượng thu hoạch"
            rules={[
              { required: true, message: "Vui lòng nhập sản lượng" },
              { type: "number", min: 0.0001, message: "Sản lượng phải lớn hơn 0" },
            ]}
          >
            <InputNumber
              className="w-full"
              min={0.0001}
              step={0.1}
              placeholder="Nhập sản lượng..."
            />
          </Form.Item>
          <Form.Item name="unit" hidden>
            <Input />
          </Form.Item>
          <Form.Item label="Đơn vị">
            <span className="inline-flex h-10 items-center rounded-lg bg-gray-50 px-3 font-semibold text-gray-700">
              {harvestUnit}
            </span>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default LogbookReview
