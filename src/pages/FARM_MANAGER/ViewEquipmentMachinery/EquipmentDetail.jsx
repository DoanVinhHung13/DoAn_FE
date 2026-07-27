import { ArrowLeftOutlined, EditOutlined, ToolOutlined } from '@ant-design/icons'
import { Alert, Button, Card, Col, Row, Spin, Tag, Typography } from 'antd'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import TitleCustom from 'src/components/TitleCustom'
import ROUTER from 'src/router/ROUTER'
import EquipmentService from 'src/services/EquipmentService'
import { getStatusMeta } from './equipmentOptions'

const { Text, Title } = Typography

const EquipmentDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadEquipment = async () => {
      try {
        const res = await EquipmentService.getById(id)
        if (res?.success !== false && res?.data) setItem(res.data)
      } catch {
        setItem(null)
      } finally {
        setLoading(false)
      }
    }
    loadEquipment()
  }, [id])

  if (loading) return <div className="flex justify-center py-16"><Spin /></div>
  if (!item) return <Alert type="error" message="Không tìm thấy thiết bị" showIcon />
  const status = getStatusMeta(item.status)

  return <div className="space-y-5 duration-300 animate-in fade-in">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate(ROUTER.FM_VIEW_EQUIPMENT_MACHINERY)}>Quay lại</Button><TitleCustom className="!mb-0">Chi tiết thiết bị</TitleCustom></div><Button type="primary" icon={<EditOutlined />} onClick={() => navigate(ROUTER.FM_VIEW_EQUIPMENT_EDIT.replace(':id', item.id))} className="bg-emerald-600 hover:bg-emerald-700">Chỉnh sửa</Button></div>
    <Card className="mx-auto w-full max-w-4xl rounded-xl border-slate-200 shadow-sm"><div className="flex flex-col gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-start sm:justify-between"><div className="flex gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600"><ToolOutlined /></div><div><Title level={3} className="!mb-1 !text-xl">{item.name}</Title><Text className="text-slate-500">{item.type || 'Chưa phân loại'}</Text></div></div><Tag color={status.color} className="m-0 w-fit rounded-full px-3 py-1">{status.label}</Tag></div>
      <Row gutter={[24, 20]} className="py-6"><Col xs={24} sm={12}><Text className="block text-xs font-medium uppercase tracking-wide text-slate-400">Loại thiết bị</Text><Text className="mt-1 block text-base text-slate-800">{item.type || 'Chưa phân loại'}</Text></Col><Col xs={24} sm={12}><Text className="block text-xs font-medium uppercase tracking-wide text-slate-400">Ngày đưa vào sử dụng</Text><Text className="mt-1 block text-base text-slate-800">{item.purchaseDate ? dayjs(item.purchaseDate).format('DD/MM/YYYY') : 'Chưa cập nhật'}</Text></Col></Row>
      <div className="rounded-lg bg-slate-50 p-4"><Text className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-400">Mô tả</Text><Text className="whitespace-pre-line text-slate-700">{item.description || 'Chưa có mô tả cho thiết bị này.'}</Text></div>
    </Card>
  </div>
}

export default EquipmentDetail
