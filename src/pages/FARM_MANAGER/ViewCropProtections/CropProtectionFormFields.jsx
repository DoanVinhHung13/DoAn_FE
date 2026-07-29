import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons"
import {
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
} from "antd"
import React from "react"
import { useNavigate } from "react-router-dom"
import { SYSTEM_KEY } from "src/constants/systemKey"
import { useSystemKey } from "src/hooks/useSystemKey"
import ROUTER from "src/router/ROUTER"
import PesticideService from "src/services/PesticideService"

import SectionTitle from "src/components/Common/SectionTitle"
import { useCropOptions } from "src/hooks/useCropOptions"

const CropProtectionFormFields = ({ isEdit, editingItem }) => {
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const [loading, setLoading] = React.useState(false)
  const { cropOptions, isCropsLoading } = useCropOptions()

  const { getCombo } = useSystemKey()
  const UNIT_OPTIONS = getCombo(SYSTEM_KEY.FERTILIZER_UNIT).map(opt => ({
    value: opt.codeValue || opt.value,
    label: opt.label || opt.description,
  }))
  const AREA_UNIT_OPTIONS = getCombo(SYSTEM_KEY.AREA_UNIT).map(opt => ({
    value: opt.codeValue || opt.value,
    label: opt.label || opt.description,
  }))

  React.useEffect(() => {
    if (isEdit) {
      form.setFieldsValue({
        name: editingItem.name || "",
        manufacturer: editingItem.manufacturer || "",
        supplier: editingItem.supplier || "",
        minimumStock: editingItem.minInventory ?? editingItem.minimumStock ?? 0,
        inventoryQuantity: editingItem.inventoryQuantity ?? 0,
        inventoryUnit: editingItem.inventoryUnit || editingItem.unit || undefined,
        unit: editingItem.unit || undefined, // Đơn vị tính (kho)
        usageUnit: editingItem.usageUnit || undefined, // Đơn vị sử dụng
        description: editingItem.description || "",
        usages:
          editingItem.usages && editingItem.usages.length > 0
            ? editingItem.usages.map(u => {
                return {
                  ...u,
                  targetCrop:
                    typeof u.targetCrop === "string"
                      ? u.targetCrop
                          .split(",")
                          .map(s => s.trim())
                          .filter(Boolean)
                      : u.targetCrop,
                  chemicalRatio: u.concentration
                    ? Number(u.concentration)
                    : null,
                  chemicalUnit: u.concentrationUnit || undefined,
                  waterRatio: u.dilutionVolume
                    ? Number(u.dilutionVolume)
                    : null,
                  waterUnit: u.dilutionUnit || undefined,
                  dosage: u.dosage,
                  dosageUnit: u.dosageUnit || undefined,
                  area: u.area,
                  areaUnit: u.areaUnit || undefined,
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

  const handleSubmit = async values => {
    try {
      setLoading(true)

      const body = {
        name: values.name?.trim(),
        manufacturer: values.manufacturer?.trim() || "",
        supplier: values.supplier?.trim() || "",
        minInventory: values.minimumStock || 0,
        inventoryQuantity: values.inventoryQuantity ?? 0,
        inventoryUnit: values.inventoryUnit || values.unit || "",
        unit: values.unit || "", // Đơn vị tính (kho)
        usageUnit: values.usageUnit || "", // Đơn vị sử dụng
        description: values.description?.trim() || "",
        isActive: isEdit ? editingItem.isActive : true,
        usages: (values.usages || []).map(u => {
          const usageObj = {
            targetCrop: Array.isArray(u.targetCrop)
              ? u.targetCrop.join(", ")
              : u.targetCrop || "",
            targetPest: u.targetPest || "",
            concentration:
              u.chemicalRatio != null ? String(u.chemicalRatio) : "",
            concentrationUnit: u.chemicalUnit || "",
            dilutionVolume: u.waterRatio != null ? String(u.waterRatio) : "",
            dilutionUnit: u.waterUnit || "",
            dosage: u.dosage || 0,
            dosageUnit: u.dosageUnit || "",
            area: u.area || 0,
            areaUnit: u.areaUnit || "",
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
          <Form.Item
            name="unit"
            label={
              <span className="font-semibold text-gray-700">
                Đơn vị tính (Kho)
              </span>
            }
          >
            <Select
              options={UNIT_OPTIONS}
              placeholder="Chọn..."
              className="h-10 rounded-xl"
              allowClear
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item
            name="usageUnit"
            label={
              <span className="font-semibold text-gray-700">
                Đơn vị sử dụng
              </span>
            }
          >
            <Select
              options={UNIT_OPTIONS}
              placeholder="Chọn..."
              className="h-10 rounded-xl"
              allowClear
            />
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
      <SectionTitle>Cách Sử Dụng</SectionTitle>
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
                        name={[name, "targetCrop"]}
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
                            <Form.Item
                              {...restField}
                              name={[name, "chemicalUnit"]}
                              className="mb-0 w-[90px]"
                            >
                              <Select
                                options={UNIT_OPTIONS}
                                placeholder="Đơn vị"
                                className="text-sm rounded-lg h-9"
                                allowClear
                              />
                            </Form.Item>
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
                            <Form.Item
                              {...restField}
                              name={[name, "waterUnit"]}
                              className="mb-0 w-[90px]"
                            >
                              <Select
                                options={UNIT_OPTIONS}
                                placeholder="ĐV"
                                className="text-sm rounded-lg h-9"
                                allowClear
                              />
                            </Form.Item>
                          </div>
                        </div>
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                      <Form.Item label={<>Liều lượng </>} className="mb-0">
                        <div className="flex items-center gap-2">
                          <Form.Item
                            {...restField}
                            name={[name, "dosage"]}
                            className="flex-1 mb-0"
                          >
                            <InputNumber
                              min={0}
                              placeholder="Số"
                              className="w-full text-sm rounded-lg h-9"
                            />
                          </Form.Item>
                          <Form.Item
                            {...restField}
                            name={[name, "dosageUnit"]}
                            className="mb-0 w-[90px]"
                          >
                            <Select
                              options={UNIT_OPTIONS}
                              placeholder="Chọn"
                              className="text-sm rounded-lg h-9"
                              allowClear
                            />
                          </Form.Item>
                        </div>
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                      <Form.Item label={<>Diện tích </>} className="mb-0">
                        <div className="flex items-center gap-2">
                          <Form.Item
                            {...restField}
                            name={[name, "area"]}
                            className="flex-1 mb-0"
                          >
                            <InputNumber
                              min={0}
                              placeholder="Số"
                              className="w-full text-sm rounded-lg h-9"
                            />
                          </Form.Item>
                          <Form.Item
                            {...restField}
                            name={[name, "areaUnit"]}
                            className="mb-0 w-[90px]"
                          >
                            <Select
                              options={AREA_UNIT_OPTIONS}
                              placeholder="Chọn"
                              className="text-sm rounded-lg h-9"
                              allowClear
                            />
                          </Form.Item>
                        </div>
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                      <Form.Item
                        {...restField}
                        name={[name, "isolationDays"]}
                        label={<>Cách ly (Ngày) </>}
                        className="mb-0"
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
              onClick={() => add()}
              className="w-full mb-5 text-green-700 border-green-400 rounded-lg hover:border-green-500"
            >
              Thêm Cách sử dụng
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
