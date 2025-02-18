import React, { createContext, useContext } from 'react';
import { message } from 'antd';
const MessageContext = createContext();
export const useMessage = () => useContext(MessageContext);
export const MessageProvider = ({ children }) => {
  const [messageApi, contextHolder] = message.useMessage();
  const showMessage = (type, content, key) => {
    const defaultContent = {
      success: 'Operation successful!',
      error: 'An error occurred!',
      warning: 'Warning!',
      loading: 'Loading...',
    };
    messageApi.open({
      type,
      content: content || defaultContent[type] || 'Notification',
      key,
      duration: type === 'loading' ? 0 : 2,
    });
  };
  const showSuccess = (content, key) => showMessage('success', content, key);
  const showError = (content, key) => showMessage('error', content, key);
  const showWarning = (content, key) => showMessage('warning', content, key);
  const showLoading = (key, content) => showMessage('loading', content, key);
  const showLoaded = (key) => messageApi.destroy(key);
  const contextValue = {
    showSuccess,
    showError,
    showWarning,
    showLoading,
    showLoaded
  };
  return (
    <MessageContext.Provider value={contextValue}>
      {contextHolder}
      {children}
    </MessageContext.Provider>
  );
};