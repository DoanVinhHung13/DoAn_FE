import { PlayCircleOutlined } from "@ant-design/icons"
import { Form, Modal, Select, Space, Typography } from "antd"
import { useEffect, useMemo } from "react"

const { Text } = Typography

const getAssignmentIds = (task, isLeader) => {
  const ids = (task?.assignments || [])
    .filter(assignment => Boolean(assignment?.isLeader) === isLeader)
    .map(assignment => String(assignment.userId || assignment.id || assignment))
  if (!isLeader && ids.length === 0) {
    return (task?.farmerIds || []).map(String)
  }
  return ids
}

const ActivateTaskModal = ({
  open,
  task,
  leaderOptions = [],
  farmerOptions = [],
  busyUserIds = new Set(),
  loading = false,
  onCancel,
  onConfirm,
}) => {
  const [form] = Form.useForm()
  const existingLeaderIds = getAssignmentIds(task, true)
  const leaderId =
    task?.assignedLeaderId || task?.farmLeaderId || existingLeaderIds[0]
  const existingSupportIds = getAssignmentIds(task, false)
  const hasLeader = Boolean(leaderId)
  const hasSupporters = existingSupportIds.length > 0

  const availableLeaderOptions = useMemo(() => {
    const currentId = leaderId && String(leaderId)
    return leaderOptions.filter(
      option =>
        String(option.value) === currentId ||
        !busyUserIds.has(String(option.value)),
    )
  }, [busyUserIds, leaderId, leaderOptions])

  const availableFarmerOptions = useMemo(
    () =>
      farmerOptions.filter(
        option =>
          existingSupportIds.includes(String(option.value)) ||
          !busyUserIds.has(String(option.value)),
      ),
    [busyUserIds, existingSupportIds, farmerOptions],
  )

  useEffect(() => {
    if (!open) return
    form.setFieldsValue({
      farmLeaderId: leaderId || undefined,
      farmerIds: existingSupportIds,
    })
  }, [existingSupportIds, form, leaderId, open])

  const handleOk = async () => {
    const values =
      !hasLeader || !hasSupporters ? await form.validateFields() : {}
    await onConfirm(
      {
        ...values,
        farmLeaderId: values.farmLeaderId || leaderId,
        farmerIds: values.farmerIds || existingSupportIds,
      },
      !hasLeader || !hasSupporters,
    )
  }

  return (
    <Modal
      open={open}
      title={
        hasLeader && hasSupporters
          ? "Xác nhận kích hoạt công việc"
          : "Phân công và kích hoạt công việc"
      }
      okText="Xác nhận kích hoạt"
      cancelText="Hủy"
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={loading}
      okButtonProps={{
        className: "bg-green-600",
        icon: <PlayCircleOutlined />,
      }}
      destroyOnClose
    >
      <Space direction="vertical" size={16} className="w-full mt-2">
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
          <Text className="block text-[15px] text-gray-800">
            Bạn có chắc muốn kích hoạt{" "}
            <span className="font-semibold text-gray-900">
              {task?.name?.trim() || task?.taskName?.trim() || "công việc này"}
            </span>
            ?
          </Text>
          <Text type="secondary" className="mt-1 block">
            Sau khi kích hoạt, người được phân công có thể bắt đầu thực hiện và
            ghi nhật ký.
          </Text>
        </div>

        {(!hasLeader || !hasSupporters) && (
          <>
            <Text type="secondary">
              Chỉ hiển thị người đang không thực hiện công việc khác.
            </Text>
            <Form form={form} layout="vertical" className="w-full">
              {!hasLeader && (
                <Form.Item
                  name="farmLeaderId"
                  label="Người phụ trách"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng chọn người phụ trách",
                    },
                  ]}
                >
                  <Select
                    showSearch
                    optionFilterProp="label"
                    options={availableLeaderOptions}
                    placeholder="Chọn người phụ trách"
                    notFoundContent="Không có người đang rảnh"
                  />
                </Form.Item>
              )}
              {!hasSupporters && (
                <Form.Item
                  name="farmerIds"
                  label="Người hỗ trợ"
                  rules={[
                    {
                      required: true,
                      type: "array",
                      min: 1,
                      message: "Vui lòng chọn ít nhất 1 người hỗ trợ",
                    },
                  ]}
                >
                  <Select
                    mode="multiple"
                    showSearch
                    optionFilterProp="label"
                    options={availableFarmerOptions}
                    placeholder="Chọn ít nhất 1 người hỗ trợ"
                    notFoundContent="Không có người đang rảnh"
                  />
                </Form.Item>
              )}
            </Form>
          </>
        )}
      </Space>
    </Modal>
  )
}

export default ActivateTaskModal
