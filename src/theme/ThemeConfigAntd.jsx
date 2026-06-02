import React from 'react';
import { ConfigProvider, App as AntdApp } from 'antd';
import { themeTokens } from './themeTokens';

const ThemeConfigAntd = ({ children }) => {
  return (
    <ConfigProvider
      theme={{
        token: themeTokens,
        components: {
          Button: {
            controlHeight: 40,
            fontWeight: 600,
          },
          Menu: {
            itemHeight: 50,
            itemSelectedBg: '#f0fdf4',
            itemSelectedColor: '#15803d',
          },
        },
      }}
    >
      <AntdApp>{children}</AntdApp>
    </ConfigProvider>
  );
};

export default ThemeConfigAntd;
