import React from 'react'
import PropTypes from 'prop-types'
import { Col, Form, Input, InputNumber, Row, Select, Upload } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import { AREA_UNIT_OPTIONS, OWNERSHIP_OPTIONS } from './landPlotUtils'

/**
 * Form fields tái sử dụng cho LandPlotCreate và LandPlotEdit.
 * Render các trường: tên, mã, địa chỉ, diện tích, đơn vị, loại sở hữu, mô tả, upload ảnh.
 *
 * Lưu ý: Component này KHÔNG bọc <Form>, parent phải cung cấp form context.
 */
const LandPlotFormFields = ({
  certPreview = '',
  onBeforeUpload,
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
      label="Mã vùng trồng"
      name="code"
      rules={[{ required: true, message: 'Vui lòng nhập mã vùng trồng' }]}
    >
      <Input placeholder="Ví dụ: LP-001" maxLength={80} />
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
        <Form.Item label="Diện tích" name="area">
          <InputNumber
            className="w-full"
            min={0.0001}
            step={0.01}
            placeholder={showAreaPlaceholder ? 'Tự động từ bản đồ' : undefined}
          />
        </Form.Item>
      </Col>
      <Col span={10}>
        <Form.Item
          label="Đơn vị"
          name="areaUnit"
          rules={[{ required: true, message: 'Chọn đơn vị diện tích' }]}
        >
          <Select options={AREA_UNIT_OPTIONS} />
        </Form.Item>
      </Col>
    </Row>

    <Form.Item label="Loại sở hữu" name="ownershipType">
      <Select options={OWNERSHIP_OPTIONS} allowClear placeholder="Chọn loại sở hữu" />
    </Form.Item>

    <Form.Item label="Mô tả" name="description">
      <Input.TextArea rows={3} placeholder="Ghi chú thêm về vùng trồng" />
    </Form.Item>

    <Form.Item label="Giấy chứng nhận đất">
      <Upload
        listType="picture-card"
        showUploadList={false}
        accept="image/*"
        beforeUpload={onBeforeUpload}
      >
        {certPreview ? (
          <img
            src={certPreview}
            alt="Giấy chứng nhận"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div>
            <UploadOutlined />
            <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
          </div>
        )}
      </Upload>
    </Form.Item>
  </>
)

LandPlotFormFields.propTypes = {
  certPreview: PropTypes.string,
  onBeforeUpload: PropTypes.func.isRequired,
  showAddressRequired: PropTypes.bool,
  showAreaPlaceholder: PropTypes.bool,
}

export default LandPlotFormFields
