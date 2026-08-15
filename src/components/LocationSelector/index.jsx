import React, { useState, useEffect } from 'react';
import { Select, Spin, Input, Typography } from 'antd';
import { EnvironmentOutlined } from '@ant-design/icons';
import { getProvinces, getWardsByProvince } from 'src/services/LocationService';

const { Option } = Select;
const { Text } = Typography;

/** Serialize UI-only address parts for the legacy string field. */
export const formatAddress = ({ detailAddress, ward, province } = {}) =>
  [detailAddress, ward, province]
    .map((part) => (typeof part === 'string' ? part.trim() : ''))
    .filter(Boolean)
    .join(', ');

const findTrailingLocation = (address, locations) => {
  const normalizedAddress = address.trim().toLocaleLowerCase('vi-VN');
  return [...locations]
    .sort((a, b) => b.name.length - a.name.length)
    .find((location) => normalizedAddress.endsWith(location.name.toLocaleLowerCase('vi-VN')));
};

const removeTrailingLocation = (address, locationName) =>
  address.slice(0, -locationName.length).replace(/[\s,]+$/, '').trim();

/**
 * Component chọn địa phương Việt Nam (sau sáp nhập 07/2025)
 * Cấu trúc mới: Tỉnh/Thành phố → Phường/Xã (bỏ cấp Quận/Huyện)
 *
 * @param {Object} props
 * @param {Object} props.value  - { province, ward, detailAddress }
 * @param {Function} props.onChange
 * @param {boolean} props.disabled
 */
const LocationSelector = ({ value = {}, onChange, disabled = false }) => {
  const [provinces, setProvinces] = useState([]);
  const [wards, setWards] = useState([]);

  const [selectedProvinceCode, setSelectedProvinceCode] = useState(null);
  const [provinceTouched, setProvinceTouched] = useState(false);

  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

  // Load danh sách tỉnh/thành
  useEffect(() => {
    const fetch = async () => {
      setLoadingProvinces(true);
      const data = await getProvinces();
      setProvinces(data);
      setLoadingProvinces(false);
    };
    fetch();
  }, []);

  useEffect(() => {
    if (!value.province || !provinces.length) return;
    const province = provinces.find((item) => item.name === value.province);
    if (province && province.code !== selectedProvinceCode) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedProvinceCode(province.code);
    }
  }, [value.province, provinces, selectedProvinceCode]);

  // Address records created before this selector are still one string. Split
  // a known "detail, ward, province" value once so edit forms can prefill all
  // three controls without changing the persisted database format.
  useEffect(() => {
    const storedAddress = value.detailAddress?.trim();
    if (!storedAddress || value.province || !provinces.length) return undefined;

    const province = findTrailingLocation(storedAddress, provinces);
    if (!province) return undefined;

    let active = true;
    const detailWithoutProvince = removeTrailingLocation(storedAddress, province.name);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedProvinceCode(province.code);

    getWardsByProvince(province.code).then((provinceWards) => {
      if (!active) return;

      const ward = findTrailingLocation(detailWithoutProvince, provinceWards);
      onChange?.({
        ...value,
        detailAddress: ward
          ? removeTrailingLocation(detailWithoutProvince, ward.name)
          : detailWithoutProvince,
        province: province.name,
        ward: ward?.name || null,
      });
    });

    return () => {
      active = false;
    };
  }, [onChange, provinces, value]);

  // Load phường/xã khi chọn tỉnh
  useEffect(() => {
    const fetch = async () => {
      if (selectedProvinceCode) {
        setLoadingWards(true);
        const data = await getWardsByProvince(selectedProvinceCode);
        setWards(data);
        setLoadingWards(false);
      } else {
        setWards([]);
      }
    };
    fetch();
  }, [selectedProvinceCode]);

  const handleProvinceChange = (val, option) => {
    setProvinceTouched(true);
    setSelectedProvinceCode(option?.code || null);
    setWards([]);
    onChange?.({
      ...value,
      province: option?.name || null,
      ward: null,
    });
  };

  const handleWardChange = (val, option) => {
    onChange?.({
      ...value,
      ward: option?.name || null,
    });
  };

  const handleDetailChange = (e) => {
    onChange?.({
      ...value,
      detailAddress: e.target.value,
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tỉnh / Thành phố */}
        <div className="flex flex-col gap-2">
          <Text className="text-gray-600 font-medium">
            Tỉnh/Thành phố <span className="text-red-500">*</span>
          </Text>
          <Select
            placeholder="Chọn tỉnh/thành phố"
            value={value.province || undefined}
            onChange={handleProvinceChange}
            allowClear
            showSearch
            disabled={disabled}
            loading={loadingProvinces}
            notFoundContent={loadingProvinces ? <Spin size="small" /> : 'Không tìm thấy'}
            filterOption={(input, option) =>
              (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
            }
            className="h-12 rounded-xl"
            status={provinceTouched && !value.province ? 'error' : ''}
            onDropdownVisibleChange={(open) => { if (!open && !value.province) setProvinceTouched(true) }}
          >
            {provinces.map((p) => (
              <Option value={p.name} key={p.code} code={p.code} name={p.name}>
                {p.name}
              </Option>
            ))}
          </Select>
          {provinceTouched && !value.province && (
            <span className="text-red-500 text-xs">Vui lòng chọn tỉnh/thành phố</span>
          )}
        </div>

        {/* Phường / Xã (trực tiếp từ tỉnh, không qua huyện) */}
        <div className="flex flex-col gap-2">
          <Text className="text-gray-600 font-medium">
            Phường/Xã
            {!selectedProvinceCode && (
              <span className="text-gray-400 text-xs font-normal ml-1">(chọn tỉnh trước)</span>
            )}
          </Text>
          <Select
            placeholder="Chọn phường/xã"
            value={value.ward || undefined}
            onChange={handleWardChange}
            allowClear
            showSearch
            disabled={disabled || !selectedProvinceCode}
            loading={loadingWards}
            notFoundContent={loadingWards ? <Spin size="small" /> : 'Không tìm thấy'}
            filterOption={(input, option) =>
              (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
            }
            className="h-12 rounded-xl"
          >
            {wards.map((w) => (
              <Option value={w.name} key={w.code} code={w.code} name={w.name}>
                {w.name}
              </Option>
            ))}
          </Select>
        </div>
      </div>

      {/* Địa chỉ chi tiết */}
      <div className="flex flex-col gap-2">
        <Text className="text-gray-600 font-medium">Địa chỉ chi tiết</Text>
        <Input
          prefix={<EnvironmentOutlined className="text-gray-400" />}
          placeholder="Số nhà, tên đường, thôn/xóm..."
          value={value.detailAddress}
          onChange={handleDetailChange}
          disabled={disabled}
          className="h-12 rounded-xl border-gray-200 hover:border-green-400 focus:border-green-500 transition-all"
        />
      </div>
    </div>
  );
};

export default LocationSelector;
