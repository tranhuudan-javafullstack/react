import React, { useState, useEffect } from 'react';
import { Tabs, Table, Button, Tag, Badge, message, Checkbox, Select, Space, Modal, Dropdown } from 'antd';
import axios from 'axios';
import { API_DOMAIN_LOCAL } from '../domain';
import dayjs from 'dayjs';
import { CheckOutlined, UndoOutlined, PrinterOutlined } from '@ant-design/icons';
import { v4 as uuidv4 } from 'uuid';
import PrintModal from './PrintModal';
import { global, order } from '../../api';
import FoodFilter from './FoodFilter';

const { Option } = Select;

const Chef = () => {
    const [orders, setOrders] = useState([]);
    const [menu, setMenu] = useState([]);
    const [selectedFoodIDs, setSelectedFoodIDs] = useState([]);
    const [filterTable, setFilterTable] = useState(null);
    const [isPrintModalVisible, setIsPrintModalVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        fetchOrders();
        fetchMenu();
        loadSelectedFoodIDs();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await order.fetchOrders();
            setOrders(Object.values(response.data.data));
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    };

    const fetchMenu = async () => {
        try {
            const response = await global.fetchMenu();
            setMenu(response.data.data.Foods);
        } catch (error) {
            console.error('Error fetching menu:', error);
        }
    };

    const loadSelectedFoodIDs = () => {
        const savedFoodIDs = JSON.parse(localStorage.getItem('selectedFoodIDs'));
        if (savedFoodIDs && savedFoodIDs.length > 0) {
            setSelectedFoodIDs(savedFoodIDs);
        }
    };

    const handlePrint = (order) => {
        setSelectedOrder(order);
        setIsPrintModalVisible(true);
    };

    const handlePrintConfirm = async (templateId) => {
        try {
            const response = await axios.post(
                `${API_DOMAIN_LOCAL}api/fandb/running/kitchen-staff/order-design/get`,
                { id: templateId },
                {
                    headers: {
                        'token-owner': localStorage.getItem('key'),
                    }
                }
            );

            const template = response.data;
            const filledTemplate = fillOrderTemplate(template, selectedOrder);

            const printWindow = window.open('', '_blank');
            printWindow.document.write(filledTemplate);
            printWindow.document.close();

            printWindow.onload = function () {
                printWindow.focus();
                printWindow.print();
                printWindow.onafterprint = function () {
                    printWindow.close();
                };
            };

            setIsPrintModalVisible(false);
        } catch (error) {
            console.error('Error printing order:', error);
            message.error('Failed to print order');
        }
    };

    const fillOrderTemplate = (template, order) => {
        const food = menu.find(f => f.foodID === order.foodID);
        const addOnItems = order.listItem;

        let filledTemplate = 1;
        const templateId = 1;
        switch (templateId) {
            case 1:
                filledTemplate = template
                    .replace('<div class="store-name">Nhà Hàng AIO</div>', `<div class="store-name">Nhà Hàng AIO</div>`)
                    .replace('<div class="table-name">Bàn 5</div>', `<div class="table-name">Bàn: ${order.table}</div>`)
                    .replace('<div class="order-info">17:21 13/07 (Mang đi 106547)</div>',
                        `<div class="order-info">${dayjs(order.timeCreate).format('HH:mm DD/MM')} ${order.isTakeOut ? '(Mang đi)' : ''} - #${order.orderID}</div>`)
                    .replace('<div class="product-name">Hồng Trà Sữa (Size M)</div>', `<div class="product-name">${food ? food.title : 'Unknown'}</div>`);
                break;

            case 2:
                let addOnItemsHtml = addOnItems.map(item => `<div>${item.quantity}x ${item.liteTitle}</div>`).join('');
                filledTemplate = template
                    .replace('<div class="left-column">', `
                <div class="left-column">
                  <div class="rotated-text">Bàn: ${order.table}</div>
                  <div class="rotated-text">${dayjs(order.timeCreate).format('HH:mm')}</div>
              `)
                    .replace('<div class="header-row">', `
                <div class="header-row">
                  #${order.orderID} - ${food ? food.title : 'Unknown'}
              `)
                    .replace('<div class="add-on-items">', `
                <div class="add-on-items">
                  ${addOnItemsHtml}
              `);
                break;

        }

        return filledTemplate;
    };


    const handleOrderStatus = async (orderID) => {
        const updatedOrders = orders.map(order =>
            order.orderID === orderID ? { ...order, status: order.status === 1 ? 2 : 1 } : order
        );
        setOrders(updatedOrders);
    };

    const handleFoodIDSelect = (foodID) => {
        const updatedSelection = selectedFoodIDs.includes(foodID)
            ? selectedFoodIDs.filter(id => id !== foodID)
            : [...selectedFoodIDs, foodID];
        setSelectedFoodIDs(updatedSelection);
        localStorage.setItem('selectedFoodIDs', JSON.stringify(updatedSelection));
    };

    const filteredOrders = orders.filter(order => {
        const foodFilter = selectedFoodIDs.length === 0 || selectedFoodIDs.includes(order.foodID);
        const tableFilter = !filterTable || order.table === filterTable;
        return foodFilter && tableFilter;
    });

    const columns = [
        {
            title: 'Order ID',
            dataIndex: 'orderID',
            key: 'orderID',
            sorter: (a, b) => a.orderID - b.orderID,
            sortDirections: ['descend', 'ascend'],
        },
        {
            title: 'Bàn',
            dataIndex: 'table',
            key: 'table',
            sorter: (a, b) => a.table.localeCompare(b.table),
            sortDirections: ['descend', 'ascend'],
        },
        {
            title: 'Món ăn',
            dataIndex: 'foodID',
            key: 'foodID',
            sorter: (a, b) => {
                const foodA = menu.find(food => food.foodID === a.foodID);
                const foodB = menu.find(food => food.foodID === b.foodID);
                return foodA.title.localeCompare(foodB.title);
            },
            sortDirections: ['descend', 'ascend'],
            render: (foodID, record) => {
                const food = menu.find(food => food.foodID === foodID);
                return (
                    <div>
                        <div>{food ? food.title : 'Unknown'}</div>
                        {record.listItem.map(item => {
                            const addOnItem = menu.flatMap(food => food.listAddOn.flatMap(addOn => addOn.listItem))
                                .find(addOnItem => addOnItem.addOnItemID === item.addOnItemID);
                            return addOnItem ? (
                                <div key={item.addOnItemID} style={{ fontSize: '0.9em', color: '#666', marginLeft: '2em' }}>
                                    {addOnItem.title.toString().includes('Size') ? (
                                        <span>
                                            {addOnItem.title}
                                        </span>
                                    ) : ['S', 'M', 'L', 'XL'].includes(addOnItem.title) ? (
                                        <span>
                                            Size {addOnItem.title}
                                        </span>
                                    ) : (
                                        <span>
                                            {item.quantity}x {addOnItem.title}
                                        </span>
                                    )
                                    }
                                </div>
                            ) : null;
                        })}
                    </div>
                );
            },
        },
        {
            title: 'Số lượng',
            dataIndex: 'quantity',
            key: 'quantity',
            sorter: (a, b) => a.quantity - b.quantity,
            sortDirections: ['descend', 'ascend'],
        },
        {
            title: 'Ghi chú',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            sorter: (a, b) => a.status - b.status,
            sortDirections: ['descend', 'ascend'],
            render: (status) => (
                <Tag color={status === 1 ? 'yellow' : 'green'}>
                    {status === 1 ? 'Chờ chế biến' : 'Đã chế biến'}
                </Tag>
            ),
        },
        {
            title: 'Giờ gọi',
            dataIndex: 'timeCreate',
            key: 'timeCreate',
            sorter: (a, b) => dayjs(a.timeCreate).unix() - dayjs(b.timeCreate).unix(),
            sortDirections: ['descend', 'ascend'],
            render: (timeCreate) => dayjs(timeCreate).format('HH:mm:ss'),
        },
        {
            title: 'Action',
            key: 'action',
            render: (record) => (
                <div>
                    <Button
                        style={{ backgroundColor: record.status === 1 ? '#34C759' : '#FF6B6B', color: 'white', marginRight: '8px' }}
                        icon={record.status === 1 ? <CheckOutlined /> : <UndoOutlined />}
                        onClick={() => handleOrderStatus(record.orderID)}
                    >
                        {record.status === 1 ? 'Hoàn thành' : 'Hoàn tác'}
                    </Button>
                    {record.status === 1 && (
                        <Button
                            icon={<PrinterOutlined />}
                            onClick={() => handlePrint(record)}
                        >
                            In
                        </Button>
                    )}
                </div>
            ),
        },
    ];
    const pendingOrders = filteredOrders.filter(order => order.status === 1);
    const completedOrders = filteredOrders.filter(order => order.status !== 1);

    const tableOptions = [...new Set(orders.map(order => order.table))].sort();
    return (
        <div className='card'>
            <h3 className='m-4'>Danh sách Order</h3>
            <div className='ms-2'>
                <Select
                    style={{ width: 200, marginRight: '10px' }}
                    placeholder="Filter by Table"
                    onChange={setFilterTable}
                    allowClear
                >
                    {tableOptions.map(table => (
                        <Option key={table} value={table}>Bàn {table}</Option>
                    ))}
                </Select>
                <FoodFilter
                    selectedFoodIDs={selectedFoodIDs}
                    setSelectedFoodIDs={setSelectedFoodIDs}
                    menu={menu}
                    handleFoodIDSelect={handleFoodIDSelect}
                />
            </div>
            <Tabs
                className='mt-1'
                size="large"
                defaultActiveKey="1"
                style={{
                    backgroundColor: 'white',
                    padding: '10px',
                    borderRadius: '10px',
                }}
                items={[
                    {
                        label: (
                            <span>
                                Chờ chế biến
                                <Badge count={pendingOrders.length} showZero style={{ marginLeft: 5 }} />
                            </span>
                        ),
                        key: '1',
                        children: (
                            <Table
                                dataSource={pendingOrders}
                                columns={columns}
                                rowKey="orderID"
                                pagination={false}
                                sortDirections={['descend', 'ascend']}
                                style={{ backgroundColor: 'white' }}
                                hoverable
                                sticky
                                scroll={{ y: '60vh' }}
                            />
                        ),
                    },
                    {
                        label: (
                            <span>
                                Đã chế biến
                                <Badge count={completedOrders.length} showZero style={{ marginLeft: 5 }} />
                            </span>
                        ),
                        key: '2',
                        children: (
                            <Table
                                dataSource={completedOrders}
                                columns={columns}
                                rowKey="orderID"
                                pagination={false}
                                sortDirections={['descend', 'ascend']}
                                style={{ backgroundColor: 'white' }}
                                hoverable
                                sticky
                                scroll={{ y: '60vh' }}
                            />
                        ),
                    },
                    {
                        label: 'Tất cả',
                        key: '3',
                        children: (
                            <Table
                                dataSource={filteredOrders}
                                columns={columns}
                                rowKey="orderID"
                                pagination={false}
                                sortDirections={['descend', 'ascend']}
                                style={{ backgroundColor: 'white' }}
                                hoverable
                                sticky
                                scroll={{ y: '60vh' }}
                            />
                        ),
                    },
                ]}
            />
            <PrintModal
                visible={isPrintModalVisible}
                onCancel={() => setIsPrintModalVisible(false)}
                onOk={handlePrintConfirm}
            />
        </div>
    );
};

export default Chef;