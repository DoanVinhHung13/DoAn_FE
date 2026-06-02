import React, { useState, useMemo } from 'react';
import { Card, Table, Typography, Button, Space, Modal, Drawer, Select, QRCode, Tag, Badge, Row, Col, Form, Descriptions, Steps, Upload, message, Tooltip, Grid, Pagination } from 'antd';
import { PlusOutlined, EditOutlined, QrcodeOutlined, EyeOutlined, BarsOutlined, AppstoreOutlined, CalendarOutlined, EnvironmentOutlined, ProfileOutlined, TagOutlined, RightOutlined, FileOutlined, FileTextOutlined, DownloadOutlined, UploadOutlined, FileExcelOutlined, HistoryOutlined, CheckCircleOutlined, ClockCircleOutlined, UserOutlined, TeamOutlined } from '@ant-design/icons';
import { Leaf } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import api from 'src/services/01_axios';
import JournalHistoryModal from 'src/components/Modal/JournalHistory';
import { useSelector } from 'react-redux';
import JournalService from 'src/services/JournalService'
import InventoryService from 'src/services/InventoryService'

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const JournalList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state) => state.appGlobal);
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  // Xác định category dựa theo URL hiện tại
  const getCategoryFromPath = (path) => {
    if (path.startsWith('/vietgap')) {
      if (path.includes('chan-nuoi')) return { key: 'channuoi', label: 'VietGAHP Chăn nuôi', desc: 'Quản lý nhật ký chăn nuôi theo tiêu chuẩn VietGAP' };
      if (path.includes('thuy-san')) return { key: 'thuysan', label: 'VietGAP Thủy sản', desc: 'Quản lý nhật ký nuôi trồng thủy sản theo VietGAP' };
      return { key: 'trongtrot', label: 'VietGAP Trồng trọt', desc: 'Quản lý nhật ký sản xuất trồng trọt theo tiêu chuẩn VietGAP' };
    }
    if (path.startsWith('/huuco')) {
      if (path.includes('cay-trong')) return { key: 'huuco_caytrong', label: 'Hữu cơ - Cây trồng', desc: 'Nhật ký sản xuất cây trồng hữu cơ' };
      if (path.includes('chan-nuoi')) return { key: 'huuco_channuoi', label: 'Hữu cơ - Chăn nuôi', desc: 'Nhật ký chăn nuôi hữu cơ' };
      if (path.includes('thuy-san')) return { key: 'huuco_thuysan', label: 'Hữu cơ - Thủy sản', desc: 'Nhật ký thủy sản hữu cơ' };
      return { key: 'huuco', label: 'Nông nghiệp Hữu cơ', desc: 'Nhật ký sản xuất hữu cơ, không sử dụng hoá chất tổng hợp' };
    }
    if (path.startsWith('/thongminh')) return { key: 'thongminh', label: 'Nông nghiệp Thông minh', desc: 'Nhật ký sản xuất ứng dụng công nghệ cao' };
    return { key: null, label: 'Danh sách sổ nhật ký', desc: 'Toàn bộ nhật ký sản xuất' };
  };

  const category = getCategoryFromPath(location.pathname);

  const [schemaModalVisible, setSchemaModalVisible] = useState(false);
  const [selectedSchema, setSelectedSchema] = useState(null);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [currentQr, setCurrentQr] = useState('');
  const [viewMode, setViewMode] = useState('card');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedJournalId, setSelectedJournalId] = useState(null);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [importSchemaId, setImportSchemaId] = useState(null);
  const [selectedJournals, setSelectedJournals] = useState([]);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [historyJournalId, setHistoryJournalId] = useState(null);
  const [typeFilter, setTypeFilter] = useState('all'); // all, personal, htx

  const { data: journalsRaw, isLoading } = useQuery({
    queryKey: ['journals', category.key],
    queryFn: () => {
      const params = category.key ? `?category=${category.key}` : '';
      return api.get(`/journals${params}`).then(res => res.data.data);
    }
  });

  const { data: schemasRaw } = useQuery({
    queryKey: ['schemas', category.key],
    queryFn: () => {
      const params = category.key ? `?category=${category.key}` : '';
      return api.get(`/schemas${params}`).then(res => res.data.data);
    }
  });

  // Lọc dự phòng phía client: nếu backend chưa có field category thì filter theo tên
  const channuoiNames = useMemo(() => new Set(['Gia cầm', 'Bò thịt', 'Bò sữa', 'Ong', 'Dê thịt', 'Dê sữa', 'Lợn thịt', 'Lúa hữu cơ']), []);
  
  const schemas = useMemo(() => schemasRaw?.filter(s => {
    if (!category.key) return true;
    if (s.category && s.category === category.key) return true;
    if (!s.category) {
      if (category.key === 'channuoi') return channuoiNames.has(s.name);
      if (category.key === 'trongtrot') return !channuoiNames.has(s.name);
    }
    return false;
  }), [schemasRaw, category.key, channuoiNames]);

  const journals = useMemo(() => journalsRaw?.filter(j => {
    // Filter by category
    let categoryMatch = true;
    if (category.key) {
      const s = j.schemaId;
      if (!s) {
        categoryMatch = false;
      } else if (s.category && s.category === category.key) {
        categoryMatch = true;
      } else if (!s.category) {
        if (category.key === 'channuoi') categoryMatch = channuoiNames.has(s.name);
        else if (category.key === 'trongtrot') categoryMatch = !channuoiNames.has(s.name);
        else categoryMatch = false;
      } else {
        categoryMatch = false;
      }
    }

    if (!categoryMatch) return false;

    // Filter by type (Personal vs HTX)
    if (typeFilter === 'personal') return !j.htxJournalId;
    if (typeFilter === 'htx') return !!j.htxJournalId;
    
    return true;
  }), [journalsRaw, category.key, typeFilter, channuoiNames]);

  const { data: fullJournal, isLoading: isFetchingFull } = useQuery({
    queryKey: ['journal-detail', selectedJournalId],
    queryFn: () => api.get(`/journals/${selectedJournalId}`).then(res => res.data.data),
    enabled: !!selectedJournalId
  });

  // Fetch inventory for mapping supply IDs to names
  const { data: inventory } = useQuery({
    queryKey: ['farmer-inventory-mapping'],
    queryFn: () => InventoryService.getInventory().then(res => res.data.data),
    enabled: !!user && user.role?.toUpperCase() === 'FARMER'
  });

  // Helper function to map value to name if it's an ID
  const displayMappedValue = (value) => {
    if (!value) return <span className="text-gray-300 font-normal italic">Chưa cập nhật</span>;
    if (inventory && typeof value === 'string' && value.length === 24) {
      const item = inventory.find(i => i._id === value);
      if (item) return item.name;
    }
    return value;
  };

  // Helper functions for status
  const getStatusBadge = (record) => {
    const status = record.status;
    const htxStatus = record.htxStatus;

    const badges = {
      'Draft': { icon: '📝', text: 'Nháp', color: 'default' },
      'Submitted': { icon: '📤', text: 'Đã gửi', color: 'processing' },
      'Verified': { icon: '✅', text: 'Đã xác minh', color: 'success' },
      'Locked': { icon: '🔒', text: 'Đã khóa', color: 'error' },
      'Archived': { icon: '📦', text: 'Lưu trữ', color: 'default' }
    };
    
    // Nếu có trạng thái từ HTX thì ưu tiên hiển thị
    if (htxStatus) {
      let color = 'default';
      if (htxStatus === 'Đã duyệt') color = 'success';
      if (htxStatus === 'Chờ duyệt') color = 'processing';
      if (htxStatus === 'Cần chỉnh sửa') color = 'warning';
      if (htxStatus === 'Không đạt') color = 'error';
      
      return (
        <Tooltip title={`Trạng thái từ HTX: ${htxStatus}`}>
          <Tag color={color} className="rounded-md font-bold px-3">
            {htxStatus}
          </Tag>
        </Tooltip>
      );
    }

    const badge = badges[status] || badges['Draft'];
    return (
      <Tag color={badge.color} className="rounded-md font-medium">
        {badge.icon} {badge.text}
      </Tag>
    );
  };

  const showHistory = (journalId) => {
    setHistoryJournalId(journalId);
    setHistoryModalVisible(true);
  };

  // Export single journal
  const handleExportSingle = async (journalId) => {
    try {
      const response = await api.get(`/journals/export/${journalId}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `nhat-ky-${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
      Modal.error({
        title: 'Lỗi xuất dữ liệu',
        content: error.response?.data?.message || 'Không thể xuất nhật ký'
      });
    }
  };

  // Export multiple journals
  const handleExportMultiple = async () => {
    if (selectedJournals.length === 0) {
      Modal.warning({
        title: 'Chưa chọn nhật ký',
        content: 'Vui lòng chọn ít nhất một nhật ký để xuất'
      });
      return;
    }

    try {
      const response = await JournalService.exportMultiple({
        journalIds: selectedJournals
      }, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `nhat-ky-nhieu-${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      setSelectedJournals([]);
    } catch (error) {
      console.error('Export error:', error);
      Modal.error({
        title: 'Lỗi xuất dữ liệu',
        content: error.response?.data?.message || 'Không thể xuất nhật ký'
      });
    }
  };

  // Download import template
  const handleDownloadTemplate = async (schemaId) => {
    try {
      const response = await api.get(`/journals/template/${schemaId}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `mau-import-${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Template download error:', error);
      Modal.error({
        title: 'Lỗi tải mẫu',
        content: error.response?.data?.message || 'Không thể tải mẫu import'
      });
    }
  };

  // Import journal
  const handleImport = async () => {
    if (!selectedFile || !importSchemaId) {
      Modal.warning({
        title: 'Thiếu thông tin',
        content: 'Vui lòng chọn loại sổ và file để import'
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('schemaId', importSchemaId);

    try {
      const response = await JournalService.importJournals(formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      Modal.success({
        title: 'Import thành công',
        content: (
          <div>
            <p>Đã tạo nhật ký mới từ file Excel</p>
            {response.data.data.results.warnings.length > 0 && (
              <div className="mt-2">
                <p className="font-bold">Cảnh báo:</p>
                <ul className="list-disc pl-4">
                  {response.data.data.results.warnings.map((w, i) => (
                    <li key={i} className="text-sm">{w}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ),
        onOk: () => {
          setImportModalVisible(false);
          setSelectedFile(null);
          setImportSchemaId(null);
          window.location.reload();
        }
      });
    } catch (error) {
      console.error('Import error:', error);
      Modal.error({
        title: 'Lỗi import dữ liệu',
        content: error.response?.data?.message || 'Không thể import nhật ký'
      });
    }
  };

  const getEntryValue = (journal, searchLabels) => {
    if (!journal?.entries || !journal?.schemaId) return null;

    const normalizedSearchLabels = searchLabels.map(label => label.toLowerCase().trim());
    const entries = journal.entries || {};
    const schema = journal.schemaId;

    // 1. Tìm các tên trường (internal names) từ schema khớp với nhãn tìm kiếm
    const targetFields = [];
    if (schema.tables) {
      schema.tables.forEach(table => {
        if (table.fields) {
          table.fields.forEach(field => {
            const lowerLabel = field.label.toLowerCase().trim();
            const lowerName = field.name.toLowerCase().trim();
            
            if (normalizedSearchLabels.some(sn => 
              lowerLabel.includes(sn) || sn.includes(lowerLabel) ||
              lowerName.includes(sn) || sn.includes(lowerName)
            )) {
              targetFields.push({ tableName: table.tableName, fieldName: field.name });
            }
          });
        }
      });
    }

    // 2. Lấy giá trị từ entries dựa trên các trường đã tìm thấy
    for (const target of targetFields) {
      const val = entries[target.tableName]?.[target.fieldName];
      if (val !== undefined && val !== null && val !== '') return val;
    }

    // 3. Fallback: Quét toàn bộ entries nếu không tìm thấy qua schema
    for (const table in entries) {
      const tableObj = entries[table];
      if (tableObj && typeof tableObj === 'object') {
        for (const key in tableObj) {
          const lowerKey = key.toLowerCase().trim();
          if (normalizedSearchLabels.some(sn => lowerKey.includes(sn) || sn.includes(lowerKey))) {
            const val = tableObj[key];
            if (val !== undefined && val !== null && val !== '') return val;
          }
        }
      }
    }

    return null;
  };

  const columns = [
    {
      title: 'STT',
      key: 'stt',
      width: 60,
      render: (_, __, index) => (currentPage - 1) * pageSize + index + 1
    },
    {
      title: 'Tên quy trình',
      dataIndex: ['schemaId', 'name'],
      key: 'schema',
      render: (text) => <Text strong className="text-gray-800">{text}</Text>
    },
    {
      title: 'Người tạo',
      dataIndex: ['userId', 'username'],
      key: 'user',
      render: (text) => <Tag color="blue" className="rounded-md border-blue-100 font-medium">{text}</Tag>
    },
    {
      title: 'Loại hình',
      key: 'type',
      render: (_, record) => (
        record.htxJournalId ? 
          <Tag color="purple" icon={<TeamOutlined />} className="rounded-md font-bold px-3">HTX Liên kết</Tag> : 
          <Tag color="cyan" icon={<UserOutlined />} className="rounded-md font-bold px-3">Cá nhân</Tag>
      )
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_, record) => getStatusBadge(record)
    },
    {
      title: 'Nhận xét HTX',
      dataIndex: 'feedback',
      key: 'feedback',
      render: (text) => text ? <Text type="danger" className="italic text-xs">{text}</Text> : <Text className="text-gray-300 italic text-xs">Không có</Text>
    },
    {
      title: 'Lịch sử',
      dataIndex: 'editCount',
      key: 'editCount',
      render: (count, record) => (
        <Tooltip title="Xem lịch sử chỉnh sửa">
          <Button
            type="text"
            size="small"
            icon={<HistoryOutlined />}
            onClick={() => showHistory(record._id)}
            className="text-gray-600 hover:text-blue-600"
          >
            {count || 0} lần
          </Button>
        </Tooltip>
      )
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => <Text className="text-gray-400 font-medium">{new Date(date).toLocaleDateString('vi-VN')}</Text>
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="text"
            className="flex items-center justify-center hover:bg-green-50 text-green-600 rounded-lg"
            icon={<EditOutlined />}
            onClick={() => navigate(`${location.pathname}/edit/${record._id}`)}
          />
          <Button
            type="text"
            className="flex items-center justify-center hover:bg-blue-50 text-blue-600 rounded-lg"
            icon={<DownloadOutlined />}
            onClick={() => handleExportSingle(record._id)}
            title="Xuất Excel"
          />
          <Button
            type="text"
            className="flex items-center justify-center hover:bg-green-50 text-green-600 rounded-lg"
            icon={<QrcodeOutlined />}
            onClick={() => {
              // Dùng biến môi trường VITE_APP_URL nếu có, không thì dùng window.location.origin
              const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;
              setCurrentQr(`${baseUrl}/trace/${record.qrCode}`);
              setQrModalVisible(true);
            }}
          />
          <Button
            type="text"
            className="flex items-center justify-center hover:bg-gray-100 text-gray-400 rounded-lg"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedJournalId(record._id);
              setViewModalVisible(true);
            }}
          />
        </Space>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <Title level={3} className="!mb-0 text-gray-800">{category.label}</Title>
          <Text className="text-gray-400 text-sm">{category.desc}</Text>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select
            value={typeFilter}
            onChange={setTypeFilter}
            className="w-40 shadow-sm"
            placeholder="Phân loại sổ"
          >
            <Select.Option value="all">Tất cả loại sổ</Select.Option>
            <Select.Option value="personal">Sổ cá nhân</Select.Option>
            <Select.Option value="htx">Sổ HTX liên kết</Select.Option>
          </Select>
          <Space.Compact className="shadow-sm rounded-lg overflow-hidden bg-white">
            <Button
              type={viewMode === 'table' ? 'primary' : 'default'}
              icon={<BarsOutlined />}
              onClick={() => setViewMode('table')}
              className={viewMode === 'table' ? 'bg-green-600 hover:bg-green-700 border-0' : 'text-gray-500'}
            >
              {screens.md && 'Xem ở dạng bảng'}
            </Button>
            <Button
              type={viewMode === 'card' ? 'primary' : 'default'}
              icon={<AppstoreOutlined />}
              onClick={() => setViewMode('card')}
              className={viewMode === 'card' ? 'bg-green-600 hover:bg-green-700 border-0' : 'text-gray-500'}
            >
              {screens.md && 'Xem ở dạng thẻ'}
            </Button>
          </Space.Compact>
        </div>
      </div>

      {/* Main Table/Card Content */}
      <Card variant="borderless" className="shadow-sm rounded-xl overflow-hidden border border-green-200 p-0" styles={{ body: { padding: 0 } }}>
        {/* Toolbar in Card */}
        <div className="p-4 flex justify-between items-center bg-white border-b border-green-200">
          <Space>
            {selectedJournals.length > 0 && (
              <>
                <Text className="text-gray-600">Đã chọn: <strong>{selectedJournals.length}</strong></Text>
                <Button
                  icon={<DownloadOutlined />}
                  onClick={handleExportMultiple}
                  className="text-blue-600 border-blue-300 hover:bg-blue-50"
                >
                  Xuất {selectedJournals.length} nhật ký
                </Button>
                <Button
                  size="small"
                  type="text"
                  onClick={() => setSelectedJournals([])}
                  className="text-gray-400"
                >
                  Bỏ chọn
                </Button>
              </>
            )}
          </Space>
          <Space>
              <>
                {user?.role?.toUpperCase() !== 'FARMER' && (
                  <Button
                    icon={<UploadOutlined />}
                    onClick={() => setImportModalVisible(true)}
                    className="text-green-600 border-green-300 hover:bg-green-50"
                  >
                    Import
                  </Button>
                )}
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setSchemaModalVisible(true)}
                  className="bg-green-500 hover:bg-green-600 rounded whitespace-nowrap h-9 font-medium"
                >
                  Tạo sổ nhật ký
                </Button>
              </>
          </Space>
        </div>

        {/* Card View */}
        {viewMode === 'card' && (
          <div className="p-6 bg-gray-50 min-h-[400px]">
            {journals && journals.length > 0 ? (
              <>
                <Row gutter={[24, 24]}>
                  {journals?.slice((currentPage - 1) * pageSize, currentPage * pageSize).map(journal => (
                  <Col xs={24} sm={12} lg={8} key={journal._id}>
                    <Card
                      hoverable
                      className="h-full rounded-xl border border-gray-200 overflow-hidden flex flex-col shadow-sm"
                      styles={{ body: { padding: 0, display: 'flex', flexDirection: 'column', height: '100%' } }}
                    >
                      <div className="p-5 flex-1 relative flex">
                        <div className="w-10 pt-2 flex justify-center text-orange-400 opacity-60">
                          <Leaf className="w-6 h-6" />
                        </div>
                        <div className="flex-1 space-y-3">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex flex-col gap-1">
                              <Text strong className="text-gray-700 text-sm">{journal.qrCode?.substring(0, 6).toUpperCase()} - {journal.userId?.fullname || journal.userId?.username}</Text>
                              {journal.htxJournalId ? (
                                <Tag color="purple" className="m-0 w-fit text-[10px] font-bold rounded-full border-0 bg-purple-50 text-purple-600">
                                  <TeamOutlined className="mr-1" /> HTX LIÊN KẾT
                                </Tag>
                              ) : (
                                <Tag color="cyan" className="m-0 w-fit text-[10px] font-bold rounded-full border-0 bg-cyan-50 text-cyan-600">
                                  <UserOutlined className="mr-1" /> CÁ NHÂN TỰ DO
                                </Tag>
                              )}
                            </div>
                          </div>
                          <div className="grid grid-cols-[100px_1fr] gap-y-2 text-sm text-gray-600 items-start">
                            
                             {/* Lô sản xuất */}
                             <div className="flex items-center gap-1.5"><AppstoreOutlined className="text-green-500" /> Lô sản xuất:</div>
                             <div className="text-right">
                               <Text strong>
                                 {displayMappedValue(getEntryValue(journal, ['loSanXuat', 'Lô sản xuất', 'block_id']))}
                               </Text>
                             </div>

                            {/* Diện tích */}
                            <div className="flex items-center gap-1.5"><ProfileOutlined className="text-green-500" /> Diện tích:</div>
                            <div className="text-right">
                              <Text strong>
                                {(() => {
                                  const value = getEntryValue(journal, ['dienTich', 'Diện tích', 'area']);
                                  return value ? `${Number(value).toLocaleString('vi-VN')} m²` : <span className="text-gray-300 font-normal italic">Chưa cập nhật</span>;
                                })()}
                              </Text>
                            </div>

                            {/* Địa chỉ sản xuất */}
                            <div className="flex items-center gap-1.5"><EnvironmentOutlined className="text-green-500" /> Địa chỉ:</div>
                            <div className="text-right leading-tight">
                              <Text strong>
                                {displayMappedValue(getEntryValue(journal, ['diaChiSanXuat', 'diaChiCoSo', 'diaChi', 'Địa chỉ', 'location', 'address']))}
                              </Text>
                            </div>

                            {/* Giống */}
                            <div className="flex items-center gap-1.5"><CheckCircleOutlined className="text-green-500" /> Giống:</div>
                            <div className="text-right">
                              <Text strong>
                                {displayMappedValue(getEntryValue(journal, ['giong', 'Giống', 'tenGiong', 'giống chè']))}
                              </Text>
                            </div>

                            {/* Loại sổ */}
                            <div className="flex items-center gap-1.5 mt-2"><FileTextOutlined className="text-green-500" /> Loại sổ:</div>
                            <div className="text-right mt-2"><Text strong className="text-green-600">{journal.schemaId?.name}</Text></div>

                            {/* Ngày tạo */}
                            <div className="flex items-center gap-1.5"><CalendarOutlined className="text-green-500" /> Ngày tạo:</div>
                            <div className="text-right"><Text strong>{new Date(journal.createdAt).toLocaleDateString('vi-VN')}</Text></div>
                          </div>
                          
                          {/* Feedback from HTX */}
                          {journal.feedback && (
                            <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl">
                              <Text className="text-red-500 text-[11px] font-bold uppercase block mb-1">💬 Phản hồi từ HTX:</Text>
                              <Text className="text-red-600 text-xs italic leading-tight">{journal.feedback}</Text>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex border-t border-gray-100 mt-auto bg-white">
                        <div
                          className="flex-1 p-3 text-center hover:bg-green-50 transition-colors cursor-pointer border-r border-gray-100"
                          onClick={() => navigate(`${location.pathname}/edit/${journal._id}`)}
                        >
                          <Text className="text-green-600 font-medium">Vào sổ <RightOutlined className="text-[10px] ml-1" /></Text>
                        </div>
                        <div
                          className="w-12 p-3 text-center hover:bg-green-50 transition-colors cursor-pointer flex items-center justify-center"
                          onClick={(e) => {
                            e.stopPropagation();
                            const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;
                            setCurrentQr(`${baseUrl}/trace/${journal.qrCode}`);
                            setQrModalVisible(true);
                          }}
                        >
                          <QrcodeOutlined className="text-green-600 text-lg" />
                        </div>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
                <div className="mt-8 flex justify-center pb-4">
                  <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={journals.length}
                    onChange={(page, size) => {
                      setCurrentPage(page);
                      setPageSize(size);
                    }}
                    showSizeChanger
                    pageSizeOptions={['6', '12', '24', '48']}
                    showTotal={(total) => <Text className="text-gray-400 text-xs">Tổng cộng <b className="text-green-600">{total}</b> nhật ký</Text>}
                  />
                </div>
              </>
            ) : !isLoading && (
              <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-dashed border-gray-200">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                   <FileTextOutlined className="text-4xl text-gray-200" />
                </div>
                <Title level={4} className="!mb-1 text-gray-400">Chưa có sổ nhật ký nào</Title>
                <Text className="text-gray-400 mb-8">
                  Bạn hãy bắt đầu bằng cách tạo một sổ nhật ký mới cho chuyên mục này.
                </Text>
                  <Button 
                    type="primary" 
                    size="large" 
                    icon={<PlusOutlined />} 
                    onClick={() => setSchemaModalVisible(true)}
                    className="bg-green-600 hover:bg-green-700 rounded-xl px-8 h-12 shadow-lg shadow-green-200"
                  >
                    Tạo sổ ngay
                  </Button>
              </div>
            )}
          </div>
        )}

        {/* Table View */}
        {viewMode === 'table' && (
          <div className="p-0">
            <Table
              dataSource={journals}
              columns={columns}
              rowKey="_id"
              loading={isLoading}
              pagination={{
                current: currentPage,
                pageSize: pageSize,
                total: journals?.length,
                onChange: (page, size) => {
                  setCurrentPage(page);
                  setPageSize(size);
                },
                showSizeChanger: true,
                pageSizeOptions: ['6', '12', '24', '48'],
                className: "px-6 py-4"
              }}
              className="border-0"
              size={isMobile ? 'small' : 'middle'}
              scroll={{ x: 800 }}
              rowSelection={{
                selectedRowKeys: selectedJournals,
                onChange: (selectedRowKeys) => setSelectedJournals(selectedRowKeys),
                selections: [
                  Table.SELECTION_ALL,
                  Table.SELECTION_INVERT,
                  Table.SELECTION_NONE,
                ]
              }}
              locale={{
                emptyText: (
                  <div className="py-12 text-center text-gray-400">
                    <FileOutlined className="text-3xl mb-4 block opacity-20" />
                    Danh sách trống
                  </div>
                )
              }}
            />
          </div>
        )}
      </Card>

      <Drawer
        title={<span className="font-bold text-[16px]">Tạo sổ nhật ký</span>}
        placement="right"
        onClose={() => {
          setSchemaModalVisible(false);
          setSelectedSchema(null);
        }}
        open={schemaModalVisible}
        width={400}
        closeIcon={<span className="text-gray-400 font-bold">✕</span>}
        extra={
          <Button
            type="primary"
            className="bg-green-600 font-bold px-6"
            disabled={!selectedSchema}
            onClick={() => {
              if (selectedSchema) {
                navigate(`${location.pathname}/new/${selectedSchema}`);
              }
            }}
          >
            Tiếp tục
          </Button>
        }
      >
        <Form layout="vertical" className="mt-4">
          {schemas && schemas.length === 0 ? (
            <div className="text-center py-10 px-4">
              <div className="text-5xl mb-4">📭</div>
              <div className="font-semibold text-gray-600 text-base mb-1">Chưa có loại sổ nhật ký</div>
              <div className="text-gray-400 text-sm">Danh mục này chưa được cài đặt mẫu sổ. Vui lòng liên hệ quản trị viên.</div>
            </div>
          ) : (
            <Form.Item
              label={<span className="font-medium text-gray-700">Chọn loại sổ</span>}
              required
            >
              <Select
                style={{ width: '100%' }}
                placeholder={<span className="text-gray-400">Vui lòng chọn</span>}
                className="h-10 hover:border-green-400 custom-drawer-select"
                onChange={setSelectedSchema}
                value={selectedSchema}
                loading={!schemas}
              >
                {schemas?.map((s) => (
                  <Select.Option value={s._id} key={s._id}>{s.name}</Select.Option>
                ))}
              </Select>
            </Form.Item>
          )}
        </Form>
      </Drawer>

      <Modal
        title={
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <QrcodeOutlined className="text-green-600 text-xl" />
            </div>
            <div>
              <div className="text-lg font-bold">Mã QR Truy xuất nguồn gốc</div>
              <Text className="text-xs text-gray-500 font-normal">Dành cho người tiêu dùng quét và tra cứu</Text>
            </div>
          </div>
        }
        open={qrModalVisible}
        footer={null}
        onCancel={() => setQrModalVisible(false)}
        centered
        width={600}
        className="rounded-2xl overflow-hidden"
      >
        <div className="p-6">
          {/* QR Code Display */}
          <div className="flex flex-col justify-center items-center mb-6">
            <div id="qr-code-container" className="bg-white p-8 rounded-3xl shadow-xl mb-4 border-4 border-green-100">
              <QRCode
                value={currentQr}
                size={280}
                bordered={false}
                color="#15803d"
                bgColor="#ffffff"
                errorLevel="H"
              />
            </div>
            <Text className="text-gray-400 text-xs mb-2 uppercase font-bold tracking-widest">📱 Quét mã để xem hồ sơ công khai</Text>
            <Text className="text-gray-600 text-sm text-center max-w-md">
              Người tiêu dùng có thể quét mã QR này bằng camera điện thoại để xem đầy đủ thông tin truy xuất nguồn gốc sản phẩm
            </Text>
          </div>

          {/* Download Buttons */}
          <div className="bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-2xl mb-6">
            <Text strong className="block mb-4 text-gray-800">📥 Tải QR Code để in tem nhãn:</Text>
            <Row gutter={[12, 12]}>
              <Col span={12}>
                <Button
                  block
                  size="large"
                  icon={<DownloadOutlined />}
                  className="h-12 rounded-xl border-2 border-green-500 text-green-600 hover:bg-green-50 font-semibold"
                  onClick={() => {
                    const canvas = document.querySelector('#qr-code-container canvas');
                    if (canvas) {
                      const url = canvas.toDataURL('image/png');
                      const link = document.createElement('a');
                      link.download = `QR-${currentQr.split('/').pop()}.png`;
                      link.href = url;
                      link.click();
                      message.success('Đã tải QR Code (PNG)!');
                    }
                  }}
                >
                  Tải PNG (In tem)
                </Button>
              </Col>
              <Col span={12}>
                <Button
                  block
                  size="large"
                  icon={<EyeOutlined />}
                  className="h-12 rounded-xl border-2 border-green-500 text-green-600 hover:bg-green-50 font-semibold"
                  style={{ textDecoration: 'none' }}
                  onClick={() => {
                    if (currentQr) {
                      window.open(currentQr, '_blank');
                    } else {
                      message.warning('Đang chuẩn bị link truy xuất...');
                    }
                  }}
                >
                  Xem trang truy xuất
                </Button>
              </Col>
            </Row>
          </div>

          {/* Instructions */}
          <div className="bg-gray-50 p-5 rounded-2xl">
            <Text strong className="block mb-3 text-gray-800">💡 Hướng dẫn sử dụng:</Text>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-start gap-2">
                <span className="text-green-600 font-bold">1.</span>
                <span>Click "Tải PNG" để tải QR code về máy tính</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600 font-bold">2.</span>
                <span>In QR code ra giấy decal/tem nhãn (kích thước khuyến nghị: 3x3cm đến 5x5cm)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600 font-bold">3.</span>
                <span>Dán tem QR lên bao bì sản phẩm hoặc thùng carton</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600 font-bold">4.</span>
                <span>Người tiêu dùng quét QR bằng camera điện thoại để xem nguồn gốc</span>
              </div>
            </div>
          </div>

          {/* Link Display */}
          <div className="mt-4 p-4 bg-white border border-gray-200 rounded-xl">
            <Text className="text-xs text-gray-400 block mb-1">Link truy xuất:</Text>
            <Text className="text-xs text-gray-600 break-all font-mono">
              <a href={currentQr} target="_blank" rel="noreferrer" className="text-green-600 hover:underline">
                {currentQr}
              </a>
            </Text>
          </div>
        </div>
      </Modal>

      {/* Journal View Modal (Trace Mode) */}
      <Modal
        open={viewModalVisible}
        onCancel={() => {
          setViewModalVisible(false);
          setSelectedJournalId(null);
        }}
        footer={null}
        width={900}
        centered
        className="trace-modal"
        styles={{ body: { padding: 0 } }}
      >
        {isFetchingFull ? (
          <div className="flex flex-col items-center justify-center p-20 bg-white rounded-2xl">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
             <Text className="text-gray-400">Đang tải thông tin chi tiết...</Text>
          </div>
        ) : fullJournal && (
          <div className="overflow-hidden rounded-2xl">
            {/* Header Banner - Like JournalTrace.jsx */}
            <div className="bg-green-600 text-white p-8 text-center relative">
              <div className="absolute top-4 right-4">
                 <Button shape="circle" icon={<span>✕</span>} onClick={() => setViewModalVisible(false)} className="border-0 bg-white/20 text-white hover:bg-white/40" />
              </div>
              <Title level={2} className="!text-white !mb-2">EBookFarm Traceability</Title>
              <p className="opacity-90">Transparent Agricultural Product Information</p>
              <div className="mt-4 inline-block bg-white text-green-700 px-4 py-1 rounded-full font-bold shadow-md">
                  ID: {fullJournal.qrCode}
              </div>
            </div>

            <div className="p-8 max-h-[70vh] overflow-y-auto custom-sidebar-scroll bg-white">
                <div className="flex justify-between items-start mb-8 border-b border-gray-100 pb-6">
                    <div>
                        <Title level={3} className="!mb-1">Product: {fullJournal.schemaId?.name}</Title>
                        <p className="text-gray-500 font-medium">Producer: {fullJournal.userId?.fullname || fullJournal.userId?.username}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Tag color={fullJournal.status === 'Completed' ? 'success' : 'processing'} className="rounded-full px-4 py-0.5 border-0 font-bold m-0 text-sm">
                        {fullJournal.status === 'Completed' ? 'Đã hoàn thành' : 'Đang thực hiện'}
                      </Tag>
                      <Button size="small" type="link" icon={<EditOutlined />} onClick={() => navigate(`${location.pathname}/edit/${fullJournal._id}`)}>
                        Chỉnh sửa nhật ký
                      </Button>
                    </div>
                </div>

                <div className="mb-10">
                   <Title level={4} className="!mb-8 flex items-center gap-2">
                     <div className="w-1.5 h-6 bg-green-500 rounded-full"></div>
                     Production Timeline
                   </Title>
                   
                   <Steps
                      direction="vertical"
                      current={fullJournal?.schemaId?.tables?.length || 0}
                      items={(fullJournal?.schemaId?.tables || []).map((table) => {
                          const entryData = fullJournal.entries?.[table.tableName] || {};
                          const hasData = Object.keys(entryData).length > 0;
                          
                          return {
                            title: <span className="text-lg font-bold text-gray-800">{table.tableName}</span>,
                            status: hasData ? 'finish' : 'wait',
                            description: (
                                <div className={`bg-gray-50 p-6 rounded-2xl mt-3 mb-6 border shadow-sm ${hasData ? 'border-green-100' : 'border-gray-100 opacity-60'}`}>
                                    {hasData ? (
                                      <Descriptions size="small" column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }} className="trace-descriptions">
                                          {table.fields.map((field) => (
                                              <Descriptions.Item label={<span className="font-bold text-gray-500">{field.label}</span>} key={field.name}>
                                                  <span className="text-gray-800 font-medium">
                                                    {field.type === 'date' && entryData[field.name] 
                                                      ? new Date(entryData[field.name]).toLocaleDateString('vi-VN')
                                                      : field.type === 'boolean' 
                                                        ? (entryData[field.name] ? 'Có' : 'Không')
                                                        : (entryData[field.name]?.toString() || '---')}
                                                  </span>
                                              </Descriptions.Item>
                                          ))}
                                      </Descriptions>
                                    ) : (
                                      <div className="text-gray-400 italic text-sm py-2">Chưa cập nhật thông tin cho phần này</div>
                                    )}
                                </div>
                            )
                          };
                      })}
                   />
                </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Import Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <FileExcelOutlined className="text-green-600 text-xl" />
            <span className="text-lg font-bold">Import nhật ký từ Excel</span>
          </div>
        }
        open={importModalVisible}
        onCancel={() => {
          setImportModalVisible(false);
          setSelectedFile(null);
          setImportSchemaId(null);
        }}
        onOk={handleImport}
        okText="Import"
        cancelText="Hủy"
        width={600}
        okButtonProps={{
          className: 'bg-green-600 hover:bg-green-700',
          disabled: !selectedFile || !importSchemaId
        }}
      >
        <div className="space-y-6 py-4">
          {/* Step 1: Select Schema */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold">1</div>
              <Text strong className="text-base">Chọn loại sổ nhật ký</Text>
            </div>
            <Select
              style={{ width: '100%' }}
              placeholder="Chọn loại sổ"
              className="h-10"
              onChange={(value) => setImportSchemaId(value)}
              value={importSchemaId}
            >
              {schemas?.map((s) => (
                <Select.Option value={s._id} key={s._id}>
                  {s.name}
                </Select.Option>
              ))}
            </Select>
          </div>

          {/* Step 2: Download Template */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold">2</div>
              <Text strong className="text-base">Tải mẫu Excel</Text>
            </div>
            <Button
              icon={<DownloadOutlined />}
              onClick={() => importSchemaId && handleDownloadTemplate(importSchemaId)}
              disabled={!importSchemaId}
              className="w-full h-10 border-dashed border-2 border-green-300 text-green-600 hover:bg-green-50"
            >
              Tải mẫu import cho loại sổ đã chọn
            </Button>
            <Text className="text-xs text-gray-400 mt-2 block">
              Tải mẫu Excel, điền dữ liệu vào các ô tương ứng, sau đó upload lại
            </Text>
          </div>

          {/* Step 3: Upload File */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold">3</div>
              <Text strong className="text-base">Upload file đã điền</Text>
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors">
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <UploadOutlined className="text-4xl text-gray-300 mb-2" />
                <div className="text-gray-600">
                  {selectedFile ? (
                    <div className="flex items-center justify-center gap-2">
                      <FileExcelOutlined className="text-green-600" />
                      <Text strong className="text-green-600">{selectedFile.name}</Text>
                    </div>
                  ) : (
                    <>
                      <Text className="block">Nhấn để chọn file Excel</Text>
                      <Text className="text-xs text-gray-400">Hỗ trợ: .xlsx, .xls, .csv (tối đa 10MB)</Text>
                    </>
                  )}
                </div>
              </label>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <Text strong className="text-blue-800 block mb-2">📌 Lưu ý:</Text>
            <ul className="text-sm text-blue-700 space-y-1 list-disc pl-5">
              <li>Không thay đổi tên các sheet trong file mẫu</li>
              <li>Không thay đổi tên các trường trong cột "Trường"</li>
              <li>Chỉ nhập dữ liệu vào cột "Giá trị"</li>
              <li>Định dạng ngày: DD/MM/YYYY hoặc YYYY-MM-DD</li>
              <li>Định dạng boolean: "Có" hoặc "Không"</li>
            </ul>
          </div>
        </div>
      </Modal>

      {/* History Modal */}
      <JournalHistoryModal
        visible={historyModalVisible}
        onClose={() => {
          setHistoryModalVisible(false);
          setHistoryJournalId(null);
        }}
        journalId={historyJournalId}
      />
    </div>
  );
};

export default JournalList;
