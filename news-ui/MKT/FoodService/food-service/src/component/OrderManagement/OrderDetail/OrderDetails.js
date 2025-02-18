import React, { useState, useEffect, useCallback } from 'react';
import { Card, List, Typography, Button, Input, Space, Modal, Checkbox, InputNumber, message, Collapse, Tag, Form, Radio } from 'antd';
import { DeleteOutlined, MinusOutlined, PlusOutlined, EditOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { API_DOMAIN_LOCAL } from '../../domain';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import ServiceChargeEditModal from './ServcieChargeEditModal';
import { receipt } from '../../../api';
import OrderDisplay from './OrderDisplay';
import fillInvoiceTemplate from './PrintBill';

const { Text } = Typography;
const { Panel } = Collapse;

const OrderDetails = ({ orderData, onUpdateQuantityAddOn, onUpdateQuantityOrder, onRemoveItem, onRemoveOrder, onAddOnsChange, tableInfo, foods }) => {
    const [totalAmount, setTotalAmount] = useState(0);
    
    const [itemsTotal, setItemsTotal] = useState(0);
    
    const [servicesTotal, setServicesTotal] = useState(0);
    
    const [externalBillsTotal, setExternalBillsTotal] = useState(0);
    
    const [editModalVisible, setEditModalVisible] = useState(false);
    
    const [editingItem, setEditingItem] = useState(null);
    
    const [selectedAddOns, setSelectedAddOns] = useState([]);
    
    const [descriptionModalVisible, setDescriptionModalVisible] = useState(false);
    
    const [currentDescription, setCurrentDescription] = useState('');
    
    const { receiptID } = useParams();
    
    const [serviceCharges, setServiceCharges] = useState([]);
    
    const [addServiceChargeModalVisible, setAddServiceChargeModalVisible] = useState(false);
    
    const [editServiceChargeModalVisible, setEditServiceChargeModalVisible] = useState(false);
    
    const [currentServiceCharge, setCurrentServiceCharge] = useState(null);
    
    const [externalBills, setExternalBills] = useState([]);
    
    const [printModalVisible, setPrintModalVisible] = useState(false);
    
    const [printType, setPrintType] = useState(null);
    
    const [selectedOrders, setSelectedOrders] = useState({});
    
    const [selectedServiceCharges, setSelectedServiceCharges] = useState([]);
    
    useEffect(() => {
        const total = orderData.reduce((acc, item) => acc + item.price * item.quantity, 0);
        setTotalAmount(total);
    }, [orderData]);
    useEffect(() => {
        calculateTotals();
    }, [orderData, serviceCharges, externalBills]);

    const calculateTotals = () => {
        const itemsSum = orderData.reduce((acc, item) => acc + item.price * item.quantity, 0);
        setItemsTotal(itemsSum);

        const servicesSum = serviceCharges.reduce((acc, charge) => {
            const chargeAmount = charge.isPercent ? (itemsSum * charge.value / 100) : (charge.value * charge.quantity);
            return acc + chargeAmount;
        }, 0);
        setServicesTotal(servicesSum);

        const externalBillsSum = externalBills.reduce((acc, bill) => {
            const billAmount = bill.isPercent ? ((itemsSum + servicesSum) * bill.value / 100) : bill.value;
            return acc + billAmount;
        }, 0);
        setExternalBillsTotal(externalBillsSum);

        setTotalAmount(itemsSum + servicesSum + externalBillsSum);
    };
    const renderExternalBills = () => (
        <Space direction="vertical" style={{ width: '100%', marginTop: '16px' }}>
            <Text strong style={{ fontSize: 18 }}>Phí phụ thu:</Text>
            {externalBills.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>{item.isPercent ? `${item.title}(${item.value}%)` : `${item.title}`}</Text>
                    <span>
                        {item.isPercent
                            ? `${((itemsTotal + servicesTotal) * item.value / 100).toLocaleString()}đ`
                            : `${item.value.toLocaleString()}đ`
                        }
                    </span>
                </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text strong>Tổng phụ thu</Text>
                <Text strong>{formatPrice(externalBillsTotal)}</Text>
            </div>
        </Space>
    );

    useEffect(() => {
        if (tableInfo) {
            fetchServiceCharges();
            fetchExternalBills();
        }
    }, []);
    const handleEditServiceCharge = (charge) => {
        setCurrentServiceCharge(charge);
        setEditServiceChargeModalVisible(true);
    };

    const fetchExternalBills = async () => {
        try {
            const response = await receipt.fetchExternalBills(receiptID || tableInfo.receiptID);
            setExternalBills(response.data.data || []);
        } catch (error) {
            console.error('Error fetching external bills:', error);
            message.error('Failed to fetch external bills');
        }

    }
    const fetchServiceCharges = async () => {
        try {
            const response = await receipt.fetchOrderDetails(receiptID || tableInfo.receiptID);
            setServiceCharges(response.data.data.listServiceCharges || []);
        } catch (error) {
            console.error('Error fetching service charges:', error);
            message.error('Failed to fetch service charges');
        }
    };
    const showEditModal = (item) => {
        setEditingItem(item);
        setSelectedAddOns(item.listItem || []);
        setEditModalVisible(true);
    };

    const handleEditModalOk = async () => {
        try {
            await onAddOnsChange(editingItem.id, selectedAddOns);
            setEditModalVisible(false);
        } catch (error) {
            console.error('Error updating add-ons:', error);
            message.error('Failed to update add-ons');
        }
    };

    const handleAddOnChange = (addOnItem, checked) => {
        setSelectedAddOns(prevAddOns => {
            if (checked) {
                if (!prevAddOns.some(item => item.addOnItemID === addOnItem.addOnItemID)) {
                    return [...prevAddOns, { ...addOnItem, quantity: 1 }];
                }
                return prevAddOns;
            } else {
                return prevAddOns.filter(item => item.addOnItemID !== addOnItem.addOnItemID);
            }
        });
    };

    const handleAddOnQuantityChange = (addOnItemID, quantity) => {
        setSelectedAddOns(prevAddOns =>
            prevAddOns.map(item =>
                item.addOnItemID === addOnItemID ? { ...item, quantity } : item
            )
        );
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };
    const showDescriptionModal = (description) => {
        setCurrentDescription(description);
        setDescriptionModalVisible(true);
    };


    const handleAddServiceCharge = async ({ title, quantity, isPercent, value }) => {
        try {
            const response = await receipt.createServiceCharge({
                receiptID: tableInfo.receiptID,
                title,
                quantity,
                isPercent,
                value
            });
            if (response.status === 200) {
                message.success('Service charge added successfully');
                setAddServiceChargeModalVisible(false);
                fetchServiceCharges();
            }

        } catch (error) {
            console.error('Error adding service charge:', error);
            message.error('Failed to add service charge');
        }
    };

    const handleUpdateServiceCharge = async (values) => {
        try {
            await axios.post(
                `${API_DOMAIN_LOCAL}api/fandb/running/waiter/service-charge/update`,
                {
                    id: currentServiceCharge.scID,
                    ...values
                },
                {
                    headers: {
                        'token-owner': localStorage.getItem('key'),
                    }
                }
            );
            message.success('Service charge updated successfully');
            setEditServiceChargeModalVisible(false);
            setCurrentServiceCharge(null);
            fetchServiceCharges();
        } catch (error) {
            console.error('Error updating service charge:', error);
            message.error('Failed to update service charge');
        }
    };
    const handleDeleteServiceCharge = async (id) => {
        try {
            await receipt.deteteServiceCharge({ id });
            message.success('Service charge deleted successfully');
            fetchServiceCharges();
        } catch (error) {
            console.error('Error deleting service charge:', error);
            message.error('Failed to delete service charge');
        }
    };
    const handlePrintOptionSelect = (type) => {
        setPrintType(type);
        if (type === 'partial') {
            const initialSelectedOrders = {};
            orderData.forEach(order => {
                if (order.status !== -1) {
                    const orderItems = {};
                    orderItems[order.id] = false;
                    if (order.listItem) {
                        order.listItem.forEach(item => {
                            orderItems[item.id] = false;
                        });
                    }
                    initialSelectedOrders[order.id] = {
                        selected: false,
                        items: orderItems
                    };
                }
            });
            setSelectedOrders(initialSelectedOrders);
            setSelectedServiceCharges(serviceCharges.map(sc => ({ ...sc, selected: false })));
        }
    };

    const handlePrintPartialBill = async () => {
        const selectedOrdersList = Object.entries(selectedOrders)
            .filter(([_, value]) => value.selected)
            .map(([orderID, value]) => {
                const selectedItems = Object.entries(value.items)
                    .filter(([_, selected]) => selected)
                    .map(([itemID, _]) => parseInt(itemID));

                return {
                    orderID: parseInt(orderID),
                    quantity: value.quantity || orderData.find(order => order.id.toString() === orderID).quantity,
                    listItem: selectedItems
                };
            });

        const selectedServiceChargeList = selectedServiceCharges
            .filter(sc => sc.selected)
            .map(sc => ({
                scID: sc.scID,
                quantity: 1
            }));
        try {
            const response = await axios.post(
                `${API_DOMAIN_LOCAL}api/fandb/running/cashier/bill-partial`,
                {
                    receiptID: tableInfo.receiptID,
                    listOrder: selectedOrdersList,
                    listServiceCharge: selectedServiceChargeList
                },
                {
                    headers: {
                        'token-owner': localStorage.getItem('key'),
                    }
                }
            );

            if (response.status === 200) {
                const template = await getPrintBillTemplate();
                if (template) {
                    await fillAndPrintReceipt(response.data.data, template);
                }
                setPrintModalVisible(false);
            }
        } catch (error) {
            console.error('Error printing partial bill:', error);
            message.error('Failed to print partial bill');
        }
    };

    const renderPrintOptions = () => (
        <Modal
            title="Chọn loại in hóa đơn"
            open={printModalVisible}
            onCancel={() => setPrintModalVisible(false)}
            footer={[
                <Button key="cancel" onClick={() => setPrintModalVisible(false)}>
                    Hủy
                </Button>,
                <Button
                    key="print"
                    type="primary"
                    onClick={() => {
                        if (printType === 'all') {
                            handlePrintRecipt();
                        } else {
                            handlePrintPartialBill();
                        }
                    }}
                >
                    In
                </Button>
            ]}
        >
            <Space direction="vertical" style={{ width: '100%' }}>
                <Radio.Group onChange={(e) => handlePrintOptionSelect(e.target.value)} value={printType}>
                    <Space direction="vertical">
                        <Radio value="all">In toàn bộ hóa đơn</Radio>
                        <Radio value="partial">In một phần hóa đơn</Radio>
                    </Space>
                </Radio.Group>

                {printType === 'partial' && (
                    <div style={{ marginTop: 16 }}>
                        <Text strong>Chọn món ăn:</Text>
                        <OrderDisplay
                            orderData={orderData}
                            selectedOrders={selectedOrders}
                            setSelectedOrders={setSelectedOrders}
                        />

                        <Text strong style={{ display: 'block', marginTop: 16 }}>Chọn phí dịch vụ:</Text>
                        {serviceCharges.map(charge => (
                            <div key={charge.scID} style={{ marginLeft: 16, marginTop: 8 }}>
                                <Checkbox
                                    checked={selectedServiceCharges.find(sc => sc.scID === charge.scID)?.selected}
                                    onChange={(e) => {
                                        setSelectedServiceCharges(prev =>
                                            prev.map(sc =>
                                                sc.scID === charge.scID
                                                    ? { ...sc, selected: e.target.checked }
                                                    : sc
                                            )
                                        );
                                    }}
                                >
                                    {charge.title}
                                </Checkbox>
                            </div>
                        ))}
                    </div>
                )}
            </Space>
        </Modal>
    );

    const renderPrintButton = () => (
        <Button onClick={() => setPrintModalVisible(true)} type="primary">
            In tạm tính
        </Button>
    );

    const getPrintBillTemplate = async () => {
        try {
            const response = await axios.post(`${API_DOMAIN_LOCAL}api/fandb/owner/setup-receipt/get-print-bill`, {}, {
                headers: {
                    'token-owner': localStorage.getItem('key'),
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error getting receipt template:', error);
            message.error('Failed to get receipt template');
            return null;
        }
    }

    const fillAndPrintReceipt = async (receiptData, template) => {
        const filledTemplate = fillInvoiceTemplate(template, receiptData);

        const printWindow = window.open('', '_blank');

        const printCSS = `
            <style>
            body{
            max-width: 345px;
            }
                    table th, table td {
                        text-align: center !important;
                    }
                                           
                     .order-column-1 { width: 40%; }
                     .order-column-2 { width: 25%; }
                     .order-column-3 { width: 15%; }
                     .order-column-4 { width: 20%; }
                    
                     .service-column-1 { width: 40%; }
                     .service-column-2 { width: 25%; }
                     .service-column-3 { width: 15%; }
                     .service-column-4 { width: 20%; }
                        body {
                            margin: 0 20px;
                        }
                @media print {
                    /* Common styles for both paper sizes */
                    body {
                        margin: 0;
                        padding: 2px;
                        font-family: 'Arial', sans-serif;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    
                    .invoice-table {
                        width: 100%;
                        border-collapse: collapse;
                    }
                    
                    .invoice-table th,
                    .invoice-table td {
                        padding: 1px;
                        text-align: left;
                    }
                    
                    h2, h4 {
                        margin: 3px 0;
                    }

                    /* Styles for 58mm paper */
                    @page[size="58mm"] {
                        margin: 0;
                        size: 58mm auto;
                    }
                    
                    .paper-58mm {
                        width: 58mm;
                        font-size: 9px;
                    }
                    
                    .paper-58mm .invoice-table th,
                    .paper-58mm .invoice-table td {
                        font-size: 8px;
                    }
                    
                    .paper-58mm h2 {
                        font-size: 12px;
                    }
                    
                    .paper-58mm h4 {
                        font-size: 10px;
                    }
                    
                    .paper-58mm .list-item {
                        font-size: 7px;
                    }
 

                    /* Styles for 80mm paper */
                    @page[size="80mm"] {
                        margin: 0;
                        size: 80mm auto;
                    }
                    
                    .paper-80mm {
                        width: 80mm;
                        font-size: 12px;
                    }
                    
                    .paper-80mm .invoice-table th,
                    .paper-80mm .invoice-table td {
                        font-size: 11px;
                    }
                    
                    .paper-80mm h2 {
                        font-size: 14px;
                    }
                    
                    .paper-80mm h4 {
                        font-size: 12px;
                    }
                    
                    .paper-80mm .list-item {
                        font-size: 10px;
                    }

                }

                /* Non-print preview styles */
                .preview-58mm {
                    width: 58mm;
                    margin: 0 auto;
                    border: 1px solid #ccc;
                    padding: 2px;
                }

                .preview-80mm {
                    width: 80mm;
                    margin: 0 auto;
                    border: 1px solid #ccc;
                    padding: 2px;
                }
            </style>
        `;

        const fullTemplate = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                ${printCSS}
            </head>
            <body>
                ${filledTemplate}
            </body>
            </html>
        `;

        printWindow.document.write(fullTemplate);
        printWindow.document.close();

        printWindow.onload = function () {
            try {
                printWindow.focus();
                printWindow.print();
                printWindow.onafterprint = function () {
                    printWindow.close();
                };
            } catch (error) {
                console.error('Printing failed:', error);
                message.error('In hóa đơn thất bại');
                printWindow.close();
            }
        };
    };


    const handlePrintRecipt = async () => {
        let dataReceipt = null;
        try {
            const responseReceipt = await axios.post(`${API_DOMAIN_LOCAL}api/fandb/running/waiter/receipt/print`, {
                receiptID: tableInfo.receiptID
            }, {
                headers: {
                    'token-owner': localStorage.getItem('key'),
                }
            });
            if (responseReceipt.status === 200) {
                dataReceipt = responseReceipt.data.data;
            } else {
                message.error('Failed to print receipt');
                return;
            }
        } catch (error) {
            console.error('Error printing receipt:', error);
            message.error('Failed to print receipt');
            return;
        }

        const template = await getPrintBillTemplate();
        if (template) {
            await fillAndPrintReceipt(dataReceipt, template);
        }
    }
    const renderServiceCharges = () => (
        <List
            dataSource={serviceCharges.filter(item => item.status !== -1)}
            renderItem={(item) => (
                <List.Item>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                        <Text style={{ marginLeft: '30px' }}>{item.title}</Text>
                        <Space>
                            <Text style={{ marginRight: '10px' }}>Số lượng: {item.quantity}</Text>
                            <Button
                                icon={<EditOutlined />}
                                onClick={() => handleEditServiceCharge(item)}
                            />
                            <Button
                                icon={<DeleteOutlined />}
                                onClick={() => handleDeleteServiceCharge(item.scID)}
                            />
                            <Text strong>{item.isPercent ? `${item.value}%` : formatPrice(item.value)}</Text>
                        </Space>
                    </div>
                </List.Item>
            )}
        />
    );
    const EditOrderAddons = ({ editingItem, foods, selectedAddOns, handleAddOnChange, handleAddOnQuantityChange }) => {
        const food = foods.find(food => food.foodID === editingItem.foodID);
        return (
            <Collapse defaultActiveKey={food?.listAddOn.map(addOn => addOn.addOnID)}>
                {food?.listAddOn.map(addOn => (
                    <Panel header={addOn.title} key={addOn.addOnID}>
                        {addOn.listItem.map(item => {
                            const selectedAddOn = selectedAddOns.find(selectedItem => selectedItem.addOnItemID === item.addOnItemID);
                            const isChecked = !!selectedAddOn;
                            return (
                                <div key={item.addOnItemID} style={{ marginBottom: '10px' }}>
                                    <Checkbox
                                        checked={isChecked}
                                        onChange={(e) => handleAddOnChange(item, e.target.checked)}
                                    >
                                        {item.title} {item.price > 0 && `- ${formatPrice(item.price)}`}
                                    </Checkbox>
                                    {isChecked && (
                                        <InputNumber
                                            min={1}
                                            value={selectedAddOn.quantity}
                                            onChange={(value) => handleAddOnQuantityChange(item.addOnItemID, value)}
                                            style={{ marginLeft: '10px' }}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </Panel>
                ))}
            </Collapse>
        );
    };

    const renderOrderItem = (item) => (
        <List.Item
            style={{
                marginLeft: item.isAddon ? '50px' : '0',
                fontSize: item.isAddon ? 'lighter' : 'inherit',
            }}
            key={item.id}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                <List.Item.Meta
                    title={
                        <Space direction="vertical" size={0}>
                            {item.name}
                            {item.timeCreate && (
                                <Text type="secondary">{dayjs(item.timeCreate).format('HH:mm')}</Text>
                            )}
                        </Space>
                    }
                    description={
                        <Space direction="vertical" size={0}>
                            {item.description && (
                                <Text
                                    italic
                                    underline
                                    onClick={() => showDescriptionModal(item.description)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    Xem ghi chú
                                </Text>
                            )}
                            {formatPrice(item.price)}
                        </Space>
                    }
                    style={{ marginRight: 20, flex: 1 }}
                />
                <Space direction="vertical" align="end">
                    {!item.isAddon && (
                        item.status === 1 ? (
                            <Tag color="yellow">Đang đợi</Tag>
                        ) : item.status === 2 ? (
                            <Tag color="blue">Đang chuẩn bị</Tag>
                        ) : item.status === 3 ? (
                            <Tag color="green">Đã hoàn thành</Tag>
                        ) : item.status === -1 ? (
                            <Tag color="red">Đã hủy</Tag>
                        ) : null
                    )}
                    {(!item.isAddon || (item.isAddon && item.type !== 1)) ? (
                        <Space>
                            <Button
                                icon={<MinusOutlined />}
                                onClick={() => item.isAddon
                                    ? onUpdateQuantityAddOn(item.id, item.addOnItemID, item.quantity - 1)
                                    : onUpdateQuantityOrder(item.id, item.quantity - 1, item.description)
                                }
                                disabled={item.quantity <= 1}
                            />
                            <Input
                                style={{ width: 35, textAlign: 'center' }}
                                value={item.quantity}
                                readOnly
                            />
                            <Button
                                icon={<PlusOutlined />}
                                onClick={() => item.isAddon
                                    ? onUpdateQuantityAddOn(item.id, item.addOnItemID, item.quantity + 1)
                                    : onUpdateQuantityOrder(item.id, item.quantity + 1, item.description)
                                }
                            />
                            {
                                !item.isAddon && (
                                    <Button
                                        icon={<EditOutlined />}
                                        onClick={() => !showEditModal(item)}
                                    />
                                )
                            }
                            <Button
                                icon={<DeleteOutlined />}
                                onClick={() => item.isAddon
                                    ? onRemoveItem(item.id, item.addOnItemID)
                                    : onRemoveOrder(item.id)
                                }
                            />
                        </Space>
                    ) : (
                        null
                    )}
                </Space>
            </div>

        </List.Item>
    );


    return (
        <div style={{ width: '100%', backgroundColor: '#fff', padding: '40px 10px', borderRadius: 8 }}>
            <div className="table-info">
                <p>Mã hóa đơn: {tableInfo.receiptID}</p>
                <p>Bàn: {tableInfo.table}</p>
                <p>Số điện thoại: {tableInfo.phoneNumber}</p>
                <p>Mã nhân viên: {tableInfo.employeeID_Create}</p>
                <p>Giờ vào: {dayjs(tableInfo.timeCreate).format('HH:mm DD/MM/YYYY')}</p>
            </div>
            <Card
                style={{
                    marginBottom: 16,
                    maxHeight: '40vh',
                    overflowY: 'auto',
                    ...(orderData.length > 5 && { overflowY: 'scroll' }),
                }}
            >
                <List
                    dataSource={orderData}
                    renderItem={renderOrderItem}
                />
            </Card>
            <div style={{ marginTop: 16 }}>
                <div style={{ padding: '16px 0' }}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Text strong>Tổng tiền món: {formatPrice(itemsTotal)}</Text>
                        </div>
                    </Space>
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text strong style={{ fontSize: 18 }}>Phí dịch vụ:</Text>
                            <Button icon={<PlusOutlined />} onClick={() => setAddServiceChargeModalVisible(true)}>Thêm</Button>
                        </div>
                        {serviceCharges.length > 0 && renderServiceCharges()}
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Text strong>Tổng phí dịch vụ: {formatPrice(servicesTotal)}</Text>
                        </div>
                    </Space>
                    {renderExternalBills()}
                    <Space direction="vertical" style={{ width: '100%', marginTop: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Text strong style={{ fontSize: 18 }}>Tổng cộng:</Text>
                            <Text strong>{formatPrice(totalAmount)}</Text>
                        </div>
                    </Space>
                </div>
                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                    <Button>Ghép đơn</Button>
                    <Button>Tách đơn</Button>
                    {renderPrintButton()}
                </Space>
            </div>
            <Modal
                title="Thêm lựa chọn"
                open={editModalVisible}
                onOk={handleEditModalOk}
                onCancel={() => setEditModalVisible(false)}
            >
                {editingItem && (
                    <div>
                        <h4>{editingItem.name}</h4>
                        <p>Price: {formatPrice(editingItem.price)}</p>
                        <EditOrderAddons
                            editingItem={editingItem}
                            foods={foods}
                            selectedAddOns={selectedAddOns}
                            handleAddOnChange={handleAddOnChange}
                            handleAddOnQuantityChange={handleAddOnQuantityChange}
                        />
                    </div>
                )}
            </Modal>
            {renderPrintOptions()}
            <Modal
                title="Ghi chú"
                open={descriptionModalVisible}
                onOk={() => setDescriptionModalVisible(false)}
                onCancel={() => setDescriptionModalVisible(false)}
                footer={null}
                style={{ textAlign: 'center' }}
            >
                <h1 style={{ fontSize: 18, fontWeight: 500 }}>{currentDescription}</h1>
            </Modal>
            <Modal
                title="Thêm phí dịch vụ"
                open={addServiceChargeModalVisible}
                onCancel={() => setAddServiceChargeModalVisible(false)}
                footer={null}
            >
                <Form onFinish={handleAddServiceCharge}>
                    <Form.Item name="title" label="Tên phí" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="quantity" label="Số lượng" rules={[{ required: true }]}>
                        <InputNumber min={1} />
                    </Form.Item>
                    <Form.Item name="isPercent" label="Loại phí">
                        <Radio.Group>
                            <Radio value={false}>Giá trị cố định</Radio>
                            <Radio value={true}>Phần trăm</Radio>
                        </Radio.Group>
                    </Form.Item>
                    <Form.Item name="value" label="Giá trị" rules={[{ required: true }]}>
                        <InputNumber min={0} />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">Thêm</Button>
                    </Form.Item>
                </Form>
            </Modal>
            <ServiceChargeEditModal
                visible={editServiceChargeModalVisible}
                onCancel={() => setEditServiceChargeModalVisible(false)}
                onFinish={handleUpdateServiceCharge}
                currentServiceCharge={currentServiceCharge}
            />
        </div>
    );
};
export default OrderDetails;