import http from '../01_axios';
import {
  apiGetNotifications,
  apiGetNotificationById,
  apiMarkNotificationAsRead,
  apiMarkAllNotificationsAsRead,
  apiCreateNotification,
  apiGetAllUsers,
  apiGetSentNotifications,
} from './urls';

export const getNotifications = (params = { PageIndex: 1, PageSize: 20 }) =>
  http.get(apiGetNotifications, { params });
export const getNotificationById = (id) => http.get(apiGetNotificationById(id));
export const markNotificationAsRead = id => http.post(apiMarkNotificationAsRead(id));
export const markAllNotificationsAsRead = () => http.post(apiMarkAllNotificationsAsRead);
export const createNotification = (data) => http.post(apiCreateNotification, data);
export const getAllUsers = (params = { PageIndex: 1, PageSize: 100 }) =>
  http.get(apiGetAllUsers, { params });
export const getSentNotifications = (params = { PageIndex: 1, PageSize: 20 }) =>
  http.get(apiGetSentNotifications, { params });

const NotificationService = {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  createNotification,
  getAllUsers,
  getSentNotifications,
};

export default NotificationService;
