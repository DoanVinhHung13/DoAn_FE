import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Button,
  Card,
  Col,
  Descriptions,
  Row,
  Tag,
  Progress,
  Typography,
  Spin,
  Divider,
  Space,
} from 'antd';
import {
  ArrowLeftOutlined,
  QrcodeOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { Coffee, Wheat, Sprout } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';

import TitleCustom from 'src/components/TitleCustom';
import BatchService from 'src/services/BatchService';
import ROUTER from 'src/router/ROUTER';
import { getMockBatchById } from 'src/mocks/batchMockData';

const { Text, Paragraph } = Typography;

// Ánh xạ giá trị API → nhãn tiếng Việt + màu sắc (chia sẻ với Batches list)
// IN_STORAGE = hàng đã vào kho = thu hoạch XONG → 100% và được phép tạo QR
const STATUS_MAP = {
  CREATED:      { label: 'Vừa tạo',               color: 'purple', bgColor: 'bg-purple-100', textColor: 'text-purple-700', borderColor: 'border-purple-300', dot: 'bg-purple-500',  progressPct: 10,  progressStatus: 'normal',    desc: 'Lô vừa được tạo, chưa xử lý' },
  PENDING:      { label: 'Chờ xử lý',             color: 'gold',   bgColor: 'bg-yellow-100', textColor: 'text-yellow-700', borderColor: 'border-yellow-300', dot: 'bg-yellow-400', progressPct: 20,  progressStatus: 'normal',    desc: 'Lô đang chờ xác nhận' },
  IN_PROGRESS:  { label: 'Đang thu hoạch',         color: 'blue',   bgColor: 'bg-blue-100',   textColor: 'text-blue-700',   borderColor: 'border-blue-300',   dot: 'bg-blue-500',   progressPct: 60,  progressStatus: 'active',    desc: 'Đang trong quá trình thu hoạch ngoài đồng' },
  IN_STORAGE:   { label: 'Hoàn thành - Lưu kho',  color: 'green',  bgColor: 'bg-green-100',  textColor: 'text-green-700',  borderColor: 'border-green-300',  dot: 'bg-green-500',  progressPct: 100, progressStatus: 'success',   desc: 'Thu hoạch hoàn thành — hàng đã vào kho, sẵn sàng tạo mã QR' },
  COMPLETED:    { label: 'Đã phân phối',           color: 'teal',   bgColor: 'bg-teal-100',   textColor: 'text-teal-700',   borderColor: 'border-teal-300',   dot: 'bg-teal-500',   progressPct: 100, progressStatus: 'success',   desc: 'Lô đã được phân phối ra thị trường' },
  CANCELLED:    { label: 'Đã huỷ',                color: 'red',    bgColor: 'bg-red-100',    textColor: 'text-red-700',    borderColor: 'border-red-300',    dot: 'bg-red-500',    progressPct: 0,   progressStatus: 'exception', desc: 'Lô đã bị huỷ bỏ' },
  // Legacy Việt
  'Chờ thu hoạch':  { label: 'Chờ thu hoạch',  color: 'orange', bgColor: 'bg-orange-100', textColor: 'text-orange-700', borderColor: 'border-orange-300', dot: 'bg-orange-400', progressPct: 30,  progressStatus: 'normal',  desc: 'Lô chờ đến thời điểm thu hoạch' },
  'Đang thu hoạch': { label: 'Đang thu hoạch', color: 'blue',   bgColor: 'bg-blue-100',   textColor: 'text-blue-700',   borderColor: 'border-blue-300',   dot: 'bg-blue-500',   progressPct: 70,  progressStatus: 'active',  desc: 'Đang trong quá trình thu hoạch' },
  'Đã hoàn thành':  { label: 'Đã hoàn thành',  color: 'green',  bgColor: 'bg-green-100',  textColor: 'text-green-700',  borderColor: 'border-green-300',  dot: 'bg-green-500',  progressPct: 100, progressStatus: 'success', desc: 'Thu hoạch hoàn thành — sẵn sàng tạo mã QR truy xuất' },
};

const PROGRESS_STROKE = {
  green:  { '0%': '#10b981', '100%': '#059669' },
  blue:   { '0%': '#3b82f6', '100%': '#2563eb' },
  cyan:   { '0%': '#06b6d4', '100%': '#0891b2' },
  orange: { '0%': '#f97316', '100%': '#ea580c' },
  purple: { '0%': '#a855f7', '100%': '#9333ea' },
  gold:   { '0%': '#eab308', '100%': '#ca8a04' },
  red:    { '0%': '#ef4444', '100%': '#dc2626' },
};

const getCropIcon = (cropName) => {
  const type = (cropName || '').toLowerCase();
  if (type.includes('gạo') || type.includes('lúa')) return <Wheat className="w-10 h-10 text-amber-600" />;
  if (type.includes('cà phê') || type.includes('coffee')) return <Coffee className="w-10 h-10 text-amber-800" />;
  return <Sprout className="w-10 h-10 text-green-600" />;
};

const BatchDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Fetch batch detail: GET /api/harvest-batches/{id}
  const { data: batch, isLoading } = useQuery({
    queryKey: ['harvest-batch-detail-page', id],
    queryFn: async () => {
      try {
        const response = await BatchService.getBatchById(id);
        return response?.data?.data || response?.data;
      } catch (error) {
        return getMockBatchById(id) || null;
      }
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="p-6">
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(ROUTER.FM_BATCHES)}>
          Quay lại
        </Button>
        <div className="mt-8 text-center text-gray-500">Không tìm thấy thông tin lô thu hoạch.</div>
      </div>
    );
  }

  const statusConfig = STATUS_MAP[batch.status] || {
    label: batch.status || 'Chưa xác định',
    color: 'default', bgColor: 'bg-gray-100', textColor: 'text-gray-700',
    borderColor: 'border-gray-200', dot: 'bg-gray-400',
    progressPct: 10, progressStatus: 'normal',
    desc: 'Trạng thái không xác định',
  };
  const progressInfo = { percent: statusConfig.progressPct, status: statusConfig.progressStatus };
  const strokeColor = PROGRESS_STROKE[statusConfig.color] || { '0%': '#9ca3af', '100%': '#6b7280' };
  const isHarvestCompleted = ['IN_STORAGE', 'COMPLETED', 'Đã hoàn thành'].includes(batch.status);
  const canCreateQR = isHarvestCompleted && batch.isQrEligible === true && !batch.hasActiveQrCode;
  const hasQR = isHarvestCompleted && batch.hasActiveQrCode === true;
  const isCompleted = isHarvestCompleted;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(ROUTER.FM_BATCHES)}
            className="h-10"
          >
            Quay lại
          </Button>
          <TitleCustom>Chi tiết Lô thu hoạch</TitleCustom>
        </div>
        <Space>
          {canCreateQR && (
            <Button
              type="primary"
              icon={<QrcodeOutlined />}
              size="large"
              onClick={() =>
                navigate(
                  `${ROUTER.FM_QR_MANAGEMENT}?batchId=${batch.id}&batchCode=${batch.batchCode}&cropType=${encodeURIComponent(batch.cropName || '')}`
                )
              }
              className="bg-green-600 hover:bg-green-700 h-10 px-5 rounded-lg font-semibold"
            >
              Tạo mã QR mới
            </Button>
          )}
          {hasQR && !canCreateQR && (
            <Button
              type="primary"
              icon={<QrcodeOutlined />}
              size="large"
              onClick={() =>
                navigate(
                  `${ROUTER.FM_QR_MANAGEMENT}?batchId=${batch.id}&batchCode=${batch.batchCode}&cropType=${encodeURIComponent(batch.cropName || '')}`
                )
              }
              className="bg-blue-500 hover:bg-blue-600 h-10 px-5 rounded-lg font-semibold"
            >
              Xem mã QR hiện tại
            </Button>
          )}
        </Space>
      </div>

      {/* Overview card */}
      <Card className="rounded-xl shadow-sm overflow-hidden border-0">
        <div className={`${statusConfig.bgColor} ${statusConfig.borderColor} border rounded-xl p-6`}>
          <Row gutter={[24, 16]} align="middle">
            <Col xs={24} sm={4} className="flex justify-center">
              <div className="flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                {getCropIcon(batch.cropName)}
              </div>
            </Col>
            <Col xs={24} sm={13}>
              <div className="space-y-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <Text className="text-2xl font-bold text-gray-900">{batch.batchCode}</Text>
                  <Tag
                    className={`${statusConfig.bgColor} ${statusConfig.textColor} border ${statusConfig.borderColor} px-3 py-1 rounded-full text-sm font-semibold`}
                  >
                    {statusConfig.label}
                  </Tag>
                </div>
                <Text className="text-lg text-gray-700 font-medium">
                  {batch.cropName || batch.cropType || 'Chưa xác định'}
                </Text>
                {batch.description && (
                  <Paragraph className="!mb-0 text-gray-500 text-sm mt-1">{batch.description}</Paragraph>
                )}
              </div>
            </Col>
            <Col xs={24} sm={7}>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <Text className="text-gray-600">Tiến độ thu hoạch</Text>
                  <Text strong className={statusConfig.textColor}>{progressInfo.percent}%</Text>
                </div>
                <Progress
                  percent={progressInfo.percent}
                  status={progressInfo.status}
                  strokeColor={strokeColor}
                  strokeWidth={10}
                  showInfo={false}
                />
                <Text className={`text-xs block text-right font-medium ${statusConfig.textColor}`}>
                  {statusConfig.label}
                </Text>
              </div>
            </Col>
          </Row>
        </div>
      </Card>

      <Row gutter={24}>
        {/* Thông tin cơ bản */}
        <Col xs={24} lg={14}>
          <Card
            title={
              <div className="flex items-center gap-2">
                <FileTextOutlined className="text-green-600" />
                <span className="font-semibold text-gray-800">Thông tin cơ bản</span>
              </div>
            }
            className="rounded-xl shadow-sm"
          >
            <Descriptions
              column={2}
              labelStyle={{ fontWeight: 600, color: '#4b5563', width: 140 }}
              contentStyle={{ color: '#111827' }}
            >
              {/* batchCode → Mã lô sản xuất */}
              <Descriptions.Item label="Mã lô sản xuất" span={2}>
                <Tag color="blue" className="text-sm font-semibold px-3 py-1">
                  {batch.batchCode || '-'}
                </Tag>
              </Descriptions.Item>

              {/* cropName → Loại cây trồng */}
              <Descriptions.Item label="Loại cây trồng" span={2}>
                <Text strong className="text-base">
                  {batch.cropName || batch.cropType || '-'}
                </Text>
              </Descriptions.Item>

              {/* startDate → Ngày trồng */}
              <Descriptions.Item label="Ngày trồng">
                <Space>
                  <CalendarOutlined className="text-blue-500" />
                  <Text>{batch.startDate ? dayjs(batch.startDate).format('DD/MM/YYYY') : '-'}</Text>
                </Space>
              </Descriptions.Item>

              {/* harvestDate → Ngày thu hoạch */}
              <Descriptions.Item label="Ngày thu hoạch">
                <Space>
                  <CalendarOutlined className="text-green-600" />
                  <Text strong className="text-green-700">
                    {batch.harvestDate ? dayjs(batch.harvestDate).format('DD/MM/YYYY') : '-'}
                  </Text>
                </Space>
              </Descriptions.Item>

              {batch.area && (
                <Descriptions.Item label="Diện tích" span={1}>
                  <Text strong>{batch.area} ha</Text>
                </Descriptions.Item>
              )}

              {batch.landPlotName && (
                <Descriptions.Item label="Vùng trồng" span={1}>
                  <Space>
                    <EnvironmentOutlined className="text-green-600" />
                    <Text>{batch.landPlotName}</Text>
                  </Space>
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        </Col>

        {/* Trạng thái và thao tác */}
        <Col xs={24} lg={10}>
          <Card
            title={
              <div className="flex items-center gap-2">
                <CheckCircleOutlined className="text-green-600" />
                <span className="font-semibold text-gray-800">Trạng thái & Thao tác</span>
              </div>
            }
            className="rounded-xl shadow-sm"
          >
            <div className="space-y-4">
              {/* Status badge */}
              <div className={`${statusConfig.bgColor} rounded-xl p-4 flex items-center gap-3`}>
                <div className={`w-3 h-3 rounded-full flex-shrink-0 ${statusConfig.dot}`} />
                <div>
                  <Text className={`block font-semibold ${statusConfig.textColor}`}>{statusConfig.label}</Text>
                  <Text className="text-xs text-gray-500">{statusConfig.desc}</Text>
                </div>
              </div>

              <Divider className="my-3" />

              {/* Actions */}
              <div className="space-y-3">
                {canCreateQR && (
                  <Button
                    type="primary"
                    size="large"
                    block
                    icon={<QrcodeOutlined />}
                    onClick={() =>
                      navigate(
                        `${ROUTER.FM_QR_MANAGEMENT}?batchId=${batch.id}&batchCode=${batch.batchCode}&cropType=${encodeURIComponent(batch.cropName || '')}`
                      )
                    }
                    className="h-12 rounded-lg bg-green-600 hover:bg-green-700 font-semibold"
                  >
                    Tạo mã QR truy xuất mới
                  </Button>
                )}

                {hasQR && !canCreateQR && (
                  <Button
                    type="primary"
                    size="large"
                    block
                    icon={<QrcodeOutlined />}
                    onClick={() =>
                      navigate(
                        `${ROUTER.FM_QR_MANAGEMENT}?batchId=${batch.id}&batchCode=${batch.batchCode}&cropType=${encodeURIComponent(batch.cropName || '')}`
                      )
                    }
                    className="h-12 rounded-lg bg-blue-500 hover:bg-blue-600 font-semibold"
                  >
                    Xem mã QR hiện tại ({batch.activeTraceCode})
                  </Button>
                )}

                {!canCreateQR && !hasQR && (
                  <Button
                    size="large"
                    block
                    icon={<QrcodeOutlined />}
                    disabled
                    className="h-12 rounded-lg font-semibold"
                  >
                    Chưa đủ điều kiện tạo QR
                  </Button>
                )}

                <Button
                  size="large"
                  block
                  icon={<ArrowLeftOutlined />}
                  onClick={() => navigate(ROUTER.FM_BATCHES)}
                  className="h-11 rounded-lg"
                >
                  Quay lại danh sách
                </Button>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default BatchDetail;
