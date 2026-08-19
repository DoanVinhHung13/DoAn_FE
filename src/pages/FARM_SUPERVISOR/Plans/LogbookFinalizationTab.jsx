/**
 * Farm Supervisor — Tab Chốt Logbook
 *
 * Trái: danh sách Stage
 * Phải: Summary Leader gửi → expand xem chi tiết → viết lại mô tả → Lưu
 */
import {
  BookOutlined,
  EditOutlined,
  ExperimentOutlined,
  InboxOutlined,
  LockOutlined,
  SendOutlined,
} from "@ant-design/icons"
import {
  Alert,
  Avatar,
  Button,
  Card,
  Col,
  Collapse,
  Empty,
  Image,
  Input,
  List,
  Modal,
  Row,
  Spin,
  Tag,
  Typography,
  message,
} from "antd"
import { useEffect, useMemo, useState } from "react"
import { useCultivationStatus } from "src/hooks/useCultivationStatus"
import CultivationLogService from "src/services/CultivationLogService"
import CultivationStageService from "src/services/CultivationStageService"
import { canCompileTask } from "src/utils/cultivationStatus"
import { formatDate } from "src/utils/dateFormatters"
import {
  getOrderedStageLogs,
  getStageTaskName,
} from "src/utils/cultivationOrdering"
import { unwrap } from "./components/compileLogHelpers"
import SummaryCompilePanel from "./components/SummaryCompilePanel"

const { Text, Title } = Typography

const StageListItem = ({ stage, index, isActive, onClick, getStageStatus }) => {
  const cfg = getStageStatus(stage.status)
  return (
    <List.Item
      onClick={onClick}
      className="supervisor-stage-item px-4 py-2 mb-2 transition-colors cursor-pointer rounded-xl"
      style={{
        border: isActive ? "1px solid #22c55e" : "1px solid #e5e7eb",
        background: isActive ? "#f0fdf4" : "#fff",
      }}
    >
      <List.Item.Meta
        avatar={
          <Avatar
            size={32}
            style={{
              backgroundColor: isActive ? "#16a34a" : "#f3f4f6",
              color: isActive ? "#fff" : "#6b7280",
              fontWeight: 700,
            }}
          >
            {index + 1}
          </Avatar>
        }
        title={
          <Text
            strong
            style={{
              color: isActive ? "#15803d" : "#1f2937",
              whiteSpace: "normal",
              fontSize: 13,
            }}
          >
            {stage.stageName}
          </Text>
        }
        description={
          <Tag
            color={cfg.color}
            className="supervisor-stage-status"
            style={{ margin: 0, fontSize: 10, width: "fit-content" }}
          >
            {cfg.label}
          </Tag>
        }
      />
    </List.Item>
  )
}

const LogbookFinalizationTab = ({ stages, tasks = {}, loadData, plan }) => {
  const isPlanCompleted =
    plan?.status === "COMPLETED" || plan?.reviewStatus === "WAITING_APPROVAL"
  const isReadOnly = isPlanCompleted
  const { getStageStatus, getReviewStatus } = useCultivationStatus()
  const [selectedId, setSelectedId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [loadingStageSummary, setLoadingStageSummary] = useState(false)
  const [stageLogs, setStageLogs] = useState([])
  const [stageSummary, setStageSummary] = useState(null)
  const [activeKeys, setActiveKeys] = useState([])
  const [editModal, setEditModal] = useState({
    open: false,
    log: null,
    description: "",
  })
  const [savingEdit, setSavingEdit] = useState(false)

  const handleOpenEditLog = log => {
    setEditModal({
      open: true,
      log,
      description: log.supervisorDescription || log.description || "",
    })
  }

  const handleSaveEditLog = async () => {
    if (!editModal.log) return
    try {
      setSavingEdit(true)
      const logId = editModal.log.id
      const newDesc = editModal.description?.trim() || ""
      if (!newDesc) {
        message.error(
          "Mô tả nhật ký không được để trống hoặc chỉ chứa khoảng trắng.",
        )
        return
      }
      if (newDesc.length > 200) {
        message.error("Mô tả nhật ký không được vượt quá 200 ký tự.")
        return
      }

      if (CultivationLogService.patchDescription) {
        await CultivationLogService.patchDescription(logId, {
          description: newDesc,
        })
      } else if (CultivationLogService.update) {
        await CultivationLogService.update(logId, { description: newDesc })
      }

      setEditModal({ open: false, log: null, description: "" })

      if (selectedId) {
        const summaryRes = await CultivationStageService.getSummary(selectedId)
        const summaryData = unwrap(summaryRes)
        setStageSummary(summaryData)
        const logs =
          summaryData?.approvedLogs ||
          summaryData?.officialLogs ||
          summaryData?.logs ||
          []
        setStageLogs(Array.isArray(logs) ? logs : [])
      }
    } catch {
      // axios interceptor handles error notification
    } finally {
      setSavingEdit(false)
    }
  }

  useEffect(() => {
    if (stages.length > 0 && !selectedId) {
      const currentStage =
        stages.find(s => s.status === "ACTIVE" || s.status === "IN_PROGRESS") ||
        stages.find(s => !["COMPLETED", "CANCELLED"].includes(s.status)) ||
        stages[stages.length - 1]
      setSelectedId(currentStage?.id ?? null)
    }
  }, [stages, selectedId])

  const selectedStage = stages.find(s => s.id === selectedId)
  const selectedStageTasks = useMemo(
    () => tasks[selectedId] || [],
    [tasks, selectedId],
  )

  const orderedStageLogs = useMemo(
    () => getOrderedStageLogs(stageLogs, selectedStageTasks),
    [stageLogs, selectedStageTasks],
  )

  const pendingSummaries = useMemo(() => {
    if (isPlanCompleted) return []
    if (stageSummary) {
      const summaries =
        stageSummary.taskSummaries ||
        stageSummary.summaries ||
        stageSummary.items
      if (Array.isArray(summaries)) {
        return summaries
      }
    }
    if (!selectedId) return []
    return (tasks[selectedId] || []).filter(t => canCompileTask(t.status))
  }, [stageSummary, tasks, selectedId, isPlanCompleted])

  useEffect(() => {
    setActiveKeys([])
  }, [selectedId])

  useEffect(() => {
    if (!selectedId) return
    const loadStageData = async () => {
      setLoadingStageSummary(true)
      try {
        const summaryRes = await CultivationStageService.getSummary(selectedId)
        const summaryData = unwrap(summaryRes)
        setStageSummary(summaryData)
        const logs =
          summaryData?.approvedLogs ||
          summaryData?.officialLogs ||
          summaryData?.logs ||
          []
        setStageLogs(Array.isArray(logs) ? logs : [])
      } catch {
        setStageSummary(null)
        setStageLogs([])
      } finally {
        setLoadingStageSummary(false)
      }
    }
    loadStageData()
  }, [selectedId])

  const completeStage = async () => {
    try {
      setSubmitting(true)
      await CultivationStageService.complete(selectedId)
      await loadData?.()
    } catch {
      // axios interceptor handles error notification
    } finally {
      setSubmitting(false)
    }
  }

  const handleCompleteStage = () => {
    if (!selectedId || !selectedStage) return

    Modal.confirm({
      title: "Xác nhận hoàn thành giai đoạn",
      content: `Bạn có chắc muốn hoàn thành giai đoạn "${selectedStage.stageName}"? Sau khi hoàn thành, giai đoạn sẽ được khóa và không thể tiếp tục cập nhật công việc.`,
      okText: "Xác nhận hoàn thành",
      cancelText: "Hủy",
      onOk: completeStage,
    })
  }

  const handleSaved = async () => {
    setActiveKeys([])
    await loadData?.()
    if (selectedId) {
      try {
        const summaryRes = await CultivationStageService.getSummary(selectedId)
        const summaryData = unwrap(summaryRes)
        setStageSummary(summaryData)
        const logs =
          summaryData?.approvedLogs ||
          summaryData?.officialLogs ||
          summaryData?.logs ||
          []
        setStageLogs(Array.isArray(logs) ? logs : [])
      } catch {
        // Stage summary refresh is best-effort.
      }
    }
  }

  return (
    <Card
      bordered={false}
      className="duration-500 shadow-sm rounded-2xl animate-in fade-in slide-in-from-bottom-4"
    >
      {!isReadOnly && selectedStage?.status !== "COMPLETED" && (
        <div className="flex flex-wrap items-center justify-end gap-3 mb-4">
          <Button
            type="primary"
            icon={<SendOutlined />}
            loading={submitting}
            onClick={handleCompleteStage}
            disabled={
              !selectedId ||
              !["ACTIVE", "IN_PROGRESS"].includes(selectedStage?.status)
            }
            className="font-semibold bg-green-600 border-green-600 rounded-lg h-9 hover:!bg-green-700"
          >
            Hoàn tất giai đoạn
          </Button>
        </div>
      )}

      <Row gutter={[24, 24]} className="min-h-[520px]">
        <Col
          xs={24}
          lg={9}
          xl={7}
          className="pb-6 border-b border-gray-100 lg:border-b-0 lg:border-r lg:pr-6 lg:pb-0"
        >
          <p className="mb-3 text-xs font-semibold tracking-wide text-gray-500 uppercase">
            Giai đoạn
          </p>
          {stages.length === 0 ? (
            <Alert message="Chưa có giai đoạn nào." type="info" />
          ) : (
            <List
              dataSource={stages}
              split={false}
              renderItem={(stage, index) => (
                <StageListItem
                  key={stage.id}
                  stage={stage}
                  index={index}
                  isActive={selectedId === stage.id}
                  getStageStatus={getStageStatus}
                  onClick={() => setSelectedId(stage.id)}
                />
              )}
            />
          )}
        </Col>

        <Col xs={24} lg={15} xl={17}>
          {!selectedStage ? (
            <div className="flex flex-col items-center justify-center h-full py-20 text-gray-400">
              <BookOutlined className="mb-3 text-4xl opacity-50" />
              <p>Chọn giai đoạn để xem bản tổng hợp chờ biên soạn</p>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Title level={5} className="!mb-0">
                    {selectedStage.stageName}
                  </Title>
                </div>
              </div>

              <Card
                size="small"
                bordered
                className="shadow-sm rounded-xl border-amber-200"
                title={
                  <span className="font-semibold text-amber-900">
                    Bản tổng hợp chờ biên soạn
                  </span>
                }
              >
                {loadingStageSummary ? (
                  <div className="py-8 text-center">
                    <Spin tip="Đang tải bản tổng hợp chờ biên soạn..." />
                  </div>
                ) : pendingSummaries.length === 0 ? (
                  <Empty
                    description="Không có bản tổng hợp cần xử lý"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                ) : (
                  <Collapse
                    accordion
                    destroyOnHidden
                    activeKey={activeKeys}
                    onChange={keys => {
                      const next = Array.isArray(keys)
                        ? keys
                        : keys
                          ? [keys]
                          : []
                      setActiveKeys(next)
                    }}
                    className="bg-transparent border-0"
                    items={pendingSummaries.map((taskItem, index) => {
                      const itemKey =
                        taskItem.taskId ||
                        taskItem.id ||
                        taskItem.cultivationTaskId ||
                        String(index)
                      const taskName =
                        taskItem.taskName ||
                        taskItem.name ||
                        taskItem.workTaskName ||
                        "Bản tổng hợp"
                      return {
                        key: itemKey,
                        label: (
                          <div className="flex flex-wrap items-center w-full gap-2 pr-2">
                            <Avatar
                              size={24}
                              style={{
                                backgroundColor: "#fef3c7",
                                color: "#92400e",
                                fontSize: 12,
                                fontWeight: 700,
                              }}
                            >
                              {index + 1}
                            </Avatar>
                            <Text strong>{taskName}</Text>
                            <Tag color="gold">Chờ biên soạn</Tag>
                          </div>
                        ),
                        children: (
                          <SummaryCompilePanel
                            task={taskItem}
                            stageId={selectedId}
                            onSaved={handleSaved}
                            readOnly={isPlanCompleted}
                          />
                        ),
                      }
                    })}
                  />
                )}
              </Card>

              <Card
                size="small"
                bordered
                className="bg-white border-green-100 shadow-sm rounded-xl"
                title={
                  <span className="flex items-center justify-between w-full font-semibold text-green-800">
                    <span className="flex items-center gap-2">
                      <BookOutlined /> Nhật ký giai đoạn
                      <Tag color="green" className="ml-1 font-semibold">
                        {stageLogs.length} mục
                      </Tag>
                    </span>
                  </span>
                }
              >
                {loadingStageSummary ? (
                  <div className="py-8 text-center">
                    <Spin tip="Đang tải nhật ký giai đoạn..." />
                  </div>
                ) : stageLogs.length === 0 ? (
                  <Empty
                    description="Chưa có mục nào trong nhật ký giai đoạn"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                ) : (
                  <div className="space-y-1">
                    {orderedStageLogs.map((log, index) => {
                      const taskName =
                        getStageTaskName(log, selectedStageTasks) ||
                        `Mục ${index + 1}`
                      const description =
                        log.supervisorDescription ||
                        log.description ||
                        log.descriptionSummary ||
                        "Chưa có mô tả"
                      const materialsText = log.materialsText || ""
                      const isHarvestMaterialsText =
                        /(?:sản lượng|thu hoạch)/i.test(materialsText)
                      const materials =
                        log.materials || log.summary?.materials || []
                      const fertilizers =
                        log.fertilizers ||
                        log.totalFertilizers ||
                        log.summary?.fertilizers ||
                        materials.filter(m =>
                          (m.type || "").toLowerCase().includes("phân"),
                        )
                      const pesticides =
                        log.pesticides ||
                        log.totalPesticides ||
                        log.summary?.pesticides ||
                        materials.filter(m =>
                          (m.type || "").toLowerCase().includes("thuốc"),
                        )
                      const images = log.images || log.summary?.images || []
                      const reviewCfg = getReviewStatus(
                        log.status || log.reviewStatus || "APPROVED",
                      )

                      return (
                        <div
                          key={log.id || index}
                          className="p-2 transition-all border border-green-100 rounded-xl bg-green-50/20 shadow-2xs hover:shadow-xs"
                        >
                          {/* Header: Tên công việc + Status + Nút Sửa */}
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-3 border-b border-green-100/80">
                            <div className="flex items-center gap-2">
                              <Avatar
                                size={24}
                                style={{
                                  backgroundColor: "#16a34a",
                                  fontSize: 11,
                                  fontWeight: 700,
                                }}
                              >
                                {index + 1}
                              </Avatar>
                              <span className="text-sm font-bold text-gray-800">
                                {taskName}
                              </span>
                              <Tag
                                color={reviewCfg.color}
                                className="rounded-full text-[11px]"
                              >
                                {reviewCfg.label}
                              </Tag>
                            </div>

                            <div className="flex items-center gap-2">
                              {(log.date || log.createdAt) && (
                                <span className="text-xs text-gray-400">
                                  {formatDate(log.date || log.createdAt)}
                                </span>
                              )}
                              {!isPlanCompleted && (
                                <Button
                                  type="primary"
                                  size="small"
                                  icon={<EditOutlined />}
                                  onClick={() => handleOpenEditLog(log)}
                                  className="text-xs font-semibold text-white bg-green-600 border-green-600 rounded-lg hover:bg-green-700 hover:border-green-700"
                                >
                                  Sửa mô tả
                                </Button>
                              )}
                            </div>
                          </div>

                          {/* Thông tin ngày tháng */}
                          {(log.workStartDate || log.workEndDate) && (
                            <div className="flex flex-wrap gap-3 mb-3 pl-2.5 bg-white rounded-lg border border-green-100 text-xs">
                              {log.workStartDate && (
                                <div className="flex items-center gap-1.5">
                                  <span className="font-medium text-gray-400">
                                    Bắt đầu:
                                  </span>
                                  <span className="font-semibold text-gray-700">
                                    {formatDate(log.workStartDate)}
                                  </span>
                                </div>
                              )}
                              {log.workEndDate && (
                                <div className="flex items-center gap-1.5">
                                  <span className="font-medium text-gray-400">
                                    Kết thúc:
                                  </span>
                                  <span className="font-semibold text-gray-700">
                                    {formatDate(log.workEndDate)}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Mô tả final */}
                          <div className="p-2 mb-3 bg-white border border-green-100 rounded-lg">
                            <div className="text-[11px] font-bold text-green-800 uppercase mb-1">
                              Mô tả nhật ký:
                            </div>
                            <p className="m-0 min-w-0 max-w-full text-sm leading-relaxed text-gray-800 whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                              {description}
                            </p>
                          </div>

                          {/* Vật tư dạng text (materialsText) */}
                          {materialsText && (
                            <div
                              className={`p-3 mb-3 rounded-lg ${
                                isHarvestMaterialsText
                                  ? "border border-emerald-100 bg-emerald-50/70"
                                  : "border border-blue-100 bg-blue-50/50"
                              }`}
                            >
                              <div
                                className={`text-[11px] font-bold uppercase mb-1.5 flex items-center gap-1 ${
                                  isHarvestMaterialsText
                                    ? "text-emerald-800"
                                    : "text-blue-800"
                                }`}
                              >
                                {isHarvestMaterialsText ? (
                                  <InboxOutlined className="text-emerald-600" />
                                ) : (
                                  <ExperimentOutlined className="text-blue-600" />
                                )}{" "}
                                {isHarvestMaterialsText
                                  ? "Sản lượng:"
                                  : "Vật tư sử dụng:"}
                              </div>
                              <p
                                className={`m-0 min-w-0 max-w-full text-sm leading-relaxed whitespace-pre-wrap break-words [overflow-wrap:anywhere] ${
                                  isHarvestMaterialsText
                                    ? "text-emerald-700"
                                    : "text-gray-700"
                                }`}
                              >
                                {materialsText}
                              </p>
                            </div>
                          )}

                          {/* Vật tư: Phân bón & Nông dược */}
                          {(fertilizers.length > 0 ||
                            pesticides.length > 0) && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mb-3">
                              {fertilizers.length > 0 && (
                                <div className="bg-blue-50/50 rounded-lg p-2.5 border border-blue-100 text-xs">
                                  <div className="flex items-center gap-1 mb-1 font-bold text-blue-800">
                                    <ExperimentOutlined className="text-blue-600" />{" "}
                                    Phân bón:
                                  </div>
                                  <div className="space-y-1">
                                    {fertilizers.map((f, i) => (
                                      <div
                                        key={i}
                                        className="flex items-center justify-between px-2 py-1 rounded bg-white/70"
                                      >
                                        <span className="font-medium text-gray-800">
                                          {f.name ||
                                            f.fertilizerName ||
                                            f.materialName}
                                        </span>
                                        <span className="font-bold text-blue-700">
                                          {f.quantity || f.totalQuantity}{" "}
                                          {f.unit || f.quantityUnit || "kg"}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {pesticides.length > 0 && (
                                <div className="bg-purple-50/50 rounded-lg p-2.5 border border-purple-100 text-xs">
                                  <div className="flex items-center gap-1 mb-1 font-bold text-purple-800">
                                    <ExperimentOutlined className="text-purple-600" />{" "}
                                    Nông dược:
                                  </div>
                                  <div className="space-y-1">
                                    {pesticides.map((p, i) => (
                                      <div
                                        key={i}
                                        className="flex items-center justify-between px-2 py-1 rounded bg-white/70"
                                      >
                                        <span className="font-medium text-gray-800">
                                          {p.name ||
                                            p.pesticideName ||
                                            p.materialName}
                                        </span>
                                        <span className="font-bold text-purple-700">
                                          {p.quantity || p.totalQuantity}{" "}
                                          {p.unit || p.quantityUnit || "lít"}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Ảnh minh chứng */}
                          {images.length > 0 && (
                            <div>
                              <div className="text-xs font-semibold text-gray-500 mb-1.5">
                                Ảnh minh chứng:
                              </div>
                              <Image.PreviewGroup
                                items={images
                                  .map(img =>
                                    typeof img === "string"
                                      ? img
                                      : img.url ||
                                        img.imageUrl ||
                                        img.path ||
                                        img.src ||
                                        img.fileUrl,
                                  )
                                  .filter(Boolean)}
                              >
                                <div className="flex flex-wrap gap-1.5">
                                  {images.map((img, i) => {
                                    const src =
                                      typeof img === "string"
                                        ? img
                                        : img.url ||
                                          img.imageUrl ||
                                          img.path ||
                                          img.src ||
                                          img.fileUrl
                                    if (!src) return null
                                    return (
                                      <div
                                        key={i}
                                        className="h-14 w-14 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden cursor-pointer hover:border-green-400 hover:shadow-md transition-all [&_.ant-image]:!h-full [&_.ant-image]:!w-full [&_.ant-image-img]:!h-full [&_.ant-image-img]:!w-full [&_.ant-image-img]:!object-cover"
                                      >
                                        <Image src={src} preview={{ src }} />
                                      </div>
                                    )
                                  })}
                                </div>
                              </Image.PreviewGroup>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </Card>
            </div>
          )}
        </Col>
      </Row>

      {/* Modal Sửa mô tả nhật ký giai đoạn */}
      <Modal
        open={editModal.open}
        title={
          <div className="flex items-center gap-2 font-bold text-green-700">
            <EditOutlined /> Sửa mô tả nhật ký giai đoạn
          </div>
        }
        onCancel={() =>
          setEditModal({ open: false, log: null, description: "" })
        }
        onOk={handleSaveEditLog}
        confirmLoading={savingEdit}
        okText="Lưu thay đổi"
        cancelText="Hủy"
        okButtonProps={{ className: "bg-green-600 border-green-600 hover:!bg-green-700" }}
      >
        <div className="py-2 space-y-3">
          <div className="text-sm text-gray-600">
            Công việc:{" "}
            <span className="font-semibold text-gray-800">
              {editModal.log?.taskName || editModal.log?.name}
            </span>
          </div>
          <div>
            <label className="block mb-1 text-xs font-semibold text-gray-500">
              Nội dung mô tả chính thức (giám sát viên chỉnh sửa):
            </label>

            <Input.TextArea
              rows={4}
              maxLength={200}
              showCount
              value={editModal.description}
              onChange={e =>
                setEditModal(prev => ({ ...prev, description: e.target.value }))
              }
              placeholder="Nhập mô tả chính thức..."
            />
          </div>
        </div>
      </Modal>
    </Card>
  )
}

export default LogbookFinalizationTab
