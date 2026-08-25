import React, { useState, useMemo, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  Button,
  Card,
  Form,
  Input,
  Select,
  Upload,
  Spin,
  message,
  Row,
  Col,
  Modal,
} from "antd"
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  EyeOutlined,
  SaveOutlined,
  UploadOutlined,
} from "@ant-design/icons"

import TitleCustom from "src/components/TitleCustom"
import { CropIcon } from "src/assets/icon/menu/MenuIcons"
import CropManagementService from "src/services/CropManagementService"
import CropCatalogService from "src/services/CropCatalogService"
import UploadService from "src/services/UploadService"
import ROUTER from "src/router/ROUTER"
import { isActiveCropCatalog } from "src/utils/cropCatalog"
import { applyApiFieldErrors } from "src/services/core/apiError"
import useFormDraft from "src/hooks/useFormDraft"
import { getFormDraftKey } from "src/utils/formDraftKeys"
import { makeDescriptionValidator, makeNameValidator } from "src/utils/helpers"

const CROP_FIELD_MAPPING = {
  Name: "name",
  name: "name",
  CropCatalogId: "cropCatalogId",
  cropCatalogId: "cropCatalogId",
  Description: "description",
  description: "description",
  ImageUrl: "imageUrl",
  imageUrl: "imageUrl",
}

const normalizeCropResponse = response => {
  const payload = response?.data ?? response ?? {}
  const data = payload?.data ?? payload
  const items = Array.isArray(data)
    ? data
    : data?.items ||
      data?.results ||
      data?.cropCatalogs ||
      data?.crops ||
      payload?.items ||
      payload?.results ||
      []

  return { items }
}

const CropCreate = () => {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const storageKey = getFormDraftKey("crop", "create")
  const { saveDraft, clearDraft, restoreDraft } = useFormDraft({
    form,
    storageKey,
  })

  const [uploadingCreate, setUploadingCreate] = useState(false)
  const [previewImage, setPreviewImage] = useState("")
  const [isPending, setIsPending] = useState(false)

  const [cropCatalogsData, setCropCatalogsData] = useState([])
  const [isCatalogsLoading, setIsCatalogsLoading] = useState(false)

  const watchedImageUrl = Form.useWatch("imageUrl", form)

  useEffect(() => {
    const draft = restoreDraft()
    if (draft?.data) form.setFieldsValue(draft.data)
  }, [form, restoreDraft])

  useEffect(() => {
    const fetchCropCatalogs = async () => {
      setIsCatalogsLoading(true)
      try {
        const response = await CropCatalogService.getCropCatalogs({
          PageIndex: 1,
          PageSize: 100,
          Status: "ACTIVE",
        })
        const items = normalizeCropResponse(response).items
        setCropCatalogsData(items.filter(isActiveCropCatalog))
      } catch (err) {
        if (!err?.code && err?.status === 405) {
          setCropCatalogsData([
            {
              id: "1",
              name: "Cây rau",
              description: "Các loại rau ăn lá",
              isActive: true,
            },
            {
              id: "2",
              name: "Cây củ",
              description: "Các loại củ quả",
              isActive: true,
            },
            {
              id: "3",
              name: "Cây ăn trái",
              description: "Các loại cây ăn quả",
              isActive: true,
            },
          ])
        } else {
          setCropCatalogsData([])
        }
      } finally {
        setIsCatalogsLoading(false)
      }
    }
    fetchCropCatalogs()
  }, [])

  const cropCatalogOptions = useMemo(() => {
    if (!cropCatalogsData) return []
    return cropCatalogsData.filter(isActiveCropCatalog).map(catalog => ({
      value: catalog.id || catalog.cropCatalogId,
      label: catalog.name || catalog.cropCatalogName,
    }))
  }, [cropCatalogsData])

  const cropTypeFormOptions = useMemo(() => {
    return cropCatalogOptions || []
  }, [cropCatalogOptions])

  const beforeCropImageUpload = file => {
    const isJpgOrPng = ["image/jpeg", "image/png", "image/webp"].includes(
      file.type,
    )
    if (!isJpgOrPng) {
      message.error("Chỉ chấp nhận ảnh JPG, PNG hoặc WEBP.")
    }
    const isLt5M = file.size / 1024 / 1024 < 5
    if (!isLt5M) {
      message.error("Dung lượng ảnh không được vượt quá 5MB.")
    }
    return isJpgOrPng && isLt5M
  }

  const handleCropImageUpload = async ({ file, onSuccess, onError }) => {
    try {
      setUploadingCreate(true)
      const formData = new FormData()
      formData.append("file", file)

      const response = await UploadService.uploadImage(formData)

      const imageUrl = response?.data?.url || response?.url
      if (!imageUrl) {
        throw new Error("Không nhận được đường dẫn ảnh sau khi upload.")
      }

      form.setFieldsValue({ imageUrl })
      onSuccess(response)
    } catch (error) {
      onError(error)
    } finally {
      setUploadingCreate(false)
    }
  }

  const handleCreate = async values => {
    setIsPending(true)
    const unitToDays = {
      days: 1,
      months: 30,
      years: 365,
    }

    const minDays = values.minHarvestDays
      ? values.minHarvestDays * unitToDays[values.minDurationUnit || "days"]
      : null

    const maxDays = values.maxHarvestDays
      ? values.maxHarvestDays * unitToDays[values.maxDurationUnit || "days"]
      : null

    const payload = {
      name: values.name.trim().replace(/\s+/g, " "),
      cropCatalogId: values.cropCatalogId || null,
      minHarvestDays: minDays,
      maxHarvestDays: maxDays,
      description: values.description?.trim().replace(/\s+/g, " ") || null,
      imageUrl: values.imageUrl || null,
    }

    try {
      await CropManagementService.createCrop(payload, {
        errorHandling: "form",
        fieldErrorMapping: CROP_FIELD_MAPPING,
      })
      clearDraft()
      navigate(ROUTER.FM_CROPS)
    } catch (error) {
      applyApiFieldErrors(form, error, CROP_FIELD_MAPPING)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          className="h-10 rounded-lg"
        >
          Quay lại
        </Button>
        <TitleCustom className="!mb-0 flex items-center gap-2">
          <CropIcon style={{ fontSize: "24px", color: "#15803d" }} />
          Thêm cây trồng
        </TitleCustom>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleCreate}
        onValuesChange={(_, allValues) => saveDraft(allValues)}
        onFinishFailed={() => {}}
        scrollToFirstError
      >
        <Row gutter={[24, 24]}>
          {/* Left Column: Basic Information in one card */}
          <Col xs={24} lg={16}>
            <Card
              className="rounded-lg shadow-sm"
              title={
                <span className="text-lg font-semibold text-green-600">
                  Thông tin cơ bản
                </span>
              }
            >
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-x-6 md:grid-cols-2">
                  <Form.Item
                    name="name"
                    label="Tên cây trồng"
                    className="!mb-0"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập tên cây trồng.",
                      },
                      makeNameValidator({ label: "Tên cây trồng" }),
                    ]}
                  >
                    <Input
                      className="rounded-lg"
                      placeholder="Nhập tên cây trồng"
                    />
                  </Form.Item>

                  <Form.Item
                    name="cropCatalogId"
                    label="Nhóm cây"
                    className="!mb-0"
                    rules={[
                      { required: true, message: "Vui lòng chọn nhóm cây." },
                    ]}
                  >
                    <Select
                      className="h-10 w-full"
                      placeholder="Chọn nhóm cây"
                      loading={isCatalogsLoading}
                      options={cropTypeFormOptions}
                      showSearch
                      filterOption={(input, option) =>
                        (option?.label ?? "")
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      disabled={
                        !cropTypeFormOptions || cropTypeFormOptions.length === 0
                      }
                    />
                  </Form.Item>
                </div>

                <Form.Item
                  name="description"
                  label="Mô tả"
                  className="!mb-0"
                  rules={[makeDescriptionValidator({ maxLength: 200 })]}
                >
                  <Input.TextArea
                    rows={3}
                    className="rounded-lg"
                    placeholder="Nhập mô tả"
                  />
                </Form.Item>
              </div>
            </Card>
          </Col>

          {/* Right Column */}
          <Col xs={24} lg={8}>
            <div className="space-y-6">
              <Card
                className="rounded-lg shadow-sm"
                title={
                  <span className="text-lg font-semibold text-green-600">
                    Ảnh minh họa
                  </span>
                }
              >
                <Form.Item name="imageUrl" className="mb-0">
                  <div className="space-y-3">
                    <Upload
                      accept="image/png,image/jpeg,image/webp"
                      showUploadList={false}
                      beforeUpload={beforeCropImageUpload}
                      customRequest={options => handleCropImageUpload(options)}
                    >
                      <Button
                        icon={<UploadOutlined />}
                        loading={uploadingCreate}
                        className="w-full rounded-lg"
                      >
                        {uploadingCreate ? "Đang tải lên..." : "Tải ảnh lên"}
                      </Button>
                    </Upload>

                    {uploadingCreate && !watchedImageUrl && (
                      <div className="flex h-48 w-full items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50">
                        <Spin />
                      </div>
                    )}

                    {watchedImageUrl && !uploadingCreate && (
                      <div className="group relative h-48 w-full overflow-hidden rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 p-1">
                        <img
                          src={watchedImageUrl}
                          alt="Ảnh minh họa"
                          className="h-full w-full rounded-md object-cover"
                        />
                        <div className="absolute inset-1 flex items-center justify-center gap-2 rounded-md bg-black/45 opacity-0 transition-opacity group-hover:opacity-100">
                          <Button
                            type="text"
                            size="small"
                            icon={<EyeOutlined />}
                            className="!h-8 !w-8 !text-white hover:!bg-white/20"
                            onClick={() => setPreviewImage(watchedImageUrl)}
                          />
                          <Button
                            type="text"
                            size="small"
                            icon={<DeleteOutlined />}
                            className="!h-8 !w-8 !text-white hover:!bg-white/20"
                            onClick={() =>
                              form.setFieldsValue({ imageUrl: "" })
                            }
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </Form.Item>
              </Card>

              {/* Actions below Card */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => navigate(-1)}
                  className="h-11 w-full rounded-lg font-semibold"
                >
                  Hủy
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={isPending}
                  disabled={uploadingCreate}
                  className="h-11 w-full rounded-lg bg-green-500 font-semibold shadow-lg shadow-green-100"
                >
                  Thêm mới
                </Button>
              </div>
            </div>
          </Col>
        </Row>
      </Form>

      {/* Modal xem ảnh */}
      <Modal
        open={!!previewImage}
        onCancel={() => setPreviewImage(null)}
        footer={null}
        centered
        width="auto"
        styles={{
          body: { padding: 0 },
        }}
        closeIcon={
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70">
            ×
          </span>
        }
      >
        <div className="relative max-h-[80vh] max-w-[90vw]">
          <img
            src={previewImage}
            alt="Xem ảnh"
            className="max-h-[80vh] max-w-full rounded-lg object-contain"
            style={{ display: "block" }}
          />
        </div>
      </Modal>
    </div>
  )
}

export default CropCreate
