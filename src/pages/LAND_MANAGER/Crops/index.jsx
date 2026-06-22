import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Button,
  Card,
  Descriptions,
  Drawer,
  Empty,
  Input,
  Select,
  Space,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import {
  CheckCircleOutlined,
  EyeOutlined,
  FileTextOutlined,
  SearchOutlined,
  StopOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Sprout } from 'lucide-react';

import TitleCustom from 'src/components/TitleCustom';
import CropManagementService from 'src/services/CropManagementService';
import ROUTER from 'src/router/ROUTER';
import { useSystemKey } from 'src/hooks/useSystemKey';
import { SYSTEM_KEY } from 'src/constants/systemKey';
import TableCustom from 'src/components/Table/CustomTable';

const { Text } = Typography;

const SORT_OPTIONS = [
  { value: 'name-asc', label: 'Tên cây A-Z' },
  { value: 'name-desc', label: 'Tên cây Z-A' },
  { value: 'code-asc', label: 'Mã cây A-Z' },
  { value: 'duration-asc', label: 'Thời gian sinh trưởng tăng dần' },
  { value: 'duration-desc', label: 'Thời gian sinh trưởng giảm dần' },
];

const EMPTY_MESSAGE = 'Không tìm thấy thông tin cây trồng.';

const getItemId = (item) => item?.id || item?._id || item?.cropId;

const CATEGORY_TAG_COLORS = [
  { bg: '#dcfce7', text: '#15803d' },
  { bg: '#dbeafe', text: '#1d4ed8' },
  { bg: '#fef3c7', text: '#b45309' },
  { bg: '#fce7f3', text: '#be185d' },
  { bg: '#ede9fe', text: '#6d28d9' },
  { bg: '#ccfbf1', text: '#0f766e' },
  { bg: '#fee2e2', text: '#b91c1c' },
  { bg: '#e0f2fe', text: '#0369a1' },
];

const getCategoryTagStyle = (value) => {
  const text = displayValue(value);
  const hash = [...text].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const color = CATEGORY_TAG_COLORS[hash % CATEGORY_TAG_COLORS.length];
  return {
    backgroundColor: color.bg,
    color: color.text,
  };
};

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
  isCropActive(item) ? 'Hoạt động' : 'Ngừng hoạt động';

const Crops = () => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('all');
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name-asc');
  const [selectedCropId, setSelectedCropId] = useState(null);

  // SystemKey hook
  const { getCombo } = useSystemKey();
  const cropStatusOptions = getCombo(SYSTEM_KEY.CROP_STATUS);

  // Status filter options
  const statusFilterOptions = useMemo(() => {
    const baseOptions = [{ value: 'all', label: 'Tất cả trạng thái' }];
    
    if (cropStatusOptions && cropStatusOptions.length > 0) {
      return [
        ...baseOptions,
        ...cropStatusOptions.map(opt => ({
          value: opt.codeValue || opt.CodeValue,
          label: opt.description || opt.Description,
        }))
      ];
    }
    
    return [
      ...baseOptions,
      { value: 'active', label: 'Đang hoạt động' },
      { value: 'inactive', label: 'Ngừng hoạt động' },
    ];
  }, [cropStatusOptions]);

  const { data, isLoading, isError, refetch, error } = useQuery({
    queryKey: ['crops-lm-view'],
    queryFn: async () => {
      const response = await CropManagementService.getCrops({ PageIndex: 1, PageSize: 200 });
      return normalizeCropResponse(response);
    },
    retry: false,
  });

  const {
    data: cropDetail,
    isLoading: isDetailLoading,
    isError: isDetailError,
  } = useQuery({
    queryKey: ['crop-detail-lm-view', selectedCropId],
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
          item.name,
          item.cropCode,
          item.cropType,
          item.scientificName,
          item.description,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value).toLocaleLowerCase('vi').includes(normalizedKeyword)
          );

      const matchesStatus =
        status === 'all' ||
        (status === 'active' && isCropActive(item)) ||
        (status === 'inactive' && !isCropActive(item));
      const matchesCategory = category === 'all' || item.cropType === category;

      return matchesKeyword && matchesStatus && matchesCategory;
    });

    return [...rows].sort((first, second) => {
      const firstName = String(first.name || '').localeCompare(String(second.name || ''), 'vi');
      const firstCode = String(first.cropCode || '').localeCompare(String(second.cropCode || ''), 'vi');

      switch (sortBy) {
        case 'name-desc':
          return -firstName;
        case 'code-asc':
          return firstCode;
        case 'name-asc':
        default:
          return firstName;
      }
    });
  }, [category, data?.items, keyword, sortBy, status]);

  const categoryOptions = useMemo(() => {
    const categories = [
      ...new Set((data?.items || []).map((item) => item.cropType).filter(Boolean)),
    ];
    return [
      { value: 'all', label: 'Tất cả danh mục' },
      ...categories.map((item) => ({ value: item, label: item })),
    ];
  }, [data?.items]);

  const columns = [
    {
      title: 'STT',
      key: 'index',
      width: 50,
      align: 'center',
      render: (_, __, index) => (
        <Text className="font-medium text-gray-400">{index + 1}</Text>
      ),
    },
    {
      title: 'Mã cây',
      dataIndex: 'cropCode',
      key: 'cropCode',
      width: 110,
      render: (value) => (
        <Text strong className="block truncate font-mono text-green-600">
          {displayValue(value)}
        </Text>
      ),
    },
    {
      title: 'Tên cây trồng',
      dataIndex: 'name',
      key: 'name',
      width: 220,
      render: (value, record) => (
        <div className="flex min-w-0 items-center gap-3">
          {record.imageUrl ? (
            <img
              src={record.imageUrl}
              alt={displayValue(value)}
              className="h-12 w-12 shrink-0 rounded-lg border border-gray-200 object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-600">
              <Sprout className="h-5 w-5" />
            </div>
          )}
          <Text strong className="block truncate text-gray-900">
            {displayValue(value)}
          </Text>
        </div>
      ),
    },
    {
      title: 'Nhóm cây/Loại cây',
      dataIndex: 'cropType',
      key: 'cropType',
      width: 150,
      align: 'center',
      render: (value) => (
        <Tag
          className="!m-0 max-w-full truncate rounded-full border-0 px-3 font-semibold"
          style={getCategoryTagStyle(value)}
        >
          {displayValue(value)}
        </Tag>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 150,
      align: 'center',
      render: (_, record) => {
        const isActive = isCropActive(record);
        return (
          <div
            className={`inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap ${
              isActive 
                ? 'bg-green-50 text-green-700' 
                : 'bg-red-50 text-red-600'
            }`}
          >
            {isActive ? <CheckCircleOutlined /> : <StopOutlined />}
            {getStatusLabel(record)}
          </div>
        );
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 80,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <Tooltip title="Xem chi tiết">
          <Button
            type="text"
            size="small"
            icon={<EyeOutlined />}
            className="!h-8 !w-8 rounded-lg text-green-600 hover:bg-green-50"
            onClick={() => navigate(`${ROUTER.LM_CROPS}/${getItemId(record)}`)}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <TitleCustom className="!mb-0 flex items-center gap-2">
        <Sprout className="h-6 w-6" />
        Cây trồng
      </TitleCustom>

      {isError && (
        <Alert
          showIcon
          type="error"
          message="Không thể tải danh sách cây trồng."
          description={error?.message || error?.response?.data?.message}
          action={
            <Button size="small" onClick={() => refetch()}>
              Thử lại
            </Button>
          }
        />
      )}

      <Card variant="borderless" className="rounded-lg shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_200px_200px_260px]">
          <Input
            allowClear
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            prefix={<SearchOutlined className="text-gray-400" />}
            placeholder="Tìm theo tên, mã cây, danh mục..."
            className="h-11 rounded-lg"
          />
          <Select
            value={status}
            onChange={setStatus}
            options={statusFilterOptions}
            className="h-11"
          />
          <Select
            value={category}
            onChange={setCategory}
            options={categoryOptions}
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
        <TableCustom
          rowKey={(record) => getItemId(record) || record.cropCode || record.name}
          loading={isLoading}
          dataSource={filteredCrops}
          columns={columns}
          scroll={{ x: 'max-content' }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: [10, 20, 50],
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

      {/* Drawer chi tiết (Read-only) */}
      <Drawer
        title="Chi tiết cây trồng"
        width={520}
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
          <div className="space-y-4">
            {cropDetail.imageUrl && (
              <div className="flex justify-center">
                <img
                  src={cropDetail.imageUrl}
                  alt={cropDetail.name}
                  className="max-h-[200px] rounded-lg border border-gray-200 object-contain"
                />
              </div>
            )}
            
            <Descriptions column={1} bordered size="middle">
              <Descriptions.Item label="Mã cây">
                {displayValue(cropDetail.cropCode)}
              </Descriptions.Item>
              <Descriptions.Item label="Tên cây trồng">
                {displayValue(cropDetail.name)}
              </Descriptions.Item>
              <Descriptions.Item label="Nhóm cây">
                {displayValue(cropDetail.cropType)}
              </Descriptions.Item>
              {/* <Descriptions.Item label="Tên khoa học">
                {displayValue(cropDetail.scientificName)}
              </Descriptions.Item> */}
              <Descriptions.Item label="Trạng thái">
                <Tag color={isCropActive(cropDetail) ? 'success' : 'error'}>
                  {getStatusLabel(cropDetail)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Điều kiện khuyến nghị">
                {displayValue(cropDetail.recommendedCultivationConditions)}
              </Descriptions.Item>
              <Descriptions.Item label="Mô tả">
                {displayValue(cropDetail.description)}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default Crops;
