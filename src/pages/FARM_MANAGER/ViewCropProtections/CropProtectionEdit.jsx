import { ArrowLeftOutlined, BugOutlined } from '@ant-design/icons'
import { Button, Card, Skeleton } from 'antd'
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import TitleCustom from 'src/components/TitleCustom'
import { PesticideIcon } from 'src/assets/icon/menu/MenuIcons'
import ROUTER from 'src/router/ROUTER'
import PesticideService from 'src/services/PesticideService'

import CropProtectionFormFields from './CropProtectionFormFields'

const CropProtectionEdit = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [initialLoading, setInitialLoading] = useState(true)
  const [editingItem, setEditingItem] = useState(null)

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setInitialLoading(true)
        const res = await PesticideService.getPesticideById(id)
        setEditingItem(res?.data)
      } catch {
        navigate(ROUTER.FM_PESTICIDES)
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
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(ROUTER.FM_PESTICIDES)}>
            Quay lại
          </Button>
          <TitleCustom className="!mb-0 flex items-center gap-2">
            <PesticideIcon style={{ fontSize: '24px', color: '#15803d' }} />
            Chỉnh sửa nông dược
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
          <CropProtectionFormFields isEdit={true} editingItem={editingItem} />
        )}
      </Card>
    </div>
  )
}

export default CropProtectionEdit
