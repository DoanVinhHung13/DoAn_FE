import {
  BarcodeOutlined,
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  FileTextOutlined,
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
import { useNavigate } from 'react-router-dom'
import ROUTER from 'src/router/ROUTER'
import CropProtectionService from 'src/services/cropProtectionService'

const UNIT_OPTIONS = [
  { value: 'lít', label: 'Lít' },
  { value: 'ml', label: 'ml' },
  { value: 'kg', label: 'Kg' },
  { value: 'g', label: 'g' },
  { value: 'chai', label: 'Chai' },
  { value: 'gói', label: 'Gói' },
]

const AREA_UNIT_OPTIONS = [
  { value: 'ha', label: 'ha' },
  { value: 'm2', label: 'm2' },
  { value: 'sào', label: 'Sào' },
]

// ── Section header helper ─────────────────────────────────────────────────────
const SectionTitle = ({ children }) => (
  <div
    className="mb-4 px-4 py-2 rounded-lg font-semibold text-green-800"
    style={{ background: '#f0fdf4', borderLeft: '3px solid #16a34a', fontSize: 14 }}
  >
    {children}
  </div>
)

const CropProtectionFormFields = ({ isEdit, editingItem }) => {
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    if (isEdit) {
      form.setFieldsValue({
        code: editingItem.code || '',
        name: editingItem.name || '',
        manufacturer: editingItem.manufacturer || '',
        supplierId: editingItem.supplierId || undefined,
        minimumStock: editingItem.minimumStock || undefined,
        unit: editingItem.unit || undefined,
        description: editingItem.description || '',
        usages: editingItem.usages && editingItem.usages.length > 0
          ? editingItem.usages
          : [{}], // start with 1 empty usage
      })
    } else {
      form.resetFields()
      form.setFieldsValue({
        usages: [{}], // default 1 usage block
      })
    }
  }, [editingItem, isEdit, form])

  const handleSubmit = async (values) => {
    try {
      setLoading(true)

      const body = {
        code: values.code?.trim(),
        name: values.name?.trim(),
        manufacturer: values.manufacturer?.trim(),
        supplierId: values.supplierId || null,
        minimumStock: values.minimumStock || null,
        unit: values.unit || null,
        description: values.description?.trim() || null,
        usages: values.usages || [],
      }

      let res
      if (isEdit) {
        res = await CropProtectionService.updateCropProtection(editingItem.id, body)
      } else {
        res = await CropProtectionService.createCropProtection(body)
      }

      if (res?.success === false) {
        const errMsg = (res.message || '').toLowerCase()
        if (errMsg.includes('code') || errMsg.includes('mã')) {
          form.setFields([{ name: 'code', errors: ['Mã thuốc đã tồn tại.'] }])
        } else {
          message.error(res.message || 'Có lỗi xảy ra.')
        }
        return
      }

      message.success(
        isEdit
          ? 'Cập nhật thuốc BVTV thành công.'
          : 'Thêm mới thuốc BVTV thành công.',
      )
      navigate(ROUTER.FM_VIEW_CROP_PROTECTIONS)
    } catch (err) {
      message.error('Vui lòng kiểm tra lại thông tin bắt buộc.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyUsage = (name) => {
    const usages = form.getFieldValue('usages') || []
    const itemToCopy = usages[name]
    const newUsages = [...usages]
    newUsages.splice(name + 1, 0, { ...itemToCopy })
    form.setFieldsValue({ usages: newUsages })
  }

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      className=""
    >
      {/* ── Basic Info ── */}
      <SectionTitle>Thông Tin Cơ Bản</SectionTitle>
      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item
            name="code"
            label={<span className="font-semibold text-gray-700">Mã Thuốc bảo vệ thực vật <span className="text-red-500">*</span></span>}
            rules={[{ required: true, message: 'Bắt buộc' }]}
          >
            <Input placeholder="Nhập mã..." className="h-10 rounded-xl" disabled={isEdit} />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            name="name"
            label={<span className="font-semibold text-gray-700">Tên Thuốc bảo vệ thực vật <span className="text-red-500">*</span></span>}
            rules={[{ required: true, message: 'Bắt buộc' }]}
          >
            <Input placeholder="Nhập tên..." className="h-10 rounded-xl" />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item
            name="manufacturer"
            label={<span className="font-semibold text-gray-700">Nhà Sản Xuất</span>}
          >
            <Input placeholder="Nhập nhà sản xuất..." className="h-10 rounded-xl" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            name="supplierId"
            label={<span className="font-semibold text-gray-700">Nhà Cung Cấp</span>}
          >
            <Select placeholder="Chọn nhà cung cấp..." className="h-10 rounded-xl" allowClear>
              {/* Mock options, replace with API later */}
              <Select.Option value="SUP-001">Công ty Nông Nghiệp Xanh</Select.Option>
              <Select.Option value="SUP-002">Đại lý Vật tư Y</Select.Option>
            </Select>
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <div className="flex items-end gap-2">
            <Form.Item
              name="minimumStock"
              label={<span className="font-semibold text-gray-700">Tồn Kho tối thiểu (Số)</span>}
              className="flex-1 mb-0"
            >
              <InputNumber min={0} placeholder="0" className="w-full h-10 rounded-xl" />
            </Form.Item>
            <Form.Item
              name="unit"
              label={<span className="font-semibold text-gray-700">Đơn Vị tính</span>}
              className="w-1/3 mb-0"
            >
              <Select
                options={UNIT_OPTIONS}
                placeholder="Chọn..."
                className="h-10 rounded-xl"
                allowClear
              />
            </Form.Item>
          </div>
        </Col>

        <Col xs={24}>
          <Form.Item
            name="description"
            label={<span className="font-semibold text-gray-700">Mô Tả</span>}
            className="mt-4"
          >
            <Input.TextArea rows={4} placeholder="Nhập mô tả chi tiết..." className="rounded-xl" />
          </Form.Item>
        </Col>
      </Row>

      {/* ── Usages (Cách sử dụng) ── */}
      <SectionTitle>Cách Sử Dụng</SectionTitle>
      <Form.List name="usages">
        {(fields, { add, remove }) => (
          <>
            <div className="space-y-6 mb-3 mt-4">
              {fields.map(({ key, name, ...restField }, index) => (
                <div
                  key={key}
                  className="relative p-5 py-9 bg-gray-50 border border-gray-200 rounded-2xl shadow-sm"
                >
                  <div className="absolute -top-1 left-4 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200 shadow-sm shadow-emerald-50">
                    Cách sử dụng {index + 1}
                  </div>
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => remove(name)}
                    disabled={fields.length <= 1}
                    className="absolute top-1 right-1 !h-8 !w-8 rounded-lg"
                  />
                  <Row gutter={12}>
                    <Col xs={24} sm={12} md={6}>
                      <Form.Item {...restField} name={[name, 'targetCrop']} label="Đối tượng SD" className="mb-3">
                        <Input placeholder="Lúa, Ngô..." className="rounded-lg h-9 text-sm" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                      <Form.Item {...restField} name={[name, 'targetPest']} label="Đối tượng DT" className="mb-3">
                        <Input placeholder="Rầy nâu..." className="rounded-lg h-9 text-sm" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                      <Form.Item {...restField} name={[name, 'dilutionRatio']} label="Nồng độ" className="mb-3">
                        <Input placeholder="1:500" className="rounded-lg h-9 text-sm" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                      <Form.Item {...restField} name={[name, 'dilutionUnit']} label="ĐV Nồng độ" className="mb-3">
                        <Select options={UNIT_OPTIONS} placeholder="Chọn" className="h-9 rounded-lg text-sm" allowClear />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                      <Form.Item {...restField} name={[name, 'dosage']} label="Liều lượng (Số)" className="mb-0">
                        <InputNumber min={0} placeholder="Số" className="w-full h-9 rounded-lg text-sm" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                      <Form.Item {...restField} name={[name, 'dosageUnit']} label="ĐV Tính" className="mb-0">
                        <Select options={UNIT_OPTIONS} placeholder="Chọn" className="h-9 rounded-lg text-sm" allowClear />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                      <Form.Item {...restField} name={[name, 'areaUnit']} label="ĐV Diện tích" className="mb-0">
                        <Select options={AREA_UNIT_OPTIONS} placeholder="Chọn" className="h-9 rounded-lg text-sm" allowClear />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                      <Form.Item {...restField} name={[name, 'isolationDays']} label="Cách ly (Ngày)" className="mb-0">
                        <InputNumber min={0} placeholder="Ngày" className="w-full rounded-lg h-9 text-sm" />
                      </Form.Item>
                    </Col>
                  </Row>
                </div>
              ))}
            </div>

            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={() => add()}
              className="w-full mb-5 rounded-lg border-green-400 text-green-700 hover:border-green-500"
            >
              Thêm Cách sử dụng
            </Button>
          </>
        )}
      </Form.List>

      {/* ── Footer actions ── */}
      <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-gray-100">
        <Button onClick={() => navigate(ROUTER.FM_VIEW_CROP_PROTECTIONS)} className="h-10 px-6 rounded-xl" disabled={loading}>
          Hủy
        </Button>
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          icon={isEdit ? <EditOutlined /> : <PlusOutlined />}
          className="h-10 px-6 font-bold bg-emerald-600 border-0 shadow-lg rounded-xl shadow-emerald-100"
        >
          {isEdit ? 'Lưu thay đổi' : 'Thêm mới'}
        </Button>
      </div>
    </Form>
  )
}

export default CropProtectionFormFields
