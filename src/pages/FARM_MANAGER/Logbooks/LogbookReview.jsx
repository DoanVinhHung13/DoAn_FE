import { Button, Empty, Spin, message } from "antd"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

import ROUTER from "src/router/ROUTER"
import CultivationLogbookService from "src/services/CultivationLogbookService"
import CultivationLogService from "src/services/CultivationLogService"
import CultivationStageService from "src/services/CultivationStageService"
import CultivationTaskService from "src/services/CultivationTaskService"
import AuditLogService from "src/services/AuditLogService"
import { canApproveClosing } from "src/utils/cultivationStatus"
import { getOrderedStageLogs } from "src/utils/cultivationOrdering"

import LogbookReviewHeader from "./components/LogbookReviewHeader"
import LogbookInfoCard from "./components/LogbookInfoCard"
import OfficialLogsCard from "./components/OfficialLogsCard"
import AuditHistoryCard from "./components/AuditHistoryCard"
import ApproveClosingModal from "./components/ApproveClosingModal"
import RejectClosingModal from "./components/RejectClosingModal"
import {
  asList,
  extractList,
  isHarvestTask,
  normalizeAuditLogs,
  unwrap,
} from "./components/reviewHelpers"

const LogbookReview = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [logbook, setLogbook] = useState(null)
  const [logs, setLogs] = useState([])
  const [stageGroups, setStageGroups] = useState([])
  const [auditLogs, setAuditLogs] = useState([])
  const [harvestSummaries, setHarvestSummaries] = useState({})
  const [loading, setLoading] = useState(true)

  const [approveModal, setApproveModal] = useState(false)
  const [approving, setApproving] = useState(false)

  const [rejectModal, setRejectModal] = useState(false)
  const [rejecting, setRejecting] = useState(false)
  const [rejectReason, setRejectReason] = useState("")

  const fetchLogbookDetails = useCallback(async () => {
    setLoading(true)
    try {
      // 1. Lấy thông tin chi tiết nhật ký canh tác
      const detailRes = await CultivationLogbookService.getById(id)
      const logbookData = unwrap(detailRes)
      setLogbook(logbookData)

      // 2. Lấy danh sách giai đoạn (stages)
      let stages = asList(logbookData?.cultivationStages)
      if (stages.length === 0) {
        try {
          const stagesRes = await CultivationStageService.getByLogbookId(id)
          stages = extractList(stagesRes)
        } catch {
          stages = []
        }
      }

      // 3. Lấy logs của từng giai đoạn theo thứ tự
      const fetchedStageGroups = []
      for (const stage of stages) {
        const stageId = stage?.id || stage?.stageId
        if (!stageId) {
          fetchedStageGroups.push({ stage, logs: [] })
          continue
        }

        try {
          const stageLogsRes = await CultivationStageService.getStageLogs(
            stageId,
            { cultivationLogbookId: id },
          )
          const stageLogs = extractList(stageLogsRes)
          const orderedLogs = getOrderedStageLogs(
            stageLogs,
            stage.tasks || stage.cultivationTasks || [],
          )
          fetchedStageGroups.push({ stage, logs: orderedLogs })
        } catch {
          fetchedStageGroups.push({ stage, logs: [] })
        }
      }

      // Nếu các giai đoạn chưa có logs riêng, lấy logs chung của logbook
      const hasStageLogs = fetchedStageGroups.some(
        group => group.logs.length > 0,
      )
      if (!hasStageLogs) {
        try {
          const logsRes = await CultivationLogService.getLogbookLogs(id)
          const fallbackLogs = extractList(logsRes)
          const fallbackGroups = stages.length
            ? stages.map((stage, index) => ({
                stage,
                logs:
                  index === 0
                    ? getOrderedStageLogs(
                        fallbackLogs,
                        stage.tasks || stage.cultivationTasks || [],
                      )
                    : [],
              }))
            : fallbackLogs.length
              ? [{ stage: null, logs: fallbackLogs }]
              : []
          setStageGroups(fallbackGroups)
          setLogs(fallbackGroups.flatMap(group => group.logs))
        } catch {
          setStageGroups(fetchedStageGroups)
          setLogs([])
        }
      } else {
        setStageGroups(fetchedStageGroups)
        setLogs(fetchedStageGroups.flatMap(group => group.logs))
      }

      // 4. Lấy tóm tắt sản lượng cho các công việc thu hoạch
      const allHarvestTasks = stages
        .flatMap(stage => asList(stage.tasks || stage.cultivationTasks))
        .filter(isHarvestTask)

      const summariesMap = {}
      for (const task of allHarvestTasks) {
        if (task?.id) {
          try {
            const res = await CultivationTaskService.getLeaderSummary(task.id)
            const data = unwrap(res)
            if (data) {
              summariesMap[task.id] = data
            }
          } catch {
            // Bỏ qua nếu task chưa có summary
          }
        }
      }
      setHarvestSummaries(summariesMap)

      // 5. Lấy lịch sử chỉnh sửa (Audit Logs)
      try {
        const auditRes = await AuditLogService.getAll({
          PageIndex: 1,
          PageSize: 50,
          SearchKeyword: id,
        })
        setAuditLogs(normalizeAuditLogs(extractList(auditRes)))
      } catch {
        setAuditLogs([])
      }
    } catch {
      setLogbook(null)
      setStageGroups([])
      setLogs([])
      setAuditLogs([])
      setHarvestSummaries({})
    } finally {
      setLoading(false)
    }
  }, [id])

  const handleApprove = async () => {
    try {
      setApproving(true)
      await CultivationLogbookService.approveCompletion(id, {})
      setApproveModal(false)
      await fetchLogbookDetails()
    } catch (error) {
      if (error?.errorFields) return
    } finally {
      setApproving(false)
    }
  }

  const handleReject = async () => {
    const reason = rejectReason.trim()
    if (!reason) {
      message.warning("Vui lòng nhập lý do từ chối.")
      return
    }
    if (reason.length > 200) {
      message.warning("Lý do từ chối không được vượt quá 200 ký tự.")
      return
    }
    try {
      setRejecting(true)
      await CultivationLogbookService.rejectCompletion(id, { reason })
      setRejectModal(false)
      navigate(ROUTER.FM_LOGBOOKS)
    } catch {
      // Rejection error is handled by the shared axios interceptor
    } finally {
      setRejecting(false)
    }
  }

  const handleBackToList = () => {
    navigate(ROUTER.FM_LOGBOOKS)
  }

  useEffect(() => {
    fetchLogbookDetails()
  }, [fetchLogbookDetails])

  const showApproveAction = useMemo(() => {
    return canApproveClosing(logbook)
  }, [logbook])

  const harvestTasks = useMemo(() => {
    const allTasks = stageGroups.flatMap(group =>
      asList(group.stage?.tasks || group.stage?.cultivationTasks),
    )
    return allTasks.filter(isHarvestTask)
  }, [stageGroups])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Spin size="large" tip="Đang tải nhật ký..." />
      </div>
    )
  }

  if (!logbook) {
    return (
      <div className="py-16 text-center">
        <Empty description="Không tìm thấy nhật ký." />
        <Button onClick={handleBackToList} className="mt-4">
          Quay lại
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 duration-500 animate-in fade-in slide-in-from-bottom-4">
      <LogbookReviewHeader
        logbook={logbook}
        canApprove={showApproveAction}
        approving={approving}
        onBack={handleBackToList}
        onOpenApproveModal={() => setApproveModal(true)}
        onOpenRejectModal={() => setRejectModal(true)}
      />

      <LogbookInfoCard logbook={logbook} />

      <OfficialLogsCard
        stageGroups={stageGroups}
        totalLogsCount={logs.length}
      />

      <AuditHistoryCard auditLogs={auditLogs} />

      <ApproveClosingModal
        open={approveModal}
        onCancel={() => setApproveModal(false)}
        onApprove={handleApprove}
        loading={approving}
        harvestTasks={harvestTasks}
        logs={logs}
        harvestSummaries={harvestSummaries}
      />

      <RejectClosingModal
        open={rejectModal}
        onCancel={() => setRejectModal(false)}
        onReject={handleReject}
        loading={rejecting}
        reason={rejectReason}
        onReasonChange={setRejectReason}
      />
    </div>
  )
}

export default LogbookReview

