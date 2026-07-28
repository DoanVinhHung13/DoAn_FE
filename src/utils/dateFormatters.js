import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import 'dayjs/locale/vi';

dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('vi');

export const getApplicationTimeZone = () =>
  (typeof window !== 'undefined' && window.env?.TIME_ZONE) ||
  import.meta.env.VITE_TIME_ZONE ||
  'UTC';

export const getLocalNow = () => dayjs.tz(undefined, getApplicationTimeZone());

const inConfiguredTimezone = (date) =>
  dayjs.utc(date).tz(getApplicationTimeZone());

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
