import { CheckSquareOutlined, FileTextOutlined } from '@ant-design/icons'
import { Col, Form, Input, Row } from 'antd'
import React from 'react'

const TaskFormFields = ({ isEdit = false, readOnly = false }) => {
  return (
    <Row gutter={16}>
      <Col xs={24} md={24}>
        <Form.Item
          name="title"
          label={
            <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
              Tên công việc {!readOnly}
            </span>
          }
          rules={!readOnly ? [
            { required: true, message: 'Vui lòng nhập tên công việc.' },
            { max: 100, message: 'Tên công việc tối đa 100 ký tự.' },
          ] : []}
        >
          <Input
            prefix={<CheckSquareOutlined className="text-gray-300" />}
            placeholder="VD: Tưới nước buổi sáng"
            className="h-10 rounded-lg"
            readOnly={readOnly}
          />
        </Form.Item>
      </Col>

      <Col xs={24}>
        <Form.Item
          name="description"
          label={
            <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
              <FileTextOutlined className="mr-1" />
              Mô tả kỹ thuật
            </span>
          }
        >
          <Input.TextArea
            rows={4}
            placeholder="Nhập mô tả chi tiết, quy trình thực hiện, yêu cầu kỹ thuật..."
            className="rounded-lg"
            maxLength={1000}
            showCount={!readOnly}
            readOnly={readOnly}
          />
        </Form.Item>
      </Col>
    </Row>
  )
}

export default TaskFormFields
