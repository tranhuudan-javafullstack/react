import React, { useState, useEffect } from 'react';
import { Row, Col, Form, Input, InputNumber, Switch, Upload, Button, Table, Space, message, Spin } from 'antd';
import { UploadOutlined, PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import axios from 'axios';
import { API_DOMAIN_LOCAL } from '../domain';
import dayjs from 'dayjs';
import { receipt } from '../../api';

const InvoiceGenerator = () => {
  const [invoiceData, setInvoiceData] = useState({
    restaurantName: 'Tên nhà hàng',
    address: 'Số 99 - Đường 99 - Phường 99 - Quận 99 - Thành phố 99 - Tỉnh 99 ',
    phone: '0123456789',
    taxId: '123456',
    items: [
      { id: 'item-1', name: 'Món 1', price: 50000, quantity: 1 },
      { id: 'item-2', name: 'Món 2', price: 30000, quantity: 2 },
      { id: 'item-3', name: 'Món 3', price: 20000, quantity: 3 },
    ],
    services: [
      { id: 'service-1', name: 'Dịch vụ 1', price: 10000, quantity: 1 },
      { id: 'service-2', name: 'Dịch vụ 2', price: 20000, quantity: 2 },
      { id: 'service-3', name: 'Dịch vụ 3', price: 30000, quantity: 3 },
    ],
    externalBills: [],
    logo: null,
    qrCode: null,
    footerText: '',
    layout: ['logo', 'restaurantInfo', 'items', 'services', 'externalBills', 'total', 'footer', 'qrCode'],
  });
  const [logoPreview, setLogoPreview] = useState(null);
  const [qrCodePreview, setQrCodePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [defaultInvoiceData, setDefaultInvoiceData] = useState(invoiceData);

  const [form] = Form.useForm();

  const parseHTMLResponse = (htmlString) => {
    setLoading(true);
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');

    const restaurantName = doc.querySelector('h2')?.textContent || '';
    const addressElements = doc.querySelectorAll('p');
    const address = addressElements[0]?.textContent || '';
    const phone = addressElements[1]?.textContent.replace('ĐT:', '').trim() || '';
    const taxId = addressElements[2]?.textContent.replace('Số HD:', '').trim() || '';

    const items = [
      { id: 'item-1', name: 'Món 1', price: 50000, quantity: 1 },
      { id: 'item-2', name: 'Món 2', price: 30000, quantity: 2 },
      { id: 'item-3', name: 'Món 3', price: 20000, quantity: 3 },
    ];

    const services = [
      { id: 'service-1', name: 'Dịch vụ 1', price: 10000, quantity: 1 },
      { id: 'service-2', name: 'Dịch vụ 2', price: 20000, quantity: 2 },
      { id: 'service-3', name: 'Dịch vụ 3', price: 30000, quantity: 3 },
    ];

    const externalBillsDiv = Array.from(doc.querySelectorAll('div')).find(div =>
      div.textContent.includes('Các khoản chung')
    );
    const externalBills = [];

    const logo = doc.querySelector('img[alt="Logo"]')?.getAttribute('src') || null;
    const qrCode = doc.querySelector('img[alt="QR Code"]')?.getAttribute('src') || null;

    const footerDiv = doc.querySelector('[data-rbd-draggable-id="footer"]');
    let footerText = '';
    if (footerDiv) {
      const footerContent = footerDiv.textContent.trim();
      footerText = footerContent;
    }

    return {
      restaurantName,
      address,
      phone,
      taxId,
      items,
      services,
      externalBills,
      logo,
      qrCode,
      footerText,
      layout: invoiceData.layout,
    };
  };

  const fetchInvoiceData = async () => {
    try {
      const response = await axios.post(
        `${API_DOMAIN_LOCAL}api/fandb/owner/setup-receipt/get-print-bill`,
        {},
        {
          headers: {
            'token-owner': localStorage.getItem('key'),
          },
          responseType: 'text',
        }
      );
      const parsedData = parseHTMLResponse(response.data);

      const externalBillsData = await receipt.fetchExternalBills();
      const externalBills = externalBillsData.data.data.map(bill => ({
        title: bill.title,
        value: bill.value,
        isPercent: bill.isPercent
      }));

      parsedData.externalBills = externalBills;

      setInvoiceData(parsedData);
      form.setFieldsValue(parsedData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching invoice data:', error);
      message.error('Failed to fetch invoice data');
    } finally {
    }
  };

  useEffect(() => {
    fetchInvoiceData();
  }, []);

  const handleFormChange = (changedValues, allValues) => {
    setInvoiceData((prev) => ({
      ...prev,
      ...allValues,
    }));
  };
  const resetToDefault = () => {
    if (defaultInvoiceData) {
      setInvoiceData(defaultInvoiceData);
      form.setFieldsValue(defaultInvoiceData);
    }
  };
  const handleLogoUpload = (info) => {
    if (info.file.status === 'done') {
      const reader = new FileReader();
      reader.onload = (e) => {
        setInvoiceData((prev) => ({ ...prev, logo: e.target.result }));
        setLogoPreview(e.target.result);
      };
      reader.readAsDataURL(info.file.originFileObj);
    }
  };

  const handleQRCodeUpload = (info) => {
    if (info.file.status === 'done') {
      const reader = new FileReader();
      reader.onload = (e) => {
        setInvoiceData((prev) => ({ ...prev, qrCode: e.target.result }));
        setQrCodePreview(e.target.result);
      };
      reader.readAsDataURL(info.file.originFileObj);
    }
  };


  const calculateTotal = () => {
    const itemsTotal = invoiceData.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
    const servicesTotal = invoiceData.services.reduce((sum, service) => sum + service.quantity * service.price, 0);
    let total = itemsTotal + servicesTotal;

    invoiceData.externalBills.forEach((bill) => {
      if (bill.isPercent) {
        total += total * (bill.value / 100);
      } else {
        total += bill.value;
      }
    });

    return total;
  };

  const columns = [
    { title: 'Tên món', dataIndex: 'name', key: 'name', width: 200 },
    { title: 'Đơn Giá', dataIndex: 'price', key: 'price', width: 150, render: (price) => `${price.toLocaleString()}đ` },
    { title: 'SL', dataIndex: 'quantity', key: 'quantity', width: 100 },
    {
      title: 'Thành Tiền',
      key: 'total',
      width: 150,
      render: (_, record) => `${(record.quantity * record.price).toLocaleString()}đ`
    },
  ];

  const onDragEnd = (result) => {
    if (!result.destination) {
      return;
    }

    const newLayout = Array.from(invoiceData.layout);
    const [reorderedItem] = newLayout.splice(result.source.index, 1);
    newLayout.splice(result.destination.index, 0, reorderedItem);

    setInvoiceData(prev => ({ ...prev, layout: newLayout }));
  };

  const renderInvoiceElement = (element) => {
    var servicesTotal = invoiceData.services.reduce((sum, service) => sum + (service.quantity * service.price), 0);
    var itemsTotal = invoiceData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    switch (element) {
      case 'logo':
        return invoiceData.logo && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
            <img src={invoiceData.logo} alt="Logo" style={{ maxWidth: '200px', borderRadius: '15px' }} />
          </div>
        );

      case 'restaurantInfo':
        return (
          <div style={{ textAlign: 'center' }}>
            <h2>{invoiceData.restaurantName}</h2>
            <p>{invoiceData.address}</p>
            <p>ĐT: {invoiceData.phone}</p>
            <p>Số HD: {invoiceData.taxId}</p>
            <p>Bàn: abc</p>
            <p>Nhân viên tạo: abc</p>
            <p>Ngày: {dayjs().format('DD/MM/YYYY')}</p>
            <p>Giờ vào: {dayjs().format('HH:mm:ss')} - Giờ ra {dayjs().format('HH:mm:ss')}</p>
          </div>
        );
      case 'items':
        return (
          <>
            <h3 style={{ textAlign: 'center' }}>HOÁ ĐƠN THANH TOÁN</h3>
            <Table dataSource={invoiceData.items} columns={columns} pagination={false} rowKey="id" />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <strong>Tổng tiền món: {itemsTotal.toLocaleString()}đ</strong>
            </div>
          </>
        );
      case 'services':
        return (
          <>
            <h4>Phí dịch vụ</h4>
            <Table dataSource={invoiceData.services} columns={columns} pagination={false} rowKey="id" />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <strong>Tổng tiền dịch vụ: {servicesTotal.toLocaleString()}đ</strong>
            </div>
          </>
        );
      case 'externalBills':
        return (
          <>
            <h4>Các khoản chung</h4>
            {invoiceData.externalBills && invoiceData.externalBills.map((bill, index) => (
              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{bill.title} {bill.isPercent ? `(${bill.value}%)` : ''}</span>
                <span>
                  {bill.isPercent
                    ? `${bill.value !== undefined ? (bill.value * (servicesTotal + itemsTotal) / 100).toLocaleString() : 0}đ`
                    : `${bill.value !== undefined ? bill.value.toLocaleString() : '0'}đ`
                  }
                </span>
              </div>
            ))}
          </>
        );
      case 'footer':
        return invoiceData.footerText ? (
          <div style={{
            textAlign: 'center',
            marginTop: '20px',
            marginBottom: '20px',
            whiteSpace: 'pre-line'
          }}>
            {invoiceData.footerText}
          </div>
        ) : null;
      case 'total':
        return (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div>
              <h4>Tổng cộng: {calculateTotal().toLocaleString()}đ</h4>
              <div style={{ fontSize: '0.9em', marginTop: '5px' }}>
              </div>
            </div>
          </div>
        );

      case 'qrCode':
        return invoiceData.qrCode && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
            <img src={invoiceData.qrCode} alt="QR Code" style={{ maxWidth: '200px', borderRadius: '15px' }} />
          </div>
        );

      default:
        return null;
    }
  };
  const renderDraggableElement = (element, index) => (
    <Draggable key={element} draggableId={element} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            ...provided.draggableProps.style,
            marginBottom: '10px',
            padding: '5px',
            border: '1px dashed #d9d9d9',
            backgroundColor: '#f9f9f9',
          }}
        >
          {renderInvoiceElement(element)}
        </div>
      )}
    </Draggable>
  );
  const sendInvoiceToServer = async () => {
    const invoiceContent = document.querySelector('.invoice-preview').innerHTML;
    const css = `
      body {
            font-family: Arial, sans-serif;
            color: black;
            background-color: white;
          }
          h2, h3, h4 {
            margin-bottom: 10px;
          }
          p {
            margin-bottom: 5px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th, td {
            border: 1px solid #000000;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f2f2f2;
          }
            .ant-table-cell.list-item {
            padding-left: 20px;
            font-style: italic;
            color: #020202;
          }
            img {
              border-radius: 15px;
            }
    `;

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invoice</title>
        <style>${css}</style>
      </head>
      <body>
        ${invoiceContent}
      </body>
      </html>
    `;
    const blob = new Blob([htmlContent]);

    const file = new File([blob], 'invoice.html', { type: 'text/html' });

    const myHeaders = new Headers();
    myHeaders.append("token-owner", localStorage.getItem('key'));

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: file,
    };
    try {
      setLoading(true);
      const response = await fetch(API_DOMAIN_LOCAL + 'api/fandb/owner/setup-receipt/set-print-bill', requestOptions);
      const result = await response.json();
      if (result.status === 1) {
        setLoading(false);
        message.success('Invoice saved successfully');
      } else {
        message.error('Failed to save invoice');
      }
    } catch (error) {
      console.error('Error saving invoice:', error);
      message.error('Failed to save invoice');
    }
  };


  return (
    <Row gutter={24} className='me-1'>
      <Col span={12} style={{ position: 'sticky', top: 0, height: '90vh', overflowY: 'auto' }}>
        <div className='card' style={{
          position: 'sticky',
          top: 0,
          maxHeight: '90vh',
          overflowY: 'auto',
        }}>
          <h3 className='m-2 text-center'>Thiết lập hóa đơn</h3>
          <Form form={form} layout="vertical" className='m-2' onValuesChange={handleFormChange}>
            <Form.Item name="restaurantName" label={<span >Tên nhà hàng</span>}>
              <Input />
            </Form.Item>
            <Form.Item name="address" label={<span >Địa chỉ</span>}>
              <Input />
            </Form.Item>
            <Form.Item name="phone" label={<span >Số điện thoại</span>}>
              <Input />
            </Form.Item>

            <Form.Item name="logo" label={<span >Logo</span>}>
              <Upload
                accept="image/*"
                customRequest={({ file, onSuccess }) => {
                  setTimeout(() => {
                    onSuccess("ok");
                  }, 0);
                }}
                onChange={handleLogoUpload}
              >
                <Button icon={<UploadOutlined />}>Upload Logo</Button>
                {logoPreview && <img src={logoPreview} alt="Logo Preview" style={{ maxWidth: '200px', marginTop: '10px', borderRadius: '15px' }} />}
              </Upload>
            </Form.Item>
            <Form.Item
              name="footerText"
              label={<span >Nội dung chân trang</span>}
            >
              <Input.TextArea
                rows={4}
                placeholder="Nhập nội dung chân trang (ví dụ: Cảm ơn quý khách!)"
              />
            </Form.Item>
            <Form.Item name="qrCode" label={<span >Mã QR</span>}>
              <Upload
                accept="image/*"
                customRequest={({ file, onSuccess }) => {
                  setTimeout(() => {
                    onSuccess("ok");
                  }, 0);
                }}
                onChange={handleQRCodeUpload}
              >
                <Button icon={<UploadOutlined />}>Upload Mã QR</Button>
                {qrCodePreview && <img src={qrCodePreview} alt="QR Code Preview" style={{ maxWidth: '200px', marginTop: '10px', borderRadius: '15px' }} />}
              </Upload>
            </Form.Item>
            <Form.Item>
              <Space>
                <Button type="primary" onClick={sendInvoiceToServer}>
                  Lưu hóa đơn
                </Button>
                <Button onClick={resetToDefault}>Đặt về mặc định</Button>
              </Space>
            </Form.Item>
          </Form>
        </div>
      </Col>
      <Col span={12} className='card' style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        <Spin spinning={loading}>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="invoice-elements">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="invoice-preview"
                  style={{
                    padding: '20px',
                    backgroundColor: 'white',
                    color: 'black',
                    minHeight: '100%'
                  }}
                >
                  {invoiceData.layout.map((element, index) => (
                    <Draggable key={element} draggableId={element} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{
                            ...provided.draggableProps.style,
                            marginBottom: '10px',
                            padding: '5px',
                            border: '1px dashed #d9d9d9',
                            backgroundColor: '#f9f9f9',
                          }}
                        >
                          {renderInvoiceElement(element)}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </Spin>
      </Col>
    </Row>
  );
};

export default InvoiceGenerator;