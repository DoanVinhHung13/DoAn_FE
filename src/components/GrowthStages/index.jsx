import React from 'react';
import { Button, Input, Checkbox, Card, Typography } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';

const { Text } = Typography;

/**
 * Component quản lý các giai đoạn sinh trưởng của cây
 * @param {Array} value - Danh sách giai đoạn từ form
 * @param {Function} onChange - Callback khi thay đổi
 */
const GrowthStages = ({ value = [], onChange }) => {
  const handleAddStage = () => {
    const newStage = {
      id: Date.now(),
      type: 'task', // 'task' hoặc 'status'
      name: '',
      tasks: [{ id: Date.now(), name: '', notAllowed: false }],
    };
    onChange([...value, newStage]);
  };

  const handleAddStatus = () => {
    const newStatus = {
      id: Date.now(),
      type: 'status',
      name: '',
    };
    onChange([...value, newStatus]);
  };

  const handleRemoveStage = (stageId) => {
    onChange(value.filter((stage) => stage.id !== stageId));
  };

  const handleUpdateStageName = (stageId, name) => {
    onChange(
      value.map((stage) =>
        stage.id === stageId ? { ...stage, name } : stage
      )
    );
  };

  const handleAddTask = (stageId) => {
    onChange(
      value.map((stage) =>
        stage.id === stageId
          ? {
              ...stage,
              tasks: [
                ...(stage.tasks || []),
                { id: Date.now(), name: '', notAllowed: false },
              ],
            }
          : stage
      )
    );
  };

  const handleRemoveTask = (stageId, taskId) => {
    onChange(
      value.map((stage) =>
        stage.id === stageId
          ? {
              ...stage,
              tasks: stage.tasks.filter((task) => task.id !== taskId),
            }
          : stage
      )
    );
  };

  const handleUpdateTask = (stageId, taskId, field, taskValue) => {
    onChange(
      value.map((stage) =>
        stage.id === stageId
          ? {
              ...stage,
              tasks: stage.tasks.map((task) =>
                task.id === taskId ? { ...task, [field]: taskValue } : task
              ),
            }
          : stage
      )
    );
  };

  const stagesWithTasks = value.filter((s) => s.type === 'task');
  const statuses = value.filter((s) => s.type === 'status');

  return (
    <Card className="rounded-lg" title={<Text strong>Các Giai Đoạn Sinh Trưởng của cây</Text>}>
      <div className="space-y-4">
        {/* Các giai đoạn có công việc */}
        {stagesWithTasks.map((stage) => (
          <div key={stage.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <Input
                value={stage.name}
                onChange={(e) => handleUpdateStageName(stage.id, e.target.value)}
                placeholder="Tên giai đoạn (vd: Nảy Mầm)"
                className="flex-1 h-10 rounded-lg"
              />
              <Button
                danger
                type="text"
                icon={<DeleteOutlined />}
                onClick={() => handleRemoveStage(stage.id)}
                className="rounded-lg"
              >
                Xóa Giai Đoạn
              </Button>
            </div>

            {/* Các công việc */}
            <div className="space-y-2 pl-4 border-l-2 border-gray-200">
              {stage.tasks?.map((task) => (
                <div key={task.id} className="flex items-center gap-2">
                  <Input
                    value={task.name}
                    onChange={(e) =>
                      handleUpdateTask(stage.id, task.id, 'name', e.target.value)
                    }
                    placeholder="Tên công việc"
                    className="flex-1 h-10 rounded-lg"
                  />
                  <Checkbox
                    checked={task.notAllowed}
                    onChange={(e) =>
                      handleUpdateTask(stage.id, task.id, 'notAllowed', e.target.checked)
                    }
                  >
                    Không được phép
                  </Checkbox>
                  <Button
                    danger
                    type="text"
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemoveTask(stage.id, task.id)}
                    className="rounded-lg"
                  />
                </div>
              ))}

              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={() => handleAddTask(stage.id)}
                className="w-full rounded-lg"
              >
                Thêm Công Việc
              </Button>
            </div>
          </div>
        ))}

        {/* Nút thêm giai đoạn mới */}
        <Button
          type="dashed"
          icon={<PlusOutlined />}
          onClick={handleAddStage}
          className="w-full h-10 rounded-lg"
        >
          Thêm Giai Đoạn (có công việc)
        </Button>

        {/* Các tình trạng */}
        {statuses.map((status) => (
          <div key={status.id} className="flex items-center gap-3">
            <Input
              value={status.name}
              onChange={(e) => handleUpdateStageName(status.id, e.target.value)}
              placeholder="Tên tình trạng (vd: Ra Hoa, Ra quả)"
              className="flex-1 h-10 rounded-lg"
            />
            <Button
              danger
              type="text"
              icon={<DeleteOutlined />}
              onClick={() => handleRemoveStage(status.id)}
              className="rounded-lg"
            >
              Xóa Tình trạng
            </Button>
          </div>
        ))}

        {/* Nút thêm tình trạng */}
        <Button
          type="dashed"
          icon={<PlusOutlined />}
          onClick={handleAddStatus}
          className="w-full h-10 rounded-lg"
        >
          Thêm Tình trạng
        </Button>
      </div>
    </Card>
  );
};

export default GrowthStages;
