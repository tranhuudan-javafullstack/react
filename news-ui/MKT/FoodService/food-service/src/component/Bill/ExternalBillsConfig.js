import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, Form, Input, InputNumber, Switch, Button, Table, Space, message, Spin } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import axios from 'axios';
import { API_DOMAIN_LOCAL } from '../domain';
import dayjs from 'dayjs';
import './style.css';
import { receipt } from '../../api';

const ExternalbillConfig = () => {
    const [invoiceData, setInvoiceData] = useState({
        restaurantName: 'Tên nhà hàng',
        address: 'Số 99 - Đường 99 - Phường 99 - Quận 99 - Thành phố 99 - Tỉnh 99 ',
        phone: '0123456789',
        taxId: '123456',
        items: [
            { id: 'item-1', name: 'Món 1', price: 50000, quantity: 1 },
            { id: 'item-2', name: 'Món 2', price: 30000, quantity: 2 },
            { id: 'item-3', name: 'Món 3', price: 20000, quantity: 3 },
        ],
        services: [
            { id: 'service-1', name: 'Dịch vụ 1', price: 10000, quantity: 1 },
            { id: 'service-2', name: 'Dịch vụ 2', price: 20000, quantity: 2 },
            { id: 'service-3', name: 'Dịch vụ 3', price: 30000, quantity: 3 },
        ],
        externalBills: [],
        logo: null,
        qrCode: null,
        footerText: '',
        layout: ['logo', 'restaurantInfo', 'items', 'services', 'externalBills', 'total', 'footer', 'qrCode'],
    });

    const [defaultInvoiceData, setDefaultInvoiceData] = useState(invoiceData);
    const [form] = Form.useForm();
    const externalBillsRef = useRef(null);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        if (!isLoading) {
            const timer = setTimeout(() => {
                if (externalBillsRef.current) {
                    externalBillsRef.current.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                }
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [isLoading]);


    const parseHTMLResponse = (htmlString) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlString, 'text/html');

        const restaurantName = doc.querySelector('h2')?.textContent || '';
        const addressElements = doc.querySelectorAll('p');
        const address = addressElements[0]?.textContent || '';
        const phone = addressElements[1]?.textContent.replace('ĐT:', '').trim() || '';
        const taxId = addressElements[2]?.textContent.replace('Số HD:', '').trim() || '';

        const items = [
            { id: 'item-1', name: 'Món 1', price: 50000, quantity: 1 },
            { id: 'item-2', name: 'Món 2', price: 30000, quantity: 2 },
            { id: 'item-3', name: 'Món 3', price: 20000, quantity: 3 },
        ];

        const services = [
            { id: 'service-1', name: 'Dịch vụ 1', price: 10000, quantity: 1 },
            { id: 'service-2', name: 'Dịch vụ 2', price: 20000, quantity: 2 },
            { id: 'service-3', name: 'Dịch vụ 3', price: 30000, quantity: 3 },
        ];


        const externalBills = [];


        const logo = doc.querySelector('img[alt="Logo"]')?.getAttribute('src') || null;
        const qrCode = doc.querySelector('img[alt="QR Code"]')?.getAttribute('src') || null;

        const footerDiv = doc.querySelector('[data-rbd-draggable-id="footer"]');
        let footerText = '';
        if (footerDiv) {
            const footerContent = footerDiv.textContent.trim();
            footerText = footerContent;
        }

        return {
            restaurantName,
            address,
            phone,
            taxId,
            items,
            services,
            externalBills,
            logo,
            qrCode,
            footerText,
            layout: invoiceData.layout,
        };
    };

    const fetchInvoiceData = async () => {
        setIsLoading(true);
        try {
            const response = await axios.post(
                `${API_DOMAIN_LOCAL}api/fandb/owner/setup-receipt/get-print-bill`,
                {},
                {
                    headers: {
                        'token-owner': localStorage.getItem('key'),
                    },
                    responseType: 'text',
                }
            );
            const parsedData = await parseHTMLResponse(response.data);
    
            const externalBillsData = await receipt.fetchExternalBills();
            const externalBills = externalBillsData.data.data.map(bill => ({
                title: bill.title,
                value: bill.value,
                isPercent: bill.isPercent
            }));
    
            parsedData.externalBills = externalBills;
    
            setInvoiceData(parsedData);
            form.setFieldsValue(parsedData);
        } catch (error) {
            console.error('Error fetching invoice data:', error);
            message.error('Failed to fetch invoice data');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoiceData();
    }, []);

    const handleFormChange = (changedValues, allValues) => {
        setInvoiceData((prev) => ({
            ...prev,
            ...allValues,
        }));
    };

    const handleExternalBillsChange = async (externalBills) => {
        setIsLoading(true);
        try {
            const key = '1';
            message.loading({ content: 'Đang lưu phí chung...', key, duration: 0 });
            await axios.post(
                `${API_DOMAIN_LOCAL}api/fandb/owner/setup-receipt/set-external-bill`,
                { listExternalBills: externalBills },
                {
                    headers: { 'token-owner': localStorage.getItem('key') },
                }
            );
            // sendInvoiceToServer();

            message.success({ content: 'Đã lưu phí chung', key, duration: 2 });
        } catch (error) {
            console.error('Error updating external bills:', error);
            message.error('Failed to update external bills');
        } finally {
            setIsLoading(false);
        }
    };

    const resetToDefault = () => {
        if (defaultInvoiceData) {
            setInvoiceData(defaultInvoiceData);
            form.setFieldsValue(defaultInvoiceData);
        }
    };


    // const handleExternalBillsChange = async (externalBills) => {
    //   try {
    //     await axios.post(API_DOMAIN_LOCAL + 'api/fandb/owner/setup-receipt/set-external-bill', { listExternalBills: externalBills }, {
    //       headers: { 'token-owner': localStorage.getItem('key') }
    //     });
    //     setInvoiceData(prev => ({ ...prev, externalBills }));
    //     message.success('External bills updated successfully');
    //   } catch (error) {
    //     console.error('Error updating external bills:', error);
    //     message.error('Failed to update external bills');
    //   }
    // };

    const calculateTotal = () => {
        const itemsTotal = invoiceData.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
        const servicesTotal = invoiceData.services.reduce((sum, service) => sum + service.quantity * service.price, 0);
        let total = itemsTotal + servicesTotal;

        invoiceData.externalBills.forEach((bill) => {
            if (bill.isPercent) {
                total += total * (bill.value / 100);
            } else {
                total += bill.value;
            }
        });

        return total;
    };

    const columns = [
        { title: 'Tên món', dataIndex: 'name', key: 'name', width: 200 },
        { title: 'Đơn Giá', dataIndex: 'price', key: 'price', width: 150, render: (price) => `${price.toLocaleString()}đ` },
        { title: 'SL', dataIndex: 'quantity', key: 'quantity', width: 100 },
        {
            title: 'Thành Tiền',
            key: 'total',
            width: 150,
            render: (_, record) => `${(record.quantity * record.price).toLocaleString()}đ`
        },
    ];

    const onDragEnd = (result) => {
        if (!result.destination) {
            return;
        }

        const newLayout = Array.from(invoiceData.layout);
        const [reorderedItem] = newLayout.splice(result.source.index, 1);
        newLayout.splice(result.destination.index, 0, reorderedItem);

        setInvoiceData(prev => ({ ...prev, layout: newLayout }));
    };


    const renderInvoiceElement = (element) => {
        var servicesTotal = invoiceData.services.reduce((sum, service) => sum + (service.quantity * service.price), 0);
        var itemsTotal = invoiceData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

        const dimStyle = {
            opacity: 0.3,
            pointerEvents: 'none',
            transition: 'opacity 0.3s'
        };

        const normalStyle = {
            opacity: 1,
            transition: 'opacity 0.3s'
        };

        const getElementStyle = (elementType) => {
            return elementType === 'externalBills' ? normalStyle : dimStyle;
        };

        switch (element) {
            case 'logo':
                return invoiceData.logo && (
                    <div style={{ ...getElementStyle('logo'), display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                        <img src={invoiceData.logo} alt="Logo" style={{ maxWidth: '200px', borderRadius: '15px' }} />
                    </div>
                );

            case 'restaurantInfo':
                return (
                    <div style={{ ...getElementStyle('restaurantInfo'), textAlign: 'center' }}>
                        <h2>{invoiceData.restaurantName}</h2>
                        <p>{invoiceData.address}</p>
                        <p>ĐT: {invoiceData.phone}</p>
                        <p>Số HD: {invoiceData.taxId}</p>
                        <p>Bàn: abc</p>
                        <p>Nhân viên tạo: abc</p>
                        <p>Ngày: {dayjs().format('DD/MM/YYYY')}</p>
                        <p>Giờ vào: {dayjs().format('HH:mm:ss')} - Giờ ra {dayjs().format('HH:mm:ss')}</p>
                    </div>
                );

            case 'items':
                return (
                    <div style={{ ...getElementStyle('items') }}>
                        <h3 style={{ textAlign: 'center' }}>HOÁ ĐƠN THANH TOÁN</h3>
                        <Table
                            rowClassName={() => 'custom-row'}
                            style={{ marginBottom: '10px' }}
                            dataSource={invoiceData.items}
                            columns={columns}
                            pagination={false}
                            rowKey="id"
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                            Tổng tiền món: {itemsTotal.toLocaleString()}đ
                        </div>
                    </div>
                );

            case 'services':
                return (
                    <div style={{ ...getElementStyle('services') }}>
                        <h4>Phí dịch vụ</h4>
                        <Table rowClassName={() => 'custom-row'} dataSource={invoiceData.services} columns={columns} pagination={false} rowKey="id" />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                            Tổng tiền dịch vụ: {servicesTotal.toLocaleString()}đ
                        </div>
                    </div>
                );

            case 'externalBills':
                return (
                    <div style={{
                        ...getElementStyle('externalBills'),
                        backgroundColor: '#f5f5f5',
                        padding: '15px',
                        border: '2px solid #1890ff',
                        borderRadius: '4px',
                        boxShadow: '0 0 10px 10px rgba(24, 144, 255, 0.2)'
                    }}>
                        <h4 style={{ color: '#1890ff' }}>Các khoản chung</h4>
                        {invoiceData.externalBills && invoiceData.externalBills.map((bill, index) => (
                            <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <span>{bill.title} {bill.isPercent ? `(${bill.value}%)` : ''}</span>
                                <span>
                                    {bill.isPercent
                                        ? `${bill.value !== undefined ? (bill.value * (servicesTotal + itemsTotal) / 100).toLocaleString() : 0}đ`
                                        : `${bill.value !== undefined ? bill.value.toLocaleString() : '0'}đ`
                                    }
                                </span>
                            </div>
                        ))}
                    </div>
                );

            case 'footer':
                return invoiceData.footerText ? (
                    <div style={{
                        ...getElementStyle('footer'),
                        textAlign: 'center',
                        marginTop: '20px',
                        marginBottom: '20px',
                        whiteSpace: 'pre-line',
                    }}>
                        {invoiceData.footerText}
                    </div>
                ) : null;

            case 'total':
                return (
                    <div style={{ ...getElementStyle('total'), display: 'flex', justifyContent: 'center' }}>
                        <div>
                            <h4>Tổng cộng: {calculateTotal().toLocaleString()}đ</h4>
                        </div>
                    </div>
                );

            case 'qrCode':
                return invoiceData.qrCode && (
                    <div style={{ ...getElementStyle('qrCode'), display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
                        <img src={invoiceData.qrCode} alt="QR Code" style={{ maxWidth: '200px' }} />
                    </div>
                );

            default:
                return null;
        }
    };
    return (
        <Row gutter={24} className='me-1'>
            <Col span={12} style={{ position: 'sticky', top: 0, height: '90vh', overflowY: 'auto' }}>
                <div className='card' style={{
                    position: 'sticky',
                    top: 0,
                    maxHeight: '90vh',
                    overflowY: 'auto',
                }}>
                    <h3 className='m-2 text-center'>Thiết lập phí chung</h3>
                    <Form form={form} layout="vertical" className='m-2' onValuesChange={handleFormChange}>
                        <Form.List name="externalBills">
                            {(fields, { add, remove }) => (
                                <>
                                    {fields.map((field, index) => (
                                        <Space key={field.key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                                            <Form.Item
                                                {...field}
                                                name={[field.name, 'title']}
                                                fieldKey={[field.fieldKey, 'title']}
                                                rules={[{ required: true, message: 'Missing title' }]}
                                                label={<span>Tiêu đề</span>}
                                            >
                                                <Input placeholder="Tiêu đề" />
                                            </Form.Item>
                                            <Form.Item
                                                {...field}
                                                name={[field.name, 'isPercent']}
                                                fieldKey={[field.fieldKey, 'isPercent']}
                                                valuePropName="checked"
                                                label={<span>Đơn vị</span>}
                                            >
                                                <Switch checkedChildren="%" unCheckedChildren=" " />
                                            </Form.Item>
                                            <Form.Item
                                                {...field}
                                                name={[field.name, 'value']}
                                                fieldKey={[field.fieldKey, 'value']}
                                                rules={[{ required: true, message: 'Missing value' }]}
                                                label={<span>Giá</span>}
                                            >
                                                <InputNumber placeholder="Value" />
                                            </Form.Item>
                                            <MinusCircleOutlined onClick={() => remove(field.name)} />
                                        </Space>
                                    ))}
                                    <Form.Item>
                                        <Button type="default" onClick={() => add({ title: '', isPercent: false, value: 0 })} icon={<PlusOutlined />}>
                                            Thêm phí chung
                                        </Button>
                                    </Form.Item>
                                </>
                            )}
                        </Form.List>
                        <Form.Item>
                            <Space>
                                <Button type="primary" onClick={() => handleExternalBillsChange(form.getFieldValue('externalBills'))}>
                                    Lưu phí chung
                                </Button>
                                <Button onClick={resetToDefault}>Đặt về mặc định</Button>
                            </Space>
                        </Form.Item>
                    </Form>
                </div>
            </Col>
            <Col span={12} className='card' style={{ maxHeight: '90vh', overflowY: 'auto' }}>
                <Spin spinning={isLoading}>
                    <div className="invoice-preview "
                        style={{
                            padding: '20px',
                            backgroundColor: 'white',
                            color: 'black',
                            position: 'relative',
                            minHeight: '200px'
                        }}
                    >
                        {invoiceData.layout.map((element, index) => (
                            <div
                                key={element}
                                ref={element === 'externalBills' ? externalBillsRef : null}
                                style={{
                                    marginBottom: '10px',
                                    padding: '5px',
                                }}
                            >
                                {renderInvoiceElement(element)}
                            </div>
                        ))}
                    </div>
                </Spin>
            </Col>
        </Row>
    );
};

export default ExternalbillConfig;