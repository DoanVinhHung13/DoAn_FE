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
} from "antd"
import React from "react"
import { useNavigate } from "react-router-dom"
import { getQuantityUnit, MEASUREMENT_UNITS } from "src/constants/measurementUnits"
import ROUTER from "src/router/ROUTER"
import PesticideService from "src/services/PesticideService"

import SectionTitle from "src/components/Common/SectionTitle"
import { useCropOptions } from "src/hooks/useCropOptions"

const resolveCropValue = (target, cropOptions) => {
  if (target === null || target === undefined || target === "") return undefined

  const rawTarget = Array.isArray(target) ? target[0] : target
  const normalizedTarget = String(rawTarget).trim().toLowerCase()
  const option = cropOptions.find(item =>
    [item.value, item.label].some(value =>
      String(value).trim().toLowerCase() === normalizedTarget,
    ),
  )

  return option?.value || rawTarget
}

const normalizeCropTarget = value => String(value ?? "").trim().toLowerCase()

const getCropTargetKey = (target, cropOptions) => {
  const normalizedTarget = normalizeCropTarget(target)
  if (!normalizedTarget) return ""

  const option = cropOptions.find(item =>
    [item.value, item.label].some(value => normalizeCropTarget(value) === normalizedTarget),
  )

  return normalizeCropTarget(option?.value ?? target)
}

const CropProtectionFormFields = ({ isEdit, editingItem }) => {
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const [loading, setLoading] = React.useState(false)
  const { cropOptions, isCropsLoading } = useCropOptions()
  const usages = Form.useWatch("usages", form) || []

  const UNIT_OPTIONS = [
    { value: MEASUREMENT_UNITS.LITER, label: MEASUREMENT_UNITS.LITER },
    { value: MEASUREMENT_UNITS.KILOGRAM, label: MEASUREMENT_UNITS.KILOGRAM },
  ]
  const [quantityUnit, setQuantityUnit] = React.useState(MEASUREMENT_UNITS.LITER)

  React.useEffect(() => {
    if (isEdit) {
      const selectedUnit = getQuantityUnit(editingItem.unit, MEASUREMENT_UNITS.LITER)
      setQuantityUnit(selectedUnit)
      form.setFieldsValue({
        name: editingItem.name || "",
        manufacturer: editingItem.manufacturer || "",
        supplier: editingItem.supplier || "",
        minimumStock: editingItem.minInventory ?? editingItem.minimumStock ?? 0,
        inventoryQuantity: editingItem.inventoryQuantity ?? 0,
        inventoryUnit: selectedUnit,
        unit: selectedUnit, // Đơn vị tính (kho)
        usageUnit: selectedUnit, // Đơn vị sử dụng
        description: editingItem.description || "",
        usages:
          editingItem.usages && editingItem.usages.length > 0
            ? editingItem.usages.map(u => {
                return {
                  ...u,
                  targetCrop: resolveCropValue(u.targetCrop ?? u.target, cropOptions),
                  dosage: u.dosage,
                  dosageUnit: selectedUnit,
                  area: u.area,
                  areaUnit: MEASUREMENT_UNITS.SQUARE_METER,
                  isolationDays: u.quarantineDays ?? u.isolationDays,
                }
              })
            : [{}],
      })
    } else {
      setQuantityUnit(MEASUREMENT_UNITS.LITER)
      form.resetFields()
      form.setFieldsValue({
        unit: MEASUREMENT_UNITS.LITER,
        usageUnit: MEASUREMENT_UNITS.LITER,
        inventoryUnit: MEASUREMENT_UNITS.LITER,
        usages: [{}],
      })
    }
  }, [cropOptions, editingItem, isEdit, form])

  const handleSubmit = async values => {
    try {
      const selectedTargets = (values.usages || [])
        .map(usage => getCropTargetKey(usage.targetCrop, cropOptions))
        .filter(Boolean)
      if (new Set(selectedTargets).size !== selectedTargets.length) {
        message.error("Mỗi cây chỉ được khai báo một liều lượng.")
        return
      }

      setLoading(true)

      const body = {
        name: values.name?.trim(),
        manufacturer: values.manufacturer?.trim() || "",
        supplier: values.supplier?.trim() || "",
        minInventory: values.minimumStock || 0,
        inventoryQuantity: values.inventoryQuantity ?? 0,
        inventoryUnit: values.inventoryUnit || values.unit || "",
        unit: values.unit || quantityUnit, // Đơn vị tính (kho)
        usageUnit: values.unit || quantityUnit, // Đơn vị sử dụng cố định theo vật tư
        description: values.description?.trim() || "",
        isActive: isEdit ? editingItem.isActive : true,
        usages: (values.usages || []).map(u => {
          const usageObj = {
            dosage: u.dosage || 0,
            dosageUnitId: quantityUnit,
            area: u.area || 0,
            areaUnitId: MEASUREMENT_UNITS.SQUARE_METER,
            targetCrop: Array.isArray(u.targetCrop)
              ? u.targetCrop.join(", ")
              : (u.targetCrop || u.target || ""),
            quarantineDays: u.isolationDays || 0,
          }
          if (isEdit && u.id) usageObj.id = u.id
          return usageObj
        }),
      }

      let res
      if (isEdit) {
        res = await PesticideService.updatePesticide(editingItem.id, body)
      } else {
        res = await PesticideService.createPesticide(body)
      }

      if (res?.success === false) {
        const errMsg = (res.message || "").toLowerCase()
        if (errMsg.includes("code") || errMsg.includes("mã")) {
          form.setFields([{ name: "code", errors: ["Mã nông dược đã tồn tại."] }])
        }
        // axios interceptor handles error notification
        return
      }

      navigate(ROUTER.FM_PESTICIDES)
    } catch {
      // axios interceptor handles error notification
    } finally {
      setLoading(false)
    }
  }

  const getUsageCropOptions = index => {
    const currentTargetKey = getCropTargetKey(usages[index]?.targetCrop, cropOptions)
    const targetsInOtherRows = new Set(
      usages
        .filter((_, usageIndex) => usageIndex !== index)
        .map(usage => getCropTargetKey(usage?.targetCrop, cropOptions))
        .filter(Boolean),
    )

    return cropOptions.filter(option => {
      const optionKeys = [option.value, option.label].map(normalizeCropTarget).filter(Boolean)
      return optionKeys.includes(currentTargetKey) ||
        !optionKeys.some(optionKey => targetsInOtherRows.has(optionKey))
    })
  }

  return (
    <Form form={form} layout="vertical" onFinish={handleSubmit} className="">
      {/* ── Basic Info ── */}
      <SectionTitle>Thông Tin Cơ Bản</SectionTitle>
      <Row gutter={16}>
        <Col xs={24}>
          <Form.Item
            name="name"
            label={
              <span className="font-semibold text-gray-700">
                Tên nông dược{" "}
              </span>
            }
            rules={[{ required: true, message: "Bắt buộc" }]}
          >
            <Input placeholder="Nhập tên..." className="h-10 rounded-xl" />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item
            name="manufacturer"
            label={
              <span className="font-semibold text-gray-700">Nhà Sản Xuất</span>
            }
          >
            <Input
              placeholder="Nhập nhà sản xuất..."
              className="h-10 rounded-xl"
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            name="supplier"
            label={
              <span className="font-semibold text-gray-700">Nhà Cung Cấp</span>
            }
          >
            <Input
              placeholder="Nhập nhà cung cấp..."
              className="h-10 rounded-xl"
            />
          </Form.Item>
        </Col>

        <Col xs={24} md={8}>
          <Form.Item
            name="minimumStock"
            label={
              <span className="font-semibold text-gray-700">
                Tồn Kho tối thiểu
              </span>
            }
          >
            <InputNumber
              min={0}
              placeholder="0"
              className="w-full h-10 rounded-xl"
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          {isEdit ? (
            <>
              <Form.Item name="unit" hidden><Input /></Form.Item>
              <Form.Item label="Đơn vị tính (Kho)">
                <span className="inline-flex h-10 items-center rounded-xl bg-gray-50 px-3 font-semibold text-gray-700">
                  {quantityUnit}
                </span>
              </Form.Item>
            </>
          ) : (
            <Form.Item name="unit" label="Đơn vị tính (Kho)" rules={[{ required: true, message: "Bắt buộc" }]}>
              <Select
                options={UNIT_OPTIONS}
                placeholder="Chọn..."
                className="h-10 rounded-xl"
                onChange={(value) => {
                  setQuantityUnit(value)
                  form.setFieldValue("usageUnit", value)
                  form.setFieldValue("inventoryUnit", value)
                  const usages = form.getFieldValue("usages") || []
                  form.setFieldValue("usages", usages.map(u => ({
                    ...u,
                    dosageUnit: value,
                    areaUnit: MEASUREMENT_UNITS.SQUARE_METER,
                  })))
                }}
              />
            </Form.Item>
          )}
        </Col>
        <Col xs={24} md={8}>
          <Form.Item name="usageUnit" hidden><Input /></Form.Item>
          <Form.Item label="Đơn vị sử dụng">
            <span className="inline-flex h-10 items-center rounded-xl bg-gray-50 px-3 font-semibold text-gray-700">
              {quantityUnit}
            </span>
          </Form.Item>
        </Col>

        <Col xs={24}>
          <Form.Item
            name="description"
            label={<span className="font-semibold text-gray-700">Mô Tả</span>}
            className="mt-4"
          >
            <Input.TextArea
              rows={4}
              placeholder="Nhập mô tả chi tiết..."
              className="rounded-xl"
            />
          </Form.Item>
        </Col>
      </Row>

      {/* ── Usages (Cách sử dụng) ── */}
      <SectionTitle>Liều Lượng</SectionTitle>
      <Form.List name="usages">
        {(fields, { add, remove }) => (
          <>
            <div className="mt-4 mb-3 space-y-6">
              {fields.map(({ key, name, ...restField }, index) => (
                <div
                  key={key}
                  className="relative p-5 border border-gray-200 shadow-sm py-9 bg-gray-50 rounded-2xl"
                >
                  <div className="absolute px-3 py-1 text-xs font-bold border rounded-full shadow-sm -top-1 left-4 bg-emerald-100 text-emerald-700 border-emerald-200 shadow-emerald-50">
                    Liều lượng {index + 1}
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
                        name={[name, "targetCrop"]}
                        label={<>Cây trồng</>}
                        rules={[{ required: true, message: "Vui lòng chọn cây trồng" }]}
                        className="mb-3"
                      >
                        <Select
                          options={getUsageCropOptions(index)}
                          loading={isCropsLoading}
                          placeholder="Chọn cây trồng..."
                          className="w-full text-sm"
                          allowClear
                          showSearch
                          optionFilterProp="label"
                        />
                      </Form.Item>
                    </Col>
                    <div className="hidden">
                    <Col xs={24} sm={12} md={6}>
                      <Form.Item
                        {...restField}
                        name={[name, "legacyTargetCrop"]}
                        label={<>Đối tượng SD </>}
                        className="mb-3"
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
                        name={[name, "targetPest"]}
                        label={<>Đối tượng DT </>}
                        className="mb-3"
                      >
                        <Input
                          placeholder="Rầy nâu..."
                          className="text-sm rounded-lg h-9"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={24} md={12}>
                      <Form.Item
                        label={<>Lượng nước pha loãng (Tỉ lệ nông dược : nước) </>}
                        className="mb-3"
                      >
                        <div className="flex items-center gap-3">
                          {/* Nông dược */}
                          <div className="flex items-center flex-1 gap-2">
                            <Form.Item
                              {...restField}
                              name={[name, "chemicalRatio"]}
                              className="flex-1 mb-0"
                            >
                              <InputNumber
                                min={0}
                                placeholder="Số"
                                className="w-full text-sm rounded-lg h-9"
                              />
                            </Form.Item>
                            <Form.Item {...restField} name={[name, "chemicalUnit"]} hidden>
                              <Input />
                            </Form.Item>
                            <span className="inline-flex h-9 w-[90px] items-center justify-center rounded-lg bg-white text-sm text-gray-700">
                              %
                            </span>
                          </div>

                          {/* Dấu hai chấm */}
                          <span className="pb-1 text-lg font-bold leading-none text-gray-400">
                            :
                          </span>

                          {/* Nước */}
                          <div className="flex items-center flex-1 gap-2">
                            <Form.Item
                              {...restField}
                              name={[name, "waterRatio"]}
                              className="flex-1 mb-0"
                            >
                              <InputNumber
                                min={0}
                                placeholder="Số"
                                className="w-full text-sm rounded-lg h-9"
                              />
                            </Form.Item>
                            <Form.Item {...restField} name={[name, "waterUnit"]} hidden>
                              <Input />
                            </Form.Item>
                            <span className="inline-flex h-9 w-[90px] items-center justify-center rounded-lg bg-white text-sm text-gray-700">
                              {MEASUREMENT_UNITS.LITER}
                            </span>
                          </div>
                        </div>
                      </Form.Item>
                    </Col>
                    </div>
                    <Col xs={24} sm={12} md={6}>
                      <Form.Item label={<>Liều lượng </>} className="mb-0">
                        <div className="flex items-center gap-2">
                          <Form.Item
                            {...restField}
                            name={[name, "dosage"]}
                            className="flex-1 mb-0"
                            rules={[{ required: true, message: "Vui lòng nhập liều lượng" }]}
                          >
                            <InputNumber
                              min={0}
                              placeholder="Số"
                              className="w-full text-sm rounded-lg h-9"
                            />
                          </Form.Item>
                          <Form.Item {...restField} name={[name, "dosageUnit"]} hidden>
                            <Input />
                          </Form.Item>
                          <span className="inline-flex h-9 w-[90px] items-center justify-center rounded-lg bg-white text-sm text-gray-700">
                            {quantityUnit}
                          </span>
                        </div>
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                      <Form.Item label={<>Diện tích </>} className="mb-0">
                        <div className="flex items-center gap-2">
                          <Form.Item
                            {...restField}
                            name={[name, "area"]}
                            className="flex-1 mb-0"
                            rules={[{ required: true, message: "Vui lòng nhập diện tích" }]}
                          >
                            <InputNumber
                              min={0}
                              placeholder="Số"
                              className="w-full text-sm rounded-lg h-9"
                            />
                          </Form.Item>
                          <Form.Item {...restField} name={[name, "areaUnit"]} hidden>
                            <Input />
                          </Form.Item>
                          <span className="inline-flex h-9 w-[90px] items-center justify-center rounded-lg bg-white text-sm text-gray-700">
                            {MEASUREMENT_UNITS.SQUARE_METER}
                          </span>
                        </div>
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                      <Form.Item
                        {...restField}
                        name={[name, "isolationDays"]}
                        label={<>Cách ly (Ngày) </>}
                        className="mb-0"
                        rules={[{ required: true, message: "Vui lòng nhập số ngày cách ly" }]}
                      >
                        <InputNumber
                          min={0}
                          placeholder="Ngày"
                          className="w-full text-sm rounded-lg h-9"
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
              onClick={() => add({
                chemicalUnit: "%",
                waterUnit: MEASUREMENT_UNITS.LITER,
                dosageUnit: quantityUnit,
                areaUnit: MEASUREMENT_UNITS.SQUARE_METER,
              })}
              className="w-full mb-5 text-green-700 border-green-400 rounded-lg hover:border-green-500"
            >
              Thêm Liều lượng
            </Button>
          </>
        )}
      </Form.List>

      {/* ── Footer actions ── */}
      <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-gray-100">
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
          className="h-10 px-6 font-bold border-0 shadow-lg bg-emerald-600 rounded-xl shadow-emerald-100"
        >
          {isEdit ? "Lưu thay đổi" : "Thêm mới"}
        </Button>
      </div>
    </Form>
  )
}

export default CropProtectionFormFields
