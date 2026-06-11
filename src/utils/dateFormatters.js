import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';

dayjs.extend(relativeTime);
dayjs.locale('vi');

export const formatDate = (date, format = 'DD/MM/YYYY') => {
  if (!date) return '---';
  return dayjs(date).format(format);
};

export const formatDateTime = (date, format = 'HH:mm - DD/MM/YYYY') => {
  if (!date) return '---';
  return dayjs(date).format(format);
};

export const timeAgo = (date) => {
  if (!date) return '---';
  return dayjs(date).fromNow();
};

export const parseDate = (date) => {
    if (!date) return null;
    return dayjs(date);
}
