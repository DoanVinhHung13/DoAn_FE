import React, { useState } from 'react';
import { Card, Button, Input, message, Space, Tag, Divider, Alert } from 'antd';
import { RobotOutlined, SendOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { API_URL } from 'src/utils/helpers';

const { TextArea } = Input;

const GeminiTest = () => {
    const [testMessage, setTestMessage] = useState('Xin chào, bạn có thể giới thiệu về EBookFarm không?');
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState(null);
    const [testingConnection, setTestingConnection] = useState(false);

    const testConnection = async () => {
        setTestingConnection(true);
        try {
            const res = await fetch(`${API_URL}/gemini/test`);
            const data = await res.json();

            if (data.success) {
                setConnectionStatus('success');
                message.success('Kết nối Gemini API thành công!');
            } else {
                setConnectionStatus('error');
                message.error(data.message || 'Không thể kết nối đến Gemini API');
            }
        } catch (error) {
            setConnectionStatus('error');
            message.error('Lỗi kết nối: ' + error.message);
        } finally {
            setTestingConnection(false);
        }
    };

    const testChat = async () => {
        if (!testMessage.trim()) {
            message.warning('Vui lòng nhập tin nhắn test!');
            return;
        }

        setLoading(true);
        setResponse('');

        try {
            const res = await fetch(`${API_URL}/gemini/chat`, {
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

            if (data.success && data.data) {
                setResponse(data.data.response);
                message.success('Nhận được phản hồi từ Gemini AI!');
            } else if (data.fallbackResponse) {
                setResponse(data.fallbackResponse);
                message.warning('Sử dụng phản hồi dự phòng (API chưa cấu hình)');
            } else {
                message.error(data.message || 'Có lỗi xảy ra');
            }
        } catch (error) {
            message.error('Lỗi: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <Card
                title={
                    <div className="flex items-center gap-3">
                        <RobotOutlined className="text-2xl text-blue-600" />
                        <span>Test Gemini AI API</span>
                    </div>
                }
                extra={
                    <Tag color="blue">Gemini 1.5 Pro</Tag>
                }
            >
                <Space direction="vertical" size="large" className="w-full">
                    {/* Connection Test */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-bold m-0">1. Kiểm tra kết nối API</h3>
                            {connectionStatus === 'success' && (
                                <Tag icon={<CheckCircleOutlined />} color="success">
                                    Đã kết nối
                                </Tag>
                            )}
                            {connectionStatus === 'error' && (
                                <Tag icon={<CloseCircleOutlined />} color="error">
                                    Lỗi kết nối
                                </Tag>
                            )}
                        </div>
                        <Button
                            type="primary"
                            onClick={testConnection}
                            loading={testingConnection}
                            icon={<CheckCircleOutlined />}
                        >
                            Test Connection
                        </Button>
                    </div>

                    <Divider />

                    {/* Chat Test */}
                    <div>
                        <h3 className="text-lg font-bold mb-3">2. Test Chat với AI</h3>
                        
                        <Alert
                            message="Hướng dẫn"
                            description={
                                <div>
                                    <p className="mb-2">Để sử dụng Gemini API, bạn cần:</p>
                                    <ol className="list-decimal ml-4">
                                        <li>Lấy API key từ: <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600">Google AI Studio</a></li>
                                        <li>Thêm vào file <code className="bg-gray-100 px-2 py-1 rounded">backend/.env</code>: <code className="bg-gray-100 px-2 py-1 rounded">GEMINI_API_KEY=your_key_here</code></li>
                                        <li>Khởi động lại server: <code className="bg-gray-100 px-2 py-1 rounded">npm run dev</code></li>
                                    </ol>
                                    <p className="mt-2 text-sm text-gray-600">
                                        Xem chi tiết trong file: <code className="bg-gray-100 px-2 py-1 rounded">backend/GEMINI_API_SETUP.md</code>
                                    </p>
                                </div>
                            }
                            type="info"
                            showIcon
                            className="mb-4"
                        />

                        <div className="space-y-3">
                            <div>
                                <label className="block mb-2 font-medium">Tin nhắn test:</label>
                                <TextArea
                                    value={testMessage}
                                    onChange={(e) => setTestMessage(e.target.value)}
                                    placeholder="Nhập tin nhắn để test..."
                                    rows={3}
                                />
                            </div>

                            <Button
                                type="primary"
                                onClick={testChat}
                                loading={loading}
                                icon={<SendOutlined />}
                                size="large"
                            >
                                Gửi tin nhắn
                            </Button>

                            {response && (
                                <div>
                                    <label className="block mb-2 font-medium">Phản hồi từ AI:</label>
                                    <Card className="bg-gray-50">
                                        <pre className="whitespace-pre-wrap font-sans text-sm">
                                            {response}
                                        </pre>
                                    </Card>
                                </div>
                            )}
                        </div>
                    </div>

                    <Divider />

                    {/* Quick Test Examples */}
                    <div>
                        <h3 className="text-lg font-bold mb-3">3. Câu hỏi mẫu</h3>
                        <Space wrap>
                            <Button onClick={() => setTestMessage('Xin chào, bạn là ai?')}>
                                Chào hỏi
                            </Button>
                            <Button onClick={() => setTestMessage('EBookFarm có những tính năng gì?')}>
                                Tính năng
                            </Button>
                            <Button onClick={() => setTestMessage('Bảng giá dịch vụ như thế nào?')}>
                                Giá cả
                            </Button>
                            <Button onClick={() => setTestMessage('Làm sao để liên hệ với EBookFarm?')}>
                                Liên hệ
                            </Button>
                            <Button onClick={() => setTestMessage('TCVN là gì?')}>
                                TCVN
                            </Button>
                        </Space>
                    </div>

                    <Divider />

                    {/* API Info */}
                    <div>
                        <h3 className="text-lg font-bold mb-3">4. Thông tin API</h3>
                        <div className="bg-gray-50 p-4 rounded">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-sm text-gray-600">Model</div>
                                    <div className="font-bold">Gemini 1.5 Pro</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-600">Endpoint</div>
                                    <div className="font-mono text-sm">/api/gemini/chat</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-600">Free Tier</div>
                                    <div className="font-bold">15 requests/phút</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-600">Daily Limit</div>
                                    <div className="font-bold">1,500 requests/ngày</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Space>
            </Card>
        </div>
    );
};

export default GeminiTest;
