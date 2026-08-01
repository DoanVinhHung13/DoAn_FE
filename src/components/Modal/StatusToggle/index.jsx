import PropTypes from "prop-types"
import { Modal, Button } from "antd"

const StatusToggleModal = ({
  open,
  onCancel,
  onConfirm,
  loading,
  title = "Thay đổi trạng thái",
  description = "Bạn có chắc muốn thay đổi trạng thái không?",
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  item,
  itemName,
}) => {
  const displayName = itemName || item?.name || item?.title || "mục này"

  return (
    <Modal
      open={open}
      onCancel={loading ? undefined : onCancel}
      closable={!loading}
      maskClosable={!loading}
      footer={null}
      centered
      width={400}
      closeIcon={<span className="text-2xl leading-none text-gray-900">×</span>}
    >
      <div className="px-3 pb-1 pt-2">
        <h2 className="mb-3 border-b border-gray-100 pb-4 text-[24px] font-bold text-green-600">
          {title}
        </h2>
        <p className="mb-7 text-base leading-6 text-gray-600">
          {description}
          {displayName && (
            <span className="font-semibold"> "{displayName}"</span>
          )}
          ?
        </p>
        <div className="flex justify-end gap-3">
          <Button
            disabled={loading}
            onClick={onCancel}
            className="h-10 min-w-[80px] rounded-lg font-semibold"
          >
            {cancelText}
          </Button>
          <Button
            type="primary"
            loading={loading}
            onClick={onConfirm}
            className="h-10 min-w-[104px] rounded-lg bg-green-500 font-semibold shadow-lg shadow-green-100"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

StatusToggleModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  title: PropTypes.string,
  description: PropTypes.string,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  item: PropTypes.object,
  itemName: PropTypes.string,
}

export default StatusToggleModal
