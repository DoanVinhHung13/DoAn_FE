import React from "react"
import CustomModal from "src/components/Modal/CustomModal"
import { MSG_LM_26, isLandPlotActive } from "src/utils/landPlotUtils"

const LandPlotStatusModal = ({
  target,
  visible,
  loading,
  onConfirm,
  onCancel,
}) => {
  if (!target) return null
  const active = isLandPlotActive(target)

  return (
    <CustomModal
      title={active ? "Xác nhận ngừng hoạt động" : "Xác nhận kích hoạt"}
      open={visible}
      onOk={onConfirm}
      onCancel={onCancel}
      confirmLoading={loading}
      okText={active ? "Ngừng hoạt động" : "Kích hoạt"}
      cancelText="Hủy"
      okButtonProps={{ danger: active }}
    >
      <p>{MSG_LM_26}</p>
      <p className="mt-2 text-sm text-gray-500">
        Vùng trồng: <strong>{target?.name}</strong>
      </p>
    </CustomModal>
  )
}

export default LandPlotStatusModal
