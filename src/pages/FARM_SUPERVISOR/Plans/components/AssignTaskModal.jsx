import { SaveOutlined } from "@ant-design/icons"
import { Form, Modal, Select } from "antd"
import { useEffect, useState } from "react"
import { ROLES } from "src/constants/roles"
import CultivationTaskService from "src/services/CultivationTaskService"
import UserService from "src/services/UserService"

const AssignTaskModal = ({
  open,
  onCancel,
  onSuccess,
  task,
  planId,
  stageId,
}) => {
  const [form] = Form.useForm()
  const [leaders, setLeaders] = useState([])
  const [farmers, setFarmers] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const leaderOptions = leaders.map(l => ({
    value: l.id,
    label: l.fullName || l.name,
  }))
  const farmerOptions = farmers.map(f => ({
    value: f.id,
    label: f.fullName || f.name,
  }))

  useEffect(() => {
    if (open) {
      fetchUsers()
      if (task) {
        form.setFieldsValue({
          farmLeaderId: task.assignedLeaderId || undefined,
          farmerIds:
            task.assignments
              ?.filter(a => !a.isLeader)
              .map(a => (typeof a === "object" ? a.userId || a.id : a)) || [],
        })
      }
    } else {
      form.resetFields()
    }
  }, [open, task, form])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const [leadersRes, farmersRes] = await Promise.all([
        UserService.getUsers({
          PageIndex: 1,
          PageSize: 1000,
          Role: ROLES.FARM_LEADER,
          IsActive: true,
        }).catch(() => ({ data: { items: [] } })),
        UserService.getUsers({
          PageIndex: 1,
          PageSize: 1000,
          Role: ROLES.FARMER,
          IsActive: true,
        }).catch(() => ({ data: { items: [] } })),
      ])

      const leadersList =
        leadersRes?.data?.items ||
        leadersRes?.data?.data ||
        leadersRes?.data ||
        []
      setLeaders(
        Array.isArray(leadersList)
          ? leadersList.filter(u => u.isActive !== false)
          : [],
      )

      const farmersList =
        farmersRes?.data?.items ||
        farmersRes?.data?.data ||
        farmersRes?.data ||
        []
      setFarmers(
        Array.isArray(farmersList)
          ? farmersList.filter(u => u.isActive !== false)
          : [],
      )
    } catch (err) {
      console.error(err)
      // axios interceptor handles error notification
    } finally {
      setLoading(false)
    }
  }

  const handleAssign = async () => {
    try {
      const values = await form.validateFields()
      setSaving(true)

      const payload = {
        name: task.name || task.taskName,
        description: task.description,
        leaderId: values.farmLeaderId,
        farmerIds: values.farmerIds || [],
        cultivationLogbookId: planId,
        cultivationStageId: stageId,
      }

      await CultivationTaskService.update(task.id, payload)
      onSuccess()
    } catch (err) {
      if (!err?.errorFields) {
        // axios interceptor handles error notification
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      title="Phân công công việc"
      onOk={handleAssign}
      okText="Lưu phân công"
      cancelText="Hủy"
      confirmLoading={saving}
      okButtonProps={{ className: "bg-green-600", icon: <SaveOutlined /> }}
      destroyOnClose
    >
      <Form form={form} layout="vertical" className="mt-4">
        <Form.Item
          name="farmLeaderId"
          label="Người phụ trách"
          rules={[{ required: true, message: "Vui lòng chọn người phụ trách" }]}
        >
          <Select
            options={leaderOptions}
            placeholder="Chọn người phụ trách..."
            showSearch
            filterOption={(input, option) =>
              String(option?.label || "")
                .toLowerCase()
                .includes(input.toLowerCase())
            }
            loading={loading}
          />
        </Form.Item>
        <Form.Item name="farmerIds" label="Người hỗ trợ">
          <Select
            mode="multiple"
            options={farmerOptions}
            placeholder="Chọn người hỗ trợ..."
            showSearch
            filterOption={(input, option) =>
              String(option?.label || "")
                .toLowerCase()
                .includes(input.toLowerCase())
            }
            loading={loading}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default AssignTaskModal
