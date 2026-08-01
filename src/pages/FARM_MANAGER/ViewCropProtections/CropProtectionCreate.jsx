import { ArrowLeftOutlined, BugOutlined } from '@ant-design/icons'
import { Button, Card } from 'antd'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import ROUTER from 'src/router/ROUTER'
import TitleCustom from 'src/components/TitleCustom'
import { PesticideIcon } from 'src/assets/icon/menu/MenuIcons'

import CropProtectionFormFields from './CropProtectionFormFields'

const CropProtectionCreate = () => {
  const navigate = useNavigate()

  return (
    <div className="space-y-6 duration-500 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(ROUTER.FM_PESTICIDES)}>
            Quay lại
          </Button>
          <TitleCustom className="!mb-0 flex items-center gap-2">
            <PesticideIcon style={{ fontSize: '24px', color: '#15803d' }} />
            Thêm mới nông dược
          </TitleCustom>
        </div>
      </div>
      <Card
        bordered={false}
        className="shadow-sm rounded-2xl"
        bodyStyle={{ padding: '24px' }}
      >
        <CropProtectionFormFields isEdit={false} />
      </Card>
    </div>
  )
}

export default CropProtectionCreate
