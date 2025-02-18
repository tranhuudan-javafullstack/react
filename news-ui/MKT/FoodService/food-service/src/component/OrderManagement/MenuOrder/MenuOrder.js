import React, { useState, useEffect } from 'react';
import { Card, List, Button, Input, message, Select, Tabs, Image, Typography, Tooltip, Modal, Badge, Skeleton } from 'antd';
import { HeartOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import PreviewModal from '../../FoodManagement/EditFood/PreviewModal';
import { useParams } from 'react-router-dom';
import OrderPage from '../OrderDetail/OrderPage';
import {  global, order, receipt } from '../../../api';
import FoodImage from './FoodImage';
import { API_DOMAIN } from '../../domain';

const { Search } = Input;
const { Option } = Select;
const { Text } = Typography;

const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

const MenuOrder = () => {
    const { receiptID } = useParams();
    
    const [categories, setCategories] = useState([]);
    const [foods, setFoods] = useState([]);
    const [searchValue, setSearchValue] = useState('');
    const [languages, setLanguages] = useState([]);
    const [selectedLanguage, setSelectedLanguage] = useState(localStorage.getItem('languageID') || '0');
    const [activeTab, setActiveTab] = useState('all');
    const [sortOrder, setSortOrder] = useState('asc');
    const [isPreviewVisible, setIsPreviewVisible] = useState(false);
    const [selectedFood, setSelectedFood] = useState(null);
    const [isCartModalVisible, setIsCartModalVisible] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const [cartItems, setCartItems] = useState([]);
    const [lastActiveTab, setLastActiveTab] = useState('all');
    const [isLoading, setIsLoading] = useState(true);
    const [OrderDetailData, setOrderDetailData] = useState({});

    useEffect(() => {
        fetchData();
        fetchCartData();
    }, [selectedLanguage]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            message.loading({ content: 'Loading...', key: 'loading', duration: 0 });
            const response = await global.fetchMenu();
            const data = response.data;
            const sortedCategories = data.data.Categorys.sort((a, b) => a.sorting - b.sorting);
            setCategories(sortedCategories);
            setFoods(data.data.Foods);
            setLanguages(data.data.Languages);
            message.success({ content: 'Menu loaded', key: 'loading' });
        } catch (error) {
            console.error("Error fetching data:", error);
            message.error("Failed to fetch menu. Please try again later.");
        }
        setIsLoading(false);
    };

    const fetchCartData = async () => {
        try {
            const response = await receipt.fetchOrderDetails(receiptID);
            if (receiptID) {
                document.title = "Hóa đơn số: " + receiptID;
            }
            const cartData = response.data.data.listOrder;
            setOrderDetailData(response);
            setCartItems(cartData);
            setCartCount(cartData.length);
        } catch (error) {
            console.error("Error fetching cart data:", error);
        }
    };

    const createOrder = async (selectedFood) => {
        try {
            const response = await order.createOrder({
                receiptID: receiptID,
                foodID: selectedFood.foodID,
                    isTakeOut: false,
                    quantity: selectedFood.quantity,
                    description: selectedFood.notes,
                    listItem: selectedFood.selectedAddOns
            });
            const data = response.data;
            if (data.status === 1) {
                message.success({ content: 'Order created', key: 'loading' });
                fetchCartData();
            } else {
                message.error({ content: 'Order error', key: 'loading' });
            }
        } catch (error) {
            console.error("Error creating order:", error);
        }
    };

    const handleLanguageChange = (value) => {
        setSelectedLanguage(value);
        localStorage.setItem('languageID', value);
    };

    const getFoodsForCategory = (categoryID) => {
        return foods.filter(food => {
            const category = categories.find(c => c.categoryID === parseInt(categoryID));
            return category && category.listLink.some(link => link.foodID === food.foodID);
        });
    };

    const filteredFoods = (categoryID) => {
        const categoryFoods = categoryID === 'all' ? foods : getFoodsForCategory(categoryID);
        return categoryFoods.filter(food =>
            food.title.toLowerCase().includes(searchValue.toLowerCase())
        ).sort((a, b) => {
            if (sortOrder === 'asc') {
                return a.price - b.price;
            } else {
                return b.price - a.price;
            }
        });
    };

    const toggleSortOrder = () => {
        setSortOrder(prevOrder => prevOrder === 'asc' ? 'desc' : 'asc');
    };

    const showPreview = (food) => {
        setSelectedFood(food);
        setIsPreviewVisible(true);
    };

    const hidePreview = () => {
        setIsPreviewVisible(false);
    };

    const handleAddToCart = (selectedFood) => {
        createOrder(selectedFood);
    };

    const showCartModal = () => {
        setIsCartModalVisible(true);
    };

    const hideCartModal = () => {
        setIsCartModalVisible(false);
    };

    const handleSearch = (e) => {
        setSearchValue(e.target.value);
        if (e.target.value) {
            setLastActiveTab(activeTab);
            setActiveTab('all');
        } else {
            setActiveTab(lastActiveTab);
        }
    };

    const getFoodCountInCategory = (categoryID) => {
        return filteredFoods(categoryID).length;
    };

    return (
        <div className='row'>
            <div className='container col-12'>
                <div className="mb-3 d-flex justify-content-between align-items-center">
                    <Search
                        placeholder="Tìm kiếm món ăn"
                        onChange={handleSearch}
                        style={{ width: 300 }}
                    />
                    <Button onClick={toggleSortOrder}>
                        Sắp xếp theo giá {sortOrder === 'asc' ? '↑' : '↓'}
                    </Button>
                    <Select
                        value={selectedLanguage}
                        onChange={handleLanguageChange}
                        style={{ width: 120 }}
                    >
                        {languages?.map((lang, index) => (
                            <Option key={index} value={index.toString()}>{lang}</Option>
                        ))}
                    </Select>
                    <Badge count={cartCount}>
                        <Button
                            type="primary"
                            icon={<ShoppingCartOutlined />}
                            onClick={showCartModal}
                        >
                            Hóa đơn
                        </Button>
                    </Badge>
                </div>
                <Tabs
                    activeKey={activeTab}
                    onChange={(key) => setActiveTab(key)}
                    size="large"
                    style={{
                        backgroundColor: 'white',
                        padding: '10px',
                        borderRadius: '10px',
                    }}
                    items={[
                        {
                            key: 'all',
                            label: (
                                <>
                                    {localStorage.getItem('languageID') === '0' ? 'Tất cả' : 'All'}
                                    <Badge count={filteredFoods('all').length} style={{ marginLeft: 8 }} />
                                </>
                            ),
                            children: isLoading ? (
                                <Skeleton active paragraph={{ rows: 10 }} />
                            ) : (
                                <List
                                    style={{ overflowY: 'auto', maxHeight: '80vh', width: '100%' }}
                                    dataSource={filteredFoods('all')}
                                    renderItem={(food) => (
                                        <List.Item>
                                            <Card
                                                hoverable
                                                style={{ width: '100%', minHeight: '150px' }}
                                            >
                                                <div className="row">
                                                    <div className="col-2">
                                                            <FoodImage food={food} />
                                                    </div>
                                                    <div className="col-10">
                                                        <Text
                                                            className="m-3"
                                                            strong
                                                            style={{ fontSize: '22px' }}
                                                        >
                                                            {food.title}
                                                        </Text>
                                                        <div className="m-0 ms-5">
                                                            <Tooltip title={food.description} placement="topLeft">
                                                                <Text
                                                                    className="w-100"
                                                                    type="secondary"
                                                                    style={{
                                                                        fontSize: '18px',
                                                                        display: 'block',
                                                                        overflow: 'hidden',
                                                                        textOverflow: 'ellipsis',
                                                                        whiteSpace: 'nowrap',
                                                                    }}
                                                                >
                                                                    {food.description}
                                                                </Text>
                                                            </Tooltip>
                                                            </div>
                                                        <div className="d-flex justify-content-between align-items-center mt-3">
                                                            <div>
                                                                <Text className="m-3 me-2" type="danger" strong>
                                                                    {formatPrice(food.price)}
                                                                </Text>
                                                                <Text className="m-3 ms-0" delete>
                                                                    {formatPrice(food.price * 1.2)}
                                                                </Text>
                                                            </div>
                                                            <Button type="primary" size="large" onClick={() => showPreview(food)} style={{ width: '120px' }}>
                                                                Đặt món
                                                            </Button>
                                                        </div>
                                                        <div className="mt-3">
                                                            <Text className="m-3 me-2" type="secondary">
                                                                {food.countOrder} Đã bán
                                                            </Text>
                                                            <Text className="m-3 ms-0" type="secondary">
                                                                <HeartOutlined /> {food.countLike}
                                                            </Text>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Card>
                                        </List.Item>
                                    )}
                                />
                            ),
                        },
                        ...categories.map((category) => ({
                            key: category.categoryID.toString(),
                            label: (
                                <>
                                    {category.title}
                                    <Badge count={getFoodCountInCategory(category.categoryID)} style={{ marginLeft: 8 }} />
                                </>
                            ),
                            children: isLoading ? (
                                <Skeleton active paragraph={{ rows: 10 }} />
                            ) : (
                                <List
                                    style={{ overflowY: 'auto', maxHeight: '80vh', width: '100%' }}
                                    dataSource={filteredFoods(category.categoryID)}
                                    renderItem={(food) => (
                                        <List.Item>
                                            <Card
                                                hoverable
                                                style={{ width: '100%', minHeight: '150px' }}
                                            >
                                                <div className="row">
                                                    <div className="col-2">
                                                        <FoodImage food={food} />
                                                    </div>
                                                    <div className="col-10">
                                                        <Text
                                                            className="m-3"
                                                            strong
                                                            style={{ fontSize: '22px' }}
                                                        >
                                                            {food.title}
                                                        </Text>
                                                        <div className="m-0 ms-5">
                                                            <Tooltip title={food.description} placement="topLeft">
                                                                <Text
                                                                    className="w-100"
                                                                    type="secondary"
                                                                    style={{
                                                                        fontSize: '18px',
                                                                        display: 'block',
                                                                        overflow: 'hidden',
                                                                        textOverflow: 'ellipsis',
                                                                        whiteSpace: 'nowrap',
                                                                    }}
                                                                >
                                                                    {food.description}
                                                                </Text>
                                                            </Tooltip>
                                                        </div>
                                                        <div className="d-flex justify-content-between align-items-center mt-3">
                                                            <div>
                                                                <Text className="m-3 me-2" type="danger" strong>
                                                                    {formatPrice(food.price)}
                                                                </Text>
                                                                <Text className="m-3 ms-0" delete>
                                                                    {formatPrice(food.price * 1.2)}
                                                                </Text>
                                                            </div>
                                                            <Button type="primary" size="large" onClick={() => showPreview(food)} style={{ width: '120px' }}>
                                                                Đặt món
                                                            </Button>
                                                        </div>
                                                        <div className="mt-3">
                                                            <Text className="m-3 me-2" type="secondary">
                                                                {food.countOrder} Đã bán
                                                            </Text>
                                                            <Text className="m-3 ms-0" type="secondary">
                                                                <HeartOutlined /> {food.countLike}
                                                            </Text>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Card>
                                        </List.Item>
                                    )}
                                />
                            ),
                        })),
                    ]}
                />
                {selectedFood && (
                    <PreviewModal
                        title={selectedFood.title}
                        isPreviewVisible={isPreviewVisible}
                        hidePreview={hidePreview}
                        formValues={{
                            foodID: selectedFood.foodID,
                            title: selectedFood.title,
                            description: selectedFood.description,
                            price: selectedFood.price
                        }}
                        previewImage={selectedFood.foodID}
                        addOns={selectedFood.listAddOn}
                        onAddToCart={handleAddToCart}
                    />
                )}
            </div>
            <Modal
                open={isCartModalVisible}
                onCancel={hideCartModal}
                footer={null}
                width={600}
            >
                <OrderPage
                    foods={foods}
                    OrderDetailData={OrderDetailData}
                    cartItems={cartItems}
                    setCartItems={setCartItems}
                    setCartCount={setCartCount}
                />
            </Modal>
        </div>
    );
};

export default MenuOrder;