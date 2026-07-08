/**
 * PlanTemplateCreate — Tạo Kế hoạch mẫu mới (Màn 6)
 * Route: /farm-manager/plan-templates/create  (ROUTER.FM_PLAN_TEMPLATE_CREATE)
 *
 * Architecture mirrors FertilizerCreate:
 *   - Button "Quay lại" + TitleCustom header
 *   - Single Card with SectionTitle dividers
 *   - Form with footer actions (Hủy + Lưu)
 */
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  EditOutlined,
  HolderOutlined,
  MinusCircleOutlined,
  PlusOutlined,
  ProfileOutlined,
  ShoppingOutlined,
} from '@ant-design/icons'
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  message,
  Row,
  Select,
  Tag,
  Typography,
} from 'antd'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import TitleCustom from 'src/components/TitleCustom'
import ROUTER from 'src/router/ROUTER'
import PlanTemplateService from 'src/services/PlanTemplateService'
import CropService from 'src/services/CropService'
import CropManagementService from 'src/services/CropManagementService'

const normalizeResponse = (response) => {
  const payload = response?.data ?? response ?? {};
  const data = payload?.data ?? payload;
  return Array.isArray(data)
    ? data
    : data?.items || data?.results || data?.crops || data?.cropCatalogs || [];
};

const { Text } = Typography

// ── Section header (Fertilizer-style) ─────────────────────────────────────────
const SectionTitle = ({ children }) => (
  <div
    className="mb-4 px-4 py-2 rounded-lg font-semibold text-green-800"
    style={{ background: '#f0fdf4', borderLeft: '3px solid #16a34a', fontSize: 14 }}
  >
    {children}
  </div>
)

// ── Stage helpers ─────────────────────────────────────────────────────────────
const createEmptyStage = (order) => ({
  _key: `stage-${Date.now()}-${order}`,
  order,
  title: '',
  description: '',
  materials: [],
  _materialInput: '',
})

// ── Main Component ────────────────────────────────────────────────────────────
const PlanTemplateCreate = () => {
  const navigate = useNavigate()
  const [form] = Form.useForm()

  // ── Stages state ──
  const [stages, setStages] = useState([createEmptyStage(1)])
  const [loading, setLoading] = useState(false)

  // ── Dropdown options ──
  const [catalogsData, setCatalogsData] = useState(null);
  const [isCatalogsLoading, setIsCatalogsLoading] = useState(false);
  const [cropsData, setCropsData] = useState(null);
  const [isCropsLoading, setIsCropsLoading] = useState(false);

  const selectedCatalogId = Form.useWatch('category', form);

  React.useEffect(() => {
    let isMounted = true;
    const fetchCatalogs = async () => {
      setIsCatalogsLoading(true);
      try {
        const response = await CropService.getCrops({ PageIndex: 1, PageSize: 100, Status: true });
        if (isMounted) setCatalogsData(normalizeResponse(response));
      } catch (error) {
        console.error(error);
      } finally {
        if (isMounted) setIsCatalogsLoading(false);
      }
    };
    if (!catalogsData) fetchCatalogs();
    return () => { isMounted = false; };
  }, [catalogsData]);

  React.useEffect(() => {
    let isMounted = true;
    const fetchCrops = async () => {
      setIsCropsLoading(true);
      try {
        const response = await CropManagementService.getCrops({ PageIndex: 1, PageSize: 1000, Status: true });
        if (isMounted) setCropsData(normalizeResponse(response));
      } catch (error) {
        console.error(error);
      } finally {
        if (isMounted) setIsCropsLoading(false);
      }
    };
    if (!cropsData) fetchCrops();
    return () => { isMounted = false; };
  }, [cropsData]);

  const categoryOptions = React.useMemo(() => {
    if (!catalogsData) return [];
    return catalogsData
      .filter((c) => {
        if (typeof c.isActive === 'boolean') return c.isActive;
        const status = String(c.status || '').toLowerCase();
        return !['inactive', 'disabled', 'deleted'].includes(status);
      })
      .map((c) => ({
        value: c.id || c._id || c.cropCatalogId,
        label: c.name,
      }));
  }, [catalogsData]);

  const cropVarietyOptions = React.useMemo(() => {
    if (!cropsData) return [];
    let filtered = cropsData.filter((c) => {
      if (typeof c.isActive === 'boolean') return c.isActive;
      const status = String(c.status || '').toLowerCase();
      return !['inactive', 'disabled', 'deleted'].includes(status);
    });

    if (selectedCatalogId) {
      filtered = filtered.filter((c) => (c.cropCatalogId || c.categoryId) === selectedCatalogId);
    }
    return filtered.map((c) => ({
      value: c.id || c._id || c.cropId,
      label: c.name,
    }));
  }, [cropsData, selectedCatalogId]);

  // ── Stage handlers ──
  const addStage = () => {
    setStages((prev) => [...prev, createEmptyStage(prev.length + 1)])
  }

  const removeStage = (index) => {
    if (stages.length <= 1) return
    setStages((prev) => {
      const next = prev.filter((_, i) => i !== index)
      return next.map((s, i) => ({ ...s, order: i + 1 }))
    })
  }

  const updateStage = (index, field, value) => {
    setStages((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    )
  }

  const addMaterial = (index) => {
    setStages((prev) =>
      prev.map((s, i) => {
        if (i !== index || !s._materialInput.trim()) return s
        return {
          ...s,
          materials: [...s.materials, s._materialInput.trim()],
          _materialInput: '',
        }
      })
    )
  }

  const removeMaterial = (stageIndex, matIndex) => {
    setStages((prev) =>
      prev.map((s, i) => {
        if (i !== stageIndex) return s
        return { ...s, materials: s.materials.filter((_, mi) => mi !== matIndex) }
      })
    )
  }

  // ── Submit ──
  const handleSubmit = async (values) => {
    const body = {
      name: values.name?.trim(),
      category: values.category,
      cropType: values.category, // Keep for backward compatibility just in case
      cropVariety: values.cropVariety,
      description: values.description?.trim() || '',
      stages: stages.map((s) => ({
        order: s.order,
        title: s.title,
        description: s.description,
        materials: s.materials,
      })),
    }

    try {
      setLoading(true)
      const res = await PlanTemplateService.create(body)
      if (res?.success === false) return
      navigate(ROUTER.FM_PLAN_TEMPLATES)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 duration-500 animate-in fade-in slide-in-from-bottom-4">
      {/* ── Header ── */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(ROUTER.FM_PLAN_TEMPLATES)}>
            Quay lại
          </Button>
          <TitleCustom className="!mb-0 flex items-center gap-2">
            <ProfileOutlined className="text-green-600" />
            Tạo Kế hoạch mẫu mới
          </TitleCustom>
        </div>
      </div>

      {/* ── Main Card ── */}
      <Card
        bordered={false}
        className="shadow-sm rounded-2xl"
        bodyStyle={{ padding: '24px' }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          {/* ════ Section 1 – Thông Tin Cơ Bản ════ */}
          <SectionTitle>Thông Tin Cơ Bản</SectionTitle>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="name"
                label={
                  <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                    Tên Kế hoạch mẫu
                  </span>
                }
                rules={[
                  { required: true, message: 'Vui lòng nhập tên kế hoạch mẫu.' },
                  { max: 200, message: 'Tối đa 200 ký tự.' },
                ]}
              >
                <Input
                  placeholder="VD: Quy trình trồng Dưa Lưới VietGAP"
                  className="h-10 rounded-lg"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="category"
                label={
                  <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                    Danh mục cây trồng
                  </span>
                }
                rules={[{ required: true, message: 'Vui lòng chọn danh mục cây trồng.' }]}
              >
                <Select
                  placeholder="Chọn danh mục cây trồng"
                  options={categoryOptions}
                  loading={isCatalogsLoading}
                  className="h-10"
                  showSearch
                  optionFilterProp="label"
                  onChange={() => form.setFieldsValue({ cropVariety: undefined })}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="cropVariety"
                label={
                  <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                    Giống cây trồng
                  </span>
                }
              >
                <Select
                  placeholder="Chọn giống cây trồng..."
                  options={cropVarietyOptions}
                  loading={isCropsLoading}
                  className="h-10"
                  showSearch
                  optionFilterProp="label"
                />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item
                name="description"
                label={
                  <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                    Mô tả tóm tắt
                  </span>
                }
              >
                <Input.TextArea
                  rows={3}
                  placeholder="Mô tả ngắn gọn mục tiêu của quy trình này..."
                  className="rounded-lg"
                  maxLength={1000}
                  showCount
                />
              </Form.Item>
            </Col>
          </Row>

          {/* ════ Section 2 – Quy Trình Kỹ Thuật ════ */}
          <SectionTitle>Quy Trình Kỹ Thuật (Các Giai Đoạn)</SectionTitle>

          <div className="space-y-2 mb-3">
            {stages.map((stage, index) => (
              <div
                key={stage._key}
                className="flex flex-col gap-3 rounded-lg bg-gray-50 border border-gray-100 px-4 py-3"
              >
                {/* Row 1: Số thứ tự + Tên + Actions */}
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-600 text-white text-sm font-bold">
                    {index + 1}
                  </div>
                  <Input
                    value={stage.title}
                    onChange={(e) => updateStage(index, 'title', e.target.value)}
                    placeholder={`Tên giai đoạn ${index + 1}`}
                    className="flex-1 h-9 rounded-lg font-semibold"
                  />
                  {stages.length > 1 && (
                    <Button
                      type="text"
                      danger
                      icon={<MinusCircleOutlined />}
                      onClick={() => removeStage(index)}
                      className="!h-9 !w-9 shrink-0 rounded-lg"
                    />
                  )}
                  <Button
                    type="text"
                    icon={<HolderOutlined className="text-gray-300" />}
                    className="!h-9 !w-9 shrink-0 rounded-lg cursor-grab"
                  />
                </div>

                {/* Row 2: Mô tả */}
                <div>
                  <Text type="secondary" className="block mb-1 text-xs">Mô tả</Text>
                  <Input.TextArea
                    value={stage.description}
                    onChange={(e) => updateStage(index, 'description', e.target.value)}
                    placeholder="1. Bước đầu tiên&#10;2. Bước thứ hai&#10;3. Bước thứ ba"
                    rows={3}
                    className="rounded-lg text-sm"
                  />
                </div>

                {/* Row 3: Vật tư dự kiến */}
                {/* <div>
                  <Text type="secondary" className="flex items-center gap-1 mb-1 text-xs">
                    <ShoppingOutlined /> Vật tư dự kiến (Tùy chọn)
                  </Text>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {stage.materials.map((mat, mi) => (
                      <Tag
                        key={mi}
                        closable
                        onClose={() => removeMaterial(index, mi)}
                        className="rounded-full px-2.5 py-0.5 text-xs bg-green-50 border-green-200 text-green-700"
                      >
                        {mat}
                      </Tag>
                    ))}
                  </div>
                  <Input
                    value={stage._materialInput}
                    onChange={(e) => updateStage(index, '_materialInput', e.target.value)}
                    onPressEnter={() => addMaterial(index)}
                    placeholder="Thêm vật tư... (Enter để thêm)"
                    className="h-8 rounded-lg text-sm"
                    suffix={
                      <Button
                        type="text"
                        size="small"
                        icon={<PlusOutlined className="text-xs" />}
                        onClick={() => addMaterial(index)}
                        className="text-green-600"
                      />
                    }
                  />
                </div> */}
              </div>
            ))}
          </div>

          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={addStage}
            className="w-full mb-5 rounded-lg border-green-400 text-green-700 hover:border-green-500"
          >
            Thêm Giai đoạn
          </Button>

          {/* ── Footer actions ── */}
          <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-gray-100">
            <Button
              onClick={() => navigate(ROUTER.FM_PLAN_TEMPLATES)}
              className="h-10 px-6 rounded-xl"
              disabled={loading}
            >
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<PlusOutlined />}
              className="h-10 px-6 font-bold bg-green-600 border-0 shadow-lg rounded-xl shadow-green-100"
            >
              Lưu Kế Hoạch
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  )
}

export default PlanTemplateCreate
