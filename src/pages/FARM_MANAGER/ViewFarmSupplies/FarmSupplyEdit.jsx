import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Form, Input, Select, InputNumber, Row, Col, message } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import TitleCustom from 'src/components/TitleCustom';
import ROUTER from 'src/router/ROUTER';

const CATEGORY_OPTIONS = [
  { value: 'LAND_PREP', label: 'Dụng cụ canh tác & Phủ đất' },
  { value: 'SEEDLING', label: 'Vật tư làm mạ & Giống' },
  { value: 'PACKAGING', label: 'Bao bì & Đóng gói' },
  { value: 'IRRIGATION_PARTS', label: 'Phụ kiện hệ thống tưới' },
  { value: 'PEST_CONTROL', label: 'Vật tư bảo vệ & Bẫy sâu' },
];

const FarmSupplyEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue({
      name: 'Bạt phủ đất chống cỏ 1.2m x 400m',
      category: 'LAND_PREP',
      unit: 'Cuộn',
      stockQuantity: 45,
      minQuantity: 10,
      supplier: 'Công ty Nhựa Nông Nghiệp Tiên Phong',
      notes: 'Loại bạt HDPE chống tia UV 3 năm.',
    });
  }, [id, form]);

  const handleFinish = (values) => {
    message.success('Cập nhật vật tư nông nghiệp thành công!');
    navigate(ROUTER.FM_VIEW_FARM_SUPPLIES);
  };

  return (
    <div className="space-y-6 duration-300 animate-in fade-in">
      <div className="flex items-center gap-3">
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(ROUTER.FM_VIEW_FARM_SUPPLIES)} className="h-10 rounded-xl">
          Quay lại
        </Button>
        <TitleCustom className="!mb-0">Chỉnh sửa Vật tư Nông nghiệp</TitleCustom>
      </div>

      <Card className="rounded-2xl border-slate-200/80 shadow-xs w-full">
        <Form form={form} layout="vertical" onFinish={handleFinish} className="space-y-4">
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="name" label="Tên vật tư nông nghiệp" rules={[{ required: true, message: 'Nhập tên vật tư' }]}>
                <Input placeholder="VD: Bạt phủ đất 1.2m x 400m" className="rounded-xl" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="category" label="Nhóm vật tư" rules={[{ required: true, message: 'Chọn nhóm vật tư' }]}>
                <Select options={CATEGORY_OPTIONS} className="rounded-xl" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="unit" label="Đơn vị tính" rules={[{ required: true, message: 'Nhập đơn vị tính' }]}>
                <Input placeholder="VD: Cuộn, Khay, Cái, Bao, Bộ" className="rounded-xl" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="stockQuantity" label="Số lượng tồn kho">
                <InputNumber min={0} className="w-full rounded-xl" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="minQuantity" label="Ngưỡng tồn kho tối thiểu (cảnh báo)">
                <InputNumber min={0} className="w-full rounded-xl" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="supplier" label="Nhà cung cấp">
            <Input placeholder="VD: Công ty Nhựa Nông Nghiệp Tiên Phong" className="rounded-xl" />
          </Form.Item>

          <Form.Item name="notes" label="Ghi chú & Quy cách">
            <Input.TextArea rows={3} placeholder="Ghi chú kích thước, xuất xứ, hạn sử dụng..." className="rounded-xl" />
          </Form.Item>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button onClick={() => navigate(ROUTER.FM_VIEW_FARM_SUPPLIES)} className="h-10 rounded-xl">
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

export default FarmSupplyEdit;
