/**
 * Farm Leader: Ghi nhật ký hàng ngày cho công việc
 * Route: /farm-leader/tasks/:taskId/log  (ROUTER.FL_TASK_LOG)
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
  CheckCircleOutlined,
  DeleteOutlined,
  ExperimentOutlined,
  FileTextOutlined,
  FormOutlined,
  InboxOutlined,
  PictureOutlined,
  PlusOutlined,
  SendOutlined,
} from '@ant-design/icons'
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
} from 'antd'

import { useEffect, useMemo, useState } from 'react'

import { useNavigate, useParams } from 'react-router-dom'
import dayjs from 'dayjs'

import TitleCustom from 'src/components/TitleCustom'
import ROUTER from 'src/router/ROUTER'
import CultivationTaskService from 'src/services/CultivationTaskService'
import CultivationDailyLogService from 'src/services/CultivationDailyLogService'
import FertilizerService from 'src/services/FertilizerService'
import PesticideService from 'src/services/PesticideService'
import UploadService from 'src/services/UploadService'
import { canWriteDailyLog } from 'src/utils/cultivationStatus'
import { useCultivationStatus } from 'src/hooks/useCultivationStatus'
import { formatDate } from 'src/utils/dateFormatters'

const { Text } = Typography
const { TextArea } = Input
const { Dragger } = Upload

const FERTILIZER_QUANTITY_UNITS = ['kg', 'g', 'tấn', 'lít', 'ml', 'bao', 'can', 'gói', 'chai', 'bình', 'viên', 'hộp', 'túi', 'lọ']
const PESTICIDE_QUANTITY_UNITS = ['ml', 'lít', 'g', 'kg', 'chai', 'gói', 'can', 'bình', 'viên', 'hộp', 'túi', 'lọ']

const unwrap = (res) => res?.data?.data ?? res?.data ?? res

// usageUnit takes priority for both fertilizers and pesticides
const toFertilizerOptions = (list) =>
  (list || []).map((item) => {
    const unit = item.usageUnit || item.unit || item.quantityUnit || item.unitName || item.materialUnit || item.defaultUnit || item.measurementUnit || ''
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
const toPesticideOptions = (list) =>
  (list || []).map((item) => {
    // API returns: unit (kho) and usageUnit (su dung) - use usageUnit
    const unit = item.usageUnit || item.unit || item.quantityUnit || item.unitName || item.materialUnit || item.defaultUnit || item.measurementUnit || ''
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

const getUnitSelectOptions = (baseUnits, currentUnit) => {
  const list = [...baseUnits]
  if (currentUnit && !list.includes(currentUnit)) {
    list.unshift(currentUnit)
  }
  return list.map((u) => ({ value: u, label: u }))
}

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
    const fertMap = {}  // key: `${fertilizerId}|${unit}`
    const pestMap = {}  // key: `${pesticideId}|${unit}`

    for (const log of dailyLogs) {
      // --- fertilizers ---
      for (const f of (log.fertilizers || [])) {
        const id = f.fertilizerId || f.id || f.materialId
        const unit = f.unit || f.quantityUnit || 'kg'
        const areaUnit = f.areaUnit || 'ha'
        const key = `${id}|${unit}`
        const opt = fertilizerOptions.find(o => o.value === id)
        const name = f.name || opt?.name || f.materialName || id || 'Phân bón'
        if (!fertMap[key]) {
          fertMap[key] = { id, name, totalQuantity: 0, unit, totalArea: 0, areaUnit, days: 0 }
        }
        fertMap[key].totalQuantity += Number(f.quantity || 0)
        fertMap[key].totalArea += Number(f.area || 0)
        fertMap[key].days += 1
      }

      // --- pesticides ---
      for (const p of (log.pesticides || [])) {
        const id = p.pesticideId || p.id || p.materialId
        const unit = p.unit || p.quantityUnit || 'ml'
        const areaUnit = p.areaUnit || 'ha'
        const key = `${id}|${unit}`
        const opt = pesticideOptions.find(o => o.value === id)
        const name = p.name || opt?.name || p.materialName || id || 'Thuốc BVTV'
        if (!pestMap[key]) {
          pestMap[key] = { id, name, totalQuantity: 0, unit, totalArea: 0, areaUnit, days: 0 }
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
          FertilizerService.getSelection(),
          PesticideService.getSelection(),
        ])

        const taskData = unwrap(taskRes)
        if (!taskData?.id && !taskData?.name) {
          message.error('Không tìm thấy công việc.')
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
          toFertilizerOptions(Array.isArray(fertData) ? fertData : fertData?.items || [])
        )
        setPesticideOptions(
          toPesticideOptions(Array.isArray(pestData) ? pestData : pestData?.items || [])
        )

        form.setFieldsValue({
          date: dayjs(),
          fertilizers: [],
          pesticides: [],
        })
      } catch (error) {
        console.error(error)
        message.error('Không thể tải dữ liệu công việc.')
        navigate(ROUTER.FL_TASKS)
      } finally {
        setLoading(false)
      }
    }
    loadTaskData()
  }, [taskId, navigate, form, refreshKey])

  const mapFertilizers = (rows = []) =>
    rows.map((row) => ({
      fertilizerId: row.fertilizerId,
      materialId: row.materialId || row.fertilizerId,
      quantity: Number(row.quantity || 0),
      unit: row.quantityUnit || 'kg',
      quantityUnit: row.quantityUnit || 'kg',
      area: Number(row.area || 0),
      areaUnit: row.areaUnit || 'ha',
    }))

  const mapPesticides = (rows = []) =>
    rows.map((row) => ({
      pesticideId: row.pesticideId,
      materialId: row.materialId || row.pesticideId,
      quantity: Number(row.quantity || 0),
      unit: row.quantityUnit || 'ml',
      quantityUnit: row.quantityUnit || 'ml',
      area: Number(row.area || 0),
      areaUnit: row.areaUnit || 'ha',
    }))

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      setSaving(true)

      const imageUrls = fileList
        .map((file) => file.url || file.response?.url || file.response?.data?.url)
        .filter(Boolean)

      const payload = {
        taskId,
        date: values.date ? values.date.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
        description: values.description || '',
        fertilizers: mapFertilizers(values.fertilizers),
        pesticides: mapPesticides(values.pesticides),
        images: imageUrls.map((url) => ({ url })),
      }

      await CultivationDailyLogService.create(payload)

      message.success('Đã lưu nhật ký thành công!')
      // Reload current page to see the new log
      setRefreshKey(k => k + 1)
      form.resetFields()
      setFileList([])
    } catch (error) {
      console.error(error)
      if (error.errorFields) {
        message.warning('Vui lòng kiểm tra lại các trường nhập.')
      } else {
        message.error(error.message || 'Lưu nhật ký thất bại.')
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
      if (taskSumRes.status === 'fulfilled') {
        const summary = unwrap(taskSumRes.value)
        setLeaderSummary(summary)
        // Set description đã gửi vào form để hiển thị
        if (summary?.description) {
          summaryForm.setFieldsValue({ descriptionSummary: summary.description })
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
        completedAt: dayjs().format('YYYY-MM-DD'),
      })

      setSubmitModal(false)
      setRefreshKey(k => k + 1)
    } catch (error) {
      console.error(error)
      if (error.errorFields) {
        message.warning('Vui lòng nhập mô tả tổng kết trước khi gửi.')
      } else {
        message.error(error.message || 'Gửi báo cáo thất bại.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const customUpload = async ({ file, onSuccess, onError }) => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await UploadService.uploadImage(formData, {
        params: { folder: 'eapls/daily-logs' },
      })
      const data = unwrap(res)
      const url = data?.url || data?.fileUrl || data
      if (!url || typeof url !== 'string') {
        throw new Error('Upload không trả về url')
      }
      onSuccess({ url })
      setFileList((prev) => [
        ...prev.filter((f) => f.uid !== file.uid),
        {
          uid: file.uid,
          name: file.name,
          status: 'done',
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
    name: 'file',
    multiple: true,
    fileList,
    customRequest: customUpload,
    showUploadList: false,
    onRemove(file) {
      setFileList((prev) => prev.filter((item) => item.uid !== file.uid))
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
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(ROUTER.FL_TASKS)}
          className="mb-3 -ml-2 h-9 text-gray-600 hover:text-green-700"
        >
          Quay lại danh sách công việc
        </Button>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex-1">
            <TitleCustom className="!mb-0 text-xl md:text-2xl">{task.name}</TitleCustom>
            {task.description && (
              <div className="mt-2 text-sm text-gray-600">{task.description}</div>
            )}
            <div className="mt-2 flex flex-wrap gap-2">
              <Tag color={statusCfg.color}>{statusCfg.label}</Tag>
              {task.taskCatalogName && <Tag color="blue">{task.taskCatalogName}</Tag>}
            </div>
          </div>
          {task.status === 'WAITING_APPROVAL' ? (
            <Button
              type="default"
              icon={<FileTextOutlined />}
              onClick={openSummaryModal}
              className="h-10 px-5 font-semibold rounded-xl border-emerald-500 text-emerald-600 hover:!bg-emerald-50 shrink-0"
            >
              Xem lại Summary đã gửi
            </Button>
          ) : !isViewOnly && (
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={openSummaryModal}
              className="h-10 px-5 font-semibold rounded-xl bg-emerald-600 border-emerald-600 hover:!bg-emerald-700 hover:!border-emerald-700 shrink-0"
            >
              Hoàn thành & Gửi Summary
            </Button>
          )}
        </div>
      </div>

      {(task.cultivationLogbookName || task.cultivationStageName) && (
        <Card bordered={false} className="shadow-sm rounded-2xl border border-green-100 bg-green-50/40">
          <div className="grid gap-3 sm:grid-cols-2 text-sm">
            <div>
              <Text type="secondary" className="text-xs">Kế hoạch canh tác</Text>
              <div className="mt-1 font-semibold text-gray-800">{task.cultivationLogbookName || '—'}</div>
            </div>
            <div>
              <Text type="secondary" className="text-xs">Giai đoạn</Text>
              <div className="mt-1 font-semibold text-gray-800">{task.cultivationStageName || '—'}</div>
            </div>
          </div>
        </Card>
      )}

      {task.status === 'WAITING_APPROVAL' && (
        <Alert
          type="warning"
          showIcon
          message="Đã gửi summary — đang chờ Farm Supervisor biên soạn / duyệt."
          className="rounded-xl"
        />
      )}

      <Row gutter={24}>
        <Col xs={24} lg={14}>
          <Form form={form} layout="vertical" className="space-y-4" disabled={isViewOnly}>
            <Card bordered={false} className="shadow-sm rounded-2xl h-full" bodyStyle={{ padding: '20px' }}>
              <div className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FormOutlined className="text-green-600" />
                Nội dung thực hiện
              </div>
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item name="date" label="Ngày ghi nhận" rules={[{ required: true, message: 'Chọn ngày' }]}>
                    <DatePicker className="w-full" format="DD/MM/YYYY" disabled />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item name="description" label="Chi tiết công việc" rules={[{ required: true, message: 'Nhập mô tả' }]}>
                    <TextArea rows={3} placeholder="Mô tả tình hình cây trồng, vấn đề phát sinh..." disabled={isViewOnly} />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Card bordered={false} className="shadow-sm rounded-2xl" bodyStyle={{ padding: '20px' }}>
              <div className="text-base font-bold text-gray-800 mb-4">Phân bón</div>
              <Form.List name="fertilizers">
                {(fields, { add, remove }) => (
                  <div className="space-y-3">
                    {fields.map((field) => (
                      <div key={field.key} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-gray-700">Loại {field.name + 1}</span>
                          {!isViewOnly && (
                            <Button type="text" danger size="small" onClick={() => remove(field.name)} icon={<DeleteOutlined />} />
                          )}
                        </div>
                        <Row gutter={12}>
                          <Col xs={24} md={8}>
                            <Form.Item
                              {...field}
                              name={[field.name, 'fertilizerId']}
                              rules={[{ required: true, message: 'Chọn loại phân bón' }]}
                            >
                              <Select
                                showSearch
                                optionFilterProp="label"
                                placeholder="Chọn phân bón"
                                options={fertilizerOptions}
                                disabled={isViewOnly}
                                onChange={(value, option) => {
                                  const opt = option || fertilizerOptions.find((o) => o.value === value)
                                  const unitFromApi = opt?.unit || opt?.raw?.unit || opt?.raw?.usageUnit
                                  form.setFieldValue(['fertilizers', field.name, 'materialId'], opt?.materialId || value)
                                  if (unitFromApi) {
                                    form.setFieldValue(['fertilizers', field.name, 'quantityUnit'], unitFromApi)
                                  }
                                  if (!form.getFieldValue(['fertilizers', field.name, 'areaUnit'])) {
                                    form.setFieldValue(['fertilizers', field.name, 'areaUnit'], 'ha')
                                  }
                                }}
                              />
                            </Form.Item>
                            <Form.Item {...field} name={[field.name, 'materialId']} hidden>
                              <Input />
                            </Form.Item>
                          </Col>
                          <Col xs={12} md={5}>
                            <Form.Item {...field} name={[field.name, 'quantity']}>
                              <InputNumber min={0} className="w-full" placeholder="Lượng" disabled={isViewOnly} />
                            </Form.Item>
                          </Col>
                          <Col xs={12} md={3}>
                            <Form.Item
                              noStyle
                              shouldUpdate={(prev, cur) =>
                                prev.fertilizers?.[field.name]?.fertilizerId !==
                                cur.fertilizers?.[field.name]?.fertilizerId
                              }
                            >
                              {({ getFieldValue }) => {
                                const hasFertilizer = !!getFieldValue(['fertilizers', field.name, 'fertilizerId'])
                                const currentUnit = getFieldValue(['fertilizers', field.name, 'quantityUnit'])
                                return (
                                  <Form.Item {...field} name={[field.name, 'quantityUnit']} initialValue="kg">
                                    <Select
                                      options={getUnitSelectOptions(FERTILIZER_QUANTITY_UNITS, currentUnit)}
                                      disabled={isViewOnly || hasFertilizer}
                                    />
                                  </Form.Item>
                                )
                              }}
                            </Form.Item>
                          </Col>
                          <Col xs={12} md={5}>
                            <Form.Item {...field} name={[field.name, 'area']}>
                              <InputNumber min={0} className="w-full" placeholder="Diện tích" disabled={isViewOnly} />
                            </Form.Item>
                          </Col>
                          <Col xs={12} md={3}>
                            <Form.Item {...field} name={[field.name, 'areaUnit']} initialValue="ha">
                              <Select
                                options={[{ value: 'ha', label: 'ha' }]}
                                disabled
                                className="[&_.ant-select-selector]:bg-slate-50 [&_.ant-select-selector]:!cursor-default"
                              />
                            </Form.Item>
                          </Col>
                        </Row>
                      </div>
                    ))}
                    {!isViewOnly && (
                      <Button type="dashed" onClick={() => add({ areaUnit: 'ha' })} icon={<PlusOutlined />} className="w-full text-green-700 border-green-300">
                        Thêm phân bón
                      </Button>
                    )}
                  </div>
                )}
              </Form.List>
            </Card>

            <Card bordered={false} className="shadow-sm rounded-2xl" bodyStyle={{ padding: '20px' }}>
              <div className="text-base font-bold text-gray-800 mb-4">Thuốc bảo vệ thực vật</div>
              <Form.List name="pesticides">
                {(fields, { add, remove }) => (
                  <div className="space-y-3">
                    {fields.map((field) => (
                      <div key={field.key} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-gray-700">Loại {field.name + 1}</span>
                          {!isViewOnly && (
                            <Button type="text" danger size="small" onClick={() => remove(field.name)} icon={<DeleteOutlined />} />
                          )}
                        </div>
                        <Row gutter={12}>
                          <Col xs={24} md={8}>
                            <Form.Item
                              {...field}
                              name={[field.name, 'pesticideId']}
                              rules={[{ required: true, message: 'Chọn loại thuốc' }]}
                            >
                              <Select
                                showSearch
                                optionFilterProp="label"
                                placeholder="Chọn thuốc BVTV"
                                options={pesticideOptions}
                                disabled={isViewOnly}
                                onChange={(value, option) => {
                                  const opt = option || pesticideOptions.find((o) => o.value === value)
                                  // usageUnit takes priority for pesticides
                                  const unitFromApi = opt?.usageUnit || opt?.raw?.usageUnit || opt?.unit || opt?.raw?.unit
                                  form.setFieldValue(['pesticides', field.name, 'materialId'], opt?.materialId || value)
                                  if (unitFromApi) {
                                    form.setFieldValue(['pesticides', field.name, 'quantityUnit'], unitFromApi)
                                  }
                                  if (!form.getFieldValue(['pesticides', field.name, 'areaUnit'])) {
                                    form.setFieldValue(['pesticides', field.name, 'areaUnit'], 'ha')
                                  }
                                }}
                              />
                            </Form.Item>
                            <Form.Item {...field} name={[field.name, 'materialId']} hidden>
                              <Input />
                            </Form.Item>
                          </Col>
                          <Col xs={12} md={5}>
                            <Form.Item {...field} name={[field.name, 'quantity']}>
                              <InputNumber min={0} className="w-full" placeholder="Lượng" disabled={isViewOnly} />
                            </Form.Item>
                          </Col>
                          <Col xs={12} md={3}>
                            <Form.Item
                              noStyle
                              shouldUpdate={(prev, cur) =>
                                prev.pesticides?.[field.name]?.pesticideId !==
                                cur.pesticides?.[field.name]?.pesticideId
                              }
                            >
                              {({ getFieldValue }) => {
                                const hasPesticide = !!getFieldValue(['pesticides', field.name, 'pesticideId'])
                                const currentUnit = getFieldValue(['pesticides', field.name, 'quantityUnit'])
                                return (
                                  <Form.Item {...field} name={[field.name, 'quantityUnit']} initialValue="ml">
                                    <Select
                                      options={getUnitSelectOptions(PESTICIDE_QUANTITY_UNITS, currentUnit)}
                                      disabled={isViewOnly || hasPesticide}
                                    />
                                  </Form.Item>
                                )
                              }}
                            </Form.Item>
                          </Col>
                          <Col xs={12} md={5}>
                            <Form.Item {...field} name={[field.name, 'area']}>
                              <InputNumber min={0} className="w-full" placeholder="Diện tích" disabled={isViewOnly} />
                            </Form.Item>
                          </Col>
                          <Col xs={12} md={3}>
                            <Form.Item {...field} name={[field.name, 'areaUnit']} initialValue="ha">
                              <Select
                                options={[{ value: 'ha', label: 'ha' }]}
                                disabled
                                className="[&_.ant-select-selector]:bg-slate-50 [&_.ant-select-selector]:!cursor-default"
                              />
                            </Form.Item>
                          </Col>
                        </Row>
                      </div>
                    ))}
                    {!isViewOnly && (
                      <Button type="dashed" onClick={() => add({ areaUnit: 'ha' })} icon={<PlusOutlined />} className="w-full text-green-700 border-green-300">
                        Thêm thuốc BVTV
                      </Button>
                    )}
                  </div>
                )}
              </Form.List>
            </Card>

            <Card bordered={false} className="shadow-sm rounded-2xl" bodyStyle={{ padding: '20px' }}>
              <div className="text-base font-bold text-gray-800 mb-4">Ảnh minh chứng</div>
              {!isViewOnly && (
                <Dragger {...uploadProps} className="rounded-xl">
                  <div className="p-4">
                    <InboxOutlined className="text-3xl text-green-500 mb-2" />
                    <p className="text-sm text-gray-500">Kéo thả ảnh hoặc click để chọn</p>
                  </div>
                </Dragger>
              )}
              {fileList.length > 0 && (
                <Image.PreviewGroup>
                  <div className="mt-3 grid grid-cols-4 md:grid-cols-5 gap-2">
                    {fileList.map((file) => (
                      <div key={file.uid} className="relative rounded-lg overflow-hidden aspect-square">
                        <Image
                          src={file.url}
                          className="!object-cover"
                          width="100%"
                          height="100%"
                          style={{ objectFit: 'cover' }}
                        />
                        {!isViewOnly && (
                          <Button
                            type="text"
                            icon={<DeleteOutlined />}
                            onClick={() => setFileList((prev) => prev.filter((item) => item.uid !== file.uid))}
                            className="absolute top-1 right-1 bg-white/80 rounded-full text-red-500 z-10"
                            size="small"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </Image.PreviewGroup>
              )}
            </Card>

            {!isViewOnly && (
              <div className="flex flex-wrap gap-3 justify-end pt-2 pb-6">
                <Button onClick={() => navigate(ROUTER.FL_TASKS)} className="h-10 px-6 font-semibold rounded-xl">
                  Hủy
                </Button>
                <Button type="primary" onClick={handleSave} loading={saving} className="h-10 px-6 font-semibold bg-green-600 rounded-xl">
                  Lưu nhật ký
                </Button>
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  onClick={openSummaryModal}
                  className="h-10 px-5 font-semibold rounded-xl bg-emerald-600 border-emerald-600 hover:!bg-emerald-700 hover:!border-emerald-700"
                >
                  Hoàn thành & Gửi Summary
                </Button>
              </div>
            )}
            {/* Hiển thị nút xem summary đã gửi khi đang chờ duyệt */}
            {task.status === 'WAITING_APPROVAL' && (
              <div className="flex flex-wrap gap-3 justify-end pt-2 pb-6">
                <Button
                  type="default"
                  icon={<FileTextOutlined />}
                  onClick={openSummaryModal}
                  className="h-10 px-5 font-semibold rounded-xl border-emerald-500 text-emerald-600 hover:!bg-emerald-50"
                >
                  Xem lại Summary đã gửi
                </Button>
              </div>
            )}
          </Form>
        </Col>

        <Col xs={24} lg={10}>
          <div className="sticky top-20 space-y-4">
            <Card bordered={false} className="shadow-sm rounded-2xl" bodyStyle={{ padding: '20px' }}>
              <div className="text-base font-bold text-gray-800 mb-4 flex items-center justify-between">
                <span>Lịch sử ghi chép</span>
                <Tag color="blue" className="rounded-full">{dailyLogs.length} bản ghi</Tag>
              </div>

              {dailyLogs.length === 0 ? (
                <Empty description="Chưa có bản ghi nào" className="my-8" />
              ) : (
                <div className="relative max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {dailyLogs.map((log, index) => {
                    const isLast = index === dailyLogs.length - 1
                    return (
                      <div key={log.id || index} className="relative flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="relative z-10 flex h-3 w-3 flex-shrink-0 rounded-full bg-green-500 mt-1.5" />
                          {!isLast && <div className="w-0 flex-1 border-l-2 border-gray-200 my-1" />}
                        </div>
                        <div className={`flex-1 ${!isLast ? 'pb-5' : 'pb-2'}`}>
                          <div className="flex items-center justify-between mb-1">
                            <Tag color="green" className="rounded-full font-medium m-0">
                              {formatDate(log.date)}
                            </Tag>
                          </div>
                          <p className="text-sm m-0 mt-2 text-gray-700">{log.description}</p>

                          {log.fertilizers?.length > 0 && (
                            <div className="mt-2 bg-green-50/50 rounded-lg p-2 border border-green-100">
                              {log.fertilizers.map((f, i) => {
                                const opt = fertilizerOptions.find(o => o.value === f.id)
                                return (
                                  <div key={i} className="text-xs text-gray-600">
                                    • {opt?.name || 'Phân bón'}: <span className="font-semibold">{f.quantity}</span>
                                  </div>
                                )
                              })}
                            </div>
                          )}

                          {log.images?.length > 0 && (
                            <Image.PreviewGroup
                              items={log.images.map(img => img.imageUrl || img.url).filter(Boolean)}
                            >
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {log.images.map((img, i) => {
                                  const src = img.imageUrl || img.url
                                  return (
                                    <div
                                      key={i}
                                      className="w-14 h-14 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden cursor-pointer hover:border-green-400 hover:shadow-md transition-all duration-200"
                                    >
                                      <Image
                                        src={src}
                                        alt={`Ảnh ${i + 1}`}
                                        width={56}
                                        height={56}
                                        style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                                        preview={{
                                          src,
                                          mask: <div className="text-[10px] text-white">Xem</div>,
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
            {task.status === 'WAITING_APPROVAL' ? <FileTextOutlined /> : <SendOutlined />}
            {task.status === 'WAITING_APPROVAL' ? 'Summary đã gửi' : 'Tạo Summary & Gửi báo cáo hoàn thành'}
          </div>
        }
        onOk={task.status === 'WAITING_APPROVAL' ? () => setSubmitModal(false) : handleSubmitSummary}
        okText={task.status === 'WAITING_APPROVAL' ? 'Đóng' : 'Xác nhận gửi báo cáo'}
        cancelText="Hủy"
        confirmLoading={submitting}
        okButtonProps={{ className: task.status === 'WAITING_APPROVAL' ? '' : 'bg-green-600 border-green-600', disabled: summaryLoading }}
        width={780}
      >
        <Spin spinning={summaryLoading} tip="Đang tải tổng hợp...">
          <div className="space-y-5 text-sm py-1">

            {/* ── Thống kê thời gian thực tế ── */}
            {(() => {
              const isLocal = !leaderSummary
              // Lấy ngày bắt đầu thực tế
              const startDateStr = leaderSummary?.actualStartDate || leaderSummary?.startDate || task?.actualStartDate || task?.startDate || (dailyLogs.length > 0 ? dailyLogs[dailyLogs.length - 1]?.date : null)
              // Lấy ngày kết thúc thực tế
              const endDateStr = leaderSummary?.actualEndDate || leaderSummary?.completedAt || leaderSummary?.endDate || task?.actualEndDate || task?.endDate || (dailyLogs.length > 0 ? dailyLogs[0]?.date : null) || dayjs().format('YYYY-MM-DD')

              const formattedStartDate = startDateStr ? dayjs(startDateStr).format('DD/MM/YYYY') : '—'
              const formattedEndDate = endDateStr ? dayjs(endDateStr).format('DD/MM/YYYY') : '—'

              return (
                <div className="rounded-2xl border border-green-100 bg-gradient-to-br from-green-50 to-emerald-50/40 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 font-semibold text-green-800">
                      <FileTextOutlined />
                      Thời gian thực hiện thực tế
                    </div>
                    <Tag color={isLocal ? 'orange' : 'green'} className="rounded-full text-xs">
                      {isLocal ? 'Tạm tính từ nhật ký' : '✓ Dữ liệu từ Server'}
                    </Tag>
                  </div>
                  <div className="flex items-center gap-3 bg-white/80 rounded-xl p-3 border border-green-200/60 shadow-sm">
                    <CalendarOutlined className="text-2xl text-green-600 shrink-0" />
                    <div>
                      <div className="text-xs text-gray-500 font-medium">Thời gian thực tế (Ngày bắt đầu ➔ Ngày kết thúc)</div>
                      <div className="text-base font-bold text-gray-800 tracking-wide mt-0.5">
                        <span className="text-green-700">{formattedStartDate}</span>
                        <span className="mx-2 text-gray-400">➔</span>
                        <span className="text-emerald-700">{formattedEndDate}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })()}

            {/* ── Bảng phân bón ── */}
            {(() => {
              // Ưu tiên BE data; fallback về aggregation từ local dailyLogs
              const rows = leaderSummary?.fertilizers?.length > 0
                ? leaderSummary.fertilizers.map((f, i) => ({
                  key: i,
                  name: f.name || f.fertilizerName || f.materialName || `Phân ${i + 1}`,
                  totalQuantity: f.totalQuantity ?? f.quantity ?? 0,
                  unit: f.unit ?? '',
                  totalArea: f.totalArea ?? f.area ?? 0,
                  areaUnit: f.areaUnit ?? 'ha',
                  days: f.days ?? '—',
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
                  title: 'Loại phân bón', dataIndex: 'name', key: 'name',
                  render: v => <span className="font-medium text-gray-800">{v}</span>
                },
                {
                  title: 'Tổng lượng', key: 'qty', align: 'right',
                  render: (_, r) => <span className="font-semibold text-blue-700">{r.totalQuantity} <span className="font-normal text-gray-500">{r.unit}</span></span>
                },
                {
                  title: 'Diện tích', key: 'area', align: 'right',
                  render: (_, r) => r.totalArea > 0
                    ? <span>{r.totalArea} <span className="text-gray-500">{r.areaUnit}</span></span>
                    : <span className="text-gray-300">—</span>
                },

              ]

              return (
                <div>
                  <div className="flex items-center gap-2 font-semibold text-blue-800 mb-2">
                    <ExperimentOutlined className="text-blue-500" />
                    Phân bón đã sử dụng
                    {rows.length === 0 && <span className="font-normal text-gray-400 text-xs">(chưa có dữ liệu)</span>}
                  </div>
                  <Table
                    columns={cols}
                    dataSource={rows}
                    size="small"
                    pagination={false}
                    scroll={rows.length > 3 ? { y: 180 } : undefined}
                    locale={{ emptyText: <div className="py-2 text-xs text-gray-400 text-center">Chưa ghi nhận phân bón nào</div> }}
                    className="rounded-xl overflow-hidden border border-blue-100"
                    rowClassName="hover:bg-blue-50/50"
                  />
                </div>
              )
            })()}

            {/* ── Bảng thuốc BVTV ── */}
            {(() => {
              const rows = leaderSummary?.pesticides?.length > 0
                ? leaderSummary.pesticides.map((p, i) => ({
                  key: i,
                  name: p.name || p.pesticideName || p.materialName || `Thuốc ${i + 1}`,
                  totalQuantity: p.totalQuantity ?? p.quantity ?? 0,
                  unit: p.unit ?? '',
                  totalArea: p.totalArea ?? p.area ?? 0,
                  areaUnit: p.areaUnit ?? 'ha',
                  days: p.days ?? '—',
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
                  title: 'Loại thuốc BVTV', dataIndex: 'name', key: 'name',
                  render: v => <span className="font-medium text-gray-800">{v}</span>
                },
                {
                  title: 'Tổng lượng', key: 'qty', align: 'right',
                  render: (_, r) => <span className="font-semibold text-purple-700">{r.totalQuantity} <span className="font-normal text-gray-500">{r.unit}</span></span>
                },
                {
                  title: 'Diện tích', key: 'area', align: 'right',
                  render: (_, r) => r.totalArea > 0
                    ? <span>{r.totalArea} <span className="text-gray-500">{r.areaUnit}</span></span>
                    : <span className="text-gray-300">—</span>
                },

              ]

              return (
                <div>
                  <div className="flex items-center gap-2 font-semibold text-purple-800 mb-2">
                    <ExperimentOutlined className="text-purple-500" />
                    Thuốc bảo vệ thực vật đã sử dụng
                    {rows.length === 0 && <span className="font-normal text-gray-400 text-xs">(chưa có dữ liệu)</span>}
                  </div>
                  <Table
                    columns={cols}
                    dataSource={rows}
                    size="small"
                    pagination={false}
                    scroll={rows.length > 3 ? { y: 160 } : undefined}
                    locale={{ emptyText: <div className="py-2 text-xs text-gray-400 text-center">Chưa ghi nhận thuốc BVTV nào</div> }}
                    className="rounded-xl overflow-hidden border border-purple-100"
                    rowClassName="hover:bg-purple-50/50"
                  />
                </div>
              )
            })()}

            {/* ── Ảnh minh chứng tổng hợp ── */}
            {(() => {
              const rawImages = leaderSummary?.images?.length > 0
                ? leaderSummary.images
                : dailyLogs.flatMap(log => log.images || [])

              const summaryImages = rawImages
                .map(img => (typeof img === 'string' ? img : (img?.imageUrl || img?.url || img?.fileUrl)))
                .filter(Boolean)

              return (
                <div>
                  <div className="flex items-center gap-2 font-semibold text-orange-700 mb-2">
                    <PictureOutlined />
                    Ảnh minh chứng tổng hợp ({summaryImages.length} ảnh)
                  </div>
                  {summaryImages.length > 0 ? (
                    <Image.PreviewGroup>
                      <div className="flex flex-wrap gap-2">
                        {summaryImages.map((src, i) => (
                          <Tooltip key={i} title={`Ảnh ${i + 1}`}>
                            <div className="w-16 h-16 rounded-xl overflow-hidden border border-orange-200 cursor-pointer hover:border-orange-400 hover:shadow-md transition-all">
                              <Image
                                src={src}
                                alt={`Ảnh ${i + 1}`}
                                width="100%"
                                height="100%"
                                style={{ objectFit: 'cover', width: '100%', height: '100%' }}
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
                label={<span className="font-semibold">
                  Mô tả tổng kết công việc {task.status !== 'WAITING_APPROVAL' && <span className="text-red-500">*</span>}
                </span>}
                rules={task.status !== 'WAITING_APPROVAL' ? [{ required: true, message: 'Vui lòng viết mô tả tổng kết' }] : []}
              >
                <TextArea
                  rows={3}
                  placeholder="VD: Đã hoàn thành công việc phun thuốc theo kế hoạch, cây trồng phát triển tốt..."
                  disabled={task.status === 'WAITING_APPROVAL'}
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
