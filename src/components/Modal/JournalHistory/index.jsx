import React, { useState, useEffect } from 'react';
import { Modal, Timeline, Tag, Empty, Spin, Descriptions, Alert, Tabs } from 'antd';
import { ClockCircleOutlined, UserOutlined, EditOutlined, FileAddOutlined, CheckCircleOutlined } from '@ant-design/icons';
import api from 'src/services/01_axios';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';

dayjs.locale('vi');

const JournalHistoryModal = ({ visible, onClose, journalId }) => {
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [summary, setSummary] = useState(null);
  const [activeTab, setActiveTab] = useState('timeline');

  useEffect(() => {
    if (visible && journalId) {
      fetchHistory();
      fetchSummary();
    }
  }, [visible, journalId]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/journals/${journalId}/history`);
      setHistory(response.data.data.history);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await api.get(`/journals/${journalId}/history/summary`);
      setSummary(response.data.data);
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  const getActionIcon = (action) => {
    const icons = {
      'create': <FileAddOutlined className="text-green-600" />,
      'update': <EditOutlined className="text-blue-600" />,
      'status_change': <CheckCircleOutlined className="text-orange-600" />,
      'delete': <ClockCircleOutlined className="text-red-600" />
    };
    return icons[action] || <ClockCircleOutlined />;
  };

  const getActionColor = (action) => {
    const colors = {
      'create': 'success',
      'update': 'processing',
      'status_change': 'warning',
      'delete': 'error'
    };
    return colors[action] || 'default';
  };

  const renderTimeline = () => (
    <Timeline mode="left" className="mt-6">
      {history.map((item, index) => (
        <Timeline.Item
          key={item._id}
          dot={getActionIcon(item.action)}
          color={getActionColor(item.action)}
        >
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
              <div>
                <Tag color={getActionColor(item.action)} className="mb-2">
                  {item.actionLabel}
                </Tag>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <UserOutlined />
                  <span className="font-medium">{item.user.name}</span>
                  <span className="text-gray-400">•</span>
                  <ClockCircleOutlined />
                  <span>{dayjs(item.timestamp).format('DD/MM/YYYY HH:mm')}</span>
                </div>
              </div>
            </div>

            {/* Changes */}
            {item.changes && item.changes.length > 0 && (
              <div className="mt-3 space-y-2">
                {item.changes.map((change, idx) => (
                  <div key={idx} className="bg-white p-3 rounded border border-gray-100">
                    <div className="text-xs text-gray-500 mb-1">{change.table}</div>
                    <div className="font-medium text-gray-800 mb-2">{change.field}</div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="px-2 py-1 bg-red-50 text-red-700 rounded border border-red-200 line-through">
                        {change.oldValue || '(Trống)'}
                      </span>
                      <span className="text-gray-400">→</span>
                      <span className="px-2 py-1 bg-green-50 text-green-700 rounded border border-green-200 font-medium">
                        {change.newValue || '(Trống)'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Reason */}
            {item.reason && (
              <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded">
                <div className="text-xs text-blue-600 font-medium mb-1">Lý do:</div>
                <div className="text-sm text-blue-800">{item.reason}</div>
              </div>
            )}

            {/* Metadata */}
            {item.metadata && (
              <div className="mt-3 text-xs text-gray-400">
                {item.metadata.ipAddress && (
                  <span>IP: {item.metadata.ipAddress}</span>
                )}
              </div>
            )}
          </div>
        </Timeline.Item>
      ))}
    </Timeline>
  );

  const renderSummary = () => (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="text-2xl font-bold text-blue-600">{summary?.totalEdits || 0}</div>
          <div className="text-sm text-blue-800">Lần chỉnh sửa</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <div className="text-2xl font-bold text-orange-600">{summary?.statusChanges || 0}</div>
          <div className="text-sm text-orange-800">Thay đổi trạng thái</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="text-2xl font-bold text-green-600">{summary?.uniqueEditors || 0}</div>
          <div className="text-sm text-green-800">Người chỉnh sửa</div>
        </div>
      </div>

      {/* Journal Info */}
      {summary?.journal && (
        <Descriptions bordered size="small" column={1}>
          <Descriptions.Item label="Trạng thái hiện tại">
            <Tag color={getStatusColor(summary.journal.status)}>
              {getStatusLabel(summary.journal.status)}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Ngày tạo">
            {dayjs(summary.journal.createdAt).format('DD/MM/YYYY HH:mm')}
          </Descriptions.Item>
          <Descriptions.Item label="Tổng số lần sửa">
            {summary.journal.editCount || 0}
          </Descriptions.Item>
        </Descriptions>
      )}

      {/* Last Edit */}
      {summary?.lastEdit && (
        <Alert
          message="Chỉnh sửa gần nhất"
          description={
            <div className="mt-2">
              <div className="flex items-center gap-2 mb-1">
                <UserOutlined />
                <span className="font-medium">{summary.lastEdit.user}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <ClockCircleOutlined />
                <span>{dayjs(summary.lastEdit.timestamp).format('DD/MM/YYYY HH:mm')}</span>
              </div>
              <div className="mt-2">
                <Tag>{summary.lastEdit.action}</Tag>
              </div>
            </div>
          }
          type="info"
          showIcon
        />
      )}
    </div>
  );

  const getStatusColor = (status) => {
    const colors = {
      'Draft': 'default',
      'Submitted': 'processing',
      'Verified': 'success',
      'Locked': 'error',
      'Archived': 'default'
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'Draft': '📝 Nháp',
      'Submitted': '📤 Đã gửi',
      'Verified': '✅ Đã xác minh',
      'Locked': '🔒 Đã khóa',
      'Archived': '📦 Lưu trữ'
    };
    return labels[status] || status;
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <ClockCircleOutlined className="text-blue-600" />
          <span className="text-lg font-bold">Lịch sử chỉnh sửa</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
      styles={{ body: { maxHeight: '70vh', overflowY: 'auto' } }}
    >
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'timeline',
            label: 'Dòng thời gian',
            children: loading ? (
              <div className="flex justify-center items-center py-20">
                <Spin size="large" />
              </div>
            ) : history.length > 0 ? (
              renderTimeline()
            ) : (
              <Empty description="Chưa có lịch sử chỉnh sửa" />
            )
          },
          {
            key: 'summary',
            label: 'Tóm tắt',
            children: summary ? renderSummary() : (
              <div className="flex justify-center items-center py-20">
                <Spin size="large" />
              </div>
            )
          }
        ]}
      />
    </Modal>
  );
};

export default JournalHistoryModal;
