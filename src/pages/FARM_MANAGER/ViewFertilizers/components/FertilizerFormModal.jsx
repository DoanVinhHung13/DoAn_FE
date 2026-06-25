/**
 * FertilizerFormModal — Tạo mới / Chỉnh sửa phân bón
 * Triggered by: "Thêm mới" (create) | "Sửa" (update)
 *
 * Fields theo Figma:
 *   Section 1 – Thông Tin Cơ Bản:
 *     mã phân bón, Tên phân bón, Nhà Sản Xuất, Nhà Cung Cấp,
 *     Tồn Kho tối thiểu + Số + Đơn Vị tính, Loại Phân Bón, Mô Tả
 *
 *   Section 2 – Thành Phần:
 *     Bảng động: Tên thành Phần | Hàm Lượng | Đơn Vị Tính(%, ppm, CFU/g)
 *     Mặc định 3 hàng: N, P₂O₅, K₂O
 *
 *   Section 3 – Liều Lượng:
 *     Bảng động: Số | Đơn vị Tính (Kg/Lit) | Đơn Vị diện tích | Đối tượng
 *
 * Notification messages:
 *   MSG-FER-01: "Thêm mới phân bón thành công."
 *   MSG-FER-05: "Vui lòng nhập đầy đủ các trường thông tin bắt buộc."
 *   MSG-FER-06: "Mã phân bón đã tồn tại trong hệ thống."
 *   MSG-FER-09: "Cập nhật thông tin phân bón thành công."
 */
import {
  BarcodeOutlined,
  EditOutlined,
  ExperimentOutlined,
  MinusCircleOutlined,
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
  Typography,
} from 'antd'
import React from 'react'
import CustomModal from 'src/components/Modal/CustomModal'
import FertilizerService from 'src/services/FertilizerService'

const { Text } = Typography

// ── Options ──────────────────────────────────────────────────────────────────

const FERTILIZER_TYPE_OPTIONS = [
  { value: 'Vô cơ', label: 'Vô cơ' },
  { value: 'Hữu cơ', label: 'Hữu cơ' },
  { value: 'Hữu cơ khoáng', label: 'Hữu cơ khoáng' },
  { value: 'Vi sinh', label: 'Vi sinh' },
  { value: 'Phức hợp', label: 'Phức hợp' },
  { value: 'NPK', label: 'Phân NPK' },
  { value: 'Urê', label: 'Phân Urê' },
  { value: 'Khác', label: 'Khác' },
]

const UNIT_OPTIONS = [
  { value: 'kg', label: 'kg' },
  { value: 'g', label: 'g' },
  { value: 'tấn', label: 'tấn' },
  { value: 'lít', label: 'lít' },
  { value: 'ml', label: 'ml' },
  { value: 'bao', label: 'bao' },
  { value: 'chai', label: 'chai' },
]

const COMPONENT_UNIT_OPTIONS = [
  { value: '%', label: '%' },
  { value: 'ppm', label: 'ppm' },
  { value: 'CFU/g', label: 'CFU/g' },
  { value: 'mg/kg', label: 'mg/kg' },
]

const AREA_UNIT_OPTIONS = [
  { value: 'ha', label: 'ha' },
  { value: 'm²', label: 'm²' },
  { value: 'sào', label: 'sào' },
  { value: 'công', label: 'công' },
]

const TARGET_OPTIONS = [
  { value: 'Cây ăn quả', label: 'Cây ăn quả' },
  { value: 'Rau', label: 'Rau' },
  { value: 'Cây lâu năm', label: 'Cây lâu năm' },
  { value: 'Lúa', label: 'Lúa' },
  { value: 'Ngô', label: 'Ngô' },
  { value: 'Cây công nghiệp', label: 'Cây công nghiệp' },
  { value: 'Cây hoa', label: 'Cây hoa' },
  { value: 'Cây dược liệu', label: 'Cây dược liệu' },
  { value: 'Cây cảnh', label: 'Cây cảnh' },
  { value: 'Cỏ / Thảm cỏ', label: 'Cỏ / Thảm cỏ' },
  { value: 'Khác', label: 'Khác' },
]

const DEFAULT_COMPONENTS = [
  { name: 'N', content: '', unit: '%' },
  { name: 'P₂O₅', content: '', unit: '%' },
  { name: 'K₂O', content: '', unit: '%' },
]

const DEFAULT_DOSAGE = { quantity: '', unit: 'kg', areaUnit: 'ha', target: '' }

// ── Section header helper ─────────────────────────────────────────────────────
const SectionTitle = ({ children }) => (
  <div
    className="mb-4 px-4 py-2 rounded-lg font-semibold text-green-800"
    style={{ background: '#f0fdf4', borderLeft: '3px solid #16a34a', fontSize: 14 }}
  >
    {children}
  </div>
)

// ── Main Component ────────────────────────────────────────────────────────────
const FertilizerFormModal = ({ open, editingItem, onClose, onSuccess }) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = React.useState(false)
  const [components, setComponents] = React.useState(DEFAULT_COMPONENTS)
  const [dosages, setDosages] = React.useState([DEFAULT_DOSAGE])
  const isEdit = !!editingItem

  // ── Populate form on open ──────────────────────────────────────────────────
  React.useEffect(() => {
    if (open) {
      if (isEdit) {
        form.setFieldsValue({
          code: editingItem.code || '',
          name: editingItem.name || '',
          manufacturer: editingItem.manufacturer || '',
          supplier: editingItem.supplier || '',
          minimumStock: editingItem.minimumStock ?? 0,
          unit: editingItem.unit || undefined,
          fertilizerType: editingItem.fertilizerType || editingItem.category || undefined,
          description: editingItem.description || '',
        })
        // Thành phần
        setComponents(
          editingItem.components?.length
            ? editingItem.components
            : DEFAULT_COMPONENTS,
        )
        // Liều lượng
        setDosages(
          editingItem.dosages?.length ? editingItem.dosages : [DEFAULT_DOSAGE],
        )
      } else {
        form.resetFields()
        setComponents(DEFAULT_COMPONENTS)
        setDosages([DEFAULT_DOSAGE])
      }
    }
  }, [open, editingItem, isEdit, form])

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (values) => {
    try {
      setLoading(true)

      const body = {
        code: values.code?.trim(),
        name: values.name?.trim(),
        manufacturer: values.manufacturer?.trim() || '',
        supplier: values.supplier?.trim() || '',
        minimumStock: values.minimumStock ?? 0,
        unit: values.unit,
        fertilizerType: values.fertilizerType || '',
        description: values.description?.trim() || '',
        components: components.filter((c) => c.name?.trim()),
        dosages: dosages.filter((d) => d.quantity !== '' && d.quantity != null),
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
          form.setFields([{ name: 'code', errors: ['Mã phân bón đã tồn tại trong hệ thống.'] }])
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
        form.setFields([{ name: 'code', errors: ['Mã phân bón đã tồn tại trong hệ thống.'] }])
      } else {
        message.error('Vui lòng nhập đầy đủ các trường thông tin bắt buộc.')
      }
    } finally {
      setLoading(false)
    }
  }

  // ── Component row handlers ─────────────────────────────────────────────────
  const handleComponentChange = (index, field, value) => {
    const updated = [...components]
    updated[index] = { ...updated[index], [field]: value }
    setComponents(updated)
  }

  const handleAddComponent = () =>
    setComponents([...components, { name: '', content: '', unit: '%' }])

  const handleRemoveComponent = (index) =>
    setComponents(components.filter((_, i) => i !== index))

  // ── Dosage row handlers ────────────────────────────────────────────────────
  const handleDosageChange = (index, field, value) => {
    const updated = [...dosages]
    updated[index] = { ...updated[index], [field]: value }
    setDosages(updated)
  }

  const handleAddDosage = () => setDosages([...dosages, { ...DEFAULT_DOSAGE }])

  const handleRemoveDosage = (index) =>
    setDosages(dosages.filter((_, i) => i !== index))

  // ── Render ─────────────────────────────────────────────────────────────────
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
      width={800}
      destroyOnClose
      styles={{ body: { maxHeight: '75vh', overflowY: 'auto', paddingRight: 8 } }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="mt-4"
      >
        {/* ════════════════════════════════════════════════════════════════
            Section 1 – Thông Tin Cơ Bản
        ═══════════════════════════════════════════════════════════════════ */}
        <SectionTitle>Thông Tin Cơ Bản</SectionTitle>

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
                placeholder="mã phân bón"
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
                placeholder="Tên phân bón"
                className="h-10 rounded-lg"
              />
            </Form.Item>
          </Col>

          {/* Nhà Sản Xuất */}
          <Col xs={24} md={12}>
            <Form.Item
              name="manufacturer"
              label={
                <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                  Nhà Sản Xuất
                </span>
              }
            >
              <Input placeholder="Nhà Sản Xuất" className="h-10 rounded-lg" />
            </Form.Item>
          </Col>

          {/* Nhà Cung Cấp */}
          <Col xs={24} md={12}>
            <Form.Item
              name="supplier"
              label={
                <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                  Nhà Cung Cấp
                </span>
              }
            >
              <Input placeholder="Nhà Cung Cấp" className="h-10 rounded-lg" />
            </Form.Item>
          </Col>

          {/* Tồn Kho tối thiểu */}
          <Col xs={24} sm={8}>
            <Form.Item
              name="minimumStock"
              label={
                <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                  Tồn Kho tối thiểu
                </span>
              }
              rules={[{ type: 'number', min: 0, message: 'Số lượng phải >= 0.' }]}
            >
              <InputNumber
                min={0}
                placeholder="Số"
                className="w-full h-10 rounded-lg"
                formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(v) => v?.replace(/,*/g, '')}
              />
            </Form.Item>
          </Col>

          {/* Đơn Vị tính */}
          <Col xs={24} sm={8}>
            <Form.Item
              name="unit"
              label={
                <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                  Đơn Vị tính (kg/lit) <span className="text-red-500">*</span>
                </span>
              }
              rules={[{ required: true, message: 'Vui lòng chọn đơn vị tính.' }]}
            >
              <Select
                placeholder="Chọn đơn vị"
                className="h-10"
                options={UNIT_OPTIONS}
                showSearch
                optionFilterProp="label"
              />
            </Form.Item>
          </Col>

          {/* Loại Phân Bón */}
          <Col xs={24} sm={8}>
            <Form.Item
              name="fertilizerType"
              label={
                <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                  Loại Phân Bón
                </span>
              }
            >
              <Select
                allowClear
                placeholder="Loại Phân Bón"
                className="h-10"
                options={FERTILIZER_TYPE_OPTIONS}
              />
            </Form.Item>
          </Col>

          {/* Mô Tả */}
          <Col xs={24}>
            <Form.Item
              name="description"
              label={
                <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                  Mô Tả
                </span>
              }
            >
              <Input.TextArea
                rows={3}
                placeholder="Mô Tả"
                className="rounded-lg"
                maxLength={1000}
                showCount
              />
            </Form.Item>
          </Col>
        </Row>

        {/* ════════════════════════════════════════════════════════════════
            Section 2 – Thành Phần
        ═══════════════════════════════════════════════════════════════════ */}
        <SectionTitle>Thành Phần</SectionTitle>

        {/* Column header */}
        <Row gutter={8} className="mb-2 px-1">
          <Col flex="1 1 140px">
            <Text type="secondary" className="text-xs font-semibold">Tên thành Phần</Text>
          </Col>
          <Col flex="1 1 100px">
            <Text type="secondary" className="text-xs font-semibold">Hàm Lượng</Text>
          </Col>
          <Col flex="1 1 120px">
            <Text type="secondary" className="text-xs font-semibold">
              Đơn Vị Tính(%, ppm,CFU/g)
            </Text>
          </Col>
          <Col flex="none" style={{ width: 36 }} />
        </Row>

        <div className="space-y-2 mb-3">
          {components.map((comp, index) => (
            <div
              key={index}
              className="flex items-center gap-2 rounded-lg bg-gray-50 border border-gray-100 px-3 py-2"
            >
              <div style={{ flex: '1 1 140px' }}>
                <Input
                  value={comp.name}
                  onChange={(e) => handleComponentChange(index, 'name', e.target.value)}
                  placeholder="Tên thành phần"
                  className="h-9 rounded-lg"
                />
              </div>
              <div style={{ flex: '1 1 100px' }}>
                <InputNumber
                  value={comp.content}
                  onChange={(val) => handleComponentChange(index, 'content', val)}
                  placeholder="0"
                  min={0}
                  className="w-full h-9 rounded-lg"
                />
              </div>
              <div style={{ flex: '1 1 120px' }}>
                <Select
                  value={comp.unit}
                  onChange={(val) => handleComponentChange(index, 'unit', val)}
                  options={COMPONENT_UNIT_OPTIONS}
                  className="w-full h-9"
                />
              </div>
              <Button
                type="text"
                danger
                icon={<MinusCircleOutlined />}
                onClick={() => handleRemoveComponent(index)}
                disabled={components.length <= 1}
                className="!h-9 !w-9 shrink-0 rounded-lg"
              />
            </div>
          ))}
        </div>

        <Button
          type="dashed"
          icon={<PlusOutlined />}
          onClick={handleAddComponent}
          className="w-full mb-5 rounded-lg border-green-400 text-green-700 hover:border-green-500"
        >
          + Thêm Thành Phần
        </Button>

        {/* ════════════════════════════════════════════════════════════════
            Section 3 – Liều Lượng
        ═══════════════════════════════════════════════════════════════════ */}
        <SectionTitle>Liều Lượng</SectionTitle>

        <div className="space-y-2 mb-3">
          {dosages.map((dosage, index) => (
            <div
              key={index}
              className="flex flex-wrap items-end gap-2 rounded-lg bg-gray-50 border border-gray-100 px-3 py-2"
            >
              {/* Số */}
              <div style={{ flex: '0 0 80px' }}>
                <Text type="secondary" className="block mb-1 text-xs">Số</Text>
                <InputNumber
                  value={dosage.quantity}
                  onChange={(val) => handleDosageChange(index, 'quantity', val)}
                  placeholder="Số"
                  min={0}
                  className="w-full h-9 rounded-lg"
                />
              </div>
              {/* Đơn vị Tính */}
              <div style={{ flex: '1 1 100px' }}>
                <Text type="secondary" className="block mb-1 text-xs">Đơn vị Tính (Kg/ Lit)</Text>
                <Select
                  value={dosage.unit}
                  onChange={(val) => handleDosageChange(index, 'unit', val)}
                  options={UNIT_OPTIONS}
                  className="w-full h-9"
                />
              </div>
              {/* Đơn Vị diện tích */}
              <div style={{ flex: '1 1 100px' }}>
                <Text type="secondary" className="block mb-1 text-xs">Đơn Vị diện tích</Text>
                <Select
                  value={dosage.areaUnit}
                  onChange={(val) => handleDosageChange(index, 'areaUnit', val)}
                  options={AREA_UNIT_OPTIONS}
                  className="w-full h-9"
                />
              </div>
              {/* Đối tượng */}
              <div style={{ flex: '2 1 140px' }}>
                <Text type="secondary" className="block mb-1 text-xs">Đối tượng</Text>
                <Select
                  value={dosage.target || undefined}
                  onChange={(val) => handleDosageChange(index, 'target', val)}
                  placeholder="Chọn đối tượng..."
                  options={TARGET_OPTIONS}
                  className="w-full h-9"
                  allowClear
                  showSearch
                  optionFilterProp="label"
                />
              </div>
              <Button
                type="text"
                danger
                icon={<MinusCircleOutlined />}
                onClick={() => handleRemoveDosage(index)}
                disabled={dosages.length <= 1}
                className="!h-9 !w-9 shrink-0 rounded-lg"
              />
            </div>
          ))}
        </div>

        <Button
          type="dashed"
          icon={<PlusOutlined />}
          onClick={handleAddDosage}
          className="w-full mb-5 rounded-lg border-green-400 text-green-700 hover:border-green-500"
        >
          + Thêm Liều Lượng
        </Button>

        {/* ── Footer actions ── */}
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
