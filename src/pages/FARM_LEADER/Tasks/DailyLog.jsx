/**
 * Farm Leader: Ghi nhật ký hàng ngày cho công việc
 * Route: /farm-leader/tasks/:taskId/log  (ROUTER.FL_TASK_LOG)
 *
 * API:
 *   GET  /cultivation-tasks/{id}
 *   GET  /cultivation-daily-logs/task/{taskId}
 *   GET  /fertilizers/selection
 *   GET  /pesticides/selection
 *   POST /v1/media/upload
 *   POST /cultivation-daily-logs
 *   GET  /cultivation-tasks/{id}/leader-summary
 *   POST /cultivation-tasks/{id}/summary
 */
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  EnvironmentOutlined,
  FormOutlined,
  InboxOutlined,
  PlusOutlined,
  SendOutlined,
} from '@ant-design/icons'
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
  Modal,
  Row,
  Select,
  Spin,
  Tag,
  Typography,
  Upload,
} from 'antd'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import dayjs from 'dayjs'

import TitleCustom from 'src/components/TitleCustom'
import ROUTER from 'src/router/ROUTER'
import CultivationTaskService from 'src/services/CultivationTaskService'
import CultivationDailyLogService from 'src/services/CultivationDailyLogService'
import CultivationLogbookService from 'src/services/CultivationLogbookService'
import FertilizerService from 'src/services/FertilizerService'
import PesticideService from 'src/services/PesticideService'
import UploadService from 'src/services/UploadService'
import { canWriteDailyLog, getTaskStatus } from 'src/utils/cultivationStatus'
import { formatDate } from 'src/utils/dateFormatters'

const { Text } = Typography
const { TextArea } = Input
const { Dragger } = Upload

const FERTILIZER_QUANTITY_UNITS = ['g', 'kg', 'tấn', 'lít', 'ml']
const PESTICIDE_QUANTITY_UNITS = ['g', 'kg', 'lít', 'ml']
const AREA_UNITS = ['m²', 'ha', 'sào']

const unwrap = (res) => res?.data?.data ?? res?.data ?? res

const toOptions = (list) =>
  (list || []).map((item) => ({
    value: item.id,
    label: item.name,
    materialId: item.materialId,
    name: item.name,
    unit: item.unit || item.usageUnit,
  }))

const DailyLog = () => {
  const { taskId } = useParams()
  const navigate = useNavigate()
  const [task, setTask] = useState(null)
  const [logbook, setLogbook] = useState(null)
  const [dailyLogs, setDailyLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [form] = Form.useForm()
  const [summaryForm] = Form.useForm()
  const [saving, setSaving] = useState(false)
  const [submitModal, setSubmitModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [fileList, setFileList] = useState([])
  const [fertilizerOptions, setFertilizerOptions] = useState([])
  const [pesticideOptions, setPesticideOptions] = useState([])
  const [leaderSummary, setLeaderSummary] = useState(null)

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

        if (taskData.cultivationLogbookId) {
          try {
            const lbRes = await CultivationLogbookService.getById(taskData.cultivationLogbookId)
            const lb = unwrap(lbRes)
            setLogbook({
              logbookName: lb?.logbookName,
              landPlotName: lb?.landPlotName,
              cropName: lb?.cropName,
              status: lb?.status,
            })
          } catch {
            setLogbook(null)
          }
        } else {
          setLogbook(null)
        }

        const logsData = unwrap(logsRes)
        const logsList = Array.isArray(logsData)
          ? logsData
          : logsData?.items || []
        setDailyLogs(logsList)

        const fertData = unwrap(fertRes)
        const pestData = unwrap(pestRes)
        setFertilizerOptions(
          toOptions(Array.isArray(fertData) ? fertData : fertData?.items || [])
        )
        setPesticideOptions(
          toOptions(Array.isArray(pestData) ? pestData : pestData?.items || [])
        )

        form.setFieldsValue({
          date: dayjs(),
          progress: taskData.progress ?? 0,
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
  }, [taskId, navigate, form])

  const mapFertilizers = (rows = []) =>
    rows.map((row) => ({
      id: row.fertilizerId,
      quantity: row.quantity,
      area: row.area,
    }))

  const mapPesticides = (rows = []) =>
    rows.map((row) => ({
      id: row.pesticideId,
      quantity: row.quantity,
      area: row.area,
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
        progress: values.progress ?? 0,
        description: values.description || '',
        fertilizers: mapFertilizers(values.fertilizers),
        pesticides: mapPesticides(values.pesticides),
        images: imageUrls.map((url) => ({ url })),
      }

      await CultivationDailyLogService.create(payload)

      if (values.progress >= 100) {
        await openSummaryModal()
      } else {
        message.success('Đã lưu nhật ký thành công!')
        navigate(ROUTER.FL_TASKS)
      }
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
    try {
      const res = await CultivationTaskService.getLeaderSummary(taskId)
      setLeaderSummary(unwrap(res))
    } catch (e) {
      console.error(e)
      setLeaderSummary(null)
    }
    setSubmitModal(true)
  }

  const handleSubmitSummary = async () => {
    try {
      setSubmitting(true)
      const summaryValues = await summaryForm.validateFields()

      await CultivationTaskService.submitSummary(taskId, {
        descriptionSummary: summaryValues.descriptionSummary,
        completedAt: dayjs().format('YYYY-MM-DD'),
      })

      message.success('Đã hoàn thành công việc và gửi báo cáo lên Farm Supervisor!')
      setSubmitModal(false)
      navigate(ROUTER.FL_TASKS)
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
      message.success(`${file.name} tải lên thành công.`)
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
        </div>
      </div>

      {(logbook?.logbookName || logbook?.landPlotName || logbook?.cropName) && (
        <Card bordered={false} className="shadow-sm rounded-2xl border border-green-100 bg-green-50/40">
          <div className="grid gap-3 sm:grid-cols-3 text-sm">
            <div>
              <Text type="secondary" className="text-xs">Kế hoạch</Text>
              <div className="mt-1 font-semibold text-gray-800">{logbook.logbookName || '—'}</div>
            </div>
            <div>
              <Text type="secondary" className="text-xs">
                <EnvironmentOutlined className="mr-1" />
                Vùng trồng
              </Text>
              <div className="mt-1 font-semibold text-gray-800">{logbook.landPlotName || '—'}</div>
            </div>
            <div>
              <Text type="secondary" className="text-xs">Cây trồng</Text>
              <div className="mt-1 font-semibold text-gray-800">{logbook.cropName || '—'}</div>
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
                    <DatePicker className="w-full" format="DD/MM/YYYY" disabled={isViewOnly} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="progress" label="Tiến độ (%)" rules={[{ required: true, message: 'Nhập tiến độ' }]}>
                    <InputNumber min={0} max={100} className="w-full" disabled={isViewOnly} />
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
                                onChange={(value) => {
                                  const opt = fertilizerOptions.find((o) => o.value === value)
                                  const list = form.getFieldValue('fertilizers') || []
                                  list[field.name] = {
                                    ...list[field.name],
                                    fertilizerId: value,
                                    materialId: opt?.materialId,
                                  }
                                  form.setFieldsValue({ fertilizers: list })
                                }}
                              />
                            </Form.Item>
                            <Form.Item {...field} name={[field.name, 'materialId']} hidden>
                              <Input />
                            </Form.Item>
                          </Col>
                          <Col xs={12} md={5}>
                            <Form.Item {...field} name={[field.name, 'quantity']} rules={[{ required: true }]}>
                              <InputNumber min={0} className="w-full" placeholder="Lượng" disabled={isViewOnly} />
                            </Form.Item>
                          </Col>
                          <Col xs={12} md={3}>
                            <Form.Item {...field} name={[field.name, 'quantityUnit']} rules={[{ required: true }]} initialValue="g">
                              <Select options={FERTILIZER_QUANTITY_UNITS.map((u) => ({ value: u, label: u }))} disabled={isViewOnly} />
                            </Form.Item>
                          </Col>
                          <Col xs={12} md={5}>
                            <Form.Item {...field} name={[field.name, 'area']} rules={[{ required: true }]}>
                              <InputNumber min={0} className="w-full" placeholder="Diện tích" disabled={isViewOnly} />
                            </Form.Item>
                          </Col>
                          <Col xs={12} md={3}>
                            <Form.Item {...field} name={[field.name, 'areaUnit']} rules={[{ required: true }]} initialValue="ha">
                              <Select options={AREA_UNITS.map((u) => ({ value: u, label: u }))} disabled={isViewOnly} />
                            </Form.Item>
                          </Col>
                        </Row>
                      </div>
                    ))}
                    {!isViewOnly && (
                      <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} className="w-full text-green-700 border-green-300">
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
                                onChange={(value) => {
                                  const opt = pesticideOptions.find((o) => o.value === value)
                                  const list = form.getFieldValue('pesticides') || []
                                  list[field.name] = {
                                    ...list[field.name],
                                    pesticideId: value,
                                    materialId: opt?.materialId,
                                  }
                                  form.setFieldsValue({ pesticides: list })
                                }}
                              />
                            </Form.Item>
                            <Form.Item {...field} name={[field.name, 'materialId']} hidden>
                              <Input />
                            </Form.Item>
                          </Col>
                          <Col xs={12} md={5}>
                            <Form.Item {...field} name={[field.name, 'quantity']} rules={[{ required: true }]}>
                              <InputNumber min={0} className="w-full" placeholder="Lượng" disabled={isViewOnly} />
                            </Form.Item>
                          </Col>
                          <Col xs={12} md={3}>
                            <Form.Item {...field} name={[field.name, 'quantityUnit']} rules={[{ required: true }]} initialValue="ml">
                              <Select options={PESTICIDE_QUANTITY_UNITS.map((u) => ({ value: u, label: u }))} disabled={isViewOnly} />
                            </Form.Item>
                          </Col>
                          <Col xs={12} md={5}>
                            <Form.Item {...field} name={[field.name, 'area']} rules={[{ required: true }]}>
                              <InputNumber min={0} className="w-full" placeholder="Diện tích" disabled={isViewOnly} />
                            </Form.Item>
                          </Col>
                          <Col xs={12} md={3}>
                            <Form.Item {...field} name={[field.name, 'areaUnit']} rules={[{ required: true }]} initialValue="ha">
                              <Select options={AREA_UNITS.map((u) => ({ value: u, label: u }))} disabled={isViewOnly} />
                            </Form.Item>
                          </Col>
                        </Row>
                      </div>
                    ))}
                    {!isViewOnly && (
                      <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} className="w-full text-green-700 border-green-300">
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
                <div className="mt-3 grid grid-cols-4 md:grid-cols-5 gap-2">
                  {fileList.map((file) => (
                    <div key={file.uid} className="relative rounded-lg overflow-hidden aspect-square">
                      <Image src={file.url} className="object-cover" width="100%" height="100%" />
                      {!isViewOnly && (
                        <Button
                          type="text"
                          icon={<DeleteOutlined />}
                          onClick={() => setFileList((prev) => prev.filter((item) => item.uid !== file.uid))}
                          className="absolute top-1 right-1 bg-white/80 rounded-full text-red-500"
                          size="small"
                        />
                      )}
                    </div>
                  ))}
                </div>
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
                            <Text type="secondary" className="text-xs">Tiến độ: {log.progress}%</Text>
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
                            <div className="flex flex-wrap gap-2 mt-2">
                              {log.images.map((img, i) => (
                                <div key={i} className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden">
                                  <img src={img.imageUrl || img.url} alt={`Ảnh ${i + 1}`} className="w-full h-full object-cover" />
                                </div>
                              ))}
                            </div>
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
            <SendOutlined />
            Tạo Summary & Gửi báo cáo hoàn thành
          </div>
        }
        onOk={handleSubmitSummary}
        okText="Xác nhận gửi báo cáo"
        cancelText="Hủy"
        confirmLoading={submitting}
        okButtonProps={{ className: 'bg-green-600' }}
        width={640}
      >
        <div className="space-y-4 text-sm">
          <Alert
            message="Xác nhận hoàn thành công việc"
            description="Hệ thống sẽ tự động tổng hợp số liệu từ daily logs và gom ảnh. Bạn chỉ gửi mô tả tổng kết và ngày hoàn thành."
            type="success"
            showIcon
            className="rounded-xl"
          />
          {leaderSummary && (
            <div className="rounded-xl bg-gray-50 border border-gray-200 p-3 text-xs text-gray-600">
              Preview summary đã sẵn sàng từ Backend (leader-summary).
            </div>
          )}
          <Form form={summaryForm} layout="vertical">
            <Form.Item
              name="descriptionSummary"
              label="Mô tả tổng kết công việc"
              rules={[{ required: true, message: 'Vui lòng viết mô tả tổng kết' }]}
            >
              <TextArea rows={4} placeholder="VD: Đã hoàn thành công việc theo kế hoạch..." />
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </div>
  )
}

export default DailyLog
