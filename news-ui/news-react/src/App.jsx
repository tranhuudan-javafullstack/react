// src/App.jsx
import { LoadingOutlined } from '@ant-design/icons';
import { Flex, Spin } from 'antd';
import React, { Suspense, useEffect } from 'react';
import { HashRouter, useLocation } from 'react-router-dom';
import { MessageProvider } from './provider/MessageProvider.jsx';
import { NotificationProvider } from './provider/NotificationProvider.jsx';
import Router from './routes/ManageRoute.jsx';

const ScrollToTop = () => {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  return null;
};

function App() {
  return (
    <MessageProvider>
      <NotificationProvider>
        <HashRouter >
          <ScrollToTop />
          <Suspense fallback={<Flex justify='center' align="center" style={{ minHeight: '100vh', minWidth: '100vw' }} gap="middle">
            <Spin indicator={<LoadingOutlined spin />} size="large" />
          </Flex>}>
            <Router />
          </Suspense>
        </HashRouter>
      </NotificationProvider>
    </MessageProvider>
  );
}

export default App;
