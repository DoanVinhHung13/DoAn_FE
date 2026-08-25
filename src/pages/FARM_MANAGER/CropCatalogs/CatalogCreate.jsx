import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button, Card, Form, Input, Select } from "antd"
import { ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons"

import TitleCustom from "src/components/TitleCustom"
import { CropCatalogIcon } from "src/assets/icon/menu/MenuIcons"
import CropCatalogService from "src/services/CropCatalogService"
import { applyApiFieldErrors } from "src/services/core/apiError"
import ROUTER from "src/router/ROUTER"
import { useSystemKey } from "src/hooks/useSystemKey"
import { SYSTEM_KEY } from "src/constants/systemKey"
import useFormDraft from "src/hooks/useFormDraft"
import { getFormDraftKey } from "src/utils/formDraftKeys"
import { makeDescriptionValidator, makeNameValidator } from "src/utils/helpers"

const normalizeText = text => text?.trim().replace(/\s+/g, " ") || null

const CatalogCreate = () => {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const { getCombo, refetchSystemKey } = useSystemKey()
  const [isPending, setIsPending] = useState(false)

  const statusOptions = getCombo(SYSTEM_KEY.STATUS).map(opt => ({
    value: (opt.codeValue || opt.value) === "ACTIVE",
    label: opt.label || opt.description,
  }))

  const storageKey = getFormDraftKey("crop-catalog", "create")
  const { saveDraft, clearDraft, restoreDraft } = useFormDraft({
    form,
    storageKey,
  })

  useEffect(() => {
    const draft = restoreDraft()
    if (draft?.data) {
      form.setFieldsValue({ isActive: true, ...draft.data })
    }
  }, [form, restoreDraft])

  const handleCreate = async values => {
    const payload = {
      name: normalizeText(values.name),
      description: normalizeText(values.description),
      isActive: values.isActive ?? true,
    }

    try {
      setIsPending(true)
      await CropCatalogService.createCropCatalog(payload, {
        errorHandling: "form",
      })
      clearDraft()
      await refetchSystemKey()
      navigate(ROUTER.FM_CROP_CATALOGS)
    } catch (error) {
      applyApiFieldErrors(form, error)
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
          <CropCatalogIcon style={{ fontSize: "24px", color: "#15803d" }} />
          Thêm danh mục cây trồng
        </TitleCustom>
      </div>

      {/* Form Card */}
      <Card className="mx-auto max-w-3xl rounded-lg shadow-sm">
        <Form
          form={form}
          layout="vertical"
          initialValues={{ isActive: true }}
          onFinish={handleCreate}
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
              Thêm mới
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  )
}

export default CatalogCreate
