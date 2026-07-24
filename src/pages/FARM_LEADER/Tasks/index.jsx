/**
 * Farm Leader hub — Công việc của tôi
 * Route: /farm-leader/tasks  (ROUTER.FL_TASKS)
 *
 * Giao diện Split-View cao cấp:
 * - Bên trái: Danh mục Kế hoạch & Giai đoạn dạng Cây (Tree Navigation) có bộ lọc & tìm kiếm.
 * - Bên phải: Banner Kế hoạch được chọn (gồm Cây trồng, Danh mục cây, Vùng trồng, Mô tả) + Thống kê tiến độ + Phân nhóm Giai đoạn & Công việc chi tiết.
 */
import {
  CalendarOutlined,
  CheckCircleOutlined,
  ContainerOutlined,
  CrownOutlined,
  EnvironmentOutlined,
  EyeOutlined,
  FileTextOutlined,
  NodeIndexOutlined,
  ReloadOutlined,
  SearchOutlined,
  TagsOutlined,
  TeamOutlined,
} from "@ant-design/icons"
import {
  Avatar,
  Button,
  Card,
  Col,
  Empty,
  Input,
  Progress,
  Row,
  Skeleton,
  Tag,
  Tooltip,
  Tree,
  Typography,
  message,
} from "antd"
import { useEffect, useMemo, useState } from "react"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

import TitleCustom from "src/components/TitleCustom"
import { useCultivationStatus } from "src/hooks/useCultivationStatus"
import { getLandPlotNamesDisplay } from "src/utils/helpers"
import ROUTER from "src/router/ROUTER"
import CultivationTaskService from "src/services/CultivationTaskService"
import { canWriteDailyLog } from "src/utils/cultivationStatus"
import { formatDate } from "src/utils/dateFormatters"

const { Text, Title, Paragraph } = Typography

const userIdOf = user => user?.id || user?._id || user?.userId
const unwrap = res => res?.data?.data ?? res?.data ?? res

const ACTIVE_STATUSES = new Set([
  "PENDING",
  "ASSIGNED",
  "IN_PROGRESS",
  "ACTIVE",
  "OVERDUE",
])
const WAITING_STATUSES = new Set(["WAITING_APPROVAL"])
const HISTORY_STATUSES = new Set(["COMPLETED", "CANCELLED"])

const tabOfStatus = status => {
  if (WAITING_STATUSES.has(status)) return "waiting"
  if (HISTORY_STATUSES.has(status)) return "history"
  if (ACTIVE_STATUSES.has(status)) return "active"
  return "active"
}

/**
 * Modern Task Card Component
 */
const TaskCard = ({ task, onOpen, getTaskStatus }) => {
  const cfg = getTaskStatus(task.status)
  const canLog = canWriteDailyLog(task.status)
  const progress = task.progress ?? 0

  let ctaLabel = "Xem chi tiết"
  let ctaIcon = <EyeOutlined />
  let ctaStyle = "bg-slate-800 hover:bg-slate-900 text-white"

  if (canLog) {
    ctaLabel = "Ghi nhật ký hàng ngày"
    ctaIcon = <FileTextOutlined />
    ctaStyle = "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
  } else if (task.status === "WAITING_APPROVAL") {
    ctaLabel = "Xem báo cáo đã gửi"
    ctaIcon = <EyeOutlined />
    ctaStyle = "bg-amber-600 hover:bg-amber-700 text-white shadow-xs"
  } else if (task.status === "PENDING") {
    ctaLabel = "Chưa bắt đầu"
    ctaStyle = "bg-slate-300 text-slate-600 cursor-not-allowed"
  }

  const assignments = task.assignments || []
  const leader =
    assignments.find(a => a.isLeader) ||
    (task.assignedLeaderName
      ? { fullName: task.assignedLeaderName, isLeader: true }
      : null)
  const members = assignments.filter(a => !a.isLeader)

  return (
    <Card
      bordered={false}
      className="flex flex-col justify-between h-full overflow-hidden transition-all duration-300 bg-white border shadow-xs border-slate-200/80 hover:border-emerald-400 hover:shadow-md rounded-2xl group"
      bodyStyle={{
        padding: 0,
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      {/* Top Banner Header */}
      <div className="p-4 transition-colors border-b border-slate-100 bg-gradient-to-r from-slate-50/80 via-emerald-50/15 to-white group-hover:from-emerald-50/30">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <Tag
            color={cfg.color}
            className="rounded-full px-3 py-0.5 text-xs font-semibold m-0 shadow-2xs"
          >
            {cfg.label}
          </Tag>
          {task.taskCatalogName && (
            <Tag
              color="blue"
              className="rounded-full px-2.5 py-0.5 text-[11px] font-medium m-0"
            >
              {task.taskCatalogName}
            </Tag>
          )}
        </div>

        <h3
          className="mb-1 text-base font-bold transition-colors text-slate-800 group-hover:text-emerald-700 line-clamp-1"
          title={task.name}
        >
          {task.name}
        </h3>

        {task.description ? (
          <Paragraph
            type="secondary"
            className="!mb-0 text-xs text-slate-500 line-clamp-2"
            title={task.description}
          >
            {task.description}
          </Paragraph>
        ) : (
          <span className="text-xs italic text-slate-400">
            Không có mô tả chi tiết
          </span>
        )}
      </div>

      {/* Main Body */}
      <div className="p-4 space-y-3.5 flex-1 flex flex-col justify-between">
        <div className="space-y-3">
          {/* Schedule / Dates */}
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100/80 text-xs">
            <Text
              type="secondary"
              className="block text-[10px] uppercase font-semibold text-slate-400"
            >
              Ngày bắt đầu
            </Text>
            <Text strong className="text-xs text-slate-700">
              <CalendarOutlined className="mr-1 text-emerald-600" />
              {task.startDate ? formatDate(task.startDate) : "—"}
            </Text>
          </div>

          {/* Team Assignment */}
          <div className="space-y-1.5 pt-0.5">
            <Text
              type="secondary"
              className="text-xs font-medium text-slate-500 flex items-center gap-1.5"
            >
              <TeamOutlined className="text-emerald-600" /> Thành viên nhóm
            </Text>
            <div className="flex flex-wrap items-center gap-1.5">
              {leader && (
                <Tooltip title={`Trưởng nhóm: ${leader.fullName}`}>
                  <Tag
                    color="gold"
                    className="rounded-full px-2.5 py-0.5 text-xs font-semibold flex items-center gap-1 border-amber-200"
                  >
                    <CrownOutlined className="text-amber-600" />
                    <span className="max-w-[130px] truncate">
                      {leader.fullName}
                    </span>
                  </Tag>
                </Tooltip>
              )}
              {members.length > 0 ? (
                <div className="flex items-center -space-x-1.5 overflow-hidden py-0.5">
                  {members.map((m, idx) => (
                    <Tooltip key={m.userId || idx} title={m.fullName}>
                      <Avatar
                        size={26}
                        className="bg-emerald-600 text-[11px] font-bold border-2 border-white shadow-2xs"
                      >
                        {m.fullName?.charAt(0)?.toUpperCase() || "F"}
                      </Avatar>
                    </Tooltip>
                  ))}
                  <Text type="secondary" className="ml-2 text-xs font-medium">
                    +{members.length} người
                  </Text>
                </div>
              ) : (
                !leader && (
                  <Text
                    type="secondary"
                    className="text-xs italic text-slate-400"
                  >
                    Chưa phân công
                  </Text>
                )
              )}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <Button
          type="primary"
          icon={ctaIcon}
          disabled={task.status === "PENDING"}
          onClick={() => {
            if (task.status === "PENDING") {
              message.info("Công việc chưa được kích hoạt.")
              return
            }
            onOpen(task.id)
          }}
          className={`w-full h-9 rounded-xl font-semibold border-0 mt-3 transition-all ${ctaStyle}`}
        >
          {ctaLabel}
        </Button>
      </div>
    </Card>
  )
}

const FarmLeaderTasks = () => {
  const navigate = useNavigate()
  const { getTaskStatus } = useCultivationStatus()
  const user = useSelector(state => state.appGlobal.userInfo)
  const currentUserId = userIdOf(user)

  const [loading, setLoading] = useState(true)
  const [tasks, setTasks] = useState([])
  const [treeSearch, setTreeSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all") // 'all' | 'active' | 'waiting' | 'history'
  const [selectedLogbookId, setSelectedLogbookId] = useState(null)
  const [selectedStageId, setSelectedStageId] = useState("all")
  const [expandedKeys, setExpandedKeys] = useState([])

  // Load task list for Farm Leader
  const loadTasksData = async () => {
    try {
      setLoading(true)
      const response = await CultivationTaskService.getAll({
        farmLeaderId: currentUserId,
        PageIndex: 1,
        PageSize: 1000,
      })
      const data = unwrap(response)
      const tasksList = Array.isArray(data) ? data : data?.items || []
      setTasks(tasksList)
    } catch (error) {
      console.error(error)
      message.error(error.message || "Không thể tải danh sách công việc.")
      setTasks([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (currentUserId) {
      loadTasksData()
    } else {
      setLoading(false)
    }
  }, [currentUserId])

  // Group tasks by Logbook -> Stages, capturing metadata for plan details
  const logbooksMap = useMemo(() => {
    const map = new Map()
    tasks.forEach(t => {
      const lbId = t.cultivationLogbookId || "unassigned"
      const lbName = t.cultivationLogbookName || "Kế hoạch khác"

      if (!map.has(lbId)) {
        map.set(lbId, {
          id: lbId,
          name: lbName,
          cropName: t.cropName || t.crop || null,
          cropCategoryName: t.cropCategoryName || t.cropCatalogName || null,
          landPlotName: t.landPlotName || t.fieldLocation || null,
          description:
            t.logbookDescription ||
            t.planDescription ||
            t.descriptionLogbook ||
            null,
          stagesMap: new Map(),
          tasks: [],
        })
      } else {
        const lb = map.get(lbId)
        if (!lb.cropName) lb.cropName = t.cropName || t.crop || null
        if (!lb.cropCategoryName)
          lb.cropCategoryName = t.cropCategoryName || t.cropCatalogName || null
        if (!lb.landPlotName)
          lb.landPlotName = t.landPlotName || t.fieldLocation || null
        if (!lb.description)
          lb.description =
            t.logbookDescription ||
            t.planDescription ||
            t.descriptionLogbook ||
            null
      }

      const lb = map.get(lbId)
      lb.tasks.push(t)

      const stId = t.cultivationStageId || "unassigned-stage"
      const stName = t.cultivationStageName || "Giai đoạn chung"

      if (!lb.stagesMap.has(stId)) {
        lb.stagesMap.set(stId, {
          id: stId,
          name: stName,
          tasks: [],
        })
      }

      lb.stagesMap.get(stId).tasks.push(t)
    })
    return map
  }, [tasks])

  const logbooksList = useMemo(
    () => Array.from(logbooksMap.values()),
    [logbooksMap],
  )

  // Default: Open the 1st plan automatically
  useEffect(() => {
    if (logbooksList.length > 0 && !selectedLogbookId) {
      const firstId = logbooksList[0].id
      setSelectedLogbookId(firstId)
      setExpandedKeys([`plan-${firstId}`])
    }
  }, [logbooksList, selectedLogbookId])

  // Antd Tree Data structure
  const treeData = useMemo(() => {
    const keyword = treeSearch.trim().toLowerCase()

    return logbooksList
      .map(lb => {
        const stagesList = Array.from(lb.stagesMap.values())
        const filteredStages = stagesList.filter(st => {
          if (!keyword) return true
          return (
            lb.name.toLowerCase().includes(keyword) ||
            st.name.toLowerCase().includes(keyword) ||
            st.tasks.some(
              t =>
                t.name.toLowerCase().includes(keyword) ||
                t.description?.toLowerCase()?.includes(keyword),
            )
          )
        })

        if (
          keyword &&
          !lb.name.toLowerCase().includes(keyword) &&
          filteredStages.length === 0
        ) {
          return null
        }

        const isSelectedPlan = selectedLogbookId === lb.id

        return {
          key: `plan-${lb.id}`,
          title: (
            <div className="flex items-center justify-between w-full gap-2 py-1 pr-1">
              <span
                className={`text-xs sm:text-sm font-semibold truncate max-w-[170px] ${isSelectedPlan
                    ? "text-emerald-700 font-bold"
                    : "text-slate-800"
                  }`}
                title={lb.name}
              >
                {lb.name}
              </span>
              <Tag
                color={isSelectedPlan ? "emerald" : "default"}
                className="m-0 text-[10px] rounded-full px-2 border-0 font-bold"
              >
                {lb.tasks.length} task
              </Tag>
            </div>
          ),
          icon: (
            <ContainerOutlined
              className={isSelectedPlan ? "text-emerald-600" : "text-slate-400"}
            />
          ),
          children: filteredStages.map(st => {
            const isSelectedStage = selectedStageId === st.id
            return {
              key: `stage-${lb.id}-${st.id}`,
              title: (
                <div className="flex items-center justify-between gap-2 py-0.5 pr-1 w-full">
                  <span
                    className={`text-xs truncate max-w-[150px] ${isSelectedStage
                        ? "text-emerald-600 font-bold"
                        : "text-slate-600"
                      }`}
                    title={st.name}
                  >
                    {st.name}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    ({st.tasks.length})
                  </span>
                </div>
              ),
              icon: (
                <NodeIndexOutlined
                  className={
                    isSelectedStage ? "text-emerald-600" : "text-slate-400"
                  }
                />
              ),
            }
          }),
        }
      })
      .filter(Boolean)
  }, [logbooksList, treeSearch, selectedLogbookId, selectedStageId])

  // Selected Logbook object
  const selectedLogbook = useMemo(
    () =>
      logbooksList.find(lb => lb.id === selectedLogbookId) ||
      logbooksList[0] ||
      null,
    [logbooksList, selectedLogbookId],
  )

  // Filtered stages & tasks for the right content area
  const displayedStages = useMemo(() => {
    if (!selectedLogbook) return []

    let stages = Array.from(selectedLogbook.stagesMap.values())

    if (selectedStageId !== "all") {
      stages = stages.filter(st => st.id === selectedStageId)
    }

    return stages.map(st => {
      const filteredTasks = st.tasks.filter(t => {
        if (statusFilter === "all") return true
        return tabOfStatus(t.status) === statusFilter
      })

      return {
        ...st,
        filteredTasks,
      }
    })
  }, [selectedLogbook, selectedStageId, statusFilter])

  // Selected Plan Statistics
  const planStats = useMemo(() => {
    if (!selectedLogbook)
      return { total: 0, completed: 0, pct: 0, active: 0, waiting: 0 }
    const total = selectedLogbook.tasks.length
    const completed = selectedLogbook.tasks.filter(
      t => t.status === "COMPLETED",
    ).length
    const active = selectedLogbook.tasks.filter(t =>
      ACTIVE_STATUSES.has(t.status),
    ).length
    const waiting = selectedLogbook.tasks.filter(t =>
      WAITING_STATUSES.has(t.status),
    ).length
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0
    return { total, completed, pct, active, waiting }
  }, [selectedLogbook])

  // Overall Statistics for Dashboard Header
  const overallStats = useMemo(() => {
    const totalPlans = logbooksList.length
    const totalTasks = tasks.length
    const activeTasks = tasks.filter(t => ACTIVE_STATUSES.has(t.status)).length
    const waitingTasks = tasks.filter(t =>
      WAITING_STATUSES.has(t.status),
    ).length
    const completedTasks = tasks.filter(t => t.status === "COMPLETED").length
    return { totalPlans, totalTasks, activeTasks, waitingTasks, completedTasks }
  }, [logbooksList, tasks])

  const openTaskLog = taskId => {
    navigate(ROUTER.FL_TASK_LOG.replace(":taskId", taskId))
  }

  const handleTreeSelect = selectedKeys => {
    if (!selectedKeys || selectedKeys.length === 0) return
    const key = selectedKeys[0]
    if (key.startsWith("plan-")) {
      const lbId = key.replace("plan-", "")
      setSelectedLogbookId(lbId)
      setSelectedStageId("all")
    } else if (key.startsWith("stage-")) {
      const parts = key.split("-")
      const lbId = parts[1]
      const stId = parts.slice(2).join("-")
      setSelectedLogbookId(lbId)
      setSelectedStageId(stId)
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton active paragraph={{ rows: 2 }} />
        <Row gutter={24}>
          <Col span={7}>
            <Skeleton active paragraph={{ rows: 10 }} />
          </Col>
          <Col span={17}>
            <Skeleton active paragraph={{ rows: 10 }} />
          </Col>
        </Row>
      </div>
    )
  }

  return (
    <div className="pb-16 space-y-5 duration-300 animate-in fade-in">
      {/* ── TOP DASHBOARD HEADER ──────────────────────────────────────────────── */}
      <div className="flex flex-col justify-between gap-4 p-5 bg-white border shadow-xs lg:flex-row lg:items-center rounded-2xl border-slate-200/80">
        <div>
          <TitleCustom className="!mb-1 text-xl md:text-2xl flex items-center gap-2">
            <ContainerOutlined className="text-emerald-600" /> Công việc của tôi
          </TitleCustom>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-4 gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200/60 text-xs">
            <div className="px-3 py-1 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Kế hoạch
              </span>
              <span className="text-sm font-bold text-slate-800">
                {overallStats.totalPlans}
              </span>
            </div>
            <div className="px-3 py-1 text-center border-l border-slate-200">
              <span className="text-[10px] uppercase font-bold text-emerald-500 block">
                Đang làm
              </span>
              <span className="text-sm font-bold text-emerald-600">
                {overallStats.activeTasks}
              </span>
            </div>
            <div className="px-3 py-1 text-center border-l border-slate-200">
              <span className="text-[10px] uppercase font-bold text-amber-500 block">
                Chờ duyệt
              </span>
              <span className="text-sm font-bold text-amber-600">
                {overallStats.waitingTasks}
              </span>
            </div>
            <div className="px-3 py-1 text-center border-l border-slate-200">
              <span className="text-[10px] uppercase font-bold text-blue-500 block">
                Hoàn thành
              </span>
              <span className="text-sm font-bold text-blue-600">
                {overallStats.completedTasks}
              </span>
            </div>
          </div>

          <Tooltip title="Tải lại dữ liệu">
            <Button
              icon={<ReloadOutlined />}
              onClick={loadTasksData}
              className="h-10 px-4 font-medium rounded-xl border-slate-200 hover:border-emerald-500 hover:text-emerald-600"
            >
              Làm mới
            </Button>
          </Tooltip>
        </div>
      </div>

      {tasks.length === 0 ? (
        <Card className="p-12 text-center border-0 shadow-xs rounded-2xl">
          <Empty description="Bạn chưa được phân công công việc nào." />
        </Card>
      ) : (
        /* ── MAIN SPLIT-VIEW LAYOUT ────────────────────────────────────────────── */
        <Row gutter={[20, 20]}>
          {/* LEFT SIDEBAR: TREE NAVIGATION */}
          <Col xs={24} lg={8} xl={7}>
            <Card
              bordered={false}
              className="sticky border shadow-xs rounded-2xl border-slate-200/80 top-4"
              bodyStyle={{ padding: "16px" }}
            >
              <div className="space-y-3.5">
                {/* Tree Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-800">
                      Danh mục Kế hoạch
                    </span>
                  </div>
                  <Tag
                    color="emerald"
                    className="m-0 rounded-full font-semibold border-0 px-2.5"
                  >
                    {logbooksList.length} Kế hoạch
                  </Tag>
                </div>

                {/* Tree Search Bar */}
                <Input
                  prefix={<SearchOutlined className="text-slate-400" />}
                  placeholder="Tìm kế hoạch, giai đoạn..."
                  value={treeSearch}
                  onChange={e => setTreeSearch(e.target.value)}
                  allowClear
                  className="text-xs rounded-xl h-9 bg-slate-50 border-slate-200 hover:bg-white focus:bg-white"
                />

                {/* Tree View */}
                <div className="max-h-[calc(100vh-290px)] overflow-y-auto pr-1">
                  {treeData.length > 0 ? (
                    <Tree
                      blockNode
                      defaultExpandAll
                      expandedKeys={expandedKeys}
                      onExpand={keys => setExpandedKeys(keys)}
                      selectedKeys={
                        selectedStageId !== "all"
                          ? [`stage-${selectedLogbookId}-${selectedStageId}`]
                          : [`plan-${selectedLogbookId}`]
                      }
                      onSelect={handleTreeSelect}
                      treeData={treeData}
                      className="text-sm bg-transparent custom-tree-style"
                    />
                  ) : (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description="Không tìm thấy kế hoạch"
                    />
                  )}
                </div>
              </div>
            </Card>
          </Col>

          {/* RIGHT CONTENT AREA: SELECTED PLAN HEADER & STAGE TASKS */}
          <Col xs={24} lg={16} xl={17}>
            {selectedLogbook ? (
              <div className="space-y-5">
                {/* ── SELECTED PLAN HERO BANNER ────────────────────────────────── */}
                <Card
                  bordered={false}
                  className="overflow-hidden text-white border-0 shadow-xs rounded-2xl bg-gradient-to-r from-emerald-900 via-teal-800 to-slate-900"
                  bodyStyle={{ padding: "22px" }}
                >
                  <div className="space-y-4">
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <Tag className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30 rounded-full text-xs font-semibold px-2.5">
                            Kế hoạch đang chọn
                          </Tag>
                          {selectedStageId !== "all" && (
                            <Tag className="bg-blue-500/20 text-blue-300 border-blue-400/30 rounded-full text-xs font-semibold px-2.5">
                              Lọc theo Giai đoạn
                            </Tag>
                          )}
                        </div>
                        <h2
                          className="mb-0 text-xl font-bold text-white sm:text-2xl"
                          title={selectedLogbook.name}
                        >
                          {selectedLogbook.name}
                        </h2>
                      </div>

                      {/* Status Filter Controls */}
                      <div className="p-1 rounded-xl flex items-center gap-1.5 bg-black/20 border border-white/10 self-start sm:self-center">
                        {[
                          { key: "all", label: "Tất cả" },
                          { key: "active", label: "Đang làm" },
                          { key: "waiting", label: "Chờ duyệt" },
                          { key: "history", label: "Hoàn thành" },
                        ].map(item => {
                          const isActive = statusFilter === item.key
                          return (
                            <button
                              key={item.key}
                              type="button"
                              onClick={() => setStatusFilter(item.key)}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border-0 outline-none"
                              style={{
                                backgroundColor: isActive
                                  ? "#10b981"
                                  : "rgba(255, 255, 255, 0.12)",
                                color: isActive ? "#ffffff" : "#e2e8f0",
                                border: isActive
                                  ? "none"
                                  : "1px solid rgba(255, 255, 255, 0.15)",
                              }}
                            >
                              {item.label}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Thông tin chi tiết Kế hoạch (giống Supervisor view) — Thiết kế sẵn các ô chờ BE trả về API */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 p-3.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-xs text-slate-100">
                      <div className="flex items-center gap-2">
                        <CheckCircleOutlined className="text-sm text-emerald-400 shrink-0" />
                        <div className="overflow-hidden">
                          <span className="text-[10px] text-slate-300 uppercase font-semibold block">
                            Cây trồng
                          </span>
                          <span
                            className="block font-bold text-white truncate"
                            title={selectedLogbook.cropName || "BE: cropName"}
                          >
                            {selectedLogbook.cropName || (
                              <i className="font-normal text-slate-400">
                                Chưa có (BE: cropName)
                              </i>
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <TagsOutlined className="text-sm text-emerald-400 shrink-0" />
                        <div className="overflow-hidden">
                          <span className="text-[10px] text-slate-300 uppercase font-semibold block">
                            Danh mục cây
                          </span>
                          <span
                            className="block font-bold text-white truncate"
                            title={
                              selectedLogbook.cropCategoryName ||
                              "BE: cropCategoryName"
                            }
                          >
                            {selectedLogbook.cropCategoryName || (
                              <i className="font-normal text-slate-400">
                                Chưa có (BE: cropCategoryName)
                              </i>
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <EnvironmentOutlined className="text-sm text-emerald-400 shrink-0" />
                        <div className="overflow-hidden">
                          <span className="text-[10px] text-slate-300 uppercase font-semibold block">
                            Vùng trồng
                          </span>
                          <span
                            className="block font-bold text-white truncate"
                            title={getLandPlotNamesDisplay(selectedLogbook, "Chưa cập nhật")}
                          >
                            {getLandPlotNamesDisplay(selectedLogbook, "Chưa cập nhật")}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar & Quick Stats */}
                    <div className="grid grid-cols-2 gap-3 pt-2 text-xs border-t sm:grid-cols-4 border-white/10">
                      <div>
                        <span className="text-slate-300 text-[11px] block">
                          Tổng số task
                        </span>
                        <span className="text-lg font-bold text-white">
                          {planStats.total}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-300 text-[11px] block">
                          Đang thực hiện
                        </span>
                        <span className="text-lg font-bold text-emerald-300">
                          {planStats.active}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-300 text-[11px] block">
                          Chờ phê duyệt
                        </span>
                        <span className="text-lg font-bold text-amber-300">
                          {planStats.waiting}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-300 text-[11px] block">
                          Tiến độ chung
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Progress
                            percent={planStats.pct}
                            strokeColor="#34d399"
                            trailColor="rgba(255,255,255,0.2)"
                            size="small"
                            showInfo={false}
                          />
                          <span className="font-bold text-emerald-300">
                            {planStats.pct}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* ── STAGE SECTIONS & TASK CARDS ──────────────────────────────── */}
                {displayedStages.length > 0 ? (
                  <div className="space-y-6">
                    {displayedStages.map(stage => {
                      const stageTasks = stage.filteredTasks

                      return (
                        <div key={stage.id} className="space-y-3">
                          {/* Stage Section Header */}
                          <div className="flex items-center justify-between px-4 py-3 bg-white border rounded-xl border-slate-200/80 shadow-2xs">
                            <div className="flex items-center gap-2">
                              <NodeIndexOutlined className="font-bold text-emerald-600" />
                              <span className="text-sm font-bold text-slate-800 md:text-base">
                                {stage.name}
                              </span>
                              <Tag
                                color="blue"
                                className="m-0 text-xs font-semibold border-blue-200 rounded-full"
                              >
                                {stageTasks.length} công việc
                              </Tag>
                            </div>

                            {selectedStageId !== "all" && (
                              <Button
                                type="link"
                                size="small"
                                onClick={() => setSelectedStageId("all")}
                                className="text-xs font-medium text-emerald-600"
                              >
                                Xem tất cả các giai đoạn
                              </Button>
                            )}
                          </div>

                          {/* Task Cards Grid */}
                          {stageTasks.length > 0 ? (
                            <div className="grid gap-4 md:grid-cols-2">
                              {stageTasks.map(task => (
                                <TaskCard
                                  key={task.id}
                                  task={task}
                                  onOpen={openTaskLog}
                                  getTaskStatus={getTaskStatus}
                                />
                              ))}
                            </div>
                          ) : (
                            <div className="p-6 text-center border border-dashed bg-slate-50/70 rounded-xl border-slate-200">
                              <Text type="secondary" className="text-xs">
                                Không có công việc nào thuộc bộ lọc này trong
                                giai đoạn này.
                              </Text>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <Card className="p-8 text-center border-0 shadow-xs rounded-2xl">
                    <Empty description="Không có công việc nào phù hợp với bộ lọc." />
                  </Card>
                )}
              </div>
            ) : (
              <Card className="p-12 text-center border-0 shadow-xs rounded-2xl">
                <Empty description="Vui lòng chọn một Kế hoạch ở danh mục bên trái." />
              </Card>
            )}
          </Col>
        </Row>
      )}
    </div>
  )
}

export default FarmLeaderTasks
