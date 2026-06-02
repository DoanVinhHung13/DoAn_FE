import React, { useState, useEffect } from 'react';
import { 
    Card, 
    Button, 
    Input, 
    Alert, 
    Spin, 
    Descriptions, 
    Tag, 
    Space, 
    Divider, 
    Typography, 
    Row, 
    Col,
    message
} from 'antd';
import { 
    ExperimentOutlined, 
    ReloadOutlined, 
    RobotOutlined, 
    DatabaseOutlined,
    SearchOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons';
import { API_URL } from 'src/utils/helpers';

const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;

const RAGTest = () => {
    const [loading, setLoading] = useState(false);
    const [testResult, setTestResult] = useState(null);
    const [chatTest, setChatTest] = useState('');
    const [chatResult, setChatResult] = useState(null);
    const [chatLoading, setChatLoading] = useState(false);
    const [ragStats, setRagStats] = useState(null);

    // Test RAG system khi component mount
    useEffect(() => {
        testRAGSystem();
    }, []);

    const testRAGSystem = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/rag/test`);
            const data = await response.json();
            setTestResult(data);
            if (data.success && data.data) {
                setRagStats(data.data);
            }
        } catch (error) {
            console.error('RAG test error:', error);
            setTestResult({
                success: false,
                message: 'Không thể kết nối đến RAG system',
                error: error.message
            });
            message.error('Không thể kết nối đến RAG system');
        }
        setLoading(false);
    };

    const updateRAGData = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/rag/update`, {
                method: 'POST'
            });
            const data = await response.json();
            setTestResult(data);
            if (data.success && data.data) {
                setRagStats(data.data);
                message.success('Cập nhật RAG data thành công!');
            } else {
                message.error('Cập nhật RAG data thất bại');
            }
        } catch (error) {
            console.error('RAG update error:', error);
            message.error('Lỗi khi cập nhật RAG data');
        }
        setLoading(false);
    };

    const testRAGChat = async () => {
        if (!chatTest.trim()) {
            message.warning('Vui lòng nhập câu hỏi');
            return;
        }

        setChatLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/rag/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                body: JSON.stringify({
                    message: chatTest,
                    conversationHistory: []
                })
            });
            
            const data = await response.json();
            setChatResult(data);
            
            if (data.success) {
                message.success('RAG Chat thành công!');
            } else if (data.requireUpgrade) {
                message.warning('Đã hết lượt chat');
            } else {
                message.error('RAG Chat thất bại');
            }
        } catch (error) {
            console.error('RAG chat error:', error);
            setChatResult({
                success: false,
                message: 'Lỗi kết nối',
                error: error.message
            });
            message.error('Lỗi kết nối đến server');
        }
        setChatLoading(false);
    };

    const getStatusColor = (success) => {
        return success ? 'success' : 'error';
    };

    const getStatusIcon = (success) => {
        return success ? <CheckCircleOutlined /> : <ExclamationCircleOutlined />;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Chưa có';
        return new Date(dateString).toLocaleString('vi-VN');
    };

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: '24px' }}>
                <Title level={2}>
                    <RobotOutlined style={{ marginRight: '8px' }} />
                    RAG System Test
                </Title>
                <Paragraph>
                    Kiểm tra hệ thống RAG (Retrieval-Augmented Generation) - AI sử dụng dữ liệu thực từ database
                </Paragraph>
            </div>

            <Row gutter={[16, 16]}>
                {/* System Status */}
                <Col xs={24} lg={12}>
                    <Card 
                        title={
                            <Space>
                                <DatabaseOutlined />
                                Trạng thái RAG System
                            </Space>
                        }
                        extra={
                            <Space>
                                <Button 
                                    icon={<ExperimentOutlined />} 
                                    onClick={testRAGSystem}
                                    loading={loading}
                                >
                                    Test
                                </Button>
                                <Button 
                                    icon={<ReloadOutlined />} 
                                    onClick={updateRAGData}
                                    loading={loading}
                                    type="primary"
                                >
                                    Update Data
                                </Button>
                            </Space>
                        }
                    >
                        {loading && (
                            <div style={{ textAlign: 'center', padding: '32px 0' }}>
                                <Spin size="large" />
                                <div style={{ marginTop: '8px' }}>Đang kiểm tra RAG system...</div>
                            </div>
                        )}

                        {testResult && !loading && (
                            <>
                                <Alert
                                    type={getStatusColor(testResult.success)}
                                    message={testResult.message}
                                    icon={getStatusIcon(testResult.success)}
                                    style={{ marginBottom: '16px' }}
                                />

                                {ragStats && ragStats.stats && (
                                    <Descriptions bordered size="small">
                                        <Descriptions.Item label="Tổng Documents" span={3}>
                                            <Tag color="blue">{ragStats.stats.totalDocuments}</Tag>
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Trạng thái Index" span={3}>
                                            <Tag color={ragStats.stats.isIndexed ? 'green' : 'red'}>
                                                {ragStats.stats.isIndexed ? 'Đã Index' : 'Chưa Index'}
                                            </Tag>
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Loại dữ liệu" span={3}>
                                            <Space wrap>
                                                {Object.entries(ragStats.stats.typeBreakdown || {}).map(([type, count]) => (
                                                    <Tag key={type} color="geekblue">
                                                        {type}: {count}
                                                    </Tag>
                                                ))}
                                            </Space>
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Cập nhật lần cuối" span={3}>
                                            <Space>
                                                <ClockCircleOutlined />
                                                {formatDate(ragStats.lastUpdate)}
                                            </Space>
                                        </Descriptions.Item>
                                        {ragStats.testQuery && (
                                            <>
                                                <Descriptions.Item label="Test Query" span={3}>
                                                    <Text code>{ragStats.testQuery}</Text>
                                                </Descriptions.Item>
                                                <Descriptions.Item label="Kết quả tìm kiếm" span={3}>
                                                    <Tag color="orange">{ragStats.searchResults?.length || 0} documents</Tag>
                                                </Descriptions.Item>
                                            </>
                                        )}
                                    </Descriptions>
                                )}
                            </>
                        )}
                    </Card>
                </Col>

                {/* Chat Test */}
                <Col xs={24} lg={12}>
                    <Card 
                        title={
                            <Space>
                                <SearchOutlined />
                                Test RAG Chat
                            </Space>
                        }
                    >
                        <div style={{ marginBottom: '16px' }}>
                            <Text strong>Thử nghiệm câu hỏi:</Text>
                            <TextArea
                                value={chatTest}
                                onChange={(e) => setChatTest(e.target.value)}
                                placeholder="VD: Giá gói chuyên nghiệp bao nhiêu?"
                                rows={3}
                                style={{ marginTop: '8px' }}
                            />
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <Button 
                                type="primary" 
                                icon={<RobotOutlined />}
                                onClick={testRAGChat}
                                loading={chatLoading}
                                disabled={!chatTest.trim()}
                                block
                            >
                                Test RAG Chat
                            </Button>
                        </div>

                        {chatResult && (
                            <div>
                                <Divider>Kết quả</Divider>
                                
                                <Alert
                                    type={getStatusColor(chatResult.success)}
                                    message={chatResult.success ? 'Chat thành công' : 'Chat thất bại'}
                                    description={chatResult.message}
                                    style={{ marginBottom: '16px' }}
                                />

                                {chatResult.success && chatResult.data && (
                                    <>
                                        <div style={{ marginBottom: '16px' }}>
                                            <Text strong>Phản hồi AI:</Text>
                                            <div style={{ 
                                                marginTop: '8px', 
                                                padding: '12px', 
                                                backgroundColor: '#f5f5f5', 
                                                borderRadius: '6px',
                                                border: '1px solid #d9d9d9'
                                            }}>
                                                <Text>{chatResult.data.response}</Text>
                                            </div>
                                        </div>

                                        {chatResult.data.ragInfo && (
                                            <Descriptions size="small" bordered>
                                                <Descriptions.Item label="Documents tìm thấy" span={2}>
                                                    <Tag color="blue">{chatResult.data.ragInfo.documentsFound}</Tag>
                                                </Descriptions.Item>
                                                <Descriptions.Item label="Context cụ thể" span={1}>
                                                    <Tag color={chatResult.data.ragInfo.hasSpecificContext ? 'green' : 'orange'}>
                                                        {chatResult.data.ragInfo.hasSpecificContext ? 'Có' : 'Không'}
                                                    </Tag>
                                                </Descriptions.Item>
                                                <Descriptions.Item label="Model" span={2}>
                                                    <Tag>{chatResult.data.model}</Tag>
                                                </Descriptions.Item>
                                                <Descriptions.Item label="Chat Level" span={1}>
                                                    <Tag color="purple">{chatResult.data.chatLevel}</Tag>
                                                </Descriptions.Item>
                                                {chatResult.data.usage && (
                                                    <Descriptions.Item label="Token Usage" span={3}>
                                                        <Space>
                                                            <Tag>Input: {chatResult.data.usage.prompt_tokens}</Tag>
                                                            <Tag>Output: {chatResult.data.usage.completion_tokens}</Tag>
                                                            <Tag>Total: {chatResult.data.usage.total_tokens}</Tag>
                                                        </Space>
                                                    </Descriptions.Item>
                                                )}
                                            </Descriptions>
                                        )}
                                    </>
                                )}

                                {chatResult.ragFallback && (
                                    <Alert
                                        type="warning"
                                        message="RAG Fallback"
                                        description="RAG system gặp lỗi, đã chuyển sang phản hồi tĩnh"
                                        style={{ marginTop: '16px' }}
                                    />
                                )}

                                {chatResult.requireUpgrade && chatResult.upgradeInfo && (
                                    <Alert
                                        type="info"
                                        message="Cần nâng cấp"
                                        description={
                                            <div>
                                                <p>Đã hết lượt chat. Nâng cấp để có thêm quyền lợi:</p>
                                                <ul>
                                                    {chatResult.upgradeInfo.benefits?.map((benefit, index) => (
                                                        <li key={index}>{benefit}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        }
                                        style={{ marginTop: '16px' }}
                                    />
                                )}
                            </div>
                        )}
                    </Card>
                </Col>
            </Row>

            {/* Quick Test Buttons */}
            <Card title="Test nhanh" style={{ marginTop: '16px' }}>
                <Space wrap>
                    <Button onClick={() => setChatTest('Giá gói chuyên nghiệp bao nhiêu?')}>
                        Test Pricing
                    </Button>
                    <Button onClick={() => setChatTest('EBookFarm có những tính năng gì?')}>
                        Test Features
                    </Button>
                    <Button onClick={() => setChatTest('Làm sao để liên hệ hỗ trợ?')}>
                        Test Contact
                    </Button>
                    <Button onClick={() => setChatTest('Có hỗ trợ những tiêu chuẩn TCVN nào?')}>
                        Test TCVN
                    </Button>
                    <Button onClick={() => setChatTest('Có tin tức gì mới không?')}>
                        Test News
                    </Button>
                </Space>
            </Card>
        </div>
    );
};

export default RAGTest;