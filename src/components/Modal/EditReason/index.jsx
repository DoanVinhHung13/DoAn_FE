import React, { useState } from 'react';
import { Modal, Input, Alert, Form } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const { TextArea } = Input;

const EditReasonModal = ({ visible, onConfirm, onCancel, journalStatus }) => {
  const [reason, setReason] = useState('');
  const [form] = Form.useForm();

  const handleOk = () => {
    if (!reason.trim()) {
      return;
    }
    onConfirm(reason);
    setReason('');
    form.resetFields();
  };

  const handleCancel = () => {
    setReason('');
    form.resetFields();
    onCancel();
  };

  const getStatusMessage = (status) => {
    const messages = {
      'Submitted': 'Nhật ký đã được gửi xác nhận. Mọi thay đổi sẽ được ghi lại trong lịch sử.',
      'Verified': 'Nhật ký đã được xác minh. Chỉ kỹ thuật viên và quản trị viên mới có thể chỉnh sửa.',
      'Locked': 'Nhật ký đã bị khóa. Chỉ quản trị viên mới có thể chỉnh sửa.'
    };
    return messages[status] || 'Nhật ký này yêu cầu ghi rõ lý do khi chỉnh sửa.';
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <ExclamationCircleOutlined className="text-orange-500 text-xl" />
          <span className="text-lg font-bold">Xác nhận chỉnh sửa</span>
        </div>
      }
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      okText="Xác nhận sửa"
      cancelText="Hủy"
      okButtonProps={{
        disabled: !reason.trim(),
        className: 'bg-orange-500 hover:bg-orange-600'
      }}
      width={500}
    >
      <div className="space-y-4">
        {/* Warning Alert */}
        <Alert
          message="Cảnh báo"
          description={getStatusMessage(journalStatus)}
          type="warning"
          showIcon
          icon={<ExclamationCircleOutlined />}
        />

        {/* Reason Input */}
        <Form form={form} layout="vertical">
          <Form.Item
            label={<span className="font-medium">Lý do chỉnh sửa</span>}
            name="reason"
            rules={[
              { required: true, message: 'Vui lòng nhập lý do chỉnh sửa' },
              { min: 10, message: 'Lý do phải có ít nhất 10 ký tự' }
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Ví dụ: Nhập sai số lượng, cần cập nhật thông tin chính xác..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={500}
              showCount
            />
          </Form.Item>
        </Form>

        {/* Info */}
        <div className="bg-blue-50 p-3 rounded border border-blue-200">
          <div className="text-sm text-blue-800">
            <strong>Lưu ý:</strong>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Lý do sẽ được lưu vào lịch sử chỉnh sửa</li>
              <li>Mọi người có quyền xem lịch sử đều có thể thấy lý do này</li>
              <li>Hãy ghi rõ ràng và trung thực</li>
            </ul>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default EditReasonModal;
