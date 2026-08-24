import React, { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import {
  EditOutlined,
  MinusCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons"
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
import FertilizerService from "src/services/FertilizerService"
import CatalogSuggestionService, {
  getCatalogPrefill,
} from "src/services/CatalogSuggestionService"
import {
  createFertilizerComponentRow,
  mapCatalogCompositionsToRows,
} from "src/services/CatalogSuggestionService/compositions"
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

const DEFAULT_DOSAGE = {
  amount: "",
  unit: MEASUREMENT_UNITS.KILOGRAM,
  areaUnit: MEASUREMENT_UNITS.SQUARE_METER,
  target: "",
}

const normalizeTarget = value =>
  String(value ?? "")
    .trim()
    .toLowerCase()

const FertilizerFormFields = ({ isEdit, editingItem }) => {
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const { getCombo } = useSystemKey()
  const { cropOptions, isCropsLoading } = useCropOptions()

  const storageKey = getFormDraftKey(
    "fertilizer",
    isEdit ? "edit" : "create",
    editingItem?.id,
  )
  const { saveDraft, clearDraft, restoreDraft } = useFormDraft({
    form,
    storageKey,
  })

  const fertilizerTypeOptions = getCombo(SYSTEM_KEY.FERTILIZER_TYPE).map(
    opt => ({
      value: opt.codeValue || opt.value,
      label: opt.label || opt.description,
    }),
  )

  const fertilizerUnitOptions = getCombo(SYSTEM_KEY.FERTILIZER_UNIT).map(
    opt => ({
      value: opt.codeValue || opt.value,
      label: opt.label || opt.description,
    }),
  )

  // ── 1. States & Variables ───────────────────────────────────────────────────
  const [loading, setLoading] = useState(false)
  const [quantityUnit, setQuantityUnit] = useState(MEASUREMENT_UNITS.KILOGRAM)
  const [components, setComponents] = useState([])
  const [dosages, setDosages] = useState([DEFAULT_DOSAGE])
  const prefillRequestRef = useRef(0)

  // ── 2. Handlers & Business Functions ─────────────────────────────────────────
  const initFormData = () => {
    const draft = restoreDraft({
      onRestore: ({ data }) => {
        form.setFieldsValue(data)
        setComponents(data.__draftMeta?.components || [])
        setDosages(data.__draftMeta?.dosages || [{ ...DEFAULT_DOSAGE }])
      },
    })
    const draftData = draft?.data || {}

    if (isEdit && editingItem) {
      const selectedUnit = getQuantityUnit(
        editingItem.unit,
        MEASUREMENT_UNITS.KILOGRAM,
      )
      setQuantityUnit(selectedUnit)
      form.setFieldsValue({
        name: editingItem.name || "",
        manufacturer: editingItem.manufacturer || "",
        minimumStock: editingItem.minimumStock ?? 0,
        inventoryQuantity: editingItem.inventoryQuantity ?? 0,
        inventoryUnit: selectedUnit,
        unit: selectedUnit,
        type:
          editingItem.type ||
          editingItem.fertilizerType ||
          editingItem.category ||
          undefined,
        description: editingItem.description || "",
        ...draftData,
      })

      const incomingComps = editingItem.compositions?.length
        ? editingItem.compositions
        : editingItem.components?.length
          ? editingItem.components
          : []

      if (incomingComps.length > 0) {
        setComponents(
          draftData.__draftMeta?.components ||
            incomingComps.map(createFertilizerComponentRow),
        )
      } else {
        setComponents(draftData.__draftMeta?.components || [])
      }

      setDosages(
        draftData.__draftMeta?.dosages ||
          (editingItem.dosages?.length
            ? editingItem.dosages.map(d => ({
                ...d,
                unit: selectedUnit,
                areaUnit: MEASUREMENT_UNITS.SQUARE_METER,
              }))
            : [{ ...DEFAULT_DOSAGE, unit: selectedUnit }]),
      )
    } else {
      setQuantityUnit(MEASUREMENT_UNITS.KILOGRAM)
      form.resetFields()
      form.setFieldsValue({
        unit: MEASUREMENT_UNITS.KILOGRAM,
        inventoryUnit: MEASUREMENT_UNITS.KILOGRAM,
        ...draftData,
      })
      setComponents(draftData.__draftMeta?.components || [])
      setDosages(draftData.__draftMeta?.dosages || [{ ...DEFAULT_DOSAGE }])
    }
  }

  const applyCatalog = async catalog => {
    const requestId = ++prefillRequestRef.current
    try {
      const item =
        getCatalogPrefill(
          await CatalogSuggestionService.fertilizerPrefill({ id: catalog.id }),
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
      setComponents(
        mapCatalogCompositionsToRows(item.compositions ?? item.Compositions),
      )
    } catch {
      if (requestId === prefillRequestRef.current) {
        message.warning(
          "Không thể tải dữ liệu từ danh mục. Bạn vẫn có thể nhập thủ công.",
        )
      }
    }
  }

  const handleComponentChange = (index, field, value) => {
    setComponents(current =>
      current.map((comp, i) =>
        i === index ? { ...comp, [field]: value } : comp,
      ),
    )
  }

  const handleAddComponent = () =>
    setComponents(current => [...current, createFertilizerComponentRow()])

  const handleRemoveComponent = index =>
    setComponents(current => current.filter((_, i) => i !== index))

  const handleDosageChange = (index, field, value) => {
    setDosages(current =>
      current.map((dosage, i) =>
        i === index ? { ...dosage, [field]: value } : dosage,
      ),
    )
  }

  const getDosageOptions = index => {
    const currentTarget = normalizeTarget(dosages[index]?.target)
    const targetsInOtherRows = new Set(
      dosages
        .filter((_, i) => i !== index)
        .map(d => normalizeTarget(d.target))
        .filter(Boolean),
    )

    return cropOptions.filter(option => {
      const optKey = normalizeTarget(option.value)
      return optKey === currentTarget || !targetsInOtherRows.has(optKey)
    })
  }

  const handleAddDosage = () =>
    setDosages(current => [
      ...current,
      {
        ...DEFAULT_DOSAGE,
        unit: quantityUnit,
        areaUnit: MEASUREMENT_UNITS.SQUARE_METER,
      },
    ])

  const handleRemoveDosage = index =>
    setDosages(current => current.filter((_, i) => i !== index))

  const handleSubmit = async values => {
    try {
      let totalPercentage = 0
      for (const comp of components) {
        const compName = comp.name?.trim() || ""
        if (!compName) continue

        const val = Number(comp.value)
        if (comp.value == null || comp.value === "" || Number.isNaN(val)) {
          continue
        }

        if (val < 0 || val > 100) {
          message.error(
            `Hàm lượng của ${compName} (%) phải nằm trong khoảng 0 đến 100.`,
          )
          return
        }
        totalPercentage += val
      }

      if (totalPercentage > 100) {
        message.error(
          "Tổng hàm lượng các thành phần (%) không được vượt quá 100%.",
        )
        return
      }

      const selectedTargets = dosages
        .map(dosage => normalizeTarget(dosage.target))
        .filter(Boolean)
      if (new Set(selectedTargets).size !== selectedTargets.length) {
        message.error("Mỗi cây chỉ được khai báo một liều lượng.")
        return
      }

      setLoading(true)

      const body = {
        name: values.name?.trim().replace(/\s+/g, " "),
        unit: values.unit,
        description: values.description?.trim().replace(/\s+/g, " ") || "",
        minimumStock: values.minimumStock ?? 0,
        type: values.type ?? "",
        manufacturer: values.manufacturer?.trim().replace(/\s+/g, " ") || "",
        compositions: components
          .filter(c => c.name?.trim() && c.value != null && c.value !== "")
          .map(c => {
            const comp = {
              name: c.name.trim().replace(/\s+/g, " "),
              value: Number(c.value).toString(),
              unit: "%",
            }
            if (isEdit && c.id) comp.id = c.id
            return comp
          }),
        dosages: dosages
          .filter(d => d.amount !== "" && d.amount != null)
          .map(d => {
            const dos = {
              amount: d.amount.toString(),
              unit: quantityUnit,
              areaUnit: MEASUREMENT_UNITS.SQUARE_METER,
              target: d.target || "",
            }
            if (isEdit && d.id) dos.id = d.id
            return dos
          }),
      }

      if (isEdit) {
        await FertilizerService.updateFertilizer(editingItem.id, body, {
          errorHandling: "form",
        })
      } else {
        await FertilizerService.createFertilizer(body, {
          errorHandling: "form",
        })
      }

      clearDraft()
      navigate(ROUTER.FM_FERTILIZERS)
    } catch (error) {
      applyApiFieldErrors(form, error)
    } finally {
      setLoading(false)
    }
  }

  // ── 3. Effects ───────────────────────────────────────────────────────────────
  useEffect(() => {
    initFormData()
  }, [editingItem, isEdit, form, restoreDraft])

  useEffect(() => {
    saveDraft({
      ...form.getFieldsValue(true),
      __draftMeta: { components, dosages },
    })
  }, [components, dosages, form, saveDraft])

  // ── 4. Render JSX ───────────────────────────────────────────────────────────
  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      onValuesChange={(_, allValues) =>
        saveDraft({ ...allValues, __draftMeta: { components, dosages } })
      }
    >
      <SectionTitle>Thông Tin Cơ Bản</SectionTitle>

      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item
            name="name"
            label="Tên phân bón"
            rules={[
              { required: true, message: "Vui lòng nhập tên phân bón." },
              makeNameValidator({ label: "Tên phân bón" }),
            ]}
          >
            <AgriculturalInputCatalogAutocomplete
              catalogType="FERTILIZER"
              value={Form.useWatch("name", form)}
              onChange={value => form.setFieldValue("name", value)}
              onSelectCatalog={applyCatalog}
              placeholder="Tên phân bón"
              allowCreate={!isEdit}
            />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item
            name="manufacturer"
            label="Nhà Sản Xuất"
            rules={[
              makeNameValidator({ label: "Nhà sản xuất", required: false }),
            ]}
          >
            <Input placeholder="Nhà Sản Xuất" className="h-10 rounded-lg" />
          </Form.Item>
        </Col>

        <Col xs={24} sm={6}>
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
              placeholder="Số"
              className="w-full h-10 rounded-lg"
              formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              parser={v => v?.replace(/,*/g, "")}
            />
          </Form.Item>
        </Col>

        <Col xs={24} sm={6}>
          {isEdit ? (
            <>
              <Form.Item name="unit" hidden>
                <Input />
              </Form.Item>
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
              rules={[
                { required: true, message: "Vui lòng chọn đơn vị tính." },
              ]}
            >
              <Select
                placeholder="Chọn đơn vị"
                className="h-10"
                options={fertilizerUnitOptions}
                onChange={value => {
                  setQuantityUnit(value)
                  setDosages(current =>
                    current.map(d => ({
                      ...d,
                      unit: value,
                      areaUnit: MEASUREMENT_UNITS.SQUARE_METER,
                    })),
                  )
                }}
              />
            </Form.Item>
          )}
        </Col>

        <Col xs={24} sm={8}>
          <Form.Item
            name="type"
            label="Loại Phân Bón"
            getValueFromEvent={val => val ?? ""}
          >
            <Select
              allowClear
              placeholder="Loại Phân Bón"
              className="h-10"
              options={fertilizerTypeOptions}
            />
          </Form.Item>
        </Col>

        <Col xs={24}>
          <Form.Item
            name="description"
            label="Mô Tả"
            rules={[makeDescriptionValidator({ maxLength: 500 })]}
          >
            <Input.TextArea
              rows={3}
              placeholder="Mô Tả"
              className="rounded-lg"
            />
          </Form.Item>
        </Col>
      </Row>

      <SectionTitle>Thành Phần</SectionTitle>

      <Row gutter={8} className="mb-2 px-1">
        <Col flex="1 1 140px">
          <Text type="secondary" className="text-xs font-semibold">
            Tên thành phần
          </Text>
        </Col>
        <Col flex="1 1 100px">
          <Text type="secondary" className="text-xs font-semibold">
            Hàm lượng (%) <span className="text-red-500">*</span>
          </Text>
        </Col>
        <Col flex="1 1 80px">
          <Text type="secondary" className="text-xs font-semibold">
            Đơn Vị Tính <span className="text-red-500">*</span>
          </Text>
        </Col>
        <Col flex="none" style={{ width: 36 }} />
      </Row>

      <div className="space-y-2 mb-3">
        {components.map((comp, index) => (
          <div
            key={comp.id || index}
            className="flex items-center gap-2 rounded-lg bg-gray-50 border border-gray-100 p-2 mb-2"
          >
            <div style={{ flex: "1 1 140px" }}>
              <Input
                value={comp.name}
                onChange={e =>
                  handleComponentChange(index, "name", e.target.value)
                }
                placeholder="Tên thành phần (ví dụ: Đạm, Lân, Kali...)"
                className="h-9 rounded-lg"
              />
            </div>
            <div style={{ flex: "1 1 100px" }}>
              <InputNumber
                value={comp.value}
                onChange={val => handleComponentChange(index, "value", val)}
                placeholder="0.0"
                min={0}
                max={100}
                step={0.1}
                className="w-full h-9 rounded-lg"
              />
            </div>
            <div style={{ flex: "1 1 120px" }}>
              <Text className="inline-flex h-9 w-full items-center justify-center rounded-lg bg-white border border-gray-200 px-3 text-gray-700 font-medium">
                {comp.unit || "%"}
              </Text>
            </div>
            <Button
              type="text"
              danger
              icon={<MinusCircleOutlined />}
              onClick={() => handleRemoveComponent(index)}
              className="!h-9 !w-9 shrink-0 rounded-lg"
            />
          </div>
        ))}
      </div>

      <Button
        type="dashed"
        icon={<PlusOutlined />}
        onClick={handleAddComponent}
        className="w-full mb-5 rounded-lg border-green-400 text-green-700 hover:border-green-500"
      >
        Thêm Thành Phần
      </Button>

      <SectionTitle>Liều Lượng</SectionTitle>

      <div className="space-y-2 mb-3">
        {dosages.map((dosage, index) => (
          <div
            key={index}
            className="flex flex-wrap items-end gap-2 rounded-lg bg-gray-50 border border-gray-100 px-3 py-2"
          >
            <div style={{ flex: "2 1 140px" }}>
              <Text type="secondary" className="block mb-1 text-xs">
                Đối tượng
              </Text>
              <Select
                value={dosage.target || undefined}
                onChange={val => handleDosageChange(index, "target", val)}
                placeholder="Chọn đối tượng..."
                options={getDosageOptions(index)}
                loading={isCropsLoading}
                className="w-full h-9"
                allowClear
                showSearch
                optionFilterProp="label"
              />
            </div>
            <div style={{ flex: "1 1 120px" }}>
              <Text type="secondary" className="block mb-1 text-xs">
                Liều lượng
              </Text>
              <InputNumber
                value={dosage.amount}
                onChange={val => handleDosageChange(index, "amount", val)}
                placeholder="Số"
                min={0}
                className="w-full h-9 rounded-lg"
              />
            </div>
            {/* Đơn vị tính / Diện tích */}
            <div style={{ flex: "1 1 140px" }}>
              <Text type="secondary" className="block mb-1 text-xs">
                Đơn vị tính / Diện tích
              </Text>
              <Text className="inline-flex h-9 w-full items-center rounded-lg bg-gray-50 border border-gray-200 px-3 text-sm text-gray-700">
                {quantityUnit}/{formatAreaUnit(MEASUREMENT_UNITS.SQUARE_METER)}
              </Text>
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
          {isEdit ? "Lưu thay đổi" : "Thêm mới"}
        </Button>
      </div>
    </Form>
  )
}

export default FertilizerFormFields
