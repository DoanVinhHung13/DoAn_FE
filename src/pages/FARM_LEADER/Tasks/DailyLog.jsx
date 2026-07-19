/**
 * Farm Leader: Ghi nhật ký hàng ngày cho công việc
 * Route: /farm-leader/tasks/:taskId/log  (ROUTER.FL_TASK_LOG)
 */
import {
  ArrowLeftOutlined,
  BookOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloudUploadOutlined,
  DeleteOutlined,
  EditOutlined,
  EnvironmentOutlined,
  ExclamationCircleOutlined,
  FileOutlined,
  FileTextOutlined,
  InboxOutlined,
  PlusOutlined,
  SaveOutlined,
  SendOutlined,
  UserOutlined,
  FormOutlined
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
  Progress,
  Row,
  Select,
  Space,
  Spin,
  Steps,
  Tag,
  Typography,
  Upload,
} from 'antd'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import dayjs from 'dayjs'

import TitleCustom from 'src/components/TitleCustom'
import ROUTER from 'src/router/ROUTER'
import { formatDate } from 'src/utils/dateFormatters'
import {
  AREA_UNITS,
  FakeCultivationService,
  FERTILIZER_QUANTITY_UNITS,
  getMockDailyLogsByTask,
  getMockTask,
  MOCK_FERTILIZER_OPTIONS,
  MOCK_PESTICIDE_OPTIONS,
  MOCK_SUPERVISOR_PLAN,
  MOCK_SUPERVISOR_STAGES,
  PESTICIDE_QUANTITY_UNITS,
} from 'src/pages/FARM_SUPERVISOR/Logbooks/mockData'

const { Text, Title, Paragraph } = Typography
const { TextArea } = Input
const { Dragger } = Upload

const taskStatusConfig = {
  PENDING: { label: 'Chờ kích hoạt', color: 'default' },
  ACTIVE: { label: 'Đang thực hiện', color: 'processing' },
  COMPLETED: { label: 'Hoàn thành', color: 'success' },
}

const DailyLog = () => {
  const { taskId } = useParams()
  const navigate = useNavigate()
  const [task, setTask] = useState(null)
  const [plan, setPlan] = useState(MOCK_SUPERVISOR_PLAN)
  const [stage, setStage] = useState(null)
  const [dailyLogs, setDailyLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [form] = Form.useForm()
  const [summaryForm] = Form.useForm()
  const [saving, setSaving] = useState(false)
  const [submitModal, setSubmitModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [fileList, setFileList] = useState([])

  useEffect(() => {
    const loadTask = async () => {
      setLoading(true)
      try {
        const foundTask = getMockTask(taskId)
        if (foundTask) {
          setTask(foundTask)
          setDailyLogs(getMockDailyLogsByTask(taskId))
          const foundStage = MOCK_SUPERVISOR_STAGES.find((s) => s.id === foundTask.stageId)
          setStage(foundStage || null)
          // Tự động set ngày hiện tại
          form.setFieldsValue({
            date: dayjs(),
            progress: foundTask.progress || 0,
            fertilizers: [],
            pesticides: [],
          })
        } else {
          message.error('Không tìm thấy công việc.')
          navigate(ROUTER.FL_TASKS)
        }
      } finally {
        setLoading(false)
      }
    }
    loadTask()
  }, [taskId, navigate, form])

  const handleSave = async (isSubmit = false) => {
    try {
      const values = await form.validateFields()
      setSaving(true)

      const payload = {
        taskId,
        date: values.date.format('YYYY-MM-DD'),
        fertilizers: values.fertilizers || [],
        pesticides: values.pesticides || [],
        description: values.description || '',
        progress: values.progress || 0,
        images: fileList.map((file) => ({
          id: file.uid,
          url: file.url || file.response?.url || URL.createObjectURL(file.originFileObj),
        })),
      }

      await FakeCultivationService.addDailyLog(payload)

      // Update task progress locally
      if (values.progress >= 100) {
        setSubmitModal(true)
      } else {
        message.success(isSubmit ? 'Đã gửi nhật ký thành công!' : 'Đã lưu nhật ký thành công!')
        navigate(ROUTER.FL_TASKS)
      }
    } catch (error) {
      if (error.errorFields) {
        message.warning('Vui lòng kiểm tra lại các trường nhập.')
      } else {
        message.error('Lưu nhật ký thất bại.')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleSubmitSummary = async () => {
    try {
      setSubmitting(true)
      const summaryValues = await summaryForm.validateFields()
      const currentFormValues = form.getFieldsValue()

      // Aggregate fertilizers
      const allEntriesForAgg = [
        ...dailyLogs,
        {
          date: currentFormValues.date?.format('YYYY-MM-DD') || '',
          fertilizers: currentFormValues.fertilizers || [],
          pesticides: currentFormValues.pesticides || [],
          images: fileList.map((file) => ({
            id: file.uid,
            url: file.url || file.response?.url || '',
          })),
        },
      ]

      const fertilizerMap = {}
      allEntriesForAgg.forEach((entry) => {
        ; (entry.fertilizers || []).forEach((f) => {
          if (!f.name) return
          if (!fertilizerMap[f.name]) {
            fertilizerMap[f.name] = {
              name: f.name,
              totalQuantity: 0,
              quantityUnit: f.quantityUnit,
              totalArea: 0,
              areaUnit: f.areaUnit,
              dailyBreakdown: [],
            }
          }
          fertilizerMap[f.name].totalQuantity += f.quantity || 0
          fertilizerMap[f.name].totalArea += f.area || 0
          fertilizerMap[f.name].dailyBreakdown.push({
            date: entry.date,
            quantity: f.quantity,
            area: f.area,
          })
        })
      })

      const pesticideMap = {}
      allEntriesForAgg.forEach((entry) => {
        ; (entry.pesticides || []).forEach((p) => {
          if (!p.name) return
          if (!pesticideMap[p.name]) {
            pesticideMap[p.name] = {
              name: p.name,
              totalQuantity: 0,
              quantityUnit: p.quantityUnit,
              totalArea: 0,
              areaUnit: p.areaUnit,
              dailyBreakdown: [],
            }
          }
          pesticideMap[p.name].totalQuantity += p.quantity || 0
          pesticideMap[p.name].totalArea += p.area || 0
          pesticideMap[p.name].dailyBreakdown.push({
            date: entry.date,
            quantity: p.quantity,
            area: p.area,
          })
        })
      })

      const allImages = []
      allEntriesForAgg.forEach((e) => {
        if (e.images) allImages.push(...e.images)
      })

      const summaryPayload = {
        totalFertilizers: Object.values(fertilizerMap),
        totalPesticides: Object.values(pesticideMap),
        images: allImages,
        descriptionSummary: summaryValues.descriptionSummary || '',
        completedAt: dayjs().format('YYYY-MM-DD'),
      }

      await FakeCultivationService.submitSummary(taskId, summaryPayload)
      message.success('Đã gửi báo cáo hoàn thành lên Farm Supervisor!')
      navigate(ROUTER.FL_TASKS)
    } catch (error) {
      if (error.errorFields) {
        message.warning('Vui lòng nhập mô tả tổng kết trước khi gửi.')
      } else {
        message.error('Gửi báo cáo thất bại.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const uploadProps = {
    name: 'file',
    multiple: true,
    fileList,
    onChange(info) {
      const { status } = info.file
      if (status !== 'uploading') setFileList(info.fileList)
      if (status === 'done') message.success(`${info.file.name} tải lên thành công.`)
      else if (status === 'error') message.error(`${info.file.name} tải lên thất bại.`)
    },
    onRemove(file) {
      setFileList((prev) => prev.filter((item) => item.uid !== file.uid))
    },
    beforeUpload() { return false },
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-96"><Spin size="large" tip="Đang tải công việc..." /></div>
  }

  if (!task) return null

  const cfg = taskStatusConfig[task.status] || taskStatusConfig.PENDING
  const hideProgress = task.name.toLowerCase().includes('bón phân đón đòng')
  const isViewOnly = task.status === 'COMPLETED'

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header */}
      <div>
        <Button
          type="text" icon={<ArrowLeftOutlined />}
          onClick={() => navigate(ROUTER.LM_FIELD_LOG)}
          className="mb-3 -ml-2 h-9 text-gray-600 hover:text-green-700"
        >
          Quay lại kế hoạch
        </Button>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <Tag color="blue" className="rounded-full">{stage?.stageName || 'Giai đoạn'}</Tag>
              <Tag color={cfg.color} className="rounded-full">{cfg.label}</Tag>
            </div>
            <TitleCustom className="!mb-0 text-xl md:text-2xl">{task.name}</TitleCustom>
            {task.description && (
              <div className="mt-2 text-sm text-gray-600">
                {task.description}
              </div>
            )}
          </div>
          <div className="shrink-0 flex gap-4 items-center">
            {!hideProgress && (
              <Progress type="circle" percent={task.progress} size={64}
                strokeColor={task.status === 'COMPLETED' ? '#16a34a' : '#3b82f6'}
              />
            )}
            <Card bordered={false} className="shadow-sm rounded-2xl p-1" bodyStyle={{ padding: 12 }}>
              <Steps current={task.status === 'COMPLETED' ? 2 : task.status === 'ACTIVE' ? 1 : 0} size="small" direction="horizontal">
                <Steps.Step title="Kích hoạt" />
                <Steps.Step title="Ghi nhật ký" />
                <Steps.Step title="Hoàn thành" />
              </Steps>
            </Card>
          </div>
        </div>
      </div>

      <Row gutter={24}>
        {/* Form (Left side) */}
        <Col xs={24} lg={14}>
          <Form form={form} layout="vertical" className="space-y-4" disabled={isViewOnly}>
            {/* Basic Info */}
            <Card bordered={false} className="shadow-sm rounded-2xl h-full" bodyStyle={{ padding: '20px' }}>
              <div className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FormOutlined className="text-green-600" />
                Nội dung thực hiện
              </div>
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item name="description" label="Chi tiết công việc" rules={[{ required: true, message: 'Nhập mô tả' }]}>
                    <TextArea rows={3} placeholder="Mô tả tình hình cây trồng, vấn đề phát sinh..." disabled={isViewOnly} />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* Fertilizers */}
            <Card bordered={false} className="shadow-sm rounded-2xl" bodyStyle={{ padding: '20px' }}>
              <div className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                Phân bón
              </div>
              <Form.List name="fertilizers">
                {(fields, { add, remove }) => (
                  <div className="space-y-3">
                    {fields.map((field) => (
                      <div key={field.key} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-gray-700">Loại {field.name + 1}</span>
                          {!isViewOnly && fields.length > 0 && (
                            <Button type="text" danger size="small" onClick={() => remove(field.name)} icon={<DeleteOutlined />} />
                          )}
                        </div>
                        <Row gutter={12}>
                          <Col xs={24} md={8}>
                            <Form.Item {...field} name={[field.name, 'name']} rules={[{ required: true }]}>
                              <Select options={MOCK_FERTILIZER_OPTIONS.map((f) => ({ value: f.name, label: f.name }))} placeholder="Loại phân bón" disabled={isViewOnly} />
                            </Form.Item>
                          </Col>
                          <Col xs={12} md={5}>
                            <Form.Item {...field} name={[field.name, 'quantity']} rules={[{ required: true }]}>
                              <InputNumber min={0} className="w-full" placeholder="Lượng" disabled={isViewOnly} />
                            </Form.Item>
                          </Col>
                          <Col xs={12} md={3}>
                            <Form.Item {...field} name={[field.name, 'quantityUnit']} rules={[{ required: true }]}>
                              <Select options={FERTILIZER_QUANTITY_UNITS.map((u) => ({ value: u, label: u }))} disabled={isViewOnly} />
                            </Form.Item>
                          </Col>
                          <Col xs={12} md={5}>
                            <Form.Item {...field} name={[field.name, 'area']} rules={[{ required: true }]}>
                              <InputNumber min={0} className="w-full" placeholder="Diện tích" disabled={isViewOnly} />
                            </Form.Item>
                          </Col>
                          <Col xs={12} md={3}>
                            <Form.Item {...field} name={[field.name, 'areaUnit']} rules={[{ required: true }]}>
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
              <div className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                Thuốc bảo vệ thực vật
              </div>
              <Form.List name="pesticides">
                {(fields, { add, remove }) => (
                  <div className="space-y-3">
                    {fields.map((field) => (
                      <div key={field.key} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-gray-700">Loại {field.name + 1}</span>
                          {!isViewOnly && fields.length > 0 && (
                            <Button type="text" danger size="small" onClick={() => remove(field.name)} icon={<DeleteOutlined />} />
                          )}
                        </div>
                        <Row gutter={12}>
                          <Col xs={24} md={8}>
                            <Form.Item {...field} name={[field.name, 'name']} rules={[{ required: true }]}>
                              <Select options={MOCK_PESTICIDE_OPTIONS.map((p) => ({ value: p.name, label: p.name }))} placeholder="Loại thuốc" disabled={isViewOnly} />
                            </Form.Item>
                          </Col>
                          <Col xs={12} md={5}>
                            <Form.Item {...field} name={[field.name, 'quantity']} rules={[{ required: true }]}>
                              <InputNumber min={0} className="w-full" placeholder="Lượng" disabled={isViewOnly} />
                            </Form.Item>
                          </Col>
                          <Col xs={12} md={3}>
                            <Form.Item {...field} name={[field.name, 'quantityUnit']} rules={[{ required: true }]}>
                              <Select options={PESTICIDE_QUANTITY_UNITS.map((u) => ({ value: u, label: u }))} disabled={isViewOnly} />
                            </Form.Item>
                          </Col>
                          <Col xs={12} md={5}>
                            <Form.Item {...field} name={[field.name, 'area']} rules={[{ required: true }]}>
                              <InputNumber min={0} className="w-full" placeholder="Diện tích" disabled={isViewOnly} />
                            </Form.Item>
                          </Col>
                          <Col xs={12} md={3}>
                            <Form.Item {...field} name={[field.name, 'areaUnit']} rules={[{ required: true }]}>
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

            {/* Images */}
            <Card bordered={false} className="shadow-sm rounded-2xl" bodyStyle={{ padding: '20px' }}>
              <div className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                Ảnh minh chứng
              </div>
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
                      <Image src={file.url || URL.createObjectURL(file.originFileObj)} className="object-cover" width="100%" height="100%" />
                      {!isViewOnly && (
                        <Button type="text" icon={<DeleteOutlined />} onClick={() => setFileList((prev) => prev.filter((item) => item.uid !== file.uid))} className="absolute top-1 right-1 bg-white/80 rounded-full text-red-500" size="small" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Actions */}
            {!isViewOnly && (
              <div className="flex flex-wrap gap-3 justify-end pt-2 pb-6">
                <Button onClick={() => handleSave(false)} loading={saving} className="h-10 px-6 font-semibold rounded-xl">
                  Lưu nháp
                </Button>
                {hideProgress && (
                  <Button type="primary" onClick={() => setSubmitModal(true)} className="h-10 px-6 font-semibold bg-blue-600 rounded-xl">
                    Hoàn thành công việc
                  </Button>
                )}
                <Button type="primary" onClick={() => handleSave(true)} loading={saving} className="h-10 px-6 font-semibold bg-green-600 rounded-xl">
                  Lưu & Gửi
                </Button>
              </div>
            )}
          </Form>
        </Col>

        {/* History (Right side) */}
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
                            {!hideProgress && (
                              <Text type="secondary" className="text-xs">Tiến độ: {log.progress}%</Text>
                            )}
                          </div>
                          <p className="text-sm m-0 mt-2 text-gray-700">{log.description}</p>

                          {(log.fertilizers?.length > 0 || log.materials?.length > 0) && (
                            <div className="mt-2 bg-green-50/50 rounded-lg p-2 border border-green-100">
                              {(log.fertilizers || log.materials).map((f, i) => (
                                <div key={i} className="text-xs text-gray-600 flex items-center gap-1">
                                  • {f.name || f.materialName}: <span className="font-semibold">{f.quantity} {f.unit || f.quantityUnit}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {log.images?.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {log.images.map((img, i) => (
                                <div key={i} className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden">
                                  <img src={img.url || img} alt={`Ảnh ${i + 1}`} className="w-full h-full object-cover" />
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

      {/* Submit Summary Modal */}
      <Modal
        open={submitModal}
        onCancel={() => { setSubmitModal(false); summaryForm.resetFields() }}
        title={<div className="flex items-center gap-2 text-green-700"><SendOutlined />Tạo Summary & Gửi báo cáo hoàn thành</div>}
        onOk={handleSubmitSummary}
        okText="Xác nhận gửi báo cáo"
        cancelText="Hủy"
        confirmLoading={submitting}
        okButtonProps={{ className: 'bg-green-600' }}
        width={640}
      >
        <div className="space-y-4 text-sm">
          <Alert
            message="✅ Xác nhận hoàn thành công việc!"
            description="Hệ thống sẽ tự động tổng hợp số liệu từ tất cả các ngày ghi chép và gom ảnh. Bạn chỉ cần viết mô tả tổng kết."
            type="success"
            showIcon
            className="rounded-xl"
          />
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
