import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Space, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import JournalService from 'src/services/JournalService';
import notice from 'src/components/Notice';
import { ColorPrimary } from 'src/theme/GlobalThemeConfig';

const JournalManagement = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchJournals = async () => {
    setLoading(true);
    try {
      const res = await JournalService.getListJournal();
      if (res.Status === 0) {
        setData(res.Object.data);
      }
    } catch (error) {
      notice({ msg: error?.messages?.[0] || error?.message, isSuccess: false });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJournals();
  }, []);

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      const res = await JournalService.deleteJournal(id);
      notice({ msg: res?.Object || res?.message, isSuccess: res?.Status === 0 });
      fetchJournals();
    } catch (error) {
      notice({ msg: error?.messages?.[0] || error?.message, isSuccess: false });
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Crop', dataIndex: 'crop', key: 'crop' },
    { 
      title: 'Status', 
      dataIndex: 'status', 
      key: 'status',
      render: (status) => (
        <Tag color={status === 'Active' ? 'green' : 'default'}>{status}</Tag>
      )
    },
    { title: 'Start Date', dataIndex: 'startDate', key: 'startDate' },
    { title: 'Expected Harvest', dataIndex: 'expectedHarvest', key: 'expectedHarvest' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="text" icon={<EditOutlined style={{color: ColorPrimary}} />} />
          <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
        </Space>
      )
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontWeight: 600, margin: 0 }}>Electronic Journals</h2>
        <Button type="primary" icon={<PlusOutlined />} style={{ background: ColorPrimary }}>
          Create Journal
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

export default JournalManagement;
