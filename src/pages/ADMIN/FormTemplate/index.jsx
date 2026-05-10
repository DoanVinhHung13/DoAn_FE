import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Space, Modal, Form, Input, Select, Checkbox } from 'antd';
import { PlusOutlined, SettingOutlined } from '@ant-design/icons';
import FormTemplateService from 'src/services/FormTemplateService';
import notice from 'src/components/Notice';
import { ColorPrimary } from 'src/theme/GlobalThemeConfig';
import FormWrapper from 'src/components/FormWrapper';

const { Option } = Select;

const FormTemplate = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await FormTemplateService.getListTemplates();
      if (res.Status === 0) {
        setData(res.Object);
      }
    } catch (error) {
      notice({ msg: error?.messages?.[0] || error?.message, isSuccess: false });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: 'Template Name', dataIndex: 'name', key: 'name' },
    { 
      title: 'Fields Count', 
      key: 'fieldsCount',
      render: (_, record) => record.fields.length
    },
    {
      title: 'Actions',
      key: 'actions',
      render: () => (
        <Space>
          <Button type="text" icon={<SettingOutlined style={{color: ColorPrimary}} />}>Build Form</Button>
        </Space>
      )
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontWeight: 600, margin: 0 }}>Dynamic Form Templates</h2>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          style={{ background: ColorPrimary }}
          onClick={() => setIsModalOpen(true)}
        >
          Create Template
        </Button>
      </div>
      
      <Card style={{ borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <Table 
          columns={columns} 
          dataSource={data} 
          rowKey="id" 
          loading={loading}
        />
      </Card>

      <Modal 
        title="Create New Form Template" 
        open={isModalOpen} 
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <FormWrapper 
          onFinish={(values) => {
            console.log(values);
            notice({ msg: values?.name, isSuccess: true });
            setIsModalOpen(false);
          }}
          submitText="Save Template"
        >
          <Form.Item name="name" label="Template Name" rules={[{ required: true }]}>
            <Input placeholder="e.g. Daily Harvest Log" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
          </Form.Item>
        </FormWrapper>
      </Modal>
    </div>
  );
};

export default FormTemplate;
