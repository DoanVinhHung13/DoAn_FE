import { FileTextOutlined } from "@ant-design/icons"
import { Col, Form, Input, Row, Segmented, Select } from "antd"
import React, { useEffect, useMemo, useState } from "react"
import useDebouncedValue from "src/hooks/useDebouncedValue"
import CropCatalogService from "src/services/CropCatalogService"
import CropManagementService from "src/services/CropManagementService"
import {
  CULTIVATION_TASK_TYPE_OPTIONS,
  normalizeCultivationTaskType,
} from "src/constants/cultivationTask"
import { makeNameValidator } from "src/utils/helpers"

const ALL_OPTION_VALUE = "__ALL__"

const unwrapItems = response => {
  const payload = response?.data?.data ?? response?.data ?? response ?? {}
  return Array.isArray(payload) ? payload : payload.items || []
}

const getCropCatalogId = crop => crop.cropCatalogId || crop.cropCatalog?.id

const TaskFormFields = ({ form, readOnly = false, showTaskType = true }) => {
  const [catalogs, setCatalogs] = useState([])
  const [crops, setCrops] = useState([])
  const [catalogLoading, setCatalogLoading] = useState(false)
  const [cropLoading, setCropLoading] = useState(false)
  const [catalogSearch, setCatalogSearch] = useState("")
  const [cropSearch, setCropSearch] = useState("")
  const selectedCatalogId = Form.useWatch("cropCatalogId", form)
  const selectedTaskType = Form.useWatch("taskType", form)
  const debouncedCatalogSearch = useDebouncedValue(catalogSearch, 400)
  const debouncedCropSearch = useDebouncedValue(cropSearch, 400)
  const selectedCatalogFilter =
    selectedCatalogId && selectedCatalogId !== ALL_OPTION_VALUE
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
          Status: "ACTIVE",
          SearchKeyword: debouncedCatalogSearch || undefined,
        })
        if (active)
          setCatalogs(
            unwrapItems(response).filter(item => item.isActive !== false),
          )
      } catch {
        if (active) setCatalogs([])
      } finally {
        if (active) setCatalogLoading(false)
      }
    }
    loadCatalogs()
    return () => {
      active = false
    }
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
          Status: "ACTIVE",
          CropCatalogId: selectedCatalogFilter,
          SearchKeyword: debouncedCropSearch || undefined,
        })
        if (active)
          setCrops(
            unwrapItems(response).filter(item => item.isActive !== false),
          )
      } catch {
        if (active) setCrops([])
      } finally {
        if (active) setCropLoading(false)
      }
    }
    loadCrops()
    return () => {
      active = false
    }
  }, [debouncedCropSearch, selectedCatalogFilter])

  const catalogOptions = useMemo(
    () => [
      { value: ALL_OPTION_VALUE, label: "Tất cả" },
      ...catalogs.map(item => ({ value: item.id, label: item.name })),
    ],
    [catalogs],
  )

  const cropOptions = useMemo(
    () => [
      { value: ALL_OPTION_VALUE, label: "Tất cả" },
      ...crops
        .filter(
          item =>
            String(getCropCatalogId(item)) === String(selectedCatalogFilter),
        )
        .map(item => ({ value: item.id, label: item.name })),
    ],
    [crops, selectedCatalogFilter],
  )

  const handleCatalogChange = value => {
    form?.setFieldValue("cropId", ALL_OPTION_VALUE)
    form?.setFieldValue("cropCatalogId", value)
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
      {showTaskType && (
        <Col xs={24} md={12}>
          <Form.Item
            name="taskType"
            label="Loại công việc"
            normalize={normalizeCultivationTaskType}
            rules={
              !readOnly
                ? [{ required: true, message: "Vui lòng chọn loại công việc." }]
                : []
            }
          >
            <Segmented
              block
              className="task-type-segmented"
              disabled={readOnly}
              value={normalizeCultivationTaskType(selectedTaskType)}
              onChange={value =>
                form?.setFieldValue(
                  "taskType",
                  normalizeCultivationTaskType(value),
                )
              }
              options={CULTIVATION_TASK_TYPE_OPTIONS}
            />
          </Form.Item>
        </Col>
      )}
      <Col xs={24}>
        <Form.Item
          name="name"
          label={
            <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
              Tên công việc
            </span>
          }
          rules={
            !readOnly
              ? [
                  { required: true, message: "Vui lòng nhập tên công việc." },
                  makeNameValidator({ label: "Tên công việc" }),
                ]
              : []
          }
        >
          <Input
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
          rules={[
            {
              validator: (_, value) => {
                if (!value) return Promise.resolve()
                const trimmed = value.trim()
                if (!trimmed) return Promise.resolve()
                if (trimmed.length > 500) {
                  return Promise.reject(
                    new Error("Mô tả không được vượt quá 500 ký tự."),
                  )
                }
                if (trimmed !== trimmed.replace(/\s+/g, " ")) {
                  return Promise.reject(
                    new Error(
                      "Mô tả không được chứa nhiều khoảng trắng liên tiếp.",
                    ),
                  )
                }
                return Promise.resolve()
              },
            },
          ]}
        >
          <Input.TextArea
            rows={4}
            placeholder="Nhập mô tả chi tiết, quy trình thực hiện, yêu cầu kỹ thuật..."
            className="task-description-textarea rounded-lg"
            readOnly={readOnly}
          />
        </Form.Item>
      </Col>
    </Row>
  )
}

export default TaskFormFields
