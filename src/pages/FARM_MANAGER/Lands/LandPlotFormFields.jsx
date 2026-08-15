import React from 'react'
import PropTypes from 'prop-types'
import { Col, Form, Input, InputNumber, Row } from 'antd'
import { MEASUREMENT_UNITS } from 'src/constants/measurementUnits'
import AddressSelectorField from 'src/components/AddressSelectorField'

/**
 * Form fields tái sử dụng cho LandPlotCreate và LandPlotEdit.
 * Render các trường: tên, địa chỉ, diện tích, đơn vị và mô tả.
 *
 * Lưu ý: Component này KHÔNG bọc <Form>, parent phải cung cấp form context.
 */
const LandPlotFormFields = ({
  showAreaPlaceholder = false,
  disabled = false,
}) => {
  return <>
    <Form.Item
      label="Tên vùng trồng"
      name="name"
      rules={[
        { required: true, message: 'Vui lòng nhập tên vùng trồng' },
        {
          validator: (_, value) => {
            if (!value) return Promise.resolve();
            const trimmed = value.trim();
            if (!trimmed) {
              return Promise.reject(new Error('Tên vùng trồng không được chỉ chứa khoảng trắng'));
            }
            if (trimmed.length > 100) {
              return Promise.reject(new Error('Tên vùng trồng không được vượt quá 100 ký tự.'));
            }
            if (trimmed !== trimmed.replace(/\s+/g, ' ')) {
              return Promise.reject(new Error('Tên vùng trồng không được chứa nhiều khoảng trắng liên tiếp.'));
            }
            return Promise.resolve();
          },
        },
      ]}
    >
      <Input disabled={disabled} placeholder="Ví dụ: Lô A1" />
    </Form.Item>

    <Form.Item
      label="Địa chỉ"
      name="address"
      rules={[
        { required: true, message: 'Vui lòng nhập địa chỉ' },
        {
          validator: (_, value) => {
            if (!value) return Promise.resolve();
            const trimmed = value.trim();
            if (!trimmed) {
              return Promise.reject(new Error('Địa chỉ không được chỉ chứa khoảng trắng'));
            }
            if (trimmed.length > 500) {
              return Promise.reject(new Error('Địa chỉ không được vượt quá 500 ký tự.'));
            }
            if (trimmed !== trimmed.replace(/\s+/g, ' ')) {
              return Promise.reject(new Error('Địa chỉ không được chứa nhiều khoảng trắng liên tiếp.'));
            }
            return Promise.resolve();
          },
        },
      ]}
    >
      <AddressSelectorField disabled={disabled} />
    </Form.Item>

    <Row gutter={12}>
      <Col span={14}>
        <Form.Item
          label="Diện tích"
          name="area"
          rules={[{ required: true, message: 'Vui lòng nhập diện tích' }]}
        >
          <InputNumber
            disabled={disabled}
            className="w-full"
            min={0.0001}
            step={0.01}
            placeholder={showAreaPlaceholder ? 'Tự động từ bản đồ' : undefined}
          />
        </Form.Item>
      </Col>
      <Col span={10}>
        <Form.Item name="areaUnit" hidden>
          <Input disabled={disabled} />
        </Form.Item>
        <Form.Item label="Đơn vị">
          <span className="inline-flex h-10 items-center rounded-lg bg-gray-50 px-3 font-semibold text-gray-700">
            {MEASUREMENT_UNITS.SQUARE_METER}
          </span>
        </Form.Item>
      </Col>
    </Row>

    <Form.Item 
      label="Mô tả" 
      name="description"
      rules={[
        {
          validator: (_, value) => {
            if (!value) return Promise.resolve();
            const trimmed = value.trim();
            if (!trimmed) return Promise.resolve();
            if (trimmed.length > 500) {
              return Promise.reject(new Error('Mô tả không được vượt quá 500 ký tự.'));
            }
            if (trimmed !== trimmed.replace(/\s+/g, ' ')) {
              return Promise.reject(new Error('Mô tả không được chứa nhiều khoảng trắng liên tiếp.'));
            }
            return Promise.resolve();
          },
        },
      ]}
    >
      <Input.TextArea disabled={disabled} rows={3} placeholder="Ghi chú thêm về vùng trồng" />
    </Form.Item>
  </>
}

LandPlotFormFields.propTypes = {
  showAreaPlaceholder: PropTypes.bool,
  disabled: PropTypes.bool,
}

export default LandPlotFormFields
