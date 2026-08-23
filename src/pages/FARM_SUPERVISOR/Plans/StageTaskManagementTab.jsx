import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  InfoCircleOutlined,
  MoreOutlined,
  PlusOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons"
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  Divider,
  Dropdown,
  Empty,
  Flex,
  List,
  Modal,
  Row,
  Space,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd"
import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import {
  CULTIVATION_TASK_TYPES,
  getCultivationTaskTypeColor,
  getCultivationTaskTypeLabel,
} from "src/constants/cultivationTask"
import { ROLES } from "src/constants/roles"
import { useCultivationStatus } from "src/hooks/useCultivationStatus"
import CultivationTaskService from "src/services/CultivationTaskService"
import TaskCatalogService from "src/services/TaskCatalogService"
import UserService from "src/services/UserService"
import { getTaskOrder, orderTasks } from "src/utils/cultivationOrdering"
import { formatDate } from "src/utils/dateFormatters"
import { getActiveQuarantineWarnings } from "src/utils/quarantineValidation"
import { getUserDisplayName } from "src/utils/userDisplayName"
import AddTaskFormCard from "./components/AddTaskFormCard"
import ActivateTaskModal from "./components/ActivateTaskModal"
import EditTaskModal from "./components/EditTaskModal"

const { Text, Paragraph } = Typography

const unwrap = res => res?.data?.data ?? res?.data ?? res

const isHarvestTask = task =>
  task?.taskType === CULTIVATION_TASK_TYPES.HARVEST ||
  task?.activityType === "HARVESTING"

const getAllTasks = taskMap => Object.values(taskMap).flat()

const getInitials = name => (name ? name.trim().charAt(0).toUpperCase() : "?")

const taskStatusIcon = s =>
  s === "COMPLETED" ||
  s === "WAITING_APPROVAL" ||
  s === "IN_PROGRESS" ||
  s === "ASSIGNED" ? (
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
            <Tag
              color={cfg.color}
              className="supervisor-stage-status"
              style={{ margin: 0, fontSize: 10 }}
            >
              {cfg.label}
            </Tag>
          </div>
        }
      />
    </List.Item>
  )
}

// Thẻ hiển thị 1 công việc trong danh sách bên phải — Bố cục thiết kế mới 2 cột
const TaskCard = ({
  task,
  taskIndex,
  getTaskCfg,
  onEdit,
  onActivate,
  onDelete,
}) => {
  const cfg = getTaskCfg(task.status)
  const accentColor =
    cfg.color === "processing"
      ? "#3b82f6"
      : cfg.color === "cyan"
        ? "#06b6d4"
        : cfg.color === "success"
          ? "#16a34a"
          : cfg.color === "gold"
            ? "#eab308"
            : "#d1d5db"

  const canEdit = ["PENDING", "ASSIGNED"].includes(task.status)
  const hasActualDates =
    task.workStartDate || task.workEndDate || task.completedDate

  const supportMembers = (task.assignments || []).filter(f => !f.isLeader)

  const menuItems = [
    {
      key: "edit",
      label: "Sửa công việc",
      icon: <EditOutlined />,
      onClick: () => onEdit(task),
    },
    { type: "divider" },
    {
      key: "delete",
      label: "Xóa công việc",
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => onDelete(task),
    },
  ]

  return (
    <Card
      size="small"
      className="w-full shadow-sm rounded-2xl hover:shadow-md transition-shadow bg-white"
      style={{
        borderLeft: `4px solid ${accentColor}`,
        borderTop: "1px solid #f0f0f0",
        borderRight: "1px solid #f0f0f0",
        borderBottom: "1px solid #f0f0f0",
      }}
      styles={{ body: { padding: "14px 18px" } }}
    >
      {/* Top Header: Thứ tự & Tên công việc (Trái) | Loại công việc & Status (Phải) */}
      <Flex
        justify="space-between"
        align="center"
        gap={12}
        className="pb-2.5 border-b border-gray-100"
      >
        <Flex align="center" gap={8} className="flex-1 min-w-0">
          <div className="flex items-center justify-center bg-green-50 border border-green-200 rounded-lg px-2 py-1 shadow-2xs flex-shrink-0 min-w-[32px]">
            <Tooltip title="Thứ tự được cố định theo kế hoạch">
              <span className="text-sm font-bold text-green-800 leading-tight select-none">
                {getTaskOrder(task, taskIndex + 1)}
              </span>
            </Tooltip>
          </div>

          {/* Tên công việc */}
          <Text
            className="text-base font-bold text-gray-800 truncate"
            title={task.name || task.taskName}
          >
            {task.name || task.taskName}
          </Text>
        </Flex>

        {/* Phải: Loại công việc Tag & Status Tag */}
        <Flex align="center" gap={8} className="flex-shrink-0">
          <Tag
            color={getCultivationTaskTypeColor(task.taskType)}
            className="text-xs rounded-md m-0 font-medium"
          >
            {getCultivationTaskTypeLabel(task.taskType)}
          </Tag>
          <Tag
            color={cfg.color}
            className="text-xs rounded-md m-0 font-medium flex items-center gap-1"
          >
            {cfg.icon}
            <span>{cfg.label}</span>
          </Tag>
        </Flex>
      </Flex>

      {/* Body: Chia 2 cột qua đường phân cách dọc */}
      <Row gutter={[20, 12]} className="pt-3">
        {/* Cột trái: Mô tả */}
        <Col xs={24} md={10} className="flex flex-col justify-between">
          <div className="space-y-1.5">
            <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
              Mô tả
            </Text>
            {task.description ? (
              <Paragraph
                className="!mb-0 text-xs text-gray-600 leading-relaxed whitespace-pre-line"
                ellipsis={{
                  rows: 4,
                  expandable: true,
                  symbol: "Xem thêm",
                }}
              >
                {task.description}
              </Paragraph>
            ) : (
              <Text type="secondary" className="text-xs italic text-gray-400">
                Chưa có mô tả
              </Text>
            )}

            {/* Cảnh báo kích hoạt nếu có */}
            {task.isActivationWarning === true && (
              <Alert
                type="warning"
                className="mt-2 py-1 px-2 text-xs rounded-lg"
                message="Đã đến ngày dự kiến kích hoạt nhưng chưa được kích hoạt."
              />
            )}

            {/* Ngày thực tế nếu có */}
            {hasActualDates && (
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 pt-1 text-[11px] text-green-700 font-medium">
                <CheckCircleOutlined className="text-xs" />
                {task.workStartDate && (
                  <span>Bắt đầu: {formatDate(task.workStartDate)}</span>
                )}
                {task.completedDate && (
                  <span>• Hoàn thành: {formatDate(task.completedDate)}</span>
                )}
              </div>
            )}
          </div>
        </Col>

        {/* Cột phải: Dự kiến, người phụ trách, Cập nhật bởi & người hỗ trợ, Nút hành động */}
        <Col
          xs={24}
          md={14}
          className="md:border-l md:border-gray-200 md:pl-5 flex flex-col justify-between space-y-2.5"
        >
          <div className="space-y-2.5">
            {/* Hàng 1: Dự kiến */}
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <CalendarOutlined className="text-gray-400 flex-shrink-0" />
              <span className="font-semibold text-gray-500">Dự kiến:</span>
              <span className="font-medium text-gray-800">
                {task.plannedStartDate
                  ? formatDate(task.plannedStartDate)
                  : "—"}
              </span>
            </div>

            {/* Hàng 2: Người phụ trách và người hỗ trợ cùng 1 dòng */}
            <Flex align="center" justify="space-between" gap={12} wrap="wrap">
              {/* Người phụ trách */}
              <div className="flex items-center gap-1.5 min-w-0">
                <UserOutlined className="text-green-600 text-xs flex-shrink-0" />
                <span className="text-xs font-semibold text-gray-500">
                  Người phụ trách:
                </span>
                {task.assignedLeaderName ? (
                  <Tooltip
                    title={`Người phụ trách: ${task.assignedLeaderName}`}
                  >
                    <Space size={4} align="center" className="min-w-0">
                      <Avatar
                        size={20}
                        style={{
                          backgroundColor: "#16a34a",
                          fontSize: 10,
                          fontWeight: 600,
                        }}
                      >
                        {getInitials(task.assignedLeaderName)}
                      </Avatar>
                      <Text className="text-xs font-medium text-gray-800 truncate max-w-[130px]">
                        {task.assignedLeaderName}
                      </Text>
                    </Space>
                  </Tooltip>
                ) : (
                  <Text
                    type="secondary"
                    className="text-xs italic text-gray-400"
                  >
                    Chưa giao
                  </Text>
                )}
              </div>

              {/* Người hỗ trợ */}
              <div className="flex items-center gap-1.5 min-w-0">
                <TeamOutlined className="text-blue-600 text-xs flex-shrink-0" />
                <span className="text-xs font-semibold text-gray-500">
                  Người hỗ trợ:
                </span>
                {supportMembers.length > 0 ? (
                  <Space size={4} align="center">
                    <Avatar.Group
                      max={{
                        count: 3,
                        style: {
                          color: "#1d4ed8",
                          backgroundColor: "#dbeafe",
                          fontSize: 10,
                        },
                      }}
                      size={20}
                    >
                      {supportMembers.map(f => (
                        <Tooltip
                          key={f.userId || f.id}
                          title={f.fullName || f.name}
                        >
                          <Avatar
                            size={20}
                            style={{
                              backgroundColor: "#3b82f6",
                              fontSize: 10,
                              fontWeight: 600,
                            }}
                          >
                            {getInitials(f.fullName || f.name)}
                          </Avatar>
                        </Tooltip>
                      ))}
                    </Avatar.Group>
                    <Text className="text-xs text-gray-500 font-medium">
                      ({supportMembers.length})
                    </Text>
                  </Space>
                ) : (
                  <Text
                    type="secondary"
                    className="text-xs italic text-gray-400"
                  >
                    Chưa có
                  </Text>
                )}
              </div>
            </Flex>
          </div>

          {/* Hàng 3 (Dưới cùng): Cập nhật bởi (Trái) & Nút Kích hoạt / Menu 3 chấm (Phải) */}
          <Flex
            justify="space-between"
            align="center"
            gap={8}
            className="pt-2 border-t border-gray-100 mt-auto"
          >
            <div className="text-[11px] text-gray-400 truncate">
              <span>
                Cập nhật bởi:{" "}
                <span className="text-gray-600 font-medium">
                  {getUserDisplayName(
                    task.updatedByName,
                    task.updatedBy,
                    task.updatedByUser,
                    task.updatedByFullName,
                    task.lastModifiedByName,
                    task.lastModifiedBy,
                    task.modifiedByName,
                    task.modifiedBy,
                    task.editedByName,
                    task.editedBy,
                    task.createdByName,
                    task.createdBy,
                  )}
                </span>
              </span>
            </div>

            {canEdit && (
              <Flex align="center" gap={8} className="flex-shrink-0">
                <Button
                  type="primary"
                  size="small"
                  className="bg-green-600 border-green-600 rounded-lg hover:!bg-green-700 font-semibold px-3.5 h-7"
                  onClick={e => {
                    e.stopPropagation()
                    onActivate(task.id)
                  }}
                >
                  Kích hoạt
                </Button>
                <Dropdown
                  menu={{ items: menuItems }}
                  trigger={["click"]}
                  placement="bottomRight"
                >
                  <Button
                    size="small"
                    icon={<MoreOutlined />}
                    className="rounded-lg border-gray-200 hover:border-gray-400 h-7 px-2"
                    onClick={e => e.stopPropagation()}
                  />
                </Dropdown>
              </Flex>
            )}
          </Flex>
        </Col>
      </Row>
    </Card>
  )
}

const StageTaskManagementTab = ({ plan, planId, stages, tasks, loadData }) => {
  const { getStageStatus, getTaskStatus } = useCultivationStatus()
  const getTaskCfg = s => ({ ...getTaskStatus(s), icon: taskStatusIcon(s) })
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedId, setSelectedId] = useState(
    () => searchParams.get("stageId") || null,
  )
  const [editingTaskId, setEditingTaskId] = useState(null)
  const [taskCatalogOptions, setTaskCatalogOptions] = useState([])
  const [leaders, setLeaders] = useState([])
  const [farmers, setFarmers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [deletedTaskIds, setDeletedTaskIds] = useState(() => new Set())
  const [editTaskModal, setEditTaskModal] = useState({
    open: false,
    task: null,
  })
  const [activationTask, setActivationTask] = useState(null)

  const handleSelectStage = stageId => {
    setSelectedId(stageId)
    setEditingTaskId(null)
    setSearchParams(
      prev => {
        const next = new URLSearchParams(prev)
        if (stageId) next.set("stageId", stageId)
        else next.delete("stageId")
        return next
      },
      { replace: true },
    )
  }

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
                  String(item.name || "")
                    .trim()
                    .toLowerCase() === "thu hoạch" &&
                  item.activityType !== "HARVESTING"
                ),
            )
            .map(item => ({
              value: item.id,
              label: item.name,
              description: item.description,
              activityType: item.activityType,
              taskType: item.taskType,
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
    const taskToActivate = Object.values(tasks)
      .flat()
      .find(task => task.id === taskId)
    if (!taskToActivate) return
    const quarantineWarnings = Object.values(tasks).flatMap(taskList =>
      taskList.flatMap(task =>
        Array.isArray(task.quarantineWarnings) ? task.quarantineWarnings : [],
      ),
    )

    if (isHarvestTask(taskToActivate)) {
      const allTasks = getAllTasks(tasks)
      const unfinishedTasks = allTasks.filter(
        task => !isHarvestTask(task) && task.status !== "COMPLETED",
      )
      const unfinishedStages = stages.filter(
        stage => stage.id !== finalStage?.id && stage.status !== "COMPLETED",
      )
      const activeQuarantineWarnings =
        getActiveQuarantineWarnings(quarantineWarnings)
      if (unfinishedTasks.length > 0 || unfinishedStages.length > 0) {
        message.warning(
          "Chỉ được kích hoạt thu hoạch sau khi các công việc và giai đoạn trước đã hoàn thành.",
        )
        return
      }
      if (activeQuarantineWarnings.length > 0) {
        message.warning(
          "Không thể kích hoạt công việc thu hoạch khi cây trồng vẫn còn thời gian cách ly nông dược.",
        )
        return
      }
    }

    setActivationTask(taskToActivate)
  }

  const busyUserIds = new Set(
    getAllTasks(tasks)
      .filter(task => ["IN_PROGRESS", "WAITING_APPROVAL"].includes(task.status))
      .filter(task => task.id !== activationTask?.id)
      .flatMap(task => [
        task.assignedLeaderId || task.farmLeaderId,
        ...(task.assignments || []).map(assignment =>
          typeof assignment === "object"
            ? assignment.userId || assignment.id
            : assignment,
        ),
      ])
      .filter(Boolean)
      .map(String),
  )

  const confirmActivation = async (values, shouldAssign) => {
    if (!activationTask) return
    try {
      if (shouldAssign) {
        await CultivationTaskService.assign(
          activationTask.id,
          {
            leaderId: values.farmLeaderId,
            farmerIds: values.farmerIds || [],
          },
          { skipSuccessNotice: true },
        )
      }
      await CultivationTaskService.start(activationTask.id)
      if (isHarvestTask(activationTask)) {
        setEditingTaskId(null)
      }
      setActivationTask(null)
      await loadData()
    } catch {
      // Axios interceptor handles error notification directly from backend response
    }
  }

  const handleDeleteTask = task => {
    Modal.confirm({
      title: "Xóa công việc chưa kích hoạt?",
      content: `Công việc "${task.name || task.taskName}" sẽ được xóa khỏi kế hoạch.`,
      okText: "Xóa công việc",
      cancelText: "Hủy",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await CultivationTaskService.remove(task.id)
          setDeletedTaskIds(current => {
            const next = new Set(current)
            next.add(task.id)
            return next
          })
          await loadData()
        } catch {
          // axios interceptor handles error notification
        }
      },
    })
  }

  // Mở đúng giai đoạn đang thực hiện; nếu chưa có thì chọn giai đoạn chưa hoàn thành đầu tiên.
  useEffect(() => {
    if (stages.length > 0) {
      const stageParam = searchParams.get("stageId")
      const foundSelected = stages.find(s => s.id === selectedId)
      const foundParamStage = stages.find(s => s.id === stageParam)

      if (foundSelected) {
        return
      }

      if (foundParamStage) {
        setSelectedId(foundParamStage.id)
        return
      }

      const currentStage =
        stages.find(s => s.status === "ACTIVE" || s.status === "IN_PROGRESS") ||
        stages.find(s => !["COMPLETED", "CANCELLED"].includes(s.status)) ||
        stages[stages.length - 1]
      if (currentStage?.id) {
        setSelectedId(currentStage.id)
      }
    }
  }, [stages, selectedId, searchParams])

  const selectedStage = stages.find(s => s.id === selectedId) ?? null
  const finalStage = [...stages]
    .filter(stage => !stage.isDeleted)
    .sort((left, right) => (right.stageOrder || 0) - (left.stageOrder || 0))[0]
  const isFinalStage = Boolean(
    selectedStage && selectedStage.id === finalStage?.id,
  )
  const availableTaskCatalogOptions = isFinalStage
    ? taskCatalogOptions
    : taskCatalogOptions.filter(option => option.activityType !== "HARVESTING")
  const selectedTasks = selectedId
    ? (tasks[selectedId] || []).filter(task => !deletedTaskIds.has(task.id))
    : []
  const orderedSelectedTasks = orderTasks(selectedTasks)
  const harvestTask = getAllTasks(tasks).find(isHarvestTask)
  const hasActiveHarvest = Boolean(
    harvestTask && !["PENDING", "ASSIGNED"].includes(harvestTask.status),
  )
  const selectedIdx = stages.findIndex(s => s.id === selectedId)
  // ── Handlers ──────────────────────────────────────────────────────────────
  const openAddTask = () => {
    if (selectedStage?.status === "COMPLETED") {
      message.warning("Giai đoạn đã hoàn thành. Không thể thêm công việc mới.")
      return
    }
    setEditingTaskId("new")
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
                    onClick={() => handleSelectStage(stage.id)}
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
                  <div className="space-y-3">
                    {orderedSelectedTasks.map((task, taskIndex) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        taskIndex={taskIndex}
                        getTaskCfg={getTaskCfg}
                        onEdit={task => setEditTaskModal({ open: true, task })}
                        onActivate={handleActivateTask}
                        onDelete={handleDeleteTask}
                      />
                    ))}
                  </div>
                ) : (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Chưa có công việc nào cho giai đoạn này."
                    className="py-6"
                  />
                )}

                {/* Nút thêm công việc */}
                {selectedStage.status !== "COMPLETED" && !hasActiveHarvest && (
                  <Button
                    type="dashed"
                    icon={<PlusOutlined />}
                    onClick={openAddTask}
                    title="Thêm công việc vào giai đoạn này"
                    block
                    className="mt-3 text-green-700 border-green-300 rounded-xl hover:border-green-500"
                  >
                    Thêm công việc vào giai đoạn này
                  </Button>
                )}

                {/* Form thêm công việc trực tiếp */}
                {editingTaskId === "new" && (
                  <AddTaskFormCard
                    planId={planId}
                    selectedId={selectedId}
                    taskCatalogOptions={taskCatalogOptions}
                    availableTaskCatalogOptions={availableTaskCatalogOptions}
                    leaders={leaders}
                    farmers={farmers}
                    loadingUsers={loadingUsers}
                    onCancel={() => setEditingTaskId(null)}
                    onSaveSuccess={() => {
                      setEditingTaskId(null)
                      loadData()
                    }}
                  />
                )}
              </div>
            )}
          </Col>
        </Row>
      </Card>

      {/* Modal Sửa công việc chưa bắt đầu */}
      <EditTaskModal
        open={editTaskModal.open}
        task={editTaskModal.task}
        leaders={leaders}
        farmers={farmers}
        loadingUsers={loadingUsers}
        onCancel={() => setEditTaskModal({ open: false, task: null })}
        onSaveSuccess={() => {
          setEditTaskModal({ open: false, task: null })
          loadData()
        }}
      />

      <ActivateTaskModal
        open={Boolean(activationTask)}
        task={activationTask}
        leaderOptions={leaders}
        farmerOptions={farmers}
        busyUserIds={busyUserIds}
        onCancel={() => setActivationTask(null)}
        onConfirm={confirmActivation}
      />
    </div>
  )
}

export default StageTaskManagementTab
