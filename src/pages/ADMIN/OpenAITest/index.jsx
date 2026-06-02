import React, { useState } from 'react';
import { Card, Button, Input, Alert, Spin, Typography, Space, Divider } from 'antd';
import { SendOutlined, RobotOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { API_URL } from 'src/utils/helpers';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const OpenAITest = () => {
    const [testMessage, setTestMessage] = useState('EBookFarm là gì?');
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState(null);
    const [testingConnection, setTestingConnection] = useState(false);

    const testConnection = async () => {
        setTestingConnection(true);
        setConnectionStatus(null);

        try {
            const res = await fetch(`${API_URL}/openai/test`);
            const data = await res.json();

            if (data.success) {
                setConnectionStatus({
                    type: 'success',
                    message: 'Kết nối OpenAI API thành công!',
                    details: data.data
                });
            } else {
                setConnectionStatus({
                    type: 'error',
                    message: data.message,
                    details: data.error
                });
            }
        } catch (error) {
            setConnectionStatus({
                type: 'error',
                message: 'Không thể kết nối đến server',
                details: error.message
            });
        } finally {
            setTestingConnection(false);
        }
    };

    const sendTestMessage = async () => {
        if (!testMessage.trim()) return;

        setLoading(true);
        setResponse('');

        try {
            const res = await fetch(`${API_URL}/openai/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: testMessage,
                    conversationHistory: []
                })
            });

            const data = await res.json();

            if (data.success) {
                setResponse(data.data.response);
            } else {
                setResponse(`Lỗi: ${data.message}\n\nFallback: ${data.fallbackResponse || 'Không có'}`);
            }
        } catch (error) {
            setResponse(`Lỗi kết nối: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const quickTests = [
        'EBookFarm là gì?',
        'EBookFarm có tính năng gì?',
        'TCVN 12827:2023 là gì?',
        'Làm sao để trồng cà chua an toàn?',
        'VietGAP khác GlobalGAP như thế nào?',
        'Giá bao nhiêu?'
    ];

    return (
        <div className="p-6">
            <Title level={2}>
                <RobotOutlined className="mr-2" />
                OpenAI GPT Test Panel
            </Title>
            
            <Paragraph>
                Trang này dùng để kiểm tra kết nối và chất lượng phản hồi của OpenAI GPT-4o-mini.
            </Paragraph>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Connection Test */}
                <Card title="🔗 Kiểm tra kết nối" className="h-fit">
                    <Space direction="vertical" className="w-full">
                        <Button 
                            type="primary" 
                            onClick={testConnection}
                            loading={testingConnection}
                            icon={<CheckCircleOutlined />}
                            block
                        >
                            Test Connection
                        </Button>

                        {connectionStatus && (
                            <Alert
                                type={connectionStatus.type}
                                message={connectionStatus.message}
                                description={
                                    connectionStatus.details && (
                                        <div>
                                            {connectionStatus.type === 'success' ? (
                                                <div>
                                                    <Text strong>Model:</Text> {connectionStatus.details.model}<br/>
                                                    <Text strong>Usage:</Text> {JSON.stringify(connectionStatus.details.usage)}<br/>
                                                    <Text strong>Response:</Text> {connectionStatus.details.response?.substring(0, 200)}...
                                                </div>
                                            ) : (
                                                <Text code>{connectionStatus.details}</Text>
                                            )}
                                        </div>
                                    )
                                }
                                showIcon
                            />
                        )}
                    </Space>
                </Card>

                {/* API Configuration */}
                <Card title="⚙️ Cấu hình API" className="h-fit">
                    <Space direction="vertical" className="w-full">
                        <div>
                            <Text strong>Endpoint:</Text>
                            <br />
                            <Text code>http://localhost:5000/api/openai/chat</Text>
                        </div>
                        
                        <div>
                            <Text strong>Model:</Text>
                            <br />
                            <Text code>gpt-4o-mini</Text>
                        </div>

                        <div>
                            <Text strong>API Key:</Text>
                            <br />
                            <Text code>
                                {process.env.REACT_APP_OPENAI_API_KEY ? 
                                    `${process.env.REACT_APP_OPENAI_API_KEY.substring(0, 10)}...` : 
                                    'Cấu hình trong backend/.env'
                                }
                            </Text>
                        </div>

                        <Alert
                            type="info"
                            message="Hướng dẫn cấu hình"
                            description={
                                <div>
                                    1. Truy cập <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">OpenAI API Keys</a><br/>
                                    2. Tạo API key mới<br/>
                                    3. Thêm vào <Text code>backend/.env</Text>:<br/>
                                    <Text code>OPENAI_API_KEY=sk-...</Text>
                                </div>
                            }
                            showIcon
                        />
                    </Space>
                </Card>
            </div>

            <Divider />

            {/* Chat Test */}
            <Card title="💬 Test Chat" className="mt-6">
                <Space direction="vertical" className="w-full">
                    <div>
                        <Text strong>Tin nhắn test:</Text>
                        <TextArea
                            value={testMessage}
                            onChange={(e) => setTestMessage(e.target.value)}
                            placeholder="Nhập tin nhắn để test..."
                            rows={3}
                            className="mt-2"
                        />
                    </div>

                    <div>
                        <Text strong>Quick Tests:</Text>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {quickTests.map((test, index) => (
                                <Button
                                    key={index}
                                    size="small"
                                    onClick={() => setTestMessage(test)}
                                    className="mb-2"
                                >
                                    {test}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <Button
                        type="primary"
                        icon={<SendOutlined />}
                        onClick={sendTestMessage}
                        loading={loading}
                        disabled={!testMessage.trim()}
                        size="large"
                    >
                        Gửi Test
                    </Button>

                    {(response || loading) && (
                        <Card title="🤖 Phản hồi từ AI" className="mt-4">
                            {loading ? (
                                <div className="text-center py-8">
                                    <Spin size="large" />
                                    <div className="mt-2">Đang xử lý...</div>
                                </div>
                            ) : (
                                <div className="whitespace-pre-wrap bg-gray-50 p-4 rounded border">
                                    {response}
                                </div>
                            )}
                        </Card>
                    )}
                </Space>
            </Card>

            {/* Usage Tips */}
            <Card title="💡 Lưu ý sử dụng" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Text strong className="text-green-600">✅ Ưu điểm OpenAI GPT:</Text>
                        <ul className="mt-2 ml-4">
                            <li>API ổn định, ít lỗi</li>
                            <li>Hỗ trợ tiếng Việt tốt</li>
                            <li>Phản hồi nhanh (1-3 giây)</li>
                            <li>Chi phí hợp lý ($0.15/1M tokens)</li>
                            <li>Tài liệu API rõ ràng</li>
                        </ul>
                    </div>
                    
                    <div>
                        <Text strong className="text-orange-600">⚠️ Lưu ý:</Text>
                        <ul className="mt-2 ml-4">
                            <li>Cần API key có phí</li>
                            <li>Giới hạn rate limit</li>
                            <li>Cần internet để hoạt động</li>
                            <li>Dữ liệu gửi lên OpenAI</li>
                        </ul>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default OpenAITest;