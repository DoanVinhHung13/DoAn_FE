import { CheckCircleOutlined, InboxOutlined } from "@ant-design/icons"
import { Alert, Button, Modal } from "antd"
import { getHarvestInfo } from "./reviewHelpers"

const ApproveClosingModal = ({
  open,
  onCancel,
  onApprove,
  loading = false,
  harvestTasks = [],
  logs = [],
  harvestSummaries = {},
}) => {
  return (
    <Modal
      open={open}
      onCancel={onCancel}
      width={560}
      title={
        <div className="flex items-center gap-2 text-green-700 font-bold text-base">
          <CheckCircleOutlined /> Xác nhận duyệt chốt sổ
        </div>
      }
      footer={[
        <Button
          key="cancel"
          onClick={onCancel}
          disabled={loading}
          className="rounded-xl"
        >
          Hủy
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={onApprove}
          className="bg-green-600 border-green-600 hover:bg-green-700 rounded-xl"
        >
          Xác nhận duyệt
        </Button>,
      ]}
    >
      <Alert
        className="mb-4 rounded-xl"
        type="info"
        message="Vui lòng kiểm tra thông tin công việc thu hoạch và sản lượng trước khi duyệt chốt sổ nhật ký."
      />

      {harvestTasks.length > 0 ? (
        <div className="space-y-3">
          {harvestTasks.map((task, idx) => {
            const harvestInfo = getHarvestInfo(task, logs, harvestSummaries)

            return (
              <div
                key={task.id || idx}
                className="rounded-xl border border-green-200 bg-green-50/60 p-4 space-y-3"
              >
                {/* Header task */}
                <div className="border-b border-green-200/70 pb-2.5">
                  <div className="text-xs font-bold uppercase tracking-wider text-green-700 flex items-center gap-1.5">
                    <InboxOutlined className="text-green-600" />
                    Công việc thu hoạch
                  </div>
                  <div className="text-base font-bold text-gray-800 mt-0.5">
                    {task.name}
                  </div>
                  {task.cultivationStageName && (
                    <div className="text-xs text-gray-500">
                      Thuộc: {task.cultivationStageName}
                    </div>
                  )}
                </div>

                {/* Thông tin sản lượng thu hoạch */}
                <div className="rounded-lg bg-white p-3 border border-green-100 space-y-2">
                  <div className="text-xs font-bold text-emerald-800 uppercase flex items-center gap-1.5">
                    <InboxOutlined className="text-emerald-600" />
                    Sản lượng thu hoạch
                  </div>

                  {harvestInfo.quantity != null || harvestInfo.area != null ? (
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      {harvestInfo.quantity != null && (
                        <div className="flex items-center gap-1">
                          <span className="text-gray-600">Sản lượng:</span>
                          <span className="font-bold text-emerald-700 text-base">
                            {harvestInfo.quantity} {harvestInfo.unit}
                          </span>
                        </div>
                      )}
                      {harvestInfo.area != null && (
                        <div className="flex items-center gap-1 text-gray-600">
                          <span>Diện tích thu hoạch:</span>
                          <span className="font-semibold text-gray-800">
                            {harvestInfo.area} {harvestInfo.areaUnit}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : harvestInfo.materialsText ? (
                    <div className="text-sm font-semibold text-emerald-700">
                      {harvestInfo.materialsText}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500 italic">
                      Chưa ghi nhận số lượng cụ thể trong nhật ký thu hoạch.
                    </div>
                  )}
                </div>

                {task.assignedLeaderName && (
                  <div className="text-xs text-gray-500">
                    Đội trưởng phụ trách:{" "}
                    <span className="font-medium text-gray-700">
                      {task.assignedLeaderName}
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
          Không tìm thấy công việc thu hoạch nào trong các giai đoạn canh tác.
        </div>
      )}
    </Modal>
  )
}

export default ApproveClosingModal

