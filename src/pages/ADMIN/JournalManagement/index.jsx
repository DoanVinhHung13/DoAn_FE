import React, { useState } from 'react';
import { Card, Table, Typography, Tag, Space, Button, Input, Breadcrumb, Badge, Avatar, Select, DatePicker, Modal, Descriptions, Image, message, Statistic, Row, Col } from 'antd';
import { 
  HomeOutlined, 
  SearchOutlined, 
  FileDoneOutlined, 
  QrcodeOutlined,
  EyeOutlined,
  UserOutlined,
  DownloadOutlined,
  FilterOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  LockOutlined,
  UnlockOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from 'src/services/01_axios';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import { API_BASE_URL, getAvatarUrl, getInitialAvatar } from 'src/utils/helpers';
import JournalService from 'src/services/JournalService'

dayjs.extend(relativeTime);
dayjs.locale('vi');

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const AdminJournalMgmt = () => {
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState(null);
  const [selectedJournal, setSelectedJournal] = useState(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isQRModalVisible, setIsQRModalVisible] = useState(false);
  const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch All Journals
  const { data: journals, isLoading } = useQuery({
    queryKey: ['admin-journals'],
    queryFn: () => JournalService.getJournals().then(res => res.data.data)
  });

  const queryClient = useQueryClient();

  // Lock Journal Mutation
  const lockJournalMutation = useMutation({
    mutationFn: (journalId) => api.put(`/journals/${journalId}`, { status: 'Locked', reason: 'Admin khóa dữ liệu bất biến' }),
    onSuccess: () => {
      message.success('Đã khóa sổ nhật ký thành công! Dữ liệu hiện tại là bất biến.');
      queryClient.invalidateQueries({ queryKey: ['admin-journals'] });
    },
    onError: (error) => {
      message.error(error.response?.data?.message || 'Lỗi khi khóa nhật ký.');
    }
  });

  // Approve Journal Mutation (for independent farmers)
  const approveJournalMutation = useMutation({
    mutationFn: (journalId) => api.put(`/journals/${journalId}`, { status: 'Verified', reason: 'Admin duyệt sổ tự do' }),
    onSuccess: () => {
      message.success('Đã duyệt nhật ký thành công! Sổ đã sẵn sàng xuất mã QR chuẩn.');
      queryClient.invalidateQueries({ queryKey: ['admin-journals'] });
    },
    onError: (error) => {
      message.error(error.response?.data?.message || 'Lỗi khi duyệt nhật ký.');
    }
  });

  // Reject Journal Mutation (for independent farmers)
  const rejectJournalMutation = useMutation({
    mutationFn: ({ journalId, feedback }) => api.put(`/journals/${journalId}`, { status: 'Draft', feedback, reason: feedback }),
    onSuccess: () => {
      message.success('Đã từ chối và gửi phản hồi yêu cầu chỉnh sửa!');
      setIsRejectModalVisible(false);
      setRejectReason('');
      queryClient.invalidateQueries({ queryKey: ['admin-journals'] });
    },
    onError: (error) => {
      message.error(error.response?.data?.message || 'Lỗi khi từ chối nhật ký.');
    }
  });

  const handleLockJournal = (record) => {
    Modal.confirm({
      title: 'Xác nhận khóa dữ liệu nhật ký?',
      icon: <ExclamationCircleOutlined className="text-red-500" />,
      content: (
        <div className="space-y-2 mt-2">
          <Text>Bạn đang thực hiện thao tác <Text strong className="text-red-500">Khóa bất biến</Text> cho sổ <b>{record.schemaId?.name || record.qrCode}</b>.</Text>
          <Text className="block text-gray-500">Sau khi khóa, người nông dân sẽ không thể chỉnh sửa thêm bất kỳ thông tin nào. Mã QR sẽ luôn trỏ về phiên bản dữ liệu này.</Text>
        </div>
      ),
      okText: 'Khóa ngay',
      okType: 'danger',
      cancelText: 'Hủy bỏ',
      onOk: () => {
        lockJournalMutation.mutate(record._id);
      }
    });
  };

  const handleApproveJournal = (record) => {
    Modal.confirm({
      title: 'Phê duyệt nhật ký sản xuất?',
      icon: <CheckCircleOutlined className="text-green-500" />,
      content: (
        <div className="space-y-2 mt-2">
          <Text>Bạn (với tư cách Quản trị hệ thống) đang chuẩn bị duyệt sổ <Text strong className="text-green-600">{record.schemaId?.name || record.qrCode}</Text>.</Text>
          {!record.htxJournalId && (
            <Text className="block text-gray-500 italic">Lưu ý: Đây là nông hộ tự do (không thuộc HTX). Bạn đóng vai trò là đơn vị kiểm duyệt trung tâm.</Text>
          )}
        </div>
      ),
      okText: 'Duyệt sổ',
      cancelText: 'Hủy bỏ',
      onOk: () => {
        approveJournalMutation.mutate(record._id);
      }
    });
  };

  const handleRejectJournal = (record) => {
    setSelectedJournal(record);
    setRejectReason(record.feedback || '');
    setIsRejectModalVisible(true);
  };

  const submitReject = () => {
    if (!rejectReason.trim()) {
      message.warning('Vui lòng nhập lý do từ chối để nông dân có thể chỉnh sửa!');
      return;
    }
    rejectJournalMutation.mutate({ 
      journalId: selectedJournal._id, 
      feedback: rejectReason 
    });
  };

  // Filter and Sort journals
  const filteredJournals = React.useMemo(() => {
    if (!journals) return [];
    
    let result = journals.filter(journal => {
      // Search filter
      const searchLower = searchText.toLowerCase();
      const matchSearch = !searchText || 
        journal.userId?.username?.toLowerCase().includes(searchLower) ||
        journal.userId?.fullname?.toLowerCase().includes(searchLower) ||
        journal.qrCode?.toLowerCase().includes(searchLower) ||
        journal.schemaId?.name?.toLowerCase().includes(searchLower);

      // Status filter
      let matchStatus = true;
      if (statusFilter !== 'all') {
        matchStatus = journal.status === statusFilter;
      }

      // Date range filter
      const matchDate = !dateRange || (
        dayjs(journal.createdAt).isAfter(dateRange[0]) &&
        dayjs(journal.createdAt).isBefore(dateRange[1])
      );

      return matchSearch && matchStatus && matchDate;
    });

    // Apply Sorting
    result.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [journals, searchText, statusFilter, dateRange, sortOrder]);

  const handleViewDetail = (record) => {
    setSelectedJournal(record);
    setIsDetailModalVisible(true);
  };

  const handleViewQR = (record) => {
    setSelectedJournal(record);
    setIsQRModalVisible(true);
  };

  const handleDownloadQR = () => {
    if (!selectedJournal) return;
    
    // Create QR code URL - Dùng biến môi trường
    const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${baseUrl}/trace/${selectedJournal.qrCode}`;
    
    // Download
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = `QR_${selectedJournal.qrCode}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    message.success('Đã tải QR Code!');
  };

  const stats = {
    total: journals?.length || 0,
    inProgress: journals?.filter(j => j.status !== 'Completed').length || 0,
    completed: journals?.filter(j => j.status === 'Completed').length || 0,
    thisMonth: journals?.filter(j => dayjs(j.createdAt).isAfter(dayjs().startOf('month'))).length || 0
  };

  const getStatusDisplay = (record) => {
    const { status, htxStatus } = record;
    if (status === 'Locked') return <Tag color="red" icon={<LockOutlined />} className="rounded-full px-3">Đã khóa (Bất biến)</Tag>;
    if (status === 'Verified') return <Tag color="green" icon={<CheckCircleOutlined />} className="rounded-full px-3">HTX Đã duyệt</Tag>;
    if (status === 'Submitted') return <Tag color="blue" icon={<ClockCircleOutlined />} className="rounded-full px-3">Chờ duyệt</Tag>;
    if (status === 'Draft') return <Tag color="orange" icon={<ClockCircleOutlined />} className="rounded-full px-3">Đang thực hiện</Tag>;
    return <Tag color="default" className="rounded-full px-3">{status}</Tag>;
  };

  const columns = [
    {
      title: 'STT',
      key: 'stt',
      width: '5%',
      align: 'center',
      render: (text, record, index) => (
        <span className="text-gray-400 font-mono">{(currentPage - 1) * pageSize + index + 1}</span>
      )
    },
    {
      title: 'Thông tin nhật ký',
      key: 'journal_info',
      width: '30%',
      render: (record) => (
        <div className="flex flex-col gap-1">
          <Text strong className="text-base text-green-700">{record.schemaId?.name || 'Chưa đặt tên'}</Text>
          <div className="flex items-center gap-2 text-[10px] text-gray-400">
             <span className="bg-gray-100 px-1.5 py-0.5 rounded">Mã: {record.qrCode?.substring(0, 8)}...</span>
             <span>Tạo: {dayjs(record.createdAt).format('DD/MM/YYYY')}</span>
          </div>
        </div>
      )
    },
    {
      title: 'Nông dân',
      key: 'farmer_info',
      width: '25%',
      render: (record) => (
        <div className="flex items-center gap-2">
          <Avatar 
            size={32} 
            icon={<UserOutlined />} 
            className="bg-green-50 text-green-600 border border-green-100"
            src={getAvatarUrl(record.userId?.avatar)}
          >
            {!record.userId?.avatar && getInitialAvatar(record.userId?.fullname || record.userId?.username)}
          </Avatar>
          <div className="flex flex-col">
            <Text className="text-sm font-semibold text-gray-800">{record.userId?.fullname || record.userId?.username || 'N/A'}</Text>
            <Text className="text-[10px] text-gray-400 italic">@{record.userId?.username}</Text>
          </div>
        </div>
      )
    },
    {
      title: 'Trạng thái',
      key: 'status_info',
      width: '20%',
      align: 'center',
      render: (record) => (
        <div className="flex flex-col items-center gap-1">
          {getStatusDisplay(record)}
          {record.htxStatus && record.status !== 'Verified' && (
            <Text className="text-[10px] text-gray-400 font-medium">HTX: {record.htxStatus}</Text>
          )}
        </div>
      )
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: '20%',
      align: 'right',
      render: (record) => (
        <Space size="middle">
          {record.status === 'Submitted' && (
            <>
              <Button 
                icon={<CheckCircleOutlined />} 
                size="middle" 
                onClick={() => handleApproveJournal(record)}
                className="flex items-center justify-center w-10 h-10 rounded-xl shadow-sm text-green-600 border-green-200 hover:bg-green-50"
                title="Duyệt nhật ký"
              />
              <Button 
                icon={<CloseCircleOutlined />} 
                size="middle" 
                onClick={() => handleRejectJournal(record)}
                className="flex items-center justify-center w-10 h-10 rounded-xl shadow-sm text-orange-600 border-orange-200 hover:bg-orange-50"
                title="Từ chối & Yêu cầu sửa"
              />
            </>
          )}
          {record.status !== 'Locked' && (
            <Button 
              icon={<LockOutlined />} 
              size="middle" 
              danger
              onClick={() => handleLockJournal(record)}
              className="flex items-center justify-center w-10 h-10 rounded-xl shadow-sm border-red-100 hover:bg-red-50"
              title="Khóa dữ liệu bất biến"
            />
          )}
          <Button 
            icon={<EyeOutlined />} 
            size="middle" 
            onClick={() => handleViewDetail(record)}
            className="flex items-center justify-center w-10 h-10 rounded-xl shadow-sm border-gray-100 hover:text-green-600"
            title="Xem chi tiết"
          />
          <Button 
            icon={<QrcodeOutlined />} 
            size="middle" 
            type="primary" 
            onClick={() => handleViewQR(record)}
            className="flex items-center justify-center w-10 h-10 rounded-xl shadow-sm bg-green-600 border-0"
            title="Xem mã QR"
          />
        </Space>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Breadcrumb */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-gray-400 text-xs font-semibold uppercase tracking-wider">
          <HomeOutlined />
          <span>Quản lý</span>
          <span className="text-gray-200">/</span>
          <span className="text-green-600">Giám sát nhật ký</span>
        </div>
        <Title level={4} className="!mb-0">Giám sát Nhật ký Sản xuất</Title>
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="rounded-2xl border-0 shadow-sm bg-gradient-to-br from-green-500 to-green-600">
            <Statistic
              title={<Text className="text-white/80 uppercase text-xs font-bold">Tổng số nhật ký</Text>}
              value={stats.total}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#fff', fontSize: '32px', fontWeight: 'bold' }}
              suffix={<Badge status="processing" color="white" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="rounded-2xl border-gray-100">
            <Statistic
              title="Đang thực hiện"
              value={stats.inProgress}
              prefix={<ClockCircleOutlined className="text-orange-500" />}
              valueStyle={{ color: '#f97316' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="rounded-2xl border-gray-100">
            <Statistic
              title="Đã hoàn thành"
              value={stats.completed}
              prefix={<CheckCircleOutlined className="text-green-500" />}
              valueStyle={{ color: '#22c55e' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="rounded-2xl border-gray-100">
            <Statistic
              title="Tháng này"
              value={stats.thisMonth}
              prefix={<CalendarOutlined className="text-blue-500" />}
              valueStyle={{ color: '#3b82f6' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="rounded-2xl border-gray-100 shadow-sm">
        <Space size="middle" wrap className="w-full">
          <Input 
            prefix={<SearchOutlined className="text-gray-400" />} 
            placeholder="Tìm theo tên, người dùng, mã QR..." 
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-80 h-10 rounded-xl"
            allowClear
          />
          
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            className="w-48 h-10"
            placeholder="Lọc theo trạng thái"
          >
            <Option value="all">
              <Space>
                <FilterOutlined />
                <span>Tất cả trạng thái</span>
              </Space>
            </Option>
            <Option value="Draft">
              <Space>
                <ClockCircleOutlined className="text-orange-500" />
                <span>Đang thực hiện</span>
              </Space>
            </Option>
            <Option value="Submitted">
              <Space>
                <ClockCircleOutlined className="text-blue-500" />
                <span>Chờ duyệt</span>
              </Space>
            </Option>
            <Option value="Verified">
              <Space>
                <CheckCircleOutlined className="text-green-500" />
                <span>Đã duyệt (HTX)</span>
              </Space>
            </Option>
          </Select>

          <Select
            value={sortOrder}
            onChange={setSortOrder}
            className="w-40 h-10 ml-2"
          >
            <Option value="newest">Mới nhất</Option>
            <Option value="oldest">Cũ nhất</Option>
          </Select>

          <RangePicker
            value={dateRange}
            onChange={setDateRange}
            format="DD/MM/YYYY"
            placeholder={['Từ ngày', 'Đến ngày']}
            className="h-10 rounded-xl"
          />

          {(searchText || statusFilter !== 'all' || dateRange) && (
            <Button
              onClick={() => {
                setSearchText('');
                setStatusFilter('all');
                setDateRange(null);
              }}
              className="h-10 rounded-xl"
            >
              Xóa bộ lọc
            </Button>
          )}

          <Text className="text-sm text-gray-500 ml-auto">
            Hiển thị <Text strong className="text-green-600">{filteredJournals?.length || 0}</Text> / {stats.total} nhật ký
          </Text>
        </Space>
      </Card>

      <Card bordered={false} className="shadow-sm rounded-2xl overflow-hidden">
        <Table 
          columns={columns} 
          dataSource={filteredJournals} 
          loading={isLoading}
          className="premium-table-refined custom-pagination"
          pagination={{ 
            current: currentPage,
            pageSize: pageSize,
            showSizeChanger: true,
            showTotal: (total) => <span className="text-gray-400">Tổng <b className="text-green-600">{total}</b> nhật ký</span>,
            pageSizeOptions: ['10', '20', '50', '100'],
            locale: { items_per_page: '/ trang' },
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
            className: "pb-4 px-4"
          }}
          scroll={{ x: 1000 }}
          rowKey="_id"
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title={<div className="flex items-center gap-2"><FileTextOutlined className="text-green-600" /><Text strong className="text-lg">Chi tiết Nhật ký sản xuất</Text></div>}
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={null}
        width={900}
        centered
        className="rounded-3xl overflow-hidden"
      >
        {selectedJournal && (
          <div className="space-y-6 pt-4">
            <Descriptions bordered column={2} size="middle" labelStyle={{ fontWeight: 'bold', backgroundColor: '#f9fafb', width: '150px' }}>
              <Descriptions.Item label="Tên nhật ký" span={2}>
                <Text strong className="text-green-700 text-lg">{selectedJournal.schemaId?.name || 'Không có'}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Mã QR">
                <Text copyable className="text-blue-600 font-mono">{selectedJournal.qrCode}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Space direction="vertical" size={0}>
                  {getStatusDisplay(selectedJournal)}
                  {selectedJournal.htxStatus && selectedJournal.status !== 'Verified' && (
                    <Text className="text-[10px] text-gray-400 font-medium">HTX: {selectedJournal.htxStatus}</Text>
                  )}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Hộ nông dân">
                <Space>
                   <Avatar size="small" icon={<UserOutlined />} src={getAvatarUrl(selectedJournal.userId?.avatar)}>
                      {!selectedJournal.userId?.avatar && getInitialAvatar(selectedJournal.userId?.fullname || selectedJournal.userId?.username)}
                   </Avatar>
                   <Text strong>{selectedJournal.userId?.fullname || selectedJournal.userId?.username}</Text>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Email liên hệ">
                {selectedJournal.userId?.email || 'Không có'}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">
                {dayjs(selectedJournal.createdAt).format('DD/MM/YYYY HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label="Cập nhật cuối">
                {dayjs(selectedJournal.updatedAt).format('DD/MM/YYYY HH:mm')}
              </Descriptions.Item>
              
              {/* Các trường bổ sung từ hồ sơ Nông dân */}
              <Descriptions.Item label="Diện tích farm">
                <Text>{selectedJournal.userId?.farmArea ? `${selectedJournal.userId.farmArea} m²` : 'Chưa cập nhật'}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Loại hình">
                <Tag color="cyan">{selectedJournal.userId?.farmType || 'Không có'}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Hợp tác xã / Tổ chức" span={2}>
                <Text strong className="text-blue-700">{selectedJournal.userId?.organization || 'Cá nhân / Tự do'}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Chứng nhận" span={2}>
                <Space wrap>
                  {selectedJournal.userId?.certifications?.map((cert, idx) => (
                    <Tag key={idx} color="gold" className="rounded-md border-0 font-bold">
                      {typeof cert === 'string' ? cert : (cert.name || cert.code || 'Chứng nhận')}
                    </Tag>
                  )) || 'Chưa có chứng nhận'}
                </Space>
              </Descriptions.Item>

              {/* Nhận xét từ HTX */}
              {selectedJournal.feedback && (
                <Descriptions.Item label="Nhận xét từ HTX" span={2} labelStyle={{ color: '#d97706' }}>
                  <div className="bg-orange-50 p-3 rounded-xl border border-orange-100 text-orange-800 italic">
                     "{selectedJournal.feedback}"
                  </div>
                </Descriptions.Item>
              )}
            </Descriptions>

            {selectedJournal.data && Object.keys(selectedJournal.data).length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                   <div className="h-6 w-1 bg-green-500 rounded-full"></div>
                   <Text strong className="text-base text-gray-800">Dữ liệu nhật ký chi tiết</Text>
                </div>
                <Card className="bg-gray-50 border-gray-100 rounded-2xl overflow-hidden shadow-inner">
                  <pre className="text-xs text-gray-600 overflow-auto max-h-96 leading-relaxed">
                    {JSON.stringify(selectedJournal.data, null, 2)}
                  </pre>
                </Card>
              </div>
            )}

            <Space className="w-full justify-end">
              <Button onClick={() => setIsDetailModalVisible(false)}>
                Đóng
              </Button>
              <Button 
                type="primary" 
                icon={<QrcodeOutlined />}
                onClick={() => {
                  setIsDetailModalVisible(false);
                  handleViewQR(selectedJournal);
                }}
                className="bg-green-600"
              >
                Xem QR Code
              </Button>
            </Space>
          </div>
        )}
      </Modal>

      {/* QR Code Modal */}
      <Modal
        title={<Text strong className="text-lg">QR Code Truy xuất nguồn gốc</Text>}
        open={isQRModalVisible}
        onCancel={() => setIsQRModalVisible(false)}
        footer={null}
        width={500}
      >
        {selectedJournal && (
          <div className="space-y-6 text-center">
            <div className="p-6 bg-gray-50 rounded-2xl">
              <Image
                src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${import.meta.env.VITE_APP_URL || window.location.origin}/trace/${selectedJournal.qrCode}`}
                alt="QR Code"
                preview={false}
                className="rounded-xl"
              />
            </div>
            
            <div className="space-y-2">
              <Text strong className="block text-base">{selectedJournal.schemaId?.name}</Text>
              <Text className="block text-sm text-gray-500">Mã: {selectedJournal.qrCode}</Text>
              <Text className="block text-xs text-gray-400">
                URL: {import.meta.env.VITE_APP_URL || window.location.origin}/trace/{selectedJournal.qrCode}
              </Text>
            </div>

            <Space className="w-full justify-center">
              <Button onClick={() => setIsQRModalVisible(false)}>
                Đóng
              </Button>
              <Button 
                type="primary" 
                icon={<DownloadOutlined />}
                onClick={handleDownloadQR}
                className="bg-green-600"
              >
                Tải xuống QR Code
              </Button>
            </Space>
          </div>
        )}
      </Modal>
      {/* Reject Modal */}
      <Modal
        title={<div className="flex items-center gap-2"><CloseCircleOutlined className="text-orange-500" /><Text strong className="text-lg">Từ chối & Yêu cầu chỉnh sửa</Text></div>}
        open={isRejectModalVisible}
        onCancel={() => setIsRejectModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsRejectModalVisible(false)}>Hủy</Button>,
          <Button 
            key="submit" 
            type="primary" 
            danger 
            loading={rejectJournalMutation.isLoading}
            onClick={submitReject}
            className="bg-orange-500 hover:bg-orange-600 border-0"
          >
            Gửi yêu cầu sửa
          </Button>
        ]}
      >
        <div className="space-y-4 py-4">
          <Text className="block">
            Vui lòng nhập lý do từ chối hoặc hướng dẫn để nông dân <Text strong>{selectedJournal?.userId?.fullname || selectedJournal?.userId?.username}</Text> biết cách chỉnh sửa nhật ký này:
          </Text>
          <Input.TextArea
            rows={4}
            placeholder="Ví dụ: Hình ảnh thu hoạch không rõ nét, thiếu thông tin về loại phân bón đã sử dụng ngày 15/05..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="rounded-xl border-orange-200 hover:border-orange-400 focus:border-orange-500"
          />
        </div>
      </Modal>

    </div>
  );
};

export default AdminJournalMgmt;
