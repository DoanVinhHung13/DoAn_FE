import React, { useState, useEffect } from 'react';
import {
  Table, Button, Modal, Form, Input, Select, message, Tag, Space,
  Drawer, Descriptions, Card, Typography, Row, Col, Statistic,
  Tooltip, Divider, Empty, Image, Upload, Badge, Popconfirm
} from 'antd';
import {
  PlusOutlined, EyeOutlined, EditOutlined, SearchOutlined,
  FilterOutlined, HomeOutlined, SafetyCertificateOutlined,
  CloudUploadOutlined, GlobalOutlined, CheckCircleOutlined,
  BarcodeOutlined, ShopOutlined, ExclamationCircleOutlined,
  SyncOutlined, InboxOutlined
} from '@ant-design/icons';
import HtxProductService from 'src/services/HtxProductService';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;

const categoryLabels = {
  trongtrot: { label: 'Trồng trọt', color: 'green' },
  channuoi: { label: 'Chăn nuôi', color: 'orange' },
  thuysan: { label: 'Thủy sản', color: 'blue' },
  huuco: { label: 'Hữu cơ', color: 'lime' },
  thucpham: { label: 'Thực phẩm', color: 'gold' },
  khac: { label: 'Khác', color: 'default' },
};

const portalStatusConfig = {
  NotRegistered: { label: 'Chưa đăng ký', color: 'default', icon: <ExclamationCircleOutlined /> },
  Pending: { label: 'Đang xử lý...', color: 'processing', icon: <SyncOutlined spin /> },
  Registered: { label: 'Đã đăng ký', color: 'success', icon: <CheckCircleOutlined /> },
  Failed: { label: 'Thất bại', color: 'error', icon: <ExclamationCircleOutlined /> },
};

const HtxProductMgmt = () => {
  const [products, setProducts] = useState([]);
  const [schemas, setSchemas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [registeringId, setRegisteringId] = useState(null);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [searchText, setSearchText] = useState('');
  const [filterCategory, setFilterCategory] = useState(null);
  const [filterPortalStatus, setFilterPortalStatus] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [form] = Form.useForm();

  useEffect(() => {
    fetchProducts();
    fetchSchemas();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await HtxProductService.getProducts();
      if (res.data.success) setProducts(res.data.data);
    } catch (e) {
      message.error('Lỗi khi tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const fetchSchemas = async () => {
    try {
      const res = await HtxProductService.getSchemas();
      if (res.data.success) setSchemas(res.data.data);
    } catch (e) { /* silent */ }
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      if (isEditMode && selectedProduct) {
        await HtxProductService.updateProduct(selectedProduct._id, values);
        message.success('Đã cập nhật sản phẩm thành công');
      } else {
        await HtxProductService.createProduct(values);
        message.success('Đã tạo sản phẩm thành công');
      }
      setIsModalVisible(false);
      form.resetFields();
      fetchProducts();
    } catch (e) {
      message.error(e.response?.data?.message || 'Lỗi khi lưu sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterPortal = async (product) => {
    try {
      setRegisteringId(product._id);
      const res = await HtxProductService.registerProductPortal(product._id);
      if (res.data.success) {
        message.success(res.data.message);
        fetchProducts();
      }
    } catch (e) {
      message.error(e.response?.data?.message || 'Lỗi khi đăng ký lên cổng quốc gia');
    } finally {
      setRegisteringId(null);
    }
  };

  const openEdit = (product) => {
    setSelectedProduct(product);
    setIsEditMode(true);
    form.setFieldsValue({
      name: product.name,
      gtin: product.gtin,
      description: product.description,
      category: product.category,
      unit: product.unit,
      weight: product.weight,
      schemaId: product.schemaId?._id,
    });
    setIsModalVisible(true);
  };

  const openCreate = () => {
    setSelectedProduct(null);
    setIsEditMode(false);
    form.resetFields();
    setIsModalVisible(true);
  };

  const filteredProducts = products.filter(p => {
    const matchSearch = p.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      p.gtin?.includes(searchText);
    const matchCat = filterCategory ? p.category === filterCategory : true;
    const matchPortal = filterPortalStatus ? p.portalSyncStatus === filterPortalStatus : true;
    return matchSearch && matchCat && matchPortal;
  });

  const stats = {
    total: products.length,
    registered: products.filter(p => p.portalSyncStatus === 'Registered').length,
    notRegistered: products.filter(p => p.portalSyncStatus === 'NotRegistered').length,
  };

  const columns = [
    {
      title: 'STT', key: 'stt', width: 55, align: 'center',
      render: (_, __, idx) => <span className="text-gray-400 font-mono text-xs">{(currentPage - 1) * pageSize + idx + 1}</span>
    },
    {
      title: 'SẢN PHẨM',
      key: 'product_info',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          {record.images?.[0] ? (
            <Image src={record.images[0]} width={44} height={44} className="rounded-xl object-cover" preview={false} />
          ) : (
            <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center">
              <InboxOutlined className="text-green-400 text-lg" />
            </div>
          )}
          <div>
            <Text strong className="text-gray-800 block">{record.name}</Text>
            <div className="flex items-center gap-1 mt-0.5">
              <BarcodeOutlined className="text-gray-400 text-xs" />
              <Text className="text-gray-400 text-xs font-mono">{record.gtin}</Text>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'LOẠI SẢN PHẨM', dataIndex: 'category', key: 'category', align: 'center',
      render: (v) => {
        const cfg = categoryLabels[v] || { label: v, color: 'default' };
        return <Tag color={cfg.color} className="rounded-full px-3 font-medium">{cfg.label}</Tag>;
      }
    },
    {
      title: 'ĐVT', dataIndex: 'unit', key: 'unit', align: 'center',
      render: (v) => <Text className="text-gray-500">{v || '—'}</Text>
    },
    {
      title: 'CỔNG QUỐC GIA', dataIndex: 'portalSyncStatus', key: 'portal', align: 'center',
      render: (status) => {
        const cfg = portalStatusConfig[status] || portalStatusConfig.NotRegistered;
        return (
          <Badge status={cfg.color} text={
            <Text className="text-xs font-medium">{cfg.label}</Text>
          } />
        );
      }
    },
    {
      title: 'THAO TÁC', key: 'actions', align: 'center', width: 160,
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button type="text" icon={<EyeOutlined className="text-green-600" />}
              onClick={() => { setSelectedProduct(record); setIsDrawerVisible(true); }}
              className="bg-green-50 hover:bg-green-100 rounded-xl" />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button type="text" icon={<EditOutlined className="text-blue-600" />}
              onClick={() => openEdit(record)}
              className="bg-blue-50 hover:bg-blue-100 rounded-xl" />
          </Tooltip>
          {record.portalSyncStatus !== 'Registered' && (
            <Tooltip title="Đăng ký lên Cổng Quốc Gia">
              <Popconfirm
                title="Đăng ký sản phẩm"
                description="Gửi thông tin sản phẩm lên Cổng TXNG Quốc Gia?"
                onConfirm={() => handleRegisterPortal(record)}
                okText="Đồng ý" cancelText="Hủy"
                okButtonProps={{ className: 'bg-green-600 border-0' }}
              >
                <Button type="text"
                  icon={<CloudUploadOutlined className="text-purple-600" />}
                  loading={registeringId === record._id}
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
            <GlobalOutlined />
            <span className="text-green-600">Quản lý Sản Phẩm TXNG</span>
          </div>
          <Title level={4} className="!mb-0">Quản Lý Sản Phẩm Truy Xuất Nguồn Gốc</Title>
          <Text className="text-gray-400 text-sm">Đăng ký và quản lý sản phẩm lên Cổng TXNG Quốc Gia</Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openCreate}
          className="bg-green-600 hover:bg-green-700 rounded-xl h-11 px-6 shadow-lg shadow-green-100 border-0 font-bold"
        >
          Thêm Sản Phẩm
        </Button>
      </div>

      {/* Stats */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card className="rounded-2xl border-0 shadow-sm bg-gradient-to-br from-green-500 to-green-600">
            <Statistic
              title={<Text className="text-white/80 uppercase text-xs font-bold">Tổng sản phẩm</Text>}
              value={stats.total}
              prefix={<ShopOutlined />}
              valueStyle={{ color: '#fff', fontSize: '32px', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="rounded-2xl border-gray-100 shadow-sm">
            <Statistic
              title={<Text className="text-gray-400 uppercase text-xs font-bold">Đã đăng ký cổng QG</Text>}
              value={stats.registered}
              prefix={<CheckCircleOutlined className="text-green-500" />}
              valueStyle={{ color: '#22c55e', fontSize: '32px', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="rounded-2xl border-gray-100 shadow-sm">
            <Statistic
              title={<Text className="text-gray-400 uppercase text-xs font-bold">Chưa đăng ký</Text>}
              value={stats.notRegistered}
              prefix={<ExclamationCircleOutlined className="text-orange-400" />}
              valueStyle={{ color: '#f97316', fontSize: '32px', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filter */}
      <Card className="rounded-2xl border-gray-100 shadow-sm" bodyStyle={{ padding: '16px' }}>
        <Space size="middle" wrap>
          <Input
            placeholder="Tìm theo tên, mã GTIN..."
            allowClear onChange={e => setSearchText(e.target.value)}
            className="w-72 h-10 rounded-xl"
            prefix={<SearchOutlined className="text-gray-400" />}
          />
          <Select placeholder="Loại sản phẩm" allowClear style={{ width: 180 }}
            onChange={setFilterCategory} className="h-10" suffixIcon={<FilterOutlined />}>
            {Object.entries(categoryLabels).map(([k, v]) => (
              <Option key={k} value={k}>{v.label}</Option>
            ))}
          </Select>
          <Select placeholder="Trạng thái cổng QG" allowClear style={{ width: 200 }}
            onChange={setFilterPortalStatus} className="h-10">
            {Object.entries(portalStatusConfig).map(([k, v]) => (
              <Option key={k} value={k}>{v.label}</Option>
            ))}
          </Select>
          <Text className="text-gray-400 text-xs italic">
            Tìm thấy <Text strong className="text-green-600">{filteredProducts.length}</Text> kết quả
          </Text>
        </Space>
      </Card>

      {/* Table */}
      <Card bordered={false} className="shadow-sm rounded-2xl overflow-hidden" bodyStyle={{ padding: 0 }}>
        <Table
          columns={columns}
          dataSource={filteredProducts}
          rowKey="_id"
          loading={loading}
          className="premium-table-refined custom-pagination"
          scroll={{ x: 900 }}
          pagination={{
            current: currentPage, pageSize,
            showSizeChanger: true, pageSizeOptions: ['10', '20', '50'],
            locale: { items_per_page: '/ trang' },
            onChange: (page, size) => { setCurrentPage(page); setPageSize(size); },
            className: 'pb-4 px-4 pt-4'
          }}
          locale={{ emptyText: <Empty description="Chưa có sản phẩm nào. Hãy thêm sản phẩm đầu tiên!" /> }}
        />
      </Card>

      {/* Modal Tạo/Sửa */}
      <Modal
        title={
          <div className="flex items-center gap-2 pt-1">
            <ShopOutlined className="text-green-600 text-lg" />
            <Text strong className="text-lg">{isEditMode ? 'Cập Nhật Sản Phẩm' : 'Thêm Sản Phẩm Mới'}</Text>
          </div>
        }
        open={isModalVisible}
        onCancel={() => { setIsModalVisible(false); form.resetFields(); }}
        onOk={() => form.submit()}
        confirmLoading={loading}
        okText={isEditMode ? 'Cập nhật' : 'Tạo sản phẩm'}
        cancelText="Hủy"
        centered width={580}
        okButtonProps={{ className: 'bg-green-600 border-0 rounded-lg h-10 font-bold' }}
      >
        <Divider className="my-3" />
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={14}>
              <Form.Item name="name" label={<Text strong>Tên sản phẩm</Text>}
                rules={[{ required: true, message: 'Nhập tên sản phẩm' }]}>
                <Input className="h-11 rounded-lg" placeholder="VD: Gạo ST25 Sóc Trăng" />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item name="gtin" label={<Text strong>Mã GTIN <Text className="text-red-500">*</Text></Text>}
                rules={[
                  { required: true, message: 'Nhập mã GTIN' },
                  { pattern: /^\d{8}(\d{5})?$|^\d{13}$|^\d{14}$/, message: 'GTIN phải là 8, 13 hoặc 14 chữ số' }
                ]}
                extra={<Text className="text-xs text-gray-400">8, 13 hoặc 14 chữ số</Text>}
              >
                <Input className="h-11 rounded-lg font-mono" placeholder="8938500000001"
                  disabled={isEditMode} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="category" label={<Text strong>Loại sản phẩm</Text>}
                rules={[{ required: true, message: 'Chọn loại sản phẩm' }]}>
                <Select className="h-11" placeholder="Chọn loại">
                  {Object.entries(categoryLabels).map(([k, v]) => (
                    <Option key={k} value={k}>{v.label}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="unit" label={<Text strong>Đơn vị tính</Text>}>
                <Select className="h-11" placeholder="kg">
                  {['kg', 'g', 'hộp', 'chai', 'túi', 'cái', 'con', 'tấn'].map(u => (
                    <Option key={u} value={u}>{u}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="weight" label={<Text strong>Trọng lượng (g)</Text>}>
                <Input type="number" className="h-11 rounded-lg" placeholder="500" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="schemaId" label={<Text strong>Biểu mẫu nhật ký áp dụng</Text>}>
            <Select className="h-11" placeholder="Chọn bộ biểu mẫu VietGAP/Hữu cơ...">
              {schemas.map(s => (
                <Option key={s._id} value={s._id}>{s.name} ({s.category})</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="description" label={<Text strong>Mô tả sản phẩm</Text>}>
            <TextArea rows={3} className="rounded-lg" placeholder="Mô tả ngắn về sản phẩm, đặc tính, vùng trồng..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Drawer Chi Tiết */}
      <Drawer
        title={
          <div className="flex items-center gap-2">
            <EyeOutlined className="text-green-600" />
            <Text strong className="text-lg">Chi Tiết Sản Phẩm</Text>
          </div>
        }
        placement="right"
        width={window.innerWidth > 992 ? 580 : '100%'}
        onClose={() => setIsDrawerVisible(false)}
        open={isDrawerVisible}
      >
        {selectedProduct && (
          <div className="space-y-5">
            {/* Product image */}
            {selectedProduct.images?.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {selectedProduct.images.map((img, i) => (
                  <Image key={i} src={img} width={80} height={80} className="rounded-xl object-cover" />
                ))}
              </div>
            )}

            <Card className="rounded-2xl bg-green-50 border-0">
              <Descriptions column={1} size="small" labelStyle={{ fontWeight: 600 }}>
                <Descriptions.Item label="Tên sản phẩm">
                  <Text strong className="text-green-800 text-base">{selectedProduct.name}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Mã GTIN">
                  <Text className="font-mono bg-gray-100 px-2 py-0.5 rounded text-sm">{selectedProduct.gtin}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Loại sản phẩm">
                  <Tag color={categoryLabels[selectedProduct.category]?.color}>
                    {categoryLabels[selectedProduct.category]?.label}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Đơn vị / Trọng lượng">
                  {selectedProduct.unit || '—'} {selectedProduct.weight ? `/ ${selectedProduct.weight}g` : ''}
                </Descriptions.Item>
                <Descriptions.Item label="Mô tả">
                  {selectedProduct.description || <Text className="text-gray-400 italic">Chưa có mô tả</Text>}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Divider>
              <div className="flex items-center gap-2">
                <GlobalOutlined className="text-green-600" />
                <Text strong className="text-green-700">Trạng Thái Cổng Quốc Gia</Text>
              </div>
            </Divider>

            <div className="space-y-3">
              {(() => {
                const cfg = portalStatusConfig[selectedProduct.portalSyncStatus] || portalStatusConfig.NotRegistered;
                return (
                  <div className={`rounded-xl p-4 flex items-center gap-3 ${
                    selectedProduct.portalSyncStatus === 'Registered'
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-orange-50 border border-orange-200'
                  }`}>
                    <div className={`text-2xl ${selectedProduct.portalSyncStatus === 'Registered' ? 'text-green-500' : 'text-orange-400'}`}>
                      {cfg.icon}
                    </div>
                    <div>
                      <Text strong>{cfg.label}</Text>
                      {selectedProduct.portalProductId && (
                        <div>
                          <Text className="text-xs text-gray-500">ID cổng: </Text>
                          <Text className="text-xs font-mono text-green-700">{selectedProduct.portalProductId}</Text>
                        </div>
                      )}
                      {selectedProduct.portalRegisteredAt && (
                        <div>
                          <Text className="text-xs text-gray-500">Đăng ký lúc: </Text>
                          <Text className="text-xs">{dayjs(selectedProduct.portalRegisteredAt).format('DD/MM/YYYY HH:mm')}</Text>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {selectedProduct.portalSyncStatus !== 'Registered' && (
                <Popconfirm
                  title="Đăng ký sản phẩm lên Cổng TXNG Quốc Gia?"
                  description="Thao tác này sẽ gửi thông tin sản phẩm đến cổng quốc gia."
                  onConfirm={() => handleRegisterPortal(selectedProduct)}
                  okText="Xác nhận" cancelText="Hủy"
                  okButtonProps={{ className: 'bg-green-600 border-0' }}
                >
                  <Button type="primary" block icon={<CloudUploadOutlined />}
                    loading={registeringId === selectedProduct._id}
                    className="bg-green-600 border-0 rounded-xl h-11 font-bold"
                  >
                    Đăng Ký Lên Cổng Quốc Gia
                  </Button>
                </Popconfirm>
              )}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default HtxProductMgmt;
