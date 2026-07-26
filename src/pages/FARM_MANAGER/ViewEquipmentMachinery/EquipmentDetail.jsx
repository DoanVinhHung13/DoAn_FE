import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Tag, Typography, Row, Col, Divider, Alert, Breadcrumb } from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  ToolOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  SettingOutlined,
  WarningOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import TitleCustom from 'src/components/TitleCustom';
import ROUTER from 'src/router/ROUTER';

const { Text, Paragraph, Title } = Typography;

const MOCK_EQUIPMENT_LIST = [
  {
    id: 'EQ-001',
    code: 'MACH-KUBOTA-L5018',
    name: 'Máy cày Kubota L5018',
    category: 'TRACTOR',
    categoryName: 'Máy làm đất & Cày cấy',
    brand: 'Kubota Nhật Bản',
    power: '50 HP',
    status: 'ACTIVE',
    statusName: 'Sẵn sàng sử dụng',
    lastMaintenance: '2024-06-15',
    nextMaintenance: '2024-12-15',
    purchaseDate: '2022-03-10',
    assignedTo: 'Đội 1 - Vùng lúa ST25',
    notes: 'Đã kiểm tra định kỳ 500 giờ hoạt động, động cơ hoạt động mượt mà.',
  },
  {
    id: 'EQ-002',
    code: 'DRONE-DJI-T40',
    name: 'Drone Phun thuốc & Gieo hạt DJI Agras T40',
    category: 'DRONE',
    categoryName: 'Drone & Thiết bị công nghệ',
    brand: 'DJI Agriculture',
    power: 'Tải trọng 40kg',
    status: 'IN_USE',
    statusName: 'Đang hoạt động trên đồng',
    lastMaintenance: '2024-07-01',
    nextMaintenance: '2024-08-01',
    purchaseDate: '2023-05-20',
    assignedTo: 'Tổ công nghệ phun xịt',
    notes: 'Kèm 3 bộ pin thông minh và trạm sạc nhanh.',
  },
  {
    id: 'EQ-003',
    code: 'IRRI-SMART-SYS01',
    name: 'Hệ thống tưới tự động IOT Netafim',
    category: 'IRRIGATION',
    categoryName: 'Hệ thống tưới tiêu',
    brand: 'Netafim Israel',
    power: '10 m3/h',
    status: 'ACTIVE',
    statusName: 'Sẵn sàng sử dụng',
    lastMaintenance: '2024-05-10',
    nextMaintenance: '2024-11-10',
    purchaseDate: '2023-01-15',
    assignedTo: 'Khu A - Ớt chuông nhà kính',
    notes: 'Tích hợp cảm biến độ ẩm đất và van điện từ tự động.',
  },
  {
    id: 'EQ-004',
    code: 'HARV-YANMAR-AW70',
    name: 'Máy gặt đập liên hợp Yanmar AW70V',
    category: 'HARVESTER',
    categoryName: 'Máy thu hoạch',
    brand: 'Yanmar Nhật Bản',
    power: '70 HP',
    status: 'MAINTENANCE',
    statusName: 'Đang bảo dưỡng định kỳ',
    lastMaintenance: '2024-07-18',
    nextMaintenance: '2024-07-25',
    purchaseDate: '2021-11-05',
    assignedTo: 'Đội máy nông nghiệp',
    notes: 'Thay xích tải và bảo dưỡng dàn xới thu hoạch.',
  },
  {
    id: 'EQ-005',
    code: 'DRY-SYSTEM-50T',
    name: 'Hệ thống lò sấy nông sản tháp đứng 50 tấn',
    category: 'PROCESSING',
    categoryName: 'Thiết bị chế biến & Sấy',
    brand: 'Việt Nhất Corp',
    power: '50 tấn/mẻ',
    status: 'ACTIVE',
    statusName: 'Sẵn sàng sử dụng',
    lastMaintenance: '2024-04-20',
    nextMaintenance: '2024-10-20',
    purchaseDate: '2022-08-30',
    assignedTo: 'Khu nhà kho trung tâm',
    notes: 'Đã vệ sinh lọc gió và kiểm tra đầu đốt trấu.',
  },
];

const STATUS_TAG_MAP = {
  ACTIVE: { color: 'green', icon: <CheckCircleOutlined />, label: 'Sẵn sàng sử dụng' },
  IN_USE: { color: 'blue', icon: <SyncOutlined spin />, label: 'Đang hoạt động' },
  MAINTENANCE: { color: 'warning', icon: <SettingOutlined spin />, label: 'Đang bảo dưỡng' },
  BROKEN: { color: 'error', icon: <WarningOutlined />, label: 'Hỏng hóc' },
};

const EquipmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);

  useEffect(() => {
    const found = MOCK_EQUIPMENT_LIST.find((e) => e.id === id || e.code === id) || MOCK_EQUIPMENT_LIST[0];
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
            onClick={() => navigate(ROUTER.FM_VIEW_EQUIPMENT_MACHINERY)}
            className="h-10 rounded-xl"
          >
            Quay lại
          </Button>
          <div>
            <TitleCustom className="!mb-0">Chi tiết Máy móc & Thiết bị</TitleCustom>
          </div>
        </div>

        <Button
          type="primary"
          icon={<EditOutlined />}
          onClick={() => navigate(ROUTER.FM_VIEW_EQUIPMENT_EDIT.replace(':id', item.id))}
          className="h-10 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-semibold"
        >
          Chỉnh sửa thông tin
        </Button>
      </div>

      {/* Main Content Card */}
      <Card className="rounded-2xl border-slate-200/80 shadow-xs">
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ToolOutlined className="text-xl text-emerald-600" />
              <Title level={3} className="!mb-0 !text-xl font-bold text-slate-800">
                {item.name}
              </Title>
            </div>
          </div>

          <Tag color={tagInfo.color} icon={tagInfo.icon} className="px-3 py-1 rounded-full text-sm font-semibold self-start sm:self-auto">
            {tagInfo.label}
          </Tag>
        </div>

        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-3">
              <Text strong className="text-base text-slate-800 block mb-2">Thông số máy móc</Text>
              
              <div className="flex justify-between py-1.5 border-b border-slate-200/50 text-sm">
                <Text className="text-slate-500">Phân loại thiết bị:</Text>
                <Tag color="cyan" className="rounded-md font-medium">{item.categoryName}</Tag>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-200/50 text-sm">
                <Text className="text-slate-500">Công suất / Thông số:</Text>
                <Text strong className="text-slate-800">{item.power}</Text>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-200/50 text-sm">
                <Text className="text-slate-500">Ngày mua / Đưa vào dùng:</Text>
                <Text className="font-mono text-slate-700">{dayjs(item.purchaseDate).format('DD/MM/YYYY')}</Text>
              </div>

            </div>
          </Col>

          <Col xs={24} md={12}>
            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-3">
              <Text strong className="text-base text-slate-800 block mb-2">Tình trạng bảo dưỡng</Text>

              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 mt-2">
                <Text className="text-xs text-emerald-800 font-semibold block mb-1">Khuyến nghị vận hành:</Text>
                <Text className="text-xs text-slate-600">
                  Đảm bảo tra mỡ nhiên liệu và vệ sinh bộ lọc bụi sau mỗi 100 giờ vận hành liên tục trên đồng.
                </Text>
              </div>
            </div>
          </Col>
        </Row>

        {item.notes && (
          <>
            <Divider className="my-6" />
            <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200/70">
              <Text strong className="text-amber-900 block mb-1">Ghi chú kỹ thuật & Theo dõi lỗi:</Text>
              <Paragraph className="!mb-0 text-sm text-slate-700">{item.notes}</Paragraph>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default EquipmentDetail;
