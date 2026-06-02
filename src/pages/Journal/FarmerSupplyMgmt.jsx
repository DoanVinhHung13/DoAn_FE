import React, { useState, useEffect, useRef } from 'react';
import { Table, Card, Typography, Row, Col, Button, Tag, Space, Modal, Form, Input, InputNumber, Select, message, Empty, Badge, Steps, Divider, Upload } from 'antd';
import { 
  PlusOutlined, 
  SendOutlined, 
  HistoryOutlined, 
  ClockCircleOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  ShoppingOutlined,
  InfoCircleOutlined,
  DeleteOutlined,
  PlusSquareOutlined,
  ShoppingCartOutlined,
  PictureOutlined,
  CloudUploadOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import { useAppDispatch } from 'src/redux/hooks';
import { setUserInfo } from 'src/redux/slices/appGlobalSlice';
import FarmerSupplyService from 'src/services/FarmerSupplyService';
import UploadService from 'src/services/UploadService';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const FarmerSupplyMgmt = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isExternalModalVisible, setIsExternalModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [externalSubmitting, setExternalSubmitting] = useState(false);
  const [evidenceFileList, setEvidenceFileList] = useState([]);
  const [previewUrl, setPreviewUrl] = useState(null);
  const evidenceUrlRef = useRef(null);
  const [form] = Form.useForm();
  const [externalForm] = Form.useForm();
  const [htxList, setHtxList] = useState([]);
  const user = useSelector((state) => state.appGlobal);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const init = async () => {
      await fetchLatestProfile();
      fetchRequests();
    };
    init();
  }, []);

  const fetchLatestProfile = async () => {
    try {
      const res = await FarmerSupplyService.getProfile();
      if (res.data.success) {
        dispatch(setUserInfo(res.data.data));
        // Sau khi có profile mới nhất, mới đi lấy danh sách HTX
        fetchHtxList(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch profile');
    }
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await FarmerSupplyService.getSupplyRequests();
      if (res.data.success) setRequests(res.data.data);
    } catch (error) {
      message.error('Lỗi khi tải lịch sử yêu cầu');
    } finally {
      setLoading(false);
    }
  };

  const fetchHtxList = async (currentUser) => {
    try {
      const targetUser = currentUser || user;
      const htxId = targetUser?.htxId;

      if (!htxId) {
        console.log('No HTX assigned to this user');
        setHtxList([]);
        return;
      }

      const res = await FarmerSupplyService.getHtxList();
      if (res.data.success) {
        console.log('Farmer HTX ID:', htxId);
        console.log('Available HTXs:', res.data.data.map(h => h._id));

        // Lọc HTX theo ID (ép kiểu string để so khớp chính xác)
        const myHtx = res.data.data.filter(htx => {
          const htxIdStr = (typeof htxId === 'object' ? htxId._id : htxId).toString();
          return htx._id.toString() === htxIdStr;
        });
        
        console.log('Matched HTX:', myHtx);
        setHtxList(myHtx);
        
        if (myHtx.length > 0) {
          form.setFieldsValue({ htxId: myHtx[0]._id });
        }
      }
    } catch (error) {
      console.error('Failed to fetch HTX list', error);
    }
  };

  const onFinish = async (values) => {
    try {
      setSubmitting(true);
      const res = await FarmerSupplyService.createSupplyRequest({
        htxId: values.htxId,
        reason: values.reason,
        items: values.items
      });

      if (res.data.success) {
        message.success('Đơn yêu cầu đã được gửi tới HTX!');
        setIsModalVisible(false);
        form.resetFields();
        fetchRequests();
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Lỗi khi gửi yêu cầu');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUploadEvidence = async (file) => {
    // Show local preview immediately
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await UploadService.uploadImage(formData);
      evidenceUrlRef.current = res.data?.url || null;
      if (res.data?.url) setPreviewUrl(res.data.url);
      return false;
    } catch {
      message.error('Upload ảnh bằng chứng thất bại');
      setPreviewUrl(null);
      return false;
    }
  };

  const handleExternalSubmit = async (values) => {
    try {
      if (!evidenceUrlRef.current) {
        message.warning('Vui lòng tải lên ảnh hóa đơn hoặc bằng chứng mua hàng!');
        return;
      }
      setExternalSubmitting(true);
      const htxId = typeof user?.htxId === 'object' ? user?.htxId?._id : user?.htxId;
      if (!htxId) {
        message.error('Bạn chưa được gán vào HTX nào. Không thể gửi đơn khai báo.');
        return;
      }
      const unitValue = Array.isArray(values.unit) ? values.unit[0] : values.unit;
      await FarmerSupplyService.createSupplyRequest({
        htxId,
        reason: 'Khai báo vật tư mua ngoài (Tự túc)',
        isExternalPurchase: true,
        evidenceImage: evidenceUrlRef.current,
        items: [{ itemName: values.name, category: values.category, quantity: values.quantity, unit: unitValue }]
      });
      message.success('Đã gửi khai báo mua ngoài! Vui lòng chờ HTX phê duyệt.');
      setIsExternalModalVisible(false);
      externalForm.resetFields();
      setEvidenceFileList([]);
      setPreviewUrl(null);
      evidenceUrlRef.current = null;
      fetchRequests();
    } catch (error) {
      message.error(error.response?.data?.message || 'Lỗi khi gửi khai báo');
    } finally {
      setExternalSubmitting(false);
    }
  };

  const handleCancelRequest = (id) => {
    Modal.confirm({
      title: 'Xác nhận hủy yêu cầu',
      content: 'Bạn có chắc chắn muốn hủy yêu cầu vật tư này không? Thao tác này không thể hoàn tác.',
      okText: 'Hủy yêu cầu',
      okType: 'danger',
      cancelText: 'Quay lại',
      centered: true,
      onOk: async () => {
        try {
          await FarmerSupplyService.deleteSupplyRequest(id);
          message.success('Đã hủy yêu cầu vật tư thành công!');
          fetchRequests();
        } catch (error) {
          message.error(error.response?.data?.message || 'Không thể hủy yêu cầu.');
        }
      }
    });
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'Pending': return { color: 'orange', text: 'Chờ duyệt', icon: <ClockCircleOutlined /> };
      case 'Approved': return { color: 'green', text: 'Đã duyệt', icon: <CheckCircleOutlined /> };
      case 'Rejected': return { color: 'red', text: 'Từ chối', icon: <CloseCircleOutlined /> };
      default: return { color: 'default', text: status, icon: null };
    }
  };

  const [statusFilter, setStatusFilter] = useState(null);

  const filteredRequests = statusFilter 
    ? requests.filter(r => r.status === statusFilter)
    : requests;

  const columns = [
    {
      title: 'STT',
      key: 'stt',
      width: 60,
      align: 'center',
      render: (text, record, index) => <Text className="text-xs text-gray-400">{index + 1}</Text>
    },
    {
      title: 'NGÀY GỬI',
      dataIndex: 'createdAt',
      key: 'date',
      width: 150,
      render: (date) => <Text className="text-xs font-medium text-gray-500">{dayjs(date).format('DD/MM/YY HH:mm')}</Text>
    },
    {
      title: 'VẬT TƯ YÊU CẦU',
      key: 'items',
      render: (_, record) => (
        <div className="flex flex-col gap-1.5">
          {record.isExternalPurchase && (
            <Tag color="orange" className="w-fit rounded-full border-0 bg-orange-50 text-orange-600 font-bold text-[10px] px-2">
              🛒 Tự mua ngoài
            </Tag>
          )}
          <div className="flex flex-wrap gap-1.5">
            {record.items.map((item, idx) => (
              <Tag key={idx} color={record.isExternalPurchase ? 'orange' : 'blue'} className="rounded-md font-medium text-[11px]">
                {item.itemName} (x{item.quantity} {item.unit})
              </Tag>
            ))}
          </div>
        </div>
      )
    },
    {
      title: 'HTX TIẾP NHẬN',
      dataIndex: ['htx', 'fullname'],
      key: 'htx',
      render: (text, record) => <Text strong className="text-[12px] text-gray-600">{text || record.htx?.username}</Text>
    },
    {
      title: 'TRẠNG THÁI',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      width: 140,
      render: (status) => {
        const info = getStatusInfo(status);
        return <Tag color={info.color} icon={info.icon} className="rounded-full px-3 font-bold uppercase text-[10px]">{info.text}</Tag>;
      }
    },
    {
      title: 'PHẢN HỒI HTX',
      dataIndex: 'htxFeedback',
      key: 'feedback',
      render: (text) => text ? <Text className="text-[12px] text-amber-600 italic">{text}</Text> : <Text className="text-xs text-gray-300">---</Text>
    },
    {
      title: 'THAO TÁC',
      key: 'action',
      width: 110,
      align: 'center',
      render: (_, record) => {
        if (record.status === 'Pending') {
          return (
            <Button 
              type="link" 
              danger 
              size="small" 
              className="font-bold hover:underline"
              onClick={() => handleCancelRequest(record._id)}
            >
              Hủy đơn
            </Button>
          );
        }
        return <Text className="text-gray-300">-</Text>;
      }
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Title level={3} className="!mb-1">Xin Cấp Vật Tư</Title>
          <Paragraph className="text-gray-400">Gửi yêu cầu hỗ trợ vật tư nông nghiệp tới Hợp tác xã</Paragraph>
        </div>
        <Space size={12}>
          <Button 
            size="large"
            icon={<ShoppingCartOutlined />}
            onClick={() => setIsExternalModalVisible(true)}
            className="h-12 px-6 border-2 border-orange-300 text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-2xl font-bold flex items-center gap-2"
          >
            Khai báo mua ngoài
          </Button>
          <Button 
            type="primary" 
            size="large" 
            icon={<PlusSquareOutlined />} 
            onClick={() => setIsModalVisible(true)}
            className="h-12 px-8 bg-green-600 border-0 rounded-2xl font-bold shadow-lg shadow-green-100 flex items-center gap-2"
          >
            Tạo đơn yêu cầu
          </Button>
        </Space>
      </div>

      <Row gutter={[24, 24]}>
        {/* Left Side: Summary & Guide */}
        <Col xs={24} lg={8}>
          <div className="space-y-6">
            <Card className="rounded-[32px] border-0 shadow-sm bg-gradient-to-br from-green-600 to-emerald-700 text-white overflow-hidden relative">
              <div className="absolute -right-4 -bottom-4 opacity-10">
                <ShoppingOutlined style={{ fontSize: '120px' }} />
              </div>
              <div className="relative z-10">
                <Title level={4} className="!text-white !mb-2">Hỗ trợ sản xuất</Title>
                <Paragraph className="text-white/80 text-xs leading-relaxed mb-6">
                  Nông dân có thể gửi đơn xin cấp các loại vật tư như phân bón, thuốc BVTV, hạt giống... HTX sẽ xem xét và phê duyệt dựa trên định mức sản xuất.
                </Paragraph>
                <div className="flex gap-4">
                  <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md">
                    <div className="text-2xl font-black">{requests.filter(r => r.status === 'Approved').length}</div>
                    <div className="text-[10px] uppercase font-bold opacity-60">Đã nhận</div>
                  </div>
                  <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md">
                    <div className="text-2xl font-black">{requests.filter(r => r.status === 'Pending').length}</div>
                    <div className="text-[10px] uppercase font-bold opacity-60">Chờ duyệt</div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="rounded-[32px] border-gray-100 shadow-sm">
              <Title level={5} className="!mb-4 flex items-center gap-2">
                <InfoCircleOutlined className="text-blue-500" /> Quy trình xử lý
              </Title>
              <Steps
                direction="vertical"
                size="small"
                current={-1}
                items={[
                  { title: 'Gửi yêu cầu', description: 'Chọn vật tư & số lượng cần thiết.' },
                  { title: 'HTX Tiếp nhận', description: 'Cán bộ HTX kiểm tra đơn và tồn kho.' },
                  { title: 'Phê duyệt', description: 'HTX duyệt đơn & thực hiện cấp phát.' },
                  { title: 'Nhận vật tư', description: 'Vật tư tự động cộng vào kho của bạn.' },
                ]}
              />
            </Card>
          </div>
        </Col>

        {/* Right Side: History Table */}
        <Col xs={24} lg={16}>
          <Card 
            title={
              <div className="flex justify-between items-center w-full">
                <Space><HistoryOutlined className="text-green-600" /><Text strong>Lịch sử yêu cầu</Text></Space>
                <Select 
                  placeholder="Lọc trạng thái" 
                  allowClear 
                  className="w-40 premium-select" 
                  onChange={setStatusFilter}
                  options={[
                    { value: 'Pending', label: 'Chờ duyệt' },
                    { value: 'Approved', label: 'Đã duyệt' },
                    { value: 'Rejected', label: 'Từ chối' }
                  ]}
                />
              </div>
            } 
            className="rounded-[32px] border-gray-100 shadow-sm overflow-hidden"
            bodyStyle={{ padding: 0 }}
          >
            <Table 
              columns={columns} 
              dataSource={filteredRequests} 
              rowKey="_id"
              loading={loading}
              className="premium-table"
              locale={{ emptyText: <Empty description="Bạn chưa có yêu cầu nào" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
              pagination={{ 
                pageSize: 7, 
                showTotal: (total) => `Tổng cộng ${total} đơn`,
                className: "px-6 py-4" 
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* New Request Modal */}
      <Modal
        title={<Title level={4} className="!mb-0 flex items-center gap-2"><SendOutlined className="text-green-600" /> Gửi đơn xin cấp vật tư</Title>}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={650}
        centered
        className="premium-modal"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ items: [{}] }}
          requiredMark={false}
          className="pt-4"
        >
          <Form.Item
            name="htxId"
            label={<Text className="text-xs font-black uppercase tracking-wider text-gray-400 ml-1">Hợp tác xã tiếp nhận</Text>}
            rules={[{ required: true, message: 'Vui lòng chọn HTX!' }]}
          >
            <Select placeholder="Chọn HTX của bạn" className="h-12 premium-select">
              {htxList.map(htx => (
                <Option key={htx._id} value={htx._id}>{htx.fullname || htx.username}</Option>
              ))}
            </Select>
          </Form.Item>

          <Divider className="my-4" />

          <Text className="text-xs font-black uppercase tracking-wider text-gray-400 ml-1 block mb-3">Danh sách vật tư cần xin</Text>
          
          <Form.List name="items">
            {(fields, { add, remove }) => (
              <div className="space-y-4">
                {fields.map(({ key, name, ...restField }) => (
                  <Card key={key} className="bg-gray-50/50 rounded-2xl border-gray-100 shadow-sm" bodyStyle={{ padding: '16px' }}>
                    <Row gutter={16} align="middle">
                      <Col span={10}>
                        <Form.Item
                          {...restField}
                          name={[name, 'itemName']}
                          rules={[{ required: true, message: 'Nhập tên vật tư!' }]}
                          className="!mb-0"
                        >
                          <Input placeholder="Tên vật tư (VD: Đạm Ure)" className="h-11 rounded-xl" />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          {...restField}
                          name={[name, 'category']}
                          rules={[{ required: true, message: 'Chọn loại!' }]}
                          className="!mb-0"
                        >
                          <Select placeholder="Loại vật tư" className="h-11 premium-select">
                            <Option value="Phân bón">Phân bón</Option>
                            <Option value="Thuốc BVTV">Thuốc BVTV</Option>
                            <Option value="Giống">Giống cây trồng</Option>
                            <Option value="Dụng cụ">Dụng cụ lao động</Option>
                            <Option value="Khác">Khác</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={4}>
                        <Form.Item
                          {...restField}
                          name={[name, 'quantity']}
                          rules={[{ required: true, message: 'Số lượng!' }]}
                          className="!mb-0"
                        >
                          <InputNumber placeholder="SL" min={1} className="w-full h-11 rounded-xl flex items-center" />
                        </Form.Item>
                      </Col>
                      <Col span={2}>
                        <Button type="text" danger icon={<DeleteOutlined />} onClick={() => remove(name)} />
                      </Col>
                      <Col span={6} className="mt-2">
                         <Form.Item
                          {...restField}
                          name={[name, 'unit']}
                          rules={[{ required: true, message: 'Đơn vị!' }]}
                          className="!mb-0"
                        >
                          <Input placeholder="Đơn vị (kg, lít...)" className="h-9 rounded-lg text-xs" />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>
                ))}
                <Button 
                  type="dashed" 
                  onClick={() => add()} 
                  block 
                  icon={<PlusOutlined />} 
                  className="h-12 rounded-2xl border-2 border-dashed border-green-200 text-green-600 hover:text-green-700 hover:border-green-400"
                >
                  Thêm vật tư khác
                </Button>
              </div>
            )}
          </Form.List>

          <Divider className="my-6" />

          <Form.Item
            name="reason"
            label={<Text className="text-xs font-black uppercase tracking-wider text-gray-400 ml-1">Lý do xin cấp (Nếu có)</Text>}
          >
            <TextArea rows={3} placeholder="Mô tả mục đích sử dụng..." className="rounded-2xl border-gray-100 bg-gray-50 focus:bg-white" />
          </Form.Item>

          <div className="flex gap-4 pt-4">
            <Button block size="large" className="h-14 rounded-2xl font-bold border-2" onClick={() => setIsModalVisible(false)}>
              Hủy bỏ
            </Button>
            <Button 
              type="primary" 
              block 
              size="large" 
              htmlType="submit"
              loading={submitting}
              className="h-14 rounded-2xl font-black bg-green-600 border-0 shadow-lg shadow-green-100"
            >
              Gửi yêu cầu ngay
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Modal: Khai báo hàng mua ngoài */}
      <Modal
        title={
          <div className="flex items-center gap-3 pt-2">
            <div className="w-10 h-10 rounded-2xl bg-orange-100 flex items-center justify-center">
              <ShoppingCartOutlined className="text-orange-500 text-xl" />
            </div>
            <div>
              <div className="font-black text-gray-800">Khai Báo Hàng Mua Ngoài</div>
              <div className="text-xs text-gray-400 font-normal">Nộp bằng chứng để HTX xem xét và phê duyệt</div>
            </div>
          </div>
        }
        open={isExternalModalVisible}
        onCancel={() => { setIsExternalModalVisible(false); externalForm.resetFields(); setEvidenceFileList([]); setPreviewUrl(null); evidenceUrlRef.current = null; }}
        footer={null}
        width={560}
        centered
        className="premium-modal"
      >
        <Form form={externalForm} layout="vertical" onFinish={handleExternalSubmit} requiredMark={false} className="pt-4">
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="name" label={<Text className="text-xs font-black uppercase tracking-wider text-gray-400">Tên vật tư / Hàng hóa</Text>} rules={[{ required: true, message: 'Nhập tên vật tư!' }]}>
                <Input placeholder="VD: Phân NPK 20-20-15, Thuốc Abamectin..." className="h-11 rounded-xl" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="category" label={<Text className="text-xs font-black uppercase tracking-wider text-gray-400">Phân loại</Text>} rules={[{ required: true, message: 'Chọn loại!' }]}>
                <Select placeholder="Chọn loại" className="h-11 premium-select">
                  <Option value="Phân bón">Phân bón</Option>
                  <Option value="Thuốc BVTV">Thuốc BVTV</Option>
                  <Option value="Thuốc thú y">Thuốc thú y</Option>
                  <Option value="Giống">Giống cây / con</Option>
                  <Option value="Dụng cụ">Dụng cụ lao động</Option>
                  <Option value="Khác">Khác</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="quantity" label={<Text className="text-xs font-black uppercase tracking-wider text-gray-400">Số lượng</Text>} rules={[{ required: true, message: 'Nhập SL!' }]}>
                <InputNumber min={0.1} className="w-full h-11 rounded-xl flex items-center" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="unit" label={<Text className="text-xs font-black uppercase tracking-wider text-gray-400">Đơn vị</Text>} rules={[{ required: true, message: 'Nhập đơn vị!' }]}>
                <Input placeholder="kg, lít, bao..." className="h-11 rounded-xl" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label={
            <span className="text-xs font-black uppercase tracking-wider text-gray-400">
              Bằng chứng mua hàng / Hóa đơn <span className="text-red-500">*</span>
            </span>
          }>
            {previewUrl ? (
              <div className="relative rounded-2xl overflow-hidden border-2 border-orange-300 bg-orange-50/30 group">
                <img 
                  src={previewUrl} 
                  alt="Bằng chứng" 
                  className="w-full max-h-52 object-contain p-2" 
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Button 
                    danger 
                    size="small" 
                    className="rounded-xl font-bold shadow-lg"
                    onClick={() => { setPreviewUrl(null); setEvidenceFileList([]); evidenceUrlRef.current = null; }}
                  >
                    Xóa ảnh
                  </Button>
                </div>
                <div className="px-3 py-2 bg-orange-50 border-t border-orange-100 flex items-center gap-2">
                  <CheckCircleOutlined className="text-green-500 text-sm" />
                  <Text className="text-xs text-green-600 font-bold">Ảnh đã được tải lên thành công</Text>
                </div>
              </div>
            ) : (
              <Upload.Dragger
                name="file" fileList={[]} maxCount={1} accept="image/*" showUploadList={false}
                beforeUpload={async (file) => { await handleUploadEvidence(file); setEvidenceFileList([{ uid: '-1', name: file.name, status: 'done' }]); return false; }}
                className="rounded-2xl border-2 border-dashed border-orange-200 bg-orange-50/30 hover:border-orange-400 transition-all"
              >
                <p className="ant-upload-drag-icon"><CloudUploadOutlined className="text-orange-400 text-4xl" /></p>
                <p className="text-sm font-bold text-gray-600">Chụp ảnh hoặc kéo thả hóa đơn vào đây</p>
                <p className="text-xs text-gray-400 mt-1">Ảnh sản phẩm, tem nhãn hoặc hóa đơn mua hàng (Theo chuẩn VietGAHP)</p>
              </Upload.Dragger>
            )}
          </Form.Item>

          <div className="flex gap-4 pt-2">
            <Button block size="large" className="h-12 rounded-2xl font-bold border-2" onClick={() => { setIsExternalModalVisible(false); externalForm.resetFields(); setEvidenceFileList([]); evidenceUrlRef.current = null; }}>Hủy</Button>
            <Button type="primary" block size="large" htmlType="submit" loading={externalSubmitting} className="h-12 rounded-2xl font-black bg-orange-500 border-0 shadow-lg shadow-orange-100">Gửi khai báo</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default FarmerSupplyMgmt;
