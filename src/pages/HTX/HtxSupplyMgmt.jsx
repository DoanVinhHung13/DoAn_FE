import React, { useState, useEffect } from 'react';
import { Table, Card, Typography, Row, Col, Button, Tag, Space, Modal, Input, message, Badge, Tooltip, Avatar, Statistic, Empty, Select, Divider } from 'antd';
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  ClockCircleOutlined, 
  FileTextOutlined, 
  SearchOutlined, 
  UserOutlined, 
  InboxOutlined, 
  SafetyCertificateOutlined,
  ReloadOutlined,
  CheckOutlined,
  HistoryOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import HtxSupplyService from 'src/services/HtxSupplyService';
import dayjs from 'dayjs';
import { getAvatarUrl, getInitialAvatar } from '../../utils/helpers';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const HtxSupplyMgmt = () => {
  const [requests, setRequests] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isApprovalVisible, setIsApprovalVisible] = useState(false);
  const [approvalLoading, setApprovalLoading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [itemMappings, setItemMappings] = useState({}); // { originalIndex: inventoryItemId }

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reqRes, invRes] = await Promise.all([
        HtxSupplyService.getSupplyRequests(),
        HtxSupplyService.getInventory()
      ]);
      if (reqRes.data.success) setRequests(reqRes.data.data);
      if (invRes.data.success) setInventory(invRes.data.data);
    } catch (error) {
      message.error('Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (status) => {
    if (!selectedRequest) return;

    // Check if all items are mapped for approval (Skip if it's an external purchase)
    if (status === 'Approved' && !selectedRequest.isExternalPurchase) {
      const allMapped = selectedRequest.items.every((_, idx) => itemMappings[idx]);
      if (!allMapped) {
        return message.warning('Vui lòng chọn vật tư tương ứng trong kho HTX cho tất cả các mục yêu cầu.');
      }
    }

    try {
      setApprovalLoading(true);
      const approvedItems = status === 'Approved' ? selectedRequest.items.map((item, idx) => ({
        originalItemIndex: idx,
        inventoryItemId: itemMappings[idx],
        quantity: item.quantity
      })) : [];

      const res = await HtxSupplyService.updateSupplyRequestStatus(selectedRequest._id, {
        status,
        htxFeedback: feedback,
        approvedItems
      });

      if (res.data.success) {
        message.success(`Đã ${status === 'Approved' ? 'phê duyệt' : 'từ chối'} yêu cầu thành công.`);
        setIsApprovalVisible(false);
        setIsPreviewVisible(false);
        fetchData();
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Lỗi khi cập nhật trạng thái');
    } finally {
      setApprovalLoading(false);
    }
  };

  const filteredRequests = requests.filter(r => {
    const searchVal = searchText.toLowerCase();
    const nameMatch = (r.farmer?.fullname || r.farmer?.username || '').toLowerCase().includes(searchVal);
    const statusMatch = statusFilter ? r.status === statusFilter : true;
    return nameMatch && statusMatch;
  });

  const getStatusTag = (status) => {
    switch (status) {
      case 'Pending': return <Tag icon={<ClockCircleOutlined />} color="warning" className="rounded-full px-3">Chờ duyệt</Tag>;
      case 'Approved': return <Tag icon={<CheckCircleOutlined />} color="success" className="rounded-full px-3">Đã duyệt</Tag>;
      case 'Rejected': return <Tag icon={<CloseCircleOutlined />} color="error" className="rounded-full px-3">Từ chối</Tag>;
      default: return <Tag>{status}</Tag>;
    }
  };

  const columns = [
    {
      title: 'THỜI GIAN',
      dataIndex: 'createdAt',
      key: 'date',
      width: 150,
      render: (date) => (
        <div className="flex flex-col">
          <Text strong className="text-[13px]">{dayjs(date).format('HH:mm - DD/MM/YY')}</Text>
          <Text className="text-[11px] text-gray-400">{dayjs(date).fromNow()}</Text>
        </div>
      )
    },
    {
      title: 'NÔNG DÂN',
      key: 'farmer',
      width: 200,
      render: (record) => (
        <div className="flex items-center gap-3">
          <Avatar size={40} src={getAvatarUrl(record.farmer?.avatar)} className="border-2 border-white shadow-sm shrink-0">
            {!record.farmer?.avatar && getInitialAvatar(record.farmer?.fullname || record.farmer?.username)}
          </Avatar>
          <div className="flex flex-col min-w-0">
            <Text strong className="text-sm truncate">{record.farmer?.fullname || record.farmer?.username}</Text>
            <Text className="text-xs text-gray-400 truncate">{record.farmer?.phone}</Text>
          </div>
        </div>
      )
    },
    {
      title: 'VẬT TƯ YÊU CẦU',
      key: 'items',
      render: (record) => (
        <Space direction="vertical" size={2}>
          {record.items.map((item, idx) => (
            <div key={idx} className="bg-gray-50 px-2 py-1 rounded border border-gray-100 flex items-center gap-2">
              <Badge status="processing" color="green" />
              <Text className="text-xs font-medium">{item.itemName}</Text>
              <Tag color="blue" className="m-0 text-[10px] h-5 leading-4">x{item.quantity} {item.unit}</Tag>
            </div>
          ))}
        </Space>
      )
    },
    {
      title: 'TRẠNG THÁI',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      align: 'center',
      render: (status) => getStatusTag(status)
    },
    {
      title: 'THAO TÁC',
      key: 'actions',
      width: 120,
      align: 'center',
      render: (record) => (
        <Space>
          <Tooltip title="Chi tiết">
            <Button 
              shape="circle" 
              icon={<FileTextOutlined />} 
              onClick={() => {
                setSelectedRequest(record);
                setFeedback(record.htxFeedback || '');
                setItemMappings({});
                setIsPreviewVisible(true);
              }}
              className="border-gray-200 text-gray-600 hover:text-green-600 hover:border-green-400"
            />
          </Tooltip>
          {record.status === 'Pending' && (
            <Tooltip title="Duyệt nhanh">
              <Button 
                type="primary" 
                shape="circle" 
                icon={<CheckOutlined />} 
                onClick={() => {
                  setSelectedRequest(record);
                  setFeedback('');
                  setItemMappings({});
                  setIsApprovalVisible(true);
                }}
                className="bg-green-600 border-0 shadow-lg shadow-green-100"
              />
            </Tooltip>
          )}
        </Space>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <InboxOutlined />
            <span>Quản lý cung ứng</span>
            <span className="text-gray-200">/</span>
            <span className="text-green-600">Yêu cầu cấp vật tư</span>
          </div>
          <Title level={4} className="!mb-0">Phê Duyệt Đơn Xin Vật Tư</Title>
        </div>
        <Button 
          icon={<ReloadOutlined />} 
          onClick={fetchData} 
          className="rounded-xl border-gray-200 shadow-sm"
        >
          Làm mới
        </Button>
      </div>

      {/* Stats Section */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card className="rounded-2xl border-0 shadow-sm bg-gradient-to-br from-blue-600 to-indigo-700">
            <Statistic 
              title={<Text className="text-white/80 uppercase text-xs font-bold">Tổng đơn yêu cầu</Text>}
              value={requests.length} 
              prefix={<FileTextOutlined />} 
              valueStyle={{ color: '#fff', fontSize: '28px', fontWeight: 'bold' }} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="rounded-2xl border-0 shadow-sm bg-gradient-to-br from-amber-500 to-orange-600">
            <Statistic 
              title={<Text className="text-white/80 uppercase text-xs font-bold">Đang chờ duyệt</Text>}
              value={requests.filter(r => r.status === 'Pending').length} 
              prefix={<ClockCircleOutlined />} 
              valueStyle={{ color: '#fff', fontSize: '28px', fontWeight: 'bold' }} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="rounded-2xl border-0 shadow-sm bg-gradient-to-br from-green-600 to-emerald-700">
            <Statistic 
              title={<Text className="text-white/80 uppercase text-xs font-bold">Đã cấp phát (Tháng này)</Text>}
              value={requests.filter(r => r.status === 'Approved' && dayjs(r.approvedAt).isAfter(dayjs().startOf('month'))).length} 
              prefix={<SafetyCertificateOutlined />} 
              valueStyle={{ color: '#fff', fontSize: '28px', fontWeight: 'bold' }} 
            />
          </Card>
        </Col>
      </Row>

      {/* Filter Section */}
      <Card className="rounded-2xl border-gray-100 shadow-sm overflow-hidden" bodyStyle={{ padding: '12px 24px' }}>
        <Space size="large" wrap>
          <Input 
            placeholder="Tìm theo tên nông dân..." 
            prefix={<SearchOutlined className="text-gray-400" />} 
            className="w-72 h-10 rounded-xl border-gray-200"
            allowClear
            onChange={e => setSearchText(e.target.value)}
          />
          <Select 
            placeholder="Tất cả trạng thái" 
            allowClear 
            className="w-48 h-10 premium-select"
            onChange={setStatusFilter}
            options={[
              { value: 'Pending', label: 'Chờ duyệt' },
              { value: 'Approved', label: 'Đã duyệt' },
              { value: 'Rejected', label: 'Từ chối' }
            ]}
          />
        </Space>
      </Card>

      {/* Main Table */}
      <Card className="rounded-[24px] border-gray-100 shadow-sm overflow-hidden" bodyStyle={{ padding: 0 }}>
        <Table 
          columns={columns} 
          dataSource={filteredRequests} 
          rowKey="_id"
          loading={loading}
          className="premium-table"
          pagination={{ 
            pageSize: 10,
            showTotal: (total) => `Tổng cộng ${total} đơn`,
            className: "px-6 py-4"
          }}
        />
      </Card>

      {/* Approval Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <Badge status="processing" color="green" />
            <span className="text-lg font-black text-gray-800 uppercase tracking-tight">Xử lý yêu cầu cấp vật tư</span>
          </div>
        }
        open={isApprovalVisible}
        onCancel={() => setIsApprovalVisible(false)}
        footer={null}
        width={700}
        centered
        className="premium-modal"
      >
        {selectedRequest && (
          <div className="space-y-6 py-4">
            {/* Farmer Info Summary */}
            <div className="flex items-center gap-4 bg-green-50/50 p-4 rounded-3xl border border-green-100">
              <Avatar size={64} src={getAvatarUrl(selectedRequest.farmer?.avatar)} className="border-4 border-white shadow-md">
                {!selectedRequest.farmer?.avatar && getInitialAvatar(selectedRequest.farmer?.fullname || selectedRequest.farmer?.username)}
              </Avatar>
              <div>
                <Title level={5} className="!mb-0 text-green-800">{selectedRequest.farmer?.fullname || selectedRequest.farmer?.username}</Title>
                <Text className="text-green-600/70 text-xs font-bold uppercase tracking-widest">{selectedRequest.farmer?.phone}</Text>
                <div className="mt-1">
                  <Text className="text-gray-500 text-xs italic">Lý do: {selectedRequest.reason || 'Không có'}</Text>
                </div>
              </div>
            </div>

            {/* Item Mapping Section */}
            <div>
              <Title level={5} className="!mb-4 flex items-center gap-2">
                <InboxOutlined className="text-green-600" /> Danh sách vật tư cần xử lý
              </Title>
              <div className="space-y-3">
                {selectedRequest.items.map((item, idx) => (
                  <Card key={idx} className="rounded-2xl border-gray-100 shadow-sm bg-slate-50/30" bodyStyle={{ padding: '12px 16px' }}>
                    <Row gutter={12} align="middle">
                      <Col span={10}>
                        <Text strong className="text-[13px] block truncate">{item.itemName}</Text>
                        <Text type="secondary" className="text-[11px] block truncate">Yêu cầu: <span className="text-green-600 font-bold">{item.quantity} {item.unit}</span></Text>
                      </Col>
                      <Col span={14}>
                        {!selectedRequest.isExternalPurchase ? (
                          <Select
                            placeholder="Chọn vật tư trong kho HTX"
                            className="w-full rounded-xl"
                            onChange={(val) => setItemMappings(prev => ({ ...prev, [idx]: val }))}
                          >
                            {inventory
                              .filter(inv => inv.category === item.category)
                              .map(inv => (
                                <Select.Option key={inv._id} value={inv._id}>
                                  {inv.name} (Còn: {inv.quantity} {inv.unit})
                                </Select.Option>
                              ))
                            }
                          </Select>
                        ) : (
                          <Tag color="orange" className="w-full m-0 text-center py-1 rounded-lg border-0 bg-orange-50 text-orange-600 font-medium text-xs">
                            Không trừ kho (Mua ngoài)
                          </Tag>
                        )}
                      </Col>
                    </Row>
                  </Card>
                ))}
              </div>
            </div>

            {selectedRequest.isExternalPurchase && selectedRequest.evidenceImage && (
              <div className="mb-4">
                <Text strong className="block mb-2 text-gray-600">Ảnh Bằng Chứng (Hóa đơn/Tem nhãn)</Text>
                <div className="flex justify-center bg-gray-50 p-2 rounded-xl border border-gray-200 border-dashed">
                  <img 
                    src={selectedRequest.evidenceImage.startsWith('http') ? selectedRequest.evidenceImage : `${(import.meta.env.VITE_API_URL || 'https://ebookfarm.onrender.com/api').replace(/\/api$/, '')}${selectedRequest.evidenceImage}`} 
                    alt="Bằng chứng" 
                    className="max-h-48 object-contain rounded-lg shadow-sm cursor-pointer hover:opacity-90 transition-opacity" 
                    onClick={() => window.open(selectedRequest.evidenceImage.startsWith('http') ? selectedRequest.evidenceImage : `${(import.meta.env.VITE_API_URL || 'https://ebookfarm.onrender.com/api').replace(/\/api$/, '')}${selectedRequest.evidenceImage}`, '_blank')}
                  />
                </div>
              </div>
            )}

            <Divider className="my-2" />

            {/* Feedback Section */}
            <div>
              <Text strong className="block mb-2 text-gray-600">Phản hồi của HTX (Nếu có)</Text>
              <TextArea 
                rows={3} 
                placeholder="Nhập hướng dẫn hoặc lý do từ chối..." 
                className="rounded-2xl border-gray-100 bg-gray-50 focus:bg-white transition-all"
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button 
                danger 
                block 
                size="large" 
                icon={<CloseCircleOutlined />}
                className="h-14 rounded-2xl font-bold border-2"
                onClick={() => handleStatusUpdate('Rejected')}
                loading={approvalLoading}
              >
                Từ chối đơn
              </Button>
              <Button 
                type="primary" 
                block 
                size="large" 
                icon={<CheckCircleOutlined />}
                className="h-14 rounded-2xl font-bold bg-green-600 border-0 shadow-lg shadow-green-100"
                onClick={() => handleStatusUpdate('Approved')}
                loading={approvalLoading}
              >
                Phê duyệt & Cấp phát
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Detail/Preview Modal */}
      <Modal
        title="Chi tiết đơn xin cấp vật tư"
        open={isPreviewVisible}
        onCancel={() => setIsPreviewVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsPreviewVisible(false)} className="rounded-xl">Đóng</Button>,
          selectedRequest?.status === 'Pending' && (
            <Button key="approve" type="primary" className="rounded-xl bg-green-600 border-0" onClick={() => { setIsPreviewVisible(false); setIsApprovalVisible(true); }}>
              Xử lý ngay
            </Button>
          )
        ]}
        width={500}
        centered
      >
        {selectedRequest && (
          <div className="space-y-4 py-4">
            <div className="flex justify-between items-center mb-6">
              {getStatusTag(selectedRequest.status)}
              <Text className="text-gray-400 text-xs">{dayjs(selectedRequest.createdAt).format('DD/MM/YYYY HH:mm')}</Text>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <Text strong className="block text-gray-400 text-[10px] uppercase tracking-widest mb-2">Thông tin vật tư</Text>
              {selectedRequest.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-200/50 last:border-0">
                  <Text className="font-medium">{item.itemName}</Text>
                  <Text strong className="text-green-600">{item.quantity} {item.unit}</Text>
                </div>
              ))}
            </div>

            {selectedRequest.reason && (
              <div>
                <Text strong className="block text-gray-400 text-[10px] uppercase tracking-widest mb-1">Lý do xin cấp</Text>
                <Paragraph className="text-gray-600 bg-slate-50 p-3 rounded-xl border border-gray-100">{selectedRequest.reason}</Paragraph>
              </div>
            )}

            {selectedRequest.htxFeedback && (
              <div>
                <Text strong className="block text-gray-400 text-[10px] uppercase tracking-widest mb-1">Phản hồi từ HTX</Text>
                <Paragraph className="text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-100">{selectedRequest.htxFeedback}</Paragraph>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default HtxSupplyMgmt;
