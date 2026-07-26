import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Tag, Typography, Row, Col, Divider, Space } from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  InboxOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
  ShopOutlined,
} from '@ant-design/icons';
import TitleCustom from 'src/components/TitleCustom';
import ROUTER from 'src/router/ROUTER';

const { Text, Paragraph, Title } = Typography;

const MOCK_SUPPLIES = [
  {
    id: 'SUP-001',
    code: 'MAT-MULCH-01',
    name: 'Bạt phủ đất chống cỏ 1.2m x 400m',
    category: 'LAND_PREP',
    categoryName: 'Dụng cụ canh tác & Phủ đất',
    unit: 'Cuộn',
    stockQuantity: 45,
    minQuantity: 10,
    status: 'IN_STOCK',
    statusName: 'Còn hàng',
    supplier: 'Công ty Nhựa Nông Nghiệp Tiên Phong',
    unitPrice: 850000,
    location: 'Kho A - Kệ 02',
    notes: 'Loại bạt HDPE chống tia UV 3 năm.',
  },
  {
    id: 'SUP-002',
    code: 'MAT-SEED-TRAY-56',
    name: 'Khay gieo mạ nhựa đúc 56 lỗ',
    category: 'SEEDLING',
    categoryName: 'Vật tư làm mạ & Giống',
    unit: 'Khay',
    stockQuantity: 8,
    minQuantity: 25,
    status: 'LOW_STOCK',
    statusName: 'Sắp hết hàng',
    supplier: 'Cơ sở Nhựa Nông Lâm',
    unitPrice: 15000,
    location: 'Kho B - Kệ 01',
    notes: 'Cần nhập thêm 200 khay phục vụ vụ mùa mới.',
  },
  {
    id: 'SUP-003',
    code: 'MAT-PACK-ST25-5K',
    name: 'Bao bì túi gạo ST25 5kg (Có mã QR)',
    category: 'PACKAGING',
    categoryName: 'Bao bì & Đóng gói',
    unit: 'Bao',
    stockQuantity: 2500,
    minQuantity: 500,
    status: 'IN_STOCK',
    statusName: 'Còn hàng',
    supplier: 'Công ty In Bao Bì Á Châu',
    unitPrice: 3200,
    location: 'Kho C - Khu bao bì',
    notes: 'Túi màng ghép PA/PE in 6 màu cao cấp.',
  },
  {
    id: 'SUP-004',
    code: 'MAT-IRRI-NOZZLE-8B',
    name: 'Béc phun mưa cục bộ bù áp 90L/h',
    category: 'IRRIGATION_PARTS',
    categoryName: 'Phụ kiện hệ thống tưới',
    unit: 'Cái',
    stockQuantity: 0,
    minQuantity: 50,
    status: 'OUT_OF_STOCK',
    statusName: 'Hết hàng',
    supplier: 'Công ty Thiết bị Tưới Netafim',
    unitPrice: 12000,
    location: 'Kho A - Kệ 05',
    notes: 'Đã tạo yêu cầu mua bổ sung 300 cái.',
  },
  {
    id: 'SUP-005',
    code: 'MAT-INSECT-LAMP',
    name: 'Đèn năng lượng mặt trời bẫy côn trùng',
    category: 'PEST_CONTROL',
    categoryName: 'Vật tư bảo vệ & Bẫy sâu',
    unit: 'Bộ',
    stockQuantity: 30,
    minQuantity: 5,
    status: 'IN_STOCK',
    statusName: 'Còn hàng',
    supplier: 'Công ty Công nghệ Sinh học Xanh',
    unitPrice: 450000,
    location: 'Kho A - Khu bẫy sinh học',
    notes: 'Tự động bật ban đêm, thu hút rầy nâu và sâu cuốn lá.',
  },
];

const STATUS_TAG_MAP = {
  IN_STOCK: { color: 'green', icon: <CheckCircleOutlined />, label: 'Còn hàng trong kho' },
  LOW_STOCK: { color: 'warning', icon: <ExclamationCircleOutlined />, label: 'Sắp hết hàng' },
  OUT_OF_STOCK: { color: 'error', icon: <WarningOutlined />, label: 'Đã hết hàng' },
};

const FarmSupplyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);

  useEffect(() => {
    const found = MOCK_SUPPLIES.find((s) => s.id === id || s.code === id) || MOCK_SUPPLIES[0];
    setItem(found);
  }, [id]);

  if (!item) return null;

  const tagInfo = STATUS_TAG_MAP[item.status] || { color: 'default', label: item.status };

  return (
    <div className="space-y-6 duration-300 animate-in fade-in">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(ROUTER.FM_VIEW_FARM_SUPPLIES)}
            className="h-10 rounded-xl"
          >
            Quay lại
          </Button>
          <div>
            <TitleCustom className="!mb-0">Chi tiết Vật tư Nông nghiệp</TitleCustom>
          </div>
        </div>

        <Button
          type="primary"
          icon={<EditOutlined />}
          onClick={() => navigate(ROUTER.FM_VIEW_FARM_SUPPLY_EDIT.replace(':id', item.id))}
          className="h-10 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-semibold"
        >
          Chỉnh sửa vật tư
        </Button>
      </div>

      {/* Main Content Card */}
      <Card className="rounded-2xl border-slate-200/80 shadow-xs">
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <InboxOutlined className="text-xl text-emerald-600" />
              <Title level={3} className="!mb-0 !text-xl font-bold text-slate-800">
                {item.name}
              </Title>
            </div>
            <Text className="text-xs text-slate-500 block">Đơn vị tính: <strong className="text-slate-700">{item.unit}</strong></Text>
          </div>

          <Tag color={tagInfo.color} icon={tagInfo.icon} className="px-3 py-1 rounded-full text-sm font-semibold self-start sm:self-auto">
            {tagInfo.label}
          </Tag>
        </div>

        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-3">
              <Text strong className="text-base text-slate-800 block mb-2">Thông tin lưu kho</Text>

              <div className="flex justify-between py-1.5 border-b border-slate-200/50 text-sm">
                <Text className="text-slate-500">Nhóm vật tư:</Text>
                <Tag color="orange" className="rounded-md font-medium">{item.categoryName}</Tag>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-200/50 text-sm">
                <Text className="text-slate-500">Số lượng tồn kho hiện tại:</Text>
                <Text strong className="text-emerald-700 text-base">
                  {item.stockQuantity.toLocaleString('vi-VN')} {item.unit}
                </Text>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-200/50 text-sm">
                <Text className="text-slate-500">Ngưỡng tối thiểu cảnh báo:</Text>
                <Text strong className="text-amber-600">{item.minQuantity} {item.unit}</Text>
              </div>

            </div>
          </Col>

          <Col xs={24} md={12}>
            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-3">
              <Text strong className="text-base text-slate-800 block mb-2">Thông tin nhà cung cấp</Text>

              <div className="flex justify-between py-1.5 border-b border-slate-200/50 text-sm">
                <Text className="text-slate-500">Nhà cung cấp:</Text>
                <Space>
                  <ShopOutlined className="text-slate-400" />
                  <Text strong className="text-slate-800">{item.supplier}</Text>
                </Space>
              </div>

              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 mt-2">
                <Text className="text-xs text-blue-800 font-semibold block mb-1">Quy định lưu kho:</Text>
                <Text className="text-xs text-slate-600">
                  Bảo quản nơi khô ráo, tránh ánh nắng chiếu trực tiếp để duy trì tuổi thọ vật liệu.
                </Text>
              </div>
            </div>
          </Col>
        </Row>

        {item.notes && (
          <>
            <Divider className="my-6" />
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60">
              <Text strong className="text-slate-800 block mb-1">Ghi chú & Quy cách bao bì:</Text>
              <Paragraph className="!mb-0 text-sm text-slate-700">{item.notes}</Paragraph>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default FarmSupplyDetail;
