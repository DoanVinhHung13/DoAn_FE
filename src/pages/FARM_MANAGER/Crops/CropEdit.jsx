import React, { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  Alert,
  Button,
  Card,
  Form,
  Input,
  Modal,
  Select,
  Spin,
  Upload,
  Row,
  Col,
} from "antd"
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  EyeOutlined,
  SaveOutlined,
  UploadOutlined,
} from "@ant-design/icons"
import { Sprout } from "lucide-react"

import TitleCustom from "src/components/TitleCustom"
import { CropIcon } from "src/assets/icon/menu/MenuIcons"
import CropManagementService from "src/services/CropManagementService"
import {
  applyApiFieldErrors,
  isNotFoundError,
} from "src/services/core/apiError"
import CropCatalogService from "src/services/CropCatalogService"
import UploadService from "src/services/UploadService"
import ROUTER from "src/router/ROUTER"
import { useSystemKey } from "src/hooks/useSystemKey"
import { SYSTEM_KEY } from "src/constants/systemKey"
import { isActiveCropCatalog } from "src/utils/cropCatalog"
import useFormDraft from "src/hooks/useFormDraft"
import { getFormDraftKey } from "src/utils/formDraftKeys"
import { makeDescriptionValidator, makeNameValidator } from "src/utils/helpers"

const EMPTY_MESSAGE = "Không tìm thấy thông tin cây trồng."
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

const CropEdit = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [form] = Form.useForm()
  const storageKey = getFormDraftKey("crop", "edit", id)
  const { saveDraft, clearDraft, restoreDraft } = useFormDraft({
    form,
    storageKey,
  })
  const watchedImageUrl = Form.useWatch("imageUrl", form)
  const [previewImage, setPreviewImage] = useState(null)
  const [uploading, setUploading] = useState(false)

  const { getCombo } = useSystemKey()
  const cropTypeOptions = getCombo(SYSTEM_KEY.CROP_TYPE)

  const [cropDetail, setCropDetail] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)

  const [cropCatalogsData, setCropCatalogsData] = useState([])
  const [isCatalogsLoading, setIsCatalogsLoading] = useState(false)

  const [updatePending, setUpdatePending] = useState(false)

  const fetchCropDetail = async () => {
    if (!id) return
    setIsLoading(true)
    setIsError(false)
    try {
      const response = await CropManagementService.getCropById(id, {
        errorHandling: "component",
      })
      const payload = response?.data ?? {}
      setCropDetail(payload?.data ?? payload)
    } catch {
      setIsError(true)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCropCatalogs = async () => {
    setIsCatalogsLoading(true)
    try {
      const response = await CropCatalogService.getCropCatalogs({
        PageIndex: 1,
        PageSize: 100,
        Status: "ACTIVE",
      })
      const payload = response?.data ?? response ?? {}
      const data = payload?.data ?? payload
      const items = Array.isArray(data)
        ? data
        : data?.items ||
          data?.results ||
          data?.crops ||
          data?.cropCatalogs ||
          payload?.items ||
          payload?.results ||
          []
      setCropCatalogsData(items.filter(isActiveCropCatalog))
    } catch {
      setCropCatalogsData([])
    } finally {
      setIsCatalogsLoading(false)
    }
  }

  useEffect(() => {
    fetchCropDetail()
  }, [id])

  useEffect(() => {
    fetchCropCatalogs()
  }, [])

  const cropCatalogOptions = useMemo(() => {
    if (!cropCatalogsData || cropCatalogsData.length === 0) {
      return []
    }
    return cropCatalogsData.filter(isActiveCropCatalog).map(catalog => ({
      value: catalog.id || catalog.cropCatalogId,
      label: catalog.name || catalog.cropCatalogName,
    }))
  }, [cropCatalogsData])

  const cropTypeFormOptions = useMemo(() => {
    return cropCatalogOptions || []
  }, [cropCatalogOptions])

  const calculateUnit = days => {
    if (!days) return { value: null, unit: "days" }
    if (days % 365 === 0) return { value: days / 365, unit: "years" }
    if (days % 30 === 0) return { value: days / 30, unit: "months" }
    return { value: days, unit: "days" }
  }

  useEffect(() => {
    if (cropDetail) {
      const minData = calculateUnit(cropDetail.minHarvestDays)
      const maxData = calculateUnit(cropDetail.maxHarvestDays)

      const serverValues = {
        name: cropDetail.name || "",
        cropCatalogId: cropDetail.cropCatalogId || "",
        minHarvestDays: minData.value,
        minDurationUnit: minData.unit,
        maxHarvestDays: maxData.value,
        maxDurationUnit: maxData.unit,
        description: cropDetail.description || "",
        imageUrl: cropDetail.imageUrl || "",
      }
      const draft = restoreDraft()
      form.setFieldsValue({ ...serverValues, ...(draft?.data || {}) })
    }
  }, [cropDetail, form, restoreDraft])

  const handleUpdate = async values => {
    setUpdatePending(true)
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
      imageUrl: values.imageUrl?.trim() || "",
      isActive:
        typeof cropDetail?.isActive === "boolean" ? cropDetail.isActive : true,
    }

    try {
      await CropManagementService.updateCrop(id, payload, {
        errorHandling: "form",
        fieldErrorMapping: CROP_FIELD_MAPPING,
      })
      clearDraft()
      navigate(ROUTER.FM_CROPS)
    } catch (error) {
      if (isNotFoundError(error)) {
        navigate(ROUTER.FM_CROPS)
        return
      }
      applyApiFieldErrors(form, error, CROP_FIELD_MAPPING)
    } finally {
      setUpdatePending(false)
    }
  }

  const beforeCropImageUpload = file => {
    const isJpgOrPng =
      file.type === "image/jpeg" ||
      file.type === "image/png" ||
      file.type === "image/webp"
    const isLt5M = file.size / 1024 / 1024 < 5
    return isJpgOrPng && isLt5M
  }

  const handleCropImageUpload = async ({ file, onSuccess, onError }) => {
    setUploading(true)

    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await UploadService.uploadImage(formData)

      const payload = response?.data?.data || response?.data || {}

      const imageUrl =
        payload.imageUrl ||
        payload.url ||
        payload.secureUrl ||
        payload.fileUrl ||
        payload.path

      if (!imageUrl) {
        throw new Error("Không nhận được đường dẫn ảnh sau khi upload.")
      }

      form.setFieldsValue({ imageUrl })
      onSuccess(response)
    } catch (error) {
      onError(error)
    } finally {
      setUploading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spin size="large" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(ROUTER.FM_CROPS)}
            className="h-10"
          >
            Quay lại
          </Button>
          <TitleCustom className="!mb-0">Chỉnh sửa cây trồng</TitleCustom>
        </div>
        <Alert
          type="error"
          message="Không thể tải thông tin cây trồng."
          action={
            <Button size="small" onClick={fetchCropDetail}>
              Thử lại
            </Button>
          }
        />
      </div>
    )
  }

  if (!cropDetail) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(ROUTER.FM_CROPS)}
            className="h-10"
          >
            Quay lại
          </Button>
          <TitleCustom className="!mb-0">Chỉnh sửa cây trồng</TitleCustom>
        </div>
        <Card>
          <Alert type="warning" message={EMPTY_MESSAGE} />
        </Card>
      </div>
    )
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
          Chỉnh sửa cây trồng
        </TitleCustom>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleUpdate}
        onValuesChange={(_, allValues) => saveDraft(allValues)}
        onFinishFailed={() => {}}
        scrollToFirstError
      >
        <Row gutter={[24, 24]}>
          {/* Left Column: Basic & Detailed Information in one card */}
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
                      className="!h-11 rounded-lg"
                      placeholder="Nhập tên cây trồng"
                    />
                  </Form.Item>

                  <Form.Item
                    name="cropCatalogId"
                    label="Danh mục cây trồng"
                    className="!mb-0"
                    rules={[
                      { required: true, message: "Vui lòng chọn danh mục." },
                    ]}
                  >
                    <Select
                      className="!h-11 w-full rounded-lg [&_.ant-select-selector]:!h-11 [&_.ant-select-selector]:!rounded-lg"
                      placeholder="Chọn danh mục"
                      loading={isCatalogsLoading && !cropTypeOptions?.length}
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
                    placeholder="Nhập mô tả về cây trồng"
                  />
                </Form.Item>
              </div>
            </Card>
          </Col>

          {/* Right Column: Image Upload & Actions */}
          <Col xs={24} lg={8}>
            <div className="space-y-4">
              <Card
                className="rounded-lg shadow-sm"
                title={
                  <span className="text-lg font-semibold text-green-600">
                    Ảnh minh họa
                  </span>
                }
              >
                <Form.Item name="imageUrl" className="mb-0">
                  <div className="flex flex-col items-center space-y-3">
                    {watchedImageUrl && !uploading && (
                      <div className="group relative h-60 w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-50 p-1">
                        <img
                          src={watchedImageUrl}
                          alt="Ảnh minh họa cây trồng"
                          className="h-full w-full rounded-lg object-cover"
                        />
                        <div className="absolute inset-1 flex items-center justify-center gap-3 rounded-lg bg-black/45 opacity-0 transition-opacity group-hover:opacity-100">
                          <Button
                            type="text"
                            icon={<EyeOutlined />}
                            className="!h-9 !w-9 !text-white hover:!bg-white/20"
                            onClick={() => setPreviewImage(watchedImageUrl)}
                          />
                          <Button
                            type="text"
                            icon={<DeleteOutlined />}
                            className="!h-9 !w-9 !text-white hover:!bg-white/20"
                            onClick={() =>
                              form.setFieldsValue({ imageUrl: "" })
                            }
                          />
                        </div>
                      </div>
                    )}

                    {uploading && !watchedImageUrl && (
                      <div className="flex h-40 w-full items-center justify-center rounded-xl border border-gray-200 bg-gray-50">
                        <Spin />
                      </div>
                    )}

                    <Upload
                      accept="image/png,image/jpeg,image/webp"
                      showUploadList={false}
                      beforeUpload={beforeCropImageUpload}
                      customRequest={options => handleCropImageUpload(options)}
                    >
                      <Button
                        icon={<UploadOutlined />}
                        loading={uploading}
                        className="h-11 w-full rounded-lg"
                      >
                        {uploading
                          ? "Đang tải..."
                          : watchedImageUrl
                            ? "Đổi ảnh khác"
                            : "Tải ảnh lên"}
                      </Button>
                    </Upload>
                  </div>
                </Form.Item>
              </Card>

              {/* Actions below Card */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => navigate(-1)}
                  className="h-11 w-full rounded-lg font-semibold"
                >
                  Hủy bỏ
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={updatePending}
                  disabled={uploading}
                  className="h-11 w-full rounded-lg bg-green-500 font-semibold shadow-lg shadow-green-100"
                >
                  Lưu thay đổi
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

export default CropEdit
