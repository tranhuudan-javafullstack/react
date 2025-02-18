import React, { useRef, useState } from 'react';
import { Card, Input, Button, message, Select, Modal } from 'antd';
import { Save, Eye } from 'lucide-react';
import { API_DOMAIN_LOCAL } from '../domain';

const LabelDesigner = () => {
  const labelRef = useRef(null);

  const templateOptions = [
    {
      id: 1,
      name: "Mẫu ngang",
      data: {
        storeName: 'Nhà Hàng AIO',
        orderTime: '17:21 13/07',
        additionalInfo: '(Mang đi 106547)',
        productName: 'Hồng Trà Sữa (Size M)',
        tableName: 'Bàn 5',
        addOnItems: ['Trân châu đen']
      },
      style: `
        .label-container {
          width: 189.12px;
          height: 112.32px;
          padding: 4px;
          font-family: Arial, sans-serif;
          background-color: white;
          display: flex;
          flex-direction: column;
        }
        .store-name {
          font-weight: bold;
          font-size: 10px;
          margin-bottom: 2px;
        }
        .order-info {
          font-size: 8px;
          font-style: italic;
          margin-bottom: 2px;
        }
        .product-name {
          font-size: 9px;
          margin-bottom: 2px;
        }
        .table-name {
          font-size: 8px;
          font-weight: bold;
          margin-bottom: 2px;
        }
        .add-on-items {
          font-size: 7px;
          font-style: italic;
          flex-grow: 1;
        }
      `
    },
    {
      id: 2,
      name: "Mẫu dọc",
      data: {
        tableName: 'Bàn 10',
        productName: 'Cà Phê Đen Đá',
        orderTime: '14:30',
        orderNumber: '#A123',
        addOnItems: ['x2 Kem phô mai', 'x3 Kem phô mai'],
        customerName: 'Nguyễn Văn A'
      },
      style: `
        html {
          margin-top: 0;
          margin-left: 23px;
          padding: 0;
          height: 189.12px;
          width: 112.32px;
          font-family: Arial, sans-serif;
          background-color: #f8f9fa;
          rotate: 270deg;
        }

        .label-container {
          width: 100%;
          height: 100%;
          background-color: white;
          position: relative;
          box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
          padding: 10px;
          overflow: hidden;
        }

        .header-row {
          font-size: 10px;
          font-weight: bold;
          text-align: center;
          border-bottom: 1px solid #ccc;
          margin-bottom: 8px;
          padding-bottom: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .left-column {
          position: absolute;
          top: 60px;
          left: 0;
          padding-right: 5px;
          border-right: 1px solid #999;
          height: calc(100% - 70px);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .rotated-text {
          writing-mode: vertical-rl;
          transform: rotate(0);
          white-space: nowrap;
          font-size: 8px;
          text-align: center;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .right-column {
          margin-left: 30px;
          font-size: 8px;
          overflow: hidden;
        }

        .add-on-items {
          font-size: 8px;
          margin-bottom: 8px;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .add-on-item {
          margin-bottom: 2px;
          padding-bottom: 2px;
          font-style: italic;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .customer-name {
          font-size: 8px;
          font-weight: bold;
          text-align: left;
          margin-top: 10px;
          overflow: hidden;
          text-overflow: ellipsis;
          position: absolute;
          bottom: 0;
        }
      `
    },
    {
      id: 3,
      name: "Mẫu mặc định",
      data: {
        storeName: 'Nhà Hàng AIO',
        orderTime: '09:45 13/07',
        tableNumber: 'T15',
        productName: 'Trà Đào Đá Xay',
        addOnItems: ['Thạch đào']
      },
      style: `
        .label-container {
          width: 112.32px;
          height: 189.12px;
          padding: 4px;
          font-family: Arial, sans-serif;
          background-color: white;
          display: flex;
          flex-direction: column;
        }
        .store-name {
          font-weight: bold;
          font-size: 9px;
          text-align: center;
          margin-bottom: 2px;
        }
        .product-info {
          font-size: 9px;
          font-weight: bold;
          margin-bottom: 2px;
        }
        .order-details {
          display: flex;
          justify-content: space-between;
          font-size: 7px;
          margin-bottom: 2px;
        }
        .add-on-items {
          font-size: 7px;
          flex-grow: 1;
        }
      `
    }
  ];

  const [selectedTemplateId, setSelectedTemplateId] = useState(1);
  const selectedTemplate = templateOptions.find(t => t.id === selectedTemplateId);
  const [labelData, setLabelData] = useState(selectedTemplate.data);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);

  const handleTemplateChange = (templateId) => {
    const newTemplate = templateOptions.find(t => t.id === templateId);
    setSelectedTemplateId(templateId);
    setLabelData(newTemplate.data);
  };

  const handleInputChange = (key, value) => {
    setLabelData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleAddOnItemChange = (index, value) => {
    setLabelData(prev => {
      const newAddOnItems = [...prev.addOnItems];
      newAddOnItems[index] = value;
      return { ...prev, addOnItems: newAddOnItems };
    });
  };

  const addNewAddOnItem = () => {
    setLabelData(prev => ({
      ...prev,
      addOnItems: [...prev.addOnItems, '']
    }));
  };

  const removeAddOnItem = (index) => {
    setLabelData(prev => ({
      ...prev,
      addOnItems: prev.addOnItems.filter((_, i) => i !== index)
    }));
  };

  const sendLabelToServer = async () => {
    const labelContent = labelRef.current.innerHTML;

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Label Template</title>
        <style>${selectedTemplate.style}</style>
      </head>
      <body>
        ${labelContent}
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const file = new File([blob], 'label-template.html', { type: 'text/html' });

    const myHeaders = new Headers();
    myHeaders.append("token-owner", localStorage.getItem('key'));

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: file,
    };

    try {
      const response = await fetch(`${API_DOMAIN_LOCAL}api/fandb/running/kitchen-staff/order-design/set?id=${selectedTemplateId}`, requestOptions);
      const result = await response.json();

      if (result.status === 1) {
        message.success('Label template saved successfully');
      } else {
        message.error('Failed to save label template');
      }
    } catch (error) {
      console.error('Error saving label template:', error);
      message.error('Failed to save label template');
    }
  };

  const renderInputFields = () => {
    return Object.entries(labelData).map(([key, value]) => {
      if (key === 'addOnItems') {
        return (
          <div key={key} className="mb-4">
            <label className="block text-sm font-medium mb-1 text-gray-700">Add-on Items</label>
            {value.map((item, index) => (
              <div key={index} className="flex mb-2">
                <Input
                  value={item}
                  onChange={(e) => handleAddOnItemChange(index, e.target.value)}
                  className="flex-grow mr-2"
                />
                <Button onClick={() => removeAddOnItem(index)}>Remove</Button>
              </div>
            ))}
            <Button onClick={addNewAddOnItem}>Add Item</Button>
          </div>
        );
      }
      return (
        <div key={key} className="mb-4">
          <label className="block text-sm font-medium mb-1 text-gray-700">
            {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
          </label>
          <Input
            value={value}
            onChange={(e) => handleInputChange(key, e.target.value)}
            className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
      );
    });
  };

  const renderPreview = () => {
    switch (selectedTemplateId) {
      case 1:
        return (
          <>
            <div className="store-name">{labelData.storeName}</div>
            <div className="table-name">{labelData.tableName}</div>
            <div className="order-info">
              {labelData.orderTime} {labelData.additionalInfo}
            </div>
            <div className="product-name">{labelData.productName}</div>
            <div className="add-on-items">
              {labelData.addOnItems.map((item, index) => (
                <div key={index}>{item}</div>
              ))}
            </div>
          </>
        );
      case 2:
        return (
          <>
            <div className="header-row">
              Tên bàn: {labelData.tableName} - Tên món: {labelData.productName}
            </div>
            <div className="left-column">
              <div className="rotated-text">{labelData.orderTime}</div>
              <div className="rotated-text">{labelData.orderNumber}</div>
            </div>
            <div className="right-column">
              <div className="add-on-items">
                {labelData.addOnItems.map((item, index) => (
                  <div key={index} className="add-on-item">{item}</div>
                ))}
              </div>
              <div className="customer-name">{labelData.customerName}</div>
            </div>
          </>
        );
      case 3:
        return (
          <>
            <div className="store-name">{labelData.storeName}</div>
            <div className="product-info">{labelData.productName}</div>
            <div className="order-details">
              <span>{labelData.orderTime}</span>
              <span>{labelData.tableNumber}</span>
            </div>
            <div className="add-on-items">
              {labelData.addOnItems.map((item, index) => (
                <div key={index}>{item}</div>
              ))}
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card className="shadow-xl rounded-lg overflow-hidden">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Label Designer</h2>
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1 text-gray-700">Template</label>
          <Select
            className="w-full"
            value={selectedTemplateId}
            onChange={handleTemplateChange}
            options={templateOptions.map(t => ({ value: t.id, label: t.name }))}
          />
        </div>
        {renderInputFields()}
        <div className="flex space-x-4">
          <Button
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-black font-semibold py-2 px-4 rounded-md transition duration-200 ease-in-out"
            onClick={sendLabelToServer}
          >
            <Save className="w-4 h-4 mr-2 inline-block" />
            Save Template
          </Button>
          <Button
            className="flex-1 text-black font-semibold py-2 px-4 rounded-md transition duration-200 ease-in-out"
            onClick={() => setIsPreviewVisible(true)}
          >
            <Eye className="w-4 h-4 mr-2 inline-block" />
            Preview
          </Button>
        </div>
      </Card>

      <Modal
        title="Label Preview"
        open={isPreviewVisible}
        onCancel={() => setIsPreviewVisible(false)}
        footer={null}
        centered
      >
        <div className="flex justify-center items-center bg-gray-100 p-4 rounded-lg">
          <div
            ref={labelRef}
            className="label-container border border-gray-200 rounded shadow-md bg-white"
            style={{
              width: '112.32px',
              height: '189.12px',
              transform: 'scale(2)',
              transformOrigin: 'top left'
            }}
          >
            {renderPreview()}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default LabelDesigner;


