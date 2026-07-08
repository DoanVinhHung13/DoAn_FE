/**
 * ProductionPlanCreate — Tạo Kế hoạch Sản xuất (Màn 7)
 * Route: /farm-manager/production-plans/create  (ROUTER.FM_PRODUCTION_PLAN_CREATE)
 *
 * Architecture mirrors FertilizerCreate:
 *   - Button "Quay lại" + TitleCustom header
 *   - Cards with SectionTitle dividers
 *   - Form with footer actions
 */
import {
  ArrowLeftOutlined,
  BookOutlined,
  CalendarOutlined,
  EditOutlined,
  MinusCircleOutlined,
  PlusOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  message,
  Modal,
  Row,
  Select,
  Skeleton,
  Spin,
  Typography,
} from 'antd'
import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import TitleCustom from 'src/components/TitleCustom'
import ROUTER from 'src/router/ROUTER'
import ProductionPlanService from 'src/services/ProductionPlanService'
import PlanTemplateService from 'src/services/PlanTemplateService'
import CropService from 'src/services/CropService'
import CropManagementService from 'src/services/CropManagementService'
import LandPlotService from 'src/services/LandPlotService'

const normalizeResponse = (response) => {
  const payload = response?.data ?? response ?? {};
  const data = payload?.data ?? payload;
  return Array.isArray(data)
    ? data
    : data?.items || data?.results || data?.crops || data?.cropCatalogs || [];
};

const { Text } = Typography

// ── Section header (Fertilizer-style) ─────────────────────────────────────────
const SectionTitle = ({ children, extra }) => (
  <div
    className="mb-4 px-4 py-2 rounded-lg font-semibold text-green-800 flex items-center justify-between"
    style={{ background: '#f0fdf4', borderLeft: '3px solid #16a34a', fontSize: 14 }}
  >
    <span>{children}</span>
    {extra}
  </div>
)

// ── Stage helpers ─────────────────────────────────────────────────────────────
const createEmptyStage = (order) => ({
  _key: `stage-${Date.now()}-${order}`,
  order,
  title: '',
  description: '',
})

// ── Main Component ────────────────────────────────────────────────────────────
const ProductionPlanCreate = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const templateIdFromQuery = searchParams.get('templateId')
  const [form] = Form.useForm()
  const selectedCatalogId = Form.useWatch('category', form);

  // ── Stages state ──
  const [stages, setStages] = useState([createEmptyStage(1)])
  const [submitting, setSubmitting] = useState(false)
  const [savingTemplate, setSavingTemplate] = useState(false)

  // ── Dropdown options ──
  const [supervisorOptions, setSupervisorOptions] = useState([])

  const [catalogsData, setCatalogsData] = useState(null);
  const [isCatalogsLoading, setIsCatalogsLoading] = useState(false);
  const [cropsData, setCropsData] = useState(null);
  const [isCropsLoading, setIsCropsLoading] = useState(false);
  const [landsData, setLandsData] = useState(null);
  const [isLandsLoading, setIsLandsLoading] = useState(false);

  // ── Template modal ──
  const [templateModal, setTemplateModal] = useState(false)
  const [templates, setTemplates] = useState([])
  const [templatesLoading, setTemplatesLoading] = useState(false)

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

  React.useEffect(() => {
    let isMounted = true;
    const fetchLands = async () => {
      setIsLandsLoading(true);
      try {
        const response = await LandPlotService.getLandPlots({ PageIndex: 1, PageSize: 1000, Status: 'Active' });
        if (isMounted) setLandsData(normalizeResponse(response));
      } catch (error) {
        console.error(error);
      } finally {
        if (isMounted) setIsLandsLoading(false);
      }
    };
    if (!landsData) fetchLands();
    return () => { isMounted = false; };
  }, [landsData]);

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

  const areaOptions = React.useMemo(() => {
    if (!landsData) return [];
    return landsData.map((c) => ({
      value: c.id || c.landPlotId,
      label: c.name,
    }));
  }, [landsData]);

  // ── Load template if templateId from query ──
  useEffect(() => {
    if (!templateIdFromQuery) return
    const loadTemplate = async () => {
      try {
        const res = await PlanTemplateService.getById(templateIdFromQuery)
        if (res?.success === false || !res?.data) return
        const t = res.data
        if (t.stages?.length) {
          setStages(
            t.stages.map((s, i) => ({
              _key: `tpl-${Date.now()}-${i}`,
              order: i + 1,
              title: s.title || '',
              description: s.description || '',
            }))
          )
        }
      } catch {
        // silent
      }
    }
    loadTemplate()
  }, [templateIdFromQuery])

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

  // ── Choose from template library ──
  const handleOpenTemplateModal = async () => {
    setTemplateModal(true)
    try {
      setTemplatesLoading(true)
      const res = await PlanTemplateService.getAll({ PageSize: 50 })
      setTemplates(res?.data?.items || [])
    } catch {
      // silent
    } finally {
      setTemplatesLoading(false)
    }
  }

  const handleSelectTemplate = (template) => {
    if (template.stages?.length) {
      setStages(
        template.stages.map((s, i) => ({
          _key: `tpl-${Date.now()}-${i}`,
          order: i + 1,
          title: s.title || '',
          description: s.description || '',
        }))
      )
    }
    setTemplateModal(false)
    message.success(`Đã áp dụng mẫu "${template.name}"`)
  }

  // ── Submit: Tạo Kế hoạch Sản xuất Mới ──
  const handleCreate = async (values) => {
    const body = {
      name: values.name?.trim(),
      area: values.area,
      category: values.category,
      cropVariety: values.cropVariety,
      expectedStartDate: values.expectedStartDate?.format('YYYY-MM-DD'),
      supervisorId: values.supervisorId,
      stages: stages.map((s) => ({
        order: s.order,
        title: s.title,
        description: s.description,
      })),
    }

    try {
      setSubmitting(true)
      const res = await ProductionPlanService.create(body)
      if (res?.success === false) return
      message.success('Tạo kế hoạch sản xuất thành công!')
      navigate(ROUTER.FM_PRODUCTION_PLANS)
    } finally {
      setSubmitting(false)
    }
  }

  // ── Submit: Lưu làm Mẫu ──
  const handleSaveAsTemplate = useCallback(async () => {
    const values = form.getFieldsValue()
    if (!values.name?.trim()) {
      message.warning('Vui lòng nhập tên kế hoạch trước.')
      return
    }

    const body = {
      name: `Mẫu từ: ${values.name.trim()}`,
      cropType: values.category,
      description: '',
      stages: stages.map((s) => ({
        order: s.order,
        title: s.title,
        description: s.description,
        materials: [],
      })),
    }

    try {
      setSavingTemplate(true)
      const res = await PlanTemplateService.create(body)
      if (res?.success === false) return
      message.success('Đã lưu làm kế hoạch mẫu!')
    } finally {
      setSavingTemplate(false)
    }
  }, [form, stages])

  return (
    <div className="space-y-6 duration-500 animate-in fade-in slide-in-from-bottom-4">
      {/* ── Header ── */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(ROUTER.FM_PRODUCTION_PLANS)}>
            Quay lại
          </Button>
          <TitleCustom className="!mb-0 flex items-center gap-2">
            <CalendarOutlined className="text-green-600" />
            Tạo Kế hoạch Sản xuất
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
          onFinish={handleCreate}
        >
          {/* ════ Section 1 – Thông Tin Chung ════ */}
          <SectionTitle
            extra={
              <Button
                type="link"
                icon={<BookOutlined />}
                onClick={handleOpenTemplateModal}
                className="text-green-700 text-xs font-semibold p-0 h-auto"
              >
                ✦ Chọn từ thư viện mẫu
              </Button>
            }
          >
            Thông Tin Chung
          </SectionTitle>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="name"
                label={
                  <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                    Tên kế hoạch sản xuất
                  </span>
                }
                rules={[{ required: true, message: 'Vui lòng nhập tên kế hoạch sản xuất.' }]}
              >
                <Input
                  placeholder="VD: Kế hoạch Xuân Hè 2024"
                  className="h-10 rounded-lg"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="area"
                label={
                  <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                    Vùng trồng
                  </span>
                }
              >
                <Select
                  placeholder="Chọn vùng trồng..."
                  options={areaOptions}
                  loading={isLandsLoading}
                  className="h-10"
                  showSearch
                  optionFilterProp="label"
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
              >
                <Select
                  placeholder="Chọn danh mục..."
                  options={categoryOptions}
                  loading={isCatalogsLoading}
                  className="h-10"
                  showSearch
                  optionFilterProp="label"
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
            <Col xs={24} md={12}>
              <Form.Item
                name="expectedStartDate"
                label={
                  <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                    Ngày bắt đầu dự kiến
                  </span>
                }
              >
                <DatePicker
                  placeholder="dd/mm/yyyy"
                  className="w-full h-10 rounded-lg"
                  format="DD/MM/YYYY"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="supervisorId"
                label={
                  <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                    <TeamOutlined /> Người giám sát
                  </span>
                }
              >
                <Select
                  placeholder="Chọn người giám sát..."
                  options={supervisorOptions}
                  className="h-10"
                  showSearch
                  optionFilterProp="label"
                />
              </Form.Item>
            </Col>
          </Row>

          {/* ════ Section 2 – Giai Đoạn Sản Xuất ════ */}
          <SectionTitle>Giai Đoạn Sản Xuất</SectionTitle>

          <div className="space-y-2 mb-3">
            {stages.map((stage, index) => (
              <div
                key={stage._key}
                className="flex flex-col gap-3 rounded-lg bg-gray-50 border border-gray-100 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                      index === 0
                        ? 'bg-green-600 text-white shadow-md shadow-green-200'
                        : 'bg-white border-2 border-gray-200 text-gray-400'
                    }`}
                  >
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
                </div>
                <div>
                  <Text type="secondary" className="block mb-1 text-xs">Mô tả kỹ thuật</Text>
                  <Input.TextArea
                    value={stage.description}
                    onChange={(e) => updateStage(index, 'description', e.target.value)}
                    placeholder="Nhập hướng dẫn kỹ thuật chi tiết..."
                    rows={3}
                    className="rounded-lg text-sm"
                  />
                </div>
              </div>
            ))}
          </div>

          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={addStage}
            className="w-full mb-5 rounded-lg border-green-400 text-green-700 hover:border-green-500"
          >
            Thêm Giai Đoạn
          </Button>

          {/* ── Footer actions ── */}
          <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-gray-100">
            <Button
              onClick={handleSaveAsTemplate}
              loading={savingTemplate}
              className="h-10 px-6 rounded-xl"
              disabled={submitting}
            >
              Lưu làm Mẫu
            </Button>
            <Button
              onClick={() => navigate(ROUTER.FM_PRODUCTION_PLANS)}
              className="h-10 px-6 rounded-xl"
              disabled={submitting}
            >
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              icon={<PlusOutlined />}
              className="h-10 px-6 font-bold bg-green-600 border-0 shadow-lg rounded-xl shadow-green-100"
            >
              Tạo Kế hoạch Mới
            </Button>
          </div>
        </Form>
      </Card>

      {/* ── Modal: Chọn từ thư viện mẫu ── */}
      <Modal
        open={templateModal}
        onCancel={() => setTemplateModal(false)}
        title={<span className="font-bold text-gray-800">Chọn kế hoạch mẫu</span>}
        footer={null}
        width={520}
      >
        {templatesLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spin size="large" />
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <BookOutlined className="text-4xl mb-3" />
            <p className="text-sm">Chưa có kế hoạch mẫu nào.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => handleSelectTemplate(t)}
                className="w-full text-left p-3 rounded-xl border border-gray-200 hover:border-green-300 hover:bg-green-50/50 transition-all cursor-pointer bg-white"
              >
                <div className="font-semibold text-gray-800 text-sm">{t.name}</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {t.stageCount || t.stages?.length || 0} giai đoạn
                  {t.description && ` · ${t.description}`}
                </div>
              </button>
            ))}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default ProductionPlanCreate
