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
  Table,
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

import TitleCustom from 'src/components/TitleCustom';
import CropService from 'src/services/CropService';
import ROUTER from 'src/router/ROUTER';
import { useSystemKey } from 'src/hooks/useSystemKey';
import { SYSTEM_KEY } from 'src/constants/systemKey';

const { Text } = Typography;

const EMPTY_MESSAGE = 'Không tìm thấy thông tin danh mục cây trồng.';

const getItemId = (item) => item?.id || item?._id || item?.cropCatalogId;

const displayValue = (value) => {
  if (value === null || value === undefined || value === '') return 'Chưa cập nhật';
  return value;
};

const normalizeResponse = (response) => {
  const payload = response?.data ?? response ?? {};
  const data = payload?.data ?? payload;
  const items = Array.isArray(data)
    ? data
    : data?.items ||
      data?.results ||
      data?.cropCatalogs ||
      data?.crops ||
      payload?.items ||
      payload?.results ||
      [];

  return { items };
};

const isCatalogActive = (item) => {
  if (typeof item?.isActive === 'boolean') return item.isActive;
  const status = String(item?.status || '').toLowerCase();
  return !['inactive', 'disabled', 'deleted', 'ngừng hoạt động'].includes(status);
};

const getStatusLabel = (item) =>
  isCatalogActive(item) ? 'Hoạt động' : 'Ngừng hoạt động';

const StatusBadge = ({ record }) => {
  const active = isCatalogActive(record);
  return (
    <span
      className={`inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
        active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
      }`}
    >
      {active ? <CheckCircleOutlined /> : <StopOutlined />}
      {getStatusLabel(record)}
    </span>
  );
};

const ViewCatalogs = () => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('all');

  // SystemKey hook
  const { getCombo } = useSystemKey();
  const catalogStatusOptions = getCombo(SYSTEM_KEY.CROP_STATUS);

  // Status filter options với SystemKey
  const statusFilterOptions = useMemo(() => {
    const baseOptions = [{ value: 'all', label: 'Tất cả trạng thái' }];
    
    if (catalogStatusOptions && catalogStatusOptions.length > 0) {
      return [
        ...baseOptions,
        ...catalogStatusOptions.map(opt => ({
          value: opt.codeValue || opt.CodeValue,
          label: opt.description || opt.Description,
        }))
      ];
    }
    
    return [
      ...baseOptions,
      { value: 'active', label: 'Hoạt động' },
      { value: 'inactive', label: 'Ngừng hoạt động' },
    ];
  }, [catalogStatusOptions]);

  const { data, isLoading, isError, refetch, error } = useQuery({
    queryKey: ['crop-catalogs-view'],
    queryFn: async () => {
      const response = await CropService.getCrops({ PageIndex: 1, PageSize: 200 });
      return normalizeResponse(response);
    },
    retry: false,
  });


  const filteredCatalogs = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLocaleLowerCase('vi');
    return (data?.items || []).filter((item) => {
      const matchesKeyword =
        !normalizedKeyword ||
        [item.name, item.cropCatalogName, item.description]
          .filter(Boolean)
          .some((value) =>
            String(value).toLocaleLowerCase('vi').includes(normalizedKeyword)
          );

      const matchesStatus =
        status === 'all' ||
        (status === 'active' && isCatalogActive(item)) ||
        (status === 'inactive' && !isCatalogActive(item));

      return matchesKeyword && matchesStatus;
    });
  }, [data?.items, keyword, status]);

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
      key: 'name',
      dataIndex: 'name',
      width: 280,
      render: (value, record) => (
        <Text strong className="block truncate text-gray-900">
          {displayValue(value || record.cropCatalogName)}
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
      render: (_, record) => <StatusBadge record={record} />,
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 80,
      align: 'center',
      render: (_, record) => (
        <Tooltip title="Xem chi tiết">
          <Button
            type="text"
            size="small"
            icon={<EyeOutlined />}
            className="!h-8 !w-8 rounded-lg text-blue-600 hover:bg-blue-50"
            onClick={() => navigate(`${ROUTER.LM_CROP_CATALOGS}/${getItemId(record)}`)}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <TitleCustom className="!mb-0 flex items-center gap-2">
        <FileTextOutlined className="h-6 w-6" />
        Danh mục cây trồng
      </TitleCustom>

      {isError && (
        <Alert
          showIcon
          type="error"
          message="Không thể tải danh sách danh mục cây trồng."
          description={error?.message || error?.response?.data?.message || 'Vui lòng kiểm tra console để biết thêm chi tiết.'}
          action={
            <Button size="small" onClick={() => refetch()}>
              Thử lại
            </Button>
          }
        />
      )}

      <Card variant="borderless" className="rounded-lg shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_220px]">
          <Input
            allowClear
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            prefix={<SearchOutlined className="text-gray-400" />}
            placeholder="Tìm theo tên loại cây trồng, mô tả..."
            className="h-11 rounded-lg"
          />
          <Select
            value={status}
            onChange={setStatus}
            options={statusFilterOptions}
            className="h-11"
          />
        </div>
      </Card>

      <Card
        variant="borderless"
        className="overflow-hidden rounded-lg shadow-sm"
        styles={{ body: { padding: 0 } }}
      >
        <Table
          rowKey={(record) => getItemId(record) || record.name}
          loading={isLoading}
          dataSource={filteredCatalogs}
          columns={columns}
          tableLayout="fixed"
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

export default ViewCatalogs;
