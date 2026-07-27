import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons'
import { Button, Card, Col, DatePicker, Form, Input, Row, Select, message } from 'antd'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import TitleCustom from 'src/components/TitleCustom'
import ROUTER from 'src/router/ROUTER'
import EquipmentService from 'src/services/EquipmentService'
import { STATUS_OPTIONS, toEquipmentPayload } from './equipmentOptions'

const EquipmentCreate = () => {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)

  const handleFinish = async (values) => {
    try {
      setSubmitting(true)
      const res = await EquipmentService.create(toEquipmentPayload(values))
      if (res?.success === false) return
      message.success('Thêm máy móc & thiết bị thành công')
      navigate(ROUTER.FM_VIEW_EQUIPMENT_MACHINERY)
    } finally { setSubmitting(false) }
  }

  return <div className="space-y-6 duration-300 animate-in fade-in">
    <div className="flex items-center gap-3"><Button icon={<ArrowLeftOutlined />} onClick={() => navigate(ROUTER.FM_VIEW_EQUIPMENT_MACHINERY)}>Quay lại</Button><TitleCustom className="!mb-0">Thêm Máy móc & Thiết bị</TitleCustom></div>
    <Card className="w-full rounded-2xl border-slate-200/80 shadow-xs"><Form form={form} layout="vertical" initialValues={{ status: 'AVAILABLE' }} onFinish={handleFinish}>
      <Row gutter={16}><Col xs={24} md={12}><Form.Item name="name" label="Tên thiết bị" rules={[{ required: true, message: 'Nhập tên thiết bị' }]}><Input placeholder="VD: Máy cày John Deere" /></Form.Item></Col><Col xs={24} md={12}><Form.Item name="code" label="Mã thiết bị" rules={[{ required: true, message: 'Nhập mã thiết bị' }]}><Input placeholder="VD: EQ-01" /></Form.Item></Col></Row>
      <Row gutter={16}><Col xs={24} md={12}><Form.Item name="type" label="Loại thiết bị" rules={[{ required: true, message: 'Nhập loại thiết bị' }]}><Input placeholder="VD: Máy cày" /></Form.Item></Col><Col xs={24} md={12}><Form.Item name="status" label="Trạng thái"><Select options={STATUS_OPTIONS} /></Form.Item></Col></Row>
      <Form.Item name="purchaseDate" label="Ngày mua / đưa vào sử dụng"><DatePicker className="w-full" format="DD/MM/YYYY" /></Form.Item>
      <Form.Item name="description" label="Mô tả"><Input.TextArea rows={4} placeholder="Ghi chú về tình trạng và thông tin thiết bị" /></Form.Item>
      <div className="flex justify-end gap-3 border-t border-slate-100 pt-4"><Button onClick={() => navigate(ROUTER.FM_VIEW_EQUIPMENT_MACHINERY)}>Huỷ</Button><Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={submitting} className="bg-emerald-600 hover:bg-emerald-700">Lưu thiết bị</Button></div>
    </Form></Card>
  </div>
}

export default EquipmentCreate
