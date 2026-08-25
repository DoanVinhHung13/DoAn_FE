import { InfoCircleOutlined, SwapOutlined } from "@ant-design/icons"
import {
  Alert,
  Card,
  Col,
  Flex,
  Form,
  message,
  Modal,
  Row,
  Select,
  Tag,
  Typography,
} from "antd"
import { useEffect, useMemo, useState } from "react"
import {
  CULTIVATION_TASK_TYPES,
  getCultivationTaskTypeColor,
  getCultivationTaskTypeLabel,
} from "src/constants/cultivationTask"
import CultivationTaskService from "src/services/CultivationTaskService"
import { getTaskOrder } from "src/utils/cultivationOrdering"

const { Text } = Typography

const ALLOWED_SWAP_STATUSES = ["PENDING", "ASSIGNED"]

const isHarvestTask = task =>
  task?.taskType === CULTIVATION_TASK_TYPES.HARVEST ||
  task?.activityType === "HARVESTING"

const SwapTaskModal = ({
  open,
  task,
  taskIndex = 0,
  stageTasks = [],
  stage,
  planId,
  onCancel,
  onSuccess,
  getTaskCfg,
}) => {
  const [form] = Form.useForm()
  const [targetTaskId, setTargetTaskId] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const currentOrder = useMemo(() => {
    if (!task) return 1
    return getTaskOrder(task, taskIndex + 1)
  }, [task, taskIndex])

  // Reset form when modal opens with a new task
  useEffect(() => {
    if (open && task) {
      setTargetTaskId(null)
      form.setFieldsValue({
        targetTaskId: undefined,
      })
    } else {
      setTargetTaskId(null)
      form.resetFields()
    }
  }, [open, task, form])

  // Resolve target task from targetTaskId
  const { targetTask, targetTaskIndex } = useMemo(() => {
    if (!targetTaskId) {
      return { targetTask: null, targetTaskIndex: -1 }
    }
    const idx = stageTasks.findIndex(t => t.id === targetTaskId)
    return {
      targetTask: idx >= 0 ? stageTasks[idx] : null,
      targetTaskIndex: idx,
    }
  }, [targetTaskId, stageTasks])

  const isValidSwap = Boolean(
    targetTask &&
    targetTask.id !== task?.id &&
    !isHarvestTask(task) &&
    !isHarvestTask(targetTask) &&
    ALLOWED_SWAP_STATUSES.includes(targetTask?.status),
  )

  const handleSelectTask = value => {
    setTargetTaskId(value || null)
    form.setFieldsValue({ targetTaskId: value || undefined })
  }

  const handleConfirmSwap = async () => {
    if (!task || !targetTask || !isValidSwap) return
    const stageId = stage?.id || task?.cultivationStageId

    if (!planId || !stageId) {
      message.error("Thiếu thông tin kế hoạch hoặc giai đoạn canh tác.")
      return
    }

    try {
      setSubmitting(true)
      const payload = {
        cultivationLogbookId: planId,
        cultivationStageId: stageId,
        taskIds: [task.id, targetTask.id],
      }
      await CultivationTaskService.reorder(payload)
      onSuccess?.()
    } catch {
      // Axios interceptor handles and displays backend error
    } finally {
      setSubmitting(false)
    }
  }

  const currentTaskCfg = getTaskCfg?.(task?.status) || {}
  const targetTaskCfg = targetTask ? getTaskCfg?.(targetTask?.status) || {} : {}

  const availableTaskOptions = useMemo(() => {
    return stageTasks
      .filter(
        t =>
          t.id !== task?.id &&
          !isHarvestTask(t) &&
          ALLOWED_SWAP_STATUSES.includes(t.status),
      )
      .map(t => {
        const idx = stageTasks.findIndex(item => item.id === t.id)
        const order = getTaskOrder(t, idx + 1)
        const cfg = getTaskCfg?.(t.status) || {}
        return {
          value: t.id,
          order,
          label: `#${order} - ${t.name || t.taskName || "Công việc"} (${cfg.label || t.status})`,
        }
      })
  }, [stageTasks, task, getTaskCfg])

  return (
    <Modal
      open={open}
      title={
        <div className="flex items-center gap-2 text-base font-bold text-green-800">
          <SwapOutlined className="text-green-600 text-lg" />
          Đổi vị trí thứ tự công việc
        </div>
      }
      onCancel={onCancel}
      onOk={handleConfirmSwap}
      okText="Xác nhận đổi vị trí"
      cancelText="Hủy"
      confirmLoading={submitting}
      okButtonProps={{
        disabled: !isValidSwap,
        className:
          "bg-green-600 border-green-600 hover:!bg-green-700 font-semibold px-4 rounded-xl",
        icon: <SwapOutlined />,
      }}
      cancelButtonProps={{
        className: "rounded-xl",
      }}
      destroyOnClose
      width={540}
    >
      <div className="space-y-4 pt-2">
        {/* Current task box */}
        <Card
          size="small"
          className="border-green-200 bg-green-50/40 rounded-xl"
          styles={{ body: { padding: "12px 14px" } }}
        >
          <div className="text-[11px] font-semibold text-green-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <InfoCircleOutlined /> Công việc đang chọn:
          </div>
          <Flex align="center" justify="space-between" gap={8}>
            <Flex align="center" gap={8} className="min-w-0 flex-1">
              <div className="flex items-center justify-center bg-green-600 text-white rounded-lg font-bold text-xs px-2 py-0.5 shadow-2xs flex-shrink-0">
                #{currentOrder}
              </div>
              <Text className="font-bold text-gray-800 truncate text-sm">
                {task?.name || task?.taskName}
              </Text>
            </Flex>
            <Flex align="center" gap={6} className="flex-shrink-0">
              <Tag
                color={getCultivationTaskTypeColor(task?.taskType)}
                className="text-xs rounded-md m-0"
              >
                {getCultivationTaskTypeLabel(task?.taskType)}
              </Tag>
              <Tag
                color={currentTaskCfg.color || "default"}
                className="text-xs rounded-md m-0"
              >
                {currentTaskCfg.label || task?.status}
              </Tag>
            </Flex>
          </Flex>
        </Card>

        {/* Select target task */}
        <Form form={form} layout="vertical" className="!mb-0">
          <Form.Item
            label={
              <span className="text-xs font-semibold text-gray-700">
                Chọn công việc mục tiêu muốn đổi vị trí:
              </span>
            }
            className="!mb-2"
          >
            <Select
              showSearch
              allowClear
              placeholder="Chọn công việc trong giai đoạn để đổi vị trí..."
              options={availableTaskOptions}
              value={targetTaskId}
              onChange={handleSelectTask}
              optionFilterProp="label"
              className="w-full rounded-xl"
              notFoundContent="Không có công việc nào ở trạng thái Chờ thực hiện hoặc Đã phân công"
              size="middle"
            />
          </Form.Item>
        </Form>

        {/* Visual Swap Preview */}
        {isValidSwap && targetTask && (
          <Card
            size="small"
            className="border-blue-200 bg-blue-50/40 rounded-xl"
            styles={{ body: { padding: "12px 14px" } }}
          >
            <div className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider mb-2">
              Xem trước hoán đổi vị trí:
            </div>

            <Row gutter={[12, 8]} align="middle">
              {/* Vị trí cũ */}
              <Col xs={11}>
                <div className="bg-white p-2 rounded-lg border border-gray-200">
                  <div className="text-[10px] text-gray-500 font-semibold mb-0.5">
                    Vị trí hiện tại #{currentOrder}
                  </div>
                  <Text className="text-xs font-bold text-gray-800 block truncate">
                    {task?.name || task?.taskName}
                  </Text>
                  <div className="flex items-center gap-1 mt-1">
                    <Tag
                      color={currentTaskCfg.color || "default"}
                      className="text-[10px] rounded m-0 px-1 py-0"
                    >
                      {currentTaskCfg.label || task?.status}
                    </Tag>
                  </div>
                </div>
              </Col>

              {/* Icon Swap */}
              <Col xs={2} className="text-center">
                <SwapOutlined className="text-blue-600 text-lg font-bold" />
              </Col>

              {/* Vị trí mới */}
              <Col xs={11}>
                <div className="bg-white p-2 rounded-lg border border-blue-200 shadow-2xs">
                  <div className="text-[10px] text-blue-600 font-semibold mb-0.5">
                    Đổi với vị trí #
                    {getTaskOrder(targetTask, targetTaskIndex + 1)}
                  </div>
                  <Text className="text-xs font-bold text-gray-800 block truncate">
                    {targetTask?.name || targetTask?.taskName}
                  </Text>
                  <div className="flex items-center gap-1 mt-1">
                    <Tag
                      color={targetTaskCfg.color || "default"}
                      className="text-[10px] rounded m-0 px-1 py-0"
                    >
                      {targetTaskCfg.label || targetTask?.status}
                    </Tag>
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
        )}

        {stageTasks.length <= 1 && (
          <Alert
            type="info"
            showIcon
            message="Giai đoạn này chỉ có 1 công việc."
            description="Cần có ít nhất 2 công việc trong cùng một giai đoạn để đổi vị trí."
            className="rounded-xl text-xs"
          />
        )}
      </div>
    </Modal>
  )
}

export default SwapTaskModal
