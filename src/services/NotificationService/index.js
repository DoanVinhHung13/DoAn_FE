import http from '../01_axios';
import {
  apiGetNotifications,
  apiMarkNotificationAsRead,
  apiMarkAllNotificationsAsRead,
  apiCreateNotification,
  apiGetAllUsers,
} from './urls';

export const getNotifications = (params = { PageIndex: 1, PageSize: 100 }) =>
  http.get(apiGetNotifications, { params });
export const markNotificationAsRead = id => http.post(apiMarkNotificationAsRead(id));
export const markAllNotificationsAsRead = () => http.post(apiMarkAllNotificationsAsRead);
export const createNotification = (data) => http.post(apiCreateNotification, data);
export const getAllUsers = (params = { PageIndex: 1, PageSize: 1000 }) =>
  http.get(apiGetAllUsers, { params });

const NotificationService = {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  createNotification,
  getAllUsers,
};

export default NotificationService;
