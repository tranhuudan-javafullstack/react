import React from 'react';
import { Table, DatePicker, Space, Button, Modal, Input, message, Col, Row } from 'antd';
import dayjs from 'dayjs';
import { API_DOMAIN_LOCAL } from '../domain';
import { QRCodeCanvas } from 'qrcode.react';
import { Edit, LucidePlus } from 'lucide-react';
import { global, receipt } from '../../api';
import OrderDetails from '../OrderManagement/OrderDetail/OrderDetails';
import axios from 'axios';
import  './style.css';
const { RangePicker } = DatePicker;


const ReceiptTable = () => {
  const [data, setData] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [tableNumber, setTableNumber] = React.useState('');
  const [detailModalVisible, setDetailModalVisible] = React.useState(false);
  const [detailData, setDetailData] = React.useState({});
  const [searchTerm, setSearchTerm] = React.useState('');
  const [orderData, setOrderData] = React.useState([]);
  const [tableInfo, setTableInfo] = React.useState({});
  const [foods, setFoods] = React.useState([]);

  const handleOrder = (receiptID) => {
    const url = `#/order/${receiptID}`;
    window.open(url, '_blank');
  };
  React.useEffect(() => {
    fetchMenuData();
  }, []);
  const columns = [
    {
      title: 'ID',
      dataIndex: 'receiptID',
      key: 'receiptID',
    },
    {
      title: 'Số Bàn',
      dataIndex: 'table',
      key: 'table',
    },
    {
      title: 'Giờ vào',
      dataIndex: 'timeCreate',
      key: 'timeCreate',
      render: (timeCreate) => dayjs(timeCreate).format('HH:mm'),
    },
    {
      title: 'Nhân viên',
      dataIndex: 'employeeID_Create',
      key: 'employeeID_Create',
    },
    {
      title: 'Số món/PV',
      dataIndex: 'itemCount',
      key: 'itemCount',
      render: (_, record) => `${record.listOrder.length}/${record.listServiceCharges.length}`,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'timeCashier',
      key: 'timeCashier',
      render: (timeCashier) => timeCashier === 0 ? <span style={{ color: 'red' }}>Chưa thanh toán</span> : <span style={{ color: 'green' }}>Đã đã thanh toán</span>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record) => (
        <Space size="middle">
          <Button
            type='info'
            icon={<Edit />}
            onClick={() => handleViewDetail(record.receiptID)}>
          </Button>
          <Button
            onClick={() => handleOrder(record.receiptID)}
            type='info'
            icon={<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clipPath="url(#clip0_2035_225)">
                <path d="M31.3494 21.7849C31.7692 21.4368 31.8543 20.8195 31.5365 20.3764C30.857 19.4299 30.2934 19.2049 27.9325 20.4463L23.2279 23.322C21.7901 24.0862 18.0173 23.8644 16.3897 23.8644C16.3897 23.8644 20.2307 24.1247 18.698 21.8364C17.9354 20.6986 16.6207 20.0526 15.2512 20.0526H13.1354C11.902 20.0526 10.6855 19.6859 9.70109 18.9434C7.40303 17.2111 2.98328 20.6101 2.98328 20.6101V30.3728H10.5765C11.6597 30.3728 12.7417 30.2909 13.8123 30.1282L20.8817 29.0532C21.123 29.0532 21.3573 29.025 21.584 28.9746C21.5878 28.974 21.5911 28.9735 21.5949 28.9729C22.1671 28.8927 22.69 28.6031 23.1076 28.2033L31.3494 21.7849Z" fill="#FDC693" />
                <path d="M0.27124 32H2.98305V18.983H0.27124V32Z" fill="#556080" />
                <path d="M9.64479 26.0339C9.34485 26.0339 9.10242 25.7909 9.10242 25.4915C9.10242 24.1329 10.1161 23.322 11.8143 23.322H17.085C17.385 23.322 17.6274 23.565 17.6274 23.8644C17.6274 24.1638 17.385 24.4068 17.085 24.4068H11.8143C10.1872 24.4068 10.1872 25.223 10.1872 25.4915C10.1872 25.791 9.94473 26.0339 9.64479 26.0339Z" fill="#F9A571" />
                <path d="M29.5595 14.1017H2.44092L4.37773 16.8136H27.6227L29.5595 14.1017Z" fill="#CAD3DB" />
                <path d="M16.0003 2.71187C15.7003 2.71187 15.4579 2.46888 15.4579 2.1695V0.542375C15.4579 0.243 15.7003 0 16.0003 0C16.3002 0 16.5426 0.243 16.5426 0.542375V2.1695C16.5426 2.46888 16.3002 2.71187 16.0003 2.71187Z" fill="#CAD3DB" />
                <path d="M17.6273 1.08475H14.3731C14.0731 1.08475 13.8307 0.84175 13.8307 0.542375C13.8307 0.243 14.0731 0 14.3731 0H17.6273C17.9272 0 18.1697 0.243 18.1697 0.542375C18.1697 0.84175 17.9272 1.08475 17.6273 1.08475Z" fill="#CAD3DB" />
                <path d="M27.9324 14.1017C27.9324 7.51187 22.59 2.16949 16.0002 2.16949C9.41037 2.16949 4.06799 7.51187 4.06799 14.1017H27.9324Z" fill="#E6EEF3" />
                <path d="M7.54735 9.76245C7.45517 9.76245 7.36129 9.73914 7.2756 9.6892C7.01635 9.53895 6.92792 9.20701 7.07873 8.94833C8.92117 5.77058 12.3397 3.79633 16.0002 3.79633C16.3002 3.79633 16.5426 4.03933 16.5426 4.3387C16.5426 4.63864 16.3002 4.88108 16.0002 4.88108C12.7254 4.88108 9.66642 6.64814 8.01704 9.49176C7.91673 9.66539 7.73448 9.76245 7.54735 9.76245Z" fill="#CAD3DB" />
              </g>
              <defs>
                <clipPath id="clip0_2035_225">
                  <rect width="32" height="32" fill="white" />
                </clipPath>
              </defs>
            </svg>
            }>
          </Button>
        </Space>
      ),
    },
  ];


  const handleUpdateTable = async (receiptID) => {
    try {
      const response = await fetch(API_DOMAIN_LOCAL + 'api/fandb/running/waiter/receipt/update-table', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token-owner': localStorage.getItem('key'),
        },
        body: JSON.stringify({ receiptID, table: detailData.table }),
      });
      const result = await response.json();
      if (result.status === 1) {
        message.success("Số bàn đã được cập nhật.");
        setDetailModalVisible(false);
        fetchData();
      } else {
        message.error("Cập nhật số bàn thất bại.");
      }
    } catch (error) {
      console.error('Error updating table:', error);
    }
  };

  const validatePhoneNumber = (value) => {
    const regexPhoneNumber = /^0\d{9}$/;
    return regexPhoneNumber.test(value);
  };

  const handleUpdatePhoneNumber = async (receiptID) => {
    const phoneNumber = detailData.phoneNumber;
    if (!validatePhoneNumber(phoneNumber)) {
      message.error("Số điện thoại không hợp lệ. Vui lòng nhập lại.");
      return;
    }

    try {
      const response = await fetch(API_DOMAIN_LOCAL + 'api/fandb/running/waiter/receipt/update-phone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token-owner': localStorage.getItem('key'),
        },
        body: JSON.stringify({ receiptID, phone: phoneNumber }),
      });
      const result = await response.json();
      if (result.status === 1) {
        message.success("Số điện thoại đã được cập nhật.");
      } else {
        message.error("Cập nhật số điện thoại thất bại.");
      }
    } catch (error) {
      console.error('Error updating phone number:', error);
    }
  };
  const handleViewDetail = async (receiptID) => {
    try {
      const response = await receipt.fetchOrderDetails(receiptID);
      if (response.data.status === 1) {
        const { table, phoneNumber, employeeID_Create, timeCreate } = response.data.data;
        setTableInfo({ table, receiptID, phoneNumber, employeeID_Create, timeCreate });
        const transformedData = transformApiResponse(response.data.data.listOrder);
        setOrderData(transformedData);
        setDetailData(response.data.data);
        setDetailModalVisible(true);
      }
    } catch (error) {
      console.error('Error fetching detail data:', error);
    }
  };
  const fetchMenuData = async () => {
    try {
      const response = await global.fetchMenu();
      const data = response.data;
      setFoods(data.data.Foods);
      message.success({ content: 'Menu loaded', key: 'loading' });
    } catch (error) {
      console.error("Error fetching data:", error);
      message.error("Failed to fetch menu. Please try again later.");
    }
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
  const fetchData = async (timeBegin, timeEnd) => {
    setLoading(true);
    try {
      const response = await fetch(API_DOMAIN_LOCAL + 'api/fandb/running/query-all-receipt-detail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token-owner': localStorage.getItem('key'),
        },
        body: JSON.stringify({ timeBegin, timeEnd }),
      });
      const result = await response.json();
      if (result.status === 1) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };
  const handleUpdateQuantityOrder = async (id, newQuantity, description) => {
    try {
      await axios.post(API_DOMAIN_LOCAL + 'api/fandb/running/waiter/order/update', {
        orderID: id,
        quantity: newQuantity,
        description: description
      }, {
        headers: {
          'token-owner': localStorage.getItem('key'),
        }
      });
      message.success('Quantity updated successfully');
      handleViewDetail(detailData.receiptID);
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
      handleViewDetail(detailData.receiptID);
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
      handleViewDetail(detailData.receiptID);
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
      handleViewDetail(detailData.receiptID);
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
      handleViewDetail(detailData.receiptID);
    } catch (error) {
      console.error('Error updating add-ons:', error);
      message.error('Failed to update add-ons');
    }
  };
  const handleDateRangeChange = (dates) => {
    if (dates) {
      const [start, end] = dates;
      fetchData(start.valueOf(), end.valueOf());
    }
  };

  React.useEffect(() => {
    const now = dayjs();
    fetchData(now.startOf('day').valueOf(), now.endOf('day').valueOf());
  }, []);

  const createNewReceipt = async () => {
    try {
      const response = await fetch(API_DOMAIN_LOCAL + 'api/fandb/running/waiter/receipt/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token-owner': localStorage.getItem('key'),
        },
        body: JSON.stringify({ table: tableNumber }),
      });
      const result = await response.json();
      if (result.status === 1) {
        message.success("Hóa đơn mới đã được tạo.");
        fetchData();
        setModalVisible(false);
      } else {
        message.error("Tạo hóa đơn thất bại.");
      }
    } catch (error) {
      console.error('Error creating new receipt:', error);
      message.error("Có lỗi xảy ra khi tạo hóa đơn.");
    }
  };
  const filteredData = data.filter(item =>
    item.receiptID.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.table.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.employeeID_Create.toString().toLowerCase().includes(searchTerm.toLowerCase())
  );
  return (
    <div>
      <h2 className='text-center'>Quản lý hóa đơn</h2>
      <Space className='mb-2 mt-5' direction="vertical" size="large" style={{ width: '100%' }}>
        <Space style={{ justifyContent: 'space-between', width: '100%' }}>
          <RangePicker
            size="large"
            format="HH:mm:ss DD/MM/YYYY"
            showTime
            defaultValue={[
              dayjs().startOf('day'),
              dayjs().endOf('day'),
            ]}
            onChange={handleDateRangeChange}
            style={{ borderRadius: '0.5rem' }}
          />
          <Input.Search
            placeholder="Search by ID, Table, or Employee"
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%' }}
          />
          <Button type="primary" onClick={() => setModalVisible(true)}>
            <LucidePlus /> Thêm mới hóa đơn
          </Button>
        </Space>
      </Space>
      <Table
        columns={columns}
        dataSource={filteredData}
        loading={loading}
        rowKey="receiptID"
        pagination={false}
      />
      <Modal
        title="Thêm mới hóa đơn"
        open={modalVisible}
        onOk={createNewReceipt}
        onCancel={() => setModalVisible(false)}
      >
        <Input
          placeholder="Nhập mã số bàn"
          value={tableNumber}
          onChange={(e) => setTableNumber(e.target.value)}
        />
      </Modal>
      <Modal
        title="Chi tiết hóa đơn"
        open={detailModalVisible}
        footer={null}
        onCancel={() => setDetailModalVisible(false)}
        width={600}
      >
        <Row gutter={16} style={{ marginTop: 16 }}>
          <Col span={12}>
            <p><b>Số bàn:</b></p>
            <Input value={detailData.table} onChange={e => setDetailData({ ...detailData, table: e.target.value })} />
          </Col>
          <Col span={12}>
            <p><b>Số điện thoại:</b></p>
            <Input value={detailData.phoneNumber === 0 ? '' : detailData.phoneNumber} onChange={e => setDetailData({ ...detailData, phoneNumber: e.target.value })} />
          </Col>
        </Row>
        <Row justify="center" style={{ marginTop: 16 }}>
          <Col>
            <Button type="primary" onClick={() => { handleUpdateTable(detailData.receiptID); handleUpdatePhoneNumber(detailData.receiptID); }}>Cập nhật</Button>
          </Col>
        </Row>
    
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
            <Row justify="center" style={{ marginTop: 16 }}>
          <Col>
            <QRCodeCanvas
              value={detailData.liteToken}
              style={{ width: 200, height: 200 }}
            />
          </Col>
        </Row>
      </Modal>
    </div>
  );
};

export default ReceiptTable;