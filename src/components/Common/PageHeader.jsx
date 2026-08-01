import React from 'react';
import { Typography } from 'antd';

const { Title } = Typography;

const PageHeader = ({ icon: Icon, title, subtitle, extra }) => {
  return (
    <div style={{
      marginBottom: '24px',
      paddingBottom: '16px',
      borderBottom: '2px solid #f0f0f0',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {Icon && (
          <div style={{
            fontSize: '32px',
            color: '#1890ff',
            display: 'flex',
            alignItems: 'center',
          }}>
            <Icon className="text-3xl" />
          </div>
        )}
        <div>
          <Title level={2} style={{ margin: 0 }}>
            {title}
          </Title>
          {subtitle && (
            <div style={{ color: '#8c8c8c', fontSize: '14px', marginTop: '4px' }}>
              {subtitle}
            </div>
          )}
        </div>
      </div>
      {extra && <div>{extra}</div>}
    </div>
  );
};

export default PageHeader;
