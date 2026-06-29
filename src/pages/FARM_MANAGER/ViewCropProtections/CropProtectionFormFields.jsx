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
import CropProtectionService from 'src/services/CropProtectionService'
import CropManagementService from 'src/services/CropManagementService'
import { useSystemKey } from 'src/hooks/useSystemKey'
import { SYSTEM_KEY } from 'src/constants/systemKey'


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

  const { getCombo } = useSystemKey()
  const UNIT_OPTIONS = getCombo(SYSTEM_KEY.FERTILIZER_UNIT).map(opt => ({
    value: opt.codeValue || opt.value,
    label: opt.label || opt.description,
  }))
  const AREA_UNIT_OPTIONS = getCombo(SYSTEM_KEY.AREA_UNIT).map(opt => ({
    value: opt.codeValue || opt.value,
    label: opt.label || opt.description,
  }))

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
        value: c.id,
        label: c.name,
      }));
  }, [cropsData]);

  React.useEffect(() => {
    if (isEdit) {
      form.setFieldsValue({
        code: editingItem.code || '',
        name: editingItem.name || '',
        manufacturer: editingItem.manufacturer || '',
        supplier: editingItem.supplier || '',
        minimumStock: editingItem.minInventory ?? editingItem.minimumStock ?? 0,
        unit: editingItem.unitId || editingItem.unit || undefined,
        description: editingItem.description || '',
        usages: editingItem.usages && editingItem.usages.length > 0
          ? editingItem.usages.map(u => {
            const conc = u.concentration || u.dilutionRatio || '';
            const concUnit = u.concentrationUnitId || u.dilutionUnit || '';
            const parts = conc.split(':')
            const unitParts = concUnit.split(':')
            return {
              ...u,
              targetCrop: typeof u.targetCrop === 'string' ? u.targetCrop.split(',').map(s => s.trim()).filter(Boolean) : u.targetCrop,
              chemicalRatio: parts[0] ? Number(parts[0]) : null,
              waterRatio: parts[1] ? Number(parts[1]) : null,
              chemicalUnit: unitParts[0] || undefined,
              waterUnit: unitParts[1] || undefined,
              dosage: u.dosage,
              dosageUnit: u.dosageUnitId || u.dosageUnit,
              area: u.area,
              areaUnit: u.areaUnitId || u.areaUnit,
              isolationDays: u.quarantineDays ?? u.isolationDays,
            }
          })
          : [{}],
      })
    } else {
      form.resetFields()
      form.setFieldsValue({
        usages: [{}],
      })
    }
  }, [editingItem, isEdit, form])

  const handleSubmit = async (values) => {
    try {
      setLoading(true)

      const body = {
        name: values.name?.trim(),
        code: values.code?.trim(),
        manufacturer: values.manufacturer?.trim() || '',
        supplier: values.supplier?.trim() || '',
        minInventory: values.minimumStock || 0,
        unitId: values.unit || '',
        description: values.description?.trim() || '',
        isActive: isEdit ? editingItem.isActive : true,
        usages: (values.usages || []).map(u => {
          let dilution = null;
          if (u.chemicalRatio != null && u.waterRatio != null) {
            dilution = `${u.chemicalRatio}:${u.waterRatio}`
          }

          let dilUnit = null;
          if (u.chemicalUnit || u.waterUnit) {
            dilUnit = `${u.chemicalUnit || ''}:${u.waterUnit || ''}`
          }

          const usageObj = {
            targetCrop: Array.isArray(u.targetCrop) ? u.targetCrop.join(', ') : (u.targetCrop || ''),
            targetPest: u.targetPest || '',
            concentration: dilution || '',
            concentrationUnitId: dilUnit || '',
            dosage: u.dosage || 0,
            dosageUnitId: u.dosageUnit || '',
            area: u.area || 0,
            areaUnitId: u.areaUnit || '',
            quarantineDays: u.isolationDays || 0
          }
          if (isEdit && u.id) usageObj.id = u.id;
          return usageObj;
        }),
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
            label={<span className="font-semibold text-gray-700">Mã Thuốc bảo vệ thực vật </span>}
            rules={[{ required: true, message: 'Bắt buộc' }]}
          >
            <Input placeholder="Nhập mã..." className="h-10 rounded-xl" disabled={isEdit} />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            name="name"
            label={<span className="font-semibold text-gray-700">Tên Thuốc bảo vệ thực vật </span>}
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
            name="supplier"
            label={<span className="font-semibold text-gray-700">Nhà Cung Cấp</span>}
          >
            <Input placeholder="Nhập nhà cung cấp..." className="h-10 rounded-xl" />
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
                      <Form.Item
                        {...restField}
                        name={[name, 'targetCrop']}
                        label={<>Đối tượng SD </>}
                        className="mb-3"
                        rules={[{ required: true, message: 'Vui lòng chọn' }]}
                      >
                        <Select
                          mode="multiple"
                          options={cropOptions}
                          loading={isCropsLoading}
                          placeholder="Chọn cây trồng..."
                          className="w-full text-sm min-h-[36px]"
                          allowClear
                          showSearch
                          optionFilterProp="label"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                      <Form.Item
                        {...restField}
                        name={[name, 'targetPest']}
                        label={<>Đối tượng DT </>}
                        className="mb-3"
                        rules={[{ required: true, message: 'Vui lòng nhập' }]}
                      >
                        <Input placeholder="Rầy nâu..." className="rounded-lg h-9 text-sm" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={24} md={12}>
                      <Form.Item
                        label={<>Nồng độ pha loãng </>}
                        className="mb-3"
                        required
                      >
                        <div className="flex items-center gap-3">
                          {/* Thuốc */}
                          <div className="flex items-center gap-2 flex-1">
                            <Form.Item
                              {...restField}
                              name={[name, 'chemicalRatio']}
                              className="mb-0 flex-1"
                              rules={[{ required: true, message: 'Nhập số' }]}
                            >
                              <InputNumber min={0} placeholder="Số" className="w-full h-9 rounded-lg text-sm" />
                            </Form.Item>
                            <Form.Item
                              {...restField}
                              name={[name, 'chemicalUnit']}
                              className="mb-0 w-[90px]"
                              rules={[{ required: true, message: 'Chọn ĐV' }]}
                            >
                              <Select options={UNIT_OPTIONS} placeholder="Đơn vị" className="h-9 rounded-lg text-sm" allowClear />
                            </Form.Item>
                          </div>

                          {/* Dấu hai chấm */}
                          <span className="font-bold text-gray-400 text-lg leading-none pb-1">:</span>

                          {/* Nước */}
                          <div className="flex items-center gap-2 flex-1">
                            <Form.Item
                              {...restField}
                              name={[name, 'waterRatio']}
                              className="mb-0 flex-1"
                              rules={[{ required: true, message: 'Nhập số' }]}
                            >
                              <InputNumber min={0} placeholder="Số" className="w-full h-9 rounded-lg text-sm" />
                            </Form.Item>
                            <Form.Item
                              {...restField}
                              name={[name, 'waterUnit']}
                              className="mb-0 w-[90px]"
                              rules={[{ required: true, message: 'Chọn ĐV' }]}
                            >
                              <Select options={UNIT_OPTIONS} placeholder="ĐV" className="h-9 rounded-lg text-sm" allowClear />
                            </Form.Item>
                          </div>
                        </div>
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                      <Form.Item
                        {...restField}
                        name={[name, 'dosage']}
                        label={<>Liều lượng (Số) </>}
                        className="mb-0"
                        rules={[{ required: true, message: 'Vui lòng nhập' }]}
                      >
                        <InputNumber min={0} placeholder="Số" className="w-full h-9 rounded-lg text-sm" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                      <Form.Item
                        {...restField}
                        name={[name, 'dosageUnit']}
                        label={<>ĐV Tính </>}
                        className="mb-0"
                        rules={[{ required: true, message: 'Vui lòng chọn' }]}
                      >
                        <Select options={UNIT_OPTIONS} placeholder="Chọn" className="h-9 rounded-lg text-sm" allowClear />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                      <Form.Item
                        label={<>Diện tích </>}
                        className="mb-0"
                        required
                      >
                        <div className="flex items-center gap-2">
                          <Form.Item
                            {...restField}
                            name={[name, 'area']}
                            className="mb-0 flex-1"
                            rules={[{ required: true, message: 'Nhập số' }]}
                          >
                            <InputNumber min={0} placeholder="Số" className="w-full h-9 rounded-lg text-sm" />
                          </Form.Item>
                          <Form.Item
                            {...restField}
                            name={[name, 'areaUnit']}
                            className="mb-0 w-[90px]"
                            rules={[{ required: true, message: 'Chọn ĐV' }]}
                          >
                            <Select options={AREA_UNIT_OPTIONS} placeholder="Chọn" className="h-9 rounded-lg text-sm" allowClear />
                          </Form.Item>
                        </div>
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                      <Form.Item
                        {...restField}
                        name={[name, 'isolationDays']}
                        label={<>Cách ly (Ngày) </>}
                        className="mb-0"
                        rules={[{ required: true, message: 'Vui lòng nhập' }]}
                      >
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
