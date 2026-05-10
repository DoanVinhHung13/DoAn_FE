import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import authSession from 'src/services/core/authSession';
import notice from 'src/components/Notice';
import { ColorPrimary } from 'src/theme/GlobalThemeConfig';
import ROUTER from 'src/router/ROUTER';

const { Title } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Fake API Call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock Auth logic
      if (values.username === 'admin' || values.username === 'user') {
        const fakeToken = "mock_token_" + Math.random().toString(36).substr(2);
        authSession.setSessionTokens({ accessToken: fakeToken, refreshToken: fakeToken });
        // Set mock role depending on username for fake backend
        localStorage.setItem('mock_role', values.username); 
        
        // redirect to return URL or default role dashboard
        const returnUrl = location.state?.returnUrl || (values.username === 'admin' ? ROUTER.ADMIN_DASHBOARD : ROUTER.USER_DASHBOARD);
        navigate(returnUrl, { replace: true });
      }
    } catch (error) {
      notice({ msg: error?.messages?.[0] || error?.message, isSuccess: false });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5' }}>
      <Card style={{ width: 400, borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={2} style={{ color: ColorPrimary, margin: 0 }}>EbookFarm</Title>
          <div style={{ color: '#888' }}>Enterprise Electronic Journal</div>
        </div>
        
        <Form
          name="login_form"
          layout="vertical"
          initialValues={{ remember: true }}
          onFinish={onFinish}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Please input your Username!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Username (admin / user)" size="large" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your Password!' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Password (any)" size="large" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" size="large" block loading={loading} style={{ background: ColorPrimary }}>
              Sign In
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
