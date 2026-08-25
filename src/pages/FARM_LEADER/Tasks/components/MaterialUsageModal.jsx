import React from "react"
import { DatePicker, Form, Input, InputNumber, Modal, Select } from "antd"

const MaterialUsageModal = ({
  open,
  item,
  onCancel,
  onSave,
  form,
  fertilizerOptions,
  pesticideOptions,
}) => {
  return (
    <Modal
      open={open}
      title={item ? "Sửa vật tư đã sử dụng" : "Thêm vật tư đã sử dụng"}
      onCancel={onCancel}
      onOk={onSave}
      okText="Lưu"
      cancelText="Hủy"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="materialType"
          label="Loại vật tư"
          rules={[{ required: true, message: "Chọn loại vật tư" }]}
        >
          <Select
            options={[
              { value: "FERTILIZER", label: "Phân bón" },
              { value: "PESTICIDE", label: "Nông dược" },
            ]}
          />
        </Form.Item>
        <Form.Item
          noStyle
          shouldUpdate={(previous, current) =>
            previous.materialType !== current.materialType
          }
        >
          {({ getFieldValue }) => {
            const options =
              getFieldValue("materialType") === "PESTICIDE"
                ? pesticideOptions
                : fertilizerOptions
            return (
              <Form.Item
                name="materialId"
                label="Vật tư"
                rules={[{ required: true, message: "Chọn vật tư" }]}
              >
                <Select
                  showSearch
                  optionFilterProp="label"
                  options={options.map(option => ({
                    value: option.materialId,
                    label: option.label,
                  }))}
                />
              </Form.Item>
            )
          }}
        </Form.Item>
        <div className="grid grid-cols-2 gap-3">
          <Form.Item
            name="quantity"
            label="Số lượng"
            rules={[
              { required: true },
              {
                type: "number",
                min: 0.0001,
                message: "Số lượng phải lớn hơn 0",
              },
            ]}
          >
            <InputNumber className="w-full" min={0} />
          </Form.Item>
          <Form.Item
            name="appliedArea"
            label="Diện tích (m²)"
            rules={[
              { required: true },
              {
                type: "number",
                min: 0.0001,
                message: "Diện tích phải lớn hơn 0",
              },
            ]}
          >
            <InputNumber className="w-full" min={0} />
          </Form.Item>
        </div>
        <Form.Item
          name="usedAt"
          label="Thời gian sử dụng"
          rules={[{ required: true, message: "Chọn thời gian sử dụng" }]}
        >
          <DatePicker showTime className="w-full" format="DD/MM/YYYY HH:mm" />
        </Form.Item>
        <Form.Item name="note" label="Ghi chú">
          <Input.TextArea rows={3} />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default MaterialUsageModal
