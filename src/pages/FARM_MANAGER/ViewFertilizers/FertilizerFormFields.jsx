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
import { useNavigate } from 'react-router-dom'
import ROUTER from 'src/router/ROUTER'
import FertilizerService from 'src/services/FertilizerService'
import { useSystemKey } from 'src/hooks/useSystemKey'
import { SYSTEM_KEY } from 'src/constants/systemKey'
import { getQuantityUnit, MEASUREMENT_UNITS } from 'src/constants/measurementUnits'

const { Text } = Typography

// ── Options ──────────────────────────────────────────────────────────────────

const NPK_OPTION = [
  { name: 'N', value: '', unit: '%' },
  { name: 'P₂O₅', value: '', unit: '%' },
  { name: 'K₂O', value: '', unit: '%' },
]

/** Số lượng thành phần mặc định (N, P, K) — không cho xóa, không cho sửa tên */
const DEFAULT_NPK_OPTION = NPK_OPTION.length

const DEFAULT_DOSAGE = {
  amount: '',
  unit: MEASUREMENT_UNITS.KILOGRAM,
  areaUnit: MEASUREMENT_UNITS.SQUARE_METER,
  target: '',
}

// ── Section header helper ─────────────────────────────────────────────────────
import SectionTitle from 'src/components/Common/SectionTitle'
import { useCropOptions } from 'src/hooks/useCropOptions'

// ── Main Component ────────────────────────────────────────────────────────────
const FertilizerFormFields = ({ isEdit, editingItem }) => {
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const { getCombo } = useSystemKey()
  const { cropOptions, isCropsLoading } = useCropOptions()

  const FERTILIZER_TYPE_OPTIONS = getCombo(SYSTEM_KEY.FERTILIZER_TYPE).map(opt => ({
    value: opt.codeValue || opt.value,
    label: opt.label || opt.description,
  }))

  const UNIT_OPTIONS = [
    { value: MEASUREMENT_UNITS.LITER, label: MEASUREMENT_UNITS.LITER },
    { value: MEASUREMENT_UNITS.KILOGRAM, label: MEASUREMENT_UNITS.KILOGRAM },
  ]
  const [loading, setLoading] = React.useState(false)
  const [quantityUnit, setQuantityUnit] = React.useState(MEASUREMENT_UNITS.KILOGRAM)
  const [components, setComponents] = React.useState(NPK_OPTION)
  const [dosages, setDosages] = React.useState([DEFAULT_DOSAGE])

  // ── Populate form on open ──────────────────────────────────────────────────
  React.useEffect(() => {
    if (isEdit) {
      const selectedUnit = getQuantityUnit(editingItem.unit, MEASUREMENT_UNITS.KILOGRAM)
      setQuantityUnit(selectedUnit)
      form.setFieldsValue({
        usageUnit: selectedUnit,
        name: editingItem.name || '',
        manufacturer: editingItem.manufacturer || '',
        supplier: editingItem.supplier || '',
        minimumStock: editingItem.minimumStock ?? 0,
        inventoryQuantity: editingItem.inventoryQuantity ?? 0,
        inventoryUnit: selectedUnit,
        unit: selectedUnit,
        type: editingItem.type || editingItem.fertilizerType || editingItem.category || undefined,
        description: editingItem.description || '',
      })
      // Thành phần
      const incomingComps = editingItem.compositions?.length
        ? editingItem.compositions
        : editingItem.components?.length
          ? editingItem.components
          : [];

      if (incomingComps.length > 0) {
        const mapToDisplay = (c) => {
          if (!c) return c;
          if (c.unit === 'CFU/g' && c.value != null) {
            const val = Number(c.value);
            if (val > 0) {
              const exponent = Math.floor(Math.log10(val));
              const base = Number((val / Math.pow(10, exponent)).toFixed(2));
              return { ...c, base, exponent };
            }
          }
          return c;
        };

        // Find existing standard components
        const compN = incomingComps.find(c => c.name === 'N');
        const compP = incomingComps.find(c => c.name === 'P₂O₅');
        const compK = incomingComps.find(c => c.name === 'K₂O');

        // Other components
        const others = incomingComps.filter(c => !['N', 'P₂O₅', 'K₂O'].includes(c.name));

        setComponents([
          { ...(mapToDisplay(compN) || { value: '' }), name: 'N', unit: '%' },
          { ...(mapToDisplay(compP) || { value: '' }), name: 'P₂O₅', unit: '%' },
          { ...(mapToDisplay(compK) || { value: '' }), name: 'K₂O', unit: '%' },
          ...others.map(mapToDisplay)
        ]);
      } else {
        setComponents(NPK_OPTION);
      }
      // Liều lượng
      setDosages(
        editingItem.dosages?.length
          ? editingItem.dosages.map(d => ({
              ...d,
              unit: selectedUnit,
              areaUnit: MEASUREMENT_UNITS.SQUARE_METER,
            }))
          : [{ ...DEFAULT_DOSAGE, unit: selectedUnit }],
      )
    } else {
      setQuantityUnit(MEASUREMENT_UNITS.KILOGRAM)
      form.resetFields()
      form.setFieldsValue({
        unit: MEASUREMENT_UNITS.KILOGRAM,
        usageUnit: MEASUREMENT_UNITS.KILOGRAM,
        inventoryUnit: MEASUREMENT_UNITS.KILOGRAM,
      })
      setComponents(NPK_OPTION)
      setDosages([{ ...DEFAULT_DOSAGE }])
    }
  }, [editingItem, isEdit, form])

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (values) => {
    try {
      // Custom validations
      const missingNPK = components.slice(0, 3).some(c => {
        if (c.unit === 'CFU/g') return c.base == null || c.base === '' || c.exponent == null || c.exponent === '';
        return c.value == null || c.value === '' || !c.unit;
      });
      if (missingNPK) {
        message.error('Thành phần N, P₂O₅, K₂O bắt buộc phải có Giá trị và Đơn vị.');
        return;
      }

      // Unit-specific validations
      let totalPercentage = 0;
      for (const comp of components) {
        if (!comp.name?.trim()) continue;

        let val;
        if (comp.unit === 'CFU/g') {
          if (comp.base == null || comp.base === '' || comp.exponent == null || comp.exponent === '') continue;
          val = Number(comp.base) * Math.pow(10, Number(comp.exponent));
        } else {
          if (comp.value == null || comp.value === '') continue;
          val = Number(comp.value);
        }

        if (Number.isNaN(val)) {
          message.error(`Giá trị của ${comp.name} không hợp lệ.`);
          return;
        }

        if (comp.unit === '%') {
          if (val < 0 || val > 100) {
            message.error(`Giá trị của ${comp.name} (%) phải nằm trong khoảng 0 đến 100.`);
            return;
          }
          totalPercentage += val;
        } else if (comp.unit === 'ppm') {
          if (val < 0) {
            message.error(`Giá trị của ${comp.name} (ppm) không được âm.`);
            return;
          }
        } else if (comp.unit === 'CFU/g') {
          if (val <= 0) {
            message.error(`Giá trị của ${comp.name} (CFU/g) phải lớn hơn 0.`);
            return;
          }
        }
      }

      if (totalPercentage > 100) {
        message.error('Tổng các thành phần có đơn vị (%) không được vượt quá 100%.');
        return;
      }



      setLoading(true)

      const body = {
        name: values.name?.trim(),
        usageUnit: values.usageUnit,
        supplier: values.supplier?.trim() || '',
        materialId: isEdit ? (editingItem.materialId || null) : null,
        unit: values.unit,
        inventoryQuantity: values.inventoryQuantity ?? 0,
        inventoryUnit: values.inventoryUnit || values.unit || '',
        description: values.description?.trim() || '',
        minimumStock: values.minimumStock ?? 0,
        type: values.type ?? '',
        manufacturer: values.manufacturer?.trim() || '',
        compositions: components
          .filter((c) => {
            if (!c.name?.trim()) return false;
            if (c.unit === 'CFU/g') return c.base != null && c.base !== '' && c.exponent != null && c.exponent !== '';
            return c.value != null && c.value !== '';
          })
          .map((c) => {
            let finalValue;
            if (c.unit === 'CFU/g') {
              finalValue = Number(c.base) * Math.pow(10, Number(c.exponent));
            } else {
              const numericValue = Number(c.value);
              finalValue = Number.isNaN(numericValue) ? 0 : numericValue;
            }
            const comp = {
              name: c.name,
              value: finalValue.toString(),
              unit: c.unit,
            }
            if (isEdit && c.id) comp.id = c.id;
            return comp;
          }),
        dosages: dosages
          .filter((d) => d.amount !== '' && d.amount != null)
          .map((d) => {
            const dos = {
              amount: d.amount.toString(),
              unit: quantityUnit,
              areaUnit: MEASUREMENT_UNITS.SQUARE_METER,
              target: Array.isArray(d.target) ? d.target.join(', ') : (d.target || '')
            }
            if (isEdit && d.id) dos.id = d.id;
            return dos;
          }),
      }

      let res
      if (isEdit) {
        res = await FertilizerService.updateFertilizer(editingItem.id, body)
      } else {
        res = await FertilizerService.createFertilizer(body)
      }

      if (res?.success === false) return

      navigate(ROUTER.FM_FERTILIZERS)
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
    setComponents([...components, { name: '', value: '', unit: '%' }])

  const handleRemoveComponent = (index) => {
    // Không cho xóa 3 thành phần mặc định (N, P₂O₅, K₂O)
    if (index < DEFAULT_NPK_OPTION) return
    setComponents(components.filter((_, i) => i !== index))
  }

  // ── Dosage row handlers ────────────────────────────────────────────────────
  const handleDosageChange = (index, field, value) => {
    const updated = [...dosages]
    updated[index] = { ...updated[index], [field]: value }
    setDosages(updated)
  }

  const handleAddDosage = () =>
    setDosages([
      ...dosages,
      {
        ...DEFAULT_DOSAGE,
        unit: quantityUnit,
        areaUnit: MEASUREMENT_UNITS.SQUARE_METER,
      },
    ])

  const handleRemoveDosage = (index) =>
    setDosages(dosages.filter((_, i) => i !== index))

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
    >
      {/* ════════════════════════════════════════════════════════════════
            Section 1 – Thông Tin Cơ Bản
        ═══════════════════════════════════════════════════════════════════ */}
      <SectionTitle>Thông Tin Cơ Bản</SectionTitle>

      <Row gutter={16}>
        {/* Removed Mã phân bón */}

        {/* Tên phân bón */}
        <Col xs={24} md={12}>
          <Form.Item
            name="name"
            label={
              <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                Tên phân bón
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
        <Col xs={24} sm={6}>
          <Form.Item
            name="minimumStock"
            label={
              <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                Tồn Kho tối thiểu
              </span>
            }
            rules={[
              { required: true, message: 'Vui lòng nhập tồn kho tối thiểu.' },
              { type: 'number', min: 0, message: 'Số lượng phải >= 0.' }
            ]}
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

        {/* Đơn Vị tính — chỉ chọn khi tạo mới, sau đó cố định theo vật tư */}
        <Col xs={24} sm={6}>
          {isEdit ? (
            <>
              <Form.Item name="unit" hidden><Input /></Form.Item>
              <Form.Item label="Đơn vị tính">
                <Text className="inline-flex h-10 items-center rounded-lg bg-gray-50 px-3 font-semibold text-gray-700">
                  {quantityUnit}
                </Text>
              </Form.Item>
            </>
          ) : (
            <Form.Item
              name="unit"
              label="Đơn vị tính"
              rules={[{ required: true, message: 'Vui lòng chọn đơn vị tính.' }]}
            >
              <Select
                placeholder="Chọn đơn vị"
                className="h-10"
                options={UNIT_OPTIONS}
                onChange={(value) => {
                  setQuantityUnit(value)
                  form.setFieldValue('usageUnit', value)
                  form.setFieldValue('inventoryUnit', value)
                  setDosages(current => current.map(d => ({
                    ...d,
                    unit: value,
                    areaUnit: MEASUREMENT_UNITS.SQUARE_METER,
                  })))
                }}
              />
            </Form.Item>
          )}
        </Col>

        {/* Loại Phân Bón */}
        <Col xs={24} sm={8}>
          <Form.Item
            name="type"
            label={
              <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                Loại Phân Bón
              </span>
            }
            getValueFromEvent={(val) => val ?? ''}
          >
            <Select
              allowClear
              placeholder="Loại Phân Bón"
              className="h-10"
              options={FERTILIZER_TYPE_OPTIONS}
            />
          </Form.Item>
        </Col>

        {/* UsageUnit luôn đồng nhất với Unit, không cho chọn riêng */}
        <Col xs={24} sm={8}>
          <Form.Item name="usageUnit" hidden><Input /></Form.Item>
          <Form.Item label="Đơn vị sử dụng">
            <Text className="inline-flex h-10 items-center rounded-lg bg-gray-50 px-3 font-semibold text-gray-700">
              {quantityUnit}
            </Text>
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

      <Row gutter={8} className="mb-2 px-1">
        <Col flex="1 1 140px">
          <Text type="secondary" className="text-xs font-semibold">Tên thành phần</Text>
        </Col>
        <Col flex="1 1 100px">
          <Text type="secondary" className="text-xs font-semibold">Giá trị <span className="text-red-500">*</span></Text>
        </Col>
        <Col flex="1 1 120px">
          <Text type="secondary" className="text-xs font-semibold">Đơn Vị Tính <span className="text-red-500">*</span></Text>
        </Col>
        <Col flex="none" style={{ width: 36 }} />
      </Row>

      <div className="space-y-2 mb-3">
        {components.map((comp, index) => {
          // 3 thành phần đầu (N, P₂O₅, K₂O) là cố định: không xóa, không sửa tên
          const isFixed = index < DEFAULT_NPK_OPTION

          return (
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
                  disabled={isFixed}
                />
              </div>
              <div style={{ flex: '1 1 100px' }}>
                {comp.unit === 'CFU/g' ? (
                  <div className="flex items-center gap-1 w-full bg-white border border-gray-300 rounded-lg overflow-hidden focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500 h-9 px-1">
                    <Input
                      type="number"
                      min={0}
                      step={0.1}
                      value={comp.base}
                      onChange={(e) => handleComponentChange(index, 'base', e.target.value)}
                      placeholder="Cơ số"
                      className="border-none shadow-none p-1 text-center bg-transparent h-full min-w-[30px]"
                      style={{ flex: 1, boxShadow: 'none' }}
                    />
                    <span className="text-gray-500 font-semibold select-none whitespace-nowrap text-xs">
                      x 10<sup className="ml-0.5 mt-1 text-[10px]">^</sup>
                    </span>
                    <Input
                      type="number"
                      min={0}
                      value={comp.exponent}
                      onChange={(e) => handleComponentChange(index, 'exponent', e.target.value)}
                      placeholder="Mũ"
                      className="border-none shadow-none p-1 text-center bg-transparent h-full min-w-[30px]"
                      style={{ flex: 1, boxShadow: 'none' }}
                    />
                  </div>
                ) : (
                  <InputNumber
                    value={comp.value}
                    onChange={(val) => handleComponentChange(index, 'value', val)}
                    placeholder="0.0"
                    min={0}
                    step={0.1}
                    className="w-full h-9 rounded-lg"
                  />
                )}
              </div>
              <div style={{ flex: '1 1 120px' }}>
                <Text className="inline-flex h-9 w-full items-center rounded-lg bg-white px-3 text-gray-700">
                  {comp.unit || '%'}
                </Text>
              </div>
              {isFixed ? (
                // Giữ khoảng trống cho alignment nhưng không hiện nút xóa
                <div className="!h-9 !w-9 shrink-0" />
              ) : (
                <Button
                  type="text"
                  danger
                  icon={<MinusCircleOutlined />}
                  onClick={() => handleRemoveComponent(index)}
                  className="!h-9 !w-9 shrink-0 rounded-lg"
                />
              )}
            </div>
          )
        })}
      </div>

      <Button
        type="dashed"
        icon={<PlusOutlined />}
        onClick={handleAddComponent}
        className="w-full mb-5 rounded-lg border-green-400 text-green-700 hover:border-green-500"
      >
        Thêm Thành Phần
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
            {/* Lượng (amount) */}
            <div style={{ flex: '0 0 80px' }}>
              <Text type="secondary" className="block mb-1 text-xs">Lượng </Text>
              <InputNumber
                value={dosage.amount}
                onChange={(val) => handleDosageChange(index, 'amount', val)}
                placeholder="0"
                min={0}
                className="w-full h-9 rounded-lg"
              />
            </div>
            {/* Đơn vị Tính */}
            <div style={{ flex: '1 1 100px' }}>
              <Text type="secondary" className="block mb-1 text-xs">Đơn vị Tính (Kg/ Lit) </Text>
              <Text className="inline-flex h-9 w-full items-center rounded-lg bg-white px-3 text-gray-700">
                {quantityUnit}
              </Text>
            </div>
            {/* Đơn Vị diện tích */}
            <div style={{ flex: '1 1 100px' }}>
              <Text type="secondary" className="block mb-1 text-xs">Đơn Vị diện tích </Text>
              <Text className="inline-flex h-9 w-full items-center rounded-lg bg-white px-3 text-gray-700">
                {MEASUREMENT_UNITS.SQUARE_METER}
              </Text>
            </div>
            {/* Đối tượng */}
            <div style={{ flex: '2 1 140px' }}>
              <Text type="secondary" className="block mb-1 text-xs">Đối tượng </Text>
              <Select
                value={dosage.target || undefined}
                onChange={(val) => handleDosageChange(index, 'target', val)}
                placeholder="Chọn đối tượng..."
                options={cropOptions}
                loading={isCropsLoading}
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
        Thêm Liều Lượng
      </Button>

      {/* ── Footer actions ── */}
      <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-gray-100">
        <Button
          onClick={() => navigate(ROUTER.FM_FERTILIZERS)}
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
  )
}

export default FertilizerFormFields
