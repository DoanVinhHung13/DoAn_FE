/**
 * Farm Leader hub — Công việc của tôi
 * Route: /farm-leader/cultivation-tasks  (ROUTER.FL_TASKS)
 */
import {
  CheckCircleOutlined,
  NodeIndexOutlined,
  ReloadOutlined,
} from "@ant-design/icons"
import {
  Alert,
  Button,
  Card,
  Col,
  Empty,
  Row,
  Skeleton,
  Tag,
  Tooltip,
} from "antd"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"

import TitleCustom from "src/components/TitleCustom"
import { MyTaskIcon } from "src/assets/icon/menu/MenuIcons"
import { useCultivationStatus } from "src/hooks/useCultivationStatus"
import ROUTER from "src/router/ROUTER"
import CultivationLogbookService from "src/services/CultivationLogbookService"
import CultivationTaskService from "src/services/CultivationTaskService"

import TaskCard, { orderTasks } from "./components/TaskCard"
import LogbookTreePanel from "./components/LogbookTreePanel"
import TaskHeaderStats from "./components/TaskHeaderStats"

const unwrap = res => res?.data?.data ?? res?.data ?? res

const getLogbookId = item =>
  item?.id ||
  item?.logbookId ||
  item?.cultivationLogbookId ||
  item?.cultivationPlanId ||
  item?._id

const FarmLeaderTasks = () => {
  const navigate = useNavigate()
  const { getTaskStatus } = useCultivationStatus()

  // ── State ─────────────────────────────────────────────────────────────────
  const [logbookSummaries, setLogbookSummaries] = useState([])
  const [selectedLogbookId, setSelectedLogbookId] = useState(null)
  const [statusFilter, setStatusFilter] = useState("IN_PROGRESS")
  const [treeSearch, setTreeSearch] = useState("")

  const [logbookDetail, setLogbookDetail] = useState(null)
  const [stages, setStages] = useState([])
  const [tasks, setTasks] = useState([])
  const [warningTasks, setWarningTasks] = useState([])

  const [loadingSummaries, setLoadingSummaries] = useState(true)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [summariesError, setSummariesError] = useState(false)
  const [detailError, setDetailError] = useState(false)

  // ── Load left tree panel: logbook summaries ────────────────────────────────
  const loadLogbookSummaries = useCallback(async () => {
    try {
      setLoadingSummaries(true)
      setSummariesError(false)
      const res = await CultivationTaskService.getMyLogbookSummaries(
        undefined,
        {
          errorHandling: "component",
        },
      )
      const data = unwrap(res)
      const list = Array.isArray(data) ? data : data?.items || []
      setLogbookSummaries(list)
    } catch (err) {
      console.error("Error loading logbook summaries:", err)
      setSummariesError(true)
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
    if (logbookSummaries.length > 0) {
      const found = logbookSummaries.find(
        lb => getLogbookId(lb) === selectedLogbookId,
      )
      if (!found || !selectedLogbookId) {
        const first = logbookSummaries[0]
        const id = getLogbookId(first)
        if (id) {
          setSelectedLogbookId(id)
        }
      }
    }
  }, [logbookSummaries, selectedLogbookId])

  // ── Load right panel: logbook detail + tasks ───────────────────────────────
  const loadLogbookDetail = useCallback(async () => {
    if (!selectedLogbookId) return
    try {
      setLoadingDetail(true)
      setDetailError(false)

      let plan = null
      let stagesArr = []

      // 1. Thử lấy qua endpoint chuyên biệt của Leader: /cultivation-tasks/logbook/{logbookId}
      try {
        const res = await CultivationTaskService.getLogbookById(
          selectedLogbookId,
          {},
          { errorHandling: "component" },
        )
        const data = unwrap(res)
        plan = data?.plan ?? (data?.id ? data : null)
        const rawStages =
          data?.stages ||
          data?.cultivationStages ||
          data?.productionStages ||
          []
        stagesArr = Array.isArray(rawStages) ? rawStages : []
      } catch (leaderApiErr) {
        console.warn(
          "CultivationTaskService.getLogbookById failed, trying CultivationLogbookService.getById fallback:",
          leaderApiErr,
        )
      }

      // 2. Fallback nếu endpoint trên lỗi hoặc trả về rỗng: lấy qua /cultivation-logbooks/{id}
      if (!plan || stagesArr.length === 0) {
        try {
          const fallbackRes = await CultivationLogbookService.getById(
            selectedLogbookId,
            { errorHandling: "component" },
          )
          const planData = unwrap(fallbackRes)
          if (planData) {
            plan = plan || planData
            const rawStages =
              planData.cultivationStages ||
              planData.productionStages ||
              planData.stages ||
              []
            stagesArr = Array.isArray(rawStages) ? rawStages : []
          }
        } catch (fallbackErr) {
          console.warn("CultivationLogbookService.getById fallback also failed:", fallbackErr)
        }
      }

      if (!plan && stagesArr.length === 0) {
        throw new Error("Không tìm thấy dữ liệu kế hoạch.")
      }

      // Chuẩn hóa cấu trúc stages
      const normalizedStages = stagesArr.map(s => ({
        stageId: s.stageId || s.id,
        stageName: s.stageName || s.name || "Giai đoạn",
        tasks: Array.isArray(s.tasks) ? s.tasks : [],
        ...s,
      }))

      const flatTasks = normalizedStages.flatMap(s => s.tasks)

      setLogbookDetail(plan)
      setStages(normalizedStages)
      setTasks(flatTasks)
      setWarningTasks(flatTasks)
    } catch (err) {
      console.error("Error loading logbook detail:", err)
      setDetailError(true)
      setLogbookDetail(null)
      setStages([])
      setTasks([])
      setWarningTasks([])
    } finally {
      setLoadingDetail(false)
    }
  }, [selectedLogbookId])

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
        const id = getLogbookId(summary)
        const name = summary.logbookName || summary.name || "Kế hoạch"
        const isSelected = selectedLogbookId === id
        return {
          key: id,
          title: (
            <div className="flex items-center justify-between w-full gap-2 pt-3 pb-1 pr-1">
              <div className="flex flex-col min-w-0">
                <span
                  className={`text-xs font-semibold truncate ${
                    isSelected ? "text-emerald-700" : "text-slate-800"
                  }`}
                  title={name}
                >
                  {name}
                </span>
                <span className="text-[10px] text-slate-700 truncate">
                  {summary.cropName || summary.cropCategoryName || ""}
                </span>
              </div>
              <div className="flex flex-col items-end shrink-0">
                <Tag
                  color={isSelected ? "emerald" : "default"}
                  className="m-0 text-[10px] rounded-full px-2 border-0 font-bold"
                >
                  {summary.totalTasks ?? 0} công việc
                </Tag>
                <span className="text-[9px] text-emerald-600 font-semibold mt-0.5">
                  {summary.inProgressTasks ?? 0} đang làm
                </span>
              </div>
            </div>
          ),
          icon: (
            <span
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
    let completedTasks = 0

    logbookSummaries.forEach(lb => {
      totalTasks += lb.totalTasks ?? 0
      activeTasks += lb.inProgressTasks ?? 0
      completedTasks +=
        (lb.completedTasks ?? 0) + (lb.waitingApprovalTasks ?? 0)
    })

    return { totalPlans, totalTasks, activeTasks, completedTasks }
  }, [logbookSummaries])

  // ── Selected plan stats from logbookDetail (right panel) ──────────────────
  const planStats = useMemo(() => {
    if (!logbookDetail) return { total: 0, completed: 0, pct: 0, active: 0 }
    const total = logbookDetail.totalTasks ?? tasks.length
    const completed =
      logbookDetail.completedTasks ??
      tasks.filter(t => t.status === "COMPLETED").length
    const active =
      logbookDetail.inProgressTasks ??
      tasks.filter(t => t.status === "IN_PROGRESS").length
    const waiting =
      logbookDetail.pendingApprovalTasks ??
      tasks.filter(t => t.status === "WAITING_APPROVAL").length
    const displayedCompleted = completed + waiting
    const pct =
      logbookDetail.overallProgress ??
      (total > 0 ? Math.round((displayedCompleted / total) * 100) : 0)
    return { total, completed: displayedCompleted, pct, active }
  }, [logbookDetail, tasks])

  // ── Stages for display — use API stages directly (already grouped) ─────────
  const displayedStages = useMemo(() => {
    if (stages.length > 0) {
      return stages
        .map(s => ({
          id: s.stageId,
          name: s.stageName,
          filteredTasks: orderTasks(
            (Array.isArray(s.tasks) ? s.tasks : []).filter(
              task =>
                statusFilter === "all" ||
                (["WAITING_APPROVAL", "PENDING_REVIEW"].includes(
                  String(task.status).toUpperCase(),
                )
                  ? "COMPLETED"
                  : task.status) === statusFilter,
            ),
          ),
        }))
        .filter(s => s.filteredTasks.length > 0)
    }

    if (!tasks.length) return []
    const stageMap = new Map()
    tasks
      .filter(
        task =>
          statusFilter === "all" ||
          (["WAITING_APPROVAL", "PENDING_REVIEW"].includes(
            String(task.status).toUpperCase(),
          )
            ? "COMPLETED"
            : task.status) === statusFilter,
      )
      .forEach(t => {
        const stId = t.cultivationStageId || t.stageId || "default"
        const stName = t.cultivationStageName || t.stageName || "Giai đoạn"
        if (!stageMap.has(stId)) {
          stageMap.set(stId, { id: stId, name: stName, filteredTasks: [] })
        }
        stageMap.get(stId).filteredTasks.push(t)
      })
    return Array.from(stageMap.values()).map(stage => ({
      ...stage,
      filteredTasks: orderTasks(stage.filteredTasks),
    }))
  }, [stages, tasks, statusFilter])

  const openTaskLog = taskId => {
    navigate(ROUTER.FL_TASK_LOG.replace(":taskId", taskId))
  }

  const handleTreeSelect = selectedKeys => {
    if (!selectedKeys || selectedKeys.length === 0) return
    const key = selectedKeys[0]
    setSelectedLogbookId(key)
  }

  const quarantineWarnings = useMemo(
    () =>
      warningTasks.flatMap(task =>
        Array.isArray(task.quarantineWarnings) ? task.quarantineWarnings : [],
      ),
    [warningTasks],
  )

  if (loadingSummaries) {
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
      {/* ── TOP DASHBOARD HEADER ── */}
      <div className="flex flex-col justify-between gap-4 p-5 bg-white border shadow-xs lg:flex-row lg:items-center rounded-2xl border-slate-200/80">
        <div>
          <TitleCustom className="!mb-1 text-xl md:text-2xl flex items-center gap-2">
            <MyTaskIcon style={{ fontSize: "24px", color: "#15803d" }} /> Công
            việc của tôi
          </TitleCustom>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200/60 text-xs">
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

      {summariesError ? (
        <Alert
          type="error"
          message="Không thể tải danh sách kế hoạch."
          action={
            <Button size="small" onClick={loadLogbookSummaries}>
              Thử lại
            </Button>
          }
          className="rounded-xl"
        />
      ) : logbookSummaries.length === 0 ? (
        <Card className="p-12 text-center border-0 shadow-xs rounded-2xl">
          <Empty description="Bạn chưa được phân công công việc nào." />
        </Card>
      ) : (
        /* ── MAIN SPLIT-VIEW LAYOUT ── */
        <Row gutter={[20, 20]}>
          {/* LEFT SIDEBAR: TREE NAVIGATION */}
          <Col xs={24} lg={8} xl={7}>
            <LogbookTreePanel
              treeSearch={treeSearch}
              setTreeSearch={setTreeSearch}
              treeData={treeData}
              selectedLogbookId={selectedLogbookId}
              onSelect={handleTreeSelect}
            />
          </Col>

          {/* RIGHT SIDE: TASKS LIST */}
          <Col xs={24} lg={16} xl={17}>
            {loadingDetail ? (
              <div className="p-6 space-y-4 bg-white border shadow-xs rounded-2xl border-slate-200/80">
                <Skeleton active paragraph={{ rows: 3 }} />
                <Skeleton active paragraph={{ rows: 6 }} />
              </div>
            ) : detailError ? (
              <Alert
                type="error"
                message="Không thể tải chi tiết công việc cho kế hoạch này."
                action={
                  <Button size="small" onClick={loadLogbookDetail}>
                    Thử lại
                  </Button>
                }
                className="rounded-xl"
              />
            ) : !selectedLogbookId ? (
              <Card className="p-12 text-center border-0 shadow-xs rounded-2xl">
                <Empty description="Vui lòng chọn một kế hoạch từ danh sách bên trái." />
              </Card>
            ) : (
              <div className="space-y-6">
                <TaskHeaderStats
                  logbookDetail={logbookDetail}
                  planStats={planStats}
                  quarantineWarnings={quarantineWarnings}
                  statusFilter={statusFilter}
                  setStatusFilter={setStatusFilter}
                />

                {/* Stages & Task Grid */}
                {displayedStages.length === 0 ? (
                  <Card className="p-12 text-center border border-dashed rounded-2xl border-slate-300 bg-slate-50/50">
                    <Empty
                      description={
                        <div className="space-y-1">
                          <span className="font-semibold text-slate-600">
                            Không có công việc nào
                          </span>
                          <span className="block text-xs text-slate-400">
                            Không tìm thấy công việc phù hợp với trạng thái đã
                            chọn trong kế hoạch này.
                          </span>
                        </div>
                      }
                    />
                  </Card>
                ) : (
                  displayedStages.map(stage => (
                    <div key={stage.id} className="space-y-3.5">
                      {/* Stage Header Banner */}
                      <div className="flex items-center justify-between px-4 py-2 border rounded-xl bg-slate-100/70 border-slate-200/60">
                        <div className="flex items-center gap-2">
                          <NodeIndexOutlined className="text-emerald-700" />
                          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                            Giai đoạn: {stage.name}
                          </h3>
                        </div>
                        <span className="text-[11px] font-bold text-slate-700 bg-white px-2.5 py-0.5 rounded-full border border-slate-200/80 shadow-2xs">
                          {stage.filteredTasks.length} công việc
                        </span>
                      </div>

                      {/* Tasks Grid */}
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-2">
                        {stage.filteredTasks.map((task, idx) => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            taskIndex={idx}
                            onOpen={openTaskLog}
                            getTaskStatus={getTaskStatus}
                          />
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </Col>
        </Row>
      )}
    </div>
  )
}

export default FarmLeaderTasks
