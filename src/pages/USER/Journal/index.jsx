import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Typography, Tag, Button, Spin } from 'antd';
import { PlusOutlined, BookOutlined } from '@ant-design/icons';
import JournalService from 'src/services/JournalService';
import notice from 'src/components/Notice';
import { ColorPrimary } from 'src/theme/GlobalThemeConfig';
import EmptyState from 'src/components/Common/EmptyState';

const { Title, Text } = Typography;

const UserJournal = () => {
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
      notice({ msg: "Error fetching your journals", isSuccess: false });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJournals();
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontWeight: 600, margin: 0 }}>My Production Journals</h2>
        <Button type="primary" icon={<PlusOutlined />} style={{ background: ColorPrimary }}>
          New Journal
        </Button>
      </div>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px 0' }}><Spin size="large" /></div>
      ) : data.length === 0 ? (
        <EmptyState description="No journals found. Start farming today!" onAction={() => {}} buttonText="Create First Journal" />
      ) : (
        <Row gutter={[16, 16]}>
          {data.map(journal => (
            <Col xs={24} sm={12} md={8} lg={6} key={journal.id}>
              <Card 
                hoverable 
                style={{ borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
                actions={[
                  <Button type="link" icon={<BookOutlined />} style={{ color: ColorPrimary }}>Open Log</Button>
                ]}
              >
                <Card.Meta 
                  title={<div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{journal.name}</span>
                  </div>}
                  description={
                    <div style={{ marginTop: 12 }}>
                      <p style={{ margin: '4px 0' }}><Text type="secondary">Crop:</Text> {journal.crop}</p>
                      <p style={{ margin: '4px 0' }}><Text type="secondary">Status:</Text> <Tag color={journal.status === 'Active' ? 'green' : 'default'}>{journal.status}</Tag></p>
                      <p style={{ margin: '4px 0' }}><Text type="secondary">Start Date:</Text> {journal.startDate}</p>
                    </div>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default UserJournal;
