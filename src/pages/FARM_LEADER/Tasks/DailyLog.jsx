/**
 * Farm Leader: Ghi nhật ký hàng ngày cho công việc
 * Route: /farm-leader/cultivation-tasks/:taskId/daily-logs  (ROUTER.FL_TASK_LOG)
 *
 * API:
 *   GET  /cultivation-tasks/{id}
 *   GET  /cultivation-daily-logs/task/{taskId}
 *   GET  /cultivation-daily-logs/task/{taskId}/summary
 *   GET  /fertilizers/selection
 *   GET  /pesticides/selection
 *   POST /v1/media/upload
 *   POST /cultivation-daily-logs
 *   GET  /cultivation-tasks/{id}/leader-summary     — Của Leader: dùng để xem trước/lấy summary của công việc cụ thể trước khi gửi
 *   GET  /api/cultivation-stages/{id}/summary       — Của Supervisor: dùng để xem summary của cả giai đoạn (không dùng trực tiếp ở màn hình Leader)
 *   POST /cultivation-tasks/{id}/summary
 */
import {
  CameraOutlined,
  DeleteOutlined,
  EyeOutlined,
  FormOutlined,
  PlusOutlined,
} from "@ant-design/icons"
import {
  Alert,
  Button,
  Card,
  Col,
  DatePicker,
  Empty,
  Form,
  Image,
  Input,
  InputNumber,
  message,
  Row,
  Select,
  Spin,
  Tag,
  Tooltip,
  Typography,
  Upload,
} from "antd"

import { useEffect, useMemo, useState } from "react"
import dayjs from "dayjs"

import { useNavigate, useParams } from "react-router-dom"

import { useCultivationStatus } from "src/hooks/useCultivationStatus"
import ROUTER from "src/router/ROUTER"
import CultivationDailyLogService from "src/services/CultivationDailyLogService"
import CultivationTaskService from "src/services/CultivationTaskService"
import FertilizerService from "src/services/FertilizerService"
import PesticideService from "src/services/PesticideService"
import MaterialUsageService from "src/services/MaterialUsageService"
import UploadService from "src/services/UploadService"
import {
  applyApiFieldErrors,
  normalizeApiError,
} from "src/services/core/apiError"
import {
  formatAreaUnit,
  getQuantityUnit,
  MEASUREMENT_UNITS,
} from "src/constants/measurementUnits"
import { canWriteDailyLog } from "src/utils/cultivationStatus"
import { getLocalNow } from "src/utils/dateFormatters"
import { formatMeasurementValue } from "src/utils/materialRecommendations"

import {
  DAILY_LOG_FIELD_MAPPING,
  HARVEST_UNIT,
  MAX_UPLOAD_FILES,
  MAX_UPLOAD_IMAGE_BYTES,
  MAX_UPLOAD_TOTAL_BYTES,
  getHarvestQuantity,
  getMaterialUnit,
  hasDosageForCrop,
  isHarvestTaskData,
  isMaterialTaskData,
  toFertilizerOptions,
  toFiniteNumber,
  toPesticideOptions,
  unwrap,
} from "./components/dailyLogHelpers"
import DailyLogTaskHeader from "./components/DailyLogTaskHeader"
import DailyLogHistoryList from "./components/DailyLogHistoryList"
import MaterialUsageModal from "./components/MaterialUsageModal"
import TaskSummaryModal from "./components/TaskSummaryModal"

const { Text } = Typography
const { TextArea } = Input


const DailyLog = () => {
  const { getTaskStatus } = useCultivationStatus()
  const { taskId } = useParams()
  const navigate = useNavigate()
  const [task, setTask] = useState(null)
  const [dailyLogs, setDailyLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [form] = Form.useForm()
  const [summaryForm] = Form.useForm()
  const [saving, setSaving] = useState(false)
  const [submitModal, setSubmitModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [fileList, setFileList] = useState([])
  const [fertilizerOptions, setFertilizerOptions] = useState([])
  const [pesticideOptions, setPesticideOptions] = useState([])
  const [leaderSummary, setLeaderSummary] = useState(null)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [entryRecommendations, setEntryRecommendations] = useState({})
  const [remainingAreas, setRemainingAreas] = useState({})
  const [showImageError, setShowImageError] = useState(false)
  const [usageByLog, setUsageByLog] = useState({})
  const [usageModal, setUsageModal] = useState({
    open: false,
    dailyLogId: null,
    item: null,
  })
  const [usageForm] = Form.useForm()

  const loadRemainingArea = async (materialType, rowIndex, materialId) => {
    const key = `${materialType}-${rowIndex}`
    if (!materialId) {
      setRemainingAreas(previous => ({ ...previous, [key]: null }))
      return
    }

    try {
      const response = await CultivationDailyLogService.getRemainingArea(
        taskId,
        materialId,
      )
      const result = unwrap(response)
      setRemainingAreas(previous => ({
        ...previous,
        [key]: result || null,
      }))
    } catch {
      setRemainingAreas(previous => ({ ...previous, [key]: null }))
    }
  }

  const loadEntryRecommendation = async (
    materialType,
    rowIndex,
    materialId,
    selectedId,
    area,
  ) => {
    const key = `${materialType}-${rowIndex}`
    const areaValue = toFiniteNumber(area)
    if (!materialId || areaValue === null || areaValue <= 0) {
      setEntryRecommendations(previous => ({ ...previous, [key]: null }))
      return
    }

    try {
      const response = await CultivationDailyLogService.getRecommendations({
        taskId,
        materials: [
          {
            materialId,
            fertilizerId:
              materialType === "FERTILIZER" ? selectedId : undefined,
            pesticideId: materialType === "PESTICIDE" ? selectedId : undefined,
            materialType,
            area: areaValue,
          },
        ],
      })
      const result = unwrap(response)
      const recommendations =
        result?.recommendations || result?.Recommendations || []
      setEntryRecommendations(previous => ({
        ...previous,
        [key]: recommendations[0] || null,
      }))
    } catch {
      setEntryRecommendations(previous => ({ ...previous, [key]: null }))
    }
  }

  // ── Tính tổng hợp tạm từ dailyLogs đã load ──
  // Được dùng khi API leader-summary chưa trả data
  const aggregateFromLogs = useMemo(() => {
    const fertMap = {} // key: `${fertilizerId}|${unit}`
    const pestMap = {} // key: `${pesticideId}|${unit}`
    let totalHarvestQuantity = 0
    let totalHarvestedArea = 0
    let harvestLogCount = 0

    for (const log of dailyLogs) {
      const harvestQuantity = getHarvestQuantity(log)
      if (harvestQuantity !== null) {
        totalHarvestQuantity += harvestQuantity
        totalHarvestedArea += Number(log.executedArea || 0)
        harvestLogCount += 1
      }

      // --- fertilizers ---
      for (const f of log.fertilizers || []) {
        const id = f.fertilizerId || f.id || f.materialId
        const unit = getQuantityUnit(f.unit || f.quantityUnit, "")
        const areaUnit = MEASUREMENT_UNITS.SQUARE_METER
        const key = `${id}|${unit}`
        const opt = fertilizerOptions.find(o => o.value === id)
        const name = f.name || opt?.name || f.materialName || id || "Phân bón"
        if (!fertMap[key]) {
          fertMap[key] = {
            id,
            name,
            totalQuantity: 0,
            unit,
            totalArea: 0,
            areaUnit,
            days: 0,
          }
        }
        fertMap[key].totalQuantity += Number(f.quantity || 0)
        fertMap[key].totalArea += Number(f.area || 0)
        fertMap[key].days += 1
      }

      // --- pesticides ---
      for (const p of log.pesticides || []) {
        const id = p.pesticideId || p.id || p.materialId
        const unit = getQuantityUnit(p.unit || p.quantityUnit, "")
        const areaUnit = MEASUREMENT_UNITS.SQUARE_METER
        const key = `${id}|${unit}`
        const opt = pesticideOptions.find(o => o.value === id)
        const name = p.name || opt?.name || p.materialName || id || "Nông dược"
        if (!pestMap[key]) {
          pestMap[key] = {
            id,
            name,
            totalQuantity: 0,
            unit,
            totalArea: 0,
            areaUnit,
            days: 0,
          }
        }
        pestMap[key].totalQuantity += Number(p.quantity || 0)
        pestMap[key].totalArea += Number(p.area || 0)
        pestMap[key].days += 1
      }
    }

    return {
      fertilizers: Object.values(fertMap),
      pesticides: Object.values(pestMap),
      totalHarvestQuantity,
      totalHarvestedArea,
      harvestUnit: HARVEST_UNIT,
      harvestLogCount,
      logCount: dailyLogs.length,
    }
  }, [dailyLogs, fertilizerOptions, pesticideOptions])

  useEffect(() => {
    const loadTaskData = async () => {
      setLoading(true)
      setLoadError(null)
      try {
        const [taskRes, logsRes, fertRes, pestRes] = await Promise.all([
          CultivationTaskService.getById(taskId),
          CultivationDailyLogService.getByTask(taskId),
          FertilizerService.getFertilizerSelection(),
          PesticideService.getPesticideSelection(),
        ])

        const taskData = unwrap(taskRes)
        if (!taskData?.id && !taskData?.name) {
          setLoadError({ kind: "not-found" })
          return
        }

        const logsData = unwrap(logsRes)
        const logsList = Array.isArray(logsData)
          ? logsData
          : logsData?.items || []
        setDailyLogs(logsList)
        setTask(taskData)
        const usageEntries = await Promise.all(
          logsList
            .filter(log => log.id)
            .map(async log => {
              try {
                return [
                  log.id,
                  unwrap(await MaterialUsageService.getByDailyLog(log.id)) ||
                    [],
                ]
              } catch {
                return [log.id, []]
              }
            }),
        )
        setUsageByLog(Object.fromEntries(usageEntries))

        const fertData = unwrap(fertRes)
        const pestData = unwrap(pestRes)
        const cropName = taskData.cropName || taskData.crop?.name
        const fertilizerList = Array.isArray(fertData)
          ? fertData
          : fertData?.items || []
        const pesticideList = Array.isArray(pestData)
          ? pestData
          : pestData?.items || []
        setFertilizerOptions(
          toFertilizerOptions(
            fertilizerList.filter(item =>
              hasDosageForCrop(item.dosages, cropName),
            ),
          ),
        )
        setPesticideOptions(
          toPesticideOptions(
            pesticideList.filter(item =>
              hasDosageForCrop(item.usages, cropName),
            ),
          ),
        )
        setRemainingAreas({})

        form.setFieldsValue({
          date: getLocalNow(),
          harvestUnit: HARVEST_UNIT,
          fertilizers: [],
          pesticides: [],
        })
      } catch (error) {
        const normalizedError = normalizeApiError(error)
        setLoadError({ kind: normalizedError.kind || "error" })
      } finally {
        setLoading(false)
      }
    }
    loadTaskData()
  }, [taskId, navigate, form, refreshKey])

  useEffect(() => {
    if (!task || !isMaterialTaskData(task)) return undefined

    const handleFertilizerChanged = async () => {
      try {
        const response = await FertilizerService.getFertilizerSelection()
        const result = unwrap(response)
        const fertilizerList = Array.isArray(result)
          ? result
          : result?.items || []
        const cropName = task.cropName || task.crop?.name
        setFertilizerOptions(
          toFertilizerOptions(
            fertilizerList.filter(item =>
              hasDosageForCrop(item.dosages, cropName),
            ),
          ),
        )
        message.info("Danh sách phân bón đã được cập nhật.")
      } catch {
        // BE vẫn là lớp kiểm tra cuối cùng khi ghi nhật ký.
      }
    }

    window.addEventListener("app:fertilizer-changed", handleFertilizerChanged)
    return () =>
      window.removeEventListener(
        "app:fertilizer-changed",
        handleFertilizerChanged,
      )
  }, [task])

  const openUsageModal = (dailyLogId, item = null) => {
    setUsageModal({ open: true, dailyLogId, item })
    usageForm.setFieldsValue(
      item
        ? {
            materialType: item.materialType,
            materialId: item.materialId,
            quantity: item.quantity,
            appliedArea: item.appliedArea,
            usedAt: item.usedAt ? dayjs(item.usedAt) : getLocalNow(),
            note: item.note,
          }
        : { materialType: "FERTILIZER", usedAt: getLocalNow() },
    )
  }

  const closeUsageModal = () => {
    setUsageModal({ open: false, dailyLogId: null, item: null })
    usageForm.resetFields()
  }
  const saveUsage = async () => {
    const values = await usageForm.validateFields()
    const payload = {
      materialType: values.materialType,
      materialId: values.materialId,
      quantity: values.quantity,
      appliedArea: values.appliedArea,
      usedAt: values.usedAt?.toISOString?.() || values.usedAt,
      note: values.note || null,
    }
    if (usageModal.item)
      await MaterialUsageService.update(
        usageModal.dailyLogId,
        usageModal.item.id,
        payload,
      )
    else await MaterialUsageService.create(usageModal.dailyLogId, payload)
    const latest =
      unwrap(await MaterialUsageService.getByDailyLog(usageModal.dailyLogId)) ||
      []
    setUsageByLog(previous => ({
      ...previous,
      [usageModal.dailyLogId]: latest,
    }))
    closeUsageModal()
    message.success("Đã lưu vật tư sử dụng.")
  }
  const deleteUsage = async (dailyLogId, usageId) => {
    await MaterialUsageService.remove(dailyLogId, usageId)
    setUsageByLog(previous => ({
      ...previous,
      [dailyLogId]: (previous[dailyLogId] || []).filter(
        item => item.id !== usageId,
      ),
    }))
    message.success("Đã xóa vật tư sử dụng.")
  }

  const mapFertilizers = (rows = []) =>
    rows.map(row => ({
      fertilizerId: row.fertilizerId,
      materialId: row.materialId || row.fertilizerId,
      quantity: Number(row.quantity || 0),
      unit: getQuantityUnit(row.quantityUnit || row.unit, ""),
      quantityUnit: getQuantityUnit(row.quantityUnit || row.unit, ""),
      area: Number(row.area || 0),
      areaUnit: MEASUREMENT_UNITS.SQUARE_METER,
    }))

  const mapPesticides = (rows = []) =>
    rows.map(row => ({
      pesticideId: row.pesticideId,
      materialId: row.materialId || row.pesticideId,
      quantity: Number(row.quantity || 0),
      unit: getQuantityUnit(row.quantityUnit || row.unit, ""),
      quantityUnit: getQuantityUnit(row.quantityUnit || row.unit, ""),
      area: Number(row.area || 0),
      areaUnit: MEASUREMENT_UNITS.SQUARE_METER,
    }))

  const handleSave = async () => {
    try {
      const imageUrls = (fileList || [])
        .map(file => file.url || file.response?.url || file.response?.data?.url)
        .filter(Boolean)

      if (imageUrls.length === 0) {
        setShowImageError(true)
        form.setFields([
          {
            name: "images",
            errors: ["Vui lòng tải lên ít nhất 1 ảnh minh chứng."],
          },
        ])
        return
      }

      const values = await form.validateFields()

      if (isMaterialTask && values.fertilizers?.length > 0) {
        try {
          const response = await FertilizerService.getFertilizerSelection()
          const result = unwrap(response)
          const fertilizerList = Array.isArray(result)
            ? result
            : result?.items || []
          const activeFertilizerIds = new Set(
            fertilizerList.map(item => String(item.id)),
          )
          const hasInactiveFertilizer = values.fertilizers.some(
            row =>
              row?.fertilizerId &&
              !activeFertilizerIds.has(String(row.fertilizerId)),
          )

          if (hasInactiveFertilizer) {
            message.warning(
              "Một loại phân bón vừa bị vô hiệu hóa. Vui lòng chọn lại trước khi ghi nhật ký.",
            )
            return
          }
        } catch {
          // Continue to the API; BE validates the active status authoritatively.
        }
      }

      setSaving(true)

      const payload = {
        taskId,
        date: values.date
          ? values.date.format("YYYY-MM-DD")
          : getLocalNow().format("YYYY-MM-DD"),
        description: values.description || "",
        executedArea: values.executedArea || 0,
        harvestQuantity: isHarvestTask ? values.harvestQuantity : null,
        harvestUnit: isHarvestTask ? HARVEST_UNIT : null,
        fertilizers: isMaterialTask ? mapFertilizers(values.fertilizers) : [],
        pesticides: isMaterialTask ? mapPesticides(values.pesticides) : [],
        images: imageUrls.map(url => ({ url })),
      }

      await CultivationDailyLogService.create(payload, {
        errorHandling: "form",
        form,
        fieldErrorMapping: DAILY_LOG_FIELD_MAPPING,
      })

      // Reload current page to see the new log
      setRefreshKey(k => k + 1)
      form.resetFields()
      setFileList([])
      setShowImageError(false)
    } catch (error) {
      if (error?.errorFields) {
        message.warning("Vui lòng kiểm tra lại các trường nhập.")
      } else {
        const normalizedError = normalizeApiError(error)
        applyApiFieldErrors(form, normalizedError, DAILY_LOG_FIELD_MAPPING)
        console.error("DailyLog save error:", {
          kind: normalizedError.kind,
          code: normalizedError.code,
          status: normalizedError.status,
          traceId: normalizedError.traceId,
        })
      }
    } finally {
      setSaving(false)
    }
  }

  const openSummaryModal = async () => {
    setSubmitModal(true)
    setSummaryLoading(true)
    setLeaderSummary(null)
    try {
      const [taskSumRes] = await Promise.allSettled([
        CultivationTaskService.getLeaderSummary(taskId),
      ])
      if (taskSumRes.status === "fulfilled") {
        const summary = unwrap(taskSumRes.value)
        setLeaderSummary(summary)
        // Set description đã gửi vào form để hiển thị
        if (summary?.description) {
          summaryForm.setFieldsValue({
            descriptionSummary: summary.description,
          })
        }
      } else {
        // API error handled by axios interceptor
        const normalizedError = normalizeApiError(taskSumRes.reason)
        console.error("DailyLog summary load error:", {
          kind: normalizedError.kind,
          code: normalizedError.code,
          status: normalizedError.status,
          traceId: normalizedError.traceId,
        })
      }
    } catch {
      // Summary loading is best-effort.
    } finally {
      setSummaryLoading(false)
    }
  }

  const handleSubmitSummary = async () => {
    try {
      const summaryImages = (
        leaderSummary?.images?.length > 0
          ? leaderSummary.images
          : dailyLogs.flatMap(log => log.images || [])
      )
        .map(img =>
          typeof img === "string"
            ? img
            : img?.imageUrl || img?.url || img?.fileUrl,
        )
        .filter(Boolean)

      if (summaryImages.length === 0) {
        message.warning(
          "Công việc cần có ít nhất 1 ảnh minh chứng trong nhật ký trước khi gửi tổng kết.",
        )
        return
      }

      setSubmitting(true)
      const summaryValues = await summaryForm.validateFields()

      await CultivationTaskService.submitSummary(taskId, {
        descriptionSummary: summaryValues.descriptionSummary,
        completedDate: getLocalNow().toISOString(),
      })

      setSubmitModal(false)
      setRefreshKey(k => k + 1)
    } catch (error) {
      if (error?.errorFields) {
        message.warning("Vui lòng nhập mô tả tổng kết trước khi gửi.")
      } else {
        const normalizedError = normalizeApiError(error)
        console.error("DailyLog summary submit error:", {
          kind: normalizedError.kind,
          code: normalizedError.code,
          status: normalizedError.status,
          traceId: normalizedError.traceId,
        })
      }
    } finally {
      setSubmitting(false)
    }
  }

  const customUpload = async ({ file, onSuccess, onError }) => {
    try {
      const existingBytes = fileList.reduce(
        (total, item) => total + Number(item.size || 0),
        0,
      )
      if (fileList.length >= MAX_UPLOAD_FILES) {
        throw new Error(
          `Mỗi nhật ký chỉ được tải tối đa ${MAX_UPLOAD_FILES} ảnh.`,
        )
      }
      if (!String(file.type || "").startsWith("image/")) {
        throw new Error("Chỉ được tải tệp hình ảnh.")
      }
      if (file.size > MAX_UPLOAD_IMAGE_BYTES) {
        throw new Error("Mỗi ảnh không được vượt quá 5 MB.")
      }
      if (existingBytes + file.size > MAX_UPLOAD_TOTAL_BYTES) {
        throw new Error("Tổng dung lượng ảnh không được vượt quá 100 MB.")
      }
      const formData = new FormData()
      formData.append("file", file)
      const res = await UploadService.uploadImage(formData, {
        params: { folder: "eapls/cultivation-logs" },
        errorHandling: "component",
      })
      const data = unwrap(res)
      const url = data?.url || data?.fileUrl || data
      if (!url || typeof url !== "string") {
        throw new Error("Upload không trả về url")
      }
      onSuccess({ url })
      setShowImageError(false)
      setFileList(prev => {
        const next = [
          ...prev.filter(f => f.uid !== file.uid),
          {
            uid: file.uid,
            name: file.name,
            status: "done",
            url,
            size: file.size,
          },
        ]
        form.setFieldsValue({ images: next })
        form.setFields([{ name: "images", errors: [] }])
        return next
      })
    } catch (err) {
      onError?.(err)
      message.error(err?.message || "Không thể tải ảnh lên.")
      const normalizedError = normalizeApiError(err)
      console.error("DailyLog upload error:", {
        kind: normalizedError.kind,
        code: normalizedError.code,
        status: normalizedError.status,
        traceId: normalizedError.traceId,
      })
    }
  }

  const uploadProps = {
    name: "file",
    multiple: true,
    fileList,
    customRequest: customUpload,
    showUploadList: false,
    onRemove(file) {
      setFileList(prev => prev.filter(item => item.uid !== file.uid))
    },
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Spin size="large" tip="Đang tải công việc..." />
      </div>
    )
  }

  if (loadError) {
    const isNotFound = loadError.kind === "not-found"
    return (
      <div className="flex flex-col items-center justify-center min-h-96 gap-4">
        <Empty
          description={
            isNotFound
              ? "Không tìm thấy công việc."
              : "Không thể tải chi tiết công việc."
          }
        />
        <div className="flex gap-2">
          {!isNotFound && (
            <Button type="primary" onClick={() => setRefreshKey(key => key + 1)}>
              Thử lại
            </Button>
          )}
          <Button onClick={() => navigate(ROUTER.FL_TASKS)}>
            Quay lại danh sách
          </Button>
        </div>
      </div>
    )
  }

  if (!task) return null

  const statusCfg = getTaskStatus(task.status)
  const isViewOnly = !canWriteDailyLog(task.status)
  const isHarvestTask = isHarvestTaskData(task)
  const isMaterialTask = isMaterialTaskData(task)
  const harvestedArea = dailyLogs.reduce(
    (total, log) => total + Number(log.executedArea || 0),
    0,
  )
  const remainingHarvestArea = Math.max(
    0,
    Number(task.totalPlanArea || 0) - harvestedArea,
  )
  const harvestedQuantity = dailyLogs.reduce(
    (total, log) => total + Number(getHarvestQuantity(log) || 0),
    0,
  )
  const isHarvestCompleted =
    isHarvestTask &&
    Number(task.totalPlanArea || 0) > 0 &&
    remainingHarvestArea <= 0.0001
  const actualEndDate = ["WAITING_APPROVAL", "COMPLETED"].includes(
    task?.status,
  )
    ? task?.workEndDate
    : null
  const displayStartDate = task?.workStartDate || task?.plannedStartDate
  const displayStartLabel = task?.workStartDate
    ? "Ngày bắt đầu"
    : "Dự kiến"

  return (
    <div className="pb-20 space-y-4 duration-500 animate-in fade-in slide-in-from-bottom-4">
      <DailyLogTaskHeader
        task={task}
        statusCfg={statusCfg}
        isViewOnly={isViewOnly}
        displayStartDate={displayStartDate}
        displayStartLabel={displayStartLabel}
        actualEndDate={actualEndDate}
        onBack={() => navigate(ROUTER.FL_TASKS)}
        onOpenSummaryModal={openSummaryModal}
      />

      <Row gutter={24}>
        <Col xs={24} lg={14}>
          <Form
            form={form}
            layout="vertical"
            className="space-y-4"
            disabled={isViewOnly}
          >
            {isHarvestCompleted ? (
              <Card
                bordered={false}
                className="shadow-sm rounded-2xl border border-emerald-100 bg-emerald-50/60"
                bodyStyle={{ padding: "24px" }}
              >
                <div className="flex flex-col items-center text-center">
                  <h3 className="m-0 text-lg font-bold text-emerald-800">
                    Bạn đã hoàn thành thu hoạch
                  </h3>
                  <p className="mt-2 mb-0 text-sm text-emerald-700">
                    Đã thu hoạch {harvestedArea} m²
                    {harvestedQuantity > 0
                      ? ` với số lượng ${harvestedQuantity} ${HARVEST_UNIT}`
                      : ""}
                    .
                  </p>
                  <p className="mt-1 mb-0 text-sm text-gray-600">
                    Không thể ghi thêm nhật ký cho công việc thu hoạch này.
                  </p>
                </div>
              </Card>
            ) : (
              <>
                <Card
                  bordered={false}
                  className="h-full shadow-sm rounded-2xl"
                  bodyStyle={{ padding: "20px" }}
                >
                  <div className="flex items-center gap-2 mb-4 text-base font-bold text-gray-800">
                    <FormOutlined className="text-green-600" />
                    Nội dung thực hiện
                  </div>
                  <Row gutter={16} align="top">
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="date"
                        label="Ngày ghi nhận"
                        rules={[{ required: true, message: "Chọn ngày" }]}
                      >
                        <DatePicker
                          className="w-full"
                          format="DD/MM/YYYY"
                          disabled
                        />
                      </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                      <Form.Item
                        name="images"
                        label="Ảnh minh chứng"
                        required
                        rules={[
                          {
                            validator: () => {
                              const imageUrls = (fileList || [])
                                .map(
                                  file =>
                                    file.url ||
                                    file.response?.url ||
                                    file.response?.data?.url,
                                )
                                .filter(Boolean)
                              if (imageUrls.length === 0) {
                                return Promise.reject(
                                  new Error(
                                    "Vui lòng tải lên ít nhất 1 ảnh minh chứng.",
                                  ),
                                )
                              }
                              return Promise.resolve()
                            },
                          },
                        ]}
                      >
                        <Image.PreviewGroup>
                          <div className="flex flex-wrap items-center gap-2">
                            {fileList.map((file, idx) => (
                              <div
                                key={file.uid || idx}
                                className="group relative h-14 w-14 shrink-0 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 shadow-xs hover:shadow-md transition-all [&_.ant-image]:!h-full [&_.ant-image]:!w-full [&_.ant-image-img]:!h-full [&_.ant-image-img]:!w-full [&_.ant-image-img]:!object-cover"
                              >
                                <Image
                                  src={file.url}
                                  alt={file.name || "Ảnh minh chứng"}
                                  preview={{
                                    mask: (
                                      <div className="flex items-center justify-center text-white text-[10px]">
                                        <EyeOutlined />
                                      </div>
                                    ),
                                  }}
                                />
                                {!isViewOnly && (
                                  <button
                                    type="button"
                                    onClick={e => {
                                      e.stopPropagation()
                                      setFileList(prev => {
                                        const next = prev.filter(
                                          item => item.uid !== file.uid,
                                        )
                                        form.setFieldsValue({ images: next })
                                        return next
                                      })
                                    }}
                                    className="absolute z-20 flex items-center justify-center w-4 h-4 text-white transition-colors rounded-full shadow-xs top-1 right-1 bg-black/70 hover:bg-red-600 opacity-90 group-hover:opacity-100"
                                    title="Xóa ảnh"
                                  >
                                    <DeleteOutlined className="text-[8px]" />
                                  </button>
                                )}
                              </div>
                            ))}

                            {!isViewOnly && (
                              <Upload
                                {...uploadProps}
                                accept="image/*"
                                showUploadList={false}
                              >
                                <div className="flex flex-col items-center justify-center text-green-700 transition-all border border-green-400 border-dashed cursor-pointer h-14 w-14 shrink-0 rounded-xl bg-green-50/50 hover:bg-green-100/70 hover:border-green-600 group">
                                  <CameraOutlined className="text-base text-green-600 group-hover:scale-110 transition-transform mb-0.5" />
                                  <span className="text-[10px] font-semibold text-green-700">
                                    Thêm ảnh
                                  </span>
                                </div>
                              </Upload>
                            )}

                            {isViewOnly && fileList.length === 0 && (
                              <span className="text-xs italic text-gray-400">
                                Chưa có ảnh
                              </span>
                            )}
                          </div>
                        </Image.PreviewGroup>
                      </Form.Item>
                    </Col>

                    <Col span={24}>
                      <Form.Item
                        name="description"
                        label="Chi tiết công việc"
                        rules={[
                          { required: true, message: "Nhập mô tả" },
                          {
                            validator: (_, value) => {
                              const text =
                                typeof value === "string" ? value.trim() : ""
                              if (!text)
                                return Promise.reject(
                                  new Error(
                                    "Chi tiết công việc không được để trống hoặc chỉ chứa khoảng trắng.",
                                  ),
                                )
                              if (text.length > 200)
                                return Promise.reject(
                                  new Error(
                                    "Chi tiết công việc không được vượt quá 200 ký tự.",
                                  ),
                                )
                              return Promise.resolve()
                            },
                          },
                        ]}
                      >
                        <TextArea
                          rows={3}
                          placeholder="Mô tả tình hình cây trồng, vấn đề phát sinh..."
                          disabled={isViewOnly}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>

                {isHarvestTask && remainingHarvestArea > 0 && (
                  <Card
                    bordered={false}
                    className="shadow-sm rounded-2xl"
                    bodyStyle={{ padding: "20px" }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-base font-bold text-emerald-800">
                        Dữ liệu thu hoạch
                      </div>
                      <Tag color="green">
                        Còn lại: {remainingHarvestArea} m²
                      </Tag>
                    </div>
                    <Row gutter={12}>
                      <Col xs={24} md={10}>
                        <Form.Item
                          name="harvestQuantity"
                          label="Số lượng thu hoạch"
                          rules={[
                            {
                              required: true,
                              type: "number",
                              min: 0.0001,
                              message: "Nhập số lượng thu hoạch",
                            },
                          ]}
                        >
                          <InputNumber
                            min={0}
                            className="w-full"
                            placeholder="Số lượng"
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={6}>
                        <Form.Item
                          name="harvestUnit"
                          label="Đơn vị"
                          rules={[{ required: true, message: "Chọn đơn vị" }]}
                        >
                          <Select
                            disabled
                            options={[
                              { value: HARVEST_UNIT, label: HARVEST_UNIT },
                            ]}
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={8}>
                        <Form.Item
                          name="executedArea"
                          label="Diện tích thu hoạch (m²)"
                          rules={[
                            {
                              required: true,
                              type: "number",
                              min: 0.0001,
                              message: "Nhập diện tích hợp lệ",
                            },
                            {
                              validator: (_, value) => {
                                if (
                                  value === undefined ||
                                  value === null ||
                                  value === ""
                                )
                                  return Promise.resolve()
                                return Number(value) <=
                                  remainingHarvestArea + 0.0001
                                  ? Promise.resolve()
                                  : Promise.reject(
                                      new Error(
                                        `Không được vượt quá ${remainingHarvestArea} m² còn lại`,
                                      ),
                                    )
                              },
                            },
                          ]}
                        >
                          <InputNumber
                            min={0}
                            max={remainingHarvestArea}
                            className="w-full"
                            placeholder="Diện tích"
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>
                )}

                {isMaterialTask && (
                  <>
                    <Card
                      bordered={false}
                      className="shadow-sm rounded-2xl"
                      bodyStyle={{ padding: "20px" }}
                    >
                      <div className="mb-4 text-base font-bold text-gray-800">
                        Phân bón
                      </div>
                      <Form.List name="fertilizers">
                        {(fields, { add, remove }) => (
                          <div className="space-y-3">
                            {fields.map(field => (
                              <div
                                key={field.key}
                                className="p-3 border border-gray-100 rounded-xl bg-gray-50"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-semibold text-gray-700">
                                    Loại {field.name + 1}
                                  </span>
                                  {!isViewOnly && (
                                    <Button
                                      type="text"
                                      danger
                                      size="small"
                                      onClick={() => remove(field.name)}
                                      icon={<DeleteOutlined />}
                                    />
                                  )}
                                </div>
                                <Row gutter={12}>
                                  <Col xs={24} md={8}>
                                    <Form.Item
                                      {...field}
                                      name={[field.name, "fertilizerId"]}
                                      rules={[
                                        {
                                          required: true,
                                          message: "Chọn loại phân bón",
                                        },
                                      ]}
                                    >
                                      <Select
                                        showSearch
                                        optionFilterProp="label"
                                        placeholder="Chọn phân bón"
                                        options={fertilizerOptions}
                                        disabled={isViewOnly}
                                        onChange={(value, option) => {
                                          const opt =
                                            option ||
                                            fertilizerOptions.find(
                                              o => o.value === value,
                                            )
                                          const selectedMaterial =
                                            opt?.raw || opt
                                          const unitFromApi =
                                            getMaterialUnit(selectedMaterial)
                                          form.setFieldValue(
                                            [
                                              "fertilizers",
                                              field.name,
                                              "materialId",
                                            ],
                                            opt?.materialId || value,
                                          )
                                          form.setFieldValue(
                                            [
                                              "fertilizers",
                                              field.name,
                                              "quantityUnit",
                                            ],
                                            unitFromApi,
                                          )
                                          if (
                                            !form.getFieldValue([
                                              "fertilizers",
                                              field.name,
                                              "areaUnit",
                                            ])
                                          ) {
                                            form.setFieldValue(
                                              [
                                                "fertilizers",
                                                field.name,
                                                "areaUnit",
                                              ],
                                              MEASUREMENT_UNITS.SQUARE_METER,
                                            )
                                          }

                                          loadEntryRecommendation(
                                            "FERTILIZER",
                                            field.name,
                                            opt?.materialId || value,
                                            value,
                                            form.getFieldValue([
                                              "fertilizers",
                                              field.name,
                                              "area",
                                            ]),
                                          )
                                          loadRemainingArea(
                                            "FERTILIZER",
                                            field.name,
                                            opt?.materialId || value,
                                          )
                                        }}
                                      />
                                    </Form.Item>
                                    <Form.Item
                                      noStyle
                                      shouldUpdate={(
                                        previousValues,
                                        currentValues,
                                      ) =>
                                        previousValues?.fertilizers?.[
                                          field.name
                                        ]?.fertilizerId !==
                                        currentValues?.fertilizers?.[field.name]
                                          ?.fertilizerId
                                      }
                                    >
                                      {({ getFieldValue }) => {
                                        const selectedId = getFieldValue([
                                          "fertilizers",
                                          field.name,
                                          "fertilizerId",
                                        ])
                                        const remainingArea =
                                          remainingAreas[
                                            `FERTILIZER-${field.name}`
                                          ]

                                        if (!selectedId) return null

                                        return (
                                          <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-700">
                                            <span className="font-medium">
                                              Diện tích còn lại:
                                            </span>
                                            <span className="font-bold">
                                              {remainingArea
                                                ? `${formatMeasurementValue(remainingArea.remainingArea)} ${formatAreaUnit(remainingArea.areaUnit)}`
                                                : "—"}
                                            </span>
                                          </div>
                                        )
                                      }}
                                    </Form.Item>
                                    <Form.Item
                                      {...field}
                                      name={[field.name, "materialId"]}
                                      hidden
                                    >
                                      <Input />
                                    </Form.Item>
                                  </Col>
                                  <Col xs={12} md={5}>
                                    <Form.Item
                                      {...field}
                                      name={[field.name, "quantity"]}
                                    >
                                      <InputNumber
                                        min={0}
                                        className="w-full"
                                        placeholder="Lượng"
                                        disabled={isViewOnly}
                                      />
                                    </Form.Item>
                                  </Col>
                                  <Col xs={12} md={3}>
                                    <Form.Item
                                      {...field}
                                      name={[field.name, "quantityUnit"]}
                                      hidden
                                    >
                                      <Input />
                                    </Form.Item>
                                    <Form.Item
                                      noStyle
                                      shouldUpdate={(
                                        previousValues,
                                        currentValues,
                                      ) =>
                                        previousValues?.fertilizers?.[
                                          field.name
                                        ]?.quantityUnit !==
                                        currentValues?.fertilizers?.[field.name]
                                          ?.quantityUnit
                                      }
                                    >
                                      {({ getFieldValue }) => (
                                        <span className="inline-flex h-8 w-full items-center justify-center rounded-lg bg-slate-50 text-sm font-semibold text-gray-600">
                                          {getQuantityUnit(
                                            getFieldValue([
                                              "fertilizers",
                                              field.name,
                                              "quantityUnit",
                                            ]),
                                            "",
                                          )}
                                        </span>
                                      )}
                                    </Form.Item>
                                  </Col>
                                  <Col xs={12} md={5}>
                                    <Form.Item
                                      {...field}
                                      name={[field.name, "area"]}
                                    >
                                      <InputNumber
                                        min={0}
                                        className="w-full"
                                        placeholder="Diện tích"
                                        disabled={isViewOnly}
                                        onChange={value =>
                                          loadEntryRecommendation(
                                            "FERTILIZER",
                                            field.name,
                                            form.getFieldValue([
                                              "fertilizers",
                                              field.name,
                                              "materialId",
                                            ]),
                                            form.getFieldValue([
                                              "fertilizers",
                                              field.name,
                                              "fertilizerId",
                                            ]),
                                            value,
                                          )
                                        }
                                      />
                                    </Form.Item>
                                  </Col>
                                  <Col xs={12} md={3}>
                                    <Form.Item
                                      {...field}
                                      name={[field.name, "areaUnit"]}
                                      hidden
                                    >
                                      <Input />
                                    </Form.Item>
                                    <span className="inline-flex h-8 w-full items-center justify-center rounded-lg bg-slate-50 text-sm font-semibold text-gray-600">
                                      {MEASUREMENT_UNITS.SQUARE_METER}
                                    </span>
                                  </Col>
                                </Row>
                                {entryRecommendations[
                                  `FERTILIZER-${field.name}`
                                ] &&
                                  (() => {
                                    const recommendation =
                                      entryRecommendations[
                                        `FERTILIZER-${field.name}`
                                      ]

                                    return (
                                      <Alert
                                        type="warning"
                                        className="mt-1 rounded-lg [&_.ant-alert-message]:text-[11px] [&_.ant-alert-description]:text-[11px] [&_.ant-alert-description]:leading-4"
                                        message={`Khuyến nghị lượng phân bón: ${recommendation.recommendationText}`}
                                        description="Tính theo liều lượng đã khai báo trong chi tiết phân bón."
                                      />
                                    )
                                  })()}
                              </div>
                            ))}
                            {!isViewOnly && (
                              <Button
                                type="dashed"
                                onClick={() =>
                                  add({
                                    quantityUnit: "",
                                    areaUnit: MEASUREMENT_UNITS.SQUARE_METER,
                                  })
                                }
                                icon={<PlusOutlined />}
                                className="w-full text-green-700 border-green-300"
                              >
                                Thêm phân bón
                              </Button>
                            )}
                          </div>
                        )}
                      </Form.List>
                    </Card>

                    <Card
                      bordered={false}
                      className="shadow-sm rounded-2xl"
                      bodyStyle={{ padding: "20px" }}
                    >
                      <div className="mb-4 text-base font-bold text-gray-800">
                        Nông dược
                      </div>
                      <Form.List name="pesticides">
                        {(fields, { add, remove }) => (
                          <div className="space-y-3">
                            {fields.map(field => (
                              <div
                                key={field.key}
                                className="p-3 border border-gray-100 rounded-xl bg-gray-50"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-semibold text-gray-700">
                                    Loại {field.name + 1}
                                  </span>
                                  {!isViewOnly && (
                                    <Button
                                      type="text"
                                      danger
                                      size="small"
                                      onClick={() => remove(field.name)}
                                      icon={<DeleteOutlined />}
                                    />
                                  )}
                                </div>
                                <Row gutter={12}>
                                  <Col xs={24} md={8}>
                                    <Form.Item
                                      {...field}
                                      name={[field.name, "pesticideId"]}
                                      rules={[
                                        {
                                          required: true,
                                          message: "Chọn loại nông dược",
                                        },
                                      ]}
                                    >
                                      <Select
                                        showSearch
                                        optionFilterProp="label"
                                        placeholder="Chọn nông dược"
                                        options={pesticideOptions}
                                        disabled={isViewOnly}
                                        onChange={(value, option) => {
                                          const opt =
                                            option ||
                                            pesticideOptions.find(
                                              o => o.value === value,
                                            )
                                          const selectedMaterial =
                                            opt?.raw || opt
                                          // usageUnit takes priority for pesticides
                                          const unitFromApi =
                                            getMaterialUnit(selectedMaterial)
                                          form.setFieldValue(
                                            [
                                              "pesticides",
                                              field.name,
                                              "materialId",
                                            ],
                                            opt?.materialId || value,
                                          )
                                          form.setFieldValue(
                                            [
                                              "pesticides",
                                              field.name,
                                              "quantityUnit",
                                            ],
                                            unitFromApi,
                                          )
                                          if (
                                            !form.getFieldValue([
                                              "pesticides",
                                              field.name,
                                              "areaUnit",
                                            ])
                                          ) {
                                            form.setFieldValue(
                                              [
                                                "pesticides",
                                                field.name,
                                                "areaUnit",
                                              ],
                                              MEASUREMENT_UNITS.SQUARE_METER,
                                            )
                                          }

                                          loadEntryRecommendation(
                                            "PESTICIDE",
                                            field.name,
                                            opt?.materialId || value,
                                            value,
                                            form.getFieldValue([
                                              "pesticides",
                                              field.name,
                                              "area",
                                            ]),
                                          )
                                          loadRemainingArea(
                                            "PESTICIDE",
                                            field.name,
                                            opt?.materialId || value,
                                          )
                                        }}
                                      />
                                    </Form.Item>
                                    <Form.Item
                                      {...field}
                                      name={[field.name, "materialId"]}
                                      hidden
                                    >
                                      <Input />
                                    </Form.Item>
                                  </Col>
                                  <Col xs={12} md={5}>
                                    <Form.Item
                                      {...field}
                                      name={[field.name, "quantity"]}
                                    >
                                      <InputNumber
                                        min={0}
                                        className="w-full"
                                        placeholder="Lượng"
                                        disabled={isViewOnly}
                                      />
                                    </Form.Item>
                                  </Col>
                                  <Col xs={12} md={3}>
                                    <Form.Item
                                      {...field}
                                      name={[field.name, "quantityUnit"]}
                                      hidden
                                    >
                                      <Input />
                                    </Form.Item>
                                    <Form.Item
                                      noStyle
                                      shouldUpdate={(
                                        previousValues,
                                        currentValues,
                                      ) =>
                                        previousValues?.pesticides?.[field.name]
                                          ?.quantityUnit !==
                                        currentValues?.pesticides?.[field.name]
                                          ?.quantityUnit
                                      }
                                    >
                                      {({ getFieldValue }) => (
                                        <span className="inline-flex h-8 w-full items-center justify-center rounded-lg bg-slate-50 text-sm font-semibold text-gray-600">
                                          {getQuantityUnit(
                                            getFieldValue([
                                              "pesticides",
                                              field.name,
                                              "quantityUnit",
                                            ]),
                                            "",
                                          )}
                                        </span>
                                      )}
                                    </Form.Item>
                                  </Col>
                                  <Col xs={12} md={5}>
                                    <Form.Item
                                      {...field}
                                      name={[field.name, "area"]}
                                    >
                                      <InputNumber
                                        min={0}
                                        className="w-full"
                                        placeholder="Diện tích"
                                        disabled={isViewOnly}
                                        onChange={value =>
                                          loadEntryRecommendation(
                                            "PESTICIDE",
                                            field.name,
                                            form.getFieldValue([
                                              "pesticides",
                                              field.name,
                                              "materialId",
                                            ]),
                                            form.getFieldValue([
                                              "pesticides",
                                              field.name,
                                              "pesticideId",
                                            ]),
                                            value,
                                          )
                                        }
                                      />
                                    </Form.Item>
                                  </Col>
                                  <Col xs={12} md={3}>
                                    <Form.Item
                                      {...field}
                                      name={[field.name, "areaUnit"]}
                                      hidden
                                    >
                                      <Input />
                                    </Form.Item>
                                    <span className="inline-flex h-8 w-full items-center justify-center rounded-lg bg-slate-50 text-sm font-semibold text-gray-600">
                                      {MEASUREMENT_UNITS.SQUARE_METER}
                                    </span>
                                  </Col>
                                </Row>
                                <Form.Item
                                  noStyle
                                  shouldUpdate={(
                                    previousValues,
                                    currentValues,
                                  ) =>
                                    previousValues?.pesticides?.[field.name]
                                      ?.pesticideId !==
                                    currentValues?.pesticides?.[field.name]
                                      ?.pesticideId
                                  }
                                >
                                  {() => {
                                    const selectedId = form.getFieldValue([
                                      "pesticides",
                                      field.name,
                                      "pesticideId",
                                    ])
                                    const remainingArea =
                                      remainingAreas[`PESTICIDE-${field.name}`]

                                    if (!selectedId) return null

                                    return (
                                      <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-700">
                                        <span className="font-medium">
                                          Diện tích còn lại:
                                        </span>
                                        <span className="font-bold">
                                          {remainingArea
                                            ? `${formatMeasurementValue(remainingArea.remainingArea)} ${formatAreaUnit(remainingArea.areaUnit)}`
                                            : "—"}
                                        </span>
                                      </div>
                                    )
                                  }}
                                </Form.Item>
                                {entryRecommendations[
                                  `PESTICIDE-${field.name}`
                                ] &&
                                  (() => {
                                    const recommendation =
                                      entryRecommendations[
                                        `PESTICIDE-${field.name}`
                                      ]

                                    return (
                                      <Alert
                                        type="warning"
                                        className="mt-1 rounded-lg [&_.ant-alert-message]:text-[11px] [&_.ant-alert-description]:text-[11px] [&_.ant-alert-description]:leading-4"
                                        message={`Khuyến nghị lượng nông dược: ${recommendation.recommendationText}`}
                                        description="Tính theo liều lượng đã khai báo trong chi tiết nông dược."
                                      />
                                    )
                                  })()}
                              </div>
                            ))}
                            {!isViewOnly && (
                              <Button
                                type="dashed"
                                onClick={() =>
                                  add({
                                    quantityUnit: "",
                                    areaUnit: MEASUREMENT_UNITS.SQUARE_METER,
                                  })
                                }
                                icon={<PlusOutlined />}
                                className="w-full text-green-700 border-green-300"
                              >
                                Thêm nông dược
                              </Button>
                            )}
                          </div>
                        )}
                      </Form.List>
                    </Card>
                  </>
                )}

                {!isViewOnly && (
                  <div className="flex flex-wrap justify-end gap-3 pt-2 pb-6">
                    <Button
                      onClick={() => navigate(ROUTER.FL_TASKS)}
                      className="h-10 px-6 font-semibold rounded-xl"
                    >
                      Hủy
                    </Button>
                    <Button
                      type="primary"
                      onClick={handleSave}
                      loading={saving}
                      className="h-10 px-6 font-semibold bg-green-600 rounded-xl"
                    >
                      Lưu nhật ký
                    </Button>
                  </div>
                )}
              </>
            )}
          </Form>
        </Col>

        <Col xs={24} lg={10}>
          <div className="sticky space-y-4 top-20">
            <DailyLogHistoryList dailyLogs={dailyLogs} />
          </div>
        </Col>
      </Row>

      <MaterialUsageModal
        open={usageModal.open}
        item={usageModal.item}
        onCancel={closeUsageModal}
        onSave={saveUsage}
        form={usageForm}
        fertilizerOptions={fertilizerOptions}
        pesticideOptions={pesticideOptions}
      />

      <TaskSummaryModal
        open={submitModal}
        onCancel={() => {
          setSubmitModal(false)
          summaryForm.resetFields()
        }}
        task={task}
        dailyLogs={dailyLogs}
        actualEndDate={actualEndDate}
        isHarvestTask={isHarvestTask}
        leaderSummary={leaderSummary}
        aggregateFromLogs={aggregateFromLogs}
        summaryForm={summaryForm}
        summaryLoading={summaryLoading}
        submitting={submitting}
        onSubmit={handleSubmitSummary}
      />
    </div>
  )
}

export default DailyLog
