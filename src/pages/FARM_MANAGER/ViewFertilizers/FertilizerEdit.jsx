import { ArrowLeftOutlined, ExperimentOutlined } from '@ant-design/icons'
import { Button, Card, Skeleton } from 'antd'
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import TitleCustom from 'src/components/TitleCustom'
import ROUTER from 'src/router/ROUTER'
import FertilizerService from 'src/services/FertilizerService'

import FertilizerFormFields from './FertilizerFormFields'

const FertilizerEdit = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [initialLoading, setInitialLoading] = useState(true)
  const [editingItem, setEditingItem] = useState(null)

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setInitialLoading(true)
        const res = await FertilizerService.getFertilizerById(id)
        setEditingItem(res?.data)
      } catch {
        navigate(ROUTER.FM_FERTILIZERS)
      } finally {
        setInitialLoading(false)
      }
    }
    if (id) fetchDetail()
  }, [id, navigate])

  return (
    <div className="space-y-6 duration-500 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(ROUTER.FM_FERTILIZERS)}>
            Quay lại
          </Button>
          <TitleCustom className="!mb-0 flex items-center gap-2">
            <ExperimentOutlined className="text-green-600" />
            Chỉnh sửa phân bón
          </TitleCustom>
        </div>
      </div>
      <Card
        bordered={false}
        className="shadow-sm rounded-2xl"
        bodyStyle={{ padding: '24px' }}
      >
        {initialLoading ? (
          <Skeleton active paragraph={{ rows: 6 }} />
        ) : (
          <FertilizerFormFields isEdit={true} editingItem={editingItem} />
        )}
      </Card>
    </div>
  )
}

export default FertilizerEdit
