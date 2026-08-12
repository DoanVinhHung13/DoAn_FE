import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  ArrowDownOutlined,
  ArrowUpOutlined,
  EditOutlined,
  InfoCircleOutlined,
  PlusOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons"
import {
  Alert,
  AutoComplete,
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
  Modal,
  Row,
  Select,
  Tag,
  Typography,
} from "antd"
import { useEffect, useState } from "react"
import { ROLES } from "src/constants/roles"
import { useCultivationStatus } from "src/hooks/useCultivationStatus"
import CultivationTaskService from "src/services/CultivationTaskService"
import TaskCatalogService from "src/services/TaskCatalogService"
import UserService from "src/services/UserService"
import {
  canReorderStageTasks,
  canReorderTaskList,
  canReorderTask,
} from "src/utils/cultivationStatus"
import { getTaskOrder, orderTasks } from "src/utils/cultivationOrdering"
import { formatDate } from "src/utils/dateFormatters"
import { getUserDisplayName } from "src/utils/userDisplayName"
import AssignTaskModal from "./AssignTaskModal"

const { Text } = Typography

const unwrap = res => res?.data?.data ?? res?.data ?? res

const taskStatusIcon = s =>
  s === "COMPLETED" ||
    s === "WAITING_APPROVAL" ||
    s === "IN_PROGRESS" ||
    s === "ASSIGNED" ||
    s === "ACTIVE" ? (
    <CheckCircleOutlined />
  ) : (
    <ClockCircleOutlined />
  )

// Item trong danh sách "Lộ trình sản xuất" bên trái
const StageListItem = ({ stage, index, isActive, onClick, getStageStatus }) => {
  const cfg = getStageStatus(stage.status)
  return (
    <List.Item
      onClick={onClick}
      className="supervisor-stage-item px-4 py-2 mb-2 transition-colors cursor-pointer rounded-xl"
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
            className={`font-semibold ${isActive ? "text-green-700" : "text-gray-800"} whitespace-normal text-sm`}
          >
            {stage.stageName || stage.name || `Giai đoạn ${index + 1}`}
          </Text>
        }
        description={
          <div className="flex flex-col mt-1 ">
            <Tag color={cfg.color} className="supervisor-stage-status" style={{ margin: 0, fontSize: 10 }}>
              {cfg.label}
            </Tag>
          </div>
        }
      />
    </List.Item>
  )
}

const StageTaskManagementTab = ({ plan, planId, stages, tasks, loadData }) => {
  const { getStageStatus, getTaskStatus } = useCultivationStatus()
  const getTaskCfg = s => ({ ...getTaskStatus(s), icon: taskStatusIcon(s) })
  const [selectedId, setSelectedId] = useState(null)
  const [editingTaskId, setEditingTaskId] = useState(null)
  const [taskForm] = Form.useForm()
  const [savingTask, setSavingTask] = useState(false)
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [assignTaskData, setAssignTaskData] = useState(null)
  const [taskCatalogOptions, setTaskCatalogOptions] = useState([])
  const [leaders, setLeaders] = useState([])
  const [farmers, setFarmers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [editTaskModal, setEditTaskModal] = useState({
    open: false,
    task: null,
  })
  const [editTaskForm] = Form.useForm()
  const [savingEdit, setSavingEdit] = useState(false)
  const [savingOrder, setSavingOrder] = useState(false)

  useEffect(() => {
    const loadCatalogs = async () => {
      try {
        const res = await TaskCatalogService.getTaskCatalogs({
          PageIndex: 1,
            PageSize: 100,
          CropCatalogId: plan?.cropCatalogId,
          CropId: plan?.cropId,
        })
        const data = unwrap(res)
        const items = Array.isArray(data) ? data : data?.items || []
        setTaskCatalogOptions(
          items
            .filter(
              item =>
                !(
                  String(item.name || "").trim().toLowerCase() === "thu hoạch" &&
                  item.activityType !== "HARVESTING"
                ),
            )
            .map(item => ({
            value: item.id,
            label: item.name,
            description: item.description,
            activityType: item.activityType,
            })),
        )
      } catch {
        setTaskCatalogOptions([])
      }
    }
    loadCatalogs()
  }, [plan?.cropCatalogId, plan?.cropId])

  useEffect(() => {
    let isMounted = true
    const fetchUsers = async () => {
      setLoadingUsers(true)
      try {
        const [leadersRes, farmersRes] = await Promise.all([
          UserService.getUsers({
            PageIndex: 1,
            PageSize: 100,
            Role: ROLES.FARMER_LEADER,
            IsActive: true,
          }).catch(() => ({ data: { items: [] } })),
          UserService.getUsers({
            PageIndex: 1,
            PageSize: 100,
            Role: ROLES.FARMER,
            IsActive: true,
          }).catch(() => ({ data: { items: [] } })),
        ])
        if (!isMounted) return
        const normalize = res => {
          const list = res?.data?.items ?? res?.data?.data ?? res?.data ?? []
          return Array.isArray(list)
            ? list.filter(u => u.isActive !== false)
            : []
        }
        setLeaders(
          normalize(leadersRes).map(u => ({
            value: u.id,
            label: u.fullName || u.name,
          })),
        )
        setFarmers(
          normalize(farmersRes).map(u => ({
            value: u.id,
            label: u.fullName || u.name,
          })),
        )
      } catch {
        // User options are optional for this form.
      } finally {
        if (isMounted) setLoadingUsers(false)
      }
    }
    fetchUsers()
    return () => {
      isMounted = false
    }
  }, [])

  const handleActivateTask = async taskId => {
    try {
      await CultivationTaskService.start(taskId)
      loadData()
    } catch {
      // axios interceptor handles error notification
    }
  }

  const handleDeleteTask = task => {
    Modal.confirm({
      title: "Xóa công việc chưa kích hoạt?",
      content: `Công việc “${task.name || task.taskName}” sẽ được xóa khỏi kế hoạch.`,
      okText: "Xóa công việc",
      cancelText: "Hủy",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await CultivationTaskService.remove(task.id)
          message.success("Đã xóa công việc.")
          await loadData()
        } catch {
          // axios interceptor handles error notification
        }
      },
    })
  }

  // Mở đúng giai đoạn đang thực hiện; nếu chưa có thì chọn giai đoạn chưa hoàn thành đầu tiên.
  useEffect(() => {
    if (stages.length > 0 && !selectedId) {
      const currentStage =
        stages.find(s => s.status === "ACTIVE" || s.status === "IN_PROGRESS") ||
        stages.find(s => !["COMPLETED", "CANCELLED"].includes(s.status)) ||
        stages[stages.length - 1]
      setSelectedId(currentStage?.id ?? null)
    }
  }, [stages, selectedId])

  const selectedStage = stages.find(s => s.id === selectedId) ?? null
  const selectedTasks = selectedId ? tasks[selectedId] || [] : []
  const orderedSelectedTasks = orderTasks(selectedTasks)
  const selectedIdx = stages.findIndex(s => s.id === selectedId)
  const canReorderSelectedStage =
    canReorderStageTasks(selectedStage, plan) &&
    canReorderTaskList(orderedSelectedTasks)

  // ── Handlers ──────────────────────────────────────────────────────────────
  const openAddTask = () => {
    if (selectedStage?.status === "COMPLETED") {
      message.warning("Giai đoạn đã hoàn thành. Không thể thêm công việc mới.")
      return
    }
    setEditingTaskId("new")
    taskForm.setFieldsValue({
      tasks: [
        {
          taskCatalogId: null,
          name: "",
          description: "",
          leaderId: null,
          farmerIds: [],
        },
      ],
    })
  }

  const handleAddTask = async () => {
    try {
      const values = await taskForm.validateFields()
      const taskList = values.tasks || []

      if (!taskList.length) {
        message.warning("Vui lòng thêm ít nhất một công việc")
        return
      }

      setSavingTask(true)

      const validTasks = taskList
        .filter(task => task.taskCatalogId || task.name?.trim())
        .map(task => {
          const catalog = taskCatalogOptions.find(
            o => o.value === task.taskCatalogId,
          )
          return {
            taskCatalogId: task.taskCatalogId || null,
            name: (task.name || catalog?.label || "").trim(),
            description:
              (task.description || catalog?.description || "").trim() || null,
            leaderId: task.leaderId || null,
            farmerIds: Array.isArray(task.farmerIds)
              ? task.farmerIds.filter(Boolean)
              : [],
          }
        })
        .filter(task => task.name)

      if (!validTasks.length) {
        message.warning("Chọn công việc từ danh mục hoặc nhập tên mới")
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
    } catch {
      // axios interceptor handles error notification
    } finally {
      setSavingTask(false)
    }
  }

  const handleMoveTask = async (taskId, direction) => {
    const task = orderedSelectedTasks.find(item => item.id === taskId)
    if (!canReorderSelectedStage || !canReorderTask(task)) {
      message.warning("Chỉ có thể đổi thứ tự công việc ở giai đoạn chưa bắt đầu.")
      return
    }

    const currentIndex = orderedSelectedTasks.findIndex(task => task.id === taskId)
    const targetIndex = currentIndex + direction

    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= orderedSelectedTasks.length) {
      return
    }

    const nextTasks = [...orderedSelectedTasks]
    const [movedTask] = nextTasks.splice(currentIndex, 1)
    nextTasks.splice(targetIndex, 0, movedTask)

    try {
      setSavingOrder(true)
      await CultivationTaskService.reorder(
        {
          cultivationLogbookId: planId,
          cultivationStageId: selectedId,
          taskIds: nextTasks.map(task => task.id),
        },
        {
          stage: selectedStage,
          logbook: plan,
          task,
          tasks: orderedSelectedTasks,
        },
      )
      await loadData()
    } catch {
      // Reordering failures are handled by the shared interceptor.
    } finally {
      setSavingOrder(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card
        bordered={false}
        className="duration-500 shadow-sm rounded-2xl animate-in fade-in slide-in-from-bottom-4"
      >
        <Row gutter={[24, 24]} className="min-h-[520px]">
          {/* Cột trái: Danh sách giai đoạn dạng timeline */}
          <Col
            xs={24}
            lg={9}
            xl={7}
            className="pb-6 border-b border-gray-100 lg:border-b-0 lg:border-r lg:pr-6 lg:pb-0"
          >
            <p className="mb-3 text-xs font-semibold tracking-wide text-gray-500 uppercase">
              Giai đoạn canh tác
            </p>

            {stages.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Chưa có giai đoạn"
                className="mt-8"
              />
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
          <Col xs={24} lg={15} xl={17}>
            {!selectedStage ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Chọn giai đoạn để xem chi tiết"
                className="py-20"
              />
            ) : (
              <div>
                {/* Header giai đoạn */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex-1 min-w-0">
                    <Text className="block text-lg font-bold text-gray-800">
                      {selectedStage.stageName ||
                        selectedStage.name ||
                        `Giai đoạn ${selectedIdx + 1}`}
                    </Text>
                    {/* Ngày dự kiến của giai đoạn */}
                    {(selectedStage.startDate || selectedStage.endDate) && (
                      <Text type="secondary" className="text-sm block mt-0.5">
                        <CalendarOutlined className="mr-1" />
                        <span className="font-medium">Dự kiến:</span>{" "}
                        {selectedStage.startDate
                          ? formatDate(selectedStage.startDate)
                          : "—"}{" "}
                        –{" "}
                        {selectedStage.endDate
                          ? formatDate(selectedStage.endDate)
                          : "Chưa xác định"}
                      </Text>
                    )}
                    {/* Ngày thực tế của giai đoạn */}
                    {(selectedStage.actualStartDate ||
                      selectedStage.actualEndDate) && (
                        <Text type="secondary" className="text-sm block mt-0.5">
                          <CheckCircleOutlined className="mr-1 text-green-600" />
                          <span className="font-medium text-green-700">
                            Thực tế:
                          </span>{" "}
                          {selectedStage.actualStartDate
                            ? formatDate(selectedStage.actualStartDate)
                            : "—"}{" "}
                          –{" "}
                          {selectedStage.actualEndDate
                            ? formatDate(selectedStage.actualEndDate)
                            : "Chưa kết thúc"}
                        </Text>
                      )}
                  </div>
                  <Tag
                    color={getStageStatus(selectedStage.status).color}
                    className="flex-shrink-0"
                  >
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
                <div className="flex items-center justify-between mb-2">
                  <Text className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                    Công việc
                  </Text>
                  <Badge
                    count={selectedTasks.length}
                    color="#16a34a"
                    showZero
                  />
                </div>

                {/* Danh sách công việc */}
                {selectedTasks.length > 0 ? (
                  <List
                    dataSource={orderedSelectedTasks}
                    split={false}
                    renderItem={(task, taskIndex) => {
                      const cfg = getTaskCfg(task.status)
                      return (
                        <List.Item key={task.id} className="mb-4">
                          <Card
                            hoverable
                            className="w-full transition-shadow border-l-4 shadow-sm rounded-2xl hover:shadow-md"
                            style={{
                              borderLeftColor:
                                cfg.color === "processing"
                                  ? "#3b82f6"
                                  : cfg.color === "success"
                                    ? "#16a34a"
                                    : "#d1d5db",
                              borderTop: "1px solid #f3f4f6",
                              borderRight: "1px solid #f3f4f6",
                              borderBottom: "1px solid #f3f4f6",
                            }}
                            bodyStyle={{ padding: "16px" }}
                          >
                            <div className="flex flex-col gap-3">
                              {/* Header */}
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-3">
                                  <div className="flex flex-col items-center gap-1 flex-shrink-0">
                                    <Text className="text-xs font-bold text-green-700">
                                      {getTaskOrder(task, taskIndex + 1)}
                                    </Text>
                                    <div className="flex gap-1">
                                      <Button
                                        type="text"
                                        size="small"
                                        icon={<ArrowUpOutlined />}
                                        aria-label="Đưa công việc lên trước"
                                        title={
                                          canReorderSelectedStage && canReorderTask(task)
                                            ? "Đưa công việc lên trước"
                                            : "Thứ tự đã được khóa"
                                        }
                                        disabled={
                                          savingOrder ||
                                          taskIndex === 0 ||
                                          !canReorderSelectedStage ||
                                          !canReorderTask(task)
                                        }
                                        onClick={e => {
                                          e.stopPropagation()
                                          handleMoveTask(task.id, -1)
                                        }}
                                      />
                                      <Button
                                        type="text"
                                        size="small"
                                        icon={<ArrowDownOutlined />}
                                        aria-label="Đưa công việc xuống sau"
                                        title={
                                          canReorderSelectedStage && canReorderTask(task)
                                            ? "Đưa công việc xuống sau"
                                            : "Thứ tự đã được khóa"
                                        }
                                        disabled={
                                          savingOrder ||
                                          taskIndex === orderedSelectedTasks.length - 1 ||
                                          !canReorderSelectedStage ||
                                          !canReorderTask(task)
                                        }
                                        onClick={e => {
                                          e.stopPropagation()
                                          handleMoveTask(task.id, 1)
                                        }}
                                      />
                                    </div>
                                  </div>
                                  <div
                                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-lg
                                      ${task.status === "COMPLETED"
                                        ? "bg-green-100 text-green-700"
                                        : task.status === "WAITING_APPROVAL"
                                          ? "bg-amber-100 text-amber-700"
                                          : task.status === "IN_PROGRESS" ||
                                            task.status === "ACTIVE"
                                            ? "bg-blue-100 text-blue-700"
                                            : "bg-gray-100 text-gray-500"
                                      }`}
                                  >
                                    {cfg.icon}
                                  </div>
                                  <div>
                                    <Text className="text-sm font-semibold text-gray-800 line-clamp-2">
                                      {task.name || task.taskName}
                                    </Text>
                                    {task.description && (
                                      <Text
                                        type="secondary"
                                        className="text-xs line-clamp-1 mt-0.5"
                                      >
                                        {task.description}
                                      </Text>
                                    )}
                                    {/* Ngày bắt đầu và hoàn thành của task */}
                                    <div className="flex flex-wrap mt-1 gap-x-3">
                                      {task.startDate && (
                                        <Text
                                          type="secondary"
                                          className="text-xs"
                                        >
                                          <CalendarOutlined className="mr-1" />
                                          Bắt đầu: {formatDate(task.startDate)}
                                        </Text>
                                      )}
                                      {task.completedDate && (
                                        <Text className="text-xs text-green-600">
                                          <CheckCircleOutlined className="mr-1" />
                                          Xong: {formatDate(task.completedDate)}
                                        </Text>
                                      )}
                                    </div>
                                    <Text type="secondary" className="block mt-1 text-xs">
                                      Cập nhật bởi: {getUserDisplayName(
                                        task.updatedByName,
                                        task.updatedBy,
                                        task.editedByName,
                                        task.editedBy,
                                        task.createdByName,
                                        task.createdBy,
                                      )}
                                    </Text>
                                  </div>
                                </div>
                                <Tag
                                  color={cfg.color}
                                  className="flex-shrink-0 mt-1"
                                >
                                  {cfg.label}
                                </Tag>
                              </div>

                              {/* Assignments */}
                              {(task.assignedLeaderName ||
                                task.assignments?.length > 0) && (
                                  <div className="flex flex-col gap-2 p-3 mt-1 border border-gray-100 rounded-xl bg-gray-50">
                                    {task.assignedLeaderName && (
                                      <div className="flex items-center gap-2">
                                        <UserOutlined className="text-green-600" />
                                        <Text className="text-xs">
                                          <span className="font-semibold">
                                            Người phụ trách:
                                          </span>{" "}
                                          {task.assignedLeaderName}
                                        </Text>
                                      </div>
                                    )}
                                    {task.assignments?.filter(f => !f.isLeader)
                                      .length > 0 && (
                                        <div className="flex items-start gap-2">
                                          <TeamOutlined className="mt-1 text-blue-600" />
                                          <div className="flex-1">
                                            <Text className="block mb-1 text-xs font-semibold">
                                              Người hỗ trợ (
                                              {
                                                task.assignments.filter(
                                                  f => !f.isLeader,
                                                ).length
                                              }
                                              ):
                                            </Text>
                                            <div className="flex flex-wrap gap-1">
                                              {task.assignments
                                                .filter(f => !f.isLeader)
                                                .map(f => (
                                                  <Tag
                                                    key={f.userId || f.id}
                                                    color="blue"
                                                    bordered={false}
                                                    className="m-0 rounded-md"
                                                  >
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
                              <div className="flex items-center gap-2 pt-3 mt-2 border-t border-gray-100">
                                {["PENDING", "ASSIGNED"].includes(task.status) && (
                                  <>
                                    <Button
                                      type="primary"
                                      size="small"
                                      icon={<EditOutlined />}
                                      onClick={e => {
                                        e.stopPropagation()
                                        editTaskForm.setFieldsValue({
                                          name: task.name || task.taskName,
                                          description: task.description || "",
                                          leaderId:
                                            task.assignedLeaderId || null,
                                          farmerIds:
                                            task.assignments
                                              ?.filter(f => !f.isLeader)
                                              .map(f => f.userId || f.id) || [],
                                        })
                                        setEditTaskModal({ open: true, task })
                                      }}
                                      className="bg-orange-500 border-0 rounded-lg"
                                    >
                                      Sửa
                                    </Button>
                                    <Button
                                      type="primary"
                                      size="small"
                                      className="bg-green-600 rounded-lg"
                                      disabled={
                                        !task.assignedLeaderId &&
                                        !task.farmLeaderId
                                      }
                                      onClick={e => {
                                        e.stopPropagation()
                                        handleActivateTask(task.id)
                                      }}
                                    >
                                      Kích hoạt
                                    </Button>
                                    <Button
                                      danger
                                      size="small"
                                      icon={<DeleteOutlined />}
                                      onClick={e => {
                                        e.stopPropagation()
                                        handleDeleteTask(task)
                                      }}
                                      className="rounded-lg"
                                    >
                                      Xóa
                                    </Button>
                                  </>
                                )}
                                {/* IN_PROGRESS / ACTIVE: đang thực hiện */}
                                {(task.status === "IN_PROGRESS" ||
                                  task.status === "ACTIVE") && (
                                    <Button
                                      type="default"
                                      size="small"
                                      className="text-blue-600 border-blue-200 rounded-lg hover:border-blue-400"
                                      onClick={e => {
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
                {selectedStage.status !== "COMPLETED" && (
                  <Button
                    type="dashed"
                    icon={<PlusOutlined />}
                    onClick={openAddTask}
                    block
                    className="mt-3 text-green-700 border-green-300 rounded-xl hover:border-green-500"
                  >
                    Thêm công việc vào giai đoạn này
                  </Button>
                )}

                {/* Form thêm công việc trực tiếp */}
                {editingTaskId === "new" && (
                  <Card
                    size="small"
                    className="mt-3 border border-gray-200 rounded-xl bg-gray-50"
                    title={
                      <Text strong style={{ fontSize: 13 }}>
                        Công việc mới
                      </Text>
                    }
                  >
                    <Form
                      form={taskForm}
                      layout="vertical"
                      initialValues={{
                        tasks: [
                          { taskCatalogId: null, name: "", description: "" },
                        ],
                      }}
                    >
                      <Form.List name="tasks">
                        {(fields, { add, remove }) => (
                          <>
                            {fields.map(({ key, name, ...restField }) => (
                              <Card
                                key={key}
                                size="small"
                                className="mb-3 border border-gray-200 shadow-sm"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <Text strong>Công việc {name + 1}</Text>
                                  {fields.length > 1 && (
                                    <Button
                                      type="text"
                                      danger
                                      onClick={() => remove(name)}
                                    >
                                      Xóa
                                    </Button>
                                  )}
                                </div>
                                <Form.Item
                                  {...restField}
                                  name={[name, "taskCatalogId"]}
                                  hidden
                                >
                                  <Input />
                                </Form.Item>
                                <Form.Item
                                  {...restField}
                                  name={[name, "name"]}
                                  rules={[
                                    {
                                      required: true,
                                      message: "Nhập tên công việc",
                                    },
                                  ]}
                                  className="!mb-3"
                                >
                                  <AutoComplete
                                    options={taskCatalogOptions.map(catalog => ({
                                      value: catalog.label,
                                      label: catalog.label,
                                      catalog,
                                    }))}
                                    filterOption={(inputValue, option) =>
                                      option?.value
                                        ?.toLowerCase()
                                        .includes(inputValue.toLowerCase())
                                    }
                                    placeholder="Nhập tên công việc (gợi ý từ danh mục)..."
                                    onChange={value => {
                                      const catalog = taskCatalogOptions.find(
                                        item => item.label === value,
                                      )
                                      const list =
                                        taskForm.getFieldValue("tasks") || []
                                      list[name] = {
                                        ...list[name],
                                        taskCatalogId: catalog?.value || null,
                                      }
                                      taskForm.setFieldsValue({
                                        tasks: [...list],
                                      })
                                    }}
                                    onSelect={(_, option) => {
                                      const catalog = option?.catalog
                                      if (!catalog) return
                                      const list =
                                        taskForm.getFieldValue("tasks") || []
                                      list[name] = {
                                        ...list[name],
                                        name: catalog.label,
                                        taskCatalogId: catalog.value,
                                        description: catalog.description || "",
                                      }
                                      taskForm.setFieldsValue({
                                        tasks: [...list],
                                      })
                                    }}
                                  />
                                </Form.Item>
                                <Form.Item
                                  {...restField}
                                  name={[name, "description"]}
                                  className="!mb-3"
                                >
                                  <Input.TextArea
                                    rows={2}
                                    placeholder="Mô tả chi tiết, liều lượng..."
                                  />
                                </Form.Item>
                                <Row gutter={12}>
                                  <Col xs={24} md={12}>
                                    <Form.Item
                                      {...restField}
                                      name={[name, "leaderId"]}
                                      label="Người phụ trách"
                                      className="!mb-3"
                                    >
                                      <Select
                                        allowClear
                                        showSearch
                                        options={leaders}
                                        placeholder="Chọn người phụ trách..."
                                        loading={loadingUsers}
                                        filterOption={(input, option) =>
                                          String(option?.label || "")
                                            .toLowerCase()
                                            .includes(input.toLowerCase())
                                        }
                                      />
                                    </Form.Item>
                                  </Col>
                                  <Col xs={24} md={12}>
                                    <Form.Item
                                      {...restField}
                                      name={[name, "farmerIds"]}
                                      label="Người hỗ trợ"
                                      className="!mb-3"
                                    >
                                      <Select
                                        mode="multiple"
                                        allowClear
                                        showSearch
                                        options={farmers}
                                        placeholder="Chọn người hỗ trợ..."
                                        loading={loadingUsers}
                                        filterOption={(input, option) =>
                                          String(option?.label || "")
                                            .toLowerCase()
                                            .includes(input.toLowerCase())
                                        }
                                      />
                                    </Form.Item>
                                  </Col>
                                </Row>
                              </Card>
                            ))}
                            <Button
                              type="dashed"
                              onClick={() =>
                                add({
                                  taskCatalogId: null,
                                  name: "",
                                  description: "",
                                  leaderId: null,
                                  farmerIds: [],
                                })
                              }
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
                              Lưu {taskForm.getFieldValue("tasks")?.length || 1}{" "}
                              công việc
                            </Button>
                          </div>
                        </Col>
                      </Row>
                    </Form>
                  </Card>
                )}

              </div>
            )}
          </Col>
        </Row>
      </Card>

      {/* Modal Sửa công việc chưa bắt đầu */}
      <Modal
        open={editTaskModal.open}
        title={
          <div className="flex items-center gap-2 font-semibold text-orange-700">
            <EditOutlined />
            Sửa công việc
          </div>
        }
        onCancel={() => setEditTaskModal({ open: false, task: null })}
        onOk={async () => {
          try {
            const values = await editTaskForm.validateFields()
            setSavingEdit(true)
            await CultivationTaskService.update(editTaskModal.task.id, {
              name: values.name,
              description: values.description,
              leaderId: values.leaderId || null,
              farmerIds: Array.isArray(values.farmerIds)
                ? values.farmerIds
                : [],
            })
            setEditTaskModal({ open: false, task: null })
            editTaskForm.resetFields()
            loadData()
          } catch {
            // axios interceptor handles error notification
          } finally {
            setSavingEdit(false)
          }
        }}
        okText="Lưu thay đổi"
        cancelText="Hủy"
        confirmLoading={savingEdit}
        okButtonProps={{ className: "bg-orange-500 border-orange-500" }}
        destroyOnClose
      >
        <Form form={editTaskForm} layout="vertical" className="mt-4">
          <Form.Item
            name="name"
            label="Tên công việc"
            rules={[{ required: true, message: "Nhập tên công việc" }]}
          >
            <Input placeholder="VD: Bón phân đón đòng..." />
          </Form.Item>
          <Form.Item name="description" label="Mô tả chi tiết">
            <Input.TextArea
              rows={3}
              placeholder="Mô tả công việc, liều lượng..."
            />
          </Form.Item>
          <Row gutter={12}>
            <Col xs={24} md={12}>
              <Form.Item name="leaderId" label="Người phụ trách">
                <Select
                  allowClear
                  showSearch
                  options={leaders}
                  placeholder="Chọn người phụ trách..."
                  loading={loadingUsers}
                  filterOption={(input, option) =>
                    String(option?.label || "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="farmerIds" label="Người hỗ trợ">
                <Select
                  mode="multiple"
                  allowClear
                  showSearch
                  options={farmers}
                  placeholder="Chọn người hỗ trợ..."
                  loading={loadingUsers}
                  filterOption={(input, option) =>
                    String(option?.label || "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      <AssignTaskModal
        open={assignModalOpen}
        onCancel={() => setAssignModalOpen(false)}
        onSuccess={() => {
          setAssignModalOpen(false)
          loadData() // Refresh parent data
        }}
        task={assignTaskData}
      />
    </div>
  )
}

export default StageTaskManagementTab
