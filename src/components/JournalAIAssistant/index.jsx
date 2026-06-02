import React, { useState, useEffect } from 'react';
import {
    Card,
    Button,
    Alert,
    Spin,
    Tag,
    Space,
    Tooltip,
    Collapse,
    Badge,
    message
} from 'antd';
import {
    RobotOutlined,
    BulbOutlined,
    WarningOutlined,
    CheckCircleOutlined,
    ArrowRightOutlined,
    ThunderboltOutlined,
    EyeOutlined,
    CloseOutlined
} from '@ant-design/icons';

const { Panel } = Collapse;

const JournalAIAssistant = ({
    schemaId,
    currentData = {},
    activeField = null,
    onSuggestionApply = null,
    className = ""
}) => {
    const [suggestions, setSuggestions] = useState(null);
    const [quickSuggestions, setQuickSuggestions] = useState([]);
    const [riskAnalysis, setRiskAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [activeTab, setActiveTab] = useState('suggestions');

    // Lấy gợi ý khi có trường active
    useEffect(() => {
        if (activeField && schemaId) {
            getSuggestions();
        }
    }, [activeField, schemaId]);

    // Lấy gợi ý nhanh khi component mount
    useEffect(() => {
        if (schemaId) {
            getQuickSuggestions();
        }
    }, [schemaId]);

    // Phân tích rủi ro khi dữ liệu thay đổi
    useEffect(() => {
        if (Object.keys(currentData).length > 0 && schemaId) {
            analyzeRisks();
        }
    }, [currentData, schemaId]);

    const getSuggestions = async () => {
        if (!activeField) return;

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/journal-ai/suggestions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    schemaId,
                    currentData,
                    fieldName: activeField.name,
                    fieldValue: activeField.value
                })
            });

            const data = await response.json();
            if (data.success) {
                setSuggestions(data.data);
                setActiveTab('suggestions');
            } else {
                message.error('Không thể lấy gợi ý AI');
            }
        } catch (error) {
            console.error('AI Suggestions error:', error);
            message.error('Lỗi kết nối AI Assistant');
        }
        setLoading(false);
    };

    const getQuickSuggestions = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/journal-ai/quick-suggestions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    fieldType: 'general',
                    fieldName: 'general',
                    schemaCategory: 'general'
                })
            });

            const data = await response.json();
            if (data.success) {
                setQuickSuggestions(data.data.suggestions);
            }
        } catch (error) {
            console.error('Quick suggestions error:', error);
        }
    };

    const analyzeRisks = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/journal-ai/analyze-risks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    schemaId,
                    journalData: currentData
                })
            });

            const data = await response.json();
            if (data.success) {
                setRiskAnalysis(data.data);
            }
        } catch (error) {
            console.error('Risk analysis error:', error);
        }
    };

    const getRiskColor = (severity) => {
        switch (severity) {
            case 'high': return 'red';
            case 'medium': return 'orange';
            case 'low': return 'green';
            default: return 'blue';
        }
    };

    const getRiskIcon = (type) => {
        switch (type) {
            case 'disease': return '🦠';
            case 'environment': return '🌡️';
            case 'food_safety': return '🍽️';
            case 'compliance': return '📋';
            default: return '⚠️';
        }
    };

    if (!isVisible) {
        return (
            <div className="fixed bottom-4 right-4 z-50">
                <Button
                    type="primary"
                    shape="circle"
                    size="large"
                    icon={<RobotOutlined />}
                    onClick={() => setIsVisible(true)}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                />
            </div>
        );
    }

    return (
        <Card
            className={`ai-assistant-card ${className}`}
            style={{
                position: 'sticky',
                top: '100px',
                maxHeight: 'calc(100vh - 120px)',
                overflow: 'auto'
            }}
            title={
                <div className="flex items-center justify-between">
                    <Space>
                        <RobotOutlined className="text-blue-500" />
                        <span className="font-bold text-gray-800">AI Assistant</span>
                        <Tag color="blue" className="text-xs">Llama-3.1-8B</Tag>
                    </Space>
                    <Button
                        type="text"
                        size="small"
                        icon={<CloseOutlined />}
                        onClick={() => setIsVisible(false)}
                    />
                </div>
            }
            size="small"
        >
            <div className="space-y-4">
                {/* Tabs */}
                <div className="flex space-x-2">
                    <Button
                        size="small"
                        type={activeTab === 'suggestions' ? 'primary' : 'default'}
                        icon={<BulbOutlined />}
                        onClick={() => setActiveTab('suggestions')}
                    >
                        Gợi ý
                    </Button>
                    <Button
                        size="small"
                        type={activeTab === 'risks' ? 'primary' : 'default'}
                        icon={<WarningOutlined />}
                        onClick={() => setActiveTab('risks')}
                    >
                        Rủi ro
                        {riskAnalysis?.risks?.length > 0 && (
                            <Badge count={riskAnalysis.risks.length} size="small" />
                        )}
                    </Button>
                    <Button
                        size="small"
                        type={activeTab === 'quick' ? 'primary' : 'default'}
                        icon={<ThunderboltOutlined />}
                        onClick={() => setActiveTab('quick')}
                    >
                        Nhanh
                    </Button>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="text-center py-4">
                        <Spin size="small" />
                        <div className="text-xs text-gray-500 mt-2">AI đang phân tích...</div>
                    </div>
                )}

                {/* Suggestions Tab */}
                {activeTab === 'suggestions' && suggestions && !loading && (
                    <div className="space-y-3">
                        {activeField && (
                            <Alert
                                message={`Gợi ý cho: ${activeField.name}`}
                                type="info"
                                size="small"
                                showIcon
                            />
                        )}

                        {suggestions.suggestions?.length > 0 && (
                            <div>
                                <div className="text-xs font-semibold text-gray-600 mb-2 flex items-center">
                                    <BulbOutlined className="mr-1" />
                                    Gợi ý thông minh
                                </div>
                                <div className="space-y-2">
                                    {suggestions.suggestions.map((suggestion, index) => (
                                        <div
                                            key={index}
                                            className="p-2 bg-blue-50 rounded-lg border-l-4 border-blue-400 text-sm"
                                        >
                                            <div className="flex items-start justify-between">
                                                <span className="flex-1">{suggestion}</span>
                                                {onSuggestionApply && (
                                                    <Button
                                                        type="text"
                                                        size="small"
                                                        icon={<ArrowRightOutlined />}
                                                        onClick={() => onSuggestionApply(suggestion)}
                                                        className="ml-2"
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {suggestions.warnings?.length > 0 && (
                            <div>
                                <div className="text-xs font-semibold text-orange-600 mb-2 flex items-center">
                                    <WarningOutlined className="mr-1" />
                                    Cảnh báo
                                </div>
                                <div className="space-y-2">
                                    {suggestions.warnings.map((warning, index) => (
                                        <Alert
                                            key={index}
                                            message={warning}
                                            type="warning"
                                            size="small"
                                            showIcon
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {suggestions.reminders?.length > 0 && (
                            <div>
                                <div className="text-xs font-semibold text-green-600 mb-2 flex items-center">
                                    <CheckCircleOutlined className="mr-1" />
                                    Nhắc nhở
                                </div>
                                <div className="space-y-1">
                                    {suggestions.reminders.map((reminder, index) => (
                                        <div key={index} className="text-xs text-green-700 bg-green-50 p-2 rounded">
                                            • {reminder}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {suggestions.nextActions?.length > 0 && (
                            <div>
                                <div className="text-xs font-semibold text-purple-600 mb-2 flex items-center">
                                    <ArrowRightOutlined className="mr-1" />
                                    Hành động tiếp theo
                                </div>
                                <div className="space-y-1">
                                    {suggestions.nextActions.map((action, index) => (
                                        <div key={index} className="text-xs text-purple-700 bg-purple-50 p-2 rounded">
                                            {index + 1}. {action}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Risk Analysis Tab */}
                {activeTab === 'risks' && riskAnalysis && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-gray-600">Mức độ rủi ro tổng thể:</span>
                            <Tag color={getRiskColor(riskAnalysis.riskLevel)}>
                                {riskAnalysis.riskLevel.toUpperCase()}
                            </Tag>
                        </div>

                        {riskAnalysis.risks?.length > 0 ? (
                            <Collapse size="small" ghost>
                                {riskAnalysis.risks.map((risk, index) => (
                                    <Panel
                                        header={
                                            <div className="flex items-center justify-between w-full">
                                                <span className="text-sm">
                                                    {getRiskIcon(risk.type)} {risk.description}
                                                </span>
                                                <Tag color={getRiskColor(risk.severity)} size="small">
                                                    {risk.severity}
                                                </Tag>
                                            </div>
                                        }
                                        key={index}
                                    >
                                        <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                                            <strong>Khuyến nghị:</strong> {risk.recommendation}
                                        </div>
                                    </Panel>
                                ))}
                            </Collapse>
                        ) : (
                            <Alert
                                message="Không phát hiện rủi ro đặc biệt"
                                type="success"
                                size="small"
                                showIcon
                            />
                        )}
                    </div>
                )}

                {/* Quick Suggestions Tab */}
                {activeTab === 'quick' && (
                    <div className="space-y-2">
                        <div className="text-xs font-semibold text-gray-600 mb-2 flex items-center">
                            <ThunderboltOutlined className="mr-1" />
                            Gợi ý nhanh
                        </div>
                        {quickSuggestions.map((suggestion, index) => (
                            <div
                                key={index}
                                className="p-2 bg-gray-50 rounded text-xs border-l-4 border-gray-300"
                            >
                                • {suggestion}
                            </div>
                        ))}

                        <Button
                            size="small"
                            type="dashed"
                            block
                            icon={<EyeOutlined />}
                            onClick={analyzeRisks}
                        >
                            Phân tích rủi ro
                        </Button>
                    </div>
                )}

                {/* No data message */}
                {activeTab === 'suggestions' && !suggestions && !loading && (
                    <div className="text-center py-4 text-gray-500">
                        <RobotOutlined className="text-2xl mb-2" />
                        <div className="text-xs">
                            Nhấp vào trường nhập liệu để nhận gợi ý AI
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
};

export default JournalAIAssistant;