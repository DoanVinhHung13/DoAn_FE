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
  InputNumber,
  Tooltip,
  Typography,
  Popconfirm,
  message,
} from 'antd';
import {
  InboxOutlined,
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  EditOutlined,
  EyeOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  ExclamationCircleOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons';
import TitleCustom from 'src/components/TitleCustom';
import CustomTable from 'src/components/Table/CustomTable';
import { DEFAULT_PAGE_SIZE } from 'src/constants/constants';
import { PAGE_SIZE } from 'src/constants/pageSizeOptions';
import ROUTER from 'src/router/ROUTER';

const { Text, Paragraph } = Typography;

// Mock Data cho Vật tư nông nghiệp (Farm Supplies)
const MOCK_SUPPLIES = [
  {
    id: 'SUP-001',
    code: 'MAT-MULCH-01',
    name: 'Bạt phủ đất chống cỏ 1.2m x 400m',
    category: 'LAND_PREP',
    categoryName: 'Dụng cụ canh tác & Phủ đất',
    unit: 'Cuộn',
    stockQuantity: 45,
    minQuantity: 10,
    status: 'IN_STOCK',
    statusName: 'Còn hàng',
    supplier: 'Công ty Nhựa Nông Nghiệp Tiên Phong',
    unitPrice: 850000,
    location: 'Kho A - Kệ 02',
    notes: 'Loại bạt HDPE chống tia UV 3 năm.',
  },
  {
    id: 'SUP-002',
    code: 'MAT-SEED-TRAY-56',
    name: 'Khay gieo mạ nhựa đúc 56 lỗ',
    category: 'SEEDLING',
    categoryName: 'Vật tư làm mạ & Giống',
    unit: 'Khay',
    stockQuantity: 8,
    minQuantity: 25,
    status: 'LOW_STOCK',
    statusName: 'Sắp hết hàng',
    supplier: 'Cơ sở Nhựa Nông Lâm',
    unitPrice: 15000,
    location: 'Kho B - Kệ 01',
    notes: 'Cần nhập thêm 200 khay phục vụ vụ mùa mới.',
  },
  {
    id: 'SUP-003',
    code: 'MAT-PACK-ST25-5K',
    name: 'Bao bì túi gạo ST25 5kg (Có mã QR)',
    category: 'PACKAGING',
    categoryName: 'Bao bì & Đóng gói',
    unit: 'Bao',
    stockQuantity: 2500,
    minQuantity: 500,
    status: 'IN_STOCK',
    statusName: 'Còn hàng',
    supplier: 'Công ty In Bao Bì Á Châu',
    unitPrice: 3200,
    location: 'Kho C - Khu bao bì',
    notes: 'Túi màng ghép PA/PE in 6 màu cao cấp.',
  },
  {
    id: 'SUP-004',
    code: 'MAT-IRRI-NOZZLE-8B',
    name: 'Béc phun mưa cục bộ bù áp 90L/h',
    category: 'IRRIGATION_PARTS',
    categoryName: 'Phụ kiện hệ thống tưới',
    unit: 'Cái',
    stockQuantity: 0,
    minQuantity: 50,
    status: 'OUT_OF_STOCK',
    statusName: 'Hết hàng',
    supplier: 'Công ty Thiết bị Tưới Netafim',
    unitPrice: 12000,
    location: 'Kho A - Kệ 05',
    notes: 'Đã tạo yêu cầu mua bổ sung 300 cái.',
  },
  {
    id: 'SUP-005',
    code: 'MAT-INSECT-LAMP',
    name: 'Đèn năng lượng mặt trời bẫy côn trùng',
    category: 'PEST_CONTROL',
    categoryName: 'Vật tư bảo vệ & Bẫy sâu',
    unit: 'Bộ',
    stockQuantity: 30,
    minQuantity: 5,
    status: 'IN_STOCK',
    statusName: 'Còn hàng',
    supplier: 'Công ty Công nghệ Sinh học Xanh',
    unitPrice: 450000,
    location: 'Kho A - Khu bẫy sinh học',
    notes: 'Tự động bật ban đêm, thu hút rầy nâu và sâu cuốn lá.',
  },
];

const CATEGORY_OPTIONS = [
  { value: 'all', label: 'Tất cả nhóm vật tư' },
  { value: 'LAND_PREP', label: 'Dụng cụ canh tác & Phủ đất' },
  { value: 'SEEDLING', label: 'Vật tư làm mạ & Giống' },
  { value: 'PACKAGING', label: 'Bao bì & Đóng gói' },
  { value: 'IRRIGATION_PARTS', label: 'Phụ kiện hệ thống tưới' },
  { value: 'PEST_CONTROL', label: 'Vật tư bảo vệ & Bẫy sâu' },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tất cả trạng thái kho' },
  { value: 'IN_STOCK', label: 'Còn hàng trong kho' },
  { value: 'LOW_STOCK', label: 'Sắp hết hàng (Cảnh báo)' },
  { value: 'OUT_OF_STOCK', label: 'Hết hàng' },
];

const STATUS_TAG_MAP = {
  IN_STOCK: { color: 'green', icon: <CheckCircleOutlined />, label: 'Còn hàng' },
  LOW_STOCK: { color: 'warning', icon: <ExclamationCircleOutlined />, label: 'Sắp hết hàng' },
  OUT_OF_STOCK: { color: 'error', icon: <WarningOutlined />, label: 'Hết hàng' },
};

const ViewFarmSupplies = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(MOCK_SUPPLIES);
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
        item.supplier.toLowerCase().includes(search.toLowerCase());

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
    navigate(ROUTER.FM_VIEW_FARM_SUPPLY_CREATE);
  };

  // Mở màn Xem chi tiết
  const handleOpenDetail = (record) => {
    navigate(ROUTER.FM_VIEW_FARM_SUPPLY_DETAIL.replace(':id', record.id));
  };

  // Mở màn Chỉnh sửa
  const handleOpenEdit = (record) => {
    navigate(ROUTER.FM_VIEW_FARM_SUPPLY_EDIT.replace(':id', record.id));
  };

  // Xoá vật tư
  const handleDelete = (id) => {
    setData(data.filter((item) => item.id !== id));
    message.success('Đã xoá vật tư khỏi danh mục kho');
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
      title: 'Tên vật tư nông nghiệp',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <Text strong className="block text-slate-800 hover:text-green-600 cursor-pointer" onClick={(e) => { e.stopPropagation(); handleOpenDetail(record); }}>
            {text}
          </Text>
          <Text className="text-xs text-slate-400 font-medium">Đơn vị: {record.unit}</Text>
        </div>
      ),
    },
    {
      title: 'Nhóm vật tư',
      dataIndex: 'categoryName',
      key: 'categoryName',
      width: 200,
      render: (text) => <Tag color="orange" className="rounded-md font-medium text-xs">{text}</Tag>,
    },
    {
      title: 'Tồn kho',
      dataIndex: 'stockQuantity',
      key: 'stockQuantity',
      width: 130,
      align: 'right',
      render: (qty, record) => (
        <div className="text-right">
          <Text strong className={`text-sm ${qty === 0 ? 'text-red-600' : qty <= record.minQuantity ? 'text-amber-600' : 'text-emerald-700'}`}>
            {qty.toLocaleString('vi-VN')} {record.unit}
          </Text>
        </div>
      ),
    },
    {
      title: 'Trạng thái kho',
      dataIndex: 'status',
      key: 'status',
      width: 150,
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
      title: 'Nhà cung cấp',
      dataIndex: 'supplier',
      key: 'supplier',
      width: 200,
      render: (text) => <Text className="text-xs text-slate-600 truncate block max-w-xs">{text}</Text>,
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
            title="Xoá vật tư này?"
            description="Bạn có chắc chắn muốn xoá vật tư này khỏi kho?"
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
            <InboxOutlined className="text-emerald-600" /> Quản lý Vật tư Nông nghiệp
          </TitleCustom>
          <Text className="text-slate-500 text-xs sm:text-sm">
            Quản lý bạt phủ đất, khay mạ, bao bì đóng gói, béc tưới và vật tư canh tác nông trại.
          </Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleOpenCreate}
          className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-semibold shadow-sm"
        >
          Thêm vật tư mới
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
            placeholder="Tìm theo tên vật tư..."
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

export default ViewFarmSupplies;
