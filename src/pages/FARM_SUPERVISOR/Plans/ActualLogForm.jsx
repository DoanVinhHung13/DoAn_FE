/**
 * Reusable Actual Log Form Component (Optimized for horizontal screens)
 * Used by Farm Supervisor to input daily logs
 * Matches the structure of Farm Leader's DailyLog form
 */
import {
  DeleteOutlined,
  InboxOutlined,
  PlusOutlined,
} from '@ant-design/icons'
import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Image,
  Input,
  InputNumber,
  Row,
  Select,
  Typography,
  Upload,
  message,
} from 'antd'
import { useState } from 'react'

import {
  AREA_UNITS,
  FERTILIZER_QUANTITY_UNITS,
  MOCK_FERTILIZER_OPTIONS,
  MOCK_PESTICIDE_OPTIONS,
  PESTICIDE_QUANTITY_UNITS,
} from '../Logbooks/mockData'

const { TextArea } = Input
const { Dragger } = Upload
const { Text } = Typography


const ActualLogForm = ({ form, onSave, saving = false, initialValues = {} }) => {
  const [fileList, setFileList] = useState(
    initialValues?.images?.map((img) => ({
      uid: img.id,
      name: `image-${img.id}.jpg`,
      status: 'done',
      url: img.url,
    })) || []
  )

  const uploadProps = {
    name: 'file',
    multiple: true,
    fileList,
    onChange(info) {
      const { status } = info.file
      if (status !== 'uploading') {
        setFileList(info.fileList)
      }
      if (status === 'done') {
        message.success(`${info.file.name} tải lên thành công.`)
      } else if (status === 'error') {
        message.error(`${info.file.name} tải lên thất bại.`)
      }
    },
    onRemove(file) {
      setFileList((prev) => prev.filter((item) => item.uid !== file.uid))
    },
    beforeUpload() {
      return false // Prevent auto upload
    },
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const payload = {
        ...values,
        date: values.date?.format('YYYY-MM-DD'),
        images: fileList.map((file) => ({
          id: file.uid,
          url: file.url || file.response?.url || (file.originFileObj ? URL.createObjectURL(file.originFileObj) : ''),
        })),
      }
      await onSave(payload)
    } catch (error) {
      if (error.errorFields) {
        message.warning('Vui lòng kiểm tra lại các trường nhập.')
      }
    }
  }

  return (
    <div className="space-y-4">
      {/* Images & Description - Side by Side */}
      <Row gutter={16}>
        {/* Images - Left */}
        <Col xs={24} lg={4}>
          <Card bordered={false} className="shadow-sm rounded-xl h-full" bodyStyle={{ padding: '16px' }}>
            <div className="flex items-center justify-between mb-3">
              <Text strong className="text-sm">📷 Ảnh minh chứng</Text>
            </div>
            <Dragger {...uploadProps} className="rounded-lg" style={{ padding: '16px' }}>
              <div className="flex items-center justify-center gap-3">
                <InboxOutlined className="text-2xl text-green-500" />
                <div className="text-left">
                  <p className="text-sm text-gray-700 m-0">
                    Ảnh minh chứng
                  </p>
                </div>
              </div>
            </Dragger>
            {fileList.length > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-2">
                {fileList.map((file) => (
                  <div key={file.uid} className="relative rounded-lg overflow-hidden aspect-square">
                    <Image
                      src={file.url || (file.originFileObj ? URL.createObjectURL(file.originFileObj) : '')}
                      className="object-cover w-full h-full"
                      alt={file.name}
                    />
                    <Button
                      type="text"
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => setFileList((prev) => prev.filter((item) => item.uid !== file.uid))}
                      className="absolute top-1 right-1 bg-white/80 rounded-full text-red-500 hover:bg-white w-6 h-6 flex items-center justify-center p-0"
                    />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </Col>

        {/* Description - Right */}
        <Col xs={24} lg={20}>
          <Card bordered={false} className="shadow-sm rounded-xl h-full" bodyStyle={{ padding: '16px' }}>
            <Form.Item
              name="description"
              label={<Text strong className="text-sm">✍️ Mô tả công việc</Text>}
              rules={[{ required: true, message: 'Nhập mô tả công việc' }]}
              className="mb-0"
            >
              <TextArea
                rows={8}
                placeholder="Mô tả chi tiết công việc, tình hình cây trồng, thời tiết, vấn đề phát sinh..."
                style={{ height: '100%', minHeight: '200px' }}
              />
            </Form.Item>
          </Card>
        </Col>
      </Row>
      {/* Fertilizers & Pesticides - Side by Side */}
      <Row gutter={16}>
        {/* Fertilizers - Left */}
        <Col xs={24} lg={12}>
          <Card bordered={false} className="shadow-sm rounded-xl h-full" bodyStyle={{ padding: '16px' }}>
            <div className="flex items-center justify-between mb-3">
              <Text strong className="text-sm">🌱 Phân bón sử dụng</Text>
            </div>
            <Form.List name="fertilizers">
              {(fields, { add, remove }) => (
                <div className="space-y-3">
                  {fields.map((field) => (
                    <div key={field.key} className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-gray-700">Phân bón #{field.name + 1}</span>
                        <Button type="text" danger size="small" onClick={() => remove(field.name)} icon={<DeleteOutlined />} className="h-6 text-xs">
                          Xóa
                        </Button>
                      </div>
                      <Row gutter={8}>
                        <Col xs={24}>
                          <Form.Item
                            {...field}
                            name={[field.name, 'name']}
                            label={<span className="text-xs">Tên phân bón</span>}
                            rules={[{ required: true, message: 'Chọn' }]}
                            className="mb-2"
                          >
                            <Select
                              options={MOCK_FERTILIZER_OPTIONS.map((f) => ({ value: f.name, label: f.name }))}
                              placeholder="Chọn loại..."
                              showSearch
                              filterOption={(input, option) => String(option?.label || '').toLowerCase().includes(input.toLowerCase())}
                              className="w-full"
                              size="middle"
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={12}>
                          <Form.Item
                            {...field}
                            name={[field.name, 'quantity']}
                            label={<span className="text-xs">Lượng</span>}
                            rules={[{ required: true, message: 'Nhập' }]}
                            className="mb-2"
                          >
                            <InputNumber min={0} className="w-full" placeholder="0" size="middle" />
                          </Form.Item>
                        </Col>
                        <Col xs={12}>
                          <Form.Item
                            {...field}
                            name={[field.name, 'quantityUnit']}
                            label={<span className="text-xs">Đơn vị</span>}
                            rules={[{ required: true, message: 'Chọn' }]}
                            className="mb-2"
                          >
                            <Select options={FERTILIZER_QUANTITY_UNITS.map((u) => ({ value: u, label: u }))} size="middle" />
                          </Form.Item>
                        </Col>
                        <Col xs={12}>
                          <Form.Item
                            {...field}
                            name={[field.name, 'area']}
                            label={<span className="text-xs">Diện tích</span>}
                            rules={[{ required: true, message: 'Nhập' }]}
                            className="mb-2"
                          >
                            <InputNumber min={0} className="w-full" placeholder="0" size="middle" />
                          </Form.Item>
                        </Col>
                        <Col xs={12}>
                          <Form.Item
                            {...field}
                            name={[field.name, 'areaUnit']}
                            label={<span className="text-xs">Đơn vị diện tích</span>}
                            rules={[{ required: true, message: 'Chọn' }]}
                            className="mb-2"
                          >
                            <Select options={AREA_UNITS.map((u) => ({ value: u, label: u }))} size="middle" />
                          </Form.Item>
                        </Col>
                      </Row>
                    </div>
                  ))}
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    icon={<PlusOutlined />}
                    className="w-full h-9 rounded-lg text-green-700 border-green-300 hover:border-green-500"
                    size="middle"
                  >
                    + Thêm phân bón
                  </Button>
                </div>
              )}
            </Form.List>
          </Card>
        </Col>

        {/* Pesticides - Right */}
        <Col xs={24} lg={12}>
          <Card bordered={false} className="shadow-sm rounded-xl h-full" bodyStyle={{ padding: '16px' }}>
            <div className="flex items-center justify-between mb-3">
              <Text strong className="text-sm">🔬 Thuốc bảo vệ thực vật</Text>
            </div>
            <Form.List name="pesticides">
              {(fields, { add, remove }) => (
                <div className="space-y-3">
                  {fields.map((field) => (
                    <div key={field.key} className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-gray-700">Thuốc BVTV #{field.name + 1}</span>
                        <Button type="text" danger size="small" onClick={() => remove(field.name)} icon={<DeleteOutlined />} className="h-6 text-xs">
                          Xóa
                        </Button>
                      </div>
                      <Row gutter={8}>
                        <Col xs={24}>
                          <Form.Item
                            {...field}
                            name={[field.name, 'name']}
                            label={<span className="text-xs">Tên thuốc BVTV</span>}
                            rules={[{ required: true, message: 'Chọn' }]}
                            className="mb-2"
                          >
                            <Select
                              options={MOCK_PESTICIDE_OPTIONS.map((p) => ({ value: p.name, label: p.name }))}
                              placeholder="Chọn loại..."
                              showSearch
                              filterOption={(input, option) => String(option?.label || '').toLowerCase().includes(input.toLowerCase())}
                              className="w-full"
                              size="middle"
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={12}>
                          <Form.Item
                            {...field}
                            name={[field.name, 'quantity']}
                            label={<span className="text-xs">Lượng</span>}
                            rules={[{ required: true, message: 'Nhập' }]}
                            className="mb-2"
                          >
                            <InputNumber min={0} className="w-full" placeholder="0" size="middle" />
                          </Form.Item>
                        </Col>
                        <Col xs={12}>
                          <Form.Item
                            {...field}
                            name={[field.name, 'quantityUnit']}
                            label={<span className="text-xs">Đơn vị</span>}
                            rules={[{ required: true, message: 'Chọn' }]}
                            className="mb-2"
                          >
                            <Select options={PESTICIDE_QUANTITY_UNITS.map((u) => ({ value: u, label: u }))} size="middle" />
                          </Form.Item>
                        </Col>
                        <Col xs={12}>
                          <Form.Item
                            {...field}
                            name={[field.name, 'area']}
                            label={<span className="text-xs">Diện tích</span>}
                            rules={[{ required: true, message: 'Nhập' }]}
                            className="mb-2"
                          >
                            <InputNumber min={0} className="w-full" placeholder="0" size="middle" />
                          </Form.Item>
                        </Col>
                        <Col xs={12}>
                          <Form.Item
                            {...field}
                            name={[field.name, 'areaUnit']}
                            label={<span className="text-xs">Đơn vị diện tích</span>}
                            rules={[{ required: true, message: 'Chọn' }]}
                            className="mb-2"
                          >
                            <Select options={AREA_UNITS.map((u) => ({ value: u, label: u }))} size="middle" />
                          </Form.Item>
                        </Col>
                      </Row>
                    </div>
                  ))}
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    icon={<PlusOutlined />}
                    className="w-full h-9 rounded-lg text-green-700 border-green-300 hover:border-green-500"
                    size="middle"
                  >
                    + Thêm thuốc BVTV
                  </Button>
                </div>
              )}
            </Form.List>
          </Card>
        </Col>
      </Row>



      {/* Actions */}
      <div className="flex justify-end pt-2">
        <Button type="primary" onClick={handleSubmit} loading={saving} className="h-10 px-8 font-semibold bg-green-600 rounded-xl">
          Lưu ghi chép
        </Button>
      </div>
    </div>
  )
}

export default ActualLogForm
