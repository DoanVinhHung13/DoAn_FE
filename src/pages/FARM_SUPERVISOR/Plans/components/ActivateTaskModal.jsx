import { ExclamationCircleOutlined, PlayCircleOutlined } from "@ant-design/icons"
import { Alert, Form, Modal, Select, Space, Typography } from "antd"
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
  const leaderId = task?.assignedLeaderId || task?.farmLeaderId
  const existingSupportIds = getAssignmentIds(task, false)
  const hasLeader = Boolean(leaderId)
  const hasSupporters = existingSupportIds.length > 0

  const availableLeaderOptions = useMemo(() => {
    const currentId = leaderId && String(leaderId)
    return leaderOptions.filter(
      option =>
        String(option.value) === currentId || !busyUserIds.has(String(option.value)),
    )
  }, [busyUserIds, leaderId, leaderOptions])

  const availableFarmerOptions = useMemo(() =>
    farmerOptions.filter(
      option =>
        existingSupportIds.includes(String(option.value)) ||
        !busyUserIds.has(String(option.value)),
    ), [busyUserIds, existingSupportIds, farmerOptions])

  useEffect(() => {
    if (!open) return
    form.setFieldsValue({
      farmLeaderId: leaderId || undefined,
      farmerIds: existingSupportIds,
    })
  }, [existingSupportIds, form, leaderId, open])

  const handleOk = async () => {
    const values = !hasLeader || !hasSupporters ? await form.validateFields() : {}
    await onConfirm(values, !hasLeader || !hasSupporters)
  }

  return (
    <Modal
      open={open}
      title={hasLeader && hasSupporters ? "Xác nhận kích hoạt công việc" : "Phân công và kích hoạt công việc"}
      okText="Xác nhận kích hoạt"
      cancelText="Hủy"
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={loading}
      okButtonProps={{ className: "bg-green-600", icon: <PlayCircleOutlined /> }}
      destroyOnClose
    >
      <Space direction="vertical" size={16} className="w-full mt-2">
        <Alert
          type="warning"
          showIcon
          icon={<ExclamationCircleOutlined />}
          message={`Bạn có chắc muốn kích hoạt “${task?.name || task?.taskName || "công việc này"}”?`}
          description="Sau khi kích hoạt, người được phân công có thể bắt đầu thực hiện và ghi nhật ký."
        />

        {(!hasLeader || !hasSupporters) && (
          <>
            <Text type="secondary">
              Chỉ hiển thị người đang không thực hiện công việc khác.
            </Text>
            {!hasLeader && (
              <Form form={form} layout="vertical">
                <Form.Item
                  name="farmLeaderId"
                  label="Người phụ trách"
                  rules={[{ required: true, message: "Vui lòng chọn người phụ trách" }]}
                >
                  <Select
                    showSearch
                    optionFilterProp="label"
                    options={availableLeaderOptions}
                    placeholder="Chọn người phụ trách"
                    notFoundContent="Không có người đang rảnh"
                  />
                </Form.Item>
              </Form>
            )}
            {!hasSupporters && (
              <Form form={form} layout="vertical">
                <Form.Item name="farmerIds" label="Người hỗ trợ">
                  <Select
                    mode="multiple"
                    showSearch
                    optionFilterProp="label"
                    options={availableFarmerOptions}
                    placeholder="Chọn người hỗ trợ (không bắt buộc)"
                    notFoundContent="Không có người đang rảnh"
                  />
                </Form.Item>
              </Form>
            )}
          </>
        )}
      </Space>
    </Modal>
  )
}

export default ActivateTaskModal
