import React from 'react'
import PropTypes from 'prop-types'
import { Col, Form, Input, InputNumber, Row } from 'antd'
import { MEASUREMENT_UNITS } from 'src/constants/measurementUnits'

/**
 * Form fields tái sử dụng cho LandPlotCreate và LandPlotEdit.
 * Render các trường: tên, địa chỉ, diện tích, đơn vị và mô tả.
 *
 * Lưu ý: Component này KHÔNG bọc <Form>, parent phải cung cấp form context.
 */
const LandPlotFormFields = ({
  showAddressRequired = false,
  showAreaPlaceholder = false,
}) => (
  <>
    <Form.Item
      label="Tên vùng trồng"
      name="name"
      rules={[{ required: true, message: 'Vui lòng nhập tên vùng trồng' }]}
    >
      <Input placeholder="Ví dụ: Lô A1" maxLength={200} />
    </Form.Item>

    <Form.Item
      label="Địa chỉ"
      name="address"
      rules={
        showAddressRequired
          ? [{ required: true, message: 'Vui lòng nhập địa chỉ' }]
          : undefined
      }
    >
      <Input.TextArea rows={2} maxLength={300} placeholder="Địa chỉ chi tiết" />
    </Form.Item>

    <Row gutter={12}>
      <Col span={14}>
        <Form.Item
          label="Diện tích"
          name="area"
          rules={[{ required: true, message: 'Vui lòng nhập diện tích' }]}
        >
          <InputNumber
            className="w-full"
            min={0.0001}
            step={0.01}
            placeholder={showAreaPlaceholder ? 'Tự động từ bản đồ' : undefined}
          />
        </Form.Item>
      </Col>
      <Col span={10}>
        <Form.Item name="areaUnit" hidden>
          <Input />
        </Form.Item>
        <Form.Item label="Đơn vị">
          <span className="inline-flex h-10 items-center rounded-lg bg-gray-50 px-3 font-semibold text-gray-700">
            {MEASUREMENT_UNITS.SQUARE_METER}
          </span>
        </Form.Item>
      </Col>
    </Row>

    <Form.Item label="Mô tả" name="description">
      <Input.TextArea rows={3} placeholder="Ghi chú thêm về vùng trồng" />
    </Form.Item>
  </>
)

LandPlotFormFields.propTypes = {
  showAddressRequired: PropTypes.bool,
  showAreaPlaceholder: PropTypes.bool,
}

export default LandPlotFormFields
