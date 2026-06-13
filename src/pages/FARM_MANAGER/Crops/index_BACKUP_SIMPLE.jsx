import React, { useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Descriptions,
  Drawer,
  Empty,
  Form,
  Input,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Tooltip,
  Typography,
  message,
} from 'antd';
import {
  CheckCircleOutlined,
  EditOutlined,
  EyeOutlined,
  FileTextOutlined,
  SearchOutlined,
  StopOutlined,
  PlusOutlined,
  CalendarOutlined,
  SafetyOutlined,
  BookOutlined,
  CheckSquareOutlined,
} from '@ant-design/icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Sprout } from 'lucide-react';

import TitleCustom from 'src/components/TitleCustom';
import CropManagementService from 'src/services/CropManagementService';

const { Text } = Typography;

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'active', label: 'Đang hoạt động' },
  { value: 'inactive', label: 'Ngừng hoạt động' },
];

const SORT_OPTIONS = [
  { value: 'name-asc', label: 'Tên A-Z' },
  { value: 'name-desc', label: 'Tên Z-A' },
];

const EMPTY_MESSAGE = 'Không tìm thấy thông tin cây trồng.';

const getItemId = (item) => item?.id || item?._id;

const displayValue = (value) => value || 'Chưa cập nhật';

const normalizeCropResponse = (response) => {
  const payload = response?.data ?? response ?? {};
  const data = payload?.data ?? payload;

  const items = Array.isArray(data)
    ? data
    : data?.items ||
      data?.results ||
      data?.crops ||
      payload?.items ||
      payload?.results ||
      [];

  return {
    items,
    total:
      data?.totalCount ||
      data?.totalItems ||
      data?.total ||
      payload?.totalCount ||
      items.length,
  };
};

const isCropActive = (item) => {
  if (typeof item?.isActive === 'boolean') return item.isActive;
  const status = String(item?.status || '').toLowerCase();
  return !['inactive', 'disabled', 'deleted', 'ngừng hoạt động'].includes(status);
};

const getStatusLabel = (item) =>
  isCropActive(item) ? 'Đang hoạt động' : 'Ngừng hoạt động';

const Crops = () => {
  const queryClient = useQueryClient();
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('all');
  const [cropCatalog, setCropCatalog] = useState('all');
  const [sortBy, setSortBy] = useState('name-asc');
  const [selectedCropId, setSelectedCropId] = useState(null);

  // TODO: Chờ backend implement endpoint riêng cho Crop Management
  // Tạm thời dùng mock data
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['crops'],
    queryFn: async () => {
      // Mock data - sẽ thay thế bằng API thật khi backend sẵn sàng
      message.info('Đang dùng dữ liệu mẫu. Chờ backend implement API /crops.');
      return {
        items: [],
        total: 0
      };
      
      // Uncomment khi backend đã sẵn sàng:
      // const response = await CropManagementService.getCrops({
      //   PageIndex: 1,
      //   PageSize: 200,
      // });
      // message.success('Tải thông tin cây trồng thành công.');
      // return normalizeCropResponse(response);
    },
    retry: false,
  });

  const {
    data: cropDetail,
    isLoading: isDetailLoading,
    isError: isDetailError,
  } = useQuery({
    queryKey: ['crop-detail', selectedCropId],
    queryFn: async () => {
      const response = await CropManagementService.getCropById(selectedCropId);
      const payload = response?.data ?? {};
      return payload?.data ?? payload;
    },
    enabled: !!selectedCropId,
    retry: false,
  });

  const filteredCrops = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLocaleLowerCase('vi');
    const rows = (data?.items || []).filter((item) => {
      const matchesKeyword =
        !normalizedKeyword ||
        [
          item.cropName,
          item.cropCatalogName,
          item.cropCatalog?.name,
          item.landPlotName,
          item.landPlot?.name,
          item.cropProcess,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value).toLocaleLowerCase('vi').includes(normalizedKeyword)
          );

      const matchesStatus =
        status === 'all' ||
        (status === 'active' && isCropActive(item)) ||
        (status === 'inactive' && !isCropActive(item));
        
      const matchesCatalog = 
        cropCatalog === 'all' || 
        item.cropCatalogId === cropCatalog ||
        item.cropCatalog?.id === cropCatalog;

      return matchesKeyword && matchesStatus && matchesCatalog;
    });

    return [...rows].sort((first, second) => {
      const firstName = String(first.cropName || '').localeCompare(String(second.cropName || ''), 'vi');
      const firstDate = new Date(first.startDate || first.plantingDate || 0).getTime();
      const secondDate = new Date(second.startDate || second.plantingDate || 0).getTime();

      switch (sortBy) {
        case 'name-desc':
          return -firstName;
        case 'date-asc':
          return firstDate - secondDate;
        case 'date-desc':
          return secondDate - firstDate;
        case 'name-asc':
        default:
          return firstName;
      }
    });
  }, [cropCatalog, data?.items, keyword, sortBy, status]);

  const cropCatalogOptions = useMemo(() => {
    const catalogs = new Map();
    (data?.items || []).forEach((item) => {
      const id = item.cropCatalogId || item.cropCatalog?.id;
      const name = item.cropCatalogName || item.cropCatalog?.name;
      if (id && name) {
        catalogs.set(id, name);
      }
    });
    
    return [
      { value: 'all', label: 'Tất cả danh mục' },
      ...Array.from(catalogs.entries()).map(([id, name]) => ({ value: id, label: name })),
    ];
  }, [data?.items]);

  const columns = [
    {
      title: 'STT',
      key: 'index',
      width: 80,
      render: (_, __, index) => (
        <Text className="font-medium text-gray-400">{index + 1}</Text>
      ),
    },
    {
      title: 'Tên loại cây trồng',
      dataIndex: 'name',
      key: 'name',
      width: 300,
      render: (value) => (
        <Text strong className="block truncate text-gray-900">
          {displayValue(value)}
        </Text>
      ),
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (value) => (
        <Text type="secondary" className="block truncate text-sm">
          {displayValue(value)}
        </Text>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 180,
      render: (_, record) => {
        const isActive = isCropActive(record);
        return (
          <div
            className={`rounded-full px-4 py-2 font-semibold text-sm inline-flex items-center justify-center gap-2 ${
              isActive 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-50 text-red-600'
            }`}
          >
            {isActive ? <CheckCircleOutlined /> : <StopOutlined />}
            {getStatusLabel(record)}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <TitleCustom className="!mb-0 flex items-center gap-2">
          <Sprout className="h-6 w-6" />
          Danh mục cây trồng
        </TitleCustom>
      </div>

      {isError && (
        <Alert
          showIcon
          type="error"
          message="Không thể tải danh sách cây trồng."
          action={
            <Button size="small" onClick={() => refetch()}>
              Thử lại
            </Button>
          }
        />
      )}

      <Card variant="borderless" className="rounded-lg shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_200px_200px]">
          <Input
            allowClear
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            prefix={<SearchOutlined className="text-gray-400" />}
            placeholder="Tìm theo tên loại cây trồng..."
            className="h-11 rounded-lg"
          />
          <Select
            value={status}
            onChange={setStatus}
            options={STATUS_OPTIONS}
            className="h-11"
          />
          <Select
            value={sortBy}
            onChange={setSortBy}
            options={SORT_OPTIONS}
            className="h-11"
          />
        </div>
      </Card>

      <Card
        variant="borderless"
        className="overflow-hidden rounded-lg shadow-sm"
        styles={{ body: { padding: 0 } }}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <FileTextOutlined className="text-green-600" />
            <Text strong>Danh sách cây trồng</Text>
          </div>
          <Text type="secondary" className="!text-sm">
            {filteredCrops.length} bản ghi
          </Text>
        </div>

        <Table
          rowKey={(record) => getItemId(record) || record.cropName}
          loading={isLoading}
          dataSource={filteredCrops}
          columns={columns}
          tableLayout="fixed"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: [10, 20, 50],
            showTotal: (total) => `${total} bản ghi`,
          }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={EMPTY_MESSAGE}
              />
            ),
          }}
        />
      </Card>

      <Drawer
        title={
          <div className="flex items-center gap-2">
            <Sprout className="h-5 w-5 text-green-600" />
            <span>Chi tiết cây trồng</span>
          </div>
        }
        width={720}
        open={!!selectedCropId}
        onClose={() => setSelectedCropId(null)}
      >
        {isDetailLoading && (
          <div className="space-y-3">
            <div className="h-10 animate-pulse rounded bg-gray-100" />
            <div className="h-10 animate-pulse rounded bg-gray-100" />
            <div className="h-10 animate-pulse rounded bg-gray-100" />
            <div className="h-24 animate-pulse rounded bg-gray-100" />
          </div>
        )}

        {isDetailError && (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={EMPTY_MESSAGE}
          />
        )}

        {!isDetailLoading && !isDetailError && cropDetail && (
          <Tabs
            defaultActiveKey="info"
            items={[
              {
                key: 'info',
                label: (
                  <span className="flex items-center gap-2">
                    <FileTextOutlined />
                    Thông tin chung
                  </span>
                ),
                children: (
                  <Descriptions column={1} bordered size="middle">
                    <Descriptions.Item label="Tên cây trồng">
                      {displayValue(cropDetail.cropName)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Danh mục">
                      {displayValue(cropDetail.cropCatalogName || cropDetail.cropCatalog?.name)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Lô đất">
                      {displayValue(cropDetail.landPlotName || cropDetail.landPlot?.name)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Quy trình canh tác">
                      {displayValue(cropDetail.cropProcess)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày bắt đầu">
                      {cropDetail.startDate || cropDetail.productionPlan?.startDate
                        ? new Date(cropDetail.startDate || cropDetail.productionPlan.startDate).toLocaleDateString('vi-VN')
                        : 'Chưa cập nhật'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày dự kiến thu hoạch">
                      {cropDetail.expectedHarvestDate || cropDetail.productionPlan?.expectedHarvestDate
                        ? new Date(cropDetail.expectedHarvestDate || cropDetail.productionPlan.expectedHarvestDate).toLocaleDateString('vi-VN')
                        : 'Chưa cập nhật'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Diện tích">
                      {cropDetail.area ? `${cropDetail.area} m²` : 'Chưa cập nhật'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Trạng thái">
                      <Tag color={isCropActive(cropDetail) ? 'success' : 'default'}>
                        {getStatusLabel(cropDetail)}
                      </Tag>
                    </Descriptions.Item>
                  </Descriptions>
                ),
              },
              {
                key: 'production-plan',
                label: (
                  <span className="flex items-center gap-2">
                    <CalendarOutlined />
                    Kế hoạch sản xuất
                  </span>
                ),
                children: (
                  <div className="space-y-4">
                    <Alert
                      message="Chức năng đang phát triển"
                      description="Danh sách kế hoạch sản xuất sẽ được hiển thị ở đây. API: GET /crops/{id}/production-plans"
                      type="info"
                      showIcon
                    />
                    {/* TODO: Fetch production plans khi backend sẵn sàng */}
                    <Empty description="Chưa có kế hoạch sản xuất" />
                  </div>
                ),
              },
              {
                key: 'crop-protection',
                label: (
                  <span className="flex items-center gap-2">
                    <SafetyOutlined />
                    Bảo vệ cây trồng
                  </span>
                ),
                children: (
                  <div className="space-y-4">
                    <Alert
                      message="Chức năng đang phát triển"
                      description="Danh sách biện pháp bảo vệ cây trồng sẽ được hiển thị ở đây. API: GET /crops/{id}/crop-protections"
                      type="info"
                      showIcon
                    />
                    {/* TODO: Fetch crop protections khi backend sẵn sàng */}
                    <Empty description="Chưa có biện pháp bảo vệ" />
                  </div>
                ),
              },
              {
                key: 'logbook',
                label: (
                  <span className="flex items-center gap-2">
                    <BookOutlined />
                    Nhật ký canh tác
                  </span>
                ),
                children: (
                  <div className="space-y-4">
                    <Alert
                      message="Chức năng đang phát triển"
                      description="Nhật ký canh tác sẽ được hiển thị ở đây. API: GET /crops/{id}/logbooks"
                      type="info"
                      showIcon
                    />
                    {/* TODO: Fetch logbooks khi backend sẵn sàng */}
                    <Empty description="Chưa có nhật ký canh tác" />
                  </div>
                ),
              },
              {
                key: 'tasks',
                label: (
                  <span className="flex items-center gap-2">
                    <CheckSquareOutlined />
                    Công việc
                  </span>
                ),
                children: (
                  <div className="space-y-4">
                    <Alert
                      message="Chức năng đang phát triển"
                      description="Danh sách công việc liên quan sẽ được hiển thị ở đây. API: GET /crops/{id}/tasks"
                      type="info"
                      showIcon
                    />
                    {/* TODO: Fetch tasks khi backend sẵn sàng */}
                    <Empty description="Chưa có công việc" />
                  </div>
                ),
              },
            ]}
          />
        )}
      </Drawer>
    </div>
  );
};

export default Crops;
