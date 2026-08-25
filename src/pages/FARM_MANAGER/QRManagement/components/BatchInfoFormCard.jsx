import { QrcodeOutlined } from "@ant-design/icons"
import { Card, Col, DatePicker, Form, Input, Row } from "antd"

const BatchInfoFormCard = ({ form }) => {
  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg">
            <QrcodeOutlined className="text-green-600" />
          </div>
          <span className="text-lg font-semibold text-gray-800">
            Chi tiết lô thu hoạch
          </span>
        </div>
      }
      className="rounded-2xl shadow-sm border-0"
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          showDailyLog: true,
          showMaterials: true,
          showPhotos: true,
        }}
      >
        <Form.Item name="harvestBatchId" hidden>
          <Input />
        </Form.Item>

        <Form.Item name="batchCode" label="Mã lô thu hoạch">
          <Input
            placeholder="Mã lô thu hoạch"
            className="h-10 rounded-xl font-bold text-green-700 bg-gray-50"
            disabled
          />
        </Form.Item>

        <Form.Item name="cropName" label="Loại cây trồng (Sản phẩm)">
          <Input
            placeholder="Loại cây trồng"
            className="h-10 rounded-xl font-semibold text-gray-800 bg-gray-50"
            disabled
          />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="startDate" label="Ngày trồng (Bắt đầu)">
              <DatePicker
                placeholder="DD/MM/YYYY"
                className="w-full h-10 rounded-xl bg-gray-50"
                format="DD/MM/YYYY"
                disabled
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="harvestDate" label="Ngày thu hoạch">
              <DatePicker
                placeholder="DD/MM/YYYY"
                className="w-full h-10 rounded-xl bg-gray-50"
                format="DD/MM/YYYY"
                disabled
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Card>
  )
}

export default BatchInfoFormCard
