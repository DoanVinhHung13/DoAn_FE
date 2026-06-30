import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Button,
  Card,
  Descriptions,
  Drawer,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
  Upload,
  message,
} from 'antd';
import {
  CheckCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  FileTextOutlined,
  PlusOutlined,
  SearchOutlined,
  StopOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Sprout } from 'lucide-react';

import TitleCustom from 'src/components/TitleCustom';
// import GrowthStages from 'src/components/GrowthStages'; // TODO: Sẽ dùng riêng cho CropVarieties
import CropManagementService from 'src/services/CropManagementService';
import CropService from 'src/services/CropService';
import UploadService from 'src/services/UploadService';
import ROUTER from 'src/router/ROUTER';
import { useSystemKey } from 'src/hooks/useSystemKey';
import { SYSTEM_KEY } from 'src/constants/systemKey';
import TableCustom from 'src/components/Table/CustomTable';

const formatDuration = (days) => {
  if (!days) return 'Chưa cập nhật';
  if (days % 365 === 0) return `${days / 365} năm`;
  if (days % 30 === 0) return `${days / 30} tháng`;
  return `${days} ngày`;
};

const { Text } = Typography;

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'active', label: 'Đang hoạt động' },
  { value: 'inactive', label: 'Ngừng hoạt động' },
];

const SORT_OPTIONS = [
  { value: 'name-asc', label: 'Tên cây A-Z' },
  { value: 'name-desc', label: 'Tên cây Z-A' },
  { value: 'yield-asc', label: 'Sản lượng tăng dần' },
  { value: 'yield-desc', label: 'Sản lượng giảm dần' },
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
  isCropActive(item) ? 'Ho\u1ea1t \u0111\u1ed9ng' : 'Ng\u1eebng ho\u1ea1t \u0111\u1ed9ng';

const Crops = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const watchedImageUrl = Form.useWatch('imageUrl', form);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('all');
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name-asc');
  const [inlineError, setInlineError] = useState('');
  // SystemKey hook
  const { getCombo, getDescription } = useSystemKey();
  const cropTypeOptions = getCombo(SYSTEM_KEY.CROP_TYPE);
  const cropStatusOptions = getCombo(SYSTEM_KEY.CROP_STATUS);

  // Status filter options (dùng SystemKey nếu có, fallback về hardcode)
  const statusFilterOptions = useMemo(() => {
    const baseOptions = [{ value: 'all', label: 'Tất cả trạng thái' }];
    
    if (cropStatusOptions && cropStatusOptions.length > 0) {
      // Dùng SystemKey từ backend
      return [
        ...baseOptions,
        ...cropStatusOptions.map(opt => ({
          value: opt.codeValue || opt.CodeValue,
          label: opt.description || opt.Description,
        }))
      ];
    }
    
    // Fallback nếu chưa có SystemKey
    return [
      ...baseOptions,
      { value: 'active', label: 'Đang hoạt động' },
      { value: 'inactive', label: 'Ngừng hoạt động' },
    ];
  }, [cropStatusOptions]);

  const { data, isLoading, isError, refetch, error } = useQuery({
    queryKey: ['crops'],
    queryFn: async () => {
      try {
        const response = await CropManagementService.getCrops({ PageIndex: 1, PageSize: 200 });
        console.log('Crops API Response:', response);
        return normalizeCropResponse(response);
      } catch (err) {
        console.error('Crops API Error:', err);
        throw err;
      }
    },
    retry: false,
  });

  // Query to get crop catalogs for the dropdown
  const { data: cropCatalogsData, isLoading: isCatalogsLoading } = useQuery({
    queryKey: ['crop-catalogs-dropdown'],
    queryFn: async () => {
      try {
        const response = await CropService.getCrops({ PageIndex: 1, PageSize: 100 });
        console.log('Crop Catalogs Dropdown Response:', response);
        const items = normalizeCropResponse(response).items;
        return items.filter(item => {
          // Only return active catalogs
          if (typeof item?.isActive === 'boolean') return item.isActive;
          const status = String(item?.status || '').toLowerCase();
          return !['inactive', 'disabled', 'deleted'].includes(status);
        });
      } catch (err) {
        console.error('Crop Catalogs Dropdown Error:', err);
        if (err?.response?.status === 405) {
          return [
            { id: '1', name: 'Cây rau', description: 'Các loại rau ăn lá', isActive: true },
            { id: '2', name: 'Cây củ', description: 'Các loại củ quả', isActive: true },
            { id: '3', name: 'Cây ăn trái', description: 'Các loại cây ăn quả', isActive: true },
          ];
        }
        return [];
      }
    },
    retry: false,
  });


  const filteredCrops = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLocaleLowerCase('vi');
    const rows = (data?.items || []).filter((item) => {
      const matchesKeyword =
        !normalizedKeyword ||
        [
          item.name,
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
      const matchesCategory = category === 'all' || item.cropCatalogId === category;

      return matchesKeyword && matchesStatus && matchesCategory;
    });

    return [...rows].sort((first, second) => {
      const firstName = String(first.name || '').localeCompare(String(second.name || ''), 'vi');
      const firstYield = Number(first.expectedYield || 0);
      const secondYield = Number(second.expectedYield || 0);

      switch (sortBy) {
        case 'name-desc':
          return -firstName;
        case 'yield-asc':
          return firstYield - secondYield;
        case 'yield-desc':
          return secondYield - firstYield;
        case 'name-asc':
        default:
          return firstName;
      }
    });
  }, [category, data?.items, keyword, sortBy, status]);

  const categoryOptions = useMemo(() => {
    const categories = [
      ...new Set((data?.items || []).map((item) => item.cropCatalogId).filter(Boolean)),
    ];
    return [
      { value: 'all', label: 'Tất cả danh mục' },
      ...categories.map((id) => {
        const found = cropCatalogsData?.find(
          (c) => c.id === id || c.cropCatalogId === id
        );
        return { value: id, label: found ? (found.name || found.cropCatalogName) : id };
      }),
    ];
  }, [data?.items, cropCatalogsData]);

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
      title: 'Tên cây trồng',
      dataIndex: 'name',
      key: 'name',
      width: 220,
      render: (value, record) => {
        const imgUrl = record.imageUrl || record.image || record.thumbnail || record.thumbnailUrl || record.photo || record.picture;
        return (
          <div className="flex min-w-0 items-center gap-3">
            {imgUrl ? (
              <img
                src={imgUrl}
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
        );
      },
    },
    {
      title: 'Danh mục',
      dataIndex: 'cropCatalogId',
      key: 'cropCatalogId',
      width: 150,
      align: 'center',
      render: (value) => {
        const catalog = cropCatalogsData?.find(c => c.id === value || c.cropCatalogId === value);
        const display = catalog ? (catalog.name || catalog.cropCatalogName) : value;
        return (
          <Tag
            className="!m-0 max-w-full truncate rounded-full border-0 px-3 font-semibold"
            style={getCategoryTagStyle(display)}
          >
            {displayValue(display)}
          </Tag>
        );
      },
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
      width: 120,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <Space size={4} className="whitespace-nowrap">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              className="!h-8 !w-8 rounded-lg text-green-600 hover:bg-green-50"
              onClick={() => navigate(`${ROUTER.LM_CROPS}/${getItemId(record)}`)}
            />
          </Tooltip>

        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <TitleCustom className="!mb-0 flex items-center gap-2">
          <Sprout className="h-6 w-6" />
          Cây trồng
        </TitleCustom>
      </div>

      {isError && (
        <Alert
          showIcon
          type="error"
          message="Không thể tải danh sách cây trồng."
          description={error?.message || error?.response?.data?.message || 'Vui lòng kiểm tra console để biết thêm chi tiết.'}
          action={
            <Button size="small" onClick={() => refetch()}>
              Thử lại
            </Button>
          }
        />
      )}

      {inlineError && (
        <Alert
          showIcon
          closable
          type="error"
          message={inlineError}
          onClose={() => setInlineError('')}
        />
      )}

      <Card variant="borderless" className="rounded-lg shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_200px_200px_260px]">
          <Input
            allowClear
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            prefix={<SearchOutlined className="text-gray-400" />}
            placeholder="Tìm theo tên, mô tả..."
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

    </div>
  );
};

export default Crops;
