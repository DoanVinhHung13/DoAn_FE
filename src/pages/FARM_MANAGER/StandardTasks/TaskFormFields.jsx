import { CheckSquareOutlined, FileTextOutlined } from '@ant-design/icons'
import { Col, Form, Input, Row, Select } from 'antd'
import React, { useEffect, useMemo, useState } from 'react'
import CropCatalogService from 'src/services/CropCatalogService'
import CropManagementService from 'src/services/CropManagementService'
import useDebouncedValue from 'src/hooks/useDebouncedValue'

const unwrapItems = (response) => {
  const payload = response?.data?.data ?? response?.data ?? response ?? {}
  return Array.isArray(payload) ? payload : payload.items || []
}

const getCropCatalogId = (crop) => crop.cropCatalogId || crop.cropCatalog?.id
const ALL_OPTION_VALUE = '__ALL__'

const TaskFormFields = ({ form, readOnly = false }) => {
  const [catalogs, setCatalogs] = useState([])
  const [crops, setCrops] = useState([])
  const [loading, setLoading] = useState(false)
  const [catalogSearch, setCatalogSearch] = useState('')
  const [cropSearch, setCropSearch] = useState('')
  const debouncedCatalogSearch = useDebouncedValue(catalogSearch, 400)
  const debouncedCropSearch = useDebouncedValue(cropSearch, 400)
  const selectedCatalogId = Form.useWatch('cropCatalogId', form)
  const selectedCatalogFilter = selectedCatalogId === ALL_OPTION_VALUE ? undefined : selectedCatalogId

  useEffect(() => {
    const loadOptions = async () => {
      try {
        setLoading(true)
        const [catalogResponse, cropResponse] = await Promise.all([
          CropCatalogService.getCropCatalogs({ PageIndex: 1, PageSize: 100, Status: 'ACTIVE', SearchKeyword: debouncedCatalogSearch || undefined }),
          CropManagementService.getCrops({ PageIndex: 1, PageSize: 100, Status: 'ACTIVE', CropCatalogId: selectedCatalogFilter || undefined, SearchKeyword: debouncedCropSearch || undefined }),
        ])
        setCatalogs(unwrapItems(catalogResponse).filter(item => item.isActive !== false))
        setCrops(unwrapItems(cropResponse).filter(item => item.isActive !== false))
      } catch {
        setCatalogs([])
        setCrops([])
      } finally {
        setLoading(false)
      }
    }

    loadOptions()
  }, [debouncedCatalogSearch, debouncedCropSearch, selectedCatalogFilter])

  const catalogOptions = useMemo(
    () => [{ value: ALL_OPTION_VALUE, label: 'Tất cả' }, ...catalogs.map(item => ({ value: item.id, label: item.name }))],
    [catalogs],
  )
  const cropOptions = useMemo(
    () => [
      { value: ALL_OPTION_VALUE, label: 'Tất cả' },
      ...crops
        .filter(item => !selectedCatalogFilter || String(getCropCatalogId(item)) === String(selectedCatalogFilter))
        .map(item => ({ value: item.id, label: item.name })),
    ],
    [crops, selectedCatalogFilter],
  )

  return (
    <Row gutter={16}>
      <Col xs={24} md={12}>
        <Form.Item
          name="cropCatalogId"
          label="Danh mục cây trồng"
          rules={!readOnly ? [{ required: true, message: 'Vui lòng chọn phạm vi danh mục cây trồng.' }] : []}
        >
          <Select
            showSearch
            optionFilterProp="label"
            loading={loading}
            disabled={readOnly}
            options={catalogOptions}
            onSearch={setCatalogSearch}
            filterOption={false}
            placeholder="Chọn danh mục cây trồng"
            onChange={() => form?.setFieldValue('cropId', ALL_OPTION_VALUE)}
          />
        </Form.Item>
      </Col>
      <Col xs={24} md={12}>
        <Form.Item
          name="cropId"
          label="Cây trồng"
          rules={!readOnly ? [{ required: true, message: 'Vui lòng chọn phạm vi cây trồng.' }] : []}
        >
          <Select
            showSearch
            optionFilterProp="label"
            loading={loading}
            disabled={readOnly}
            options={cropOptions}
            onSearch={setCropSearch}
            filterOption={false}
            placeholder="Chọn cây trồng hoặc Tất cả"
          />
        </Form.Item>
      </Col>
      <Col xs={24} md={24}>
        <Form.Item
          name="name"
          label={
            <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
              Tên công việc {!readOnly}
            </span>
          }
          rules={!readOnly ? [
            { required: true, message: 'Vui lòng nhập tên công việc.' },
            { max: 100, message: 'Tên công việc tối đa 100 ký tự.' },
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
        <Form.Item
          name="description"
          label={
            <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
              <FileTextOutlined className="mr-1" />
              Mô tả kỹ thuật
            </span>
          }
        >
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
