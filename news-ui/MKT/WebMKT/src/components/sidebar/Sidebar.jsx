import React, { useState, useEffect } from 'react';
import {
  PieChartOutlined,
  TagsOutlined,
  ReadOutlined,
  MacCommandOutlined,
  ApartmentOutlined,
  AreaChartOutlined,
  HomeOutlined,
  InsertRowBelowOutlined,
  GroupOutlined,
  UserOutlined,
  UsergroupDeleteOutlined
} from '@ant-design/icons';
import { Breadcrumb, Layout, Menu, theme } from 'antd';
import { Link } from 'react-router-dom';

const { Header, Content, Footer, Sider } = Layout;
const getItem = (label, key, icon, children) => ({
  key,
  icon,
  children,
  label,
});

const siderStyle = {
  overflow: 'auto',
  height: '100vh',
  position: 'fixed',
  insetInlineStart: 0,
  top: 0,
  bottom: 0,
  scrollbarWidth: 'thin',
};

const items = [
  getItem('QL cấu hình Web', '1', <PieChartOutlined />, [
    getItem('Màu sắc + Bố cục', '6', <MacCommandOutlined />),
    getItem('Category', '8', <ApartmentOutlined />),
  ]),
  getItem('QL bài viết', '2', <ReadOutlined />, [
    getItem('Dashboard', '7', <AreaChartOutlined />),
  ]),
  getItem('QL quảng cáo', '3', <TagsOutlined />),
  getItem('QL cấu hình Home', 'sub1', <HomeOutlined />, [
    getItem('Slide banner', '4', <InsertRowBelowOutlined />),
    getItem('Nhóm bài viết', '5', <GroupOutlined />),
  ]),
];


const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { token } = theme.useToken();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const headerStyle = {
    padding: 0,
    background: token.colorBgContainer,
    position: 'sticky',
    top: 0,
    zIndex: 1,
    width: '100%',
    transition: 'box-shadow 0.3s ease-in-out',
    boxShadow: scrolled ? '0 2px 8px rgba(0, 0, 0, 0.15)' : 'none',
  };

  const flexStyle = {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '25px',
  };

  return (
    <Layout hasSider>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={256}
        style={siderStyle}
      >
        <div className="demo-logo-vertical" />
        <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline" items={items} />
      </Sider>
      <Layout style={{ marginLeft: collapsed ? 80 : 256, transition: 'margin 0.2s' }}>
        <Header style={headerStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 16px', height: '64px' }}>
            <Breadcrumb style={{ margin: '16px 0' }}>
              <Breadcrumb.Item>User</Breadcrumb.Item>
              <Breadcrumb.Item>Bill</Breadcrumb.Item>
            </Breadcrumb>
            <div style={flexStyle}>
              <HomeOutlined style={{ height: '100%' }} />
              <UsergroupDeleteOutlined style={{ height: '100%' }} />
              <UserOutlined style={{ height: '100%' }} />
            </div>
          </div>
        </Header>
        <Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: token.colorBgContainer,
              borderRadius: token.borderRadiusLG,
            }}
          >
            <Link to="/home">Home</Link>
            <Link to="/login">Login</Link>
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          Fandb ©{new Date().getFullYear()} Created by Marketing department
        </Footer>
      </Layout>
    </Layout>
  );
};

export default Sidebar;
