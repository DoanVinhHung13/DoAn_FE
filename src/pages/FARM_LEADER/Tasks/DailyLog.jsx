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
  ArrowLeftOutlined,
  CalendarOutlined,
  CameraOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  ExperimentOutlined,
  EyeOutlined,
  FileTextOutlined,
  FormOutlined,
  PictureOutlined,
  PlusOutlined,
  SendOutlined,
} from "@ant-design/icons"
import {
  Alert,
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Empty,
  Form,
  Image,
  Input,
  InputNumber,
  message,
  Modal,
  Row,
  Select,
  Spin,
  Table,
  Tag,
  Tooltip,
  Typography,
  Upload,
} from "antd"

import { useEffect, useMemo, useState } from "react"

import { useNavigate, useParams } from "react-router-dom"

import TitleCustom from "src/components/TitleCustom"
import { useCultivationStatus } from "src/hooks/useCultivationStatus"
import ROUTER from "src/router/ROUTER"
import CultivationDailyLogService from "src/services/CultivationDailyLogService"
import CultivationTaskService from "src/services/CultivationTaskService"
import FertilizerService from "src/services/FertilizerService"
import PesticideService from "src/services/PesticideService"
import UploadService from "src/services/UploadService"
import { getQuantityUnit, MEASUREMENT_UNITS } from "src/constants/measurementUnits"
import { canWriteDailyLog } from "src/utils/cultivationStatus"
import { formatDate, getLocalNow, parseDate } from "src/utils/dateFormatters"
import { getUserDisplayName } from "src/utils/userDisplayName"

const { Text } = Typography
const { TextArea } = Input

const unwrap = res => res?.data?.data ?? res?.data ?? res

const getMaterialUnit = item =>
  getQuantityUnit(
    item?.usageUnit ||
      item?.unit ||
      item?.quantityUnit ||
      item?.unitName ||
      item?.materialUnit,
    "",
  )

// usageUnit takes priority for both fertilizers and pesticides
const toFertilizerOptions = list =>
  (list || []).map(item => {
    const unit = getMaterialUnit(item)
    return {
      value: item.id,
      label: unit ? `${item.name} (${unit})` : item.name,
      materialId: item.materialId || item.id,
      name: item.name,
      unit: unit,
      raw: item,
    }
  })

// usageUnit takes priority for pesticides
const toPesticideOptions = list =>
  (list || []).map(item => {
    // API returns: unit (kho) and usageUnit (su dung) - use usageUnit
    const unit = getMaterialUnit(item)
    return {
      value: item.id,
      label: unit ? `${item.name} (${unit})` : item.name,
      materialId: item.materialId || item.id,
      name: item.name,
      unit: unit,
      usageUnit: item.usageUnit,
      raw: item,
    }
  })

const DailyLog = () => {
  const { getTaskStatus } = useCultivationStatus()
  const { taskId } = useParams()
  const navigate = useNavigate()
  const [task, setTask] = useState(null)
  const [dailyLogs, setDailyLogs] = useState([])
  const [loading, setLoading] = useState(true)
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

  // ── Tính tổng hợp tạm từ dailyLogs đã load ──
  // Được dùng khi API leader-summary chưa trả data
  const aggregateFromLogs = useMemo(() => {
    const fertMap = {} // key: `${fertilizerId}|${unit}`
    const pestMap = {} // key: `${pesticideId}|${unit}`

    for (const log of dailyLogs) {
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
      logCount: dailyLogs.length,
    }
  }, [dailyLogs, fertilizerOptions, pesticideOptions])

  useEffect(() => {
    const loadTaskData = async () => {
      setLoading(true)
      try {
        const [taskRes, logsRes, fertRes, pestRes] = await Promise.all([
          CultivationTaskService.getById(taskId),
          CultivationDailyLogService.getByTask(taskId),
          FertilizerService.getFertilizerSelection(),
          PesticideService.getPesticideSelection(),
        ])

        const taskData = unwrap(taskRes)
        if (!taskData?.id && !taskData?.name) {
          message.error("Không tìm thấy công việc.")
          navigate(ROUTER.FL_TASKS)
          return
        }

        setTask(taskData)

        const logsData = unwrap(logsRes)
        const logsList = Array.isArray(logsData)
          ? logsData
          : logsData?.items || []
        setDailyLogs(logsList)

        const fertData = unwrap(fertRes)
        const pestData = unwrap(pestRes)
        setFertilizerOptions(
          toFertilizerOptions(
            Array.isArray(fertData) ? fertData : fertData?.items || [],
          ),
        )
        setPesticideOptions(
          toPesticideOptions(
            Array.isArray(pestData) ? pestData : pestData?.items || [],
          ),
        )

        form.setFieldsValue({
          date: getLocalNow(),
          fertilizers: [],
          pesticides: [],
        })
      } catch (error) {
        console.error(error)
        message.error("Không thể tải dữ liệu công việc.")
        navigate(ROUTER.FL_TASKS)
      } finally {
        setLoading(false)
      }
    }
    loadTaskData()
  }, [taskId, navigate, form, refreshKey])

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
      const values = await form.validateFields()
      setSaving(true)

      const imageUrls = fileList
        .map(file => file.url || file.response?.url || file.response?.data?.url)
        .filter(Boolean)

      const payload = {
        taskId,
        date: values.date
          ? values.date.format("YYYY-MM-DD")
          : getLocalNow().format("YYYY-MM-DD"),
        description: values.description || "",
        fertilizers: mapFertilizers(values.fertilizers),
        pesticides: mapPesticides(values.pesticides),
        images: imageUrls.map(url => ({ url })),
      }

      await CultivationDailyLogService.create(payload)

      // Reload current page to see the new log
      setRefreshKey(k => k + 1)
      form.resetFields()
      setFileList([])
    } catch (error) {
      console.error(error)
      if (error.errorFields) {
        message.warning("Vui lòng kiểm tra lại các trường nhập.")
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
      }
    } catch (e) {
      console.error(e)
    } finally {
      setSummaryLoading(false)
    }
  }

  const handleSubmitSummary = async () => {
    try {
      setSubmitting(true)
      const summaryValues = await summaryForm.validateFields()

      await CultivationTaskService.submitSummary(taskId, {
        descriptionSummary: summaryValues.descriptionSummary,
        completedAt: getLocalNow().format("YYYY-MM-DD"),
      })

      setSubmitModal(false)
      setRefreshKey(k => k + 1)
    } catch (error) {
      console.error(error)
      if (error.errorFields) {
        message.warning("Vui lòng nhập mô tả tổng kết trước khi gửi.")
      } else {
        message.error(error.message || "Gửi báo cáo thất bại.")
      }
    } finally {
      setSubmitting(false)
    }
  }

  const customUpload = async ({ file, onSuccess, onError }) => {
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await UploadService.uploadImage(formData, {
        params: { folder: "eapls/daily-logs" },
      })
      const data = unwrap(res)
      const url = data?.url || data?.fileUrl || data
      if (!url || typeof url !== "string") {
        throw new Error("Upload không trả về url")
      }
      onSuccess({ url })
      setFileList(prev => [
        ...prev.filter(f => f.uid !== file.uid),
        {
          uid: file.uid,
          name: file.name,
          status: "done",
          url,
        },
      ])
    } catch (err) {
      console.error(err)
      onError?.(err)
      message.error(`${file.name} tải lên thất bại.`)
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

  if (!task) return null

  const statusCfg = getTaskStatus(task.status)
  const isViewOnly = !canWriteDailyLog(task.status)

  return (
    <div className="pb-20 space-y-4 duration-500 animate-in fade-in slide-in-from-bottom-4">
      <div>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(ROUTER.FL_TASKS)}
          className="mb-3 -ml-2 text-gray-600 h-9 hover:text-green-700"
        >
          Quay lại danh sách công việc
        </Button>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex-1">
            <div className="flex flex-wrap gap-2 mt-2">
              <Tag color={statusCfg.color}>{statusCfg.label}</Tag>
              {task.taskCatalogName && (
                <Tag color="blue">{task.taskCatalogName}</Tag>
              )}
            </div>
            <div className="flex items-center justify-between gap-3">
              <TitleCustom className="!mb-0 text-xl md:text-2xl line-clamp-1">
                {task.name}
              </TitleCustom>
              {task.status === "WAITING_APPROVAL" ? (
                <Button
                  type="default"
                  icon={<FileTextOutlined />}
                  onClick={openSummaryModal}
                  className="h-10 px-5 font-semibold rounded-xl border-emerald-500 text-emerald-600 hover:!bg-emerald-50 shrink-0"
                >
                  Xem lại Summary đã gửi
                </Button>
              ) : (
                !isViewOnly && (
                  <Button
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    onClick={openSummaryModal}
                    className="h-10 px-5 font-semibold rounded-xl bg-emerald-600 border-emerald-600 hover:!bg-emerald-700 hover:!border-emerald-700 shrink-0"
                  >
                    Hoàn thành & Gửi Summary
                  </Button>
                )
              )}
            </div>
            {task.description && (
              <div className="mt-2 text-sm text-gray-600">
                {task.description}
              </div>
            )}
          </div>
        </div>
      </div>

      {(task.cultivationLogbookName || task.cultivationStageName) && (
        <Card
          bordered={false}
          className="border border-green-100 shadow-sm rounded-2xl bg-green-50/40"
        >
          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <Text type="secondary" className="text-xs">
                Kế hoạch canh tác
              </Text>
              <div className="mt-1 font-semibold text-gray-800">
                {task.cultivationLogbookName || "—"}
              </div>
            </div>
            <div>
              <Text type="secondary" className="text-xs">
                Giai đoạn
              </Text>
              <div className="mt-1 font-semibold text-gray-800">
                {task.cultivationStageName || "—"}
              </div>
            </div>
          </div>
        </Card>
      )}

      {task.status === "WAITING_APPROVAL" && (
        <Alert
          type="warning"
          showIcon
          message="Đã gửi summary — đang chờ Farm Supervisor biên soạn / duyệt."
          className="rounded-xl"
        />
      )}

      <Row gutter={24}>
        <Col xs={24} lg={14}>
          <Form
            form={form}
            layout="vertical"
            className="space-y-4"
            disabled={isViewOnly}
          >
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
                  <Form.Item label="Ảnh minh chứng">
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
                                  setFileList(prev =>
                                    prev.filter(item => item.uid !== file.uid),
                                  )
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
                    rules={[{ required: true, message: "Nhập mô tả" }]}
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
                                  const unitFromApi = getMaterialUnit(opt?.raw || opt)
                                  form.setFieldValue(
                                    ["fertilizers", field.name, "materialId"],
                                    opt?.materialId || value,
                                  )
                                  form.setFieldValue(
                                    ["fertilizers", field.name, "quantityUnit"],
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
                                      ["fertilizers", field.name, "areaUnit"],
                                      MEASUREMENT_UNITS.SQUARE_METER,
                                    )
                                  }
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
                            <Form.Item {...field} name={[field.name, "quantityUnit"]} hidden>
                              <Input />
                            </Form.Item>
                            <Form.Item
                              noStyle
                              shouldUpdate={(previousValues, currentValues) =>
                                previousValues?.fertilizers?.[field.name]?.quantityUnit !==
                                currentValues?.fertilizers?.[field.name]?.quantityUnit
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
                            <Form.Item {...field} name={[field.name, "area"]}>
                              <InputNumber
                                min={0}
                                className="w-full"
                                placeholder="Diện tích"
                                disabled={isViewOnly}
                              />
                            </Form.Item>
                          </Col>
                          <Col xs={12} md={3}>
                            <Form.Item {...field} name={[field.name, "areaUnit"]} hidden>
                              <Input />
                            </Form.Item>
                            <span className="inline-flex h-8 w-full items-center justify-center rounded-lg bg-slate-50 text-sm font-semibold text-gray-600">
                              {MEASUREMENT_UNITS.SQUARE_METER}
                            </span>
                          </Col>
                        </Row>
                      </div>
                    ))}
                    {!isViewOnly && (
                      <Button
                        type="dashed"
                        onClick={() => add({
                          quantityUnit: "",
                          areaUnit: MEASUREMENT_UNITS.SQUARE_METER,
                        })}
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
                                { required: true, message: "Chọn loại nông dược" },
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
                                  // usageUnit takes priority for pesticides
                                  const unitFromApi = getMaterialUnit(opt?.raw || opt)
                                  form.setFieldValue(
                                    ["pesticides", field.name, "materialId"],
                                    opt?.materialId || value,
                                  )
                                  form.setFieldValue(
                                    ["pesticides", field.name, "quantityUnit"],
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
                                      ["pesticides", field.name, "areaUnit"],
                                      MEASUREMENT_UNITS.SQUARE_METER,
                                    )
                                  }
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
                            <Form.Item {...field} name={[field.name, "quantityUnit"]} hidden>
                              <Input />
                            </Form.Item>
                            <Form.Item
                              noStyle
                              shouldUpdate={(previousValues, currentValues) =>
                                previousValues?.pesticides?.[field.name]?.quantityUnit !==
                                currentValues?.pesticides?.[field.name]?.quantityUnit
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
                            <Form.Item {...field} name={[field.name, "area"]}>
                              <InputNumber
                                min={0}
                                className="w-full"
                                placeholder="Diện tích"
                                disabled={isViewOnly}
                              />
                            </Form.Item>
                          </Col>
                          <Col xs={12} md={3}>
                            <Form.Item {...field} name={[field.name, "areaUnit"]} hidden>
                              <Input />
                            </Form.Item>
                            <span className="inline-flex h-8 w-full items-center justify-center rounded-lg bg-slate-50 text-sm font-semibold text-gray-600">
                              {MEASUREMENT_UNITS.SQUARE_METER}
                            </span>
                          </Col>
                        </Row>
                      </div>
                    ))}
                    {!isViewOnly && (
                      <Button
                        type="dashed"
                        onClick={() => add({
                          quantityUnit: "",
                          areaUnit: MEASUREMENT_UNITS.SQUARE_METER,
                        })}
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
          </Form>
        </Col>

        <Col xs={24} lg={10}>
          <div className="sticky space-y-4 top-20">
            <Card
              bordered={false}
              className="shadow-sm rounded-2xl"
              bodyStyle={{ padding: "20px" }}
            >
              <div className="flex items-center justify-between mb-4 text-base font-bold text-gray-800">
                <span>Lịch sử ghi chép</span>
                <Tag color="blue" className="rounded-full">
                  {dailyLogs.length} bản ghi
                </Tag>
              </div>

              {dailyLogs.length === 0 ? (
                <Empty description="Chưa có bản ghi nào" className="my-8" />
              ) : (
                <div className="relative max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {dailyLogs.map((log, index) => {
                    const isLast = index === dailyLogs.length - 1
                    return (
                      <div
                        key={log.id || index}
                        className="relative flex gap-4"
                      >
                        <div className="flex flex-col items-center">
                          <div className="relative z-10 flex h-3 w-3 flex-shrink-0 rounded-full bg-green-500 mt-1.5" />
                          {!isLast && (
                            <div className="flex-1 w-0 my-1 border-l-2 border-gray-200" />
                          )}
                        </div>
                        <div className={`flex-1 ${!isLast ? "pb-5" : "pb-2"}`}>
                          <div className="flex items-center justify-between mb-1">
                            <Tag
                              color="green"
                              className="m-0 font-medium rounded-full"
                            >
                              {formatDate(log.date)}
                            </Tag>
                            <span className="text-[11px] text-gray-400">
                              Cập nhật bởi:{" "}
                              <span className="font-medium text-gray-600">
                                {getUserDisplayName(
                                  log.updatedByName,
                                  log.updatedBy,
                                  log.createdByName,
                                  log.createdBy,
                                  log.recordedByName,
                                  log.recordedBy,
                                  log.user,
                                  log.author,
                                  log.performedByName,
                                  log.performedBy,
                                )}
                              </span>
                            </span>
                          </div>
                          {log.description && (
                            <p className="text-sm m-0 mt-1.5 text-gray-700 font-medium leading-relaxed">
                              {log.description}
                            </p>
                          )}

                          {/* Phân bón */}
                          {log.fertilizers?.length > 0 && (
                            <div className="mt-2 bg-blue-50/60 rounded-xl p-2.5 border border-blue-100/80 space-y-1">
                              <div className="text-[11px] font-bold text-blue-800 flex items-center gap-1">
                                <ExperimentOutlined className="text-blue-600" />
                                Phân bón đã sử dụng:
                              </div>
                              {log.fertilizers.map((f, i) => {
                                const name =
                                  f.name || f.materialName || "Phân bón"
                                const qty = f.quantity
                                const unit = getQuantityUnit(f.quantityUnit || f.unit, "")
                                const area = f.area
                                const areaUnit = MEASUREMENT_UNITS.SQUARE_METER

                                return (
                                  <div
                                    key={i}
                                    className="text-xs text-gray-700 flex flex-wrap items-center gap-x-1.5 pl-1.5"
                                  >
                                    <span>
                                      •{" "}
                                      <span className="font-semibold text-gray-800">
                                        {name}
                                      </span>
                                      :
                                    </span>
                                    <span className="font-bold text-blue-700">
                                      {qty} {unit}
                                    </span>
                                    {area > 0 && (
                                      <span className="text-gray-500 text-[11px]">
                                        ({area} {areaUnit})
                                      </span>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          )}

                          {/* Nông dược */}
                          {log.pesticides?.length > 0 && (
                            <div className="mt-2 bg-purple-50/60 rounded-xl p-2.5 border border-purple-100/80 space-y-1">
                              <div className="text-[11px] font-bold text-purple-800 flex items-center gap-1">
                                <ExperimentOutlined className="text-purple-600" />
                                Nông dược đã sử dụng:
                              </div>
                              {log.pesticides.map((p, i) => {
                                const name =
                                  p.name || p.materialName || "Nông dược"
                                const qty = p.quantity
                                const unit = getQuantityUnit(p.quantityUnit || p.unit, "")
                                const area = p.area
                                const areaUnit = MEASUREMENT_UNITS.SQUARE_METER

                                return (
                                  <div
                                    key={i}
                                    className="text-xs text-gray-700 flex flex-wrap items-center gap-x-1.5 pl-1.5"
                                  >
                                    <span>
                                      •{" "}
                                      <span className="font-semibold text-gray-800">
                                        {name}
                                      </span>
                                      :
                                    </span>
                                    <span className="font-bold text-purple-700">
                                      {qty} {unit}
                                    </span>
                                    {area > 0 && (
                                      <span className="text-gray-500 text-[11px]">
                                        ({area} {areaUnit})
                                      </span>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          )}

                          {/* Ảnh minh chứng */}
                          {log.images?.length > 0 && (
                            <Image.PreviewGroup
                              items={log.images
                                .map(img => typeof img === 'string' ? img : (img.url ?? null))
                                .filter(Boolean)}
                            >
                              <div className="flex flex-wrap gap-1.5 mt-2.5">
                                {log.images.map((img, i) => {
                                  const src = typeof img === 'string' ? img : (img.url ?? null)
                                  return (
                                    <div
                                      key={i}
                                      className="w-14 h-14 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden cursor-pointer hover:border-green-400 hover:shadow-md transition-all duration-200 [&_.ant-image]:!h-full [&_.ant-image]:!w-full [&_.ant-image-img]:!h-full [&_.ant-image-img]:!w-full [&_.ant-image-img]:!object-cover"
                                    >
                                      <Image
                                        src={src}
                                        alt={`Ảnh ${i + 1}`}
                                        preview={{
                                          src,
                                          mask: (
                                            <div className="flex items-center justify-center text-[10px] text-white">
                                              <EyeOutlined />
                                            </div>
                                          ),
                                        }}
                                      />
                                    </div>
                                  )
                                })}
                              </div>
                            </Image.PreviewGroup>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </Card>
          </div>
        </Col>
      </Row>

      <Modal
        open={submitModal}
        onCancel={() => {
          setSubmitModal(false)
          summaryForm.resetFields()
        }}
        title={
          <div className="flex items-center gap-2 text-green-700">
            {task.status === "WAITING_APPROVAL" ? (
              <FileTextOutlined />
            ) : (
              <SendOutlined />
            )}
            {task.status === "WAITING_APPROVAL"
              ? "Summary đã gửi"
              : "Tạo Summary & Gửi báo cáo hoàn thành"}
          </div>
        }
        onOk={
          task.status === "WAITING_APPROVAL"
            ? () => setSubmitModal(false)
            : handleSubmitSummary
        }
        okText={
          task.status === "WAITING_APPROVAL" ? "Đóng" : "Xác nhận gửi báo cáo"
        }
        cancelText="Hủy"
        confirmLoading={submitting}
        okButtonProps={{
          className:
            task.status === "WAITING_APPROVAL"
              ? ""
              : "bg-green-600 border-green-600",
          disabled: summaryLoading,
        }}
        width={780}
      >
        <Spin spinning={summaryLoading} tip="Đang tải tổng hợp...">
          <div className="py-1 space-y-5 text-sm">
            {/* ── Thống kê thời gian thực tế ── */}
            {(() => {
              // Lấy ngày bắt đầu thực tế
              const startDateStr =
                leaderSummary?.firstLogDate ||
                leaderSummary?.actualStartDate ||
                leaderSummary?.startDate ||
                task?.actualStartDate ||
                task?.startDate ||
                (dailyLogs.length > 0
                  ? dailyLogs[dailyLogs.length - 1]?.date
                  : null)
              // Lấy ngày kết thúc thực tế
              const endDateStr =
                leaderSummary?.lastLogDate ||
                leaderSummary?.actualEndDate ||
                leaderSummary?.completedAt ||
                leaderSummary?.endDate ||
                task?.actualEndDate ||
                task?.endDate ||
                (dailyLogs.length > 0 ? dailyLogs[0]?.date : null) ||
                getLocalNow().format("YYYY-MM-DD")

              const formattedStartDate = startDateStr
                ? parseDate(startDateStr).format("DD/MM/YYYY")
                : "—"
              const formattedEndDate = endDateStr
                ? parseDate(endDateStr).format("DD/MM/YYYY")
                : "—"

              return (
                <div className="p-4 border border-green-100 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50/40">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 font-semibold text-green-800">
                      <FileTextOutlined />
                      Thời gian thực hiện thực tế
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 border shadow-sm bg-white/80 rounded-xl border-green-200/60">
                    <CalendarOutlined className="text-2xl text-green-600 shrink-0" />
                    <div>
                      <div className="text-xs font-medium text-gray-500">
                        Thời gian thực tế (Ngày bắt đầu ➔ Ngày kết thúc)
                      </div>
                      <div className="text-base font-bold text-gray-800 tracking-wide mt-0.5">
                        <span className="text-green-700">
                          {formattedStartDate}
                        </span>
                        <span className="mx-2 text-gray-400">➔</span>
                        <span className="text-emerald-700">
                          {formattedEndDate}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })()}

            {/* ── Bảng phân bón ── */}
            {(() => {
              // Ưu tiên BE data; fallback về aggregation từ local dailyLogs
              const rows =
                leaderSummary?.fertilizers?.length > 0
                  ? leaderSummary.fertilizers.map((f, i) => ({
                      key: i,
                      name:
                        f.name ||
                        f.fertilizerName ||
                        f.materialName ||
                        `Phân ${i + 1}`,
                      totalQuantity: f.totalQuantity ?? f.quantity ?? 0,
                      unit: f.unit ?? "",
                      totalArea: f.totalArea ?? f.area ?? 0,
                      areaUnit: MEASUREMENT_UNITS.SQUARE_METER,
                      days: f.days ?? "—",
                    }))
                  : aggregateFromLogs.fertilizers.map((f, i) => ({
                      key: i,
                      name: f.name,
                      totalQuantity: f.totalQuantity,
                      unit: f.unit,
                      totalArea: f.totalArea,
                      areaUnit: f.areaUnit,
                      days: f.days,
                    }))

              const cols = [
                {
                  title: "Loại phân bón",
                  dataIndex: "name",
                  key: "name",
                  render: v => (
                    <span className="font-medium text-gray-800">{v}</span>
                  ),
                },
                {
                  title: "Tổng lượng",
                  key: "qty",
                  align: "right",
                  render: (_, r) => (
                    <span className="font-semibold text-blue-700">
                      {r.totalQuantity}{" "}
                      <span className="font-normal text-gray-500">
                        {r.unit}
                      </span>
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
                        {r.totalArea}{" "}
                        <span className="text-gray-500">{r.areaUnit}</span>
                      </span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    ),
                },
              ]

              return (
                <div>
                  <div className="flex items-center gap-2 mb-2 font-semibold text-blue-800">
                    <ExperimentOutlined className="text-blue-500" />
                    Phân bón đã sử dụng
                    {rows.length === 0 && (
                      <span className="text-xs font-normal text-gray-400">
                        (chưa có dữ liệu)
                      </span>
                    )}
                  </div>
                  <Table
                    columns={cols}
                    dataSource={rows}
                    size="small"
                    pagination={false}
                    scroll={rows.length > 3 ? { y: 180 } : undefined}
                    locale={{
                      emptyText: (
                        <div className="py-2 text-xs text-center text-gray-400">
                          Chưa ghi nhận phân bón nào
                        </div>
                      ),
                    }}
                    className="overflow-hidden border border-blue-100 rounded-xl"
                    rowClassName="hover:bg-blue-50/50"
                  />
                </div>
              )
            })()}

            {/* ── Bảng nông dược ── */}
            {(() => {
              const rows =
                leaderSummary?.pesticides?.length > 0
                  ? leaderSummary.pesticides.map((p, i) => ({
                      key: i,
                      name:
                        p.name ||
                        p.pesticideName ||
                        p.materialName ||
                        `Nông dược ${i + 1}`,
                      totalQuantity: p.totalQuantity ?? p.quantity ?? 0,
                      unit: p.unit ?? "",
                      totalArea: p.totalArea ?? p.area ?? 0,
                      areaUnit: MEASUREMENT_UNITS.SQUARE_METER,
                      days: p.days ?? "—",
                    }))
                  : aggregateFromLogs.pesticides.map((p, i) => ({
                      key: i,
                      name: p.name,
                      totalQuantity: p.totalQuantity,
                      unit: p.unit,
                      totalArea: p.totalArea,
                      areaUnit: p.areaUnit,
                      days: p.days,
                    }))

              const cols = [
                {
                  title: "Loại nông dược",
                  dataIndex: "name",
                  key: "name",
                  render: v => (
                    <span className="font-medium text-gray-800">{v}</span>
                  ),
                },
                {
                  title: "Tổng lượng",
                  key: "qty",
                  align: "right",
                  render: (_, r) => (
                    <span className="font-semibold text-purple-700">
                      {r.totalQuantity}{" "}
                      <span className="font-normal text-gray-500">
                        {r.unit}
                      </span>
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
                        {r.totalArea}{" "}
                        <span className="text-gray-500">{r.areaUnit}</span>
                      </span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    ),
                },
              ]

              return (
                <div>
                  <div className="flex items-center gap-2 mb-2 font-semibold text-purple-800">
                    <ExperimentOutlined className="text-purple-500" />
                    Nông dược đã sử dụng
                    {rows.length === 0 && (
                      <span className="text-xs font-normal text-gray-400">
                        (chưa có dữ liệu)
                      </span>
                    )}
                  </div>
                  <Table
                    columns={cols}
                    dataSource={rows}
                    size="small"
                    pagination={false}
                    scroll={rows.length > 3 ? { y: 160 } : undefined}
                    locale={{
                      emptyText: (
                        <div className="py-2 text-xs text-center text-gray-400">
                          Chưa ghi nhận nông dược nào
                        </div>
                      ),
                    }}
                    className="overflow-hidden border border-purple-100 rounded-xl"
                    rowClassName="hover:bg-purple-50/50"
                  />
                </div>
              )
            })()}

            {/* ── Ảnh minh chứng tổng hợp ── */}
            {(() => {
              const rawImages =
                leaderSummary?.images?.length > 0
                  ? leaderSummary.images
                  : dailyLogs.flatMap(log => log.images || [])

              const summaryImages = rawImages
                .map(img =>
                  typeof img === "string"
                    ? img
                    : img?.imageUrl || img?.url || img?.fileUrl,
                )
                .filter(Boolean)

              return (
                <div>
                  <div className="flex items-center gap-2 mb-2 font-semibold text-orange-700">
                    <PictureOutlined />
                    Ảnh minh chứng tổng hợp ({summaryImages.length} ảnh)
                  </div>
                  {summaryImages.length > 0 ? (
                    <Image.PreviewGroup>
                      <div className="flex flex-wrap gap-2">
                        {summaryImages.map((src, i) => (
                          <Tooltip key={i} title={`Ảnh ${i + 1}`}>
                            <div className="w-16 h-16 overflow-hidden transition-all border border-orange-200 cursor-pointer rounded-xl hover:border-orange-400 hover:shadow-md">
                              <Image
                                src={src}
                                alt={`Ảnh ${i + 1}`}
                                width="100%"
                                height="100%"
                                style={{
                                  objectFit: "cover",
                                  width: "100%",
                                  height: "100%",
                                }}
                              />
                            </div>
                          </Tooltip>
                        ))}
                      </div>
                    </Image.PreviewGroup>
                  ) : (
                    <div className="py-2.5 px-3 bg-gray-50/80 rounded-xl border border-dashed border-gray-200 text-xs text-gray-400 text-center">
                      Chưa có ảnh minh chứng nào từ nhật ký hàng ngày
                    </div>
                  )}
                </div>
              )
            })()}

            <Divider className="!my-2" />

            {/* ── Form mô tả tổng kết ── */}
            <Form form={summaryForm} layout="vertical">
              <Form.Item
                name="descriptionSummary"
                label={
                  <span className="font-semibold">
                    Mô tả tổng kết công việc{" "}
                    {task.status !== "WAITING_APPROVAL" && (
                      <span className="text-red-500">*</span>
                    )}
                  </span>
                }
                rules={
                  task.status !== "WAITING_APPROVAL"
                    ? [
                        {
                          required: true,
                          message: "Vui lòng viết mô tả tổng kết",
                        },
                      ]
                    : []
                }
              >
                <TextArea
                  rows={3}
                  placeholder="VD: Đã hoàn thành công việc phun nông dược theo kế hoạch, cây trồng phát triển tốt…"
                  disabled={task.status === "WAITING_APPROVAL"}
                />
              </Form.Item>
            </Form>
          </div>
        </Spin>
      </Modal>
    </div>
  )
}

export default DailyLog
