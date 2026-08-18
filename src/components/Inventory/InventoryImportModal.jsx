import React, { useEffect, useState } from "react"
import { Modal, Form, Input, InputNumber } from "antd"
import { InboxOutlined } from "@ant-design/icons"
import InventoryService from "src/services/InventoryService"
import {
  applyApiFieldErrors,
  normalizeApiError,
} from "src/services/core/apiError"
import {
  getQuantityUnit,
  MEASUREMENT_UNITS,
} from "src/constants/measurementUnits"

const INVENTORY_IMPORT_FIELD_MAPPING = {
  Quantity: "quantity",
  quantity: "quantity",
  Unit: "unit",
  unit: "unit",
  Note: "note",
  note: "note",
}

const InventoryImportModal = ({ open, onCancel, onSuccess, item }) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    if (open && item) {
      const unit = getQuantityUnit(
        item.inventoryUnit || item.unit,
        MEASUREMENT_UNITS.KILOGRAM,
      )
      form.setFieldsValue({
        quantity: undefined,
        unit,
        note: "",
      })
    } else {
      form.resetFields()
    }
  }, [open, item, form])

  const handleImport = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)

      const payload = {
        materialId: item?.materialId,
        quantity: values.quantity,
        unit: values.unit,
        note: values.note?.trim() || "Nhập vật tư bổ sung vào kho",
      }

      await InventoryService.addStock(payload, {
        errorHandling: "form",
        form,
        fieldErrorMapping: INVENTORY_IMPORT_FIELD_MAPPING,
      })
      onSuccess?.()
      onCancel?.()
    } catch (err) {
      if (!err?.errorFields) {
        const normalizedError = normalizeApiError(err)
        applyApiFieldErrors(
          form,
          normalizedError,
          INVENTORY_IMPORT_FIELD_MAPPING,
        )
      }
    } finally {
      setLoading(false)
    }
  }

  if (!item) return null

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      title={
        <div className="flex items-center gap-2 font-bold text-green-700">
          <InboxOutlined className="text-xl" /> Nhập kho vật tư
        </div>
      }
      onOk={handleImport}
      okText="Xác nhận nhập kho"
      cancelText="Hủy"
      confirmLoading={loading}
      okButtonProps={{ className: "bg-green-600 font-semibold" }}
      width={480}
      destroyOnClose
    >
      <div className="mt-3 mb-4 p-3 bg-green-50 border border-green-100 rounded-xl text-sm">
        <div>
          <span className="text-gray-500">Vật tư:</span>{" "}
          <strong className="text-gray-800">{item.name}</strong>
        </div>
        {item.code && (
          <div>
            <span className="text-gray-500">Mã vật tư:</span>{" "}
            <span className="font-mono text-gray-700">{item.code}</span>
          </div>
        )}
      </div>

      <Form form={form} layout="vertical">
        <Form.Item
          name="quantity"
          label={
            <span className="font-semibold text-gray-700">Số lượng nhập</span>
          }
          rules={[
            { required: true, message: "Nhập số lượng vật tư" },
            { type: "number", min: 0.001, message: "Số lượng phải lớn hơn 0" },
          ]}
        >
          <InputNumber
            min={0}
            placeholder="Nhập số lượng..."
            className="w-full h-10 rounded-xl"
            formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            parser={v => v?.replace(/,*/g, "")}
          />
        </Form.Item>

        <Form.Item name="unit" hidden>
          <Input />
        </Form.Item>
        <Form.Item
          label={
            <span className="font-semibold text-gray-700">Đơn vị nhập</span>
          }
        >
          <span className="inline-flex h-10 items-center rounded-xl bg-gray-50 px-3 font-semibold text-gray-700">
            {getQuantityUnit(
              item.inventoryUnit || item.unit,
              MEASUREMENT_UNITS.KILOGRAM,
            )}
          </span>
        </Form.Item>

        <Form.Item
          name="note"
          label={
            <span className="font-semibold text-gray-700">
              Ghi chú nhập kho
            </span>
          }
        >
          <Input.TextArea
            rows={3}
            placeholder="VD: Nhập thêm đợt 2 theo kế hoạch..."
            className="rounded-xl"
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default InventoryImportModal
