/**
 * Farm Leader hub — Công việc của tôi
 * Route: /farm-leader/tasks  (ROUTER.FL_TASKS)
 *
 * Data source:
 * - Left tree panel: GET /api/cultivation-tasks/my-logbook-summaries
 * - Right task panel: GET /api/cultivation-tasks/logbook/{logbookId} (+ optional stageId, statuses params)
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
import { useCallback, useEffect, useMemo, useState } from "react"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

import TitleCustom from "src/components/TitleCustom"
import { useCultivationStatus } from "src/hooks/useCultivationStatus"
import ROUTER from "src/router/ROUTER"
import CultivationTaskService from "src/services/CultivationTaskService"
import { canWriteDailyLog } from "src/utils/cultivationStatus"
import { formatDate } from "src/utils/dateFormatters"
import { getLandPlotNamesDisplay } from "src/utils/helpers"

const { Text, Title, Paragraph } = Typography

const userIdOf = user => user?.id || user?._id || user?.userId
const unwrap = res => res?.data?.data ?? res?.data ?? res

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
        <div className="flex items-center justify-between gap-2 mb-2">
          <h3
            className="text-base font-bold transition-colors text-slate-800 group-hover:text-emerald-700 line-clamp-1"
            title={task.name}
          >
            {task.name}
          </h3>
          <Tag
            color={cfg.color}
            className="rounded-full px-3 py-0.5 text-xs font-semibold m-0 shadow-2xs flex-shrink-0"
          >
            {cfg.label}
          </Tag>
        </div>

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

  // ── State ─────────────────────────────────────────────────────────────────
  const [logbookSummaries, setLogbookSummaries] = useState([])
  const [selectedLogbookId, setSelectedLogbookId] = useState(null)
  const [statusFilter, setStatusFilter] = useState("all")
  const [treeSearch, setTreeSearch] = useState("")

  // Right panel: tasks loaded per logbook
  const [logbookDetail, setLogbookDetail] = useState(null)
  const [tasks, setTasks] = useState([])

  const [loadingSummaries, setLoadingSummaries] = useState(true)
  const [loadingDetail, setLoadingDetail] = useState(false)

  // ── Load left tree panel: logbook summaries ────────────────────────────────
  const loadLogbookSummaries = useCallback(async () => {
    try {
      setLoadingSummaries(true)
      const res = await CultivationTaskService.getMyLogbookSummaries()
      const data = unwrap(res)
      const list = Array.isArray(data) ? data : data?.items || []
      setLogbookSummaries(list)
    } catch (error) {
      console.error(error)
      message.error("Không thể tải danh sách kế hoạch.")
      setLogbookSummaries([])
    } finally {
      setLoadingSummaries(false)
    }
  }, [])

  useEffect(() => {
    loadLogbookSummaries()
  }, [loadLogbookSummaries])

  // ── Auto-select first logbook ─────────────────────────────────────────────
  useEffect(() => {
    if (logbookSummaries.length > 0 && !selectedLogbookId) {
      const first = logbookSummaries[0]
      const id = first.id || first.logbookId || first._id
      setSelectedLogbookId(id)
    }
  }, [logbookSummaries, selectedLogbookId])

  // ── Load right panel: logbook detail + tasks ───────────────────────────────
  const loadLogbookDetail = useCallback(async () => {
    if (!selectedLogbookId) return
    try {
      setLoadingDetail(true)
      const params = {}
      if (statusFilter !== "all") {
        params.statuses = statusFilter
      }
      const res = await CultivationTaskService.getLogbookById(
        selectedLogbookId,
        params,
      )
      const data = unwrap(res)
      setLogbookDetail(data)
      setTasks(Array.isArray(data?.items) ? data.items : [])
    } catch (error) {
      console.error(error)
      message.error("Không thể tải chi tiết kế hoạch.")
      setLogbookDetail(null)
      setTasks([])
    } finally {
      setLoadingDetail(false)
    }
  }, [selectedLogbookId, statusFilter])

  useEffect(() => {
    loadLogbookDetail()
  }, [loadLogbookDetail])

  // ── Tree data (left panel) ────────────────────────────────────────────────
  const treeData = useMemo(() => {
    const keyword = treeSearch.trim().toLowerCase()
    return logbookSummaries
      .filter(lb => {
        if (!keyword) return true
        const name = (lb.logbookName || lb.name || "").toLowerCase()
        return name.includes(keyword)
      })
      .map(summary => {
        const id = summary.id || summary.logbookId || summary._id
        const name = summary.logbookName || summary.name || "Kế hoạch"
        const isSelected = selectedLogbookId === id
        return {
          key: id,
          title: (
            <div className="flex items-center justify-between w-full gap-2 py-1 pr-1">
              <div className="flex flex-col min-w-0">
                <span
                  className={`text-xs font-semibold truncate ${
                    isSelected ? "text-emerald-700" : "text-slate-800"
                  }`}
                  title={name}
                >
                  {name}
                </span>
                <span className="text-[10px] text-slate-400 truncate">
                  {summary.cropName || summary.cropCategoryName || ""}
                </span>
              </div>
              <div className="flex flex-col items-end shrink-0">
                <Tag
                  color={isSelected ? "emerald" : "default"}
                  className="m-0 text-[10px] rounded-full px-2 border-0 font-bold"
                >
                  {summary.totalTasks ?? 0} task
                </Tag>
                <span className="text-[9px] text-emerald-600 font-semibold mt-0.5">
                  {summary.inProgressTasks ?? 0} đang làm
                </span>
              </div>
            </div>
          ),
          icon: (
            <ContainerOutlined
              className={isSelected ? "text-emerald-600" : "text-slate-400"}
            />
          ),
        }
      })
  }, [logbookSummaries, treeSearch, selectedLogbookId])

  // ── Plan stats from summaries (left panel data) ───────────────────────────
  const overallStats = useMemo(() => {
    const totalPlans = logbookSummaries.length
    let totalTasks = 0
    let activeTasks = 0
    let waitingTasks = 0
    let completedTasks = 0

    logbookSummaries.forEach(lb => {
      totalTasks += lb.totalTasks ?? 0
      activeTasks += lb.inProgressTasks ?? 0
      waitingTasks += lb.waitingApprovalTasks ?? 0
      completedTasks += lb.completedTasks ?? 0
    })

    return { totalPlans, totalTasks, activeTasks, waitingTasks, completedTasks }
  }, [logbookSummaries])

  // ── Selected plan stats from logbookDetail (right panel) ──────────────────
  const planStats = useMemo(() => {
    if (!logbookDetail)
      return { total: 0, completed: 0, pct: 0, active: 0, waiting: 0 }
    const total = tasks.length
    const completed = tasks.filter(t => t.status === "COMPLETED").length
    const active = tasks.filter(t =>
      ["IN_PROGRESS", "ACTIVE", "OVERDUE"].includes(t.status),
    ).length
    const waiting = tasks.filter(t => t.status === "WAITING_APPROVAL").length
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0
    return { total, completed, pct, active, waiting }
  }, [logbookDetail, tasks])

  // ── Group tasks by stage for display ─────────────────────────────────────
  const displayedStages = useMemo(() => {
    if (!tasks.length) return []
    const stageMap = new Map()
    tasks.forEach(t => {
      const stId = t.cultivationStageId || t.stageId || "default"
      const stName = t.cultivationStageName || t.stageName || "Giai đoạn"
      if (!stageMap.has(stId)) {
        stageMap.set(stId, { id: stId, name: stName, filteredTasks: [] })
      }
      stageMap.get(stId).filteredTasks.push(t)
    })
    return Array.from(stageMap.values())
  }, [tasks])

  const openTaskLog = taskId => {
    navigate(ROUTER.FL_TASK_LOG.replace(":taskId", taskId))
  }

  const handleTreeSelect = selectedKeys => {
    if (!selectedKeys || selectedKeys.length === 0) return
    const key = selectedKeys[0]
    setSelectedLogbookId(key)
  }

  const loading = loadingSummaries
  const isDetailLoading = loadingDetail

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
              onClick={() => {
                loadLogbookSummaries()
                if (selectedLogbookId) loadLogbookDetail()
              }}
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
                    {logbookSummaries.length} Kế hoạch
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
                      selectedKeys={
                        selectedLogbookId ? [selectedLogbookId] : []
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
            {isDetailLoading ? (
              <Skeleton active paragraph={{ rows: 10 }} />
            ) : logbookDetail ? (
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
                        </div>
                        <h2
                          className="mb-0 text-xl font-bold text-white sm:text-2xl"
                          title={
                            logbookDetail.name || logbookDetail.logbookName
                          }
                        >
                          {logbookDetail.name || logbookDetail.logbookName}
                        </h2>
                      </div>

                      {/* Status Filter Controls */}
                      <div className="p-1 rounded-xl flex items-center gap-1.5 bg-black/20 border border-white/10 self-start sm:self-center">
                        {[
                          { key: "all", label: "Tất cả" },
                          { key: "IN_PROGRESS", label: "Đang làm" },
                          { key: "WAITING_APPROVAL", label: "Chờ duyệt" },
                          { key: "COMPLETED", label: "Hoàn thành" },
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

                    {/* Thông tin chi tiết Kế hoạch */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 p-3.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-xs text-slate-100">
                      <div className="flex items-center gap-2">
                        <CheckCircleOutlined className="text-sm text-emerald-400 shrink-0" />
                        <div className="overflow-hidden">
                          <span className="text-[10px] text-slate-300 uppercase font-semibold block">
                            Cây trồng
                          </span>
                          <span
                            className="block font-bold text-white truncate"
                            title={
                              logbookDetail.cropName || logbookDetail.crop?.name
                            }
                          >
                            {logbookDetail.cropName ||
                              logbookDetail.crop?.name || (
                                <i className="font-normal text-slate-400">
                                  Chưa có
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
                              logbookDetail.cropCategoryName ||
                              logbookDetail.cropCategory?.name
                            }
                          >
                            {logbookDetail.cropCategoryName ||
                              logbookDetail.cropCategory?.name || (
                                <i className="font-normal text-slate-400">
                                  Chưa có
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
                            title={getLandPlotNamesDisplay(
                              logbookDetail,
                              "Chưa cập nhật",
                            )}
                          >
                            {getLandPlotNamesDisplay(
                              logbookDetail,
                              "Chưa cập nhật",
                            )}
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
                          <div className="flex items-center gap-2 px-4 py-3 bg-white border rounded-xl border-slate-200/80 shadow-2xs">
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
                                Không có công việc nào trong giai đoạn này.
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
