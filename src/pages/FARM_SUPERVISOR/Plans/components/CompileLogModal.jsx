/**
 * Farm Supervisor — Biên soạn nhật ký chính thức
 *
 * API:
 *   GET  /api/cultivation-stages/{id}/summary       — Của Supervisor: dùng để xem bản summary của cả giai đoạn do các Leader gửi
 *   GET  /cultivation-tasks/{id}/leader-summary     — Của Leader: dùng để xem trước/lấy summary của công việc cụ thể trước khi gửi
 *   GET  /cultivation-tasks/{id}
 *   POST /api/cultivation-logs/{id}/approve         — Phê duyệt nhật ký chính thức với modifiedDescription
 */
import React, { useEffect, useState } from 'react'
import { Modal, Form, Input, Image, Alert, Collapse, message, Spin } from 'antd'
import { EditOutlined } from '@ant-design/icons'
import {
  buildDataSentence,
  loadLeaderCompileData,
  saveCompiledDescription,
} from './compileLogHelpers'

const { TextArea } = Input

const CompileLogModal = ({ open, onCancel, onSuccess, task }) => {
  const [form] = Form.useForm()
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(false)
  const [leaderSummary, setLeaderSummary] = useState(null)
  const [officialLogId, setOfficialLogId] = useState(null)
  const [isApproved, setIsApproved] = useState(false)

  useEffect(() => {
    if (!open || !task?.id) {
      form.resetFields()
      setLeaderSummary(null)
      setOfficialLogId(null)
      setIsApproved(false)
      return
    }

    const load = async () => {
      setLoading(true)
      try {
        const { summary, leaderSubmittedDescription, submittedLogId: logId, isApproved: approved } =
          await loadLeaderCompileData(task.id)
        setLeaderSummary(summary)
        setOfficialLogId(logId)
        setIsApproved(approved)
        form.setFieldsValue({
          supervisorDescription: leaderSubmittedDescription || summary?.descriptionSummary || summary?.description || '',
        })
      } catch (err) {
        console.error(err)
        setLeaderSummary(null)
        form.setFieldsValue({
          supervisorDescription: '',
        })
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [open, task, form])

  const dataSentence = buildDataSentence(leaderSummary)

  const handleCompile = async () => {
    try {
      const values = await form.validateFields()
      setSaving(true)

      const targetStageId = task?.cultivationStageId || task?.stageId
      const taskId = task?.taskId || task?.cultivationTaskId || task?.workTaskId || task?.id
      if (!taskId) {
        message.error('Không xác định được CultivationTaskId của Summary.')
        return
      }

      await saveCompiledDescription(targetStageId, taskId, values.supervisorDescription)

      onSuccess?.()
    } catch (err) {
      if (!err?.errorFields) {
        console.error(err)
      }
    } finally {
      setSaving(false)
    }
  }

  if (!task) return null

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      title={
        <div className="flex items-center gap-2">
          <EditOutlined className="text-green-600" /> Biên soạn nhật ký chính thức
        </div>
      }
      onOk={handleCompile}
      okText="Lưu & Duyệt nhật ký"
      cancelText="Hủy"
      confirmLoading={saving}
      okButtonProps={{ className: 'bg-green-600', disabled: isApproved || !officialLogId }}
      width={720}
      destroyOnClose
    >
      {loading ? (
        <div className="py-10 text-center">
          <Spin tip="Đang tải báo cáo..." />
        </div>
      ) : (
        <div className="space-y-4 mt-4">
          {leaderSummary && (
            <div className="mb-4">
              <Collapse
                bordered={false}
                defaultActiveKey={['data']}
                className="bg-transparent border border-green-100 rounded-xl overflow-hidden"
              >
                <Collapse.Panel
                  header={<span className="font-semibold text-green-700">Báo cáo hoàn thành từ người phụ trách</span>}
                  key="data"
                >
                  <div className="space-y-3">
                    <div className="rounded-xl bg-gray-50 border border-gray-200 p-3 text-sm font-mono text-gray-700">
                      {dataSentence}
                    </div>

                    {leaderSummary.images?.length > 0 && (
                      <div>
                        <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                          Ảnh đính kèm ({leaderSummary.images.length} ảnh)
                        </div>
                        <Image.PreviewGroup>
                          <div className="flex flex-wrap gap-2">
                            {leaderSummary.images.map((img, idx) => (
                              <Image
                                key={img.id || idx}
                                src={typeof img === 'string' ? img : (img.url ?? null)}
                                width={80}
                                height={80}
                                className="rounded-lg object-cover"
                              />
                            ))}
                          </div>
                        </Image.PreviewGroup>
                      </div>
                    )}

                    {leaderSummary.draftDescription && (
                      <div className="rounded-xl bg-gray-50 border border-gray-200 p-3 text-xs italic text-gray-600">
                        Mô tả tự động: {leaderSummary.draftDescription}
                      </div>
                    )}

                    {(leaderSummary.leaderSubmittedDescription || leaderSummary.descriptionSummary || leaderSummary.description) && (
                      <div className="rounded-xl bg-blue-50 border border-blue-100 p-3 text-sm italic text-blue-900">
                        "{leaderSummary.leaderSubmittedDescription || leaderSummary.descriptionSummary || leaderSummary.description}"
                      </div>
                    )}
                  </div>
                </Collapse.Panel>
              </Collapse>
            </div>
          )}

          {!officialLogId && (
            <Alert
              message="Chưa có nhật ký canh tác để biên soạn"
              description="Cần người phụ trách gửi bản tổng hợp trước. Hệ thống sẽ tạo nhật ký chờ xử lý để Supervisor chỉnh mô tả."
              type="warning"
              showIcon
              className="rounded-xl"
            />
          )}

          <Alert
            message="Số liệu và ảnh không được phép sửa. Chỉ biên tập lại mô tả."
            type="info"
            showIcon
            className="rounded-xl"
          />

          <Form form={form} layout="vertical">
            <Form.Item
              name="supervisorDescription"
              label="Mô tả (Farm Supervisor biên tập)"
              rules={[{ required: true, message: 'Nhập mô tả nhật ký' }]}
              extra="Viết lại theo văn phong chuẩn nhật ký canh tác."
            >
              <TextArea
                rows={5}
                disabled={isApproved}
                placeholder="VD: Công tác bón phân được thực hiện theo đúng quy trình kỹ thuật..."
              />
            </Form.Item>

            <div>
              <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                Preview nhật ký cuối
              </div>
              <Form.Item noStyle dependencies={['supervisorDescription']}>
                {({ getFieldValue }) => (
                  <div className="rounded-xl bg-green-50 border border-green-100 p-4 text-sm text-green-900">
                    <span className="font-mono">{dataSentence}</span>
                    {getFieldValue('supervisorDescription') && (
                      <span> — {getFieldValue('supervisorDescription')}</span>
                    )}
                  </div>
                )}
              </Form.Item>
            </div>
          </Form>
        </div>
      )}
    </Modal>
  )
}

export default CompileLogModal
