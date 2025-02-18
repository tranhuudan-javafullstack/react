import React, { useEffect, useCallback, useState } from 'react';
import { Form, Input, InputNumber, Switch, message, Button, Upload, Row, Col, Modal, Card, Popconfirm, Checkbox, Select } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_DOMAIN, API_DOMAIN_LOCAL } from '../../domain';
import { PlusOutlined, EyeOutlined } from '@ant-design/icons';
import AddOnManagement from '../AddOnManagement/AddOnmanagement';
import PreviewModal from './PreviewModal';
import { global } from '../../../api';
const { TextArea } = Input;

const EditFood = () => {
  const [form] = Form.useForm();
  const [addOnForm] = Form.useForm();
  const [addOnItemForm] = Form.useForm();
  const { foodID } = useParams();
  const navigate = useNavigate();
  const [isAddMode, setIsAddMode] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [addOns, setAddOns] = useState([]);
  const [isAddOnModalVisible, setIsAddOnModalVisible] = useState(false);
  const [currentAddOn, setCurrentAddOn] = useState(null);
  const [isAddOnItemModalVisible, setIsAddOnItemModalVisible] = useState(false);
  const [currentAddOnItem, setCurrentAddOnItem] = useState(null);
  const [currentaddOnID, setCurrentaddOnID] = useState(null);

  const languageID = localStorage.getItem('languageID');
  const tokenOwner = localStorage.getItem('key') || '';

  const handleError = useCallback((error, customMessage) => {
    console.error(customMessage, error);
    message.error('An error occurred. Please try again.');
  }, []);

  const fetchFoodData = useCallback(async () => {
    console.log(foodID);

    try {
      message.loading({ content: 'Loading...', key: 'loading', duration: 0 });
      const response = await global.fetchMenu();
      const selectedFood = response.data.data.Foods.find(item => item.foodID === parseInt(foodID));
      if (selectedFood) {
        form.setFieldsValue(selectedFood);
        global.getImageFromCache(selectedFood.foodID).then((cachedImageUrl) => {
          if (cachedImageUrl) {
            setPreviewImage(cachedImageUrl);
          } else {
            setPreviewImage(`https://fandbsoft.com/global/fandb/image/food?foodID=${selectedFood.foodID}`);
          }
        })
        setFileList(selectedFood.image ? [{ uid: '-1', name: 'image.png', status: 'done', url: selectedFood.image }] : []);
        setAddOns(selectedFood.listAddOn || []);
      }
      message.success({ content: 'Loaded', key: 'loading' });


    } catch (error) {
      handleError(error, 'Error fetching food data:');
    }
  }, [foodID, languageID, tokenOwner, form, handleError]);

  useEffect(() => {
    if (!isAddMode && foodID) {
      fetchFoodData();
    }
  }, [fetchFoodData, isAddMode, foodID]);

  const updateFood = useCallback(async (values) => {
    if (isAddMode && (!values.title || !values.price)) {
      message.warning('Please fill in all required fields and upload an image');
      return;
    }
    try {
      const messageKey = isAddMode ? 'food-adding' : 'food-updating';
      message.loading({ content: isAddMode ? 'Adding food...' : 'Updating food...', key: messageKey });

      let imageUrl = previewImage;
      if (fileList.length > 0 && fileList[0].originFileObj) {
        const fileExtension = fileList[0].originFileObj.type.split('/')[1];
        const formData = fileList[0].originFileObj;
        const uploadUrl = isAddMode
          ? `${API_DOMAIN_LOCAL}api/fandb/owner/setup-menu/files/upload-image-food?fileExtension=${fileExtension}`
          : `${API_DOMAIN_LOCAL}api/fandb/owner/setup-menu/files/upload-image-food?foodID=${parseInt(foodID)}&fileExtension=${fileExtension}`;
        const uploadResponse = await axios.post(uploadUrl, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'token-owner': tokenOwner
          },
        });
        if (uploadResponse.data.status === 1) {
          message.success({ content: 'Image uploaded successfully', key: messageKey });
          imageUrl = uploadResponse.data.url;
        } else {
          message.error({ content: 'Image upload failed', key: messageKey });
        }
      }

      const foodData = {
        sorting: values.sorting,
        title: values.title,
        description: values.description,
        price: values.price,
        oldPrice: 0,
        image: imageUrl,
        status: values.status ? 1 : 0
      };

      if (isAddMode) {
        const response = await axios.post(`${API_DOMAIN_LOCAL}api/fandb/owner/setup-menu/food/create`, foodData, {
          headers: { 'token-owner': tokenOwner }
        });
        setIsAddMode(false);
        foodID = response.data.foodID;
      } else {
        await axios.post(`${API_DOMAIN_LOCAL}api/fandb/owner/setup-menu/food/update`, {
          ...foodData,
          foodID: parseInt(foodID)
        }, {
          headers: { 'token-owner': tokenOwner }
        });
        await axios.post(`${API_DOMAIN_LOCAL}api/fandb/owner/setup-menu/food/change-status`, {
          ...foodData,
          foodID: parseInt(foodID)
        }, {
          headers: { 'token-owner': tokenOwner }
        });

        await axios.post(`${API_DOMAIN_LOCAL}api/fandb/owner/setup-menu/food/translate-title`, {
          languageID,
          foodID: parseInt(foodID),
          title: values.title
        }, {
          headers: { 'token-owner': tokenOwner }
        });

        await axios.post(`${API_DOMAIN_LOCAL}api/fandb/owner/setup-menu/food/translate-description`, {
          languageID,
          foodID: parseInt(foodID),
          description: values.description || ''
        }, {
          headers: { 'token-owner': tokenOwner }
        });
      }

      message.success({ content: isAddMode ? 'Food added successfully' : 'Food updated successfully', key: messageKey });
    } catch (error) {
      handleError(error, 'Error updating food:');
    }
  }, [foodID, languageID, tokenOwner, handleError, isAddMode, previewImage, fileList]);

  const handlePreviewImage = useCallback((file) => {
    if (file instanceof File) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    } else if (file.url) {
      setPreviewImage(file.url);
    }
  }, []);

  const handleAddNew = useCallback(() => {
    form.resetFields();
    setIsAddMode(true);
    setPreviewImage('');
    setFileList([]);
    setAddOns([]);
  }, [form]);

  const handleUpload = useCallback(({ fileList: newFileList }) => {
    if (newFileList.length > 0) {
      const file = newFileList[0].originFileObj || newFileList[0];
      if (file.size / 1024 / 1024 > 10) {
        message.error('Hình ảnh phải nhỏ hơn 10MB');
        return;
      }
      setFileList(newFileList);
      handlePreviewImage(file);
    }
  }, [handlePreviewImage]);

  const showAddOnModal = (addOn = null) => {
    setCurrentAddOn(addOn);
    if (addOn) {
      addOnForm.setFieldsValue(addOn);
    } else {
      addOnForm.resetFields();
    }
    setIsAddOnModalVisible(true);
  };

  const handleAddOnOk = async () => {
    try {
      const values = await addOnForm.validateFields();
      console.log(currentAddOn);
      if (currentAddOn) {
        await axios.post(`${API_DOMAIN_LOCAL}api/fandb/owner/setup-menu/food-addon/update`, {
          addOnID: currentAddOn.addOnID,
          sorting: values.sorting,
          foodID: parseInt(foodID),
          type: values.type
        }, {
          headers: { 'token-owner': tokenOwner }
        });

        await axios.post(`${API_DOMAIN_LOCAL}api/fandb/owner/setup-menu/food-addon/translate-title`, {
          languageID,
          addOnID: currentAddOn.addOnID,
          title: values.title
        }, {
          headers: { 'token-owner': tokenOwner }
        });

        await axios.post(`${API_DOMAIN_LOCAL}api/fandb/owner/setup-menu/food-addon/translate-description`, {
          languageID,
          addOnID: currentAddOn.addOnID,
          description: values.description || ''
        }, {
          headers: { 'token-owner': tokenOwner }
        });

        setAddOns(addOns.map(addon => addon.addOnID === currentAddOn.addOnID ? { ...addon, ...values } : addon));
      } else {
        const response = await axios.post(`${API_DOMAIN_LOCAL}api/fandb/owner/setup-menu/food-addon/create`, {
          sorting: values.sorting,
          foodID: parseInt(foodID),
          type: values.type,
          title: values.title,
          description: values.description
        }, {
          headers: { 'token-owner': tokenOwner }
        });

        setAddOns([...addOns, { ...values, addOnID: response.data.data }]);
      }

      setIsAddOnModalVisible(false);
      addOnForm.resetFields();
      message.success(`Add-on ${currentAddOn ? 'updated' : 'created'} successfully`);
    } catch (error) {
      handleError(error, `Error ${currentAddOn ? 'updating' : 'creating'} add-on:`);
    }
  };

  const handleDeleteAddOn = async (addOnID) => {
    try {
      await axios.post(`${API_DOMAIN_LOCAL}api/fandb/owner/setup-menu/food-addon/delete`, {
        addOnID: addOnID
      }, {
        headers: { 'token-owner': tokenOwner }
      });

      setAddOns(addOns.filter(addon => addon.addOnID !== addOnID));
      message.success('Add-on deleted successfully');
    } catch (error) {
      handleError(error, 'Error deleting add-on:');
    }
  };

  const showAddOnItemModal = (addOnID, addOnItem = null) => {
    setCurrentaddOnID(addOnID);
    setCurrentAddOnItem(addOnItem);
    if (addOnItem) {
      addOnItemForm.setFieldsValue(addOnItem);
    } else {
      addOnItemForm.resetFields();
    }
    setIsAddOnItemModalVisible(true);
  };

  const handleAddOnItemOk = async () => {
    try {
      const values = await addOnItemForm.validateFields();
      if (currentAddOnItem) {
        await axios.post(`${API_DOMAIN_LOCAL}api/fandb/owner/setup-menu/food-addon-item/update`, {
          addOnItemID: currentAddOnItem.addOnItemID,
          type: values.type,
          isDefault: values.isDefault,
          sorting: values.sorting,
          addOnID: currentaddOnID,
          Price: values.price,
          OldPrice: values.oldPrice
        }, {
          headers: { 'token-owner': tokenOwner }
        });

        await axios.post(`${API_DOMAIN_LOCAL}api/fandb/owner/setup-menu/food-addon-item/translate-title`, {
          languageID,
          addOnItemID: currentAddOnItem.addOnItemID,
          title: values.title
        }, {
          headers: { 'token-owner': tokenOwner }
        });

        await axios.post(`${API_DOMAIN_LOCAL}api/fandb/owner/setup-menu/food-addon-item/translate-description`, {
          languageID,
          addOnItemID: currentAddOnItem.addOnItemID,
          description: values.description
        }, {
          headers: { 'token-owner': tokenOwner }
        });

        setAddOns(addOns.map(addon =>
          addon.addOnID === currentaddOnID
            ? { ...addon, listItem: addon.listItem.map(item => item.addOnItemID === currentAddOnItem.addOnItemID ? { ...item, ...values } : item) }
            : addon
        ));
      } else {
        const response = await axios.post(`${API_DOMAIN_LOCAL}api/fandb/owner/setup-menu/food-addon-item/create`, {
          type: values.type,
          isDefault: values.isDefault,
          sorting: values.sorting,
          addOnID: currentaddOnID,
          price: values.price,
          oldPrice: values.oldPrice,
          title: values.title,
          description: values.description
        }, {
          headers: { 'token-owner': tokenOwner }
        });
        setAddOns(addOns.map(addon =>
          addon.addOnID === currentaddOnID
            ? { ...addon, listItem: [...(addon.listItem || []), { ...values, addOnItemID: response.data.data }] }
            : addon
        ));
      }

      setIsAddOnItemModalVisible(false);
      addOnItemForm.resetFields();
      message.success(`Add-on item ${currentAddOnItem ? 'updated' : 'created'} successfully`);
    } catch (error) {
      handleError(error, `Error ${currentAddOnItem ? 'updating' : 'creating'} add-on item:`);
    }
  };

  const handleDeleteAddOnItem = async (addOnID, addOnItemID) => {
    try {
      await axios.post(`${API_DOMAIN_LOCAL}api/fandb/owner/setup-menu/food-addon-item/delete`, {
        addOnItemID
      }, {
        headers: { 'token-owner': tokenOwner }
      });

      setAddOns(addOns.map(addon =>
        addon.addOnID === addOnID
          ? { ...addon, listItem: addon.listItem.filter(item => item.addOnItemID !== addOnItemID) }
          : addon
      ));
      message.success('Add-on item deleted successfully');
    } catch (error) {
      handleError(error, 'Error deleting add-on item:');
    }
  };
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);

  const showPreview = () => {
    setIsPreviewVisible(true);
  };

  const hidePreview = () => {
    setIsPreviewVisible(false);
  };
  const handleRemove = (file) => {
    setIsPreviewVisible(false);
    const index = fileList.indexOf(file);
    const newFileList = fileList.slice();
    newFileList.splice(index, 1);
    setFileList(newFileList);
  };
  return (
    <div className="edit-food-container">
      <h2 className="mb-4 text-center">{isAddMode ? 'Thêm món mới' : 'Thông tin món'}</h2>
      <Row gutter={16}>
        <Col span={12}>
          <Form
            form={form}
            name="editFood"
            layout="vertical"
            onFinish={updateFood}
          >
            <Form.Item name="title" label={<span style={{ color: 'white' }}>Tên món ăn</span>} rules={[{ required: true, message: 'Please input the food name!' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="description" label={<span style={{ color: 'white' }}>Mô tả</span>}>
              <TextArea rows={4} />
            </Form.Item>
            <Form.Item name="sorting" label={<span style={{ color: 'white' }}>Thứ tự sắp xếp</span>}>
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="price" label={<span style={{ color: 'white' }}>Giá</span>} rules={[{ required: true, message: 'Please input the price!' }]}>
              <InputNumber
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/\$\s?|(,*)/g, '')}
                style={{ width: '100%' }}
              />
            </Form.Item>
            <Form.Item name="status" label={<span style={{ color: 'white' }}>Status</span>} valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item style={{ textAlign: 'center' }}>
              <Button type="primary" htmlType="submit">
                {isAddMode ? "Thêm món" : "Cập nhật"}
              </Button>
              <Button onClick={() => navigate('/resource/foodservice/owner/index.html')} style={{ marginLeft: 8 }}>Trở về</Button>
              {!isAddMode && <Button onClick={handleAddNew} style={{ marginLeft: 8 }}>Thêm mới</Button>}
              <Button onClick={showPreview} icon={<EyeOutlined />} style={{ marginLeft: 8 }}>Xem trước</Button>
            </Form.Item>
          </Form>
          <AddOnManagement
            addOns={addOns}
            showAddOnModal={showAddOnModal}
            handleDeleteAddOn={handleDeleteAddOn}
            showAddOnItemModal={showAddOnItemModal}
            handleDeleteAddOnItem={handleDeleteAddOnItem}
          />
        </Col>
        <Col span={12} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Form.Item name="image" label={<span style={{ color: 'white' }}>Hình ảnh</span>}>
            <Upload
              listType="picture-card"
              fileList={fileList}
              onChange={handleUpload}
              onRemove={handleRemove}
              onPreview={showPreview}
              beforeUpload={() => true}
            >
              {fileList.length === 0 && (
                <div>
                  <PlusOutlined style={{ color: 'white' }} />
                </div>
              )}
            </Upload>


          </Form.Item>
          {previewImage && (
            <img
              className='img-fluid radius-10'
              src={previewImage}
              alt="Preview"
              style={{ maxWidth: '100%', marginBottom: '20px', borderRadius: '10px' }}
            />
          )}
        </Col>
      </Row>
      <PreviewModal
        isPreviewVisible={isPreviewVisible}
        hidePreview={hidePreview}
        formValues={form.getFieldsValue()}
        previewImage={previewImage}
        addOns={addOns.filter(addon => addon.listItem && addon.listItem.length > 0)}
        onAddToCart={hidePreview}
      />
      <Modal
        title={currentAddOn ? "Chỉnh sửa lựa chọn" : "Thêm mới lựa chọn"}
        open={isAddOnModalVisible}
        onOk={handleAddOnOk}
        onCancel={() => setIsAddOnModalVisible(false)}
      >
        <Form form={addOnForm} layout="vertical">
          <Form.Item name="title" label="Tiêu đề" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <TextArea rows={4} />
          </Form.Item>
          <Form.Item name="sorting" label="Sắp xếp" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="type" label="Loại" rules={[{ required: true }]}>
            <Select style={{ width: '100%' }}>
              <Select.Option value={1}>Chọn ít nhất 1</Select.Option>
              <Select.Option value={2}>Tùy chọn</Select.Option>
              <Select.Option value={3}>Chọn 1</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title={currentAddOnItem ? "Chỉnh sửa lựa chọn" : "Thêm lựa chọn mới"}
        open={isAddOnItemModalVisible}
        onOk={handleAddOnItemOk}
        onCancel={() => setIsAddOnItemModalVisible(false)}
      >
        <Form form={addOnItemForm} layout="vertical">
          <Form.Item name="title" label="Tiêu đề" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <TextArea rows={4} />
          </Form.Item>
          <Form.Item name="type" label="Loại" rules={[{ required: true }]}>
            <Select style={{ width: '100%' }}>
              <Select.Option value={1}>Số lượng luôn là 1</Select.Option>
              <Select.Option value={2}>Do user chọn số lượng</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="sorting" label="Sắp xếp" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="price" label="Giá" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="oldPrice" label="Giá cũ">
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="isDefault" label="Chọn mặc định" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default EditFood;