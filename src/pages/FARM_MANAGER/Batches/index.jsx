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
  Table,
  Tooltip,
} from 'antd';
import {
  QrcodeOutlined,
  PlusCircleOutlined,
  FilterOutlined,
  EyeOutlined,
  InboxOutlined,
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

  const getProgressStatus = (expectedDate, status) => {
    // Nếu đã hoàn thành → 100%
    if (status === 'Đã hoàn thành') {
      return {
        percent: 100,
        status: 'success',
        text: 'Đã hoàn thành',
        color: 'green',
      };
    }

    // Nếu đang thu hoạch → 50-90%
    if (status === 'Đang thu hoạch') {
      return {
        percent: 70,
        status: 'active',
        text: 'Đang tiến hành thu hoạch',
        color: 'blue',
      };
    }

    // Nếu chờ thu hoạch → tính theo ngày
    if (!expectedDate) {
      return { percent: 0, status: 'normal', text: 'Chưa xác định', color: 'gray' };
    }
    
    const today = dayjs();
    const expected = dayjs(expectedDate);
    const diff = expected.diff(today, 'day');

    if (diff < 0) {
      // Quá hạn nhưng chưa thu hoạch
      return {
        percent: 100,
        status: 'exception',
        text: `Quá hạn ${Math.abs(diff)} ngày`,
        color: 'red',
      };
    } else if (diff === 0) {
      return {
        percent: 95,
        status: 'active',
        text: 'Hôm nay',
        color: 'orange',
      };
    } else if (diff <= 7) {
      return {
        percent: 80,
        status: 'active',
        text: `Còn ${diff} ngày`,
        color: 'orange',
      };
    } else {
      // Tính % dựa trên thời gian (giả sử chu kỳ 100 ngày)
      const progress = Math.min(50, Math.max(10, 100 - diff));
      return {
        percent: progress,
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
      <Card className="rounded-xl shadow-sm overflow-hidden" loading={isLoading}>
        <Table
          dataSource={batches}
          rowKey="id"
          pagination={false}
          className="batch-table"
          rowClassName={() => "hover:bg-green-50"}
          columns={[
            {
              title: 'Mã lô',
              dataIndex: 'batchCode',
              key: 'batchCode',
              width: 180,
              render: (text, record) => (
                <div>
                  <Text strong className="block text-sm">{text}</Text>
                  <Text className="text-xs text-gray-500">
                    Bắt đầu: {record.startDate ? dayjs(record.startDate).format('DD/MM/YYYY') : '-'}
                  </Text>
                </div>
              ),
            },
            {
              title: 'Sản phẩm',
              key: 'cropName',
              width: 200,
              render: (_, record) => (
                <div className="flex items-center gap-2">
                  <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 bg-amber-50 rounded-lg border border-amber-200">
                    {getCropIcon(record.cropName)}
                  </div>
                  <Text className="text-sm font-medium">{record.cropName || 'N/A'}</Text>
                </div>
              ),
            },
            {
              title: 'Diện tích',
              dataIndex: 'area',
              key: 'area',
              width: 100,
              render: (area) => (
                <Text className="text-sm font-semibold">{area ? `${area} ha` : '-'}</Text>
              ),
            },
            {
              title: 'Tiến độ thu hoạch',
              key: 'progress',
              width: 250,
              render: (_, record) => {
                const progressInfo = getProgressStatus(record.expectedHarvestDate, record.status);
                return (
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Progress
                        percent={progressInfo.percent}
                        status={progressInfo.status}
                        strokeColor={{
                          '0%': progressInfo.color === 'green' ? '#10b981' : progressInfo.color === 'red' ? '#ef4444' : '#3b82f6',
                          '100%': progressInfo.color === 'green' ? '#059669' : progressInfo.color === 'red' ? '#dc2626' : '#2563eb',
                        }}
                        strokeWidth={8}
                        showInfo={false}
                        className="flex-1"
                      />
                      <span className={`text-xs font-bold whitespace-nowrap ${
                        progressInfo.color === 'green' ? 'text-green-600' :
                        progressInfo.color === 'red' ? 'text-red-600' : 'text-blue-600'
                      }`}>
                        {progressInfo.percent}%
                      </span>
                    </div>
                    <Text className="text-xs text-gray-500">{progressInfo.text}</Text>
                  </div>
                );
              },
            },
            {
              title: 'Sản lượng dự kiến',
              dataIndex: 'expectedYield',
              key: 'expectedYield',
              width: 150,
              render: (yield_val) => (
                <Text strong className="text-sm text-blue-600">
                  {yield_val ? `${yield_val} Tấn` : '-'}
                </Text>
              ),
            },
            {
              title: 'Trạng thái',
              dataIndex: 'status',
              key: 'status',
              width: 140,
              render: (status) => {
                const config = getStatusConfig(status);
                return (
                  <Tag className={`${config.bgColor} ${config.textColor} border-0 px-3 py-1 rounded-full text-xs font-medium`}>
                    {status || 'N/A'}
                  </Tag>
                );
              },
            },
            {
              title: 'Thao tác',
              key: 'actions',
              width: 200,
              fixed: 'right',
              render: (_, record) => {
                const isCompleted = record.status === 'Đã hoàn thành';
                return (
                  <Space size="small">
                    <Tooltip title={!isCompleted ? 'Chỉ tạo QR cho lô đã hoàn thành' : 'Tạo mã QR'}>
                      <Button
                        type="primary"
                        icon={<QrcodeOutlined />}
                        size="middle"
                        onClick={() => handleCreateQR(record)}
                        disabled={!isCompleted}
                        className={isCompleted ? 'bg-green-600 hover:bg-green-700' : ''}
                      />
                    </Tooltip>
                    <Button
                      type="link"
                      icon={<EyeOutlined />}
                      size="small"
                      onClick={() => navigate(`${ROUTER.FM_BATCH_DETAIL.replace(':id', record.id)}`)}
                      className="text-blue-600"
                    >
                      Xem chi tiết
                    </Button>
                  </Space>
                );
              },
            },
          ]}
          locale={{
            emptyText: (
              <div className="py-12">
                <InboxOutlined className="text-5xl text-gray-300 mb-3" />
                <Text className="text-gray-400">Không có lô thu hoạch nào</Text>
              </div>
            ),
          }}
        />
      </Card>

      <style jsx>{`
        :global(.batch-table .ant-table) {
          font-size: 13px;
        }
        :global(.batch-table .ant-table-thead > tr > th) {
          background: #f0fdf4 !important;
          color: #166534;
          font-weight: 600;
          font-size: 13px;
          padding: 12px 16px;
          border-bottom: 2px solid #bbf7d0;
        }
        :global(.batch-table .ant-table-tbody > tr > td) {
          padding: 12px 16px;
          border-bottom: 1px solid #f0f0f0;
        }
        :global(.batch-table .ant-table-tbody > tr:hover > td) {
          background: #f0fdf4 !important;
        }
      `}</style>
    </div>
  );
};

export default Batches;
