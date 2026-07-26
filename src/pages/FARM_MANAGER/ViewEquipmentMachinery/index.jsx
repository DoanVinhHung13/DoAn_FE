import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Button,
  Input,
  Select,
  Tag,
  Space,
  Modal,
  Form,
  Row,
  Col,
  Badge,
  Tooltip,
  Divider,
  Typography,
  DatePicker,
  Popconfirm,
  message,
} from 'antd';
import {
  ToolOutlined,
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  EditOutlined,
  EyeOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  WarningOutlined,
  SettingOutlined,
  ThunderboltOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

import TitleCustom from 'src/components/TitleCustom';
import CustomTable from 'src/components/Table/CustomTable';
import { DEFAULT_PAGE_SIZE } from 'src/constants/constants';
import { PAGE_SIZE } from 'src/constants/pageSizeOptions';
import ROUTER from 'src/router/ROUTER';

const { Text, Paragraph } = Typography;

// Mock Data cho Máy móc & Thiết bị nông nghiệp
const MOCK_EQUIPMENT = [
  {
    id: 'EQ-001',
    code: 'MACH-KUBOTA-L5018',
    name: 'Máy cày Kubota L5018',
    category: 'TRACTOR',
    categoryName: 'Máy làm đất & Cày cấy',
    brand: 'Kubota Nhật Bản',
    power: '50 HP',
    status: 'ACTIVE',
    statusName: 'Sẵn sàng sử dụng',
    lastMaintenance: '2024-06-15',
    nextMaintenance: '2024-12-15',
    purchaseDate: '2022-03-10',
    assignedTo: 'Đội 1 - Vùng lúa ST25',
    notes: 'Đã kiểm tra định kỳ 500 giờ hoạt động, hoạt động tốt.',
  },
  {
    id: 'EQ-002',
    code: 'DRONE-DJI-T40',
    name: 'Drone Phun thuốc & Gieo hạt DJI Agras T40',
    category: 'DRONE',
    categoryName: 'Drone & Thiết bị công nghệ',
    brand: 'DJI Agriculture',
    power: 'Tải trọng 40kg',
    status: 'IN_USE',
    statusName: 'Đang hoạt động trên đồng',
    lastMaintenance: '2024-07-01',
    nextMaintenance: '2024-08-01',
    purchaseDate: '2023-05-20',
    assignedTo: 'Tổ công nghệ phun xịt',
    notes: 'Kèm 3 bộ pin thông minh và trạm sạc nhanh.',
  },
  {
    id: 'EQ-003',
    code: 'IRRI-SMART-SYS01',
    name: 'Hệ thống tưới tự động IOT Netafim',
    category: 'IRRIGATION',
    categoryName: 'Hệ thống tưới tiêu',
    brand: 'Netafim Israel',
    power: '10 m3/h',
    status: 'ACTIVE',
    statusName: 'Sẵn sàng sử dụng',
    lastMaintenance: '2024-05-10',
    nextMaintenance: '2024-11-10',
    purchaseDate: '2023-01-15',
    assignedTo: 'Khu A - Ớt chuông nhà kính',
    notes: 'Tích hợp cảm biến độ ẩm đất và van điện từ tự động.',
  },
  {
    id: 'EQ-004',
    code: 'HARV-YANMAR-AW70',
    name: 'Máy gặt đập liên hợp Yanmar AW70V',
    category: 'HARVESTER',
    categoryName: 'Máy thu hoạch',
    brand: 'Yanmar Nhật Bản',
    power: '70 HP',
    status: 'MAINTENANCE',
    statusName: 'Đang bảo dưỡng định kỳ',
    lastMaintenance: '2024-07-18',
    nextMaintenance: '2024-07-25',
    purchaseDate: '2021-11-05',
    assignedTo: 'Đội máy nông nghiệp',
    notes: 'Thay xích tải và bảo dưỡng dàn xới thu hoạch.',
  },
  {
    id: 'EQ-005',
    code: 'DRY-SYSTEM-50T',
    name: 'Hệ thống lò sấy nông sản tháp đứng 50 tấn',
    category: 'PROCESSING',
    categoryName: 'Thiết bị chế biến & Sấy',
    brand: 'Việt Nhất Corp',
    power: '50 tấn/mẻ',
    status: 'ACTIVE',
    statusName: 'Sẵn sàng sử dụng',
    lastMaintenance: '2024-04-20',
    nextMaintenance: '2024-10-20',
    purchaseDate: '2022-08-30',
    assignedTo: 'Khu nhà kho trung tâm',
    notes: 'Đã vệ sinh lọc gió và kiểm tra đầu đốt trấu.',
  },
];

const CATEGORY_OPTIONS = [
  { value: 'all', label: 'Tất cả loại máy móc' },
  { value: 'TRACTOR', label: 'Máy làm đất & Cày cấy' },
  { value: 'DRONE', label: 'Drone & Thiết bị công nghệ' },
  { value: 'IRRIGATION', label: 'Hệ thống tưới tiêu' },
  { value: 'HARVESTER', label: 'Máy thu hoạch' },
  { value: 'PROCESSING', label: 'Thiết bị chế biến & Sấy' },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'ACTIVE', label: 'Sẵn sàng sử dụng' },
  { value: 'IN_USE', label: 'Đang hoạt động' },
  { value: 'MAINTENANCE', label: 'Đang bảo dưỡng' },
  { value: 'BROKEN', label: 'Hỏng hóc / Ngừng dùng' },
];

const STATUS_TAG_MAP = {
  ACTIVE: { color: 'green', icon: <CheckCircleOutlined />, label: 'Sẵn sàng' },
  IN_USE: { color: 'blue', icon: <SyncOutlined spin />, label: 'Đang hoạt động' },
  MAINTENANCE: { color: 'warning', icon: <SettingOutlined spin />, label: 'Đang bảo dưỡng' },
  BROKEN: { color: 'error', icon: <WarningOutlined />, label: 'Hỏng hóc' },
};

const ViewEquipmentMachinery = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(MOCK_EQUIPMENT);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit' | 'detail'
  const [selectedItem, setSelectedItem] = useState(null);

  const [form] = Form.useForm();

  // Lọc dữ liệu
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchSearch =
        !search ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.code.toLowerCase().includes(search.toLowerCase()) ||
        item.brand.toLowerCase().includes(search.toLowerCase());

      const matchCategory = categoryFilter === 'all' || item.category === categoryFilter;
      const matchStatus = statusFilter === 'all' || item.status === statusFilter;

      return matchSearch && matchCategory && matchStatus;
    });
  }, [data, search, categoryFilter, statusFilter]);

  const handleSearch = () => {
    setSearch(searchInput.trim());
    setPage(1);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearch('');
    setPage(1);
  };

  // Mở màn Thêm mới
  const handleOpenCreate = () => {
    navigate(ROUTER.FM_VIEW_EQUIPMENT_CREATE);
  };

  // Mở màn Xem chi tiết
  const handleOpenDetail = (record) => {
    navigate(ROUTER.FM_VIEW_EQUIPMENT_DETAIL.replace(':id', record.id));
  };

  // Mở màn Chỉnh sửa
  const handleOpenEdit = (record) => {
    navigate(ROUTER.FM_VIEW_EQUIPMENT_EDIT.replace(':id', record.id));
  };

  // Xoá thiết bị
  const handleDelete = (id) => {
    setData(data.filter((item) => item.id !== id));
    message.success('Đã xoá thiết bị thành công');
  };

  // Cấu trúc cột bảng
  const columns = [
    {
      title: 'STT',
      key: 'stt',
      width: 60,
      align: 'center',
      render: (_, __, index) => (
        <span className="text-sm font-medium text-gray-400">
          {(page - 1) * pageSize + index + 1}
        </span>
      ),
    },
    {
      title: 'Tên máy móc / Thiết bị',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <Text strong className="block text-slate-800 hover:text-green-600 cursor-pointer" onClick={(e) => { e.stopPropagation(); handleOpenDetail(record); }}>
            {text}
          </Text>
          <Text className="text-xs text-slate-400 font-medium">{record.power}</Text>
        </div>
      ),
    },
    {
      title: 'Loại thiết bị',
      dataIndex: 'categoryName',
      key: 'categoryName',
      width: 180,
      render: (text) => <Tag color="cyan" className="rounded-md font-medium text-xs">{text}</Tag>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 160,
      render: (status) => {
        const tag = STATUS_TAG_MAP[status] || { color: 'default', icon: null, label: status };
        return (
          <Tag color={tag.color} icon={tag.icon} className="px-2.5 py-0.5 rounded-full font-medium text-xs">
            {tag.label}
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
      render: (_, record) => (
        <Space size="small" onClick={(e) => e.stopPropagation()}>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined className="text-green-600 text-base" />}
              onClick={() => handleOpenEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Xoá thiết bị này?"
            description="Bạn có chắc chắn muốn xoá máy móc này khỏi hệ thống?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xoá"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Xoá">
              <Button type="text" size="small" icon={<DeleteOutlined className="text-red-500 text-base" />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-5 duration-300 animate-in fade-in">
      {/* Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <TitleCustom className="!mb-1 flex items-center gap-2">
            <ToolOutlined className="text-emerald-600" /> Quản lý Máy móc & Thiết bị Nông nghiệp
          </TitleCustom>
          <Text className="text-slate-500 text-xs sm:text-sm">
            Theo dõi danh mục máy cày, hệ thống tưới, drone và tình trạng bảo dưỡng thiết bị trang trại.
          </Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleOpenCreate}
          className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-semibold shadow-sm"
        >
          Thêm máy móc mới
        </Button>
      </div>

      {/* Table Card & Toolbar */}
      <Card bordered={false} className="shadow-sm rounded-2xl" bodyStyle={{ padding: 0 }}>
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 p-5 border-b border-gray-100">
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Tìm theo tên máy móc..."
            prefix={<SearchOutlined className="text-gray-300" />}
            className="w-64 h-10 rounded-[18px]"
            allowClear
          />
          <Select
            value={categoryFilter}
            onChange={(val) => {
              setCategoryFilter(val);
              setPage(1);
            }}
            options={CATEGORY_OPTIONS}
            className="h-10 rounded-[18px] min-w-[170px]"
          />
          <Select
            value={statusFilter}
            onChange={(val) => {
              setStatusFilter(val);
              setPage(1);
            }}
            options={STATUS_OPTIONS}
            className="h-10 rounded-[18px] min-w-[170px]"
          />
        </div>

        {/* CustomTable */}
        <CustomTable
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          onRow={(record) => ({
            onClick: () => handleOpenDetail(record),
            className: 'cursor-pointer hover:bg-slate-50',
          })}
          pagination={{
            current: page,
            pageSize: pageSize,
            total: filteredData.length,
            pageSizeOptions: PAGE_SIZE,
            showSizeChanger: true,
            onChange: (p, ps) => {
              setPage(p);
              setPageSize(ps);
            },
          }}
        />
      </Card>
    </div>
  );
};

export default ViewEquipmentMachinery;
