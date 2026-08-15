import React from 'react';
import { Input } from 'antd';
import { EnvironmentOutlined } from '@ant-design/icons';

export const formatAddress = ({ detailAddress, ward, province } = {}) =>
  [detailAddress, ward, province]
    .map((part) => (typeof part === 'string' ? part.trim() : ''))
    .filter(Boolean)
    .join(', ');

const LocationSelector = ({ value = {}, onChange, disabled = false }) => {
  const detailAddress = typeof value === 'string' ? value : (value?.detailAddress || formatAddress(value));

  const handleDetailChange = (e) => {
    const val = e.target.value;
    if (typeof value === 'object' && value !== null) {
      onChange?.({
        ...value,
        detailAddress: val,
      });
    } else {
      onChange?.(val);
    }
  };

  return (
    <Input
      prefix={<EnvironmentOutlined className="text-gray-400" />}
      placeholder="Nhập địa chỉ..."
      value={detailAddress}
      onChange={handleDetailChange}
      disabled={disabled}
      className="h-12 rounded-xl border-gray-200 hover:border-green-400 focus:border-green-500 transition-all"
    />
  );
};

export default LocationSelector;

