import React from 'react';
import { Layout, Typography  } from 'antd';

const Header = (props) => (
  <Layout.Header {...props}>
    <Typography.Title level={4}>
      Header Here
    </Typography.Title>
  </Layout.Header>
);

export default Header;