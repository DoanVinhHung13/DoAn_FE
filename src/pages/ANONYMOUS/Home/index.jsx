import React, { useContext } from 'react';
import { Button, Row, Col, Card, Typography } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import { ColorPrimary } from 'src/theme/GlobalThemeConfig';
import { Leaf, ShieldCheck, Activity } from 'lucide-react';
import { StoreContext } from 'src/contexts';

const { Title, Paragraph } = Typography;

const Home = () => {
  const { authModalStore } = useContext(StoreContext);
  const { setAuthModal } = authModalStore;

  const features = [
    {
      title: 'Electronic Journals',
      description: 'Easily track your planting, fertilizing, and harvesting logs digitally with mobile-friendly interfaces.',
      icon: <Leaf color={ColorPrimary} size={32} />
    },
    {
      title: 'Quality Assurance',
      description: 'Built-in food safety assessment forms ensuring compliance with global agricultural standards.',
      icon: <ShieldCheck color={ColorPrimary} size={32} />
    },
    {
      title: 'Real-time Analytics',
      description: 'Monitor your farm\'s health, inventory levels, and predicted harvest outputs all in one dashboard.',
      icon: <Activity color={ColorPrimary} size={32} />
    }
  ];

  return (
    <div style={{ padding: '0 24px' }}>
      {/* Hero Section */}
      <div style={{ textAlign: 'center', padding: '80px 20px', background: '#ecfdf5', borderRadius: '16px', marginTop: 24 }}>
        <Title level={1} style={{ fontSize: '3rem', color: '#065f46', marginBottom: 24 }}>
          Welcome to <span style={{ color: ColorPrimary }}>EbookFarm</span>
        </Title>
        <Paragraph style={{ fontSize: '1.25rem', color: '#047857', maxWidth: 600, margin: '0 auto 32px' }}>
          The modern electronic agricultural journal system. Digitize your farm, improve traceability, and grow smarter.
        </Paragraph>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
          <Button 
            type="primary" 
            size="large" 
            icon={<ArrowRightOutlined />} 
            style={{ background: ColorPrimary, height: 48, padding: '0 32px', fontSize: 16 }}
            onClick={() => setAuthModal({ open: true, type: 'register' })}
          >
            Get Started
          </Button>
          <Button 
            size="large" 
            style={{ height: 48, padding: '0 32px', fontSize: 16 }}
            onClick={() => setAuthModal({ open: true, type: 'login' })}
          >
            Login
          </Button>
        </div>
      </div>

      {/* Features Section */}
      <div style={{ padding: '80px 0' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <Title level={2}>Why Choose EbookFarm?</Title>
          <Paragraph type="secondary">Everything you need to manage your agricultural production effectively.</Paragraph>
        </div>
        <Row gutter={[32, 32]} justify="center">
          {features.map((item, index) => (
            <Col xs={24} sm={24} md={8} key={index}>
              <Card 
                hoverable 
                style={{ height: '100%', borderRadius: 12, textAlign: 'center', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
              >
                <div style={{ marginBottom: 16, background: '#f0fdf4', display: 'inline-block', padding: 16, borderRadius: '50%' }}>
                  {item.icon}
                </div>
                <Title level={4}>{item.title}</Title>
                <Paragraph type="secondary">{item.description}</Paragraph>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* CTA Section */}
      <div style={{ background: ColorPrimary, padding: '64px 24px', borderRadius: '16px', textAlign: 'center', color: '#fff', marginBottom: 64 }}>
        <Title level={2} style={{ color: '#fff' }}>Ready to digitize your farm?</Title>
        <Paragraph style={{ color: '#d1fae5', fontSize: '1.1rem', marginBottom: 32 }}>
          Join thousands of modern farmers tracking their yields globally.
        </Paragraph>
        <Button 
          size="large" 
          style={{ height: 48, padding: '0 48px', fontSize: 16, color: ColorPrimary, fontWeight: 'bold' }}
          onClick={() => setAuthModal({ open: true, type: 'register' })}
        >
          Create Free Account
        </Button>
      </div>
    </div>
  );
};

export default Home;
