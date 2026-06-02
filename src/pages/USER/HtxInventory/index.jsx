import React, { useState, useEffect } from 'react';
import { 
  Table, Card, Typography, Row, Col, Input, Button, Tag, Space, 
  Modal, Form, Select, InputNumber, message, Badge, Tabs, List, Avatar
} from 'antd';
import { 
  PlusOutlined, 
  HistoryOutlined, 
  ArrowRightOutlined, 
  InboxOutlined, 
  DatabaseOutlined,
  SearchOutlined,
  FilterOutlined,
  UserOutlined
} from '@ant-design/icons';

import moment from 'moment';
import JournalService from 'src/services/JournalService'
import InventoryService from 'src/services/InventoryService'

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const HtxInventoryMgmt = () => {
  const [items, setItems] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isDistributeModalVisible, setIsDistributeModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [form] = Form.useForm();
  const [distributeForm] = Form.useForm();

  useEffect(() => {
    fetchData();
    fetchFarmers();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [invRes, transRes] = await Promise.all([
        InventoryService.getInventory(),
        InventoryService.getTransactions()
      ]);
      setItems(invRes.data.data);
      setTransactions(transRes.data.data);
    } catch (error) {
      message.error('Không thể tải dữ liệu kho.');
    }
    setLoading(false);
  };

  const fetchFarmers = async () => {
    try {
      const res = await JournalService.getHtxFarmers();
      setFarmers(res.data.data);
    } catch (error) {
      console.error('Error fetching farmers:', error);
    }
  };

  const handleAddItem = async (values) => {
    try {
      await InventoryService.addStock(values);
      message.success('Nhập kho thành công!');
      setIsAddModalVisible(false);
      form.resetFields();
      fetchData();
    } catch (error) {
      message.error('Lỗi khi nhập kho: ' + error.message);
    }
  };

  const handleDistribute = async (values) => {
    try {
      await InventoryService.distributeStock({
        ...values,
        itemId: selectedItem._id
      });
      message.success('Cấp phát vật tư thành công!');
      setIsDistributeModalVisible(false);
      distributeForm.resetFields();
      fetchData();
    } catch (error) {
      message.error('Lỗi khi cấp phát: ' + error.message);
    }
  };

  const columns = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      align: 'center',
      render: (text, record, index) => <span className="text-gray-400 font-medium">{index + 1}</span>
    },
    {
      title: 'TÊN VẬT TƯ',
      dataIndex: 'name',
      key: 'name',
      filters: [
        { text: 'Phân bón', value: 'Phân bón' },
        { text: 'Thuốc BVTV', value: 'Thuốc BVTV' },
        { text: 'Giống', value: 'Giống' },
        { text: 'Vật tư khác', value: 'Khác' }
      ],
      onFilter: (value, record) => record.category === value,
      render: (text, record) => (
        <Space>
          <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
            <InboxOutlined />
          </div>
          <div className="flex flex-col">
            <Text strong>{text}</Text>
            <Text type="secondary" className="text-[10px] uppercase">{record.category}</Text>
          </div>
        </Space>
      )
    },
    {
      title: 'SỐ LƯỢNG',
      key: 'quantity',
      render: (record) => (
        <Space direction="vertical" size={0}>
          <Text strong className="text-lg">{record.quantity} {record.unit}</Text>
          {record.quantity <= record.minQuantity && (
            <Tag color="error" className="m-0 border-0 rounded-full text-[10px]">Sắp hết hàng</Tag>
          )}
        </Space>
      )
    },
    {
      title: 'CẬP NHẬT CUỐI',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date) => <Text className="text-gray-400">{moment(date).format('DD/MM/YYYY HH:mm')}</Text>
    },
    {
      title: 'THAO TÁC',
      key: 'actions',
      align: 'right',
      render: (record) => (
        <Button 
          type="primary" 
          icon={<ArrowRightOutlined />}
          onClick={() => {
            setSelectedItem(record);
            setIsDistributeModalVisible(true);
          }}
          className="rounded-lg bg-blue-600 border-0"
        >
          Cấp phát
        </Button>
      )
    }
  ];

  const transactionColumns = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      align: 'center',
      render: (text, record, index) => <span className="text-gray-400 font-medium">{index + 1}</span>
    },
    {
      title: 'THỜI GIAN',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => <Text className="text-gray-400">{moment(date).format('DD/MM/YYYY HH:mm')}</Text>
    },
    {
      title: 'LOẠI',
      dataIndex: 'type',
      key: 'type',
      filters: [
        { text: 'Nhập kho', value: 'Import' },
        { text: 'Xuất kho', value: 'Export' },
        { text: 'Cấp phát', value: 'Distribute' }
      ],
      onFilter: (value, record) => record.type === value,
      render: (type) => {
        const config = {
          Import: { color: 'green', text: 'Nhập kho' },
          Export: { color: 'red', text: 'Xuất kho' },
          Distribute: { color: 'blue', text: 'Cấp phát' }
        };
        const { color, text } = config[type] || { color: 'default', text: type };
        return <Tag color={color} className="rounded-full border-0 font-bold px-3">{text}</Tag>;
      }
    },
    {
      title: 'VẬT TƯ',
      key: 'item',
      render: (record) => <Text strong>{record.itemId?.name || 'N/A'}</Text>
    },
    {
      title: 'SỐ LƯỢNG',
      key: 'quantity',
      render: (record) => (
        <Text strong className={record.type === 'Import' ? 'text-green-600' : 'text-red-600'}>
          {record.type === 'Import' ? '+' : '-'}{record.quantity} {record.itemId?.unit}
        </Text>
      )
    },
    {
      title: 'ĐỐI TƯỢNG',
      key: 'target',
      render: (record) => {
        if (record.type === 'Distribute') {
          return (
            <Space>
              <Avatar size="small" icon={<UserOutlined />} />
              <Text className="text-xs">{record.receiverId?.fullname || record.receiverId?.username}</Text>
            </Space>
          );
        }
        return <Text type="secondary">-</Text>;
      }
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <Text className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Hệ thống quản trị HTX</Text>
          <Title level={2} className="!mb-0 flex items-center gap-3">
            <DatabaseOutlined className="text-blue-500" /> Kho vật tư tập trung
          </Title>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          size="large"
          onClick={() => setIsAddModalVisible(true)}
          className="rounded-xl bg-green-600 border-0 shadow-lg shadow-green-100 h-11 px-6 font-bold"
        >
          Nhập kho mới
        </Button>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={18}>
          <Card bordered={false} className="shadow-xl shadow-gray-100/50 rounded-3xl overflow-hidden">
            <Tabs defaultActiveKey="1" className="premium-tabs">
              <TabPane 
                tab={
                  <span className="flex items-center gap-2">
                    <DatabaseOutlined /> Danh mục vật tư
                  </span>
                } 
                key="1"
              >
                <div className="p-4">
                  <Table 
                    columns={columns} 
                    dataSource={items} 
                    loading={loading}
                    rowKey="_id"
                    className="premium-table-refined"
                    pagination={{ pageSize: 10 }}
                  />
                </div>
              </TabPane>
              <TabPane 
                tab={
                  <span className="flex items-center gap-2">
                    <HistoryOutlined /> Lịch sử giao dịch
                  </span>
                } 
                key="2"
              >
                <div className="p-4">
                  <Table 
                    columns={transactionColumns} 
                    dataSource={transactions} 
                    loading={loading}
                    rowKey="_id"
                    className="premium-table-refined"
                    pagination={{ pageSize: 10 }}
                  />
                </div>
              </TabPane>
            </Tabs>
          </Card>
        </Col>

        <Col xs={24} lg={6}>
          <div className="space-y-6">
            <Card title="Thống kê nhanh" bordered={false} className="shadow-xl shadow-gray-100/50 rounded-3xl">
              <div className="space-y-6">
                <div>
                  <Text type="secondary" className="text-[10px] uppercase font-bold tracking-widest block mb-2">Tổng mặt hàng</Text>
                  <Title level={3} className="!mb-0">{items.length}</Title>
                </div>
                <div>
                  <Text type="secondary" className="text-[10px] uppercase font-bold tracking-widest block mb-2">Giao dịch trong tháng</Text>
                  <Title level={3} className="!mb-0">{transactions.length}</Title>
                </div>
              </div>
            </Card>

            <Card title="Cảnh báo tồn kho" bordered={false} className="shadow-xl shadow-gray-100/50 rounded-3xl">
              <List
                dataSource={items.filter(i => i.quantity <= i.minQuantity)}
                renderItem={item => (
                  <List.Item className="px-0">
                    <Space className="w-full justify-between">
                      <Text strong>{item.name}</Text>
                      <Tag color="red" className="m-0 border-0 rounded-full font-bold">{item.quantity} {item.unit}</Tag>
                    </Space>
                  </List.Item>
                )}
                locale={{ emptyText: <Text type="secondary">Kho hàng ổn định</Text> }}
              />
            </Card>
          </div>
        </Col>
      </Row>

      {/* Modal Nhập kho */}
      <Modal
        title="Nhập vật tư mới vào kho HTX"
        open={isAddModalVisible}
        onCancel={() => setIsAddModalVisible(false)}
        footer={null}
        centered
        className="premium-modal"
      >
        <Form form={form} layout="vertical" onFinish={handleAddItem} className="mt-4">
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="name" label="Tên vật tư" rules={[{ required: true, message: 'Vui lòng nhập tên vật tư' }]}>
                <Input placeholder="VD: Phân bón NPK 16-16-8" className="h-10 rounded-lg" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="category" label="Loại" rules={[{ required: true }]}>
                <Select className="h-10" placeholder="Chọn loại">
                  <Select.Option value="Phân bón">Phân bón</Select.Option>
                  <Select.Option value="Thuốc BVTV">Thuốc BVTV</Select.Option>
                  <Select.Option value="Giống">Giống</Select.Option>
                  <Select.Option value="Khác">Khác</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="unit" label="Đơn vị tính" rules={[{ required: true }]}>
                <Select className="h-10" placeholder="Chọn đơn vị">
                  <Select.Option value="kg">kg</Select.Option>
                  <Select.Option value="lít">lít</Select.Option>
                  <Select.Option value="bao">bao</Select.Option>
                  <Select.Option value="gói">gói</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="quantity" label="Số lượng nhập" rules={[{ required: true }]}>
                <InputNumber className="w-full h-10 rounded-lg flex items-center" min={1} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="minQuantity" label="Ngưỡng cảnh báo" initialValue={10}>
                <InputNumber className="w-full h-10 rounded-lg flex items-center" min={0} />
              </Form.Item>
            </Col>
          </Row>
          <div className="flex justify-end gap-3 mt-6">
            <Button onClick={() => setIsAddModalVisible(false)} className="rounded-lg h-10 px-6">Hủy</Button>
            <Button type="primary" htmlType="submit" className="rounded-lg h-10 px-6 bg-green-600 border-0">Xác nhận nhập kho</Button>
          </div>
        </Form>
      </Modal>

      {/* Modal Cấp phát */}
      <Modal
        title={
          <Space>
            <ArrowRightOutlined className="text-blue-500" />
            <span>Cấp phát vật tư cho nông dân</span>
          </Space>
        }
        open={isDistributeModalVisible}
        onCancel={() => setIsDistributeModalVisible(false)}
        footer={null}
        centered
        className="premium-modal"
      >
        {selectedItem && (
          <div className="mb-6 p-4 bg-blue-50 rounded-2xl border border-blue-100 flex justify-between items-center">
            <div>
              <Text type="secondary" className="text-[10px] uppercase font-bold block">Vật tư đang chọn</Text>
              <Text strong className="text-blue-700">{selectedItem.name}</Text>
            </div>
            <div className="text-right">
              <Text type="secondary" className="text-[10px] uppercase font-bold block">Hiện có trong kho</Text>
              <Text strong className="text-blue-700">{selectedItem.quantity} {selectedItem.unit}</Text>
            </div>
          </div>
        )}
        <Form distributeForm={distributeForm} layout="vertical" onFinish={handleDistribute}>
          <Form.Item name="farmerId" label="Nông dân nhận" rules={[{ required: true, message: 'Vui lòng chọn nông dân' }]}>
            <Select 
              placeholder="Tìm theo tên nông dân..." 
              className="h-10"
              showSearch
              optionFilterProp="children"
            >
              {farmers.map(f => (
                <Select.Option key={f._id} value={f._id}>
                  {f.fullname} ({f.username})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="quantity" label="Số lượng cấp phát" rules={[
            { required: true, message: 'Vui lòng nhập số lượng' },
            { type: 'number', max: selectedItem?.quantity, message: 'Vượt quá số lượng trong kho' }
          ]}>
            <InputNumber className="w-full h-10 rounded-lg flex items-center" min={1} />
          </Form.Item>
          <Form.Item name="note" label="Ghi chú cấp phát">
            <Input.TextArea placeholder="Nhập lý do hoặc hướng dẫn sử dụng..." rows={3} className="rounded-lg" />
          </Form.Item>
          <div className="flex justify-end gap-3 mt-6">
            <Button onClick={() => setIsDistributeModalVisible(false)} className="rounded-lg h-10 px-6">Hủy</Button>
            <Button type="primary" htmlType="submit" className="rounded-lg h-10 px-6 bg-blue-600 border-0">Xác nhận cấp phát</Button>
          </div>
        </Form>
      </Modal>

      <style jsx>{`
        .premium-tabs :global(.ant-tabs-nav) {
          margin-bottom: 0;
          padding: 0 16px;
        }
        .premium-tabs :global(.ant-tabs-tab) {
          padding: 16px 0;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export default HtxInventoryMgmt;
