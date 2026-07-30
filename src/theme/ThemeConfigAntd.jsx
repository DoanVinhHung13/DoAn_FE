import React from 'react';
import { ConfigProvider, App as AntdApp } from 'antd';
import { themeTokens } from './themeTokens';
import designTokens from './designTokens';

const ThemeConfigAntd = ({ children }) => {
  return (
    <ConfigProvider
      theme={{
        token: themeTokens,
        components: {
          Button: {
            controlHeight: designTokens.controlHeight.md,
            fontWeight: 600,
          },
          Menu: {
            itemHeight: 40,
            itemSelectedBg: designTokens.colors.primarySoft,
            itemSelectedColor: designTokens.colors.primary,
          },
        },
      }}
    >
      <AntdApp>{children}</AntdApp>
    </ConfigProvider>
  );
};

export default ThemeConfigAntd;
