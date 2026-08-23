import {
  CalendarOutlined,
  CheckCircleFilled,
  CheckCircleOutlined,
  ClockCircleFilled,
  DeleteOutlined,
  EditOutlined,
  FileTextOutlined,
  FilterOutlined,
  PlayCircleFilled,
  PlayCircleOutlined,
  PlusOutlined,
  SearchOutlined,
  SyncOutlined,
  TeamOutlined,
  UserOutlined,
  WarningFilled,
} from "@ant-design/icons"
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  Empty,
  Input,
  Popconfirm,
  Progress,
  Radio,
  Space,
  Tag,
  Tooltip,
  Typography,
} from "antd"
import { useMemo, useState } from "react"
import {
  getCultivationTaskTypeColor,
  getCultivationTaskTypeLabel,
} from "src/constants/cultivationTask"
import { getTaskOrder } from "src/utils/cultivationOrdering"
import { formatDate } from "src/utils/dateFormatters"
import { getUserDisplayName } from "src/utils/userDisplayName"

const { Text, Paragraph } = Typography

/**
 * Task item visual config helper
 */
const getTaskStatusStyle = status => {
  switch (status) {
    case "COMPLETED":
      return {
        badgeColor: "success",
        borderColor: "#16a34a",
        bgLight: "bg-emerald-50/40",
        icon: <CheckCircleFilled className="text-emerald-600 text-lg" />,
      }
    case "IN_PROGRESS":
      return {
        badgeColor: "processing",
        borderColor: "#2563eb",
        bgLight: "bg-blue-50/40",
        icon: <SyncOutlined spin className="text-blue-600 text-lg" />,
      }
    case "WAITING_APPROVAL":
    case "PENDING_REVIEW":
      return {
        badgeColor: "warning",
        borderColor: "#d97706",
        bgLight: "bg-amber-50/40",
        icon: <ClockCircleFilled className="text-amber-500 text-lg" />,
      }
    case "ASSIGNED":
      return {
        badgeColor: "cyan",
        borderColor: "#0891b2",
        bgLight: "bg-cyan-50/40",
        icon: <PlayCircleFilled className="text-cyan-600 text-lg" />,
      }
    default: // PENDING / others
      return {
        badgeColor: "default",
        borderColor: "#9ca3af",
        bgLight: "bg-gray-50/40",
        icon: <ClockCircleFilled className="text-gray-400 text-lg" />,
      }
  }
}

/**
 * Single Task Card Component
 */
const TaskItemCard = ({
  task,
  taskIndex,
  onEditTask,
  onActivateTask,
  onDeleteTask,
  getTaskCfg,
}) => {
  const cfg = getTaskCfg(task.status)
  const style = getTaskStatusStyle(task.status)
  const canEdit = ["PENDING", "ASSIGNED"].includes(task.status)
  const helperAssignments =
    task.assignments?.filter(assignment => !assignment.isLeader) || []

  return (
    <Card
      size="small"
      className={`w-full transition-all duration-200 border rounded-2xl shadow-sm hover:shadow-md ${style.bgLight}`}
      style={{
        borderLeft: `5px solid ${style.borderColor}`,
        borderColor: "#e5e7eb",
      }}
      styles={{ body: { padding: "16px" } }}
    >
      <div className="flex flex-col gap-3">
        {/* Row 1: Header (STT, Icon, Title, Status Tag, Actions) */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Fixed task order */}
            <div className="flex flex-col items-center justify-center flex-shrink-0 bg-white border border-gray-200 rounded-xl p-1 shadow-2xs">
              <Text className="text-xs font-bold text-gray-700 leading-tight">
                #{getTaskOrder(task, taskIndex + 1)}
              </Text>
            </div>

            {/* Status Avatar Icon */}
            <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-white border border-gray-100 shadow-2xs flex-shrink-0 mt-0.5">
              {style.icon}
            </div>

            {/* Title & Category Tags */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Text className="text-base font-bold text-gray-900 leading-snug">
                  {task.name || task.taskName}
                </Text>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                <Tag
                  color={getCultivationTaskTypeColor(task.taskType)}
                  className="text-xs font-medium m-0 rounded-md"
                >
                  {getCultivationTaskTypeLabel(task.taskType)}
                </Tag>
                <Tag
                  color={cfg.color}
                  className="text-xs font-medium m-0 rounded-md"
                >
                  {cfg.label}
                </Tag>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {canEdit ? (
              <>
                <Tooltip title="Chỉnh sửa công việc">
                  <Button
                    type="default"
                    size="small"
                    icon={<EditOutlined />}
                    onClick={e => {
                      e.stopPropagation()
                      onEditTask(task)
                    }}
                    className="rounded-lg text-amber-600 border-amber-300 hover:!border-amber-500 hover:!text-amber-700 bg-white"
                  >
                    Sửa
                  </Button>
                </Tooltip>

                <Tooltip title="Kích hoạt bắt đầu thực hiện công việc">
                  <Button
                    type="primary"
                    size="small"
                    icon={<PlayCircleOutlined />}
                    className="bg-emerald-600 border-emerald-600 rounded-lg hover:!bg-emerald-700 shadow-2xs"
                    onClick={e => {
                      e.stopPropagation()
                      onActivateTask(task.id)
                    }}
                  >
                    Kích hoạt
                  </Button>
                </Tooltip>

                <Popconfirm
                  title="Xóa công việc?"
                  description={`Bạn có chắc muốn xóa công việc "${task.name || task.taskName}"?`}
                  okText="Xóa"
                  cancelText="Hủy"
                  okButtonProps={{ danger: true }}
                  onConfirm={e => {
                    e?.stopPropagation()
                    onDeleteTask(task)
                  }}
                >
                  <Button
                    danger
                    type="text"
                    size="small"
                    icon={<DeleteOutlined />}
                    className="rounded-lg hover:bg-red-50 text-red-500"
                    title="Xóa công việc"
                  />
                </Popconfirm>
              </>
            ) : (
              <span className="text-xs text-gray-400 italic px-2">
                {task.status === "COMPLETED"
                  ? "✓ Đã hoàn thành"
                  : "Đang tiến hành"}
              </span>
            )}
          </div>
        </div>

        {/* Row 2: Mô tả công việc - Hỗ trợ văn bản dài, thu gọn/mở rộng thông minh */}
        {task.description && (
          <div className="bg-white/85 border border-gray-200/80 rounded-xl p-3 shadow-2xs">
            <div className="flex items-start gap-2">
              <FileTextOutlined className="text-gray-400 mt-0.5 text-xs flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <Paragraph
                  ellipsis={{
                    rows: 2,
                    expandable: "collapsible",
                    symbol: expanded => (
                      <span className="inline-flex items-center text-xs font-semibold text-emerald-600 hover:text-emerald-700 ml-1.5 cursor-pointer select-none">
                        {expanded ? "▲ Thu gọn" : "▼ Xem thêm mô tả"}
                      </span>
                    ),
                  }}
                  className="text-xs text-gray-700 !mb-0 whitespace-pre-wrap leading-relaxed"
                >
                  {task.description}
                </Paragraph>
              </div>
            </div>
          </div>
        )}

        {/* Row 3: Cảnh báo kích hoạt / cách ly */}
        {task.isActivationWarning === true && (
          <Alert
            type="warning"
            showIcon
            icon={<WarningFilled className="text-amber-500" />}
            className="rounded-xl border-amber-200 bg-amber-50/90 text-xs py-1.5"
            message="Công việc đã đến ngày dự kiến nhưng chưa được kích hoạt."
          />
        )}

        {/* Row 4: Grid thông tin ngày tháng & nhân sự */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-gray-100 text-xs">
          {/* Cột thời gian */}
          <div className="space-y-1.5">
            {task.plannedStartDate && (
              <div className="flex items-center gap-1.5 text-gray-600">
                <CalendarOutlined className="text-gray-400" />
                <span className="font-medium text-gray-700">Dự kiến:</span>
                <span>{formatDate(task.plannedStartDate)}</span>
              </div>
            )}

            {(task.workStartDate || task.workEndDate || task.completedDate) && (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-emerald-700 font-medium">
                {task.workStartDate && (
                  <span className="flex items-center gap-1">
                    <PlayCircleOutlined className="text-blue-600" />
                    <span>Bắt đầu: {formatDate(task.workStartDate)}</span>
                  </span>
                )}
                {task.workEndDate && (
                  <span>Kết thúc: {formatDate(task.workEndDate)}</span>
                )}
                {task.completedDate && (
                  <span className="flex items-center gap-1 bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md text-[11px]">
                    <CheckCircleOutlined />
                    Xong: {formatDate(task.completedDate)}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Cột nhân sự */}
          <div className="space-y-1.5">
            {task.assignedLeaderName ? (
              <div className="flex items-center gap-1.5">
                <UserOutlined className="text-emerald-600" />
                <span className="font-medium text-gray-700">Phụ trách:</span>
                <Tag
                  color="green"
                  className="m-0 text-xs rounded-md font-medium"
                >
                  {task.assignedLeaderName}
                </Tag>
              </div>
            ) : (
              <div className="text-gray-400 italic">
                Chưa chỉ định người phụ trách
              </div>
            )}

            {helperAssignments.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <TeamOutlined className="text-blue-600" />
                <span className="font-medium text-gray-700">
                  Hỗ trợ ({helperAssignments.length}):
                </span>
                <div className="flex flex-wrap gap-1">
                  {helperAssignments.map(helper => (
                    <Tag
                      key={helper.userId || helper.id}
                      color="blue"
                      bordered={false}
                      className="m-0 text-[11px] rounded-md"
                    >
                      {helper.fullName || helper.name}
                    </Tag>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Row 5: Audit footer */}
        <div className="flex items-center justify-between pt-1 text-[11px] text-gray-400">
          <span>
            Cập nhật bởi:{" "}
            <span className="text-gray-500 font-medium">
              {getUserDisplayName(
                task.updatedByName,
                task.updatedBy,
                task.editedByName,
                task.editedBy,
                task.createdByName,
                task.createdBy,
              )}
            </span>
          </span>
        </div>
      </div>
    </Card>
  )
}

/**
 * StageTaskList Main Component
 */
const StageTaskList = ({
  tasks = [],
  selectedStage,
  hasHarvestTask,
  onEditTask,
  onActivateTask,
  onDeleteTask,
  onOpenAddTask,
  getTaskCfg,
}) => {
  const [filterStatus, setFilterStatus] = useState("ALL")
  const [searchKeyword, setSearchKeyword] = useState("")

  // Thống kê số lượng
  const stats = useMemo(() => {
    const total = tasks.length
    const completed = tasks.filter(t => t.status === "COMPLETED").length
    const inProgress = tasks.filter(
      t => t.status === "IN_PROGRESS" || t.status === "ASSIGNED",
    ).length
    const pending = tasks.filter(t => t.status === "PENDING").length
    const warning = tasks.filter(t => t.isActivationWarning).length
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0

    return { total, completed, inProgress, pending, warning, percent }
  }, [tasks])

  // Lọc và tìm kiếm công việc
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Lọc trạng thái
      if (filterStatus === "PENDING" && task.status !== "PENDING") return false
      if (
        filterStatus === "IN_PROGRESS" &&
        !["IN_PROGRESS", "ASSIGNED"].includes(task.status)
      )
        return false
      if (
        filterStatus === "COMPLETED" &&
        !["COMPLETED", "WAITING_APPROVAL", "PENDING_REVIEW"].includes(
          task.status,
        )
      )
        return false
      if (filterStatus === "WARNING" && !task.isActivationWarning) return false

      // Tìm kiếm từ khóa
      if (searchKeyword.trim()) {
        const keyword = searchKeyword.toLowerCase().trim()
        const name = (task.name || task.taskName || "").toLowerCase()
        const desc = (task.description || "").toLowerCase()
        const leader = (task.assignedLeaderName || "").toLowerCase()
        const helpers = (task.assignments || [])
          .map(a => a.fullName || a.name || "")
          .join(" ")
          .toLowerCase()

        if (
          !name.includes(keyword) &&
          !desc.includes(keyword) &&
          !leader.includes(keyword) &&
          !helpers.includes(keyword)
        ) {
          return false
        }
      }

      return true
    })
  }, [tasks, filterStatus, searchKeyword])

  const canAddTask = selectedStage?.status !== "COMPLETED" && !hasHarvestTask

  return (
    <div className="space-y-4">
      {/* ── 1. Thống kê tiến độ giai đoạn & Tổng quan ── */}
      {tasks.length > 0 && (
        <div className="bg-emerald-50/50 border border-emerald-100/80 rounded-2xl p-3.5 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Text className="text-xs font-semibold text-emerald-900 uppercase tracking-wide">
                Tiến độ công việc giai đoạn
              </Text>
              <Badge
                count={`${stats.completed}/${stats.total}`}
                style={{ backgroundColor: "#16a34a" }}
              />
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-600">
              <span>
                Đang làm:{" "}
                <strong className="text-blue-600">{stats.inProgress}</strong>
              </span>
              <span>•</span>
              <span>
                Chưa làm:{" "}
                <strong className="text-gray-600">{stats.pending}</strong>
              </span>
              <span>•</span>
              <span>
                Hoàn thành:{" "}
                <strong className="text-emerald-600">{stats.completed}</strong>
              </span>
            </div>
          </div>
          <Progress
            percent={stats.percent}
            status={stats.percent === 100 ? "success" : "active"}
            strokeColor={{ "0%": "#10b981", "100%": "#059669" }}
            size="small"
            className="mt-2 mb-0"
          />
        </div>
      )}

      {/* ── 2. Thanh công cụ tìm kiếm và lọc thông minh ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        {/* Bộ lọc trạng thái */}
        {tasks.length > 0 && (
          <Radio.Group
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            size="small"
            buttonStyle="solid"
            className="flex-shrink-0"
          >
            <Radio.Button value="ALL">Tất cả ({stats.total})</Radio.Button>
            <Radio.Button value="PENDING">
              Chưa làm ({stats.pending})
            </Radio.Button>
            <Radio.Button value="IN_PROGRESS">
              Đang làm ({stats.inProgress})
            </Radio.Button>
            <Radio.Button value="COMPLETED">
              Xong ({stats.completed})
            </Radio.Button>
            {stats.warning > 0 && (
              <Radio.Button value="WARNING">
                <span className="text-amber-600 font-semibold">
                  Cảnh báo ({stats.warning})
                </span>
              </Radio.Button>
            )}
          </Radio.Group>
        )}

        {/* Tìm kiếm */}
        {tasks.length > 2 && (
          <Input
            size="small"
            placeholder="Tìm công việc, nhân sự..."
            prefix={<SearchOutlined className="text-gray-400" />}
            value={searchKeyword}
            onChange={e => setSearchKeyword(e.target.value)}
            allowClear
            className="w-full sm:w-56 rounded-lg"
          />
        )}
      </div>

      {/* ── 3. Danh sách công việc ── */}
      {filteredTasks.length > 0 ? (
        <div className="space-y-3">
          {filteredTasks.map((task, index) => (
            <TaskItemCard
              key={task.id}
              task={task}
              taskIndex={index}
              onEditTask={onEditTask}
              onActivateTask={onActivateTask}
              onDeleteTask={onDeleteTask}
              getTaskCfg={getTaskCfg}
            />
          ))}
        </div>
      ) : tasks.length > 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Không tìm thấy công việc nào khớp với bộ lọc."
          className="py-8"
        >
          <Button
            size="small"
            icon={<FilterOutlined />}
            onClick={() => {
              setFilterStatus("ALL")
              setSearchKeyword("")
            }}
          >
            Xóa bộ lọc
          </Button>
        </Empty>
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Chưa có công việc nào trong giai đoạn này."
          className="py-8"
        />
      )}

      {/* ── 4. Nút thêm công việc mới ── */}
      {canAddTask && (
        <Button
          type="dashed"
          icon={<PlusOutlined />}
          onClick={onOpenAddTask}
          block
          className="h-11 font-medium text-emerald-700 border-emerald-300 rounded-xl hover:!border-emerald-500 hover:!text-emerald-800 hover:bg-emerald-50/50 transition-colors shadow-2xs"
        >
          + Thêm công việc vào giai đoạn này
        </Button>
      )}
    </div>
  )
}

export default StageTaskList
