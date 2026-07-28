import React from 'react';
import { Button, Input, Card, Space, Table } from 'antd';
import { PlusOutlined, DeleteOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';


/**
 * Component quản lý các giai đoạn sinh trưởng của cây
 * @param {Array} value - Danh sách giai đoạn từ form
 * @param {Function} onChange - Callback khi thay đổi
 */
const GrowthStages = ({ value = [], onChange, readonly = false }) => {
  const handleAddStage = () => {
    const newStage = {
      id: `temp-${Date.now()}`,
      stageName: '',
      durationDays: 0,
      orderIndex: value.length + 1,
      description: '',
    };
    onChange([...value, newStage]);
  };

  const handleRemoveStage = (index) => {
    const newValue = value.filter((_, i) => i !== index).map((item, i) => ({
      ...item,
      orderIndex: i + 1,
    }));
    onChange(newValue);
  };

  const handleUpdateStage = (index, field, val) => {
    const newValue = [...value];
    newValue[index] = { ...newValue[index], [field]: val };
    onChange(newValue);
  };

  const handleMove = (index, direction) => {
    if (direction === 'up' && index > 0) {
      const newValue = [...value];
      const temp = newValue[index];
      newValue[index] = newValue[index - 1];
      newValue[index - 1] = temp;
      
      // Update orderIndex
      newValue[index].orderIndex = index + 1;
      newValue[index - 1].orderIndex = index;
      onChange(newValue);
    } else if (direction === 'down' && index < value.length - 1) {
      const newValue = [...value];
      const temp = newValue[index];
      newValue[index] = newValue[index + 1];
      newValue[index + 1] = temp;
      
      // Update orderIndex
      newValue[index].orderIndex = index + 1;
      newValue[index + 1].orderIndex = index + 2;
      onChange(newValue);
    }
  };

  if (readonly) {
    const columns = [
      {
        title: 'Thứ tự',
        dataIndex: 'orderIndex',
        key: 'orderIndex',
        width: 80,
        align: 'center',
        render: (text) => <span className="font-semibold">{text}</span>,
      },
      {
        title: 'Tên giai đoạn',
        dataIndex: 'stageName',
        key: 'stageName',
        width: 250,
        render: (text) => <span className="font-medium text-green-700">{text || 'Chưa cập nhật'}</span>,
      },
      {
        title: 'Mô tả',
        dataIndex: 'description',
        key: 'description',
        render: (text) => <div className="whitespace-pre-wrap">{text || 'Không có mô tả'}</div>,
      },
    ];

    return (
      <Card className="rounded-lg shadow-sm" title={<span className="text-lg font-semibold text-green-600">Các Giai Đoạn Sinh Trưởng</span>}>
        <Table 
          columns={columns} 
          dataSource={value.map((v, i) => ({ ...v, key: v.id || i }))} 
          pagination={false}
          bordered
          size="middle"
        />
      </Card>
    );
  }

  return (
    <Card className="rounded-lg shadow-sm" title={<span className="text-lg font-semibold text-green-600">Các Giai Đoạn Sinh Trưởng</span>}>
      <div className="space-y-4">
        {value.map((stage, index) => (
          <div key={stage.id || index} className="border border-gray-200 rounded-lg p-4 bg-gray-50/50">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="mb-1 text-sm font-medium text-gray-700">Tên giai đoạn</div>
                  <Input
                    value={stage.stageName}
                    onChange={(e) => handleUpdateStage(index, 'stageName', e.target.value)}
                    placeholder="VD: Nảy mầm, Ra lá..."
                    className="h-10 rounded-lg"
                  />
                </div>
               
                <div className="md:col-span-2">
                  <div className="mb-1 text-sm font-medium text-gray-700">Mô tả</div>
                  <Input.TextArea
                    value={stage.description}
                    onChange={(e) => handleUpdateStage(index, 'description', e.target.value)}
                    placeholder="Mô tả chi tiết giai đoạn"
                    rows={2}
                    className="rounded-lg"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Space size={2} direction="vertical">
                  <Button
                    type="text"
                    size="small"
                    icon={<ArrowUpOutlined />}
                    disabled={index === 0}
                    onClick={() => handleMove(index, 'up')}
                    className="text-gray-500"
                  />
                  <Button
                    type="text"
                    size="small"
                    icon={<ArrowDownOutlined />}
                    disabled={index === value.length - 1}
                    onClick={() => handleMove(index, 'down')}
                    className="text-gray-500"
                  />
                </Space>
                <Button
                  danger
                  type="text"
                  icon={<DeleteOutlined />}
                  onClick={() => handleRemoveStage(index)}
                  className="mt-2"
                />
              </div>
            </div>
            
            <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">
              Thứ tự: {stage.orderIndex}
            </div>
          </div>
        ))}

        <Button
          type="dashed"
          icon={<PlusOutlined />}
          onClick={handleAddStage}
          className="w-full h-11 rounded-lg"
        >
          Thêm Giai Đoạn Sinh Trưởng
        </Button>
      </div>
    </Card>
  );
};

export default GrowthStages;
