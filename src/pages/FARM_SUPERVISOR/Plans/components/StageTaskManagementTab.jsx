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
  Select,
  Tag,
  Typography,
  Progress,
} from 'antd'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ROUTER from 'src/router/ROUTER'
import CultivationTaskService from 'src/services/CultivationTaskService'
import TaskCatalogService from 'src/services/TaskCatalogService'
import { formatDate } from 'src/utils/dateFormatters'
import { useCultivationStatus } from 'src/hooks/useCultivationStatus'
import AssignTaskModal from './AssignTaskModal'

const { Text } = Typography

const unwrap = (res) => res?.data?.data ?? res?.data ?? res

const taskStatusIcon = (s) =>
  s === 'COMPLETED' || s === 'WAITING_APPROVAL' || s === 'IN_PROGRESS' || s === 'ASSIGNED' || s === 'ACTIVE'
    ? <CheckCircleOutlined />
    : <ClockCircleOutlined />

// Item trong danh sách "Lộ trình sản xuất" bên trái
const StageListItem = ({ stage, index, isActive, onClick, getStageStatus }) => {
  const cfg = getStageStatus(stage.status)
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
          <Text className={`font-semibold ${isActive ? 'text-green-700' : 'text-gray-800'} whitespace-normal text-sm`}>
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

const StageTaskManagementTab = ({ plan, planId, stages, tasks, loadData }) => {
  const navigate = useNavigate()
  const { getStageStatus, getTaskStatus } = useCultivationStatus()
  const getTaskCfg = (s) => ({ ...getTaskStatus(s), icon: taskStatusIcon(s) })
  const [selectedId, setSelectedId] = useState(null)
  const [editingTaskId, setEditingTaskId] = useState(null)
  const [taskForm] = Form.useForm()
  const [savingTask, setSavingTask] = useState(false)
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [assignTaskData, setAssignTaskData] = useState(null)
  const [taskCatalogOptions, setTaskCatalogOptions] = useState([])

  useEffect(() => {
    const loadCatalogs = async () => {
      try {
        const res = await TaskCatalogService.getAll({ PageIndex: 1, PageSize: 200 })
        const data = unwrap(res)
        const items = Array.isArray(data) ? data : data?.items || []
        setTaskCatalogOptions(
          items.map((item) => ({
            value: item.id,
            label: item.name,
            description: item.description,
          }))
        )
      } catch (err) {
        console.error(err)
        setTaskCatalogOptions([])
      }
    }
    loadCatalogs()
  }, [])

  const handleActivateTask = async (taskId) => {
    try {
      await CultivationTaskService.start(taskId)
      loadData()
    } catch (err) {
      message.error('Kích hoạt thất bại.')
    }
  }

  // Mặc định chọn giai đoạn đầu tiên khi load
  useEffect(() => {
    if (stages.length > 0 && !selectedId) {
      const firstActive =
        stages.find((s) => s.status === 'ACTIVE' || s.status === 'IN_PROGRESS') || stages[0]
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
    taskForm.setFieldsValue({
      tasks: [{ taskCatalogId: null, name: '', description: '', leaderId: null, farmerIds: null }],
    })
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

      const validTasks = taskList
        .filter((task) => task.taskCatalogId || task.name?.trim())
        .map((task) => {
          const catalog = taskCatalogOptions.find((o) => o.value === task.taskCatalogId)
          return {
            taskCatalogId: task.taskCatalogId || null,
            name: (task.name || catalog?.label || '').trim(),
            description: (task.description || catalog?.description || '').trim() || null,
            leaderId: null,
            farmerIds: null,
          }
        })
        .filter((task) => task.name)

      if (!validTasks.length) {
        message.warning('Chọn công việc từ danh mục hoặc nhập tên mới')
        setSavingTask(false)
        return
      }

      await CultivationTaskService.createBulk({
        cultivationLogbookId: planId,
        cultivationStageId: selectedId,
        tasks: validTasks,
      })

      setEditingTaskId(null)
      taskForm.resetFields()
      loadData()
    } catch (error) {
      console.error(error)
      if (!error.errorFields) {
        message.error('Không thể tạo công việc.')
      }
    } finally {
      setSavingTask(false)
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
                    getStageStatus={getStageStatus}
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
                  <div className="min-w-0 flex-1">
                    <Text className="block text-lg font-bold text-gray-800">
                      {selectedStage.stageName || selectedStage.name || `Giai đoạn ${selectedIdx + 1}`}
                    </Text>
                    {/* Ngày dự kiến của giai đoạn */}
                    {(selectedStage.startDate || selectedStage.endDate) && (
                      <Text type="secondary" className="text-sm block mt-0.5">
                        <CalendarOutlined className="mr-1" />
                        <span className="font-medium">Dự kiến:</span>{' '}
                        {selectedStage.startDate ? formatDate(selectedStage.startDate) : '—'}{' '}–{' '}
                        {selectedStage.endDate ? formatDate(selectedStage.endDate) : 'Chưa xác định'}
                      </Text>
                    )}
                    {/* Ngày thực tế của giai đoạn */}
                    {(selectedStage.actualStartDate || selectedStage.actualEndDate) && (
                      <Text type="secondary" className="text-sm block mt-0.5">
                        <CheckCircleOutlined className="mr-1 text-green-600" />
                        <span className="font-medium text-green-700">Thực tế:</span>{' '}
                        {selectedStage.actualStartDate ? formatDate(selectedStage.actualStartDate) : '—'}{' '}–{' '}
                        {selectedStage.actualEndDate ? formatDate(selectedStage.actualEndDate) : 'Chưa kết thúc'}
                      </Text>
                    )}
                  </div>
                  <Tag color={getStageStatus(selectedStage.status).color} className="flex-shrink-0">
                    {getStageStatus(selectedStage.status).label}
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
                        <List.Item key={task.id} className="mb-4">
                          <Card
                            hoverable
                            className="w-full rounded-2xl shadow-sm hover:shadow-md transition-shadow border-l-4"
                            style={{
                              borderLeftColor: cfg.color === 'processing' ? '#3b82f6' : cfg.color === 'success' ? '#16a34a' : '#d1d5db',
                              borderTop: '1px solid #f3f4f6',
                              borderRight: '1px solid #f3f4f6',
                              borderBottom: '1px solid #f3f4f6'
                            }}
                            bodyStyle={{ padding: '16px' }}
                          >
                            <div className="flex flex-col gap-3">
                              {/* Header */}
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-lg
                                      ${task.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                        task.status === 'WAITING_APPROVAL' ? 'bg-amber-100 text-amber-700' :
                                        task.status === 'IN_PROGRESS' || task.status === 'ACTIVE' ? 'bg-blue-100 text-blue-700' :
                                          'bg-gray-100 text-gray-500'}`}
                                  >
                                    {cfg.icon}
                                  </div>
                                  <div>
                                    <Text className="text-sm font-semibold text-gray-800 line-clamp-2">
                                      {task.name || task.taskName}
                                    </Text>
                                    {task.description && (
                                      <Text type="secondary" className="text-xs line-clamp-1 mt-0.5">
                                        {task.description}
                                      </Text>
                                    )}
                                    {/* Ngày bắt đầu và hạn chót của task */}
                                    <div className="flex flex-wrap gap-x-3 mt-1">
                                      {task.startDate && (
                                        <Text type="secondary" className="text-xs">
                                          <CalendarOutlined className="mr-1" />
                                          Bắt đầu: {formatDate(task.startDate)}
                                        </Text>
                                      )}
                                      {task.dueDate && (
                                        <Text type="secondary" className="text-xs">
                                          <ClockCircleOutlined className="mr-1" />
                                          Hạn: {formatDate(task.dueDate)}
                                        </Text>
                                      )}
                                      {task.completedDate && (
                                        <Text className="text-xs text-green-600">
                                          <CheckCircleOutlined className="mr-1" />
                                          Xong: {formatDate(task.completedDate)}
                                        </Text>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <Tag color={cfg.color} className="flex-shrink-0 mt-1">
                                  {cfg.label}
                                </Tag>
                              </div>

                              {/* Assignments */}
                              {(task.assignedLeaderName || task.assignments?.length > 0) && (
                                <div className="rounded-xl bg-gray-50 p-3 mt-1 flex flex-col gap-2 border border-gray-100">
                                  {task.assignedLeaderName && (
                                    <div className="flex items-center gap-2">
                                      <UserOutlined className="text-green-600" />
                                      <Text className="text-xs">
                                        <span className="font-semibold">Farm Leader:</span> {task.assignedLeaderName}
                                      </Text>
                                    </div>
                                  )}
                                  {task.assignments?.filter(f => !f.isLeader).length > 0 && (
                                    <div className="flex items-start gap-2">
                                      <TeamOutlined className="text-blue-600 mt-1" />
                                      <div className="flex-1">
                                        <Text className="text-xs font-semibold mb-1 block">
                                          Farmers ({task.assignments.filter(f => !f.isLeader).length}):
                                        </Text>
                                        <div className="flex flex-wrap gap-1">
                                          {task.assignments.filter(f => !f.isLeader).map(f => (
                                            <Tag key={f.userId || f.id} color="blue" bordered={false} className="rounded-md m-0">
                                              {f.fullName || f.name}
                                            </Tag>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}


                              {/* Actions */}
                              <div className="flex items-center gap-2 mt-2 pt-3 border-t border-gray-100">
                                {task.status === 'PENDING' && (
                                  <>
                                    <Button
                                      type="primary"
                                      size="small"
                                      className="bg-blue-600 rounded-lg"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setAssignTaskData(task)
                                        setAssignModalOpen(true)
                                      }}
                                    >
                                      {task.assignedLeaderId ? 'Cập nhật phân công' : 'Phân công'}
                                    </Button>
                                    <Button
                                      type="primary"
                                      size="small"
                                      className="bg-green-600 rounded-lg"
                                      disabled={!task.assignedLeaderId && !task.farmLeaderId}
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleActivateTask(task.id)
                                      }}
                                    >
                                      Kích hoạt
                                    </Button>
                                  </>
                                )}
                                {/* IN_PROGRESS / ACTIVE: đang thực hiện */}
                                {(task.status === 'IN_PROGRESS' || task.status === 'ACTIVE') && (
                                  <Button
                                    type="default"
                                    size="small"
                                    className="rounded-lg text-blue-600 border-blue-200 hover:border-blue-400"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setAssignTaskData(task)
                                      setAssignModalOpen(true)
                                    }}
                                  >
                                    Cập nhật phân công
                                  </Button>
                                )}
                              </div>
                            </div>
                          </Card>
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
                    <Form
                      form={taskForm}
                      layout="vertical"
                      initialValues={{
                        tasks: [{ taskCatalogId: null, name: '', description: '' }],
                      }}
                    >
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
                                  name={[name, 'taskCatalogId']}
                                  label="Chọn từ danh mục"
                                  className="!mb-3"
                                >
                                  <Select
                                    allowClear
                                    showSearch
                                    optionFilterProp="label"
                                    placeholder="Chọn công việc có sẵn (hoặc để trống để tạo mới)"
                                    options={taskCatalogOptions}
                                    onChange={(value) => {
                                      const catalog = taskCatalogOptions.find((o) => o.value === value)
                                      const list = taskForm.getFieldValue('tasks') || []
                                      list[name] = {
                                        ...list[name],
                                        taskCatalogId: value || null,
                                        name: catalog?.label || list[name]?.name || '',
                                        description: catalog?.description || list[name]?.description || '',
                                      }
                                      taskForm.setFieldsValue({ tasks: [...list] })
                                    }}
                                  />
                                </Form.Item>
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
                            <Button
                              type="dashed"
                              onClick={() => add({ taskCatalogId: null, name: '', description: '' })}
                              block
                              icon={<PlusOutlined />}
                              className="mb-3 text-green-600 border-green-300 hover:border-green-500"
                            >
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
                                  <Text strong style={{ fontSize: 13 }}>{task.name || task.taskCatalogName}</Text>
                                </div>
                                <Tag color="success">Hoàn thành</Tag>
                              </div>
                              <Alert
                                message="Nhật ký chính thức xem qua Biên soạn / leader-summary API"
                                type="info"
                                showIcon
                                className="rounded-lg"
                              />
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

      <AssignTaskModal
        open={assignModalOpen}
        onCancel={() => setAssignModalOpen(false)}
        onSuccess={() => {
          setAssignModalOpen(false)
          loadData() // Refresh parent data
        }}
        task={assignTaskData}
        planId={planId}
        stageId={selectedId}
      />
    </div>
  )
}

export default StageTaskManagementTab
