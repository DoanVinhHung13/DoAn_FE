import { CheckSquareOutlined, FileTextOutlined } from '@ant-design/icons'
import { Col, Form, Input, Row, Segmented, Select } from 'antd'
import React, { useEffect, useMemo, useState } from 'react'
import useDebouncedValue from 'src/hooks/useDebouncedValue'
import CropCatalogService from 'src/services/CropCatalogService'
import CropManagementService from 'src/services/CropManagementService'

const ALL_OPTION_VALUE = '__ALL__'
const NORMAL_TASK = 'NORMAL'
const HARVEST_TASK = 'HARVEST'
const NORMAL_ACTIVITY = 'OTHER'
const HARVEST_ACTIVITY = 'HARVESTING'

const unwrapItems = (response) => {
  const payload = response?.data?.data ?? response?.data ?? response ?? {}
  return Array.isArray(payload) ? payload : payload.items || []
}

const getCropCatalogId = (crop) => crop.cropCatalogId || crop.cropCatalog?.id

const normalizeTaskType = (value) =>
  String(value || '').toUpperCase() === HARVEST_TASK ? HARVEST_TASK : NORMAL_TASK

const TaskFormFields = ({ form, readOnly = false }) => {
  const [catalogs, setCatalogs] = useState([])
  const [crops, setCrops] = useState([])
  const [catalogLoading, setCatalogLoading] = useState(false)
  const [cropLoading, setCropLoading] = useState(false)
  const [catalogSearch, setCatalogSearch] = useState('')
  const [cropSearch, setCropSearch] = useState('')
  const selectedCatalogId = Form.useWatch('cropCatalogId', form)
  const selectedTaskType = Form.useWatch('taskType', form)
  const debouncedCatalogSearch = useDebouncedValue(catalogSearch, 400)
  const debouncedCropSearch = useDebouncedValue(cropSearch, 400)
  const selectedCatalogFilter = selectedCatalogId && selectedCatalogId !== ALL_OPTION_VALUE
    ? selectedCatalogId
    : null

  useEffect(() => {
    let active = true
    const loadCatalogs = async () => {
      try {
        setCatalogLoading(true)
        const response = await CropCatalogService.getCropCatalogs({
          PageIndex: 1,
          PageSize: 100,
          Status: 'ACTIVE',
          SearchKeyword: debouncedCatalogSearch || undefined,
        })
        if (active) setCatalogs(unwrapItems(response).filter(item => item.isActive !== false))
      } catch {
        if (active) setCatalogs([])
      } finally {
        if (active) setCatalogLoading(false)
      }
    }
    loadCatalogs()
    return () => { active = false }
  }, [debouncedCatalogSearch])

  useEffect(() => {
    let active = true
    const loadCrops = async () => {
      if (!selectedCatalogFilter) {
        setCrops([])
        setCropLoading(false)
        return
      }
      try {
        setCropLoading(true)
        const response = await CropManagementService.getCrops({
          PageIndex: 1,
          PageSize: 100,
          Status: 'ACTIVE',
          CropCatalogId: selectedCatalogFilter,
          SearchKeyword: debouncedCropSearch || undefined,
        })
        if (active) setCrops(unwrapItems(response).filter(item => item.isActive !== false))
      } catch {
        if (active) setCrops([])
      } finally {
        if (active) setCropLoading(false)
      }
    }
    loadCrops()
    return () => { active = false }
  }, [debouncedCropSearch, selectedCatalogFilter])

  const catalogOptions = useMemo(() => [
    { value: ALL_OPTION_VALUE, label: 'Tất cả' },
    ...catalogs.map(item => ({ value: item.id, label: item.name })),
  ], [catalogs])

  const cropOptions = useMemo(() => [
    { value: ALL_OPTION_VALUE, label: 'Tất cả' },
    ...crops
      .filter(item => String(getCropCatalogId(item)) === String(selectedCatalogFilter))
      .map(item => ({ value: item.id, label: item.name })),
  ], [crops, selectedCatalogFilter])

  const handleCatalogChange = (value) => {
    form?.setFieldValue('cropId', ALL_OPTION_VALUE)
    form?.setFieldValue('cropCatalogId', value)
  }

  const handleTaskTypeChange = (value) => {
    form?.setFieldsValue({
      taskType: value,
      activityType: value === HARVEST_TASK
        ? HARVEST_ACTIVITY
        : (form?.getFieldValue('activityType') === HARVEST_ACTIVITY ? NORMAL_ACTIVITY : form?.getFieldValue('activityType') || NORMAL_ACTIVITY),
    })
  }

  return (
    <Row gutter={16}>
      <Col xs={24} md={12}>
        <Form.Item name="cropCatalogId" label="Danh mục cây trồng">
          <Select
            showSearch
            optionFilterProp="label"
            loading={catalogLoading}
            disabled={readOnly}
            options={catalogOptions}
            onSearch={setCatalogSearch}
            filterOption={false}
            placeholder="Chọn danh mục cây trồng"
            onChange={handleCatalogChange}
          />
        </Form.Item>
      </Col>
      <Col xs={24} md={12}>
        <Form.Item name="cropId" label="Cây trồng">
          <Select
            showSearch
            optionFilterProp="label"
            loading={cropLoading}
            disabled={readOnly || !selectedCatalogFilter}
            options={cropOptions}
            onSearch={setCropSearch}
            filterOption={false}
            placeholder="Chọn cây trồng hoặc Tất cả"
          />
        </Form.Item>
      </Col>
      <Col xs={24} md={12}>
        <Form.Item name="taskType" label="Loại công việc">
          <Segmented
            block
            disabled={readOnly}
            value={normalizeTaskType(selectedTaskType)}
            onChange={handleTaskTypeChange}
            options={[
              { label: 'Công việc thường', value: NORMAL_TASK },
              { label: 'Thu hoạch', value: HARVEST_TASK },
            ]}
          />
        </Form.Item>
      </Col>
      <Col xs={24}>
        <Form.Item
          name="name"
          label={<span className="text-xs font-bold tracking-wider text-gray-500 uppercase">Tên công việc</span>}
          rules={!readOnly ? [
            { required: true, message: 'Vui lòng nhập tên công việc.' },
            { max: 200, message: 'Tên công việc tối đa 200 ký tự.' },
          ] : []}
        >
          <Input
            prefix={<CheckSquareOutlined className="text-gray-300" />}
            placeholder="VD: Tưới nước buổi sáng"
            className="h-10 rounded-lg"
            readOnly={readOnly}
          />
        </Form.Item>
      </Col>
      <Col xs={24}>
        <Form.Item name="description" label={<span className="text-xs font-bold tracking-wider text-gray-500 uppercase"><FileTextOutlined className="mr-1" />Mô tả kỹ thuật</span>}>
          <Input.TextArea
            rows={4}
            placeholder="Nhập mô tả chi tiết, quy trình thực hiện, yêu cầu kỹ thuật..."
            className="rounded-lg"
            maxLength={1000}
            showCount={!readOnly}
            readOnly={readOnly}
          />
        </Form.Item>
      </Col>
    </Row>
  )
}

export default TaskFormFields
