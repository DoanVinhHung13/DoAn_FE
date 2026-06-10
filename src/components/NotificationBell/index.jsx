import React, { useState, useEffect } from 'react';
import { Badge, Popover, List, Typography, Button, Empty, Spin, message, Tag } from 'antd';
import { BellOutlined, CheckOutlined, LoadingOutlined, EyeOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from 'src/services/NotificationService';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import ROUTER from 'src/router/ROUTER';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const { Text } = Typography;

const NotificationBell = () => {
   
};

export default NotificationBell;
