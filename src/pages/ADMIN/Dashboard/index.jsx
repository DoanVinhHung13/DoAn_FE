import React from 'react';
import { Row, Col, Card, Statistic, Table } from 'antd';
import { Sprout, Tractor, Warehouse, CheckCircle } from 'lucide-react';
import { ColorPrimary } from 'src/theme/GlobalThemeConfig';

const Dashboard = () => {
  const stats = [
    { title: 'Active Journals', value: 124, icon: <Sprout color={ColorPrimary} size={24} /> },
    { title: 'Harvesting Soon', value: 15, icon: <Tractor color={ColorPrimary} size={24} /> },
    { title: 'Low Inventory', value: 8, icon: <Warehouse color="#ef4444" size={24} /> },
    { title: 'Completed Batches', value: 432, icon: <CheckCircle color="#10b981" size={24} /> },
  ];

  const recentJournals = [
    { key: '1', id: 'JRN-001', crop: 'Tomato', status: 'Active', date: '2023-05-12' },
    { key: '2', id: 'JRN-002', crop: 'Rice', status: 'Completed', date: '2023-05-10' },
    { key: '3', id: 'JRN-003', crop: 'Cabbage', status: 'Active', date: '2023-05-09' },
  ];

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Crop', dataIndex: 'crop', key: 'crop' },
    { title: 'Status', dataIndex: 'status', key: 'status' },
    { title: 'Last Updated', dataIndex: 'date', key: 'date' },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 24, fontWeight: 600 }}>Farm Dashboard Overview</h2>
      <Row gutter={[16, 16]}>
        {stats.map((s, i) => (
          <Col xs={24} sm={12} md={6} key={i}>
            <Card style={{ borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Statistic title={s.title} value={s.value} />
                <div style={{ padding: 12, background: '#f0fdf4', borderRadius: '50%' }}>
                  {s.icon}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card title="Recent Journals" style={{ borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <Table dataSource={recentJournals} columns={columns} pagination={false} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
