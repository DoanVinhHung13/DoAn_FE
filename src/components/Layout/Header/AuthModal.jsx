import React, { useContext, useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Tabs, Typography } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { StoreContext } from 'src/contexts';
import authSession from 'src/services/core/authSession';
import notice from 'src/components/Notice';
import { ColorPrimary } from 'src/theme/GlobalThemeConfig';
import ROUTER from 'src/router/ROUTER';

const { Title, Text } = Typography;

const AuthModal = () => {
  const { authModalStore, loginStore } = useContext(StoreContext);
  const { authModal, setAuthModal } = authModalStore;
  const { setIsLoginContext } = loginStore;
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();

  // Effect to handle opening modal via navigation state (from ProtectedRoute)
  useEffect(() => {
    if (location.state?.openLogin) {
      setAuthModal({ open: true, type: 'login' });
      navigate(location.pathname + location.search, { replace: true });
      return;
    }

    const authTypeFromQuery = new URLSearchParams(location.search).get('auth');
    if (authTypeFromQuery === 'login' || authTypeFromQuery === 'register') {
      setAuthModal({ open: true, type: authTypeFromQuery });
      navigate(location.pathname, { replace: true });
    }
  }, [location.pathname, location.search, location.state, navigate, setAuthModal]);

  const handleCancel = () => {
    setAuthModal({ ...authModal, open: false });
    form.resetFields();
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Fake API Call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (authModal.type === 'login') {
        // Mock Auth logic
        if (values.username === 'admin' || values.username === 'user') {
          const fakeToken = "mock_token_" + Math.random().toString(36).substr(2);
          authSession.setSessionTokens({ accessToken: fakeToken, refreshToken: fakeToken });
          localStorage.setItem('mock_role', values.username); 
          setIsLoginContext(true);

          notice({ msg: "Login successful!", isSuccess: true });
          setAuthModal({ ...authModal, open: false });
          
          // Redirect logic
          const returnUrl = location.state?.returnUrl || (values.username === 'admin' ? ROUTER.ADMIN_DASHBOARD : ROUTER.USER_DASHBOARD);
          navigate(returnUrl, { replace: true });
        } else {
          notice({ msg: "Invalid credentials. Try admin or user.", isSuccess: false });
        }
      } else {
        // Register logic (Mock)
        notice({ msg: "Registration successful! You can now login.", isSuccess: true });
        setAuthModal({ open: true, type: 'login' });
      }
    } catch (error) {
      notice({ msg: "An error occurred", isSuccess: false });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={authModal.open}
      onCancel={handleCancel}
      footer={null}
      width={400}
      centered
      destroyOnClose
    >
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ color: ColorPrimary, margin: 0 }}>🌿 EbookFarm</Title>
        <Text type="secondary">Enterprise Agricultural System</Text>
      </div>

      <Tabs
        activeKey={authModal.type}
        onChange={(key) => setAuthModal({ ...authModal, type: key })}
        centered
        items={[
          {
            key: 'login',
            label: 'Sign In',
          },
          {
            key: 'register',
            label: 'Sign Up',
          },
        ]}
      />

      <Form
        form={form}
        name="auth_form"
        layout="vertical"
        onFinish={onFinish}
        style={{ marginTop: 20 }}
      >
        {authModal.type === 'register' && (
          <Form.Item
            name="email"
            rules={[{ required: true, type: 'email', message: 'Please input a valid Email!' }]}
          >
            <Input prefix={<MailOutlined />} placeholder="Email" size="large" />
          </Form.Item>
        )}

        <Form.Item
          name="username"
          rules={[{ required: true, message: 'Please input your Username!' }]}
        >
          <Input prefix={<UserOutlined />} placeholder="Username" size="large" />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ required: true, message: 'Please input your Password!' }]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Password" size="large" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" size="large" block loading={loading} style={{ background: ColorPrimary }}>
            {authModal.type === 'login' ? 'Login' : 'Register'}
          </Button>
        </Form.Item>

        {authModal.type === 'login' && (
          <div style={{ textAlign: 'center' }}>
            <Button type="link" onClick={() => notice({ msg: "Feature coming soon!", isSuccess: false })}>
              Forgot password?
            </Button>
          </div>
        )}
      </Form>
    </Modal>
  );
};

export default AuthModal;
