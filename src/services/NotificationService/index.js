import http from '../01_axios';
import {
  apiGetNotifications,
  apiMarkNotificationAsRead,
  apiMarkAllNotificationsAsRead,
} from './urls';

export const getNotifications = (params = { PageIndex: 1, PageSize: 100 }) =>
  http.get(apiGetNotifications, { params });
export const markNotificationAsRead = id => http.post(apiMarkNotificationAsRead(id));
export const markAllNotificationsAsRead = () => http.post(apiMarkAllNotificationsAsRead);

const NotificationService = {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};

export default NotificationService;
