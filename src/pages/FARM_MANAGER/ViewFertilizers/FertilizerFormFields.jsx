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
import { useNavigate } from 'react-router-dom'
import ROUTER from 'src/router/ROUTER'
import FertilizerService from 'src/services/FertilizerService'
import CropManagementService from 'src/services/CropManagementService'

const { Text } = Typography

// ── Options ──────────────────────────────────────────────────────────────────

const FERTILIZER_TYPE_OPTIONS = [
  { value: 'Hữu cơ', label: 'Hữu cơ' },
  { value: 'Hữu cơ khoáng', label: 'Hữu cơ khoáng' },
  { value: 'Hữu cơ sinh học', label: 'Hữu cơ sinh học' },
  { value: 'Hữu cơ vi sinh', label: 'Hữu cơ vi sinh' },
  { value: 'Vi sinh vật', label: 'Vi sinh vật' },
  { value: 'Bón lá', label: 'Bón lá' },
  { value: 'Khác', label: 'Khác' },
]

const UNIT_OPTIONS = [
  { value: 'lít', label: 'lít' },
  { value: 'ml', label: 'ml' },
  { value: 'g', label: 'g' },
  { value: 'mg', label: 'mg' },
  { value: 'kg', label: 'kg' },
]

const COMPONENT_UNIT_OPTIONS = [
  { value: '%', label: '%' },
  { value: 'ppm', label: 'ppm' },
  { value: 'CFU/g', label: 'CFU/g' },
]

const AREA_UNIT_OPTIONS = [
  { value: 'ha', label: 'ha' },
  { value: 'm²', label: 'm²' },
]

const NPK_OPTION = [
  { name: 'N', value: '', unit: '%' },
  { name: 'P₂O₅', value: '', unit: '%' },
  { name: 'K₂O', value: '', unit: '%' },
]

/** Số lượng thành phần mặc định (N, P, K) — không cho xóa, không cho sửa tên */
const DEFAULT_NPK_OPTION = NPK_OPTION.length

const DEFAULT_DOSAGE = { amount: '', unit: 'kg', areaUnit: 'ha', target: '' }

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
const FertilizerFormFields = ({ isEdit, editingItem }) => {
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const [loading, setLoading] = React.useState(false)
  const [components, setComponents] = React.useState(NPK_OPTION)
  const [dosages, setDosages] = React.useState([DEFAULT_DOSAGE])

  const [cropsData, setCropsData] = React.useState(null);
  const [isCropsLoading, setIsCropsLoading] = React.useState(false);

  React.useEffect(() => {
    let isMounted = true;
    const fetchCrops = async () => {
      setIsCropsLoading(true);
      try {
        const response = await CropManagementService.getCrops({ PageIndex: 1, PageSize: 1000 });
        const payload = response?.data ?? response ?? {};
        const data = payload?.data ?? payload;
        const normalizedData = Array.isArray(data)
          ? data
          : data?.items || data?.results || data?.crops || data?.cropCatalogs || [];
        if (isMounted) setCropsData(normalizedData);
      } catch (error) {
        console.error(error);
      } finally {
        if (isMounted) setIsCropsLoading(false);
      }
    };
    if (!cropsData) fetchCrops();
    return () => { isMounted = false; };
  }, [cropsData]);

  const cropOptions = React.useMemo(() => {
    if (!cropsData) return [];
    return cropsData
      .filter((c) => {
        if (typeof c.isActive === 'boolean') return c.isActive;
        const status = String(c.status || '').toLowerCase();
        return !['inactive', 'disabled', 'deleted'].includes(status);
      })
      .map((c) => ({
        value: c.name,
        label: c.name,
      }));
  }, [cropsData]);

  // ── Populate form on open ──────────────────────────────────────────────────
  React.useEffect(() => {
    if (isEdit) {
      form.setFieldsValue({
        code: editingItem.code || '',
        name: editingItem.name || '',
        manufacturer: editingItem.manufacturer || '',
        supplier: editingItem.supplier || '',
        minimumStock: editingItem.minimumStock ?? 0,
        unit: editingItem.unit || undefined,
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
        // Find existing standard components
        const compN = incomingComps.find(c => c.name === 'N');
        const compP = incomingComps.find(c => c.name === 'P₂O₅');
        const compK = incomingComps.find(c => c.name === 'K₂O');

        // Other components
        const others = incomingComps.filter(c => !['N', 'P₂O₅', 'K₂O'].includes(c.name));

        setComponents([
          compN || { name: 'N', value: '', unit: '%' },
          compP || { name: 'P₂O₅', value: '', unit: '%' },
          compK || { name: 'K₂O', value: '', unit: '%' },
          ...others
        ]);
      } else {
        setComponents(NPK_OPTION);
      }
      // Liều lượng
      setDosages(
        editingItem.dosages?.length ? editingItem.dosages : [DEFAULT_DOSAGE],
      )
    } else {
      form.resetFields()
      setComponents(NPK_OPTION)
      setDosages([DEFAULT_DOSAGE])
    }
  }, [editingItem, isEdit, form])

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (values) => {
    try {
      // Custom validations
      const missingNPK = components.slice(0, 3).some(c => c.value == null || c.value === '' || !c.unit);
      if (missingNPK) {
        message.error('Thành phần N, P₂O₅, K₂O bắt buộc phải có Giá trị và Đơn vị.');
        return;
      }

      if (!dosages || dosages.length === 0) {
        message.error('Phải có ít nhất 1 Liều lượng.');
        return;
      }

      const missingDosageFields = dosages.some(d => d.amount == null || d.amount === '' || !d.unit || !d.areaUnit || !d.target);
      if (missingDosageFields) {
        message.error('Các Liều lượng phải nhập đầy đủ 4 trường: Lượng, Đơn vị Tính, Đơn vị diện tích và Đối tượng.');
        return;
      }

      setLoading(true)

      const body = {
        name: values.name?.trim(),
        code: values.code?.trim(),
        supplier: values.supplier?.trim() || '',
        materialId: isEdit ? (editingItem.materialId || null) : null,
        unit: values.unit,
        description: values.description?.trim() || '',
        minimumStock: values.minimumStock ?? 0,
        type: values.type ?? '',
        manufacturer: values.manufacturer?.trim() || '',
        compositions: components
          .filter((c) => c.name?.trim())
          .map((c) => {
            const comp = {
              name: c.name,
              value: c.value ?? 0,
              unit: c.unit,
            }
            if (isEdit && c.id) comp.id = c.id;
            return comp;
          }),
        dosages: dosages
          .filter((d) => d.amount !== '' && d.amount != null)
          .map((d) => {
            const dos = {
              amount: d.amount,
              unit: d.unit,
              areaUnit: d.areaUnit,
            }
            if (isEdit && d.id) dos.id = d.id;
            // Swagger PUT DTO does not have target, omitting it on update to prevent 400 Bad Request
            if (!isEdit) dos.target = Array.isArray(d.target) ? d.target.join(', ') : (d.target || '');
            return dos;
          }),
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

      navigate(ROUTER.FM_VIEW_FERTILIZERS)
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

  const handleAddDosage = () => setDosages([...dosages, { ...DEFAULT_DOSAGE }])

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
        {/* Mã phân bón */}
        <Col xs={24} md={12}>
          <Form.Item
            name="code"
            label={
              <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                Mã phân bón
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
        <Col xs={24} sm={8}>
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

        {/* Đơn Vị tính */}
        <Col xs={24} sm={8}>
          <Form.Item
            name="unit"
            label={
              <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                Đơn vị tính
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
                <InputNumber
                  value={comp.value}
                  onChange={(val) => handleComponentChange(index, 'value', val)}
                  placeholder="0.0"
                  min={0}
                  step={0.1}
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
              <Select
                value={dosage.unit}
                onChange={(val) => handleDosageChange(index, 'unit', val)}
                options={UNIT_OPTIONS}
                className="w-full h-9"
              />
            </div>
            {/* Đơn Vị diện tích */}
            <div style={{ flex: '1 1 100px' }}>
              <Text type="secondary" className="block mb-1 text-xs">Đơn Vị diện tích </Text>
              <Select
                value={dosage.areaUnit}
                onChange={(val) => handleDosageChange(index, 'areaUnit', val)}
                options={AREA_UNIT_OPTIONS}
                className="w-full h-9"
              />
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
          onClick={() => navigate(ROUTER.FM_VIEW_FERTILIZERS)}
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
