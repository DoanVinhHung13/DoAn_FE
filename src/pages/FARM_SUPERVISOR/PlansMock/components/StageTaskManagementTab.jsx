import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  PlusOutlined,
  TeamOutlined,
  UserOutlined,
  InfoCircleOutlined,
  FileTextOutlined,
} from '@ant-design/icons'
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  Divider,
  Empty,
  Form,
  Input,
  List,
  message,
  Row,
  Tag,
  Typography,
} from 'antd'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ROUTER from 'src/router/ROUTER'
import CultivationTaskService from 'src/services/CultivationTaskService'
import { formatDate } from 'src/utils/dateFormatters'

const { Text } = Typography

// ── Config ────────────────────────────────────────────────────────────────────
const stageStatusConfig = {
  PENDING: { color: 'default', label: 'Chưa bắt đầu', avatarBg: '#9ca3af', step: 'wait' },
  IN_PROGRESS: { color: 'processing', label: 'Đang thực hiện', avatarBg: '#3b82f6', step: 'process' },
  COMPLETED: { color: 'success', label: 'Hoàn thành', avatarBg: '#16a34a', step: 'finish' },
}

const taskStatusConfig = {
  PENDING: { color: 'default', label: 'Chờ kích hoạt', icon: <ClockCircleOutlined /> },
  ACTIVE: { color: 'processing', label: 'Đang thực hiện', icon: <CheckCircleOutlined /> },
  COMPLETED: { color: 'success', label: 'Hoàn thành', icon: <CheckCircleOutlined /> },
}

const getStageCfg = (s) => stageStatusConfig[s] || stageStatusConfig.PENDING
const getTaskCfg = (s) => taskStatusConfig[s] || taskStatusConfig.PENDING

// Item trong danh sách "Lộ trình sản xuất" bên trái
const StageListItem = ({ stage, index, isActive, onClick }) => {
  const cfg = getStageCfg(stage.status)
  return (
    <List.Item
      onClick={onClick}
      className="mb-2 cursor-pointer rounded-xl px-3 py-2 transition-colors"
      style={{
        border: isActive ? '1px solid #22c55e' : '1px solid #e5e7eb',
        background: isActive ? '#f0fdf4' : '#fff',
      }}
    >
      <List.Item.Meta
        avatar={
          <Avatar
            size={32}
            style={{
              backgroundColor: isActive ? '#16a34a' : '#f3f4f6',
              color: isActive ? '#fff' : '#6b7280',
              fontWeight: 700,
            }}
          >
            {index + 1}
          </Avatar>
        }
        title={
          <Text strong style={{ color: isActive ? '#15803d' : '#1f2937', whiteSpace: 'normal', fontSize: 13 }}>
            {stage.stageName || stage.name || `Giai đoạn ${index + 1}`}
          </Text>
        }
        description={
          <div className="mt-1 flex flex-col ">
            <Tag color={cfg.color} style={{ margin: 0, fontSize: 10 }}>{cfg.label}</Tag>
          </div>
        }
      />
    </List.Item>
  )
}

const StageTaskManagementTab = ({ planId, stages, tasks, loadData }) => {
  const navigate = useNavigate()
  const [selectedId, setSelectedId] = useState(null)
  const [editingTaskId, setEditingTaskId] = useState(null)
  const [taskForm] = Form.useForm()
  const [savingTask, setSavingTask] = useState(false)

  // Mặc định chọn giai đoạn đầu tiên khi load
  useEffect(() => {
    if (stages.length > 0 && !selectedId) {
      const firstActive = stages.find((s) => s.status === 'IN_PROGRESS') || stages[0]
      setSelectedId(firstActive?.id ?? null)
    }
  }, [stages, selectedId])

  const selectedStage = stages.find((s) => s.id === selectedId) ?? null
  const selectedTasks = selectedId ? (tasks[selectedId] || []) : []
  const selectedIdx = stages.findIndex((s) => s.id === selectedId)

  // ── Handlers ──────────────────────────────────────────────────────────────
  const openAddTask = () => {
    if (selectedStage?.status === 'COMPLETED') {
      message.warning('Giai đoạn đã hoàn thành. Không thể thêm công việc mới.')
      return
    }
    setEditingTaskId('new')
    taskForm.setFieldsValue({ tasks: [{ name: '', description: '' }] })
  }

  const handleAddTask = async () => {
    try {
      const values = await taskForm.validateFields()
      const taskList = values.tasks || []

      if (!taskList.length) {
        message.warning('Vui lòng thêm ít nhất một công việc')
        return
      }

      setSavingTask(true)
      setTimeout(() => {
        message.success(`Đã thêm ${taskList.length} công việc mới (MOCK)!`)
        setEditingTaskId(null)
        taskForm.resetFields()
        loadData() // Refresh parent data
        setSavingTask(false)
      }, 500)
    } catch (error) {
      console.error(error)
      if (!error.errorFields) {
        message.error('Không thể tạo công việc (MOCK).')
        setSavingTask(false)
      }
    }
  }

  return (
    <div className="space-y-6">
      <Card bordered={false} className="shadow-sm rounded-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Row gutter={[24, 24]} className="min-h-[520px]">
          {/* Cột trái: Danh sách giai đoạn dạng timeline */}
          <Col xs={24} lg={8} xl={6} className="border-b lg:border-b-0 lg:border-r border-gray-100 lg:pr-6 pb-6 lg:pb-0">
            <p className="mb-3 text-xs font-semibold tracking-wide text-gray-500 uppercase">
              Giai đoạn canh tác
            </p>

            {stages.length === 0 ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có giai đoạn" className="mt-8" />
            ) : (
              <List
                itemLayout="horizontal"
                split={false}
                dataSource={stages}
                renderItem={(stage, idx) => (
                  <StageListItem
                    key={stage.id}
                    stage={stage}
                    index={idx}
                    isActive={stage.id === selectedId}
                    onClick={() => {
                      setSelectedId(stage.id)
                      setEditingTaskId(null)
                    }}
                  />
                )}
              />
            )}
          </Col>

          {/* Cột phải: Chi tiết giai đoạn */}
          <Col xs={24} lg={16} xl={18}>
            {!selectedStage ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Chọn giai đoạn để xem chi tiết"
                className="py-20"
              />
            ) : (
              <div>
                {/* Header giai đoạn */}
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Text strong style={{ fontSize: 15 }} className="block text-gray-800">
                      {selectedStage.stageName || selectedStage.name || `Giai đoạn ${selectedIdx + 1}`}
                    </Text>
                    {(selectedStage.startDate || selectedStage.endDate) && (
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        <CalendarOutlined className="mr-1" />
                        {selectedStage.startDate ? formatDate(selectedStage.startDate) : '—'} –{' '}
                        {selectedStage.endDate ? formatDate(selectedStage.endDate) : 'Chưa kết thúc'}
                      </Text>
                    )}
                  </div>
                  <Tag color={getStageCfg(selectedStage.status).color} className="flex-shrink-0">
                    {getStageCfg(selectedStage.status).label}
                  </Tag>
                </div>

                {/* Mô tả giai đoạn */}
                {selectedStage.note && (
                  <Alert
                    message="Hướng dẫn giai đoạn"
                    description={selectedStage.note}
                    type="warning"
                    showIcon
                    icon={<InfoCircleOutlined />}
                    className="mb-3 rounded-xl"
                  />
                )}

                <Divider className="my-3" />

                {/* Tiêu đề danh sách công việc */}
                <div className="mb-2 flex items-center justify-between">
                  <Text className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Công việc
                  </Text>
                  <Badge count={selectedTasks.length} color="#16a34a" showZero />
                </div>

                {/* Danh sách công việc */}
                {selectedTasks.length > 0 ? (
                  <List
                    dataSource={selectedTasks}
                    split={false}
                    renderItem={(task) => {
                      const cfg = getTaskCfg(task.status)
                      return (
                        <List.Item
                          key={task.id}
                          className="mb-2 cursor-pointer rounded-xl border border-gray-100 bg-white px-3 py-2.5 transition hover:border-green-300 hover:bg-green-50/30 hover:shadow-sm"
                          style={{ border: '1px solid #f0f0f0' }}
                          onClick={() =>
                            navigate(
                              ROUTER.FS_TASK_DETAIL
                                .replace(':planId', planId)
                                .replace(':taskId', task.id)
                            )
                          }
                          actions={[<EyeOutlined key="view" className="text-gray-400" />]}
                        >
                          <List.Item.Meta
                            avatar={
                              <div
                                className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs
                                  ${task.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                    task.status === 'ACTIVE' ? 'bg-blue-100 text-blue-700' :
                                      'bg-gray-100 text-gray-500'}`}
                              >
                                {cfg.icon}
                              </div>
                            }
                            title={
                              <div className="flex items-center gap-2">
                                <Text strong ellipsis style={{ fontSize: 13, maxWidth: 160 }}>
                                  {task.name || task.taskName}
                                </Text>
                                <Tag color={cfg.color} style={{ margin: 0, fontSize: 11 }}>
                                  {cfg.label}
                                </Tag>
                              </div>
                            }
                            description={
                              <div>
                                {task.description && (
                                  <Text type="secondary" ellipsis style={{ fontSize: 12 }}>
                                    {task.description}
                                  </Text>
                                )}
                                {(task.assignedLeaderName || task.farmerIds?.length > 0) && (
                                  <div className="mt-1 flex flex-wrap gap-1">
                                    {task.assignedLeaderName && (
                                      <Tag icon={<UserOutlined />} color="green" style={{ margin: 0, fontSize: 11 }}>
                                        {task.assignedLeaderName}
                                      </Tag>
                                    )}
                                    {task.farmerIds?.length > 0 && (
                                      <Tag icon={<TeamOutlined />} color="blue" style={{ margin: 0, fontSize: 11 }}>
                                        {task.farmerIds.length} Farmer
                                      </Tag>
                                    )}
                                  </div>
                                )}
                              </div>
                            }
                          />
                        </List.Item>
                      )
                    }}
                  />
                ) : (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Chưa có công việc nào cho giai đoạn này."
                    className="py-6"
                  />
                )}

                {/* Nút thêm công việc */}
                {selectedStage.status !== 'COMPLETED' && (
                  <Button
                    type="dashed"
                    icon={<PlusOutlined />}
                    onClick={openAddTask}
                    block
                    className="mt-3 rounded-xl border-green-300 text-green-700 hover:border-green-500"
                  >
                    Thêm công việc vào giai đoạn này
                  </Button>
                )}

                {/* Form thêm công việc trực tiếp */}
                {editingTaskId === 'new' && (
                  <Card
                    size="small"
                    className="mt-3 rounded-xl border border-gray-200 bg-gray-50"
                    title={<Text strong style={{ fontSize: 13 }}>Công việc mới</Text>}
                  >
                    <Form form={taskForm} layout="vertical" initialValues={{ tasks: [{ name: '', description: '' }] }}>
                      <Form.List name="tasks">
                        {(fields, { add, remove }) => (
                          <>
                            {fields.map(({ key, name, ...restField }) => (
                              <Card key={key} size="small" className="mb-3 border border-gray-200 shadow-sm">
                                <div className="flex justify-between items-center mb-2">
                                  <Text strong>Công việc {name + 1}</Text>
                                  {fields.length > 1 && (
                                    <Button type="text" danger onClick={() => remove(name)}>Xóa</Button>
                                  )}
                                </div>
                                <Form.Item
                                  {...restField}
                                  name={[name, 'name']}
                                  rules={[{ required: true, message: 'Nhập tên công việc' }]}
                                  className="!mb-3"
                                >
                                  <Input placeholder="Tên công việc (VD: Bón phân đón đòng...)" />
                                </Form.Item>
                                <Form.Item
                                  {...restField}
                                  name={[name, 'description']}
                                  className="!mb-3"
                                >
                                  <Input.TextArea rows={2} placeholder="Mô tả chi tiết, liều lượng..." />
                                </Form.Item>
                              </Card>
                            ))}
                            <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />} className="mb-3 text-green-600 border-green-300 hover:border-green-500">
                              Thêm công việc khác
                            </Button>
                          </>
                        )}
                      </Form.List>
                      <Row gutter={12}>
                        <Col span={24}>
                          <div className="flex justify-end gap-2">
                            <Button
                              onClick={() => setEditingTaskId(null)}
                              className="rounded-lg"
                            >
                              Hủy
                            </Button>
                            <Button
                              type="primary"
                              onClick={handleAddTask}
                              loading={savingTask}
                              className="bg-green-600 rounded-lg"
                            >
                              Lưu {taskForm.getFieldValue('tasks')?.length || 1} công việc
                            </Button>
                          </div>
                        </Col>
                      </Row>
                    </Form>
                  </Card>
                )}

                {/* Nhật ký chính thức khi hoàn thành 100% */}
                {selectedStage.status === 'COMPLETED' &&
                  selectedTasks.length > 0 &&
                  selectedTasks.every((t) => t.status === 'COMPLETED') && (
                    <>
                      <Divider className="my-3">
                        <Text className="text-xs text-green-700 font-semibold">
                          <FileTextOutlined className="mr-1" />
                          Nhật ký chính thức
                        </Text>
                      </Divider>
                      <List
                        dataSource={selectedTasks}
                        split={false}
                        renderItem={(task) => (
                          <List.Item key={task.id} style={{ padding: '4px 0' }}>
                            <Card
                              size="small"
                              className="w-full rounded-xl border-green-100"
                              bordered
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <CheckCircleOutlined className="text-green-600" />
                                  <Text strong style={{ fontSize: 13 }}>{task.name || task.taskName}</Text>
                                </div>
                                <Tag color="success">Hoàn thành</Tag>
                              </div>
                              {task.summary ? (
                                <div className="space-y-1.5">
                                  <div className="rounded-lg bg-gray-50 p-2 font-mono text-xs">
                                    <Text className="block text-gray-500 font-semibold mb-1">Mô tả của Farm Leader:</Text>
                                    {task.summary.leaderDescription}
                                  </div>
                                  <div className="rounded-lg bg-blue-50 p-2 italic text-xs text-blue-700">
                                    <Text className="block text-blue-500 font-semibold mb-1">Nhật ký chính thức:</Text>
                                    {task.summary.supervisorDescription || 'Chưa biên soạn.'}
                                  </div>
                                </div>
                              ) : (
                                <Alert
                                  message="Chưa biên soạn nhật ký chính thức"
                                  type="info"
                                  showIcon
                                  className="rounded-lg"
                                />
                              )}
                            </Card>
                          </List.Item>
                        )}
                      />
                    </>
                  )}
              </div>
            )}
          </Col>
        </Row>
      </Card>
    </div>
  )
}

export default StageTaskManagementTab
