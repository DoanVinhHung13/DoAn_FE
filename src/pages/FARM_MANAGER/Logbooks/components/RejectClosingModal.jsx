import { CloseCircleOutlined } from "@ant-design/icons"
import { Alert, Input, Modal } from "antd"

const RejectClosingModal = ({
  open,
  onCancel,
  onReject,
  loading = false,
  reason = "",
  onReasonChange,
}) => {
  return (
    <Modal
      open={open}
      onCancel={onCancel}
      title={
        <div className="flex items-center gap-2 text-red-600">
          <CloseCircleOutlined />
          Từ chối chốt sổ
        </div>
      }
      onOk={onReject}
      okText="Xác nhận từ chối"
      cancelText="Hủy"
      confirmLoading={loading}
      okButtonProps={{ danger: true }}
    >
      <Alert
        className="mb-3 rounded-xl"
        type="warning"
        message="Giám sát viên sẽ nhận lý do và chỉnh sửa lại."
      />
      <Input.TextArea
        rows={4}
        value={reason}
        onChange={e => onReasonChange && onReasonChange(e.target.value)}
        placeholder="Lý do từ chối..."
      />
    </Modal>
  )
}

export default RejectClosingModal
