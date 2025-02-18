import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { List, Card, Button, Input, Select, Modal, InputNumber, message, Row, Col } from 'antd';
import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Option } from 'antd/es/mentions';
import { API_DOMAIN, API_DOMAIN_LOCAL } from '../../domain';
import axios from 'axios';

const Food = ({ foodss, onFoodsUpdate }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [visible, setVisible] = useState(false);
  const [newFoodName, setNewFoodName] = useState('');
  const [newFoodPrice, setNewFoodPrice] = useState(0);
  const [foods, setFoods] = useState(foodss);

  useEffect(() => {
    setFoods(foodss);
  }, [foodss]);

  const handleEdit = (foodID) => navigate(`edit/${foodID}`);

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const handleSearch = (value) => setSearchTerm(value);

  const handleStatusFilter = (value) => setStatusFilter(value);

  const fetchFoods = async () => {
    try {
      const response = await axios.get(API_DOMAIN + "api/global/menu" + parseInt(localStorage.getItem('languageID')));
      const data = response.data;
      if (data.status === 1) {
        setFoods(data.data.Foods);
        if (onFoodsUpdate) {
          onFoodsUpdate(data.data);
        }
      } else {
        message.error('Không thể tải danh sách món ăn');
      }
    } catch (error) {
      message.error('Lỗi khi tải danh sách món ăn');
    }
  };

  const handleAddFood = async () => {
    const newFood = { title: newFoodName, price: newFoodPrice, description: "", sorting: 1, oldPrice: 0 };
    try {
      message.loading({ content: 'Adding food...', key: 'loading', duration: 0 });
      const response = await fetch(`${API_DOMAIN_LOCAL}api/fandb/owner/setup-menu/food/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'token-owner': localStorage.getItem('key') },
        body: JSON.stringify(newFood)
      });
      const data = await response.json();
      if (data.status === 1) {
        message.success({ content: 'Food added', key: 'loading', duration: 0 });
        setVisible(false);
        setNewFoodName('');
        setNewFoodPrice(0);
        fetchFoods();
      } else {
        message.error('Thêm món ăn thất bại');
      }
    } catch (error) {
      message.error('Thêm món ăn thất bại');
    }
  };

  const handleCancel = () => setVisible(false);

  const filteredFoods = useMemo(() => foods.filter((food) => {
    const title = food.title ? food.title.toLowerCase() : "";
    const description = food.description && food.description.toLowerCase();
    return (
      (title.includes(searchTerm.toLowerCase()) || description.includes(searchTerm.toLowerCase())) &&
      (statusFilter === 'all' || (statusFilter === 'active' && food.status === 1) || (statusFilter === 'inactive' && food.status === 0))
    );
  }), [foods, searchTerm, statusFilter]);

  return (
    <div>
      <h2 className='mb-4 text-center'>Danh sách món ăn</h2>
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
          <Input
            placeholder="Tìm món ăn"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ flex: 1, marginRight: '10px' }}
          />
          <Select
            defaultValue="all"
            style={{ width: 150 }}
            onChange={handleStatusFilter}
          >
            <Select.Option value="all">Tất cả</Select.Option>
            <Select.Option value="active">Đang hoạt động</Select.Option>
            <Select.Option value="inactive">Tạm ngưng</Select.Option>
          </Select>
        </div>
        <List
          style={{ height: '60vh', overflow: 'auto' }}
          dataSource={filteredFoods}
          renderItem={(food) => (
            <List.Item
              key={food.foodID}
              actions={[
                <Button
                  icon={<EditOutlined />}
                  onClick={() => handleEdit(food.foodID)}
                  style={{ marginTop: 4 }}
                />,
              ]}
            >
              <List.Item.Meta
                title={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{food.foodID}. &ensp;</span>
                    <span> {food.title}</span>
                    <span style={{ marginLeft: 'auto' }}>{formatPrice(food.price)}</span>
                  </div>
                }
              />
            </List.Item>
          )}
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setVisible(true)}
          style={{ float: 'right', marginTop: '10px', marginRight: '20px' }}
        >
          Thêm món
        </Button>
      </Card>
      <Modal
        title="Thêm món ăn mới"
        open={visible}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            Hủy
          </Button>,
          <Button key="submit" type="primary" onClick={handleAddFood}>
            Thêm
          </Button>,
        ]}
      >
        <Row gutter={24} style={{ marginTop: '10px' }}>
          <Col span={12}>
            <Input
              placeholder="Tên món ăn"
              value={newFoodName}
              onChange={(e) => setNewFoodName(e.target.value)}
            />
          </Col>
          <Col span={12}>
            <InputNumber
              className='w-100'
              placeholder="Giá (VND)"
              onChange={(value) => setNewFoodPrice(value)}
            />
          </Col>
        </Row>
      </Modal>
    </div>
  );
};

export default Food;