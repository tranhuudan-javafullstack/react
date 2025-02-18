
import React, { useState, useEffect } from 'react';
import { AutoComplete, Button, message, Card, List, Input, Modal, Popconfirm, Select } from 'antd';
import { DownOutlined, UpOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import Food from '../FoodManagement/Food/Food';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import {  API_DOMAIN_LOCAL } from '../domain';
import { EditOutlined } from '@ant-design/icons';
import { category, global } from '../../api';

const { Search } = Input;
const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

const token = localStorage.getItem('key') || '';
const CategoryList = () => {
    const [categories, setCategories] = useState([]);
    const [filteredCategories, setFilteredCategories] = useState([]);
    const [foods, setFoods] = useState([]);
    const [expanded, setExpanded] = useState({});
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newFoods, setNewFoods] = useState({});
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [languages, setLanguages] = useState([]);
    const [selectedLanguage, setSelectedLanguage] = useState(localStorage.getItem('languageID') || '0');
    const tokenOwner = localStorage.getItem('key') || '';
    const [selectedIndex, setSelectedIndex] = useState(0);
    const { Option } = Select;
    const removeFoodFromCategory = async (linkID) => {
        try {
            const response = await category.deleteFoodFromCategory(
                { linkID: linkID },
            )
            message.success(response?.data?.message || "Món ăn đã được xóa khỏi danh mục");
            fetchData();
        } catch (error) {
            message.error(error.response?.data?.message || "An error occurred");
        }
    };

    useEffect(() => {
        global.cacheAllImages();
    }, []);

    useEffect(() => {
        setSelectedIndex(languages.findIndex(lang => lang === selectedLanguage));
    }, [languages]);
    useEffect(() => {
        setSelectedLanguage(localStorage.getItem('languageID'));
    })
    useEffect(() => {
        fetchData();
    }, [selectedLanguage]);

    useEffect(() => {
        const lowercasedSearch = searchValue.toLowerCase();
        const filtered = categories.filter(category =>
            category.title && category.title.toLowerCase().includes(lowercasedSearch)
        );
        setFilteredCategories(filtered);
    }, [searchValue, categories]);

    const fetchData = async () => {
        try {
            message.loading({ content: 'Loading...', key: 'loading', duration: 0 });
            const response = await global.fetchMenu();
            const data = response.data;
            const sortedCategories = data.data.Categorys.sort((a, b) => a.sorting - b.sorting);
            setCategories(sortedCategories);
            setFilteredCategories(sortedCategories);
            setFoods(data.data.Foods);
            setLanguages(data.data.Languages);
            setExpanded(prev => {
                const newExpanded = {};
                data.data.Categorys.forEach(cat => {
                    newExpanded[cat.categoryID] = prev[cat.categoryID] || false;
                });
                return newExpanded;
            });
            localStorage.setItem('key', token);
            message.loading({ content: 'Loading...', key: 'loading', duration: 0.1 });
        } catch (error) {
            console.error("Error fetching data:", error);
            message.error("Failed to fetch data. Please try again later.");
        }
    };
    const toggleExpand = (id) => {
        setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
    };
    const showModal = () => {
        setIsModalVisible(true);
    };
    const showEditModal = (category) => {
        setEditingCategory(category);
        setIsEditModalVisible(true);
    };

    const handleOk = async () => {
        if (newCategoryName.trim()) {
            try {
                const response = await category.createCategory(
                    {
                        sorting: categories.length + 1,
                        displayType: 1,
                        title: newCategoryName.trim()
                    }
                );
                if (response.data.data) {

                }
                setNewCategoryName('');
                setIsModalVisible(false);
                message.success(`Category added successfully`);
                fetchData();
            } catch (error) {
                message.error(error.response?.data?.message || "An error occurred");
            }
        } else {
            message.warning("Please enter a category name");
        }
    };
    const handleEditOk = async () => {
        if (editingCategory && newCategoryName.trim()) {
            try {
                const response = await axios.post(API_DOMAIN_LOCAL + 'api/fandb/owner/setup-menu/category/translate',
                    {
                        languageID: selectedLanguage,
                        categoryID: editingCategory.categoryID,
                        title: newCategoryName.trim()
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'token-owner': tokenOwner,
                        }
                    }

                );
                if (response.status === 1) {
                    message.success(`Category updated successfully`);
                }
                setCategories(prevCategories =>
                    prevCategories.map(category =>
                        category.categoryID === editingCategory.categoryID
                            ? { ...category, title: newCategoryName.trim() }
                            : category
                    )
                );
                setFilteredCategories(prevFiltered =>
                    prevFiltered.map(category =>
                        category.categoryID === editingCategory.categoryID
                            ? { ...category, title: newCategoryName.trim() }
                            : category
                    )
                );

                setNewCategoryName('');
                setIsEditModalVisible(false);
                message.success(`Category updated successfully`);
            } catch (error) {
                message.error(error.response?.data?.message || "An error occurred");
            }
        } else {
            message.warning("Please enter a category name");
        }
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setIsEditModalVisible(false);
        setNewCategoryName('');
    };

    const addFood = async (categoryID) => {
        const food = newFoods[categoryID];
        if (food && food.title && food.price) {
            try {
                await category.addFoodToCategory(
                    {
                        sorting: categories.find(c => c.categoryID === categoryID).listLink.length + 1,
                        categoryID: categoryID,
                        foodID: food.foodID
                    },
                )
                message.success("Food item added successfully");
                fetchData();
            } catch (error) {
                message.error(error.response?.data?.message || "An error occurred");
            }
            setNewFoods(prev => ({ ...prev, [categoryID]: { title: '', price: '' } }));
        } else {
            message.warning("Please select a food item");
        }
    };
    const handleFoodSelection = (categoryID, value) => {
        const selectedFood = foods.find(food => food.title === value);
        if (selectedFood) {
            setNewFoods(prev => ({
                ...prev,
                [categoryID]: { title: selectedFood.title, price: selectedFood.price, foodID: selectedFood.foodID }
            }));
        }
    };
    const onDragEnd = async (result) => {
        if (!result.destination) return;
        const items = Array.from(filteredCategories);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        setFilteredCategories(items);
        try {
            const response = await category.updateCategory({
                categoryID: reorderedItem.categoryID,
                sorting: result.destination.index + 1,
                displayType: 1
            });

            if (response.status === 1) {
            }

        } catch (error) {
            message.error(error.response?.data?.message || "An error occurred while updating category order");
        }
    };
    const handleDeleteCategory = async (categoryID) => {
        try {
            await category.deleteCategory({ categoryID: categoryID });
            message.success("Category deleted successfully");
            fetchData();
        } catch (error) {
            message.error(error.response?.data?.message || "An error occurred");
        }
    };
    const handleEditCategory = (categoryID) => {
        showEditModal(categories.find(c => c.categoryID === categoryID));
    }
    const handleLanguageChange = (e) => {
        setSelectedLanguage(e);
        localStorage.setItem('languageID', e);
        fetchData();
    }
    return (
        <div className='row'>
            <div className="col-8  mt-5">
                <h2 className="mb-4 text-center">Danh mục món ăn</h2>
                <div className="mb-3 d-flex justify-content-between align-items-center">
                    <Search
                        placeholder="Tìm kiếm danh mục"
                        onChange={(e) => setSearchValue(e.target.value)}
                        style={{ width: 300 }}
                    />
                    <Select
                        value={selectedLanguage}
                        onChange={handleLanguageChange}
                        style={{ width: 120 }}
                    >
                        {languages?.map((lang, index) => (
                            <Option key={index} value={index.toString()}>{lang}</Option>
                        ))}
                    </Select>
                    <Button type="primary" icon={<PlusOutlined />} onClick={showModal}>
                        Thêm danh mục
                    </Button>
                </div>
                <DragDropContext
                    onDragEnd={onDragEnd}>
                    <Droppable droppableId={uuidv4()}>
                        {(provided) => (
                            <div

                                ref={provided.innerRef}
                            >
                                {filteredCategories.map((category, index) => (
                                    <Draggable
                                        key={category.categoryID}
                                        draggableId={category.categoryID.toString()}
                                        index={index}
                                    >
                                        {(provided) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                style={{
                                                    ...provided.draggableProps.style,
                                                    marginBottom: '8px'
                                                }}
                                            >
                                                <Card
                                                    title={
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <div style={{ flex: 1, marginRight: '10px' }}>{category.title}</div>
                                                            <AutoComplete
                                                                style={{ width: '100%', marginRight: '10px', marginLeft: '50px' }}
                                                                options={foods
                                                                    .filter(food => !category.listLink?.some(link => link.foodID === food.foodID))
                                                                    .map(food => ({
                                                                        value: food.title || 'Unknow title',
                                                                        label: `${food.title || 'Unknow title'} - ${formatPrice(food.price)}`
                                                                    }))}
                                                                value={newFoods[category.categoryID]?.title || ''}
                                                                onChange={(value) => handleFoodSelection(category.categoryID, value)}
                                                                placeholder="Chọn món ăn"
                                                                filterOption={(inputValue, option) =>
                                                                    option.value.toUpperCase().includes(inputValue.toUpperCase())
                                                                }
                                                                onSearch={(value) => setNewFoods(prev => ({ ...prev, [category.categoryID]: { title: value } }))}
                                                            />
                                                            <Button
                                                                style={{ marginRight: '10px' }}
                                                                onClick={() => addFood(category.categoryID)}
                                                            >
                                                                Thêm món
                                                            </Button>
                                                            <Button
                                                                icon={<EditOutlined />}
                                                                onClick={() => handleEditCategory(category.categoryID)}
                                                            />
                                                        </div>
                                                    }
                                                    extra={
                                                        <div>
                                                            <Button
                                                                type="text"
                                                                icon={expanded[category.categoryID] ? <UpOutlined /> : <DownOutlined />}
                                                                onClick={() => toggleExpand(category.categoryID)}
                                                            />
                                                            <Popconfirm
                                                                title="Are you sure you want to delete this category?"
                                                                onConfirm={() => handleDeleteCategory(category.categoryID)}
                                                                okText="Yes"
                                                                cancelText="No"
                                                            >
                                                                <Button type="text" danger icon={<DeleteOutlined />} />
                                                            </Popconfirm>
                                                        </div>
                                                    }
                                                    style={{ width: '100%' }}
                                                    styles={{
                                                        header: {
                                                            backgroundColor: expanded[category.categoryID] ? '#cce6ff' : '#ddd',
                                                            transition: 'background-color 0.3s'
                                                        }
                                                    }}
                                                >
                                                    {expanded[category.categoryID] && (
                                                        <div>
                                                            <List
                                                                dataSource={category.listLink}
                                                                renderItem={(link) => {
                                                                    const food = foods.find(f => f.foodID === link.foodID);
                                                                    return food && (
                                                                        <List.Item
                                                                            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginLeft: '30px' }}
                                                                            actions={[
                                                                                <Button
                                                                                    type="text"
                                                                                    danger
                                                                                    onClick={() => removeFoodFromCategory(link.linkID)}
                                                                                >
                                                                                    <DeleteOutlined />
                                                                                </Button>
                                                                            ]}
                                                                        >
                                                                            <List.Item.Meta title={food.title} />
                                                                            <div>{formatPrice(food.price)}</div>
                                                                        </List.Item>
                                                                    );
                                                                }}
                                                            />
                                                        </div>
                                                    )}
                                                </Card>
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            </div>
            <div className='col-4 mt-5'>
                <Food foodss={foods} />
            </div>

            <Modal
                title="Sửa tên danh mục"
                open={isEditModalVisible}
                onOk={handleEditOk}
                onCancel={handleCancel}
            >
                <Input
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder={editingCategory ? editingCategory.title : "Nhập tên danh mục"}
                />
            </Modal>
            <Modal
                title="Thêm danh mục mới"
                open={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
            >
                <Input
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Nhập tên danh mục mới"
                />
            </Modal>
        </div>
    );
};
export default CategoryList;