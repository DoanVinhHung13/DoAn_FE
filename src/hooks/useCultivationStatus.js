import { useMemo } from "react"
import { SYSTEM_KEY } from "src/constants/systemKey"
import { useSystemKey } from "src/hooks/useSystemKey"
import {
  CLOSING_STATUS_FILTER_OPTIONS,
  LOGBOOK_STATUS_FILTER_OPTIONS,
  getEquipmentStatus,
  getHarvestBatchStatus,
  getLogbookStatus,
  getReviewStatus,
  getStageStatus,
  getTaskStatus,
  toFilterOptions,
} from "src/utils/cultivationStatus"

/**
 * Resolve status label/color từ SystemKey (đã load sẵn trong Redux qua DefaultAction).
 */
export const useCultivationStatus = () => {
  const { getCombo, getDescription } = useSystemKey()

  const logbookOptions = getCombo(SYSTEM_KEY.LOGBOOK_STATUS)
  const reviewOptions = getCombo(SYSTEM_KEY.REVIEW_STATUS)
  const stageOptions = getCombo(SYSTEM_KEY.CULTIVATION_STAGE_STATUS)
  const taskOptions = getCombo(SYSTEM_KEY.WORK_TASK_STATUS)
  const batchOptions = getCombo(SYSTEM_KEY.HARVEST_BATCH_STATUS)
  const equipmentOptions = getCombo(SYSTEM_KEY.EQUIPMENT_STATUS)
  const approvalOptions = getCombo(SYSTEM_KEY.APPROVAL_STATUS)

  return useMemo(
    () => ({
      logbookOptions,
      reviewOptions,
      stageOptions,
      taskOptions,
      batchOptions,
      equipmentOptions,
      approvalOptions,

      getLogbookStatus: status => getLogbookStatus(status, logbookOptions),
      getReviewStatus: status => getReviewStatus(status, reviewOptions),
      getStageStatus: status => getStageStatus(status, stageOptions),
      getTaskStatus: status => getTaskStatus(status, taskOptions),
      getHarvestBatchStatus: status =>
        getHarvestBatchStatus(status, batchOptions),
      getEquipmentStatus: status =>
        getEquipmentStatus(status, equipmentOptions),

      logbookFilterOptions:
        logbookOptions.length > 0
          ? toFilterOptions(logbookOptions)
          : LOGBOOK_STATUS_FILTER_OPTIONS,
      closingFilterOptions:
        reviewOptions.length > 0
          ? toFilterOptions(reviewOptions)
          : CLOSING_STATUS_FILTER_OPTIONS,
      taskFilterOptions:
        taskOptions.length > 0
          ? toFilterOptions(taskOptions)
          : [{ value: "all", label: "Tất cả trạng thái" }],
      stageFilterOptions:
        stageOptions.length > 0
          ? toFilterOptions(stageOptions)
          : [{ value: "all", label: "Tất cả trạng thái" }],
      equipmentFilterOptions:
        equipmentOptions.length > 0
          ? toFilterOptions(equipmentOptions)
          : [{ value: "all", label: "Tất cả trạng thái" }],
      batchFilterOptions:
        batchOptions.length > 0
          ? toFilterOptions(batchOptions)
          : [{ value: "all", label: "Tất cả trạng thái" }],

      getDescription,
    }),
    [
      logbookOptions,
      reviewOptions,
      stageOptions,
      taskOptions,
      batchOptions,
      equipmentOptions,
      approvalOptions,
      getDescription,
    ],
  )
}

export default useCultivationStatus
