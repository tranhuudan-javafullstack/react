import React, { useState, useEffect } from 'react';
import axios from 'axios';
import OrderDetails from './OrderDetails';
import { API_DOMAIN_LOCAL } from '../../domain';
import { useParams } from 'react-router-dom';
import { message } from 'antd';
import { receipt } from '../../../api';

const OrderPage = ({ foods, cartItems, setCartItems, setCartCount,OrderDetailData }) => {
    const [orderData, setOrderData] = useState([]);
    const [tableInfo, setTableInfo] = useState({});
    const { receiptID } = useParams();

    useEffect(() => {
        fetchOrderData();
    }, [cartItems.length]);

    const fetchOrderData = async () => {
        try {
            const response = await receipt.fetchOrderDetails(receiptID);
            const transformedData = transformApiResponse(response.data.data.listOrder);
            const { table, phoneNumber, employeeID_Create, timeCreate } = response.data.data;
            setTableInfo({ table, receiptID, phoneNumber, employeeID_Create, timeCreate });
            setOrderData(transformedData);
            setCartItems(response.data.data.listOrder);
            setCartCount(response.data.data.listOrder.length);
        } catch (error) {
            console.error('Error fetching order data:', error);
            message.error('Failed to fetch order data');
        }
    };

    const findFoodById = (foodID) => {
        return foods.find(food => food.foodID === foodID);
    };

    const findAddOnItemById = (food, addOnItemID) => {
        for (const addOn of food.listAddOn) {
            const item = addOn.listItem.find(item => item.addOnItemID === addOnItemID);
            if (item) return item;
        }
        return null;
    };

    const transformApiResponse = (apiData) => {
        return apiData.flatMap(order => {
            const food = findFoodById(order.foodID);
            if (!food) {
                return [];
            }
            const mainItem = {
                id: order.orderID,
                foodID: order.foodID,
                status: order.status,
                timeCreate: order.timeCreate,
                name: food.title,
                price: food.price,
                quantity: order.quantity,
                isTakeOut: order.isTakeOut,
                description: order.description,
                listItem: order.listItem,
                isAddon: false,
            };
            const addOnItems = order.listItem.map(item => {
                const addOnItem = findAddOnItemById(food, item.addOnItemID);
                return {
                    id: item.id,
                    addOnItemID: item.addOnItemID,
                    name: addOnItem ? addOnItem.title : `Add-on ${item.addOnItemID}`,
                    price: addOnItem ? addOnItem.price : 0,
                    quantity: item.quantity,
                    description: addOnItem ? addOnItem.description : '',
                    isAddon: true,
                    type: addOnItem ? addOnItem.type : null,
                    parentOrderID: order.orderID,
                };
            });
            return [mainItem, ...addOnItems];
        });
    };

    const handleUpdateQuantityOrder = async (id, newQuantity, description) => {
        try {
            await axios.post(API_DOMAIN_LOCAL + 'api/fandb/running/waiter/order/update', {
                orderID: id,
                isTakeOut: false,
                quantity: newQuantity,
                description: description
            }, {
                headers: {
                    'token-owner': localStorage.getItem('key'),
                }
            });
            message.success('Quantity updated successfully');
            fetchOrderData();
        } catch (error) {
            console.error('Error updating quantity:', error);
            message.error('Failed to update quantity');
        }
    };
    const handleUpdateQuantityAddOn = async (id, addOnItemID, newQuantity) => {
        try {
            await axios.post(API_DOMAIN_LOCAL + 'api/fandb/running/waiter/item/update', {
                id: id,
                addOnItemID: addOnItemID,
                quantity: newQuantity
            }, {
                headers: {
                    'token-owner': localStorage.getItem('key'),
                }
            });
            message.success('Quantity updated successfully');
            fetchOrderData();
        } catch (error) {
            console.error('Error updating quantity:', error);
            message.error('Failed to update quantity');
        }
    };

    const handleRemoveItem = async (orderID) => {
        try {
            await axios.post(API_DOMAIN_LOCAL + 'api/fandb/running/waiter/item/delete', {
                id: orderID
            }, {
                headers: {
                    'token-owner': localStorage.getItem('key'),
                }
            });
            message.success('Item removed successfully');
            fetchOrderData();
        } catch (error) {
            console.error('Error removing item:', error);
            message.error('Failed to remove item');
        }
    };

    const handleRemoveOder = async (orderID) => {
        try {
            await axios.post(API_DOMAIN_LOCAL + 'api/fandb/running/waiter/order/delete', {
                orderID: orderID
            }, {
                headers: {
                    'token-owner': localStorage.getItem('key'),
                }
            });
            message.success('Item removed successfully');
            fetchOrderData();
        } catch (error) {
            console.error('Error removing item:', error);
            message.error('Failed to remove item');
        }
    };

    const handleAddOnsChange = async (orderID, newAddOns) => {
        try {
            const addOnsToAdd = newAddOns.filter(addOn => !addOn.id);

            for (const addOn of addOnsToAdd) {
                await axios.post(API_DOMAIN_LOCAL + 'api/fandb/running/waiter/item/create', {
                    orderID: orderID,
                    addOnItemID: addOn.addOnItemID,
                    quantity: addOn.quantity
                }, {
                    headers: {
                        'token-owner': localStorage.getItem('key'),
                    }
                });
            }

            message.success('Add-ons updated successfully');
            fetchOrderData();
        } catch (error) {
            console.error('Error updating add-ons:', error);
            message.error('Failed to update add-ons');
        }
    };

    return (
        <OrderDetails
            orderData={orderData}
            onUpdateQuantityAddOn={handleUpdateQuantityAddOn}
            onUpdateQuantityOrder={handleUpdateQuantityOrder}
            onRemoveItem={handleRemoveItem}
            onRemoveOrder={handleRemoveOder}
            onAddOnsChange={handleAddOnsChange}
            tableInfo={tableInfo}
            foods={foods}
        />
    );
};

export default OrderPage;