import {
  EnvironmentOutlined,
  MailOutlined,
  PhoneOutlined,
  SaveOutlined,
  UserOutlined,
} from "@ant-design/icons"
import { Button, Col, DatePicker, Form, Input, Row, Select } from "antd"
import dayjs from "dayjs"
import { isValidPhone } from "src/utils/helpers"
import { getLocalNow } from "src/utils/dateFormatters"

const fullNamePattern = /^[\p{L}\s]+$/u
const addressPattern = /^[\p{L}\d\s,./#()-]+$/u

const UpdateProfile = ({
  form,
  onFinish,
  onCancel,
  loading,
  genderOptions,
}) => {
  return (
    <Form form={form} layout="vertical" onFinish={onFinish} scrollToFirstError>
      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item
            name="fullName"
            label="Họ và tên"
            required
            rules={[
              {
                required: true,
                whitespace: true,
                message: "Vui lòng nhập họ và tên.",
              },
              {
                min: 2,
                max: 100,
                message: "Họ và tên phải có từ 2 đến 100 ký tự.",
              },
              {
                pattern: fullNamePattern,
                message:
                  "Họ và tên không hợp lệ. Vui lòng chỉ nhập chữ cái và khoảng trắng.",
              },
            ]}
          >
            <Input
              prefix={<UserOutlined className="text-gray-300" />}
              className="h-11"
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item name="email" label="Địa chỉ Email">
            <Input
              disabled
              prefix={<MailOutlined className="text-gray-300" />}
              className="h-11"
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            name="phoneNumber"
            label="Số điện thoại"
            validateTrigger={["onBlur", "onSubmit"]}
            rules={[
              {
                validator: (_, value) => {
                  if (!value?.trim() || isValidPhone(value.trim()))
                    return Promise.resolve()
                  return Promise.reject(
                    new Error("Định dạng số điện thoại không hợp lệ."),
                  )
                },
              },
            ]}
          >
            <Input
              prefix={<PhoneOutlined className="text-gray-300" />}
              className="h-11"
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            name="dateOfBirth"
            label="Ngày sinh"
            required
            rules={[
              {
                required: true,
                message: "Vui lòng chọn ngày sinh.",
              },
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve()
                  if (
                    !dayjs(value).isValid() ||
                    value.isAfter(getLocalNow(), "day")
                  ) {
                    return Promise.reject(new Error("Ngày sinh không hợp lệ."))
                  }
                  if (getLocalNow().diff(value, "year") < 15) {
                    return Promise.reject(
                      new Error("Người dùng phải từ đủ 15 tuổi."),
                    )
                  }
                  return Promise.resolve()
                },
              },
            ]}
          >
            <DatePicker
              format="DD/MM/YYYY"
              placeholder="Chọn ngày sinh"
              className="w-full h-11"
              disabledDate={current =>
                current && current > getLocalNow().endOf("day")
              }
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item name="gender" label="Giới tính">
            <Select
              allowClear
              placeholder="Chọn giới tính"
              className="h-11"
              options={genderOptions}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={24}>
          <Form.Item
            name="address"
            label="Địa chỉ chi tiết"
            rules={[
              {
                validator: (_, value) => {
                  if (!value?.trim()) return Promise.resolve()
                  const normalized = value.trim()
                  if (
                    normalized.length < 3 ||
                    normalized.length > 200 ||
                    !addressPattern.test(normalized)
                  ) {
                    return Promise.reject(
                      new Error("Địa chỉ chi tiết không hợp lệ."),
                    )
                  }
                  return Promise.resolve()
                },
              },
            ]}
          >
            <Input
              prefix={<EnvironmentOutlined className="text-gray-300" />}
              placeholder="Số nhà, tên đường..."
              className="h-11"
            />
          </Form.Item>
        </Col>
      </Row>

      <div className="flex justify-end gap-3 pt-3">
        <Button onClick={onCancel} className="h-10 px-5 font-semibold">
          Hủy
        </Button>
        <Button
          type="primary"
          htmlType="submit"
          icon={<SaveOutlined />}
          loading={loading}
          className="h-10 px-5 font-semibold bg-green-500"
        >
          Lưu hồ sơ
        </Button>
      </div>
    </Form>
  )
}

export default UpdateProfile
