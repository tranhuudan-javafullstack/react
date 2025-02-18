// src/provider/NotificationProvider.jsx
import { notification, Space, Button } from 'antd';
import { createContext, useContext } from 'react';

// Tạo context để cung cấp thông báo
const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [api, contextHolder] = notification.useNotification();

    const openNotification = (
        type,
        message,
        description,
        placement = 'topRight'
    ) => {
        const key = `open${Date.now()}`;
        const btn = (
            <Space>
                <Button type="link" size="small" onClick={() => api.destroy()}>
                    Destroy All
                </Button>
                <Button type="primary" size="small" onClick={() => api.destroy(key)}>
                    Confirm
                </Button>
            </Space>
        );
        api[type]({
            key,
            btn,
            message,
            description,
            placement,
            showProgress: true,
            pauseOnHover: false,
            duration: 3,
            onClose: () => {
                console.log(
                    'Notification was closed. Either the close button was clicked or duration time elapsed.'
                );
            },
        });
    };

    return (
        <NotificationContext.Provider value={{
            opensuccess: (message, description) => openNotification('success', message, description),
            openinfo: (message, description) => openNotification('info', message, description),
            openwarning: (message, description) => openNotification('warning', message, description),
            openerror: (message, description) => openNotification('error', message, description),
            contextHolder
        }}>
            {contextHolder}
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotificationProvider = () => useContext(NotificationContext);
