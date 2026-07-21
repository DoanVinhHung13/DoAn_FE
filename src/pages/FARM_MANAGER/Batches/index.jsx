import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  Input,
  Select,
  DatePicker,
  Row,
  Col,
  Tag,
  Progress,
  Space,
  Typography,
  message,
  Modal,
} from 'antd';
import {
  QrcodeOutlined,
  PlusCircleOutlined,
  FilterOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { Coffee, Wheat, Sprout } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';

import BatchService from 'src/services/BatchService';
import ROUTER from 'src/router/ROUTER';
import { mockBatches, filterMockBatches } from 'src/mocks/batchMockData';

const { Text, Title, Paragraph } = Typography;

const Batches = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    batchCode: '',
    status: '',
    expectedDate: null,
  });

  // Fetch batches with fallback to mock data
  const { data: batchesData, isLoading } = useQuery({
    queryKey: ['batches', filters],
    queryFn: async () => {
      try {
        const response = await BatchService.getBatches({
          batchCode: filters.batchCode,
          status: filters.status,
          expectedDate: filters.expectedDate ? dayjs(filters.expectedDate).format('YYYY-MM-DD') : null,
        });
        return response?.data?.data || response?.data || { items: [], total: 0 };
      } catch (error) {
        // Fallback to mock data if API fails
        console.log('Using mock data for batches');
        const filteredBatches = filterMockBatches(filters);
        return { items: filteredBatches, total: filteredBatches.length };
      }
    },
    retry: false,
    initialData: { items: mockBatches, total: mockBatches.length }, // Use mock data initially
  });

  const batches = batchesData?.items || mockBatches;

  const handleApplyFilters = () => {
    queryClient.invalidateQueries({ queryKey: ['batches'] });
  };

  const handleCreateQR = (batch) => {
    navigate(`${ROUTER.FM_QR_MANAGEMENT}?batchId=${batch.id}&batchCode=${batch.batchCode}&cropType=${encodeURIComponent(batch.cropName || '')}`);
  };

  const getCropIcon = (cropType) => {
    const type = cropType?.toLowerCase() || '';
    if (type.includes('gạo') || type.includes('lúa')) return <Wheat className="w-8 h-8 text-amber-600" />;
    if (type.includes('cà phê') || type.includes('coffee')) return <Coffee className="w-8 h-8 text-amber-800" />;
    return <Sprout className="w-8 h-8 text-green-600" />;
  };

  const getStatusConfig = (status) => {
    const configs = {
      'Chờ thu hoạch': { color: 'orange', bgColor: 'bg-orange-100', textColor: 'text-orange-700' },
      'Đang thu hoạch': { color: 'blue', bgColor: 'bg-blue-100', textColor: 'text-blue-700' },
      'Đã hoàn thành': { color: 'green', bgColor: 'bg-green-100', textColor: 'text-green-700' },
    };
    return configs[status] || { color: 'default', bgColor: 'bg-gray-100', textColor: 'text-gray-700' };
  };

  const getProgressStatus = (expectedDate) => {
    if (!expectedDate) return { percent: 0, status: 'normal', text: '', color: '' };
    
    const today = dayjs();
    const expected = dayjs(expectedDate);
    const diff = expected.diff(today, 'day');

    if (diff < 0) {
      return { 
        percent: 100, 
        status: 'exception', 
        text: `Đã xong: ${Math.abs(diff).toString().padStart(2, '0')}/${Math.abs(diff).toString().padStart(2, '0')}`,
        color: 'red',
      };
    } else if (diff === 0) {
      return { 
        percent: 50, 
        status: 'active', 
        text: 'Hôm nay',
        color: 'green',
      };
    } else {
      return { 
        percent: 30, 
        status: 'normal', 
        text: `Dự kiến: ${expected.format('DD/MM/YYYY')}`,
        color: 'blue',
      };
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Title level={2} className="!mb-2">Quản lý Lô thu hoạch</Title>
          <Paragraph className="text-gray-600 !mb-0">
            Theo dõi và điều phối các lô hàng nông sản chuẩn bị xuất kho. Đảm bảo quy trình thu hoạch đúng tiến độ và đạt tiêu chuẩn chất lượng.
          </Paragraph>
        </div>
        <Button
          type="primary"
          icon={<PlusCircleOutlined />}
          size="large"
          onClick={() => navigate(`${ROUTER.FM_BATCH_CREATE}`)}
          className="bg-green-600 hover:bg-green-700 h-12 px-6 rounded-lg font-semibold"
        >
          Tạo lô thu hoạch mới
        </Button>
      </div>

      {/* Filters */}
      <Card className="rounded-xl shadow-sm">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <div>
              <Text className="block mb-2 text-gray-700 font-medium">Mã lô</Text>
              <Input
                placeholder="LOT-XXX...."
                size="large"
                value={filters.batchCode}
                onChange={(e) => setFilters({ ...filters, batchCode: e.target.value })}
                className="rounded-lg"
              />
            </div>
          </Col>
          <Col xs={24} sm={8}>
            <div>
              <Text className="block mb-2 text-gray-700 font-medium">Trạng thái</Text>
              <Select
                placeholder="Tất cả trạng thái"
                size="large"
                value={filters.status || undefined}
                onChange={(value) => setFilters({ ...filters, status: value })}
                className="w-full rounded-lg"
                options={[
                  { value: '', label: 'Tất cả trạng thái' },
                  { value: 'Chờ thu hoạch', label: 'Chờ thu hoạch' },
                  { value: 'Đang thu hoạch', label: 'Đang thu hoạch' },
                  { value: 'Đã hoàn thành', label: 'Đã hoàn thành' },
                ]}
              />
            </div>
          </Col>
          <Col xs={24} sm={8}>
            <div>
              <Text className="block mb-2 text-gray-700 font-medium">Ngày dự kiến</Text>
              <DatePicker
                placeholder="mm/dd/yyyy"
                size="large"
                format="DD/MM/YYYY"
                value={filters.expectedDate}
                onChange={(date) => setFilters({ ...filters, expectedDate: date })}
                className="w-full rounded-lg"
              />
            </div>
          </Col>
        </Row>
        <div className="mt-4 flex justify-end">
          <Button
            icon={<FilterOutlined />}
            size="large"
            onClick={handleApplyFilters}
            className="rounded-lg bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 font-medium px-8"
          >
            Áp dụng bộ lọc
          </Button>
        </div>
      </Card>

      {/* Batch List */}
      <Card className="rounded-xl shadow-sm" loading={isLoading}>
        <div className="space-y-4">
          {/* Table Header */}
          <Row className="bg-blue-50 py-3 px-4 rounded-lg">
            <Col span={3}>
              <Text strong className="text-gray-700">Mã lô</Text>
            </Col>
            <Col span={4}>
              <Text strong className="text-gray-700">Sản phẩm</Text>
            </Col>
            <Col span={3}>
              <Text strong className="text-gray-700">Diện tích</Text>
            </Col>
            <Col span={4}>
              <Text strong className="text-gray-700">Tiến độ thu hoạch</Text>
            </Col>
            <Col span={3}>
              <Text strong className="text-gray-700">Sản lượng dự kiến</Text>
            </Col>
            <Col span={3}>
              <Text strong className="text-gray-700">Trạng thái</Text>
            </Col>
            <Col span={4}>
              <Text strong className="text-gray-700">Thao tác</Text>
            </Col>
          </Row>

          {/* Batch Items */}
          {batches.length > 0 ? (
            batches.map((batch) => {
              const statusConfig = getStatusConfig(batch.status);
              const progressInfo = getProgressStatus(batch.expectedHarvestDate);
              
              return (
                <Row key={batch.id} className="border-b border-gray-100 py-4 px-4 hover:bg-gray-50 items-center">
                  <Col span={3}>
                    <div>
                      <Text strong className="text-base">{batch.batchCode}</Text>
                      <div className="text-xs text-gray-500 mt-1">
                        Bắt đầu: {batch.startDate ? dayjs(batch.startDate).format('DD/MM/YYYY') : '-'}
                      </div>
                    </div>
                  </Col>
                  <Col span={4}>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-12 h-12 bg-green-50 rounded-lg">
                        {getCropIcon(batch.cropName)}
                      </div>
                      <Text className="font-medium">{batch.cropName || 'N/A'}</Text>
                    </div>
                  </Col>
                  <Col span={3}>
                    <Text>{batch.area ? `${batch.area} ha` : '-'}</Text>
                  </Col>
                  <Col span={4}>
                    <div>
                      <Progress 
                        percent={progressInfo.percent} 
                        status={progressInfo.status}
                        strokeColor={progressInfo.color === 'green' ? '#10b981' : progressInfo.color === 'red' ? '#ef4444' : '#3b82f6'}
                        size="small"
                      />
                      <Text className="text-xs text-gray-600 mt-1 block">{progressInfo.text}</Text>
                    </div>
                  </Col>
                  <Col span={3}>
                    <Text strong className="text-base">{batch.expectedYield ? `${batch.expectedYield} Tấn` : '-'}</Text>
                  </Col>
                  <Col span={3}>
                    <Tag className={`${statusConfig.bgColor} ${statusConfig.textColor} border-0 px-3 py-1 rounded-full`}>
                      {batch.status || 'N/A'}
                    </Tag>
                  </Col>
                  <Col span={4}>
                    <Space size="small">
                      <Button
                        type="primary"
                        icon={<QrcodeOutlined />}
                        onClick={() => handleCreateQR(batch)}
                        disabled={batch.status !== 'Đã hoàn thành'}
                        className={`rounded-lg ${
                          batch.status === 'Đã hoàn thành' 
                            ? 'bg-green-600 hover:bg-green-700' 
                            : 'bg-gray-300 cursor-not-allowed'
                        }`}
                        title={batch.status !== 'Đã hoàn thành' ? 'Chỉ tạo QR cho lô đã hoàn thành' : 'Tạo mã QR'}
                      />
                      <Button
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() => navigate(`${ROUTER.FM_BATCH_DETAIL.replace(':id', batch.id)}`)}
                        className="text-blue-600"
                      >
                        Xem chi tiết
                      </Button>
                    </Space>
                  </Col>
                </Row>
              );
            })
          ) : (
            <div className="text-center py-12">
              <Text className="text-gray-400">Không có lô thu hoạch nào</Text>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Batches;
