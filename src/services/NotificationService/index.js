import http from '../01_axios';
import {
  apiGetNotifications,
  apiMarkNotificationAsRead,
  apiMarkAllNotificationsAsRead,
} from './urls';

export const getNotifications = () => http.get(apiGetNotifications);
export const markNotificationAsRead = id => http.put(apiMarkNotificationAsRead(id));
export const markAllNotificationsAsRead = () => http.put(apiMarkAllNotificationsAsRead);

const NotificationService = {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};

export default NotificationService;
