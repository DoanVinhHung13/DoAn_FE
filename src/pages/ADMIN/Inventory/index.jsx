import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Space, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import InventoryService from 'src/services/InventoryService';
import notice from 'src/components/Notice';
import { ColorPrimary } from 'src/theme/GlobalThemeConfig';

const InventoryManagement = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await InventoryService.getListInventory();
      if (res.Status === 0) {
        setData(res.Object);
      }
    } catch (error) {
      notice({ msg: "Error fetching inventory", isSuccess: false });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: 'Item Name', dataIndex: 'name', key: 'name' },
    { 
      title: 'Category', 
      dataIndex: 'category', 
      key: 'category',
      render: (cat) => <Tag color={cat === 'Fertilizer' ? 'blue' : cat === 'Seeds' ? 'green' : 'orange'}>{cat}</Tag>
    },
    { 
      title: 'Quantity', 
      key: 'quantity',
      render: (_, record) => `${record.quantity} ${record.unit}`
    },
    { title: 'Last Updated', dataIndex: 'lastUpdated', key: 'lastUpdated' },
    {
      title: 'Actions',
      key: 'actions',
      render: () => (
        <Space>
          <Button type="text" icon={<EditOutlined style={{color: ColorPrimary}} />} />
          <Button type="text" danger icon={<DeleteOutlined />} />
        </Space>
      )
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontWeight: 600, margin: 0 }}>Inventory Master</h2>
        <Button type="primary" icon={<PlusOutlined />} style={{ background: ColorPrimary }}>
          Add Item
        </Button>
      </div>
      
      <Card style={{ borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <Table 
          columns={columns} 
          dataSource={data} 
          rowKey="id" 
          loading={loading}
        />
      </Card>
    </div>
  );
};

export default InventoryManagement;
