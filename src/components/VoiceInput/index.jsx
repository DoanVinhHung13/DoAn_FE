import React, { useState, useEffect } from 'react';
import { Button, Tooltip, message } from 'antd';
import { AudioOutlined, AudioMutedOutlined, LoadingOutlined } from '@ant-design/icons';

const VoiceInput = ({ onSpeechEnd, targetField }) => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.lang = 'vi-VN';
      recognitionInstance.interimResults = false;
      recognitionInstance.maxAlternatives = 1;

      recognitionInstance.onresult = (event) => {
        const speechToText = event.results[0][0].transcript;
        onSpeechEnd(speechToText);
        setIsListening(false);
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          message.error('Vui lòng cấp quyền truy cập Micro để sử dụng tính năng này.');
        } else {
          message.error('Lỗi nhận diện giọng nói: ' + event.error);
        }
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, [onSpeechEnd]);

  const toggleListening = () => {
    if (!recognition) {
      message.error('Trình duyệt của bạn không hỗ trợ nhận diện giọng nói (Web Speech API).');
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
      setIsListening(true);
      message.info(`Đang lắng nghe giọng nói cho trường "${targetField}"...`);
    }
  };

  return (
    <Tooltip title={isListening ? 'Dừng lắng nghe' : 'Nhập liệu bằng giọng nói (Tiếng Việt)'}>
      <Button 
        type={isListening ? 'primary' : 'default'}
        shape="circle" 
        icon={isListening ? <LoadingOutlined /> : <AudioOutlined />} 
        onClick={toggleListening}
        danger={isListening}
        className={isListening ? 'animate-pulse' : ''}
        size="small"
      />
    </Tooltip>
  );
};

export default VoiceInput;
