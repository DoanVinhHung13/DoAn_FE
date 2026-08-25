import React from "react"
import { Button, Form, Input, Modal, Select, Typography, Upload } from "antd"
import { DeleteOutlined, FileOutlined, UploadOutlined } from "@ant-design/icons"
import { makeNameValidator } from "src/utils/helpers"
import { RECIPIENT_TYPE, ROLE_OPTIONS } from "./notificationConstants"

const { Text } = Typography
const { TextArea } = Input

const CreateNotificationModal = ({
  open,
  onClose,
  form,
  onSubmit,
  loading,
  recipientType,
  setRecipientType,
  documents,
  setDocuments,
  uploadingDoc,
  beforeDocumentUpload,
  handleDocumentUpload,
  handleRemoveDocument,
  isUsersLoading,
  userOptions,
}) => {
  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      wrapClassName="notification-create-modal"
      style={{ width: "min(92vw, 920px)", maxWidth: "calc(100vw - 32px)" }}
      destroyOnClose
      title={
        <span className="text-2xl font-bold text-green-600">
          Tạo thông báo mới
        </span>
      }
    >
      <Form
        form={form}
        layout="vertical"
        className="pt-4"
        onFinish={onSubmit}
        onFinishFailed={() => {}}
        scrollToFirstError
      >
        <Form.Item
          name="title"
          label="Tiêu đề"
          rules={[
            { required: true, message: "Vui lòng nhập tiêu đề thông báo." },
            makeNameValidator({ label: "Tiêu đề", maxLength: 200 }),
          ]}
        >
          <Input
            className="rounded-lg"
            placeholder="Nhập tiêu đề thông báo"
          />
        </Form.Item>

        <Form.Item
          name="message"
          label="Nội dung"
          rules={[
            { required: true, message: "Vui lòng nhập nội dung thông báo." },
            {
              validator: (_, value) => {
                if (!value) return Promise.resolve()
                const trimmed = value.trim()
                if (!trimmed)
                  return Promise.reject(
                    new Error(
                      "Nội dung thông báo không được chỉ chứa khoảng trắng.",
                    ),
                  )
                if (trimmed.length > 1000)
                  return Promise.reject(
                    new Error("Nội dung không được vượt quá 1000 ký tự."),
                  )
                if (trimmed !== trimmed.replace(/\s+/g, " "))
                  return Promise.reject(
                    new Error(
                      "Nội dung không được chứa nhiều khoảng trắng liên tiếp.",
                    ),
                  )
                return Promise.resolve()
              },
            },
          ]}
        >
          <TextArea
            rows={5}
            className="rounded-lg"
            placeholder="Nhập nội dung thông báo"
          />
        </Form.Item>

        <Form.Item
          name="actionUrl"
          label="Đường dẫn khi bấm (tuỳ chọn)"
          rules={[
            {
              max: 500,
              message: "Đường dẫn không được vượt quá 500 ký tự.",
            },
            {
              validator: (_, value) => {
                if (!value || value.trim().startsWith("/"))
                  return Promise.resolve()
                return Promise.reject(
                  new Error("Đường dẫn phải bắt đầu bằng /."),
                )
              },
            },
          ]}
        >
          <Input
            className="rounded-lg"
            placeholder="Ví dụ: /farm-manager/cultivation-logbooks/123"
          />
        </Form.Item>

        {/* Upload tài liệu */}
        <Form.Item label="Tài liệu đính kèm">
          <div className="space-y-3">
            <Upload
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.webp"
              showUploadList={false}
              beforeUpload={beforeDocumentUpload}
              customRequest={handleDocumentUpload}
              disabled={uploadingDoc}
            >
              <Button
                icon={<UploadOutlined />}
                loading={uploadingDoc}
                className="h-11 rounded-lg"
              >
                {uploadingDoc ? "Đang tải lên..." : "Tải tài liệu lên"}
              </Button>
            </Upload>

            {/* Danh sách tài liệu đã upload */}
            {documents.length > 0 && (
              <div className="space-y-2">
                {documents.map(doc => (
                  <div
                    key={doc.uid}
                    className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <FileOutlined className="text-lg text-blue-500" />
                      <div className="min-w-0 flex-1">
                        <Text className="block truncate font-medium">
                          {doc.name}
                        </Text>
                        <Text type="secondary" className="text-xs">
                          {(doc.size / 1024).toFixed(2)} KB
                        </Text>
                      </div>
                    </div>
                    <Button
                      type="text"
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => handleRemoveDocument(doc.uid)}
                      className="shrink-0"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </Form.Item>

        <Form.Item label="Đối tượng nhận">
          <div className="space-y-3">
            <div className="space-y-2">
              <div
                className={`cursor-pointer rounded-lg border-2 p-3 transition-all ${
                  recipientType === RECIPIENT_TYPE.ALL
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 hover:border-green-300"
                }`}
                onClick={() => {
                  setRecipientType(RECIPIENT_TYPE.ALL)
                  form.setFieldsValue({
                    recipientRoles: [],
                    recipientUserIds: [],
                  })
                }}
              >
                <Text strong> Gửi cho tất cả người dùng</Text>
              </div>

              <div
                className={`cursor-pointer rounded-lg border-2 p-3 transition-all ${
                  recipientType === RECIPIENT_TYPE.BY_ROLE
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 hover:border-green-300"
                }`}
                onClick={() => {
                  setRecipientType(RECIPIENT_TYPE.BY_ROLE)
                  form.setFieldsValue({ recipientUserIds: [] })
                }}
              >
                <Text strong>Gửi theo vai trò</Text>
              </div>

              <div
                className={`cursor-pointer rounded-lg border-2 p-3 transition-all ${
                  recipientType === RECIPIENT_TYPE.SPECIFIC_USERS
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 hover:border-green-300"
                }`}
                onClick={() => {
                  setRecipientType(RECIPIENT_TYPE.SPECIFIC_USERS)
                  form.setFieldsValue({ recipientRoles: [] })
                }}
              >
                <Text strong>Chọn người dùng cụ thể</Text>
              </div>
            </div>

            {recipientType === RECIPIENT_TYPE.BY_ROLE && (
              <Form.Item
                name="recipientRoles"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn ít nhất một vai trò.",
                  },
                ]}
                className="!mb-0"
              >
                <Select
                  mode="multiple"
                  className="w-full"
                  placeholder="Chọn vai trò người nhận"
                  options={ROLE_OPTIONS}
                  maxTagCount="responsive"
                />
              </Form.Item>
            )}

            {recipientType === RECIPIENT_TYPE.SPECIFIC_USERS && (
              <Form.Item
                name="recipientUserIds"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn ít nhất một người nhận.",
                  },
                ]}
                className="!mb-0"
              >
                <Select
                  mode="multiple"
                  className="w-full"
                  placeholder="Chọn người nhận"
                  loading={isUsersLoading}
                  options={userOptions}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  maxTagCount="responsive"
                />
              </Form.Item>
            )}
          </div>
        </Form.Item>

        <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
          <Button
            onClick={onClose}
            className="h-10 min-w-[88px] rounded-lg font-semibold"
          >
            Hủy
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            className="h-10 min-w-[112px] rounded-lg bg-green-500 font-semibold shadow-lg shadow-green-100"
          >
            Tạo thông báo
          </Button>
        </div>
      </Form>
    </Modal>
  )
}

export default CreateNotificationModal
