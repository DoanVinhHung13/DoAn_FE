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

const getCropIcon = (cropName) => {
  const type = (cropName || '').toLowerCase();
  if (type.includes('gạo') || type.includes('lúa')) return <Wheat className="w-10 h-10 text-amber-600" />;
  if (type.includes('cà phê') || type.includes('coffee')) return <Coffee className="w-10 h-10 text-amber-800" />;
  return <Sprout className="w-10 h-10 text-green-600" />;
};

const getStatusConfig = (status) => {
  const configs = {
    'Chờ thu hoạch': { color: 'orange', antColor: 'orange', bgColor: 'bg-orange-50', textColor: 'text-orange-700', borderColor: 'border-orange-200' },
    'Đang thu hoạch': { color: 'blue', antColor: 'processing', bgColor: 'bg-blue-50', textColor: 'text-blue-700', borderColor: 'border-blue-200' },
    'Đã hoàn thành': { color: 'green', antColor: 'success', bgColor: 'bg-green-50', textColor: 'text-green-700', borderColor: 'border-green-200' },
  };
  return configs[status] || { color: 'default', antColor: 'default', bgColor: 'bg-gray-50', textColor: 'text-gray-700', borderColor: 'border-gray-200' };
};

const getProgressInfo = (status) => {
  if (status === 'Đã hoàn thành') return { percent: 100, status: 'success' };
  if (status === 'Đang thu hoạch') return { percent: 70, status: 'active' };
  return { percent: 30, status: 'normal' };
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

  const statusConfig = getStatusConfig(batch.status);
  const progressInfo = getProgressInfo(batch.status);
  const isCompleted = batch.status === 'Đã hoàn thành';

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
          {isCompleted && (
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
              Tạo mã QR
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
                    className={`${statusConfig.bgColor} ${statusConfig.textColor} border-0 px-3 py-1 rounded-full text-sm font-semibold`}
                  >
                    {batch.status || 'N/A'}
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
                  strokeColor={isCompleted ? '#16a34a' : '#3b82f6'}
                  strokeWidth={10}
                  showInfo={false}
                />
                <Text className="text-xs text-gray-500 block text-right">
                  {isCompleted ? 'Đã hoàn thành thu hoạch' : batch.status}
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
                <div className={`w-3 h-3 rounded-full ${isCompleted ? 'bg-green-500' : batch.status === 'Đang thu hoạch' ? 'bg-blue-500' : 'bg-orange-400'}`} />
                <div>
                  <Text className="block font-semibold text-gray-800">{batch.status || 'Chưa xác định'}</Text>
                  <Text className="text-xs text-gray-500">
                    {isCompleted
                      ? 'Lô đã thu hoạch xong — sẵn sàng tạo mã QR truy xuất'
                      : batch.status === 'Đang thu hoạch'
                      ? 'Đang trong quá trình thu hoạch'
                      : 'Lô chờ đến thời điểm thu hoạch'}
                  </Text>
                </div>
              </div>

              <Divider className="my-3" />

              {/* Actions */}
              <div className="space-y-3">
                {isCompleted ? (
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
                    Tạo mã QR truy xuất
                  </Button>
                ) : (
                  <Button
                    type="primary"
                    size="large"
                    block
                    icon={<QrcodeOutlined />}
                    disabled
                    className="h-12 rounded-lg font-semibold"
                  >
                    Tạo mã QR (Chỉ khi Đã hoàn thành)
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
