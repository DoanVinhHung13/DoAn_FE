import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Form, Input, Select, DatePicker, Row, Col, message } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import TitleCustom from 'src/components/TitleCustom';
import ROUTER from 'src/router/ROUTER';

const CATEGORY_OPTIONS = [
  { value: 'TRACTOR', label: 'Máy làm đất & Cày cấy' },
  { value: 'DRONE', label: 'Drone & Thiết bị công nghệ' },
  { value: 'IRRIGATION', label: 'Hệ thống tưới tiêu' },
  { value: 'HARVESTER', label: 'Máy thu hoạch' },
  { value: 'PROCESSING', label: 'Thiết bị chế biến & Sấy' },
];

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Sẵn sàng sử dụng' },
  { value: 'IN_USE', label: 'Đang hoạt động' },
  { value: 'MAINTENANCE', label: 'Đang bảo dưỡng' },
  { value: 'BROKEN', label: 'Hỏng hóc / Ngừng dùng' },
];

const EquipmentEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  useEffect(() => {
    // Populate form mock
    form.setFieldsValue({
      code: id.startsWith('MACH') || id.startsWith('EQ') ? id : 'MACH-KUBOTA-L5018',
      name: 'Máy cày Kubota L5018',
      category: 'TRACTOR',
      brand: 'Kubota Nhật Bản',
      power: '50 HP',
      status: 'ACTIVE',
      assignedTo: 'Đội 1 - Vùng lúa ST25',
      lastMaintenance: dayjs('2024-06-15'),
      nextMaintenance: dayjs('2024-12-15'),
      notes: 'Đã kiểm tra định kỳ 500 giờ hoạt động, hoạt động tốt.',
    });
  }, [id, form]);

  const handleFinish = (values) => {
    message.success('Cập nhật thông tin máy móc & thiết bị thành công!');
    navigate(ROUTER.FM_VIEW_EQUIPMENT_MACHINERY);
  };

  return (
    <div className="space-y-6 duration-300 animate-in fade-in">
      <div className="flex items-center gap-3">
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(ROUTER.FM_VIEW_EQUIPMENT_MACHINERY)} className="h-10 rounded-xl">
          Quay lại
        </Button>
        <TitleCustom className="!mb-0">Chỉnh sửa Máy móc & Thiết bị</TitleCustom>
      </div>

      <Card className="rounded-2xl border-slate-200/80 shadow-xs w-full">
        <Form form={form} layout="vertical" onFinish={handleFinish} className="space-y-4">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="code" label="Mã thiết bị / Máy móc">
                <Input placeholder="VD: MACH-KUBOTA-01" className="rounded-xl font-mono" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="name" label="Tên thiết bị / Máy móc" rules={[{ required: true, message: 'Nhập tên thiết bị' }]}>
                <Input placeholder="VD: Máy cày Kubota L5018" className="rounded-xl" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="category" label="Loại máy móc" rules={[{ required: true, message: 'Chọn loại thiết bị' }]}>
                <Select options={CATEGORY_OPTIONS} className="rounded-xl" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="Trạng thái">
                <Select options={STATUS_OPTIONS} className="rounded-xl" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="brand" label="Thương hiệu / Xuất xứ">
                <Input placeholder="VD: Kubota Nhật Bản" className="rounded-xl" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="power" label="Công suất / Thông số">
                <Input placeholder="VD: 50 HP hoặc 10 m3/h" className="rounded-xl" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="lastMaintenance" label="Ngày bảo dưỡng gần nhất">
                <DatePicker className="w-full rounded-xl" format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="nextMaintenance" label="Hạn bảo dưỡng tiếp theo">
                <DatePicker className="w-full rounded-xl" format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="assignedTo" label="Đội / Khu vực quản lý">
            <Input placeholder="VD: Đội 1 - Vùng lúa ST25" className="rounded-xl" />
          </Form.Item>

          <Form.Item name="notes" label="Ghi chú kỹ thuật & vận hành">
            <Input.TextArea rows={3} placeholder="Ghi chú về tình trạng thiết bị, phụ tùng thay thế..." className="rounded-xl" />
          </Form.Item>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button onClick={() => navigate(ROUTER.FM_VIEW_EQUIPMENT_MACHINERY)} className="h-10 rounded-xl">
              Hủy
            </Button>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />} className="h-10 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-semibold">
              Lưu thay đổi
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default EquipmentEdit;
