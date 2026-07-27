/**
 * Farm Supervisor — Tab Chốt Logbook
 *
 * Trái: danh sách Stage
 * Phải: Summary Leader gửi (WAITING_APPROVAL) → expand xem chi tiết → viết lại mô tả → Lưu
 */
import {
  BookOutlined,
  CheckCircleOutlined,
  EditOutlined,
  ExperimentOutlined,
  EyeOutlined,
  LockOutlined,
  SaveOutlined,
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
  Table,
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
  loadLeaderCompileData,
  saveCompiledDescription,
  unwrap,
} from "./compileLogHelpers"

const { Text, Title } = Typography
const { TextArea } = Input

const StageListItem = ({ stage, index, isActive, onClick, getStageStatus }) => {
  const cfg = getStageStatus(stage.status)
  return (
    <List.Item
      onClick={onClick}
      className="px-3 py-2 mb-2 transition-colors cursor-pointer rounded-xl"
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
            style={{ margin: 0, fontSize: 10, width: "fit-content" }}
          >
            {cfg.label}
          </Tag>
        }
      />
    </List.Item>
  )
}

const mapMaterialRows = (items = [], nameFallback) =>
  (Array.isArray(items) ? items : []).map((item, i) => ({
    key: item.id || item.taskId || String(i),
    name:
      item.name ||
      item.fertilizerName ||
      item.pesticideName ||
      item.materialName ||
      `${nameFallback} ${i + 1}`,
    type: item.type || item.materialType || "",
    totalQuantity: item.totalQuantity ?? item.quantity ?? 0,
    unit: item.unit ?? item.quantityUnit ?? "",
    totalArea: item.totalArea ?? item.area ?? 0,
    areaUnit: item.areaUnit ?? "ha",
    days: item.days ?? "—",
  }))

const fertColumns = [
  {
    title: "Phân bón",
    dataIndex: "name",
    key: "name",
    render: (v, r) => (
      <div className="flex items-center gap-2">
        <span className="font-medium text-gray-800">{v}</span>
        {r.type && (
          <Tag color="blue" className="rounded-full text-[11px] m-0">
            {r.type}
          </Tag>
        )}
      </div>
    ),
  },
  {
    title: "Tổng lượng",
    key: "qty",
    align: "right",
    render: (_, r) => (
      <span className="font-semibold text-blue-700">
        {r.totalQuantity}{" "}
        <span className="font-normal text-gray-500">{r.unit}</span>
      </span>
    ),
  },
  {
    title: "Diện tích",
    key: "area",
    align: "right",
    render: (_, r) =>
      r.totalArea > 0 ? (
        <span>
          {r.totalArea} <span className="text-gray-500">{r.areaUnit}</span>
        </span>
      ) : (
        <span className="text-gray-300">—</span>
      ),
  },
]

const pestColumns = [
  {
    title: "Thuốc BVTV",
    dataIndex: "name",
    key: "name",
    render: (v, r) => (
      <div className="flex items-center gap-2">
        <span className="font-medium text-gray-800">{v}</span>
        {r.type && (
          <Tag color="purple" className="rounded-full text-[11px] m-0">
            {r.type}
          </Tag>
        )}
      </div>
    ),
  },
  {
    title: "Tổng lượng",
    key: "qty",
    align: "right",
    render: (_, r) => (
      <span className="font-semibold text-purple-700">
        {r.totalQuantity}{" "}
        <span className="font-normal text-gray-500">{r.unit}</span>
      </span>
    ),
  },
  {
    title: "Diện tích",
    key: "area",
    align: "right",
    render: (_, r) =>
      r.totalArea > 0 ? (
        <span>
          {r.totalArea} <span className="text-gray-500">{r.areaUnit}</span>
        </span>
      ) : (
        <span className="text-gray-300">—</span>
      ),
  },
]

const otherColumns = [
  {
    title: "Vật tư",
    dataIndex: "name",
    key: "name",
    render: (v, r) => (
      <div className="flex items-center gap-2">
        <span className="font-medium text-gray-800">{v}</span>
        {r.type && (
          <Tag color="cyan" className="rounded-full text-[11px] m-0">
            {r.type}
          </Tag>
        )}
      </div>
    ),
  },
  {
    title: "Số lượng",
    key: "qty",
    align: "right",
    render: (_, r) => (
      <span className="font-semibold text-emerald-700">
        {r.totalQuantity}{" "}
        <span className="font-normal text-gray-500">{r.unit}</span>
      </span>
    ),
  },
]

/** Expand: thông tin Summary (ảnh, phân, thuốc, mô tả) + textarea Supervisor */
const SummaryCompilePanel = ({ task, stageId, onSaved, readOnly = false }) => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [leaderSummary, setLeaderSummary] = useState(null)
  const [description, setDescription] = useState("")

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      try {
        const taskId =
          task?.taskId ||
          task?.id ||
          task?.cultivationTaskId ||
          task?.workTaskId
        const hasFullData =
          task &&
          (Array.isArray(task.fertilizers) ||
            Array.isArray(task.pesticides) ||
            Array.isArray(task.materials) ||
            Array.isArray(task.images) ||
            task.description ||
            task.descriptionSummary ||
            task.leaderSubmittedDescription ||
            task.draftDescription)

        let summaryObj = null
        let leaderDesc = ""

        if (hasFullData) {
          summaryObj = task.summary || task
          leaderDesc =
            summaryObj.leaderSubmittedDescription ||
            summaryObj.descriptionSummary ||
            summaryObj.description ||
            summaryObj.draftDescription ||
            ""
        } else if (taskId) {
          const fetched = await loadLeaderCompileData(taskId)
          if (cancelled) return
          summaryObj = fetched.summary
          leaderDesc =
            fetched.leaderSubmittedDescription ||
            fetched.summary?.descriptionSummary ||
            fetched.summary?.description ||
            ""
        }

        if (cancelled) return
        setLeaderSummary(summaryObj)

        setDescription(leaderDesc || summaryObj?.description || "")
      } catch (err) {
        console.error(err)
        if (!cancelled) {
          setLeaderSummary(task)
          setDescription(task?.description || "")
          message.error("Không tải được Summary từ Leader.")
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [task])

  const allMaterials = useMemo(() => {
    if (
      Array.isArray(leaderSummary?.materials) &&
      leaderSummary.materials.length > 0
    ) {
      return mapMaterialRows(leaderSummary.materials, "Vật tư")
    }
    return null
  }, [leaderSummary])

  const fertRows = useMemo(() => {
    if (allMaterials) {
      return allMaterials.filter(m => m.type.toLowerCase().includes("phân"))
    }
    return mapMaterialRows(leaderSummary?.fertilizers, "Phân")
  }, [allMaterials, leaderSummary])

  const pestRows = useMemo(() => {
    if (allMaterials) {
      return allMaterials.filter(m => m.type.toLowerCase().includes("thuốc"))
    }
    return mapMaterialRows(leaderSummary?.pesticides, "Thuốc")
  }, [allMaterials, leaderSummary])

  const otherRows = useMemo(() => {
    if (allMaterials) {
      return allMaterials.filter(
        m =>
          !m.type.toLowerCase().includes("phân") &&
          !m.type.toLowerCase().includes("thuốc"),
      )
    }
    return []
  }, [allMaterials])

  const images = leaderSummary?.images || []

  const handleSave = async () => {
    if (!description?.trim()) {
      message.error("Vui lòng nhập mô tả mới.")
      return
    }
    try {
      setSaving(true)
      const targetStageId = stageId || task?.cultivationStageId || task?.stageId
      const taskId =
        task?.taskId || task?.cultivationTaskId || task?.workTaskId || task?.id
      if (!taskId) {
        message.error("Không xác định được CultivationTaskId của Summary.")
        return
      }

      await saveCompiledDescription(targetStageId, taskId, description.trim())
      message.success("Đã lưu mô tả vào Logbook!")
      onSaved?.()
    } catch (err) {
      console.error(err)
      message.error(
        err?.response?.data?.message || err?.message || "Lưu thất bại.",
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="py-8 text-center">
        <Spin tip="Đang tải Summary..." />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="p-4 space-y-4 border border-gray-200 rounded-xl bg-gray-50/60">
        <div className="flex items-center justify-between">
          <Text strong className="text-gray-700">
            Thông tin Summary (Leader gửi)
          </Text>
          <Tag icon={<LockOutlined />} color="default" className="rounded-full">
            Chỉ đọc
          </Tag>
        </div>

        {images.length > 0 && (
          <div>
            <div className="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">
              Ảnh minh chứng ({images.length})
            </div>
            <Image.PreviewGroup
              items={images
                .map(img =>
                  typeof img === "string"
                    ? img
                    : img.url ||
                      img.imageUrl ||
                      img.fileUrl ||
                      img.path ||
                      img.src,
                )
                .filter(Boolean)}
            >
              <div className="flex flex-wrap gap-3">
                {images.map((img, idx) => {
                  const src =
                    typeof img === "string"
                      ? img
                      : img.url ||
                        img.imageUrl ||
                        img.fileUrl ||
                        img.path ||
                        img.src
                  const label = typeof img === "object" ? img.label : null
                  if (!src) return null
                  return (
                    <div
                      key={img.id || idx}
                      className="flex flex-col items-center"
                    >
                      <div className="h-20 w-20 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden cursor-pointer hover:border-green-400 hover:shadow-md transition-all duration-200 [&_.ant-image]:!h-full [&_.ant-image]:!w-full [&_.ant-image-img]:!h-full [&_.ant-image-img]:!w-full [&_.ant-image-img]:!object-cover">
                        <Image
                          src={src}
                          alt={label || `Ảnh ${idx + 1}`}
                          preview={{
                            src,
                            mask: (
                              <div className="flex items-center justify-center text-white text-[10px] font-semibold">
                                <EyeOutlined /> Xem
                              </div>
                            ),
                          }}
                        />
                      </div>
                      {label && (
                        <span className="mt-1 text-[11px] text-gray-500 max-w-[84px] truncate text-center font-medium">
                          {label}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </Image.PreviewGroup>
          </div>
        )}

        {fertRows.length > 0 && (
          <div>
            <div className="mb-2 font-semibold text-blue-800">
              Phân bón ({fertRows.length})
            </div>
            <Table
              columns={fertColumns}
              dataSource={fertRows}
              size="small"
              pagination={false}
              locale={{ emptyText: "Chưa ghi nhận phân bón" }}
              className="overflow-hidden border border-blue-100 rounded-xl"
            />
          </div>
        )}

        {pestRows.length > 0 && (
          <div>
            <div className="mb-2 font-semibold text-purple-800">
              Thuốc BVTV ({pestRows.length})
            </div>
            <Table
              columns={pestColumns}
              dataSource={pestRows}
              size="small"
              pagination={false}
              locale={{ emptyText: "Chưa ghi nhận thuốc BVTV" }}
              className="overflow-hidden border border-purple-100 rounded-xl"
            />
          </div>
        )}

        {otherRows.length > 0 && (
          <div>
            <div className="mb-2 font-semibold text-emerald-800">
              Vật tư khác ({otherRows.length})
            </div>
            <Table
              columns={otherColumns}
              dataSource={otherRows}
              size="small"
              pagination={false}
              locale={{ emptyText: "Chưa ghi nhận vật tư khác" }}
              className="overflow-hidden border rounded-xl border-emerald-100"
            />
          </div>
        )}

        {fertRows.length === 0 &&
          pestRows.length === 0 &&
          otherRows.length === 0 && (
            <div className="text-xs italic text-gray-400">
              Không có thông tin vật tư
            </div>
          )}

        {/* {leaderSummary?.draftDescription && (
          <div>
            <div className="mb-1 text-xs font-semibold tracking-wide text-gray-500 uppercase">
              Mô tả tổng hợp báo cáo hàng ngày (Hệ thống)
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-2.5 text-xs text-gray-600 italic">
              {leaderSummary.draftDescription}
            </div>
          </div>
        )} */}

        <div>
          <div className="mb-1 text-xs font-semibold tracking-wide text-gray-500 uppercase">
            Mô tả từ Farm Leader
          </div>
          <div className="p-3 text-sm font-medium text-blue-900 whitespace-pre-wrap border border-blue-100 rounded-lg bg-blue-50">
            {leaderSummary?.leaderSubmittedDescription ||
              leaderSummary?.descriptionSummary ||
              leaderSummary?.description ||
              "—"}
          </div>
        </div>
      </div>

      <div className="p-4 border border-green-200 rounded-xl bg-green-50/30">
        <div className="flex items-center gap-2 mb-3">
          <EditOutlined className="text-green-600" />
          <Text strong className="text-green-800">
            Viết lại mô tả (Supervisor)
          </Text>
          {readOnly && (
            <Tag icon={<LockOutlined />} color="warning" className="rounded-full ml-auto">
              Đang chờ duyệt — không thể chỉnh sửa
            </Tag>
          )}
        </div>
        <TextArea
          rows={5}
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Nhập mô tả chuẩn để lưu vào Logbook..."
          className="rounded-lg"
          disabled={readOnly}
        />
        {!readOnly && (
          <div className="flex justify-end mt-4">
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={saving}
              onClick={handleSave}
              className="px-6 font-semibold bg-green-600 rounded-lg h-9"
            >
              Lưu
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

const LogbookFinalizationTab = ({ stages, tasks = {}, loadData, plan }) => {
  const isPlanCompleted = plan?.status === 'COMPLETED'
  const isReadOnly = plan?.reviewStatus === 'WAITING_APPROVAL' || plan?.reviewStatus === 'REJECTED' || isPlanCompleted
  const isWaitingApproval = plan?.reviewStatus === 'WAITING_APPROVAL'
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

      if (CultivationLogService.patchDescription) {
        await CultivationLogService.patchDescription(logId, {
          description: newDesc,
        })
      } else if (CultivationLogService.update) {
        await CultivationLogService.update(logId, { description: newDesc })
      }

      message.success("Đã cập nhật mô tả Logbook thành công!")
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
    } catch (err) {
      console.error(err)
      message.error(
        err?.response?.data?.message ||
          err?.message ||
          "Cập nhật mô tả thất bại.",
      )
    } finally {
      setSavingEdit(false)
    }
  }

  useEffect(() => {
    if (stages.length > 0 && !selectedId) {
      setSelectedId(stages[0].id)
    }
  }, [stages, selectedId])

  const selectedStage = stages.find(s => s.id === selectedId)

  const pendingSummaries = useMemo(() => {
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
  }, [stageSummary, tasks, selectedId])

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
      } catch (err) {
        console.error(err)
        setStageSummary(null)
        setStageLogs([])
      } finally {
        setLoadingStageSummary(false)
      }
    }
    loadStageData()
  }, [selectedId])

  const handleCompleteStage = async () => {
    if (!selectedId) {
      message.error("Vui lòng chọn giai đoạn cần hoàn tất.")
      return
    }
    try {
      setSubmitting(true)
      await CultivationStageService.submitReview(selectedId, {})
      message.success("Đã hoàn tất giai đoạn và gửi lên Farm Manager!")
      await loadData?.()
    } catch (error) {
      console.error(error)
      message.error(
        error?.response?.data?.message ||
          error?.message ||
          "Hoàn tất giai đoạn thất bại.",
      )
    } finally {
      setSubmitting(false)
    }
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
      } catch (err) {
        console.error(err)
      }
    }
  }

  return (
    <Card
      bordered={false}
      className="duration-500 shadow-sm rounded-2xl animate-in fade-in slide-in-from-bottom-4"
    >
      {isWaitingApproval && (
        <Alert
          type="info"
          showIcon
          className="mb-4 rounded-xl"
          message={
            <span className="font-semibold text-blue-700">
              Đã gửi nhật ký lên Farm Manager — Đang chờ duyệt
            </span>
          }
          description="Nhật ký canh tác đã được gửi thành công. Vui lòng chờ Farm Manager xem xét và phê duyệt."
        />
      )}
      {!isReadOnly && (
        <div className="flex flex-wrap items-center justify-end gap-3 mb-4">
          <Button
            type="primary"
            icon={<SendOutlined />}
            loading={submitting}
            onClick={handleCompleteStage}
            disabled={!selectedId}
            className="font-semibold bg-green-600 rounded-lg h-9"
          >
            Hoàn tất giai đoạn
          </Button>
        </div>
      )}

      <Row gutter={[24, 24]} className="min-h-[520px]">
        <Col
          xs={24}
          lg={8}
          xl={6}
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

        <Col xs={24} lg={16} xl={18}>
          {!selectedStage ? (
            <div className="flex flex-col items-center justify-center h-full py-20 text-gray-400">
              <BookOutlined className="mb-3 text-4xl opacity-50" />
              <p>Chọn giai đoạn để xem Summary chờ biên soạn</p>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircleOutlined className="text-xl text-green-600" />
                  <Title level={5} className="!mb-0">
                    {selectedStage.stageName}
                  </Title>
                </div>
                {stageSummary?.reviewStatus && (
                  <Tag
                    color={getReviewStatus(stageSummary.reviewStatus).color}
                    className="rounded-full px-3 py-0.5 text-xs font-semibold"
                  >
                    Trạng thái:{" "}
                    {getReviewStatus(stageSummary.reviewStatus).label}
                  </Tag>
                )}
              </div>

              <Card
                size="small"
                bordered
                className="shadow-sm rounded-xl border-amber-200"
                title={
                  <span className="font-semibold text-amber-900">
                    Summary chờ biên soạn
                  </span>
                }
              >
                {loadingStageSummary ? (
                  <div className="py-8 text-center">
                    <Spin tip="Đang tải Summary chờ biên soạn..." />
                  </div>
                ) : pendingSummaries.length === 0 ? (
                  <Empty
                    description="Không có Summary chờ duyệt"
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
                        "Summary"
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
                            readOnly={isWaitingApproval || isPlanCompleted}
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
                      <BookOutlined /> Logbook giai đoạn
                      <Tag color="green" className="ml-1 font-semibold">
                        {stageLogs.length} mục
                      </Tag>
                    </span>
                  </span>
                }
              >
                {loadingStageSummary ? (
                  <div className="py-8 text-center">
                    <Spin tip="Đang tải Logbook giai đoạn..." />
                  </div>
                ) : stageLogs.length === 0 ? (
                  <Empty
                    description="Chưa có mục nào trong Logbook giai đoạn"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                ) : (
                  <div className="space-y-1">
                    {stageLogs.map((log, index) => {
                      const taskName =
                        log.taskName ||
                        log.workTaskName ||
                        log.name ||
                        `Mục ${index + 1}`
                      const description =
                        log.supervisorDescription ||
                        log.description ||
                        log.descriptionSummary ||
                        "Chưa có mô tả"
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
                              {!isWaitingApproval && !isPlanCompleted && (
                                <Button
                                  type="primary"
                                  size="small"
                                  icon={<EditOutlined />}
                                  onClick={() => handleOpenEditLog(log)}
                                  className="text-xs font-semibold text-white bg-green-600 border-green-600 rounded-lg hover:bg-green-700"
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
                              Mô tả Logbook:
                            </div>
                            <p className="m-0 text-sm leading-relaxed text-gray-800 whitespace-pre-wrap">
                              {description}
                            </p>
                          </div>

                          {/* Vật tư dạng text (materialsText) */}
                          {log.materialsText && (
                            <div className="p-3 mb-3 border border-blue-100 rounded-lg bg-blue-50/50">
                              <div className="text-[11px] font-bold text-blue-800 uppercase mb-1.5 flex items-center gap-1">
                                <ExperimentOutlined className="text-blue-600" />{" "}
                                Vật tư sử dụng:
                              </div>
                              <p className="m-0 text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">
                                {log.materialsText}
                              </p>
                            </div>
                          )}

                          {/* Vật tư: Phân bón & Thuốc BVTV */}
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
                                    Thuốc BVTV:
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
                                          {p.unit || p.quantityUnit || "ml"}
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

      {/* Modal Sửa mô tả Logbook giai đoạn */}
      <Modal
        open={editModal.open}
        title={
          <div className="flex items-center gap-2 font-bold text-green-700">
            <EditOutlined /> Sửa mô tả Logbook giai đoạn
          </div>
        }
        onCancel={() =>
          setEditModal({ open: false, log: null, description: "" })
        }
        onOk={handleSaveEditLog}
        confirmLoading={savingEdit}
        okText="Lưu thay đổi"
        cancelText="Hủy"
        okButtonProps={{ className: "bg-green-600 border-green-600" }}
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
              Nội dung mô tả chính thức (Supervisor chỉnh sửa):
            </label>

            <Input.TextArea
              rows={4}
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
