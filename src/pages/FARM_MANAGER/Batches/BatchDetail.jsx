import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Button,
  Card,
  Col,
  Descriptions,
  Row,
  Tag,
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
import { SYSTEM_KEY } from 'src/constants/systemKey';
import { useSystemKey } from 'src/hooks/useSystemKey';
import BatchService from 'src/services/BatchService';
import ROUTER from 'src/router/ROUTER';
import { getMockBatchById } from 'src/mocks/batchMockData';

const { Text, Paragraph } = Typography;

const QR_STATUS = {
  NOT_CREATED: {
    label: 'Chưa tạo QR',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-700',
    borderColor: 'border-orange-300',
    dot: 'bg-orange-500',
    desc: 'Lô chưa có mã QR đang hoạt động',
  },
  CREATED: {
    label: 'Đã tạo QR',
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
    borderColor: 'border-green-300',
    dot: 'bg-green-500',
    desc: 'Lô đã có mã QR đang hoạt động',
  },
};

const getQrStatus = (batch) => {
  if (batch?.qrStatus === 'CREATED' || batch?.qrStatus === 'NOT_CREATED') {
    return batch.qrStatus;
  }
  return batch?.hasActiveQrCode === true ? 'CREATED' : 'NOT_CREATED';
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
  const { getDescription } = useSystemKey();

  // Fetch batch detail: GET /api/harvest-batches/{id}
  const { data: batch, isLoading } = useQuery({
    queryKey: ['harvest-batch-detail-page', id],
    queryFn: async () => {
      try {
        const response = await BatchService.getBatchById(id);
        return response?.data?.data || response?.data;
      } catch {
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

  const qrStatus = getQrStatus(batch);
  const fallbackStatusConfig = QR_STATUS[qrStatus] || QR_STATUS.NOT_CREATED;
  const statusConfig = {
    ...fallbackStatusConfig,
    label: getDescription(SYSTEM_KEY.QR_STATUS, qrStatus) || fallbackStatusConfig.label,
  };
  const canCreateQR = batch.isQrEligible === true && batch.hasActiveQrCode === false;
  const hasQR = batch.hasActiveQrCode === true;

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
                    `${ROUTER.FM_QR_MANAGEMENT}?batchId=${batch.id}&batchCode=${batch.batchCode}&cropType=${encodeURIComponent(batch.cropName || '')}&preview=1`
                )
              }
              className="bg-green-600 hover:bg-green-700 h-10 px-5 rounded-lg font-semibold"
            >
              Xem trước QR
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
              <Col xs={24} sm={20}>
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
                        `${ROUTER.FM_QR_MANAGEMENT}?batchId=${batch.id}&batchCode=${batch.batchCode}&cropType=${encodeURIComponent(batch.cropName || '')}&preview=1`
                      )
                    }
                    className="h-12 rounded-lg bg-green-600 hover:bg-green-700 font-semibold"
                  >
                    Xem trước QR
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
