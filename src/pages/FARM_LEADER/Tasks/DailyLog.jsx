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
  FileTextOutlined,
  InboxOutlined,
  PlusOutlined,
  SaveOutlined,
  SendOutlined,
  UserOutlined,
} from '@ant-design/icons'
import {
  Alert,
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
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
          // Pre-fill form if editing last log
          const lastLog = getMockDailyLogsByTask(taskId).pop()
          if (lastLog) {
            form.setFieldsValue({
              date: dayjs(lastLog.date),
              description: lastLog.description,
              progress: lastLog.progress,
              fertilizers: lastLog.fertilizers?.map((f) => ({
                ...f,
                id: f.id || `f-${Date.now()}`,
              })) || [],
              pesticides: lastLog.pesticides?.map((p) => ({
                ...p,
                id: p.id || `p-${Date.now()}`,
              })) || [],
            })
            setFileList(lastLog.images?.map((img) => ({
              uid: img.id,
              name: `image-${img.id}.jpg`,
              status: 'done',
              url: img.url,
            })) || [])
          } else {
            form.setFieldsValue({
              date: dayjs(),
              progress: foundTask.progress || 0,
            })
          }
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

      // Update task progress
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

      // ── Tổng hợp tất cả daily logs (đã lưu) + form hiện tại ──
      const allEntriesForAgg = [
        ...dailyLogs, // các ngày đã lưu trước
        { // form hiện tại
          date: currentFormValues.date?.format('YYYY-MM-DD') || '',
          fertilizers: currentFormValues.fertilizers || [],
          pesticides: currentFormValues.pesticides || [],
          images: fileList.map((file) => ({
            id: file.uid,
            url: file.url || file.response?.url || '',
          })),
        },
      ]

      // Aggregate fertilizers từ tất cả logs
      const fertilizerMap = {}
      allEntriesForAgg.forEach((entry) => {
        ;(entry.fertilizers || []).forEach((f) => {
          if (!f.name) return
          if (!fertilizerMap[f.name]) {
            fertilizerMap[f.name] = {
              name: f.name,
              totalQuantity: 0,
              quantityUnit: f.quantityUnit || 'kg',
              totalArea: 0,
              areaUnit: f.areaUnit || 'ha',
              dailyBreakdown: [],
            }
          }
          fertilizerMap[f.name].totalQuantity += Number(f.quantity) || 0
          fertilizerMap[f.name].totalArea += Number(f.area) || 0
          fertilizerMap[f.name].dailyBreakdown.push({
            date: entry.date,
            quantity: Number(f.quantity) || 0,
            area: Number(f.area) || 0,
          })
        })
      })

      // Aggregate pesticides
      const pesticideMap = {}
      allEntriesForAgg.forEach((entry) => {
        ;(entry.pesticides || []).forEach((p) => {
          if (!p.name) return
          if (!pesticideMap[p.name]) {
            pesticideMap[p.name] = {
              name: p.name,
              totalQuantity: 0,
              quantityUnit: p.quantityUnit || 'ml',
              totalArea: 0,
              areaUnit: p.areaUnit || 'ha',
              dailyBreakdown: [],
            }
          }
          pesticideMap[p.name].totalQuantity += Number(p.quantity) || 0
          pesticideMap[p.name].totalArea += Number(p.area) || 0
          pesticideMap[p.name].dailyBreakdown.push({
            date: entry.date,
            quantity: Number(p.quantity) || 0,
            area: Number(p.area) || 0,
          })
        })
      })

      // Gom tất cả ảnh từ tất cả logs + form hiện tại
      const allImages = allEntriesForAgg.flatMap((entry) => entry.images || [])
        .filter((img) => img.url)

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
      if (status !== 'uploading') {
        setFileList(info.fileList)
      }
      if (status === 'done') {
        message.success(`${info.file.name} tải lên thành công.`)
      } else if (status === 'error') {
        message.error(`${info.file.name} tải lên thất bại.`)
      }
    },
    onRemove(file) {
      setFileList((prev) => prev.filter((item) => item.uid !== file.uid))
    },
    beforeUpload() {
      return false // Prevent auto upload
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

  const cfg = taskStatusConfig[task.status] || taskStatusConfig.PENDING

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div>
        <Button
          type="text" icon={<ArrowLeftOutlined />}
          onClick={() => navigate(ROUTER.FL_TASKS)}
          className="mb-3 -ml-2 h-9 text-gray-600 hover:text-green-700"
        >
          Quay lại danh sách
        </Button>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <Tag color="blue" className="rounded-full">{stage?.stageName || 'Giai đoạn'}</Tag>
              <Tag color={cfg.color} className="rounded-full">{cfg.label}</Tag>
            </div>
            <TitleCustom className="!mb-0">{task.name}</TitleCustom>
          </div>
          <Progress type="circle" percent={task.progress} size={72}
            strokeColor={task.status === 'COMPLETED' ? '#16a34a' : '#3b82f6'}
          />
        </div>
        {task.description && (
          <div className="mt-3 rounded-xl bg-amber-50 border border-amber-100 p-3 text-sm text-amber-900">
            📋 <strong>Hướng dẫn:</strong> {task.description}
          </div>
        )}
      </div>

      {/* Steps */}
      <Card bordered={false} className="shadow-sm rounded-2xl">
        <Steps current={task.status === 'COMPLETED' ? 2 : task.status === 'ACTIVE' ? 1 : 0} size="small">
          <Steps.Step title="Kích hoạt" description="Nhận công việc" />
          <Steps.Step title="Ghi nhật ký" description="Cập nhật hàng ngày" />
          <Steps.Step title="Hoàn thành" description="Báo cáo kết thúc" />
        </Steps>
      </Card>

      <Form form={form} layout="vertical" className="space-y-6">
        {/* Basic Info */}
        <Card bordered={false} className="shadow-sm rounded-2xl" title="Thông tin cơ bản">
          <Row gutter={24}>
            <Col xs={24} md={12} lg={8}>
              <Form.Item name="date" label="Ngày ghi nhật ký" rules={[{ required: true, message: 'Chọn ngày' }]}>
                <DatePicker className="w-full" disabledDate={(current) => current && current > dayjs()} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12} lg={8}>
              <Form.Item name="progress" label="Tiến độ công việc (%)" rules={[{ required: true, message: 'Nhập tiến độ' }]}>
                <InputNumber min={0} max={100} className="w-full" placeholder="0-100%" />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Fertilizers */}
        <Card bordered={false} className="shadow-sm rounded-2xl" title="Phân bón sử dụng">
          <Form.List name="fertilizers">
            {(fields, { add, remove }) => (
              <div className="space-y-4">
                {fields.map((field) => (
                  <div key={field.key} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-bold text-gray-700">Phân bón #{field.name + 1}</span>
                      {fields.length > 1 && (
                        <Button type="text" danger size="small" onClick={() => remove(field.name)} icon={<DeleteOutlined />}>Xóa</Button>
                      )}
                    </div>
                    <Row gutter={12}>
                      <Col xs={24} md={12}>
                        <Form.Item {...field} name={[field.name, 'name']} label="Loại phân bón" rules={[{ required: true, message: 'Chọn loại phân bón' }]}>
                          <Select
                            options={MOCK_FERTILIZER_OPTIONS.map((f) => ({ value: f.name, label: f.name }))}
                            placeholder="Chọn loại phân bón..."
                            showSearch
                            filterOption={(input, option) => String(option?.label || '').toLowerCase().includes(input.toLowerCase())}
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={12} md={6}>
                        <Form.Item {...field} name={[field.name, 'quantity']} label="Lượng" rules={[{ required: true, message: 'Nhập lượng' }]}>
                          <InputNumber min={0} className="w-full" placeholder="Số lượng" />
                        </Form.Item>
                      </Col>
                      <Col xs={12} md={6}>
                        <Form.Item {...field} name={[field.name, 'quantityUnit']} label="Đơn vị" rules={[{ required: true, message: 'Chọn đơn vị' }]}>
                          <Select options={FERTILIZER_QUANTITY_UNITS.map((u) => ({ value: u, label: u }))} />
                        </Form.Item>
                      </Col>
                      <Col xs={12} md={6}>
                        <Form.Item {...field} name={[field.name, 'area']} label="Diện tích" rules={[{ required: true, message: 'Nhập diện tích' }]}>
                          <InputNumber min={0} className="w-full" placeholder="Diện tích" />
                        </Form.Item>
                      </Col>
                      <Col xs={12} md={6}>
                        <Form.Item {...field} name={[field.name, 'areaUnit']} label="Đơn vị diện tích" rules={[{ required: true, message: 'Chọn đơn vị' }]}>
                          <Select options={AREA_UNITS.map((u) => ({ value: u, label: u }))} />
                        </Form.Item>
                      </Col>
                    </Row>
                  </div>
                ))}
                <Button
                  type="dashed" onClick={() => add()}
                  icon={<PlusOutlined />} className="w-full rounded-xl text-green-700 border-green-300"
                >
                  + Thêm phân bón
                </Button>
              </div>
            )}
          </Form.List>
        </Card>

        {/* Pesticides */}
        <Card bordered={false} className="shadow-sm rounded-2xl" title="Thuốc bảo vệ thực vật">
          <Form.List name="pesticides">
            {(fields, { add, remove }) => (
              <div className="space-y-4">
                {fields.map((field) => (
                  <div key={field.key} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-bold text-gray-700">Thuốc BVTV #{field.name + 1}</span>
                      {fields.length > 1 && (
                        <Button type="text" danger size="small" onClick={() => remove(field.name)} icon={<DeleteOutlined />}>Xóa</Button>
                      )}
                    </div>
                    <Row gutter={12}>
                      <Col xs={24} md={12}>
                        <Form.Item {...field} name={[field.name, 'name']} label="Loại thuốc" rules={[{ required: true, message: 'Chọn loại thuốc' }]}>
                          <Select
                            options={MOCK_PESTICIDE_OPTIONS.map((p) => ({ value: p.name, label: p.name }))}
                            placeholder="Chọn loại thuốc..."
                            showSearch
                            filterOption={(input, option) => String(option?.label || '').toLowerCase().includes(input.toLowerCase())}
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={12} md={6}>
                        <Form.Item {...field} name={[field.name, 'quantity']} label="Lượng" rules={[{ required: true, message: 'Nhập lượng' }]}>
                          <InputNumber min={0} className="w-full" placeholder="Số lượng" />
                        </Form.Item>
                      </Col>
                      <Col xs={12} md={6}>
                        <Form.Item {...field} name={[field.name, 'quantityUnit']} label="Đơn vị" rules={[{ required: true, message: 'Chọn đơn vị' }]}>
                          <Select options={PESTICIDE_QUANTITY_UNITS.map((u) => ({ value: u, label: u }))} />
                        </Form.Item>
                      </Col>
                      <Col xs={12} md={6}>
                        <Form.Item {...field} name={[field.name, 'area']} label="Diện tích" rules={[{ required: true, message: 'Nhập diện tích' }]}>
                          <InputNumber min={0} className="w-full" placeholder="Diện tích" />
                        </Form.Item>
                      </Col>
                      <Col xs={12} md={6}>
                        <Form.Item {...field} name={[field.name, 'areaUnit']} label="Đơn vị diện tích" rules={[{ required: true, message: 'Chọn đơn vị' }]}>
                          <Select options={AREA_UNITS.map((u) => ({ value: u, label: u }))} />
                        </Form.Item>
                      </Col>
                    </Row>
                  </div>
                ))}
                <Button
                  type="dashed" onClick={() => add()}
                  icon={<PlusOutlined />} className="w-full rounded-xl text-green-700 border-green-300"
                >
                  + Thêm thuốc BVTV
                </Button>
              </div>
            )}
          </Form.List>
        </Card>

        {/* Images */}
        <Card bordered={false} className="shadow-sm rounded-2xl" title="Ảnh minh chứng">
          <Dragger {...uploadProps} className="rounded-xl">
            <div className="p-6">
              <div className="flex justify-center mb-3">
                <InboxOutlined className="text-4xl text-green-500" />
              </div>
              <p className="text-center text-sm text-gray-500">
                Kéo & thả ảnh vào đây hoặc <span className="text-green-600 font-semibold">chọn từ máy tính</span>
              </p>
              <p className="text-center text-xs text-gray-400 mt-1">
                Định dạng: JPG, PNG, JPEG (tối đa 5MB)
              </p>
            </div>
          </Dragger>
          {fileList.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-2">
              {fileList.map((file) => (
                <div key={file.uid} className="relative rounded-lg overflow-hidden aspect-square">
                  <Image
                    src={file.url || URL.createObjectURL(file.originFileObj)}
                    className="object-cover"
                    width="100%"
                    height="100%"
                  />
                  <Button
                    type="text"
                    icon={<DeleteOutlined />}
                    onClick={() => setFileList((prev) => prev.filter((item) => item.uid !== file.uid))}
                    className="absolute top-1 right-1 bg-white/80 rounded-full text-red-500 hover:bg-white"
                  />
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Description */}
        <Card bordered={false} className="shadow-sm rounded-2xl" title="Mô tả công việc">
          <Form.Item name="description" label="Chi tiết công việc thực hiện trong ngày">
            <TextArea rows={4} placeholder="Mô tả chi tiết công việc, tình hình cây trồng, thời tiết, vấn đề phát sinh (nếu có)..." />
          </Form.Item>
        </Card>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 justify-end">
          <Button
            type="default"
            onClick={() => handleSave(false)}
            loading={saving}
            className="h-10 px-6 font-semibold rounded-xl"
          >
            Lưu nháp
          </Button>
          <Button
            type="primary"
            onClick={() => handleSave(true)}
            loading={saving}
            className="h-10 px-6 font-semibold bg-green-600 rounded-xl"
          >
            Lưu & Gửi
          </Button>
        </div>
      </Form>

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
            message="✅ Công việc đã đạt tiến độ 100%!"
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
              extra="Mô tả tổng quá trình thực hiện: kết quả đạt được, thành công, vấn đề đã xử lý..."
            >
              <TextArea
                rows={4}
                placeholder="VD: Đã hoàn thành bón phân đón đòng cho toàn bộ 20ha trong 3 ngày. Lúa sinh trưởng tốt, dự kiến trổ đều sau 7-10 ngày..."
              />
            </Form.Item>
          </Form>
          <div className="rounded-xl bg-blue-50 p-3 text-xs text-blue-700 border border-blue-100">
            ⓳ Hệ thống tự động gộp <strong>{dailyLogs.length + 1} ngày</strong> ghi chép và 
            <strong> tất cả ảnh</strong> vào Summary. Farm Supervisor sẽ kiểm tra và biên soạn nhật ký chính thức.
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default DailyLog
