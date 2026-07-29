import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import 'dayjs/locale/vi';

dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('vi');

const DEFAULT_TIME_ZONE = 'Asia/Ho_Chi_Minh';

export const getApplicationTimeZone = () =>
  (typeof window !== 'undefined' && window.env?.TIME_ZONE) ||
  import.meta.env.VITE_TIME_ZONE ||
  DEFAULT_TIME_ZONE;

export const getLocalNow = () => dayjs.tz(undefined, getApplicationTimeZone());

const inConfiguredTimezone = date => {
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return dayjs.tz(date, getApplicationTimeZone());
  }

  return dayjs.utc(date).tz(getApplicationTimeZone());
};

export const formatDateForApi = date => {
  if (!date) return null;
  if (dayjs.isDayjs(date)) return date.format('YYYY-MM-DD');
  return inConfiguredTimezone(date).format('YYYY-MM-DD');
};

export const formatDate = (date, format = 'DD/MM/YYYY') => {
  if (!date) return '---';
  return inConfiguredTimezone(date).format(format);
};

export const formatDateTime = (date, format = 'HH:mm - DD/MM/YYYY') => {
  if (!date) return '---';
  return inConfiguredTimezone(date).format(format);
};

export const timeAgo = (date) => {
  if (!date) return '---';
  return inConfiguredTimezone(date).fromNow();
};

export const parseDate = (date) => {
  if (!date) return null;
  return inConfiguredTimezone(date);
};
