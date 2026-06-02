import React, { useState, useRef, useEffect } from 'react';
import { Button, Input, Avatar, Badge, Tooltip, Alert, Progress, QRCode } from 'antd';
import {
    MessageOutlined,
    SendOutlined,
    CloseOutlined,
    RobotOutlined,
    UserOutlined,
    CrownOutlined,
    LoginOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { API_URL } from 'src/utils/helpers';
import './index.css';

const { TextArea } = Input;

const AIChatWidget = () => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'bot',
            text: 'Xin chào! 👋 Tôi là trợ lý ảo của EBookFarm. Tôi có thể giúp gì cho bạn?',
            timestamp: new Date()
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [hasNewMessage, setHasNewMessage] = useState(false);
    const [showWelcome, setShowWelcome] = useState(true);
    const [chatInfo, setChatInfo] = useState(null);
    const [showUpgradeAlert, setShowUpgradeAlert] = useState(false);
    const messagesEndRef = useRef(null);

    // Lấy thông tin user từ localStorage
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    // Lấy thông tin chat khi mở widget
    useEffect(() => {
        if (isOpen && !chatInfo) {
            fetchChatInfo();
        }
    }, [isOpen]);

    const fetchChatInfo = async () => {
        try {
            const headers = {
                'Content-Type': 'application/json'
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${API_URL}/chat/my-info`, {
                headers
            });

            const data = await response.json();
            if (data.success) {
                setChatInfo(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch chat info:', error);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const quickReplies = [
        '📋 Tính năng của hệ thống',
        '💰 Bảng giá dịch vụ',
        '📞 Liên hệ tư vấn',
        '🎓 Hướng dẫn sử dụng'
    ];

    const botResponses = {
        'greeting': 'Xin chào! 😊 Rất vui được hỗ trợ bạn. Tôi có thể giúp bạn tìm hiểu về:\n\n✅ Tính năng hệ thống\n💰 Bảng giá dịch vụ\n📞 Thông tin liên hệ\n🎓 Hướng dẫn sử dụng\n\nBạn quan tâm đến vấn đề nào?',
        'tính năng': 'EBookFarm cung cấp giải pháp toàn diện:\n\n📝 **Nhật ký sản xuất điện tử**\n• Ghi chép trên mobile/web\n• Lưu trữ đám mây an toàn\n• Báo cáo tự động\n\n🔍 **Truy xuất nguồn gốc QR**\n• Tạo mã QR cho từng lô hàng\n• Người tiêu dùng quét để xem thông tin\n• Tuân thủ TCVN 35+ tiêu chuẩn\n\n⛓️ **Quản lý chuỗi cung ứng**\n• Kết nối nhà cung cấp - nông trại - HTX\n• Kiểm soát chất lượng toàn chuỗi\n• Báo cáo & phân tích\n\nBạn muốn demo thử không?',
        'giá': '💰 **Bảng giá linh hoạt theo nhu cầu:**\n\n🌱 **Gói Cơ bản** - Từ 500k/tháng\n• Phù hợp nông hộ nhỏ (< 5ha)\n• Nhật ký điện tử cơ bản\n• 100 mã QR/tháng\n\n🌿 **Gói Chuyên nghiệp** - Từ 2tr/tháng\n• Cho HTX và trang trại (5-50ha)\n• Đầy đủ tính năng\n• 1000 mã QR/tháng\n• Hỗ trợ ưu tiên\n\n🌳 **Gói Doanh nghiệp** - Báo giá riêng\n• Giải pháp toàn diện\n• Tùy chỉnh theo yêu cầu\n• Không giới hạn\n• Đào tạo & hỗ trợ 24/7\n\n📞 Gọi 1900 xxxx để nhận ưu đãi!',
        'liên hệ': '📞 **Liên hệ với chúng tôi:**\n\n☎️ **Hotline:** 1900 xxxx\n📧 **Email:** contact@ebookfarm.vn\n🌐 **Website:** ebookfarm.vn\n🏢 **Văn phòng:** [Địa chỉ]\n\n⏰ **Giờ làm việc:**\nT2-T6: 8:00 - 17:30\nT7: 8:00 - 12:00\n\n💬 Hoặc để lại thông tin, chúng tôi sẽ gọi lại trong 30 phút!',
        'hướng dẫn': '📚 **Tài liệu & Hỗ trợ:**\n\n🎥 **Video hướng dẫn**\n• Cài đặt & thiết lập ban đầu\n• Ghi nhật ký sản xuất\n• Tạo mã QR truy xuất\n• Quản lý chuỗi cung ứng\n\n📖 **Tài liệu PDF**\n• Hướng dẫn chi tiết từng tính năng\n• FAQ - Câu hỏi thường gặp\n• Best practices\n\n👨‍🏫 **Đào tạo trực tiếp**\n• Đào tạo tại văn phòng\n• Đào tạo tại nông trại\n• Webinar online\n\n🆘 **Hỗ trợ 24/7**\n• Hotline: 1900 xxxx\n• Live chat\n• Email support\n\nBạn muốn nhận tài liệu nào?',
        'tcvn': '📋 **Tiêu chuẩn TCVN:**\n\nHệ thống tuân thủ 35+ tiêu chuẩn TCVN về truy xuất nguồn gốc:\n\n🥬 Rau quả: TCVN 12827:2023\n🐷 Thịt lợn: TCVN 13166-4:2020\n☕ Cà phê: TCVN 13840:2023\n🐟 Thủy sản: TCVN 13841:2023\n🌾 Gạo: TCVN 13842:2023\n\nVà nhiều tiêu chuẩn khác...\n\n✅ Đảm bảo xuất khẩu quốc tế\n✅ Minh bạch 100%\n✅ Tích hợp Cổng TXNG Quốc gia',
        'demo': '🎯 **Đăng ký Demo miễn phí:**\n\nChúng tôi sẽ:\n✅ Giới thiệu chi tiết hệ thống\n✅ Demo trực tiếp các tính năng\n✅ Tư vấn giải pháp phù hợp\n✅ Báo giá chi tiết\n\n⏱️ Thời gian: 30-45 phút\n📍 Hình thức: Online hoặc tại văn phòng\n\n📞 Gọi ngay 1900 xxxx hoặc để lại SĐT, chúng tôi sẽ liên hệ!',
        'thanks': 'Cảm ơn bạn đã quan tâm đến EBookFarm! 🙏\n\nNếu cần hỗ trợ thêm, đừng ngại liên hệ:\n📞 Hotline: 1900 xxxx\n📧 Email: contact@ebookfarm.vn\n\nChúc bạn một ngày tốt lành! 🌟',
        'default': 'Cảm ơn bạn đã liên hệ! 😊\n\nTôi chưa hiểu rõ câu hỏi của bạn. Bạn có thể:\n\n1️⃣ Chọn câu hỏi gợi ý bên dưới\n2️⃣ Gọi hotline: 1900 xxxx\n3️⃣ Email: contact@ebookfarm.vn\n\nHoặc hỏi tôi về:\n• Tính năng hệ thống\n• Bảng giá\n• Hướng dẫn sử dụng\n• Tiêu chuẩn TCVN\n• Đăng ký demo'
    };

    const getBotResponse = (userMessage) => {
        const message = userMessage.toLowerCase();

        // Greetings
        if (message.match(/^(xin chào|chào|hello|hi|hey)/)) {
            return botResponses['greeting'];
        }
        // Features
        else if (message.includes('tính năng') || message.includes('chức năng') || message.includes('làm được gì') || message.includes('có gì')) {
            return botResponses['tính năng'];
        }
        // Pricing
        else if (message.includes('giá') || message.includes('chi phí') || message.includes('bao nhiêu') || message.includes('phí')) {
            return botResponses['giá'];
        }
        // Contact
        else if (message.includes('liên hệ') || message.includes('gọi') || message.includes('số điện thoại') || message.includes('email')) {
            return botResponses['liên hệ'];
        }
        // Guide
        else if (message.includes('hướng dẫn') || message.includes('cách dùng') || message.includes('sử dụng') || message.includes('tài liệu')) {
            return botResponses['hướng dẫn'];
        }
        // TCVN
        else if (message.includes('tcvn') || message.includes('tiêu chuẩn') || message.includes('chứng nhận')) {
            return botResponses['tcvn'];
        }
        // Demo
        else if (message.includes('demo') || message.includes('dùng thử') || message.includes('trải nghiệm')) {
            return botResponses['demo'];
        }
        // Thanks
        else if (message.includes('cảm ơn') || message.includes('thanks') || message.includes('thank')) {
            return botResponses['thanks'];
        }
        // Default
        else {
            return null;
        }
    };

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;

        const userMessage = {
            id: messages.length + 1,
            type: 'user',
            text: inputValue,
            timestamp: new Date()
        };

        setMessages([...messages, userMessage]);
        setInputValue('');
        setIsTyping(true);
        setShowUpgradeAlert(false);

        // 1. Check local predefined responses first for instant reply
        const localResponse = getBotResponse(inputValue);
        if (localResponse) {
            setTimeout(() => {
                const botMessage = {
                    id: messages.length + 2,
                    type: 'bot',
                    text: localResponse,
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, botMessage]);
                setIsTyping(false);
            }, 500); // Short realistic typing delay
            return;
        }

        // 2. Call AI API for complex queries
        try {
            const headers = {
                'Content-Type': 'application/json'
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            // Call RAG API (Real Data + AI!)
            const response = await fetch(`${API_URL}/rag/chat`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    message: inputValue,
                    conversationHistory: messages.slice(-10) // Send last 10 messages for context
                })
            });

            const data = await response.json();

            let botResponseText;
            if (data.success && data.data && data.data.response) {
                botResponseText = data.data.response;

                // Cập nhật thông tin chat
                if (data.data.chatLevel && data.data.remainingChats !== undefined) {
                    setChatInfo(prev => ({
                        ...prev,
                        chatLevel: data.data.chatLevel,
                        remainingChats: data.data.remainingChats,
                        dailyUsed: prev ? prev.dailyUsed + 1 : 1
                    }));
                }
            } else if (data.requireUpgrade) {
                // Hết lượt chat
                botResponseText = data.message;
                setShowUpgradeAlert(true);
                setChatInfo(prev => ({
                    ...prev,
                    upgradeInfo: data.upgradeInfo
                }));
            } else if (data.fallbackResponse) {
                botResponseText = data.fallbackResponse;
            } else {
                botResponseText = 'Xin lỗi, tôi đang gặp sự cố. Vui lòng thử lại sau hoặc liên hệ hotline: 1900 xxxx';
            }

            const botMessage = {
                id: messages.length + 2,
                type: 'bot',
                text: botResponseText,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, botMessage]);
            setIsTyping(false);

        } catch (error) {
            console.error('Chat error:', error);

            // Fallback to local response if API fails
            const botMessage = {
                id: messages.length + 2,
                type: 'bot',
                text: getBotResponse(inputValue) || botResponses['default'],
                timestamp: new Date()
            };

            setMessages(prev => [...prev, botMessage]);
            setIsTyping(false);
        }
    };

    const handleQuickReply = (reply) => {
        setInputValue(reply);
        setTimeout(() => handleSendMessage(), 100);
    };

    const toggleChat = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            setHasNewMessage(false);
            fetchChatInfo();
        }
    };

    const getChatLevelIcon = (level) => {
        switch (level) {
            case 'admin':
            case 'vip':
                return <CrownOutlined className="text-yellow-400" />;
            case 'user':
                return <UserOutlined className="text-blue-400" />;
            default:
                return <UserOutlined className="text-gray-400" />;
        }
    };

    const getChatLevelColor = (level) => {
        switch (level) {
            case 'admin':
            case 'vip':
                return 'gold';
            case 'user':
                return 'blue';
            default:
                return 'default';
        }
    };

    const getChatLevelText = (level) => {
        switch (level) {
            case 'admin':
                return 'Admin';
            case 'vip':
                return 'VIP';
            case 'user':
                return 'User';
            default:
                return 'Guest';
        }
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <>
            {/* Welcome Tooltip */}
            {!isOpen && hasNewMessage && (
                <div className="ai-chat-welcome-tooltip">
                    <div className="ai-chat-welcome-content">
                        <div className="font-bold mb-1">👋 Xin chào!</div>
                        <div className="text-sm">Tôi có thể giúp gì cho bạn?</div>
                    </div>
                    <Button
                        type="text"
                        size="small"
                        icon={<CloseOutlined />}
                        onClick={() => setHasNewMessage(false)}
                        className="ai-chat-welcome-close"
                    />
                </div>
            )}

            {/* Chat Widget Button */}
            <div className="ai-chat-widget-container">
                {!isOpen && (
                    <Tooltip title="Chat với AI Assistant" placement="left">
                        <Badge dot={hasNewMessage} offset={[-5, 5]}>
                            <Button
                                type="primary"
                                shape="circle"
                                size="large"
                                icon={<MessageOutlined />}
                                onClick={toggleChat}
                                className="ai-chat-toggle-btn"
                            />
                        </Badge>
                    </Tooltip>
                )}

                {/* Chat Window */}
                {isOpen && (
                    <div className="ai-chat-window">
                        {/* Header */}
                        <div className="ai-chat-header">
                            <div className="flex items-center gap-3">
                                <Avatar
                                    size={40}
                                    icon={<RobotOutlined />}
                                    className="bg-gradient-to-br from-green-400 to-blue-500"
                                />
                                <div>
                                    <div className="font-bold text-white flex items-center gap-2">
                                        AI Assistant
                                    </div>
                                    <div className="text-xs text-green-100 flex items-center gap-1">
                                        <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></span>
                                        Đang hoạt động

                                    </div>
                                </div>
                            </div>
                            <Button
                                type="text"
                                icon={<CloseOutlined />}
                                onClick={toggleChat}
                                className="text-white hover:bg-white/20"
                            />
                        </div>

                        {/* Messages */}
                        <div className="ai-chat-messages">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`ai-chat-message ${message.type === 'user' ? 'user' : 'bot'}`}
                                >
                                    {message.type === 'bot' && (
                                        <Avatar
                                            size={32}
                                            icon={<RobotOutlined />}
                                            className="bg-gradient-to-br from-green-400 to-blue-500 shrink-0"
                                        />
                                    )}
                                    <div className="ai-chat-message-content">
                                        <div className="ai-chat-message-bubble">
                                            {message.type === 'bot' ? (
                                                <ReactMarkdown
                                                    className="markdown-body"
                                                    components={{
                                                        img: ({ node, alt, src, ...props }) => {
                                                            if (alt === 'QR') {
                                                                const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;
                                                                const qrUrl = src ? src.replace('https://ebookfarm.vn', baseUrl) : `${baseUrl}/trace/demo-qr-123`;
                                                                
                                                                return (
                                                                    <div className="flex flex-col items-center justify-center bg-white p-4 my-4 rounded-xl border border-gray-200 shadow-sm">
                                                                        <QRCode value={qrUrl} size={150} />
                                                                        <div className="text-[11px] font-bold text-gray-400 mt-3 uppercase tracking-wider">Quét mã QR Demo</div>
                                                                    </div>
                                                                );
                                                            }
                                                            return <img src={src} alt={alt} {...props} className="max-w-full rounded-lg my-2" />;
                                                        }
                                                    }}
                                                >
                                                    {message.text}
                                                </ReactMarkdown>
                                            ) : (
                                                message.text
                                            )}
                                        </div>
                                        <div className="ai-chat-message-time">
                                            {formatTime(message.timestamp)}
                                        </div>
                                    </div>
                                    {message.type === 'user' && (
                                        <Avatar
                                            size={32}
                                            icon={<UserOutlined />}
                                            className="bg-blue-500 shrink-0"
                                        />
                                    )}
                                </div>
                            ))}

                            {isTyping && (
                                <div className="ai-chat-message bot">
                                    <Avatar
                                        size={32}
                                        icon={<RobotOutlined />}
                                        className="bg-gradient-to-br from-green-400 to-blue-500 shrink-0"
                                    />
                                    <div className="ai-chat-message-content">
                                        <div className="ai-chat-typing">
                                            <span></span>
                                            <span></span>
                                            <span></span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Quick Replies */}
                        {messages.length <= 2 && (
                            <div className="ai-chat-quick-replies">
                                {quickReplies.map((reply, index) => (
                                    <Button
                                        key={index}
                                        size="small"
                                        className="ai-chat-quick-reply-btn"
                                        onClick={() => handleQuickReply(reply)}
                                    >
                                        {reply}
                                    </Button>
                                ))}
                            </div>
                        )}

                        {/* Input */}
                        <div className="ai-chat-input">
                            <TextArea
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onPressEnter={(e) => {
                                    if (!e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage();
                                    }
                                }}
                                placeholder="Nhập tin nhắn..."
                                autoSize={{ minRows: 1, maxRows: 3 }}
                                className="ai-chat-textarea"
                            />
                            <Button
                                type="primary"
                                icon={<SendOutlined />}
                                onClick={handleSendMessage}
                                disabled={!inputValue.trim()}
                                className="ai-chat-send-btn"
                            />
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default AIChatWidget;
