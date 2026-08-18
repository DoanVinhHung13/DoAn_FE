import { SaveOutlined } from "@ant-design/icons"
import { Form, Modal, Select, message } from "antd"
import { useEffect, useState } from "react"
import { ROLES } from "src/constants/roles"
import CultivationTaskService from "src/services/CultivationTaskService"
import UserService from "src/services/UserService"
import useDebouncedValue from "src/hooks/useDebouncedValue"
import { getTaskSchedulingErrorMessage } from "src/constants/cultivationTask"
import { normalizeApiError } from "src/services/core/apiError"

const AssignTaskModal = ({
  open,
  onCancel,
  onSuccess,
  task,
}) => {
  const [form] = Form.useForm()
  const [leaders, setLeaders] = useState([])
  const [farmers, setFarmers] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [leaderSearch, setLeaderSearch] = useState('')
  const [farmerSearch, setFarmerSearch] = useState('')
  const debouncedLeaderSearch = useDebouncedValue(leaderSearch, 400)
  const debouncedFarmerSearch = useDebouncedValue(farmerSearch, 400)

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

  useEffect(() => {
    if (open && (debouncedLeaderSearch || debouncedFarmerSearch)) fetchUsers()
  }, [open, debouncedLeaderSearch, debouncedFarmerSearch])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const [leadersRes, farmersRes] = await Promise.all([
        UserService.getUsers({
          PageIndex: 1,
          PageSize: 100,
          Role: ROLES.FARMER_LEADER,
          IsActive: true,
          SearchKeyword: debouncedLeaderSearch || undefined,
        }).catch(() => ({ data: { items: [] } })),
        UserService.getUsers({
          PageIndex: 1,
          PageSize: 100,
          Role: ROLES.FARMER,
          IsActive: true,
          SearchKeyword: debouncedFarmerSearch || undefined,
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
    } catch {
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
        leaderId: values.farmLeaderId,
        farmerIds: values.farmerIds || [],
      }

      await CultivationTaskService.assign(task.id, payload, { errorHandling: 'component' })
      onSuccess()
    } catch (err) {
      if (!err?.errorFields) {
        message.error(getTaskSchedulingErrorMessage(normalizeApiError(err)))
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
            loading={loading}
            onSearch={setLeaderSearch}
            filterOption={false}
          />
        </Form.Item>
        <Form.Item name="farmerIds" label="Người hỗ trợ">
          <Select
            mode="multiple"
            options={farmerOptions}
            placeholder="Chọn người hỗ trợ..."
            showSearch
            loading={loading}
            onSearch={setFarmerSearch}
            filterOption={false}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default AssignTaskModal
