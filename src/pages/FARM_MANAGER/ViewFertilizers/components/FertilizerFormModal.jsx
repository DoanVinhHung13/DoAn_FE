/**
 * FertilizerFormModal — Tạo mới / Chỉnh sửa phân bón
 * Triggered by: "Thêm mới" (create) | "Sửa" (update)
 *
 * Notification messages:
 *   MSG-FER-01: "Thêm mới phân bón thành công."        (create success)
 *   MSG-FER-05: "Vui lòng nhập đầy đủ các trường thông tin bắt buộc."   (validation)
 *   MSG-FER-06: "Mã phân bón đã tồn tại trong hệ thống."  (duplicate code)
 *   MSG-FER-09: "Cập nhật thông tin phân bón thành công." (update success)
 */
import {
  BarcodeOutlined,
  ContainerOutlined,
  EditOutlined,
  ExperimentOutlined,
  InfoCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons'
import {
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  message,
  Row,
  Select,
} from 'antd'
import React from 'react'
import CustomModal from 'src/components/Modal/CustomModal'
import FertilizerService from 'src/services/fertilizerService'

// Danh mục phân loại phân bón (UI-only, có thể mở rộng từ SystemKey)
const FERTILIZER_CATEGORIES = [
  { value: 'NPK', label: 'Phân NPK' },
  { value: 'UREA', label: 'Phân Urê' },
  { value: 'ORGANIC', label: 'Phân hữu cơ' },
  { value: 'INORGANIC', label: 'Phân vô cơ' },
  { value: 'MICRONUTRIENT', label: 'Phân vi lượng' },
  { value: 'BIOLOGICAL', label: 'Phân sinh học' },
  { value: 'OTHER', label: 'Khác' },
]

// Đơn vị tính phổ biến
const UNIT_OPTIONS = [
  { value: 'kg', label: 'kg' },
  { value: 'g', label: 'g' },
  { value: 'tấn', label: 'tấn' },
  { value: 'lít', label: 'lít' },
  { value: 'ml', label: 'ml' },
  { value: 'bao', label: 'bao' },
  { value: 'chai', label: 'chai' },
]

const FertilizerFormModal = ({ open, editingItem, onClose, onSuccess }) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = React.useState(false)
  const isEdit = !!editingItem

  // Điền dữ liệu khi mở modal
  React.useEffect(() => {
    if (open) {
      if (isEdit) {
        form.setFieldsValue({
          code:         editingItem.code || '',
          name:         editingItem.name || '',
          category:     editingItem.category || undefined,
          unit:         editingItem.unit || undefined,
          description:  editingItem.description || '',
          manufacturer: editingItem.manufacturer || '',
          minimumStock: editingItem.minimumStock ?? 0,
        })
      } else {
        form.resetFields()
      }
    }
  }, [open, editingItem, isEdit, form])

  const handleSubmit = async (values) => {
    try {
      setLoading(true)

      const body = {
        code:         values.code?.trim(),
        name:         values.name?.trim(),
        unit:         values.unit,
        description:  values.description?.trim() || null,
        minimumStock: values.minimumStock ?? 0,
        // category & manufacturer dùng trường description mở rộng nếu API chưa có field riêng
        // Khi API hỗ trợ field riêng, tách ra đây
      }

      let res
      if (isEdit) {
        res = await FertilizerService.updateFertilizer(editingItem.id, body)
      } else {
        res = await FertilizerService.createFertilizer(body)
      }

      if (res?.success === false) {
        const errMsg = (res.message || (res.errors && res.errors[0]) || '').toLowerCase()
        if (errMsg.includes('code') || errMsg.includes('mã')) {
          form.setFields([
            {
              name: 'code',
              errors: ['Mã phân bón đã tồn tại trong hệ thống.'],
            },
          ])
        }
        return
      }

      message.success(
        isEdit
          ? 'Cập nhật thông tin phân bón thành công.'
          : 'Thêm mới phân bón thành công.',
      )
      onClose()
      onSuccess?.()
    } catch (err) {
      const errMsg = (
        err?.response?.data?.message ||
        err?.message ||
        ''
      ).toLowerCase()
      if (errMsg.includes('code') || errMsg.includes('mã')) {
        form.setFields([
          {
            name: 'code',
            errors: ['Mã phân bón đã tồn tại trong hệ thống.'],
          },
        ])
      } else {
        message.error('Vui lòng nhập đầy đủ các trường thông tin bắt buộc.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <CustomModal
      open={open}
      onCancel={onClose}
      title={
        <div className="flex items-center gap-2 py-1">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-50">
            {isEdit
              ? <EditOutlined className="text-green-600" />
              : <PlusOutlined className="text-green-600" />}
          </div>
          <span className="font-bold">
            {isEdit ? 'Chỉnh sửa phân bón' : 'Thêm mới phân bón'}
          </span>
        </div>
      }
      footer={null}
      width={720}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="mt-4"
      >
        <Row gutter={16}>
          {/* Mã phân bón */}
          <Col xs={24} md={12}>
            <Form.Item
              name="code"
              label={
                <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                  Mã phân bón <span className="text-red-500">*</span>
                </span>
              }
              rules={[
                { required: true, message: 'Vui lòng nhập mã phân bón.' },
                { max: 30, message: 'Mã phân bón tối đa 30 ký tự.' },
                {
                  pattern: /^[A-Za-z0-9_\-]+$/,
                  message: 'Mã chỉ chứa chữ cái, số, dấu gạch dưới hoặc gạch ngang.',
                },
              ]}
            >
              <Input
                prefix={<BarcodeOutlined className="text-gray-300" />}
                placeholder="VD: PB-NPK-001"
                className="h-10 rounded-lg"
                disabled={isEdit}
              />
            </Form.Item>
          </Col>

          {/* Tên phân bón */}
          <Col xs={24} md={12}>
            <Form.Item
              name="name"
              label={
                <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                  Tên phân bón <span className="text-red-500">*</span>
                </span>
              }
              rules={[
                { required: true, message: 'Vui lòng nhập tên phân bón.' },
                { max: 100, message: 'Tên phân bón tối đa 100 ký tự.' },
              ]}
            >
              <Input
                prefix={<ExperimentOutlined className="text-gray-300" />}
                placeholder="VD: Phân NPK 16-16-8"
                className="h-10 rounded-lg"
              />
            </Form.Item>
          </Col>

          {/* Phân loại */}
          <Col xs={24} md={12}>
            <Form.Item
              name="category"
              label={
                <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                  Phân loại
                </span>
              }
            >
              <Select
                allowClear
                placeholder="Chọn phân loại"
                className="h-10 rounded-lg"
                options={FERTILIZER_CATEGORIES}
              />
            </Form.Item>
          </Col>

          {/* Đơn vị tính */}
          <Col xs={24} md={12}>
            <Form.Item
              name="unit"
              label={
                <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                  Đơn vị tính <span className="text-red-500">*</span>
                </span>
              }
              rules={[{ required: true, message: 'Vui lòng chọn đơn vị tính.' }]}
            >
              <Select
                placeholder="Chọn đơn vị"
                className="h-10 rounded-lg"
                options={UNIT_OPTIONS}
                showSearch
                optionFilterProp="label"
              />
            </Form.Item>
          </Col>

          {/* Nhà sản xuất */}
          <Col xs={24} md={12}>
            <Form.Item
              name="manufacturer"
              label={
                <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                  Nhà sản xuất
                </span>
              }
            >
              <Input
                placeholder="VD: Công ty TNHH Phân bón ABC"
                className="h-10 rounded-lg"
              />
            </Form.Item>
          </Col>

          {/* Số lượng tồn kho tối thiểu */}
          <Col xs={24} md={12}>
            <Form.Item
              name="minimumStock"
              label={
                <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                  Tồn kho tối thiểu
                </span>
              }
              rules={[
                { type: 'number', min: 0, message: 'Số lượng phải >= 0.' },
              ]}
            >
              <InputNumber
                min={0}
                placeholder="0"
                className="w-full h-10 rounded-lg"
                formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(v) => v?.replace(/,*/g, '')}
              />
            </Form.Item>
          </Col>

          {/* Hướng dẫn sử dụng / Mô tả */}
          <Col xs={24}>
            <Form.Item
              name="description"
              label={
                <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                  <InfoCircleOutlined className="mr-1" />
                  Hướng dẫn sử dụng / Liều lượng
                </span>
              }
            >
              <Input.TextArea
                rows={4}
                placeholder="Nhập liều lượng khuyến nghị, cách pha chế, lưu ý khi sử dụng..."
                className="rounded-lg"
                maxLength={1000}
                showCount
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Footer actions */}
        <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-gray-100">
          <Button
            onClick={onClose}
            className="h-10 px-6 rounded-xl"
            disabled={loading}
          >
            Hủy
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            icon={isEdit ? <EditOutlined /> : <PlusOutlined />}
            className="h-10 px-6 font-bold bg-green-600 border-0 shadow-lg rounded-xl shadow-green-100"
          >
            {isEdit ? 'Lưu thay đổi' : 'Thêm mới'}
          </Button>
        </div>
      </Form>
    </CustomModal>
  )
}

export default FertilizerFormModal
