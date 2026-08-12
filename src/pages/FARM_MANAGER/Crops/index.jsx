import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Button,
  Card,
  Empty,
  Input,
  Modal,
  Select,
  Space,
  Tag,
  Tooltip,
  Typography,
  Popconfirm,
} from 'antd';
import {
  EditOutlined,
  EyeOutlined,
  SearchOutlined,
  StopOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { CropIcon } from 'src/assets/icon/menu/MenuIcons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import TitleCustom from 'src/components/TitleCustom';
import StatusBadge from 'src/components/Common/StatusBadge';
import CropManagementService from 'src/services/CropManagementService';
import { isNotFoundError } from 'src/services/core/apiError';
import CropCatalogService from 'src/services/CropCatalogService';
import ROUTER from 'src/router/ROUTER';
import { useSystemKey } from 'src/hooks/useSystemKey';
import { SYSTEM_KEY } from 'src/constants/systemKey';
import TableCustom from 'src/components/Table/CustomTable';
import { getListPresentationState } from 'src/utils/listPresentation';

const { Text } = Typography;

const SORT_OPTIONS = [
  { value: 'name-asc', label: 'Tên cây A-Z' },
  { value: 'name-desc', label: 'Tên cây Z-A' },
  { value: 'yield-asc', label: 'Sản lượng tăng dần' },
  { value: 'yield-desc', label: 'Sản lượng giảm dần' },
];

const EMPTY_MESSAGE = 'Không tìm thấy thông tin cây trồng.';

const getItemId = (item) => item?.id;
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
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('active');
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name-asc');
  const [statusTarget, setStatusTarget] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { getCombo } = useSystemKey();
  const cropStatusOptions = getCombo(SYSTEM_KEY.CROP_STATUS);

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

  const { data, isLoading, isFetching, isError, refetch, error } = useQuery({
    queryKey: ['crops'],
    queryFn: async () => {
      const response = await CropManagementService.getCrops({ PageIndex: 1, PageSize: 200 });
      return normalizeCropResponse(response);
    },
    retry: false,
  });

  const { data: cropCatalogsData } = useQuery({
    queryKey: ['crop-catalogs-dropdown'],
    queryFn: async () => {
      try {
        const response = await CropCatalogService.getCropCatalogs({ PageIndex: 1, PageSize: 100 });
        return normalizeCropResponse(response).items;
      } catch {
        return [];
      }
    },
    retry: false,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, nextActive }) =>
      nextActive
        ? CropManagementService.reactivateCrop(id)
        : CropManagementService.deactivateCrop(id),
    onSuccess: () => {
      setStatusTarget(null);
      queryClient.invalidateQueries({ queryKey: ['crops'] });
      queryClient.invalidateQueries({ queryKey: ['crop-detail'] });
    },
    onError: (error) => {
      if (isNotFoundError(error)) {
        setStatusTarget(null);
        queryClient.invalidateQueries({ queryKey: ['crops'] });
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => CropManagementService.deleteCrop(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crops'] });
    },
    onError: (error) => {
      if (isNotFoundError(error)) {
        queryClient.invalidateQueries({ queryKey: ['crops'] });
      }
    },
  });

  const handleConfirmStatusChange = () => {
    if (statusTarget) {
      statusMutation.mutate({
        id: getItemId(statusTarget),
        nextActive: !isCropActive(statusTarget),
      });
    }
  };


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

  const visiblePage = Math.min(
    page,
    Math.max(1, Math.ceil(filteredCrops.length / pageSize)),
  );

  const paginatedCrops = useMemo(
    () => filteredCrops.slice((visiblePage - 1) * pageSize, visiblePage * pageSize),
    [filteredCrops, pageSize, visiblePage],
  );

  const hasActiveFilters = Boolean(keyword.trim()) || status !== 'all' || category !== 'all' || sortBy !== 'name-asc';
  const listPresentation = getListPresentationState({
    hasActiveFilters,
    isLoading: isLoading || isFetching,
    isError,
    items: data?.items || [],
    visibleItems: paginatedCrops,
  });
  const emptyDescription =
    listPresentation === 'filtered-empty'
      ? 'Không có cây trồng phù hợp với điều kiện tìm kiếm.'
      : EMPTY_MESSAGE;

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
        <Text className="font-medium text-gray-400">{(visiblePage - 1) * pageSize + index + 1}</Text>
      ),
    },
    {
      title: 'Tên cây trồng',
      dataIndex: 'name',
      key: 'name',
      width: 360,
      render: (value, record) => {
        return (
          <Text strong className="block truncate text-gray-900">
            {displayValue(value)}
          </Text>
        );
      },
    },
    {
      title: 'Danh mục',
      dataIndex: 'cropCatalogId',
      key: 'cropCatalogId',
      width: 280,
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
      width: 240,
      align: 'center',
      render: (_, record) => {
        const isActive = isCropActive(record);
        return <StatusBadge isActive={isActive} activeLabel={getStatusLabel(record)} inactiveLabel={getStatusLabel(record)} />;
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 180,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <Space size={4} className="whitespace-nowrap">
          <Tooltip title="Sửa">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              className="!h-8 !w-8 rounded-lg text-green-600 hover:bg-green-50"
              onClick={() => navigate(`${ROUTER.FM_CROPS}/${getItemId(record)}/edit`)}
            />
          </Tooltip>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              className="!h-8 !w-8 rounded-lg text-green-600 hover:bg-green-50"
              onClick={() => navigate(`${ROUTER.FM_CROPS}/${getItemId(record)}`)}
            />
          </Tooltip>
          <Tooltip title={isCropActive(record) ? 'Vô hiệu hóa' : 'Kích hoạt'}>
            <Button
              type="text"
              size="small"
              danger={isCropActive(record)}
              icon={isCropActive(record) ? <StopOutlined /> : <CheckCircleOutlined />}
              loading={
                statusMutation.isPending &&
                statusMutation.variables?.id === getItemId(record)
              }
              className={
                isCropActive(record)
                  ? '!h-8 !w-8 rounded-lg text-red-500 hover:bg-red-50'
                  : '!h-8 !w-8 rounded-lg text-green-600 hover:bg-green-50'
              }
              onClick={() => setStatusTarget(record)}
            />
          </Tooltip>
          {!isCropActive(record) && <Popconfirm
            title="Xóa cây trồng"
            description="Bạn có chắc chắn muốn xóa cây trồng này không?"
            onConfirm={(e) => {
              e.stopPropagation();
              return deleteMutation.mutateAsync(getItemId(record));
            }}
            onCancel={(e) => e.stopPropagation()}
            okText="Đồng ý"
            cancelText="Hủy"
          >
            <Tooltip title="Xóa">
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
                className="!h-8 !w-8 rounded-lg text-red-500 hover:bg-red-50"
                onClick={(e) => e.stopPropagation()}
              />
            </Tooltip>
          </Popconfirm>}
        </Space>
      ),
    },
  ];

  return (
    <div className="admin-compact-list crops-screen space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <TitleCustom className="!mb-0 flex items-center gap-2">
          <CropIcon style={{ fontSize: '24px', color: '#15803d' }} />
          Cây trồng
        </TitleCustom>
        <Button
          type="primary"
          onClick={() => navigate(ROUTER.FM_CROP_CREATE)}
          className="h-10 rounded-lg bg-green-600 px-5 font-medium hover:bg-green-700"
        >
          Thêm cây trồng mới
        </Button>
      </div>

      {isError && (
        <Alert
          showIcon
          type="error"
          message="Không thể tải danh sách cây trồng."
          description={error?.message || 'Vui lòng thử lại sau ít phút.'}
          action={
            <Button size="small" onClick={() => refetch()}>
              Thử lại
            </Button>
          }
        />
      )}

      <div className="admin-filter-card crops-filter-card rounded-lg shadow-sm">
        <div className="admin-toolbar grid grid-cols-1 gap-3 md:grid-cols-[minmax(240px,1fr)_180px_180px_220px]">
          <Input
            allowClear
            value={keyword}
            onChange={(event) => {
              setKeyword(event.target.value);
              setPage(1);
            }}
            prefix={<SearchOutlined className="text-gray-400" />}
            placeholder="Tìm theo tên, mô tả..."
            className="h-10 rounded-lg"
          />
          <Select
            value={status}
            onChange={(value) => {
              setStatus(value);
              setPage(1);
            }}
            options={statusFilterOptions}
            className="h-10"
          />
          <Select
            value={category}
            onChange={(value) => {
              setCategory(value);
              setPage(1);
            }}
            options={categoryOptions}
            className="h-10"
          />
          <Select
            value={sortBy}
            onChange={(value) => {
              setSortBy(value);
              setPage(1);
            }}
            options={SORT_OPTIONS}
            className="h-10"
          />
        </div>
      </div>

      <TableCustom
        rowKey={(record) => getItemId(record) || record.cropCode || record.name}
        loading={isLoading || isFetching}
        dataSource={paginatedCrops}
        columns={columns}
        scroll={{ x: 1120 }}
        tableLayout="fixed"
        pagination={{
          current: visiblePage,
          pageSize,
          total: filteredCrops.length,
          showSizeChanger: true,
          pageSizeOptions: [10, 20, 50],
          onChange: (nextPage, nextPageSize) => {
            setPage(nextPageSize !== pageSize ? 1 : nextPage);
            setPageSize(nextPageSize);
          },
        }}
        locale={{
          emptyText: ['system-empty', 'filtered-empty'].includes(listPresentation) && (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={emptyDescription}
            />
          ),
        }}
      />

      <Modal
        open={!!statusTarget}
        onCancel={() => {
          if (!statusMutation.isPending) setStatusTarget(null);
        }}
        closable={!statusMutation.isPending}
        maskClosable={!statusMutation.isPending}
        footer={null}
        centered
        width={400}
        closeIcon={<span className="text-2xl leading-none text-gray-900">×</span>}
      >
        <div className="px-3 pb-1 pt-2">
          <h2 className="mb-3 border-b border-gray-100 pb-4 text-[24px] font-bold text-green-600">
            Thay đổi trạng thái
          </h2>
          <p className="mb-7 text-base leading-6 text-gray-600">
            Bạn có chắc muốn thay đổi trạng thái của cây trồng này không?
          </p>
          <div className="flex justify-end gap-3">
            <Button
              disabled={statusMutation.isPending}
              onClick={() => setStatusTarget(null)}
              className="h-10 min-w-[80px] rounded-lg font-semibold"
            >
              Hủy
            </Button>
            <Button
              type="primary"
              loading={statusMutation.isPending}
              onClick={handleConfirmStatusChange}
              className="h-10 min-w-[104px] rounded-lg bg-green-500 font-semibold shadow-lg shadow-green-100"
            >
              Xác nhận
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Crops;
