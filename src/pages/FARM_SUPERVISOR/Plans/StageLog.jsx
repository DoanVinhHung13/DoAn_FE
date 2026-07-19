/**
 * Farm Supervisor: Biên soạn nhật ký chính thức cho giai đoạn
 * Route: /farm-supervisor/plans/:planId/stages/:stageId  (ROUTER.FS_STAGE_LOG)
 */
import {
  ArrowLeftOutlined,
  BookOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  EditOutlined,
  EnvironmentOutlined,
  EyeOutlined,
  FileTextOutlined,
  InfoCircleOutlined,
  SaveOutlined,
  SendOutlined,
  UserOutlined,
} from '@ant-design/icons'
import {
  Alert,
  Button,
  Card,
  Collapse,
  Descriptions,
  Empty,
  Form,
  Image,
  Input,
  message,
  Modal,
  Progress,
  Skeleton,
  Spin,
  Tag,
  Timeline,
  Tooltip,
  Typography,
} from 'antd'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import TitleCustom from 'src/components/TitleCustom'
import ROUTER from 'src/router/ROUTER'
import { formatDate } from 'src/utils/dateFormatters'
import {
  FakeCultivationService,
  getMockTasksByStage,
  MOCK_SUPERVISOR_PLAN,
  MOCK_SUPERVISOR_STAGES,
} from '../Logbooks/mockData'

const { Text, Title, Paragraph } = Typography
const { TextArea } = Input

const taskStatusConfig = {
  PENDING: { color: 'default', label: 'Chờ kích hoạt' },
  ACTIVE: { color: 'processing', label: 'Đang thực hiện' },
  COMPLETED: { color: 'success', label: 'Hoàn thành' },
}

const StageLog = () => {
  const { planId, stageId } = useParams()
  const navigate = useNavigate()
  const [plan, setPlan] = useState(MOCK_SUPERVISOR_PLAN)
  const [stage, setStage] = useState(null)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitModal, setSubmitModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const loadStage = async () => {
      setLoading(true)
      try {
        const foundStage = MOCK_SUPERVISOR_STAGES.find((s) => s.id === stageId)
        if (foundStage) {
          setStage(foundStage)
          const tasksRes = await FakeCultivationService.getTasksByStage(stageId)
          setTasks(tasksRes?.data?.data || getMockTasksByStage(stageId))
        } else {
          message.error('Không tìm thấy giai đoạn.')
          navigate(ROUTER.FS_PLAN_DETAIL.replace(':planId', planId))
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          const foundStage = MOCK_SUPERVISOR_STAGES.find((s) => s.id === stageId)
          setStage(foundStage || MOCK_SUPERVISOR_STAGES[0])
          setTasks(getMockTasksByStage(stageId))
          message.info('API chưa có dữ liệu. Đang hiển thị dữ liệu mẫu.')
        } else {
          message.error(error.message || 'Không thể tải giai đoạn.')
        }
      } finally {
        setLoading(false)
      }
    }
    loadStage()
  }, [planId, stageId, navigate])

  const allTasksCompleted = tasks.every((t) => t.status === 'COMPLETED')
  const allOfficialLogsCompiled = tasks.filter((t) => t.status === 'COMPLETED').every((t) => !!t.officialLog)
  const canSubmit = allTasksCompleted && allOfficialLogsCompiled

  const handleSubmit = async () => {
    try {
      setSubmitting(true)
      await FakeCultivationService.submitLogbook(planId)
      message.success('Đã gửi nhật ký lên Farm Manager thành công!')
      navigate(ROUTER.FS_PLANS)
    } catch (error) {
      message.error('Gửi nhật ký thất bại.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Spin size="large" tip="Đang tải giai đoạn..." />
      </div>
    )
  }

  if (!stage) return null

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Button
            type="text" icon={<ArrowLeftOutlined />}
            onClick={() => navigate(ROUTER.FS_PLAN_DETAIL.replace(':planId', planId))}
            className="mb-3 -ml-2 h-9 text-gray-600 hover:text-green-700"
          >
            Quay lại kế hoạch
          </Button>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Tag color="blue" className="rounded-full">{plan.planName}</Tag>
            <Tag color="green" className="rounded-full">{stage.stageName}</Tag>
          </div>
          <TitleCustom className="!mb-0">Biên soạn nhật ký chính thức</TitleCustom>
          <Text type="secondary">Tổng hợp và biên tập nhật ký cho giai đoạn {stage.stageName}.</Text>
        </div>
        <Tooltip title={!canSubmit ? 'Cần hoàn thành biên soạn tất cả công việc trước khi gửi.' : ''}>
          <Button
            type="primary" icon={<SendOutlined />} size="large"
            disabled={!canSubmit}
            onClick={() => setSubmitModal(true)}
            className="h-11 rounded-xl bg-green-600 px-6 font-semibold"
          >
            Gửi nhật ký lên Manager
          </Button>
        </Tooltip>
      </div>

      {/* Stage Overview */}
      <Card bordered={false} className="shadow-sm rounded-2xl">
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <Title level={5} className="!mb-3 !text-green-700">Thông tin giai đoạn</Title>
            <Descriptions column={1} size="small">
              <Descriptions.Item label={<><CalendarOutlined className="mr-1" />Thời gian</>}>
                {stage.startDate ? formatDate(stage.startDate) : '—'} — {stage.endDate ? formatDate(stage.endDate) : '—'}
              </Descriptions.Item>
              <Descriptions.Item label={<><UserOutlined className="mr-1" />Số công việc</>}>
                {tasks.length} công việc ({tasks.filter((t) => t.status === 'COMPLETED').length} hoàn thành)
              </Descriptions.Item>
            </Descriptions>
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-600 mb-2">Tiến độ biên soạn</div>
            <Progress
              type="circle"
              percent={Math.round((tasks.filter((t) => !!t.officialLog).length / tasks.length) * 100)}
              size={110}
              strokeColor={{ '0%': '#86efac', '100%': '#16a34a' }}
              format={(p) => <span className="text-2xl font-bold text-green-700">{p}%</span>}
            />
            <div className="mt-3 text-center text-xs text-gray-500">
              {tasks.filter((t) => !!t.officialLog).length}/{tasks.length} công việc biên soạn xong
            </div>
          </div>
        </div>
      </Card>

      {/* Tasks */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Title level={5} className="!mb-0 !text-gray-900">Công việc trong giai đoạn</Title>
          <Text type="secondary">({tasks.length} công việc)</Text>
        </div>

        {tasks.length > 0 ? (
          <div className="space-y-3">
            {tasks.map((task) => {
              const cfg = taskStatusConfig[task.status] || taskStatusConfig.PENDING
              const [compileForm] = Form.useForm()
              const [compileModal, setCompileModal] = useState(false)
              const [savingCompile, setSavingCompile] = useState(false)

              const handleCompile = async () => {
                try {
                  const values = await compileForm.validateFields()
                  setSavingCompile(true)
                  const officialLog = {
                    dataSentence: task.leaderSummary ? (
                      (task.leaderSummary.totalFertilizers || []).map((f) => (
                        `Đã bón ${f.totalQuantity} ${f.quantityUnit} ${f.name} cho ${f.totalArea} ${f.areaUnit}`
                      )).concat(
                        (task.leaderSummary.totalPesticides || []).map((p) => (
                          `Đã phun ${p.totalQuantity} ${p.quantityUnit} ${p.name} cho ${p.totalArea} ${p.areaUnit}`
                        ))
                      ).join('. ') : 'Không có số liệu phân bón / thuốc BVTV.',
                    supervisorDescription: values.supervisorDescription,
                    images: task.leaderSummary?.images || [],
                    compiledAt: formatDate(new Date()),
                  }
                  await FakeCultivationService.compileOfficialLog(task.id, officialLog)
                  message.success('Đã lưu nhật ký chính thức!')
                  setCompileModal(false)
                  // Refresh tasks
                  const tasksRes = await FakeCultivationService.getTasksByStage(stageId)
                  setTasks(tasksRes?.data?.data || getMockTasksByStage(stageId))
                } catch (error) {
                  if (error.errorFields) {
                    message.warning('Vui lòng kiểm tra lại các trường nhập.')
                  } else {
                    message.error('Lưu nhật ký thất bại.')
                  }
                } finally {
                  setSavingCompile(false)
                }
              }

              return (
                <Card
                  key={task.id}
                  bordered={false}
                  className="shadow-sm rounded-2xl border border-gray-100"
                  title={
                    <div className="flex items-center gap-2">
                      <FileTextOutlined className="text-green-600" />
                      <span>{task.name}</span>
                      <Tag color={cfg.color} className="rounded-full ml-auto">{cfg.label}</Tag>
                    </div>
                  }
                >
                  <div className="space-y-4">
                    {/* Leader Summary */}
                    {task.leaderSummary ? (
                      <div className="space-y-3">
                        {/* Data Sentence */}
                        <div>
                          <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">📊 Số liệu tổng hợp (Không thể sửa)</div>
                          <div className="rounded-xl bg-gray-50 border border-gray-200 p-3 text-sm font-mono text-gray-700">
                            {task.leaderSummary.totalFertilizers?.length > 0 || task.leaderSummary.totalPesticides?.length > 0 ? (
                              <>
                                {task.leaderSummary.totalFertilizers?.map((f) => (
                                  <div key={f.name}>
                                    Đã bón {f.totalQuantity} {f.quantityUnit} {f.name} cho {f.totalArea} {f.areaUnit}
                                    {f.dailyBreakdown?.length > 0 && (
                                      <span> ({f.dailyBreakdown.map((d) => `${formatDate(d.date)}: ${d.quantity} ${f.quantityUnit}/${d.area} ${f.areaUnit}`).join('; ')})</span>
                                    )}
                                  </div>
                                ))}
                                {task.leaderSummary.totalPesticides?.map((p) => (
                                  <div key={p.name}>
                                    Đã phun {p.totalQuantity} {p.quantityUnit} {p.name} cho {p.totalArea} {p.areaUnit}
                                    {p.dailyBreakdown?.length > 0 && (
                                      <span> ({p.dailyBreakdown.map((d) => `${formatDate(d.date)}: ${d.quantity} ${p.quantityUnit}/${d.area} ${p.areaUnit}`).join('; ')})</span>
                                    )}
                                  </div>
                                ))}
                              </>
                            ) : 'Không có số liệu phân bón / thuốc BVTV.'}
                          </div>
                        </div>

                        {/* Images */}
                        {task.leaderSummary.images?.length > 0 && (
                          <div>
                            <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">📷 Ảnh đính kèm ({task.leaderSummary.images.length} ảnh)</div>
                            <Image.PreviewGroup>
                              <div className="grid grid-cols-3 gap-2">
                                {task.leaderSummary.images.map((img) => (
                                  <Image key={img.id} src={img.url} className="rounded-lg object-cover aspect-square" />
                                ))}
                              </div>
                            </Image.PreviewGroup>
                          </div>
                        )}

                        {/* Leader Description */}
                        <div>
                          <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">✍️ Mô tả từ Farm Leader</div>
                          <div className="rounded-xl bg-blue-50 border border-blue-100 p-3 text-sm italic text-blue-900">
                            "{task.leaderSummary.descriptionSummary}"
                          </div>
                        </div>
                      </div>
                    ) : (
                      <Alert
                        message="Chưa có báo cáo từ Farm Leader"
                        description="Farm Leader chưa gửi báo cáo hoàn thành cho công việc này."
                        type="info"
                        showIcon
                        className="rounded-xl"
                      />
                    )}

                    {/* Official Log */}
                    {task.officialLog ? (
                      <div className="rounded-xl bg-green-50 border border-green-200 p-4">
                        <div className="flex items-center gap-2 mb-3 text-green-700 font-semibold">
                          <CheckCircleOutlined />
                          Nhật ký chính thức đã biên soạn ({formatDate(task.officialLog.compiledAt)})
                        </div>
                        <div className="text-sm text-gray-700 font-mono bg-white rounded-lg p-2 mb-2">
                          {task.officialLog.dataSentence}
                        </div>
                        <div className="text-sm italic text-gray-600">
                          {task.officialLog.supervisorDescription}
                        </div>
                        <Button
                          type="text" size="small" icon={<EditOutlined />}
                          onClick={() => {
                            compileForm.setFieldsValue({ supervisorDescription: task.officialLog.supervisorDescription })
                            setCompileModal(true)
                          }}
                          className="mt-2 text-green-600"
                        >
                          Sửa lại
                        </Button>
                      </div>
                    ) : task.leaderSummary ? (
                      <Button
                        type="primary" icon={<EditOutlined />}
                        onClick={() => {
                          compileForm.setFieldsValue({ supervisorDescription: task.leaderSummary.descriptionSummary || '' })
                          setCompileModal(true)
                        }}
                        className="w-full h-10 rounded-xl bg-green-600 font-semibold"
                      >
                        Biên soạn nhật ký chính thức
                      </Button>
                    ) : null}
                  </div>

                  {/* Compile Modal */}
                  <Modal
                    open={compileModal}
                    onCancel={() => setCompileModal(false)}
                    title={<div className="flex items-center gap-2"><EditOutlined className="text-green-600" />Biên soạn nhật ký chính thức</div>}
                    onOk={handleCompile}
                    okText="Lưu nhật ký chính thức"
                    cancelText="Hủy"
                    confirmLoading={savingCompile}
                    okButtonProps={{ className: 'bg-green-600' }}
                    width={720}
                  >
                    <Form form={compileForm} layout="vertical" className="space-y-4">
                      <div>
                        <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                          📊 Phần số liệu (KHÔNG ĐƯỢC SỬA — hệ thống tự ghép)
                        </div>
                        <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 text-sm font-mono text-gray-700 select-none">
                          {task.leaderSummary?.totalFertilizers?.length > 0 || task.leaderSummary?.totalPesticides?.length > 0 ? (
                            <>
                              {task.leaderSummary.totalFertilizers?.map((f) => (
                                <div key={f.name}>
                                  Đã bón {f.totalQuantity} {f.quantityUnit} {f.name} cho {f.totalArea} {f.areaUnit}
                                  {f.dailyBreakdown?.length > 0 && (
                                    <span> ({f.dailyBreakdown.map((d) => `${formatDate(d.date)}: ${d.quantity} ${f.quantityUnit}/${d.area} ${f.areaUnit}`).join('; ')})</span>
                                  )}
                                </div>
                              ))}
                              {task.leaderSummary.totalPesticides?.map((p) => (
                                <div key={p.name}>
                                  Đã phun {p.totalQuantity} {p.quantityUnit} {p.name} cho {p.totalArea} {p.areaUnit}
                                  {p.dailyBreakdown?.length > 0 && (
                                    <span> ({p.dailyBreakdown.map((d) => `${formatDate(d.date)}: ${d.quantity} ${p.quantityUnit}/${d.area} ${p.areaUnit}`).join('; ')})</span>
                                  )}
                                </div>
                              ))}
                            </>
                          ) : 'Không có số liệu phân bón / thuốc BVTV.'}
                        </div>
                      </div>

                      {task.leaderSummary?.images?.length > 0 && (
                        <div>
                          <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                            📷 Ảnh đính kèm (KHÔNG ĐƯỢC XÓA — {task.leaderSummary.images.length} ảnh)
                          </div>
                          <Image.PreviewGroup>
                            <div className="flex flex-wrap gap-2">
                              {task.leaderSummary.images.map((img) => (
                                <Image key={img.id} src={img.url} width={80} height={80} className="rounded-lg object-cover" />
                              ))}
                            </div>
                          </Image.PreviewGroup>
                        </div>
                      )}

                      <Form.Item
                        name="supervisorDescription" label="Mô tả (Farm Supervisor biên tập)"
                        rules={[{ required: true, message: 'Nhập mô tả nhật ký' }]}
                        extra="Viết lại theo văn phong chuẩn nhật ký canh tác. Không được sửa số liệu ở phần trên.
                          Chỉnh sửa câu chữ cho rõ ràng, chuyên nghiệp."
                      >
                        <TextArea rows={5} placeholder="VD: Công tác bón phân đón đòng được thực hiện theo đúng quy trình kỹ thuật..." />
                      </Form.Item>

                      <div>
                        <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">📋 Preview nhật ký cuối</div>
                        <Form.Item noStyle dependencies={['supervisorDescription']}>
                          {({ getFieldValue }) => (
                            <div className="rounded-xl bg-green-50 border border-green-100 p-4 text-sm text-green-900">
                              <span className="font-mono">
                                {task.leaderSummary?.totalFertilizers?.length > 0 || task.leaderSummary?.totalPesticides?.length > 0 ? (
                                  <>
                                    {task.leaderSummary.totalFertilizers?.map((f) => (
                                      `Đã bón ${f.totalQuantity} ${f.quantityUnit} ${f.name} cho ${f.totalArea} ${f.areaUnit}`
                                    )).concat(
                                      task.leaderSummary.totalPesticides?.map((p) => (
                                        `Đã phun ${p.totalQuantity} ${p.quantityUnit} ${p.name} cho ${p.totalArea} ${p.areaUnit}`
                                      ))
                                    ).join('. ')}
                                  </>
                                ) : 'Không có số liệu phân bón / thuốc BVTV.'}
                              </span>
                              {getFieldValue('supervisorDescription') && (
                                <span> — {getFieldValue('supervisorDescription')}</span>
                              )}
                            </div>
                          )}
                        </Form.Item>
                      </div>
                    </Form>
                  </Modal>
                </Card>
              )
            })}
          </div>
        ) : (
          <Empty description="Không có công việc nào trong giai đoạn này." />
        )}
      </div>

      {/* Submit Modal */}
      <Modal
        open={submitModal}
        onCancel={() => setSubmitModal(false)}
        title={<div className="flex items-center gap-2 text-green-700"><SendOutlined />Gửi nhật ký lên Farm Manager</div>}
        onOk={handleSubmit}
        okText="Xác nhận gửi"
        cancelText="Hủy"
        confirmLoading={submitting}
        okButtonProps={{ className: 'bg-green-600' }}
      >
        <div className="space-y-3 text-sm">
          <Alert
            message="✅ Tất cả công việc đã hoàn thành!"
            description="Nhật ký canh tác sẽ được gửi đến Farm Manager để duyệt."
            type="success"
            showIcon
            className="rounded-xl"
          />
          <div className="text-gray-500">
            Sau khi gửi, bạn không thể chỉnh sửa. Farm Manager sẽ duyệt hoặc từ chối kèm lý do.
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default StageLog
