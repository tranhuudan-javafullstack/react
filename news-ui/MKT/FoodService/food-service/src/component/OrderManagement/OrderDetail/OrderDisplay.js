import React from 'react';
import { Checkbox, Space, InputNumber } from 'antd';

const OrderDisplay = ({ orderData, selectedOrders, setSelectedOrders }) => {
    console.log(orderData);
    
    const handleOrderChange = (orderId, checked) => {
        const order = orderData.find(order => order.id.toString() === orderId);
        setSelectedOrders(prev => ({
            ...prev,
            [orderId]: {
                ...prev[orderId],
                selected: checked,
                quantity: checked ? order.quantity : undefined,
                items: Object.keys(prev[orderId]?.items || {}).reduce((acc, itemId) => {
                    acc[itemId] = checked;
                    return acc;
                }, {}),
            },
        }));
    };

    const handleAddonChange = (orderId, addonId, checked) => {
        setSelectedOrders(prev => ({
            ...prev,
            [orderId]: {
                ...prev[orderId],
                items: {
                    ...prev[orderId]?.items,
                    [addonId]: checked,
                },
            },
        }));
    };

    const handleQuantityChange = (orderId, value) => {
        const order = orderData.find(order => order.id.toString() === orderId);
        const newValue = Math.min(Math.max(1, value), order.quantity);
        setSelectedOrders(prev => ({
            ...prev,
            [orderId]: {
                ...prev[orderId],
                quantity: newValue,
            },
        }));
    };

    return (
        <>
            {orderData.map(order => {
                if (order.status === -1 || !order.foodID) return null;
                return (
                    <Space key={order.id} direction="vertical" style={{ display: 'flex', marginBottom: 16 }}>
                        <Space align="baseline">
                            <Checkbox
                                checked={selectedOrders[order.id]?.selected}
                                onChange={(e) => handleOrderChange(order.id.toString(), e.target.checked)}
                            >
                                {order.name}
                                {order.price > 0 && ` - ${order.price.toLocaleString()} đ`}
                                {order.quantity > 1 && ` (${order.quantity})`}
                            </Checkbox>
                            {selectedOrders[order.id]?.selected && order.quantity > 1 && (
                                <InputNumber
                                    min={1}
                                    max={order.quantity}
                                    value={selectedOrders[order.id]?.quantity}
                                    onChange={(value) => handleQuantityChange(order.id.toString(), value)}
                                    style={{ width: 80, marginLeft: 8 }}
                                />
                            )}
                        </Space>

                        {order.listItem && order.listItem.length > 0 && (
                            <Space direction="vertical" style={{ marginLeft: 32 }}>
                                {order.listItem.map(addon => (
                                    <Checkbox
                                        key={addon.id}
                                        checked={selectedOrders[order.id]?.items?.[addon.id]}
                                        onChange={(e) => handleAddonChange(order.id.toString(), addon.id.toString(), e.target.checked)}
                                    >
                                        <span>
                                            {addon.liteTitle}
                                            {addon.quantity > 1 ? ` x${addon.quantity}` : ''}
                                            {addon.price > 0 && ` - ${addon.price.toLocaleString()} đ`}
                                        </span>
                                    </Checkbox>
                                ))}
                            </Space>
                        )}
                    </Space>
                );
            })}
        </>
    );
};

export default OrderDisplay;