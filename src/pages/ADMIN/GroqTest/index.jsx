import React, { useState } from 'react';
import { Card, Button, Input, Alert, Spin, Typography, Space, Divider, Tag } from 'antd';
import { SendOutlined, RobotOutlined, CheckCircleOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { API_URL } from 'src/utils/helpers';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const GroqTest = () => {
    const [testMessage, setTestMessage] = useState('EBookFarm là gì?');
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState(null);
    const [testingConnection, setTestingConnection] = useState(false);

    const testConnection = async () => {
        setTestingConnection(true);
        setConnectionStatus(null);

        try {
            const res = await fetch(`${API_URL}/groq/test`);
            const data = await res.json();

            if (data.success) {
                setConnectionStatus({
                    type: 'success',
                    message: 'Kết nối Groq API thành công!',
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
            const res = await fetch(`${API_URL}/groq/chat`, {
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
        'Giá bao nhiêu?',
        'Nuôi tôm cần chú ý gì?',
        'Truy xuất nguồn gốc là gì?'
    ];

    return (
        <div className="p-6">
            <Title level={2}>
                <ThunderboltOutlined className="mr-2 text-green-500" />
                Groq AI Test Panel
                <Tag color="green" className="ml-2">FREE & FAST</Tag>
            </Title>
            
            <Paragraph>
                Trang này dùng để kiểm tra kết nối và chất lượng phản hồi của Groq Llama-3.1-8B (100% miễn phí).
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
                            <Text code>http://localhost:5000/api/groq/chat</Text>
                        </div>
                        
                        <div>
                            <Text strong>Model:</Text>
                            <br />
                            <Text code>llama-3.1-8b-instant</Text>
                            <Tag color="green" className="ml-2">FREE</Tag>
                        </div>

                        <div>
                            <Text strong>Speed:</Text>
                            <br />
                            <Text>⚡ 0.5-1.5 giây (siêu nhanh)</Text>
                        </div>

                        <Alert
                            type="success"
                            message="Groq - Lựa chọn tốt nhất!"
                            description={
                                <div>
                                    ✅ 100% miễn phí<br/>
                                    ⚡ Siêu nhanh (0.5s)<br/>
                                    🧠 Thông minh (Llama-3.1)<br/>
                                    🔒 Ổn định (99.9% uptime)<br/>
                                    🇻🇳 Hỗ trợ tiếng Việt tốt
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
                        <Card title="🤖 Phản hồi từ Groq AI" className="mt-4">
                            {loading ? (
                                <div className="text-center py-8">
                                    <Spin size="large" />
                                    <div className="mt-2">Đang xử lý siêu nhanh...</div>
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

            {/* Performance Stats */}
            <Card title="📊 Thống kê hiệu suất" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-500">FREE</div>
                        <div className="text-sm text-gray-500">Chi phí</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-500">0.5s</div>
                        <div className="text-sm text-gray-500">Tốc độ phản hồi</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-purple-500">8B</div>
                        <div className="text-sm text-gray-500">Tham số model</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-orange-500">99.9%</div>
                        <div className="text-sm text-gray-500">Uptime</div>
                    </div>
                </div>
            </Card>

            {/* Comparison */}
            <Card title="⚖️ So sánh với các AI khác" className="mt-6">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="border border-gray-300 p-2">AI Provider</th>
                                <th className="border border-gray-300 p-2">Chi phí</th>
                                <th className="border border-gray-300 p-2">Tốc độ</th>
                                <th className="border border-gray-300 p-2">Ổn định</th>
                                <th className="border border-gray-300 p-2">Thiết lập</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="bg-green-50">
                                <td className="border border-gray-300 p-2 font-bold">🏆 Groq</td>
                                <td className="border border-gray-300 p-2">✅ Miễn phí</td>
                                <td className="border border-gray-300 p-2">⚡ 0.5s</td>
                                <td className="border border-gray-300 p-2">✅ 99.9%</td>
                                <td className="border border-gray-300 p-2">✅ Đơn giản</td>
                            </tr>
                            <tr>
                                <td className="border border-gray-300 p-2">OpenAI GPT</td>
                                <td className="border border-gray-300 p-2">❌ $15/tháng</td>
                                <td className="border border-gray-300 p-2">⚠️ 2-3s</td>
                                <td className="border border-gray-300 p-2">✅ Ổn định</td>
                                <td className="border border-gray-300 p-2">⚠️ Cần billing</td>
                            </tr>
                            <tr>
                                <td className="border border-gray-300 p-2">Google Gemini</td>
                                <td className="border border-gray-300 p-2">⚠️ Giới hạn</td>
                                <td className="border border-gray-300 p-2">❌ 3-5s</td>
                                <td className="border border-gray-300 p-2">❌ Hay lỗi</td>
                                <td className="border border-gray-300 p-2">❌ Phức tạp</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default GroqTest;