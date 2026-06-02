import React, { useState, useEffect } from 'react';
import {
  Table, Button, Modal, Form, Input, Select, message, Tag, Space,
  Drawer, Descriptions, Card, Typography, Row, Col, Statistic,
  Tooltip, Divider, Empty, DatePicker, Badge, Popconfirm, Timeline
} from 'antd';
import {
  PlusOutlined, EyeOutlined, SearchOutlined,
  FilterOutlined, HomeOutlined, SyncOutlined,
  CloudUploadOutlined, GlobalOutlined, CheckCircleOutlined,
  BarcodeOutlined, BoxPlotOutlined, ExclamationCircleOutlined,
  QrcodeOutlined, HistoryOutlined, EnvironmentOutlined,
  CalendarOutlined, MedicineBoxOutlined
} from '@ant-design/icons';
import HtxBatchService from 'src/services/HtxBatchService';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;

const portalSyncStatusConfig = {
  NotSynced: { label: 'Chưa đồng bộ', color: 'default', icon: <ExclamationCircleOutlined /> },
  Pending: { label: 'Đang xử lý...', color: 'processing', icon: <SyncOutlined spin /> },
  Synced: { label: 'Đã đồng bộ', color: 'success', icon: <CheckCircleOutlined /> },
  Failed: { label: 'Thất bại', color: 'error', icon: <ExclamationCircleOutlined /> },
};

const HtxBatchMgmt = () => {
  const [batches, setBatches] = useState([]);
  const [products, setProducts] = useState([]);
  const [htxJournals, setHtxJournals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncingId, setSyncingId] = useState(null);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [syncLogs, setSyncLogs] = useState([]);

  const [searchText, setSearchText] = useState('');
  const [filterProduct, setFilterProduct] = useState(null);
  const [filterSyncStatus, setFilterSyncStatus] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [form] = Form.useForm();

  useEffect(() => {
    fetchBatches();
    fetchProducts();
    fetchHtxJournals();
  }, []);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const res = await HtxBatchService.getBatches();
      if (res.data.success) setBatches(res.data.data);
    } catch (e) {
      message.error('Lỗi khi tải danh sách lô sản xuất');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await HtxBatchService.getProducts();
      if (res.data.success) setProducts(res.data.data);
    } catch (e) { /* silent */ }
  };

  const fetchHtxJournals = async () => {
    try {
      const res = await HtxBatchService.getHtxJournals();
      if (res.data.success) setHtxJournals(res.data.data);
    } catch (e) { /* silent */ }
  };

  const fetchSyncHistory = async (batchId) => {
    try {
      const res = await HtxBatchService.getBatchSyncHistory(batchId);
      if (res.data.success) setSyncLogs(res.data.data);
    } catch (e) {
      message.error('Lỗi khi tải lịch sử đồng bộ');
    }
  };

  const handleCreateBatch = async (values) => {
    try {
      setLoading(true);
      const payload = {
        ...values,
        productionDate: values.productionDate.toISOString(),
        expiryDate: values.expiryDate.toISOString(),
      };
      const res = await HtxBatchService.createBatch(payload);
      if (res.data.success) {
        message.success('Đã tạo lô sản xuất thành công');
        setIsModalVisible(false);
        form.resetFields();
        fetchBatches();
      }
    } catch (e) {
      message.error(e.response?.data?.message || 'Lỗi khi tạo lô sản xuất');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncPortal = async (batch) => {
    try {
      setSyncingId(batch._id);
      const res = await HtxBatchService.syncBatchPortal(batch._id);
      if (res.data.success) {
        message.success(res.data.message);
        fetchBatches();
      }
    } catch (e) {
      message.error(e.response?.data?.message || 'Lỗi khi đồng bộ lên cổng quốc gia');
    } finally {
      setSyncingId(null);
    }
  };

  const filteredBatches = batches.filter(b => {
    const matchSearch = b.batchCode?.toLowerCase().includes(searchText.toLowerCase()) ||
      b.traceId?.toLowerCase().includes(searchText.toLowerCase());
    const matchProduct = filterProduct ? b.productId?._id === filterProduct : true;
    const matchSync = filterSyncStatus ? b.portalSyncStatus === filterSyncStatus : true;
    return matchSearch && matchProduct && matchSync;
  });

  const columns = [
    {
      title: 'STT', key: 'stt', width: 55, align: 'center',
      render: (_, __, idx) => <span className="text-gray-400 font-mono text-xs">{(currentPage - 1) * pageSize + idx + 1}</span>
    },
    {
      title: 'THÔNG TIN LÔ HÀNG',
      key: 'batch_info',
      render: (_, record) => (
        <div className="flex flex-col">
          <Text strong className="text-gray-800">{record.batchCode}</Text>
          <div className="flex items-center gap-1">
            <BarcodeOutlined className="text-gray-400 text-xs" />
            <Text className="text-gray-400 text-xs font-mono">{record.traceId}</Text>
          </div>
        </div>
      )
    },
    {
      title: 'SẢN PHẨM',
      key: 'product',
      render: (_, record) => (
        <div className="flex flex-col">
          <Text className="text-green-700 font-medium">{record.productId?.name}</Text>
          <Text className="text-gray-400 text-[10px]">GTIN: {record.productId?.gtin}</Text>
        </div>
      )
    },
    {
      title: 'NGÀY SX/HSD',
      key: 'dates',
      render: (_, record) => (
        <div className="flex flex-col text-xs">
          <Text><CalendarOutlined className="mr-1" />{dayjs(record.productionDate).format('DD/MM/YYYY')}</Text>
          <Text type="danger"><HistoryOutlined className="mr-1" />{dayjs(record.expiryDate).format('DD/MM/YYYY')}</Text>
        </div>
      )
    },
    {
      title: 'SỐ LƯỢNG',
      key: 'quantity',
      align: 'center',
      render: (_, record) => <Text strong>{record.quantity} {record.unit}</Text>
    },
    {
      title: 'TRẠNG THÁI CỔNG QG',
      dataIndex: 'portalSyncStatus',
      key: 'sync',
      align: 'center',
      render: (status) => {
        const cfg = portalSyncStatusConfig[status] || portalSyncStatusConfig.NotSynced;
        return <Badge status={cfg.color} text={<Text className="text-xs font-medium">{cfg.label}</Text>} />;
      }
    },
    {
      title: 'THAO TÁC',
      key: 'actions',
      align: 'center',
      width: 180,
      render: (_, record) => (
        <Space>
          <Tooltip title="Chi tiết">
            <Button type="text" icon={<EyeOutlined className="text-green-600" />}
              onClick={async () => {
                try {
                  const res = await HtxBatchService.getBatchById(record._id);
                  setSelectedBatch(res.data.data);
                  setIsDrawerVisible(true);
                } catch (e) {
                  message.error('Lỗi khi tải chi tiết lô hàng');
                }
              }}
              className="bg-green-50 hover:bg-green-100 rounded-xl" />
          </Tooltip>
          <Tooltip title="Xem QR Code">
            <Button type="text" icon={<QrcodeOutlined className="text-blue-600" />}
              onClick={() => {
                Modal.info({
                  title: `QR Code Truy Xuất - Lô ${record.batchCode}`,
                  content: (
                    <div className="flex flex-col items-center py-4">
                      <img src={record.qrCodeImage} alt="Batch QR" className="w-64 h-64 border p-2 rounded-xl mb-4" />
                      <Text copyable={{ text: record.qrCodeUrl }} className="text-gray-400 text-xs">{record.qrCodeUrl}</Text>
                    </div>
                  ),
                  width: 400,
                  centered: true,
                  maskClosable: true
                });
              }}
              className="bg-blue-50 hover:bg-blue-100 rounded-xl" />
          </Tooltip>
          <Tooltip title="Lịch sử đồng bộ">
            <Button type="text" icon={<HistoryOutlined className="text-orange-600" />}
              onClick={() => {
                setSelectedBatch(record);
                fetchSyncHistory(record._id);
                setIsHistoryVisible(true);
              }}
              className="bg-orange-50 hover:bg-orange-100 rounded-xl" />
          </Tooltip>
          {record.portalSyncStatus !== 'Synced' && (
            <Tooltip title="Đồng bộ lên Cổng Quốc Gia">
              <Popconfirm
                title="Đồng bộ lô hàng"
                description="Gửi dữ liệu TXNG lô hàng này lên Cổng Quốc Gia?"
                onConfirm={() => handleSyncPortal(record)}
                okText="Đồng ý" cancelText="Hủy"
                okButtonProps={{ className: 'bg-green-600 border-0' }}
              >
                <Button type="text" icon={<CloudUploadOutlined className="text-purple-600" />}
                  loading={syncingId === record._id}
                  className="bg-purple-50 hover:bg-purple-100 rounded-xl" />
              </Popconfirm>
            </Tooltip>
          )}
        </Space>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-gray-400 text-xs font-semibold uppercase tracking-wider">
            <HomeOutlined />
            <span>HTX</span>
            <span className="text-gray-200">/</span>
            <BoxPlotOutlined />
            <span className="text-green-600">Quản lý Lô Sản Xuất</span>
          </div>
          <Title level={4} className="!mb-0">Quản Lý Lô Sản Xuất & Truy Xuất</Title>
          <Text className="text-gray-400 text-sm">Gán nhật ký sản xuất vào lô và đồng bộ dữ liệu TXNG quốc gia</Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalVisible(true)}
          className="bg-green-600 hover:bg-green-700 rounded-xl h-11 px-6 shadow-lg shadow-green-100 border-0 font-bold"
        >
          Tạo Lô Sản Xuất
        </Button>
      </div>

      {/* Filter */}
      <Card className="rounded-2xl border-gray-100 shadow-sm" bodyStyle={{ padding: '16px' }}>
        <Space size="middle" wrap>
          <Input
            placeholder="Tìm theo mã lô, Trace ID..."
            allowClear onChange={e => setSearchText(e.target.value)}
            className="w-72 h-10 rounded-xl"
            prefix={<SearchOutlined className="text-gray-400" />}
          />
          <Select placeholder="Chọn sản phẩm" allowClear style={{ width: 220 }}
            onChange={setFilterProduct} className="h-10">
            {products.map(p => (
              <Option key={p._id} value={p._id}>{p.name}</Option>
            ))}
          </Select>
          <Select placeholder="Trạng thái cổng QG" allowClear style={{ width: 180 }}
            onChange={setFilterSyncStatus} className="h-10">
            {Object.entries(portalSyncStatusConfig).map(([k, v]) => (
              <Option key={k} value={k}>{v.label}</Option>
            ))}
          </Select>
        </Space>
      </Card>

      {/* Table */}
      <Card bordered={false} className="shadow-sm rounded-2xl overflow-hidden" bodyStyle={{ padding: 0 }}>
        <Table
          columns={columns}
          dataSource={filteredBatches}
          rowKey="_id"
          loading={loading}
          className="premium-table-refined custom-pagination"
          scroll={{ x: 1000 }}
          pagination={{
            current: currentPage, pageSize,
            showSizeChanger: true, pageSizeOptions: ['10', '20', '50'],
            onChange: (page, size) => { setCurrentPage(page); setPageSize(size); },
            className: 'pb-4 px-4 pt-4'
          }}
        />
      </Card>

      {/* Modal Tạo Lô */}
      <Modal
        title={<div className="flex items-center gap-2"><BoxPlotOutlined className="text-green-600" /><Text strong className="text-lg">Tạo Lô Sản Xuất Mới</Text></div>}
        open={isModalVisible}
        onCancel={() => { setIsModalVisible(false); form.resetFields(); }}
        onOk={() => form.submit()}
        confirmLoading={loading}
        centered width={650}
        okButtonProps={{ className: 'bg-green-600 border-0 rounded-lg h-10 font-bold' }}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateBatch} className="pt-4">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="batchCode" label={<Text strong>Mã lô sản xuất</Text>}
                rules={[{ required: true, message: 'Nhập mã lô' }]}>
                <Input className="h-11 rounded-lg" placeholder="VD: LÔ-2026-XUAN-01" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="productId" label={<Text strong>Sản phẩm</Text>}
                rules={[{ required: true, message: 'Chọn sản phẩm' }]}>
                <Select className="h-11" placeholder="Chọn sản phẩm đã đăng ký">
                  {products.map(p => (
                    <Option key={p._id} value={p._id}>{p.name} ({p.gtin})</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="htxJournalId" label={<Text strong>Sổ kế hoạch HTX</Text>}
                extra="Liên kết tất cả nhật ký nông dân thuộc sổ này vào lô">
                <Select className="h-11" placeholder="Chọn sổ HTX (không bắt buộc)" allowClear>
                  {htxJournals.map(j => (
                    <Option key={j._id} value={j._id}>{j.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="quantity" label={<Text strong>Số lượng</Text>}
                rules={[{ required: true, message: 'Nhập số lượng' }]}>
                <Input type="number" className="h-11 rounded-lg" placeholder="1000" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="unit" label={<Text strong>Đơn vị</Text>}
                rules={[{ required: true, message: 'Nhập đơn vị' }]}>
                <Input className="h-11 rounded-lg" placeholder="kg" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="productionDate" label={<Text strong>Ngày sản xuất / Thu hoạch</Text>}
                rules={[{ required: true, message: 'Chọn ngày' }]}>
                <DatePicker className="w-full h-11 rounded-lg" format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="expiryDate" label={<Text strong>Hạn sử dụng</Text>}
                rules={[{ required: true, message: 'Chọn hạn dùng' }]}>
                <DatePicker className="w-full h-11 rounded-lg" format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label={<Text strong>Địa điểm sản xuất</Text>}>
            <Input.Group compact>
              <Form.Item name={['productionLocation', 'address']} noStyle>
                <Input className="h-11 rounded-lg w-full" placeholder="Địa chỉ chi tiết (Thôn, xã...)" prefix={<EnvironmentOutlined className="text-gray-400" />} />
              </Form.Item>
            </Input.Group>
          </Form.Item>
          <Form.Item name="notes" label={<Text strong>Ghi chú lô hàng</Text>}>
            <TextArea rows={2} className="rounded-lg" placeholder="Mô tả thêm về lô hàng..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Drawer Chi Tiết Lô */}
      <Drawer
        title={<div className="flex items-center gap-2"><EyeOutlined className="text-green-600" /><Text strong className="text-lg">Chi Tiết Lô Sản Xuất & TXNG</Text></div>}
        placement="right" width={window.innerWidth > 992 ? 800 : '100%'}
        onClose={() => setIsDrawerVisible(false)} open={isDrawerVisible}
      >
        {selectedBatch && (
          <div className="space-y-6 pb-10">
            <Card className="rounded-2xl bg-green-50 border-0 shadow-none">
              <Descriptions column={2} labelStyle={{ fontWeight: 600 }}>
                <Descriptions.Item label="Mã lô" span={1}><Text strong className="text-green-800">{selectedBatch.batchCode}</Text></Descriptions.Item>
                <Descriptions.Item label="Trace ID" span={1}><Text className="font-mono bg-white px-2 py-0.5 rounded border">{selectedBatch.traceId}</Text></Descriptions.Item>
                <Descriptions.Item label="Sản phẩm" span={2}><Text strong>{selectedBatch.productId?.name}</Text> (<Text className="text-xs">{selectedBatch.productId?.gtin}</Text>)</Descriptions.Item>
                <Descriptions.Item label="Ngày sản xuất">{dayjs(selectedBatch.productionDate).format('DD/MM/YYYY')}</Descriptions.Item>
                <Descriptions.Item label="Hạn sử dụng">{dayjs(selectedBatch.expiryDate).format('DD/MM/YYYY')}</Descriptions.Item>
                <Descriptions.Item label="Số lượng">{selectedBatch.quantity} {selectedBatch.unit}</Descriptions.Item>
                <Descriptions.Item label="Địa điểm">{selectedBatch.productionLocation?.address || '—'}</Descriptions.Item>
              </Descriptions>
            </Card>

            <div className="flex items-center gap-2 px-1">
              <MedicineBoxOutlined className="text-green-600" />
              <Text strong className="text-lg">Nhật Ký Nông Hộ Liên Kết ({selectedBatch.farmJournalIds?.length || 0})</Text>
            </div>

            <Table
              dataSource={selectedBatch.farmJournalIds || []}
              rowKey="_id"
              pagination={false}
              size="small"
              className="premium-table-refined"
              columns={[
                { title: 'NÔNG DÂN', key: 'farmer', render: (_, r) => <Text strong>{r.userId?.fullname || r.userId?.username}</Text> },
                { title: 'ĐỊA CHỈ', key: 'addr', render: (_, r) => <Text className="text-xs text-gray-500">{r.userId?.province || ''}</Text> },
                { title: 'TRẠNG THÁI', dataIndex: 'status', key: 'st', render: (s) => <Tag color={s === 'Verified' ? 'green' : 'orange'}>{s}</Tag> },
                { title: 'THAO TÁC', key: 'v', align: 'center', render: (_, r) => <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => window.open(`/journals/view/${r._id}`, '_blank')}>Xem</Button> }
              ]}
              locale={{ emptyText: <Empty description="Chưa có nhật ký nào liên kết" /> }}
            />

            <Divider />
            
            <div className="flex flex-col items-center p-6 border-2 border-dashed border-gray-100 rounded-3xl bg-gray-50">
              <Title level={5}>Mã QR Truy Xuất Nguồn Gốc</Title>
              <img src={selectedBatch.qrCodeImage} alt="Batch QR" className="w-48 h-48 border-4 border-white shadow-lg rounded-2xl mb-4" />
              <Text className="text-gray-400 text-xs mb-2">Quét để truy cập dữ liệu TXNG công khai</Text>
              <Button type="primary" ghost icon={<QrcodeOutlined />} onClick={() => {
                const link = document.createElement('a');
                link.href = selectedBatch.qrCodeImage;
                link.download = `QR_Batch_${selectedBatch.batchCode}.png`;
                link.click();
              }}>Tải Xuống Mã QR</Button>
            </div>
          </div>
        )}
      </Drawer>

      {/* Modal Lịch Sử Sync */}
      <Modal
        title={<div className="flex items-center gap-2"><HistoryOutlined className="text-orange-600" /><Text strong>Lịch Sử Đồng Bộ Cổng Quốc Gia</Text></div>}
        open={isHistoryVisible} onCancel={() => setIsHistoryVisible(false)} footer={null} width={600} centered
      >
        <div className="py-4">
          <Timeline mode="left">
            {syncLogs.length > 0 ? syncLogs.map((log, idx) => (
              <Timeline.Item key={log._id} color={log.status === 'Success' ? 'green' : 'red'}>
                <div className="flex flex-col">
                  <Text strong>{log.action === 'SyncBatch' ? 'Đồng bộ lô hàng' : log.action}</Text>
                  <Text className="text-xs text-gray-400">{dayjs(log.createdAt).format('DD/MM/YYYY HH:mm:ss')}</Text>
                  <Tag color={log.status === 'Success' ? 'green' : 'red'} className="w-fit mt-1">{log.status}</Tag>
                  {log.errorMessage && <Text type="danger" className="text-[10px] mt-1 italic">{log.errorMessage}</Text>}
                  {log.portalEntityId && <Text className="text-[10px] text-green-600 mt-1">ID Cổng: {log.portalEntityId}</Text>}
                </div>
              </Timeline.Item>
            )) : <Empty description="Chưa có lịch sử đồng bộ" />}
          </Timeline>
        </div>
      </Modal>
    </div>
  );
};

export default HtxBatchMgmt;
