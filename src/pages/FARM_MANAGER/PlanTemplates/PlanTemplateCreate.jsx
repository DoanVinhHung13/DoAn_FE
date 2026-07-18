import {
  ArrowLeftOutlined,
  EditOutlined,
  MinusCircleOutlined,
  PlusOutlined,
  ProfileOutlined,
} from '@ant-design/icons'
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  message,
  Row,
  Select,
  Spin,
  Typography,
} from 'antd'
import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import TitleCustom from 'src/components/TitleCustom'
import ROUTER from 'src/router/ROUTER'
import CropManagementService from 'src/services/CropManagementService'
import CropService from 'src/services/CropService'
import PlanTemplateService from 'src/services/PlanTemplateService'
import ProcessStepService from 'src/services/ProcessStepService'

const { Text } = Typography

const normalizeItems = (response) => {
  const payload = response?.data ?? response ?? {}
  const data = payload?.data ?? payload
  return Array.isArray(data)
    ? data
    : data?.items ||
        data?.results ||
        data?.crops ||
        data?.cropCatalogs ||
        data?.processSteps ||
        []
}

const getEntity = (response) => response?.data ?? response ?? null

const getCreatedId = (response) =>
  response?.data?.id ||
  response?.data?.processTemplateId ||
  response?.id ||
  response?.processTemplateId ||
  null

const createEmptyStep = (order) => ({
  _key: `step-${Date.now()}-${order}`,
  id: null,
  stepName: '',
  stepOrder: order,
  description: '',
  estimatedDay: null,
  requiredMaterialType: '',
  note: '',
})

const SectionTitle = ({ children }) => (
  <div
    className="px-4 py-2 mb-4 text-sm font-semibold text-green-800 rounded-lg"
    style={{ background: '#f0fdf4', borderLeft: '3px solid #16a34a' }}
  >
    {children}
  </div>
)

const PlanTemplateCreate = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)
  const [form] = Form.useForm()
  const selectedCatalogId = Form.useWatch('cropCatalogId', form)

  const [steps, setSteps] = useState([createEmptyStep(1)])
  const [originalSteps, setOriginalSteps] = useState([])
  const [catalogs, setCatalogs] = useState([])
  const [crops, setCrops] = useState([])
  const [loadingOptions, setLoadingOptions] = useState(false)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let mounted = true
    const loadOptions = async () => {
      try {
        setLoadingOptions(true)
        const [catalogResponse, cropResponse] = await Promise.all([
          CropService.getCrops({ PageIndex: 1, PageSize: 1000, Status: true }),
          CropManagementService.getCrops({
            PageIndex: 1,
            PageSize: 1000,
            Status: true,
          }),
        ])
        if (!mounted) return
        setCatalogs(normalizeItems(catalogResponse))
        setCrops(normalizeItems(cropResponse))
      } finally {
        if (mounted) setLoadingOptions(false)
      }
    }
    loadOptions()
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    if (!isEdit) return
    let mounted = true

    const loadDetail = async () => {
      try {
        setLoadingDetail(true)
        const [templateResponse, stepsResponse] = await Promise.all([
          PlanTemplateService.getById(id),
          ProcessStepService.getAll({ PageIndex: 1, PageSize: 1000 }),
        ])
        if (!mounted) return

        const template = getEntity(templateResponse)
        const templateSteps = normalizeItems(stepsResponse)
          .filter(
            (step) =>
              (step.processTemplateId || step.processTemplate?.id) === id
          )
          .sort(
            (first, second) =>
              (first.stepOrder || 0) - (second.stepOrder || 0)
          )

        form.setFieldsValue({
          name: template?.name,
          cropCatalogId:
            template?.cropCatalogId || template?.cropCatalog?.id,
          cropId: template?.cropId || template?.crop?.id,
          description: template?.description || '',
          estimatedDurationDays: template?.estimatedDurationDays,
        })

        const mappedSteps = templateSteps.map((step, index) => ({
          _key: `step-${step.id || index}`,
          id: step.id,
          processTemplateId: step.processTemplateId || id,
          stepName: step.stepName || '',
          stepOrder: step.stepOrder || index + 1,
          description: step.description || '',
          estimatedDay: step.estimatedDay ?? null,
          requiredMaterialType: step.requiredMaterialType || '',
          note: step.note || '',
        }))
        setSteps(mappedSteps.length ? mappedSteps : [createEmptyStep(1)])
        setOriginalSteps(mappedSteps)
      } catch (error) {
        message.error(error.message || 'Không thể tải thông tin mẫu quy trình.')
      } finally {
        if (mounted) setLoadingDetail(false)
      }
    }

    loadDetail()
    return () => {
      mounted = false
    }
  }, [form, id, isEdit])

  const catalogOptions = useMemo(
    () =>
      catalogs
        .filter((item) => item.isActive !== false)
        .map((item) => ({
          value: item.id || item.cropCatalogId,
          label: item.name,
        }))
        .filter((item) => item.value && item.label),
    [catalogs]
  )

  const cropOptions = useMemo(
    () =>
      crops
        .filter(
          (item) =>
            item.isActive !== false &&
            (!selectedCatalogId ||
              (item.cropCatalogId ||
                item.categoryId ||
                item.cropCatalog?.id) === selectedCatalogId)
        )
        .map((item) => ({
          value: item.id || item.cropId,
          label: item.name,
        }))
        .filter((item) => item.value && item.label),
    [crops, selectedCatalogId]
  )

  const updateStep = (index, field, value) => {
    setSteps((current) =>
      current.map((step, stepIndex) =>
        stepIndex === index ? { ...step, [field]: value } : step
      )
    )
  }

  const addStep = () => {
    setSteps((current) => [...current, createEmptyStep(current.length + 1)])
  }

  const removeStep = (index) => {
    setSteps((current) =>
      current
        .filter((_, stepIndex) => stepIndex !== index)
        .map((step, stepIndex) => ({
          ...step,
          stepOrder: stepIndex + 1,
        }))
    )
  }

  const syncSteps = async (processTemplateId, nextSteps) => {
    const nextIds = new Set(nextSteps.map((step) => step.id).filter(Boolean))

    for (const original of originalSteps) {
      if (original.id && !nextIds.has(original.id)) {
        await ProcessStepService.remove(original.id)
      }
    }

    for (const step of nextSteps) {
      const payload = {
        processTemplateId,
        stepName: step.stepName.trim(),
        stepOrder: step.stepOrder,
        description: step.description?.trim() || null,
        estimatedDay: step.estimatedDay ?? null,
        requiredMaterialType: step.requiredMaterialType?.trim() || null,
        note: step.note?.trim() || null,
      }
      const original = step.id
        ? originalSteps.find((item) => item.id === step.id)
        : null
      const changed =
        !original ||
        original.stepName !== payload.stepName ||
        original.stepOrder !== payload.stepOrder ||
        (original.description || null) !== payload.description ||
        (original.estimatedDay ?? null) !== payload.estimatedDay ||
        (original.requiredMaterialType || null) !==
          payload.requiredMaterialType ||
        (original.note || null) !== payload.note

      if (!changed) continue
      if (step.id) {
        await ProcessStepService.update(step.id, payload)
      } else {
        await ProcessStepService.create(payload)
      }
    }
  }

  const handleSubmit = async (values) => {
    const normalizedSteps = steps.map((step, index) => ({
      ...step,
      stepOrder: index + 1,
      stepName: step.stepName?.trim(),
    }))
    if (normalizedSteps.some((step) => !step.stepName)) {
      message.error('Vui lòng nhập tên cho tất cả các bước quy trình.')
      return
    }

    const templatePayload = {
      cropCatalogId: values.cropCatalogId,
      cropId: values.cropId || null,
      name: values.name.trim(),
      description: values.description?.trim() || null,
      estimatedDurationDays: values.estimatedDurationDays ?? null,
    }

    try {
      setSubmitting(true)
      const response = isEdit
        ? await PlanTemplateService.update(id, templatePayload, {
            skipNotice: true,
          })
        : await PlanTemplateService.create(templatePayload, {
            skipNotice: true,
          })
      if (response?.success === false) return

      const processTemplateId = isEdit ? id : getCreatedId(response)
      if (!processTemplateId) {
        throw new Error(
          'API đã tạo mẫu nhưng không trả về ID để lưu các bước quy trình.'
        )
      }

      await syncSteps(processTemplateId, normalizedSteps)
      message.success(
        isEdit
          ? 'Cập nhật mẫu quy trình thành công.'
          : 'Tạo mẫu quy trình thành công.'
      )
      navigate(ROUTER.FM_PLAN_TEMPLATES)
    } catch (error) {
      console.error('Process template submit failed:', {
        id,
        templatePayload,
        responseData: error.responseData,
        error,
      })
      message.error(error.message || 'Không thể lưu mẫu quy trình.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 duration-500 animate-in fade-in">
      <div className="flex items-center gap-4">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(ROUTER.FM_PLAN_TEMPLATES)}
        >
          Quay lại
        </Button>
        <TitleCustom className="!mb-0 flex items-center gap-2">
          <ProfileOutlined className="text-green-600" />
          {isEdit ? 'Cập nhật mẫu quy trình' : 'Tạo mẫu quy trình mới'}
        </TitleCustom>
      </div>

      <Card
        variant="borderless"
        className="shadow-sm rounded-2xl"
        styles={{ body: { padding: 24 } }}
      >
        <Spin spinning={loadingDetail}>
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <SectionTitle>Thông tin mẫu quy trình</SectionTitle>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="name"
                  label="Tên mẫu quy trình"
                  rules={[
                    { required: true, message: 'Vui lòng nhập tên mẫu.' },
                    { max: 200, message: 'Tên mẫu tối đa 200 ký tự.' },
                  ]}
                >
                  <Input
                    placeholder="Ví dụ: Quy trình trồng ngô ngọt"
                    className="h-10"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="cropCatalogId"
                  label="Danh mục cây trồng"
                  rules={[
                    {
                      required: true,
                      message: 'Vui lòng chọn danh mục cây trồng.',
                    },
                  ]}
                >
                  <Select
                    options={catalogOptions}
                    loading={loadingOptions}
                    showSearch
                    optionFilterProp="label"
                    placeholder="Chọn danh mục cây trồng"
                    onChange={() => form.setFieldValue('cropId', undefined)}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="cropId" label="Cây trồng cụ thể">
                  <Select
                    allowClear
                    options={cropOptions}
                    loading={loadingOptions}
                    disabled={!selectedCatalogId}
                    showSearch
                    optionFilterProp="label"
                    placeholder={
                      selectedCatalogId
                        ? 'Không bắt buộc'
                        : 'Chọn danh mục cây trồng trước'
                    }
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="estimatedDurationDays"
                  label="Tổng thời lượng dự kiến (ngày)"
                  rules={[
                    {
                      type: 'number',
                      min: 1,
                      message: 'Thời lượng phải lớn hơn 0.',
                    },
                  ]}
                >
                  <InputNumber
                    min={1}
                    precision={0}
                    className="w-full"
                    placeholder="Ví dụ: 90"
                  />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item name="description" label="Mô tả">
                  <Input.TextArea
                    rows={3}
                    maxLength={2000}
                    showCount
                    placeholder="Mô tả mục tiêu và phạm vi áp dụng của mẫu..."
                  />
                </Form.Item>
              </Col>
            </Row>

            <SectionTitle>Các bước quy trình</SectionTitle>
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div
                  key={step._key}
                  className="p-4 border border-gray-100 rounded-xl bg-gray-50"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center justify-center w-8 h-8 font-bold text-white bg-green-600 rounded-full shrink-0">
                      {index + 1}
                    </div>
                    <Input
                      value={step.stepName}
                      onChange={(event) =>
                        updateStep(index, 'stepName', event.target.value)
                      }
                      placeholder={`Tên bước ${index + 1}`}
                      maxLength={200}
                      className="font-semibold"
                    />
                    {steps.length > 1 && (
                      <Button
                        danger
                        type="text"
                        icon={<MinusCircleOutlined />}
                        onClick={() => removeStep(index)}
                      />
                    )}
                  </div>

                  <Row gutter={[12, 12]}>
                    <Col xs={24} md={16}>
                      <Text type="secondary" className="block mb-1 text-xs">
                        Mô tả công việc
                      </Text>
                      <Input.TextArea
                        rows={3}
                        value={step.description}
                        onChange={(event) =>
                          updateStep(index, 'description', event.target.value)
                        }
                        placeholder="Mô tả cách thực hiện bước này..."
                      />
                    </Col>
                    <Col xs={24} md={8}>
                      <Text type="secondary" className="block mb-1 text-xs">
                        Ngày thực hiện dự kiến
                      </Text>
                      <InputNumber
                        min={0}
                        precision={0}
                        className="w-full"
                        value={step.estimatedDay}
                        onChange={(value) =>
                          updateStep(index, 'estimatedDay', value)
                        }
                        placeholder="Ví dụ: ngày thứ 7"
                      />
                      <Text type="secondary" className="block mt-3 mb-1 text-xs">
                        Loại vật tư yêu cầu
                      </Text>
                      <Input
                        value={step.requiredMaterialType}
                        onChange={(event) =>
                          updateStep(
                            index,
                            'requiredMaterialType',
                            event.target.value
                          )
                        }
                        placeholder="Ví dụ: Phân bón"
                      />
                    </Col>
                    <Col span={24}>
                      <Text type="secondary" className="block mb-1 text-xs">
                        Ghi chú
                      </Text>
                      <Input.TextArea
                        rows={2}
                        value={step.note}
                        onChange={(event) =>
                          updateStep(index, 'note', event.target.value)
                        }
                        placeholder="Lưu ý kỹ thuật hoặc điều kiện thực hiện..."
                      />
                    </Col>
                  </Row>
                </div>
              ))}
            </div>

            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={addStep}
              className="w-full mt-4 border-green-400 text-green-700"
            >
              Thêm bước quy trình
            </Button>

            <div className="flex justify-end gap-3 pt-5 mt-5 border-t">
              <Button onClick={() => navigate(ROUTER.FM_PLAN_TEMPLATES)}>
                Hủy
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={submitting}
                icon={isEdit ? <EditOutlined /> : <PlusOutlined />}
                className="font-bold bg-green-600"
              >
                {isEdit ? 'Lưu thay đổi' : 'Tạo mẫu quy trình'}
              </Button>
            </div>
          </Form>
        </Spin>
      </Card>
    </div>
  )
}

export default PlanTemplateCreate
