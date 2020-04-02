import React from 'react';
import PropTypes from 'prop-types';
import { Layout } from 'antd';

import { ThemeContext } from '../../theme-context';

import Header from './Header';
import Footer from './Footer';
import Sider from './Sider';

const MainLayout = ({ children }) => {
  return (
    <ThemeContext.Consumer>
      {
        theme => {
          return (
            <Layout>
              {/*<Sider theme={theme.name}/>*/}
              <Layout>
                <Header theme={theme}/>
                <Layout.Content>{children}</Layout.Content>
                <Footer/>
              </Layout>
            </Layout>
          );
        }
      }
    </ThemeContext.Consumer>
  );
};

MainLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default MainLayout;