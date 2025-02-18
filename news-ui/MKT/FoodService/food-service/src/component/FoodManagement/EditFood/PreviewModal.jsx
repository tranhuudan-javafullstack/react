import React, { useState, useEffect } from 'react';
import { Modal, Card, Button, InputNumber, Checkbox, Input } from 'antd';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons';
import { global } from '../../../api';

const PreviewModal = ({ isPreviewVisible, hidePreview, formValues, previewImage, addOns, onAddToCart }) => {
    const [quantity, setQuantity] = useState(1);
    const [selectedAddOns, setSelectedAddOns] = useState({});
    const [total, setTotal] = useState(0);
    const [notes, setNotes] = useState('');
    const [errors, setErrors] = useState({});
    const [currentPreviewImage, setCurrentPreviewImage] = useState(previewImage); // Avoid name clash

    useEffect(() => {
        calculateTotal();
    }, [quantity, selectedAddOns]);

    useEffect(() => {
        const fetchImage = async () => {
            if (typeof previewImage === 'number') {
                const cachedImageUrl = await global.getImageFromCache(previewImage);
                if (cachedImageUrl) {
                    setCurrentPreviewImage(cachedImageUrl); // Use the renamed state
                }
            } else {
                setCurrentPreviewImage(previewImage); // Use the original image if it's a string
            }
        };
        fetchImage();
    }, [previewImage]); // Add previewImage as dependency

    const initializeSelectedAddOns = () => {
        const initialAddOns = {};
        addOns.forEach(addon => {
            if (addon.type === 1) {
                const defaultItem = addon.listItem.find(item => item.isDefault) || addon.listItem[0];
                initialAddOns[addon.addOnID] = { [defaultItem.addOnItemID]: { checked: true, quantity: 1 } };
            } else {
                initialAddOns[addon.addOnID] = {};
                addon.listItem.forEach(item => {
                    if (item.isDefault) {
                        initialAddOns[addon.addOnID][item.addOnItemID] = { checked: true, quantity: 1 };
                    }
                });
            }
        });
        setSelectedAddOns(initialAddOns);
    };

    useEffect(() => {
        if (isPreviewVisible) {
            initializeSelectedAddOns();
            setQuantity(1);
            setNotes('');
        }
    }, [isPreviewVisible]);

    const handleQuantityChange = (value) => {
        setQuantity(value);
    };

    const handleAddOnChange = (addOnID, itemID, checked) => {
        setSelectedAddOns(prev => {
            const updatedAddOn = { ...prev[addOnID] };
            const addon = addOns.find(a => a.addOnID === addOnID);
            switch (addon.type) {
                case 1:
                    if (checked) {
                        updatedAddOn[itemID] = { checked: true, quantity: 1 };
                    } else if (Object.keys(updatedAddOn).length === 1) {
                        const defaultItem = addon.listItem.find(i => i.addOnItemID !== itemID);
                        updatedAddOn[defaultItem.addOnItemID] = { checked: true, quantity: 1 };
                    } else {
                        delete updatedAddOn[itemID];
                    }
                    break;
                case 2:
                    if (checked) {
                        updatedAddOn[itemID] = { checked: true, quantity: 1 };
                    } else {
                        delete updatedAddOn[itemID];
                    }
                    break;
                case 3:
                    if (checked) {
                        Object.keys(updatedAddOn).forEach(key => {
                            if (key !== itemID) {
                                delete updatedAddOn[key];
                            }
                        });
                        updatedAddOn[itemID] = { checked: true, quantity: 1 };
                        setErrors(prev => ({ ...prev, [addOnID]: null }));
                    } else {
                        delete updatedAddOn[itemID];
                        if (Object.keys(updatedAddOn).length === 0) {
                            setErrors(prev => ({ ...prev, [addOnID]: 'Vui lòng chọn ít nhất một lựa chọn' }));
                        }
                    }
                    break;
            }

            return { ...prev, [addOnID]: updatedAddOn };
        });
    };

    const handleAddOnQuantityChange = (addOnID, itemID, value) => {
        setSelectedAddOns(prev => {
            const updatedAddOn = { ...prev[addOnID] };
            updatedAddOn[itemID] = { ...updatedAddOn[itemID], quantity: value };
            return { ...prev, [addOnID]: updatedAddOn };
        });
    };

    const calculateTotal = () => {
        let sum = formValues.price * quantity;
        addOns.forEach(addon => {
            Object.entries(selectedAddOns[addon.addOnID] || {}).forEach(([itemID, { checked, quantity: itemQuantity }]) => {
                if (checked) {
                    const item = addon.listItem.find(i => i.addOnItemID === parseInt(itemID));
                    if (item && item.price) {
                        sum += item.price * itemQuantity * quantity;
                    }
                }
            });
        });
        setTotal(sum);
    };

    const handleAddToCart = () => {
        const selectedAddOnItems = Object.entries(selectedAddOns).flatMap(([addOnID, items]) =>
            Object.entries(items)
                .filter(([_, { checked }]) => checked)
                .map(([itemId, { quantity: itemQuantity }]) => ({
                    addOnItemID: parseInt(itemId),
                    quantity: itemQuantity
                }))
        );
        const newErrors = {};
        addOns.forEach(addon => {
            if (addon.type === 3 && Object.keys(selectedAddOns[addon.addOnID] || {}).length === 0) {
                newErrors[addon.addOnID] = 'Vui lòng chọn ít nhất một lựa chọn';
            }
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        onAddToCart({
            ...formValues,
            quantity,
            selectedAddOns: selectedAddOnItems,
            notes,
            total
        });
        hidePreview();
    };

    return (
        <Modal
            open={isPreviewVisible}
            onCancel={hidePreview}
            footer={[
                <Button key="back" onClick={hidePreview}>
                    Hủy
                </Button>,
                <Button key="submit" type="primary" onClick={handleAddToCart}>
                    Thêm vào giỏ hàng
                </Button>,
            ]}
            width={400}
            style={{ top: 20 , maxHeight: '300px'}}
        >
            <Card style={{ width: '100%' }}>
                <h3 className='text-center'>{formValues.title}</h3>
                <h5 className='text-center'>{formValues.description}</h5>
                {currentPreviewImage && (
                    <img
                        src={currentPreviewImage}
                        alt={formValues.title}
                        style={{ width: '100%', height: 'auto', objectFit: 'cover', marginBottom: '10px' }}
                    />
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span>Số lượng:</span>
                    <div>
                        <Button icon={<MinusOutlined />} onClick={() => handleQuantityChange(Math.max(1, quantity - 1))} />
                        <InputNumber min={1} value={quantity} onChange={handleQuantityChange} style={{ margin: '0 10px' }} />
                        <Button icon={<PlusOutlined />} onClick={() => handleQuantityChange(quantity + 1)} />
                    </div>
                </div>
                {addOns.map(addon => (
                    <div key={addon.addOnID}>
                        <h4>{addon.title} <span className='fw-medium'>
                            {addon.type === 1 ? '(Chọn ít nhất 1)' : addon.type === 2 ? '(Tùy chọn)' : '(Chọn 1)'}
                        </span></h4>
                        {addon.listItem.map(item => (
                            <div key={item.addOnItemID} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginLeft: '20px' }}>
                                <Checkbox
                                    checked={selectedAddOns[addon.addOnID]?.[item.addOnItemID]?.checked || false}
                                    onChange={(e) => handleAddOnChange(addon.addOnID, item.addOnItemID, e.target.checked)}
                                >
                                    {item.title}
                                </Checkbox>
                                <span>{item.price ? `${item.price.toLocaleString()} đ` : 'Free'}</span>
                                {selectedAddOns[addon.addOnID]?.[item.addOnItemID]?.checked && item.type === 2 && (
                                    <InputNumber
                                        min={1}
                                        value={selectedAddOns[addon.addOnID][item.addOnItemID].quantity}
                                        onChange={(value) => handleAddOnQuantityChange(addon.addOnID, item.addOnItemID, value)}
                                        style={{ width: '60px', marginLeft: '10px' }}
                                    />
                                )}
                            </div>
                        ))}
                        {errors[addon.addOnID] && (
                            <p style={{ color: 'red', marginLeft: '20px' }}>{errors[addon.addOnID]}</p>
                        )}
                    </div>
                ))}
                {/* Notes */}
                <div style={{ marginTop: '20px' }}>
                    <h4>Ghi chú</h4>
                    <Input.TextArea
                        rows={4}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Nhập ghi chú cho món ăn (tùy chọn)"
                    />
                </div>
                {/* Total price */}
                <h3 style={{ textAlign: 'right', marginTop: '20px' }}>
                    Tổng cộng: {total.toLocaleString()} đ
                </h3>
            </Card>
        </Modal>
    );
};

export default PreviewModal;

