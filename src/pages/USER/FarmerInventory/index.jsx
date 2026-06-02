import React, { useState } from 'react';
import { Card, Table, Typography, Space, Tag, Input, Statistic, Row, Col, Tabs } from 'antd';
import { SearchOutlined, InboxOutlined, AlertOutlined, SafetyCertificateOutlined, HistoryOutlined, ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';

import { Tractor, Droplet } from 'lucide-react';
import dayjs from 'dayjs';
import InventoryService from 'src/services/InventoryService'

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const FarmerInventory = () => {
  const [searchText, setSearchText] = useState('');

  // Fetch inventory
  const { data: inventory, isLoading: isInvLoading } = useQuery({
    queryKey: ['farmer-inventory'],
    queryFn: () => InventoryService.getInventory().then(res => res.data.data)
  });

  // Fetch transactions
  const { data: transactions, isLoading: isTransLoading } = useQuery({
    queryKey: ['farmer-transactions'],
    queryFn: () => InventoryService.getTransactions().then(res => res.data.data)
  });

  const getStockStatus = (qty, threshold = 10) => {
    if (qty === 0) return { color: 'red', text: 'Hết hàng' };
    if (qty <= threshold) return { color: 'warning', text: 'Sắp hết' };
    return { color: 'success', text: 'Sẵn có' };
  };

  const invColumns = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      align: 'center',
      render: (text, record, index) => <span className="text-gray-400 font-medium">{index + 1}</span>
    },
    {
      title: 'Tên Vật tư',
      key: 'name',
      filters: [
        { text: 'Phân bón', value: 'Phân bón' },
        { text: 'Thuốc BVTV', value: 'Thuốc BVTV' },
        { text: 'Giống', value: 'Giống' },
        { text: 'Vật tư khác', value: 'Khác' }
      ],
      onFilter: (value, record) => record.category === value,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-green-600">
            {record.category === 'Phân bón' ? <Droplet className="w-5 h-5" /> : <Tractor className="w-5 h-5" />}
          </div>
          <div className="flex flex-col">
            <Text strong className="text-gray-800 text-base">{record.name}</Text>
            <Text type="secondary" className="text-xs uppercase">{record.category}</Text>
          </div>
        </div>
      )
    },
    {
      title: 'Tồn kho hiện tại',
      key: 'quantity',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text className="text-lg font-bold text-gray-800">
            {record.quantity} <span className="text-sm font-normal text-gray-500">{record.unit}</span>
          </Text>
          <Tag color={getStockStatus(record.quantity, record.minQuantity).color} className="rounded-md border-0 uppercase text-[10px] tracking-wider font-bold">
            {getStockStatus(record.quantity, record.minQuantity).text}
          </Tag>
        </Space>
      )
    },
    {
      title: 'Bảo quản',
      key: 'storage',
      render: () => (
        <div className="flex items-center gap-2 text-xs text-gray-500">
           <SafetyCertificateOutlined className="text-green-500" /> Đúng tiêu chuẩn
        </div>
      )
    }
  ];

  const transColumns = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      align: 'center',
      render: (text, record, index) => <span className="text-gray-400 font-medium">{index + 1}</span>
    },
    {
      title: 'Thời gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => <Text className="text-gray-500">{dayjs(date).format('DD/MM/YYYY HH:mm')}</Text>
    },
    {
      title: 'Loại giao dịch',
      key: 'type',
      filters: [
        { text: 'Nhập kho', value: 'Import' },
        { text: 'Được HTX cấp phát', value: 'Distribute' },
        { text: 'Đã sử dụng', value: 'Export' }
      ],
      onFilter: (value, record) => record.type === value,
      render: (_, record) => {
        if (record.type === 'Import') return <Tag icon={<ArrowDownOutlined />} color="blue">Nhập kho</Tag>;
        if (record.type === 'Distribute') return <Tag icon={<ArrowDownOutlined />} color="purple">Được HTX cấp phát</Tag>;
        if (record.type === 'Export') return <Tag icon={<ArrowUpOutlined />} color="orange">Đã sử dụng</Tag>;
        return <Tag>{record.type}</Tag>;
      }
    },
    {
      title: 'Vật tư',
      key: 'item',
      render: (_, record) => (
        <Text strong>{record.itemId?.name}</Text>
      )
    },
    {
      title: 'Số lượng',
      key: 'quantity',
      render: (_, record) => {
        const isAddition = record.type === 'Import' || record.type === 'Distribute';
        return (
          <Text strong className={isAddition ? 'text-green-600' : 'text-orange-600'}>
            {isAddition ? '+' : '-'}{record.quantity} {record.itemId?.unit}
          </Text>
        );
      }
    },
    {
      title: 'Nguồn / Người thực hiện',
      key: 'performedBy',
      render: (_, record) => <Text>{record.performedBy?.fullname || record.performedBy?.username}</Text>
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      key: 'note',
      render: (text) => <Text type="secondary" className="text-xs">{text}</Text>
    }
  ];

  const filteredData = inventory?.filter(item => 
    item.name?.toLowerCase().includes(searchText.toLowerCase()) || 
    item.category?.toLowerCase().includes(searchText.toLowerCase())
  );

  const totalItems = inventory?.length || 0;
  const lowStockItems = inventory?.filter(i => i.quantity <= (i.minQuantity || 10)).length || 0;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <Title level={2} className="!mb-0 tracking-tight text-gray-800">Tồn kho Sản xuất</Title>
        <Text className="text-gray-400 font-medium">Quản lý vật tư, phân bón, thuốc BVTV và lịch sử nhận cấp phát từ HTX</Text>
      </div>

      <Row gutter={[24, 24]}>
         <Col xs={24} md={12}>
            <Card className="rounded-3xl shadow-sm border border-green-100 bg-green-50/50 hover:shadow-md transition-shadow">
               <Statistic 
                  title={<span className="text-gray-500 font-bold uppercase tracking-widest text-xs">Tổng mã Số vật tư</span>}
                  value={totalItems} 
                  prefix={<InboxOutlined className="text-green-500" />}
                  styles={{ content: { fontSize: '36px', fontWeight: 800, color: '#166534' } }}
               />
            </Card>
         </Col>
         <Col xs={24} md={12}>
            <Card className="rounded-3xl shadow-sm border border-orange-100 bg-orange-50/50 hover:shadow-md transition-shadow">
               <Statistic 
                  title={<span className="text-gray-500 font-bold uppercase tracking-widest text-xs">Cần nhập thêm (Sắp hết hàng)</span>}
                  value={lowStockItems} 
                  prefix={<AlertOutlined className="text-orange-500" />}
                  styles={{ content: { fontSize: '36px', fontWeight: 800, color: '#9a3412' } }}
               />
            </Card>
         </Col>
      </Row>

      <Card variant="borderless" className="shadow-sm border border-gray-100 rounded-[24px] overflow-hidden">
        <Tabs defaultActiveKey="1" className="px-6 pt-4" items={[
          {
            key: '1',
            label: <span className="font-semibold text-base"><InboxOutlined /> Kho vật tư hiện tại</span>,
            children: (
              <>
                <div className="pb-6 pt-2 flex justify-between items-center">
                  <Input 
                    placeholder="Tìm kiếm vật tư theo tên hoặc phân loại..." 
                    prefix={<SearchOutlined className="text-gray-400" />}
                    className="w-full max-w-md h-12 rounded-xl border-gray-200"
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                </div>
                <Table 
                  columns={invColumns} 
                  dataSource={filteredData} 
                  rowKey="_id" 
                  loading={isInvLoading}
                  pagination={{ pageSize: 10 }}
                  className="premium-table-refined"
                />
              </>
            )
          },
          {
            key: '2',
            label: <span className="font-semibold text-base"><HistoryOutlined /> Lịch sử giao dịch & Cấp phát</span>,
            children: (
              <div className="pt-2">
                <Table 
                  columns={transColumns} 
                  dataSource={transactions} 
                  rowKey="_id" 
                  loading={isTransLoading}
                  pagination={{ pageSize: 10 }}
                  className="premium-table-refined"
                />
              </div>
            )
          }
        ]} />
      </Card>
    </div>
  );
};

export default FarmerInventory;
