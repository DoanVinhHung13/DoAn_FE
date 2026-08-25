import React, { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Alert, Button, Card, Form, Input, Select, Spin } from "antd"
import { ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons"

import TitleCustom from "src/components/TitleCustom"
import { CropCatalogIcon } from "src/assets/icon/menu/MenuIcons"
import CropCatalogService from "src/services/CropCatalogService"
import {
  applyApiFieldErrors,
  isNotFoundError,
} from "src/services/core/apiError"
import ROUTER from "src/router/ROUTER"
import { useSystemKey } from "src/hooks/useSystemKey"
import { SYSTEM_KEY } from "src/constants/systemKey"
import useFormDraft from "src/hooks/useFormDraft"
import { getFormDraftKey } from "src/utils/formDraftKeys"
import { makeDescriptionValidator, makeNameValidator } from "src/utils/helpers"

const normalizeText = text => text?.trim().replace(/\s+/g, " ") || null

const CatalogEdit = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [form] = Form.useForm()
  const { getCombo } = useSystemKey()
  const storageKey = getFormDraftKey("crop-catalog", "edit", id)
  const { saveDraft, clearDraft, restoreDraft } = useFormDraft({
    form,
    storageKey,
  })

  const statusOptions = getCombo(SYSTEM_KEY.STATUS).map(opt => ({
    value: (opt.codeValue || opt.value) === "ACTIVE",
    label: opt.label || opt.description,
  }))

  const [catalogDetail, setCatalogDetail] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [isPending, setIsPending] = useState(false)

  const fetchCatalogDetail = async () => {
    if (!id) return
    setIsLoading(true)
    setIsError(false)
    try {
      const response = await CropCatalogService.getCropCatalogById(id, {
        errorHandling: "component",
      })
      const payload = response?.data
      setCatalogDetail(payload?.data ?? payload)
    } catch {
      setIsError(true)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCatalogDetail()
  }, [id])

  useEffect(() => {
    if (catalogDetail) {
      const serverValues = {
        name: catalogDetail.name || "",
        description: catalogDetail.description || "",
        isActive: catalogDetail.isActive ?? true,
      }
      const draft = restoreDraft()
      form.setFieldsValue({ ...serverValues, ...(draft?.data || {}) })
    }
  }, [catalogDetail, form, restoreDraft])

  const handleUpdate = async values => {
    setIsPending(true)
    const payload = {
      name: normalizeText(values.name),
      description: normalizeText(values.description),
      isActive: values.isActive ?? catalogDetail?.isActive ?? true,
    }

    try {
      await CropCatalogService.updateCropCatalog(id, payload, {
        errorHandling: "form",
      })
      clearDraft()
      navigate(ROUTER.FM_CROP_CATALOGS)
    } catch (error) {
      if (isNotFoundError(error)) {
        navigate(ROUTER.FM_CROP_CATALOGS)
        return
      }
      applyApiFieldErrors(form, error)
    } finally {
      setIsPending(false)
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
            onClick={() => navigate(ROUTER.FM_CROP_CATALOGS)}
            className="h-10"
          >
            Quay lại
          </Button>
          <TitleCustom className="!mb-0">
            Chỉnh sửa danh mục cây trồng
          </TitleCustom>
        </div>
        <Alert
          type="error"
          message="Không thể tải thông tin danh mục cây trồng."
          action={
            <Button size="small" onClick={fetchCatalogDetail}>
              Thử lại
            </Button>
          }
        />
      </div>
    )
  }

  if (!catalogDetail) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(ROUTER.FM_CROP_CATALOGS)}
            className="h-10"
          >
            Quay lại
          </Button>
          <TitleCustom className="!mb-0">
            Chỉnh sửa danh mục cây trồng
          </TitleCustom>
        </div>
        <Card>
          <Alert
            type="warning"
            message="Không tìm thấy thông tin danh mục cây trồng."
          />
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
          <CropCatalogIcon style={{ fontSize: "24px", color: "#15803d" }} />
          Chỉnh sửa danh mục cây trồng
        </TitleCustom>
      </div>

      <Card className="mx-auto max-w-3xl rounded-lg shadow-sm">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdate}
          onValuesChange={(_, allValues) => saveDraft(allValues)}
          scrollToFirstError
        >
          <Form.Item
            name="name"
            label="Tên loại cây trồng"
            rules={[
              { required: true, message: "Vui lòng nhập tên loại cây trồng." },
              makeNameValidator({ label: "Tên loại cây trồng" }),
            ]}
          >
            <Input
              className="rounded-lg"
              placeholder="Nhập tên loại cây trồng"
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
            rules={[makeDescriptionValidator()]}
          >
            <Input.TextArea
              rows={4}
              className="rounded-lg"
              placeholder="Nhập mô tả danh mục cây trồng"
            />
          </Form.Item>

          <Form.Item name="isActive" label="Trạng thái">
            <Select
              className="w-full rounded-lg"
              options={statusOptions}
            />
          </Form.Item>

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-6">
            <Button
              onClick={() => navigate(-1)}
              className="h-11 min-w-[100px] rounded-lg font-semibold"
            >
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={isPending}
              className="h-11 min-w-[120px] rounded-lg bg-green-500 font-semibold shadow-lg shadow-green-100"
            >
              Lưu thay đổi
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  )
}

export default CatalogEdit
