import { useMutation } from '@tanstack/react-query';
import { Button, Checkbox, Form, Input, Tabs } from 'antd';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAxiosSetup } from '../../hooks/useAxiosInterceptors.js';
import { useNotificationProvider } from '../../provider/NotificationProvider';
import './login.scss';

const Login = () => {
    const [loginType, setLoginType] = useState('user');
    const navigate = useNavigate();
    const axiosInstance = useAxiosSetup();
    const { openerror, opensuccess } = useNotificationProvider();

    const userMutation = useMutation({
        mutationFn: async (values) => {
            try {
                const response = await axiosInstance.post('api/employee/login', {
                    username: values.username,
                    password: values.password,
                    deviceType: 10
                });
                return response.data;
            } catch (err) {
                throw new Error(err);
            }
        },
        onSuccess: (data) => {
            if (data.status === 1 && data) {
                localStorage.setItem("key", data.data);
                opensuccess('Đăng nhập thành công');
                navigate("/user-dashboard");
            } else {
                openerror('Đăng nhập thất bại', 'Vui lòng kiểm tra lại tên đăng nhập và mật khẩu');
            }
        },
        onError: (error) => {
            openerror('Đăng nhập thất bại', 'Vui lòng kiểm tra kết nối mạng của bạn' + error);
        },
        retry: false
    });

    const ownerMutation = useMutation({
        mutationFn: async (values) => {
            try {
                const response = await axiosInstance.post('api/owner/login', {
                    ownerPassword: values.password
                });
                return response.data;
            } catch (err) {
                throw new Error(err);
            }
        },
        onSuccess: (data) => {
            if (data.status === 1 && data) {
                localStorage.setItem("key", data.data);
                opensuccess('Login successful');
                navigate("/dashboard");
            } else {
                openerror('Đăng nhập thất bại', 'Vui lòng kiểm tra lại tên đăng nhập và mật khẩu');

            }
        },
        onError: (error) => {
            openerror('Đăng nhập thất bại', 'Vui lòng kiểm tra kết nối mạng của bạn' + error);
        },
        retry: false
    });

    const onFinish = (values) => {
        if (loginType === 'user') {
            userMutation.mutate(values);
        } else {
            ownerMutation.mutate(values);
        }
    };

    const onFinishFailed = (errorInfo) => {
        openerror('Form submission failed. Please check your inputs.' + errorInfo);
    };

    const LoginForm = () => (
        <Form
            name="basic"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            style={{ maxWidth: 600 }}
            initialValues={{ remember: true }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
        >
            <Form.Item
                label="Username"
                name="username"
                rules={[{ required: true, message: 'Please input your username!' }]}
            >
                <Input />
            </Form.Item>

            <Form.Item
                label="Password"
                name="password"
                rules={[{ required: true, message: 'Please input your password!' }]}
            >
                <Input.Password />
            </Form.Item>
            <Form.Item
                name="remember"
                valuePropName="checked"
                wrapperCol={{ offset: 8, span: 16 }}
            >
                <Checkbox>Nhớ mật khẩu</Checkbox>
            </Form.Item>

            <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                <Button type="primary" htmlType="submit">
                    Đăng nhập
                </Button>
            </Form.Item>
        </Form>
    );
    const LoginOwnerForm = () => (
        <Form
            name="basic"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            style={{ maxWidth: 600 }}
            initialValues={{ remember: true }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
        >

            <Form.Item
                label="Password"
                name="password"
                rules={[{ required: true, message: 'Please input your password!' }]}
            >
                <Input.Password />
            </Form.Item>

            <Form.Item
                name="remember"
                valuePropName="checked"
                wrapperCol={{ offset: 8, span: 16 }}
            >
                <Checkbox>Nhớ mật khẩu</Checkbox>
            </Form.Item>

            <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                <Button type="primary" htmlType="submit">
                    Đăng nhập
                </Button>
            </Form.Item>
        </Form>
    );

    return (
        <div className="login">
            <div className="main">
                <div className="container">
                    <Tabs
                        activeKey={loginType}
                        onChange={setLoginType}
                        centered
                        items={[
                            {
                                key: 'user',
                                label: 'User Login',
                                children: <LoginForm />
                            },
                            {
                                key: 'owner',
                                label: 'Owner Login',
                                children: <LoginOwnerForm />
                            }
                        ]}
                    />
                </div>
            </div>
        </div>
    );
};

export default Login;