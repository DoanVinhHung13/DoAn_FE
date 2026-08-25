import React, { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons"
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
} from "antd"

import SectionTitle from "src/components/Common/SectionTitle"
import AgriculturalInputCatalogAutocomplete from "src/components/AgriculturalInputCatalogAutocomplete"
import ROUTER from "src/router/ROUTER"
import PesticideService from "src/services/PesticideService"
import CatalogSuggestionService, {
  getCatalogPrefill,
} from "src/services/CatalogSuggestionService"
import { applyApiFieldErrors } from "src/services/core/apiError"
import { useSystemKey } from "src/hooks/useSystemKey"
import { useCropOptions } from "src/hooks/useCropOptions"
import useFormDraft from "src/hooks/useFormDraft"
import { SYSTEM_KEY } from "src/constants/systemKey"
import {
  getQuantityUnit,
  formatAreaUnit,
  MEASUREMENT_UNITS,
} from "src/constants/measurementUnits"
import { getFormDraftKey } from "src/utils/formDraftKeys"
import { makeDescriptionValidator, makeNameValidator } from "src/utils/helpers"

const { Text } = Typography

const normalizeTarget = value =>
  String(value ?? "")
    .trim()
    .toLowerCase()

const PesticideFormFields = ({ isEdit, editingItem }) => {
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const { getCombo } = useSystemKey()
  const { cropOptions, isCropsLoading } = useCropOptions()

  const storageKey = getFormDraftKey(
    "pesticide",
    isEdit ? "edit" : "create",
    editingItem?.id,
  )
  const { saveDraft, clearDraft, restoreDraft } = useFormDraft({
    form,
    storageKey,
  })

  const pesticideTypeOptions = getCombo(SYSTEM_KEY.PESTICIDE_TYPE).map(opt => ({
    value: opt.codeValue || opt.value,
    label: opt.label || opt.description,
  }))

  const pesticideUnitOptions = getCombo(SYSTEM_KEY.PESTICIDE_UNIT).map(opt => ({
    value: opt.codeValue || opt.value,
    label: opt.label || opt.description,
  }))

  // ── 1. States & Variables ───────────────────────────────────────────────────
  const [loading, setLoading] = useState(false)
  const [quantityUnit, setQuantityUnit] = useState(MEASUREMENT_UNITS.LITER)
  const prefillRequestRef = useRef(0)
  const usages = Form.useWatch("usages", form) || []

  // ── 2. Handlers & Business Functions ─────────────────────────────────────────
  const initFormData = () => {
    const draft = restoreDraft()
    const draftData = draft?.data || {}

    if (isEdit && editingItem) {
      const selectedUnit = getQuantityUnit(
        editingItem.unit,
        MEASUREMENT_UNITS.LITER,
      )
      setQuantityUnit(selectedUnit)
      form.setFieldsValue({
        name: editingItem.name || "",
        manufacturer: editingItem.manufacturer || "",
        type: editingItem.type || "",
        minimumStock: editingItem.minimumStock ?? editingItem.minInventory ?? 0,
        inventoryQuantity: editingItem.inventoryQuantity ?? 0,
        inventoryUnit: selectedUnit,
        unit: selectedUnit,
        description: editingItem.description || "",
        usages:
          editingItem.usages && editingItem.usages.length > 0
            ? editingItem.usages.map(u => ({
                ...u,
                targetCrop: u.targetCrop || u.target || undefined,
                dosage: u.dosage,
                dosageUnit: selectedUnit,
                areaUnit: MEASUREMENT_UNITS.SQUARE_METER,
                isolationDays: u.isolationDays ?? u.quarantineDays,
              }))
            : [{}],
        ...draftData,
      })
    } else {
      setQuantityUnit(MEASUREMENT_UNITS.LITER)
      form.resetFields()
      form.setFieldsValue({
        unit: MEASUREMENT_UNITS.LITER,
        inventoryUnit: MEASUREMENT_UNITS.LITER,
        usages: [{}],
        ...draftData,
      })
    }
  }

  const applyCatalog = async catalog => {
    const requestId = ++prefillRequestRef.current
    try {
      const item =
        getCatalogPrefill(
          await CatalogSuggestionService.pesticidePrefill({ id: catalog.id }),
        ) || {}
      if (requestId !== prefillRequestRef.current) return
      const values = { name: item.name || catalog.name }
      if (item.manufacturer?.trim())
        values.manufacturer = item.manufacturer.trim()
      if (item.description?.trim()) values.description = item.description.trim()
      if (item.unit?.trim()) {
        values.unit = item.unit.trim()
        setQuantityUnit(item.unit.trim())
      }
      if (item.type?.trim()) values.type = item.type.trim()
      form.setFieldsValue(values)
    } catch {
      if (requestId === prefillRequestRef.current) {
        message.warning(
          "Không thể tải dữ liệu từ danh mục. Bạn vẫn có thể nhập thủ công.",
        )
      }
    }
  }

  const getUsageCropOptions = index => {
    const currentTarget = normalizeTarget(usages[index]?.targetCrop)
    const targetsInOtherRows = new Set(
      usages
        .filter((_, i) => i !== index)
        .map(u => normalizeTarget(u?.targetCrop))
        .filter(Boolean),
    )

    return cropOptions.filter(option => {
      const optKey = normalizeTarget(option.value)
      return optKey === currentTarget || !targetsInOtherRows.has(optKey)
    })
  }

  const handleSubmit = async values => {
    try {
      const selectedTargets = (values.usages || [])
        .map(usage => normalizeTarget(usage.targetCrop))
        .filter(Boolean)
      if (new Set(selectedTargets).size !== selectedTargets.length) {
        message.error("Mỗi cây chỉ được khai báo một liều lượng.")
        return
      }

      setLoading(true)

      const body = {
        name: values.name?.trim().replace(/\s+/g, " "),
        type: values.type?.trim() || "",
        manufacturer: values.manufacturer?.trim().replace(/\s+/g, " ") || "",
        minInventory: values.minimumStock ?? 0,
        inventoryQuantity: values.inventoryQuantity ?? 0,
        inventoryUnit: values.inventoryUnit || values.unit || "",
        unit: values.unit || quantityUnit,
        description: values.description?.trim().replace(/\s+/g, " ") || "",
        isActive: isEdit ? editingItem.isActive : true,
        usages: (values.usages || []).map(u => {
          const usageObj = {
            dosage: u.dosage || 0,
            dosageUnitId: quantityUnit,
            area: 1,
            areaUnitId: MEASUREMENT_UNITS.SQUARE_METER,
            targetCrop: Array.isArray(u.targetCrop)
              ? u.targetCrop.join(", ")
              : u.targetCrop || "",
            quarantineDays: u.isolationDays || 0,
          }
          if (isEdit && u.id) usageObj.id = u.id
          return usageObj
        }),
      }

      if (isEdit) {
        await PesticideService.updatePesticide(editingItem.id, body, {
          errorHandling: "form",
        })
      } else {
        await PesticideService.createPesticide(body, {
          errorHandling: "form",
        })
      }

      clearDraft()
      navigate(ROUTER.FM_PESTICIDES)
    } catch (error) {
      applyApiFieldErrors(form, error)
    } finally {
      setLoading(false)
    }
  }

  // ── 3. Effects ───────────────────────────────────────────────────────────────
  useEffect(() => {
    initFormData()
  }, [cropOptions, editingItem, isEdit, form, restoreDraft])

  useEffect(() => {
    saveDraft(form.getFieldsValue(true))
  }, [form, saveDraft])

  // ── 4. Render JSX ───────────────────────────────────────────────────────────
  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      onValuesChange={(_, allValues) => saveDraft(allValues)}
    >
      <SectionTitle>Thông Tin Cơ Bản</SectionTitle>

      <Row gutter={16}>
        <Col xs={24}>
          <Form.Item
            name="name"
            label="Tên nông dược"
            rules={[
              { required: true, message: "Vui lòng nhập tên nông dược." },
              makeNameValidator({ label: "Tên nông dược" }),
            ]}
          >
            <AgriculturalInputCatalogAutocomplete
              catalogType="PESTICIDE"
              value={Form.useWatch("name", form)}
              onChange={value => form.setFieldValue("name", value)}
              onSelectCatalog={applyCatalog}
              placeholder="Nhập tên..."
              allowCreate={!isEdit}
            />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item
            name="manufacturer"
            label="Nhà Sản Xuất"
            rules={[makeNameValidator({ label: "Nhà sản xuất", required: false })]}
          >
            <Input placeholder="Nhập nhà sản xuất..." className="rounded-lg" />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item
            name="type"
            label="Loại nông dược"
            rules={[
              { required: true, message: "Vui lòng chọn loại nông dược." },
            ]}
          >
            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              options={pesticideTypeOptions}
              placeholder="Chọn loại nông dược..."
            />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item
            name="minimumStock"
            label="Tồn Kho tối thiểu"
            rules={[
              { required: true, message: "Vui lòng nhập tồn kho tối thiểu." },
              {
                type: "number",
                min: 1,
                message: "Tồn kho tối thiểu phải là số dương (>= 1).",
              },
            ]}
          >
            <InputNumber
              min={1}
              placeholder="1"
              className="w-full rounded-lg"
              formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              parser={v => v?.replace(/,*/g, "")}
            />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          {isEdit ? (
            <>
              <Form.Item name="unit" hidden>
                <Input />
              </Form.Item>
              <Form.Item label="Đơn vị tính (Kho)">
                <Input
                  value={quantityUnit}
                  disabled
                  className="w-full rounded-lg font-medium"
                />
              </Form.Item>
            </>
          ) : (
            <Form.Item
              name="unit"
              label="Đơn vị tính (Kho)"
              rules={[
                { required: true, message: "Vui lòng chọn đơn vị tính." },
              ]}
            >
              <Select
                options={pesticideUnitOptions}
                placeholder="Chọn đơn vị..."
                onChange={value => {
                  setQuantityUnit(value)
                  form.setFieldValue("inventoryUnit", value)
                  const currentUsages = form.getFieldValue("usages") || []
                  form.setFieldValue(
                    "usages",
                    currentUsages.map(u => ({
                      ...u,
                      dosageUnit: value,
                      areaUnit: MEASUREMENT_UNITS.SQUARE_METER,
                    })),
                  )
                }}
              />
            </Form.Item>
          )}
        </Col>

        <Col xs={24}>
          <Form.Item
            name="description"
            label="Mô Tả"
            rules={[makeDescriptionValidator({ maxLength: 500 })]}
          >
            <Input.TextArea
              rows={3}
              placeholder="Nhập mô tả chi tiết..."
              className="rounded-lg"
            />
          </Form.Item>
        </Col>
      </Row>

      <SectionTitle>Liều Lượng</SectionTitle>

      <Form.List name="usages">
        {(fields, { add, remove }) => (
          <>
            <div className="space-y-3 mb-3">
              {fields.map(({ key, name, ...restField }, index) => (
                <div
                  key={key}
                  className="rounded-xl bg-gray-50/60 border border-gray-100 p-3 sm:p-4 mb-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                      Liều lượng {index + 1}
                    </span>
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => remove(name)}
                      disabled={fields.length <= 1}
                      className="text-gray-400 hover:text-red-500 !h-8 !w-8 flex items-center justify-center rounded-lg"
                    />
                  </div>

                  <Row gutter={12}>
                    <Col xs={24} sm={12} md={6}>
                      <Form.Item
                        {...restField}
                        name={[name, "targetCrop"]}
                        label={
                          <span className="text-xs font-semibold text-gray-700">
                            Cây trồng <span className="text-red-500">*</span>
                          </span>
                        }
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng chọn cây trồng.",
                          },
                        ]}
                        className="mb-0"
                      >
                        <Select
                          options={getUsageCropOptions(index)}
                          loading={isCropsLoading}
                          placeholder="Chọn cây trồng..."
                          className="w-full"
                          allowClear
                          showSearch
                          optionFilterProp="label"
                        />
                      </Form.Item>
                    </Col>

                    <Col xs={24} sm={12} md={6}>
                      <Form.Item
                        {...restField}
                        name={[name, "dosage"]}
                        label={
                          <span className="text-xs font-semibold text-gray-700">
                            Liều lượng <span className="text-red-500">*</span>
                          </span>
                        }
                        rules={[
                          {
                            required: true,
                            message: "Nhập liều lượng",
                          },
                        ]}
                        className="mb-0"
                      >
                        <InputNumber
                          min={0}
                          placeholder="Số"
                          className="w-full rounded-lg"
                        />
                      </Form.Item>
                    </Col>

                    <Col xs={24} sm={12} md={6}>
                      <Form.Item
                        label={
                          <span className="text-xs font-semibold text-gray-700">
                            Đơn vị tính / Diện tích
                          </span>
                        }
                        className="mb-0"
                      >
                        <Input
                          value={`${quantityUnit}/${formatAreaUnit(MEASUREMENT_UNITS.SQUARE_METER)}`}
                          disabled
                          className="w-full rounded-lg font-medium"
                        />
                      </Form.Item>
                    </Col>

                    <Col xs={24} sm={12} md={6}>
                      <Form.Item
                        {...restField}
                        name={[name, "isolationDays"]}
                        label={
                          <span className="text-xs font-semibold text-gray-700">
                            Cách ly (Ngày) <span className="text-red-500">*</span>
                          </span>
                        }
                        rules={[
                          {
                            required: true,
                            message: "Nhập số ngày",
                          },
                        ]}
                        className="mb-0"
                      >
                        <InputNumber
                          min={0}
                          placeholder="Ngày"
                          className="w-full rounded-lg"
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </div>
              ))}
            </div>

            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={() =>
                add({
                  dosageUnit: quantityUnit,
                  areaUnit: MEASUREMENT_UNITS.SQUARE_METER,
                })
              }
              className="w-full mb-5 rounded-lg border-green-400 text-green-700 hover:border-green-500"
            >
              Thêm Liều Lượng
            </Button>
          </>
        )}
      </Form.List>

      <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-gray-100">
        <Button
          onClick={() => navigate(ROUTER.FM_PESTICIDES)}
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
          {isEdit ? "Lưu thay đổi" : "Thêm mới"}
        </Button>
      </div>
    </Form>
  )
}

export default PesticideFormFields

