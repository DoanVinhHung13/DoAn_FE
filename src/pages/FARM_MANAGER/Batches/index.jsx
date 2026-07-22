import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  Input,
  Select,
  Tag,
  Progress,
  Typography,
  Tooltip,
} from 'antd';
import {
  QrcodeOutlined,
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { Coffee, Wheat, Sprout } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';

import TitleCustom from 'src/components/TitleCustom';
import CustomTable from 'src/components/Table/CustomTable';
import BatchService from 'src/services/BatchService';
import ROUTER from 'src/router/ROUTER';
import { mockBatches, filterMockBatches } from 'src/mocks/batchMockData';
import { DEFAULT_PAGE_SIZE, PAGE_SIZE } from 'src/constants/pageSizeOptions';
import { invalidCharsRegex } from 'src/utils/helpers';

const { Text, Paragraph } = Typography;

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'Chờ thu hoạch', label: 'Chờ thu hoạch' },
  { value: 'Đang thu hoạch', label: 'Đang thu hoạch' },
  { value: 'Đã hoàn thành', label: 'Đã hoàn thành' },
];

const Batches = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // ── Filters & Pagination state ──────────────────────────────────────────────
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  // ── Fetch batches ────────────────────────────────────────────────────────────
  const { data: batchesData, isLoading, refetch } = useQuery({
    queryKey: ['batches', page, pageSize, search, statusFilter],
    queryFn: async () => {
      try {
        const response = await BatchService.getBatches({
          PageIndex: page,
          PageSize: pageSize,
          SearchKeyword: search || undefined,
          batchCode: search || undefined,
          status: statusFilter === 'all' ? undefined : statusFilter,
        });

        const payload = response?.data?.data || response?.data || {};
        const items = Array.isArray(payload) ? payload : payload.items || payload.results || [];
        const total = payload.totalItems || payload.total || items.length;

        return { items, total };
      } catch (error) {
        // Fallback to mock data if API fails
        let filtered = filterMockBatches({
          batchCode: search,
          status: statusFilter === 'all' ? '' : statusFilter,
        });
        const total = filtered.length;
        const startIndex = (page - 1) * pageSize;
        const paginatedItems = filtered.slice(startIndex, startIndex + pageSize);
        return { items: paginatedItems, total };
      }
    },
    retry: false,
  });

  const batches = batchesData?.items || [];
  const totalRecords = batchesData?.total || 0;

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleSearch = useCallback(() => {
    if (invalidCharsRegex.test(searchInput)) {
      return;
    }
    setSearch(searchInput.trim());
    setPage(1);
  }, [searchInput]);

  const handleClearSearch = () => {
    setSearchInput('');
    setSearch('');
    setPage(1);
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
    if (status === 'Đã hoàn thành') {
      return {
        percent: 100,
        status: 'success',
        text: 'Đã hoàn thành',
        color: 'green',
      };
    }

    if (status === 'Đang thu hoạch') {
      return {
        percent: 70,
        status: 'active',
        text: 'Đang tiến hành thu hoạch',
        color: 'blue',
      };
    }

    return {
      percent: 30,
      status: 'normal',
      text: status || 'Chờ thu hoạch',
      color: 'orange',
    };
  };

  const columns = [
    {
      title: 'STT',
      key: 'stt',
      width: 60,
      align: 'center',
      render: (_, __, index) => (
        <Text className="text-sm font-medium text-gray-500">
          {(page - 1) * pageSize + index + 1}
        </Text>
      ),
    },
    {
      title: 'Mã lô',
      dataIndex: 'batchCode',
      key: 'batchCode',
      width: 180,
      render: (text, record) => (
        <div>
          <Text strong className="block text-sm text-green-700">{text}</Text>
          <Text className="text-xs text-gray-500">
            Bắt đầu: {record.startDate ? dayjs(record.startDate).format('DD/MM/YYYY') : '-'}
          </Text>
        </div>
      ),
    },
    {
      title: 'Sản phẩm',
      key: 'cropName',
      width: 220,
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
      width: 120,
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
      width: 90,
      align: 'center',
      fixed: 'right',
      render: (_, record) => {
        const isCompleted = record.status === 'Đã hoàn thành';
        return (
          <Tooltip title={!isCompleted ? 'Chỉ tạo QR cho lô đã hoàn thành' : 'Tạo mã QR'}>
            <Button
              type="primary"
              icon={<QrcodeOutlined />}
              size="middle"
              onClick={(e) => { e.stopPropagation(); handleCreateQR(record); }}
              disabled={!isCompleted}
              className={isCompleted ? 'bg-green-600 hover:bg-green-700' : ''}
            />
          </Tooltip>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 duration-500 animate-in fade-in slide-in-from-bottom-4">
      {/* ── Header ── */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <TitleCustom className="!mb-0">Quản lý Lô thu hoạch</TitleCustom>
          <Paragraph className="text-gray-600 !mb-0 mt-1">
            Theo dõi và điều phối các lô hàng nông sản chuẩn bị xuất kho. Đảm bảo quy trình thu hoạch đúng tiến độ và đạt tiêu chuẩn chất lượng.
          </Paragraph>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate(ROUTER.FM_BATCH_CREATE)}
          className="flex-shrink-0 h-10 px-5 font-bold bg-green-600 border-0 shadow-lg rounded-xl shadow-green-100"
        >
          Tạo lô thu hoạch mới
        </Button>
      </div>

      {/* ── Table Card with Toolbar ── */}
      <Card
        bordered={false}
        className="shadow-sm rounded-2xl"
        bodyStyle={{ padding: 0 }}
      >
        {/* Toolbar */}
        <div className="flex flex-col gap-3 p-5 border-b border-gray-100 sm:flex-row sm:flex-wrap">
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onPressEnter={handleSearch}
            placeholder="Tìm theo mã lô..."
            prefix={<SearchOutlined className="text-gray-300" />}
            className="w-64 h-10 rounded-xl"
            allowClear
            onClear={handleClearSearch}
          />
          <Select
            value={statusFilter}
            onChange={(val) => {
              setStatusFilter(val);
              setPage(1);
            }}
            className="h-10 rounded-xl min-w-[180px]"
            options={STATUS_OPTIONS}
          />
          <div className="flex gap-2 ml-auto">
            <Button
              onClick={handleSearch}
              icon={<SearchOutlined />}
              className="h-10 px-4 font-semibold rounded-xl bg-gray-50"
            >
              Tìm kiếm
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => refetch()}
              loading={isLoading}
              className="h-10 px-3 rounded-xl bg-gray-50"
            />
          </div>
        </div>

        {/* Table */}
        <CustomTable
          dataSource={batches}
          columns={columns}
          rowKey="id"
          loading={isLoading}
          onRow={(record) => ({
            onClick: (e) => {
              if (e.target.closest('button')) return;
              navigate(ROUTER.FM_BATCH_DETAIL.replace(':id', record.id));
            },
          })}
          textEmpty="Không có lô thu hoạch nào"
          pagination={{
            current: page,
            pageSize,
            total: totalRecords,
            showSizeChanger: true,
            pageSizeOptions: PAGE_SIZE,
            showTotal: (total, range) => (
              <span className="text-xs text-gray-500">
                {range[0]}–{range[1]} / <strong>{total}</strong>
              </span>
            ),
            onChange: (p, ps) => {
              setPage(p);
              setPageSize(ps);
            },
          }}
          rowClassName="hover:bg-green-50/50 transition-colors cursor-pointer"
        />
      </Card>
    </div>
  );
};

export default Batches;
