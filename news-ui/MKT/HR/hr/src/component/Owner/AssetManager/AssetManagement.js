import React, { useState, useEffect } from 'react';
import {
    Table,
    Button,
    Modal,
    Form,
    Input,
    InputNumber,
    Space,
    message,
    Popconfirm,
    Tag,
    Select,
    Row,
    Col,
    notification,
    Divider,
} from 'antd';
import api from '../../../api';
import { DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import EmptyState from '../../Ultils/EmptyData/EmptyData';
import Highlighter from 'react-highlight-words';

const AssetManagement = () => {
    const [assets, setAssets] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingAsset, setEditingAsset] = useState(null);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [employeeInfo, setEmployeeInfo] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [filteredAssets, setFilteredAssets] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const [searchInput, setSearchInput] = useState({});
    const searchInputRef = React.useRef(null);

    // Status options
    const statusOptions = [
        { value: 1, label: 'Hoạt động', color: 'green' },
        { value: 2, label: 'Đang sửa chữa', color: 'orange' },
        { value: 3, label: 'Hỏng', color: 'red' },
        { value: 4, label: 'Đã thanh lý', color: 'gray' },
        { value: 5, label: 'Đang bảo hành', color: 'blue' }
    ];

    // Fetch assets
    const fetchAssets = async () => {
        try {
            setLoading(true);
            const response = await api.post('api/administrative/asset/manager-query-all', {
                listDeviceID: []
            });
            await fetchEmployeeInfo([]);
            setAssets(response.data.data);
            setFilteredAssets(response.data.data);
        } catch (error) {
            message.error('Không thể tải danh sách tài sản');
        } finally {
            setLoading(false);
        }
    };
    const fetchEmployees = async () => {
        try {
            const response = await api.post('global/api/employee-info', {
                listEmployeeID: [] // Truyền rỗng để lấy tất cả
            });
            setEmployees(response.data.data || []);
        } catch (error) {
            console.error('Error fetching employees:', error);
            message.error('Không thể tải danh sách nhân viên');
        }
    };

    useEffect(() => {
        fetchAssets();

        fetchEmployees();
    }, []);

    const employeeOptions = employees.map(emp => ({
        value: emp.employeeID,
        label: `${emp.employeeID} - ${emp.fullname || emp.nickname || emp.username} `
    }));

    const fetchEmployeeInfo = async (listEmployeeID) => {
        try {
            const response = await api.post('global/api/employee-info', { listEmployeeID });
            const employeeMap = {};

            response.data.data.forEach(employee => {
                employeeMap[employee.employeeID] = employee;
            });
            setEmployeeInfo(employeeMap);
        } catch (error) {
            console.error('Error fetching employee info:', error);
        }
    };

    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
    };

    const handleReset = (clearFilters, confirm, dataIndex) => {
        clearFilters();
        setSearchText('');
        setSearchedColumn('');
        confirm();
    };
    const getColumnSearchProps = (dataIndex, title) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div style={{ padding: 8 }}>
                <Input
                    ref={node => {
                        searchInput[dataIndex] = node;
                    }}
                    placeholder={`Tìm ${title}`}
                    value={selectedKeys[0]}
                    onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    style={{ marginBottom: 8, display: 'block' }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Tìm
                    </Button>
                    <Button
                        onClick={() => handleReset(clearFilters, confirm, dataIndex)}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Reset
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: filtered => (
            <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
        ),
        onFilter: (value, record) =>
            record[dataIndex]
                ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
                : '',
        onFilterDropdownOpenChange: visible => {
            if (visible) {
                setTimeout(() => searchInput[dataIndex]?.select(), 100);
            }
        },
        render: text =>
            searchedColumn === dataIndex ? (
                <Highlighter
                    highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                    searchWords={[searchText]}
                    autoEscape
                    textToHighlight={text ? text.toString() : ''}
                />
            ) : (
                text
            ),
    });

    const formatDate = (timestamp) => {
        return new Date(timestamp).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric'
        });
    };

    const getEmployeeName = (employeeId) => {
        const employee = employeeInfo[employeeId];
        if (!employee) return 'N/A';
        return employee.fullname || employee.nickname || employee.username || 'N/A';
    };

    // Handle create/update asset
    const handleSubmit = async (values) => {
        try {
            const payload = {
                asset: {
                    ...values,
                    timeCreate: editingAsset ? editingAsset.timeCreate : Date.now(),
                    deviceID: editingAsset ? editingAsset.deviceID : undefined
                }
            };

            if (editingAsset) {
                // Ensure deviceID is included for update
                if (!payload.asset.deviceID) {
                    throw new Error('Missing deviceID for update');
                }
                await api.post('api/administrative/asset/manager-update', payload);
                notification.success({
                    message: 'Thành công',
                    description: 'Cập nhật tài sản thành công',
                });
            } else {
                await api.post('api/administrative/asset/manager-create', payload);
                notification.success({
                    message: 'Thành công',
                    description: 'Thêm tài sản thành công',
                });
            }
            setIsModalVisible(false);
            form.resetFields();
            fetchAssets();
        } catch (error) {
            console.error('Error:', error);
            message.error(error.message || 'Có lỗi xảy ra');
        }
    };

    // Handle delete asset
    const handleDelete = async (deviceID) => {
        try {
            await api.post('api/administrative/asset/manager-delete', { deviceID });
            notification.success({
                message: 'Thành công',
                description: 'Cập nhật tài sản thành công',
            });
            fetchAssets();
        } catch (error) {
            notification.error({
                message: 'Lỗi',
                description: 'Không thể xóa tài sản',
            });
        }
    };

    const columns = [
        {
            title: 'Mã TS',
            dataIndex: 'deviceID',
            key: 'deviceID',
            width: 80,
            fixed: 'left',
            sorter: (a, b) => a.deviceID - b.deviceID,
            align: 'center',
            ...getColumnSearchProps('deviceID', 'Mã TS'),
        },
        {
            title: 'Tên tài sản',
            dataIndex: 'name',
            key: 'name',
            fixed: 'left',
            width: 200,
            sorter: (a, b) => a.name.localeCompare(b.name),
            align: 'center',
            ...getColumnSearchProps('name', 'tên tài sản'),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (status) => {
                const statusOption = statusOptions.find(opt => opt.value === status) || statusOptions[0];
                return (
                    <Tag color={statusOption.color}>
                        {statusOption.label}
                    </Tag>
                );
            },
            filters: statusOptions.map(option => ({
                text: option.label,
                value: option.value,
            })),
            onFilter: (value, record) => record.status === value,
            sorter: (a, b) => a.status - b.status,
            align: 'center',
        },
        {
            title: 'Danh mục',
            dataIndex: 'category',
            key: 'category',
            width: 120,
            sorter: (a, b) => a.category.localeCompare(b.category),
            align: 'center',
            ...getColumnSearchProps('category', 'danh mục'),
        },
        {
            title: 'Nhóm',
            dataIndex: 'groupName',
            key: 'groupName',
            width: 150,
            align: 'center',
            ...getColumnSearchProps('groupName', 'nhóm'),
        },
        {
            title: 'Model',
            dataIndex: 'model',
            key: 'model',
            width: 120,
            align: 'center',
            ...getColumnSearchProps('model', 'model'),
        },
        {
            title: 'Đơn giá',
            dataIndex: 'price',
            key: 'price',
            width: 120,
            render: (price) => price ? `${price.toLocaleString()} VND` : 'N/A',
            sorter: (a, b) => a.price - b.price,
            align: 'center',
            ...getColumnSearchProps('price', 'đơn giá'),
        },
        {
            title: 'Số lượng',
            dataIndex: 'quantity',
            key: 'quantity',
            width: 100,
            sorter: (a, b) => a.quantity - b.quantity,
            align: 'center', // Center align
            ...getColumnSearchProps('quantity', 'Số lượng'),
        },
        {
            title: 'Thương hiệu',
            dataIndex: 'brand',
            key: 'brand',
            width: 120,
            sorter: (a, b) => a.brand.localeCompare(b.brand),
            align: 'center', // Center align
            ...getColumnSearchProps('brand', 'Thương hiệu'),
        },

        {
            title: 'Mã định danh',
            dataIndex: 'identityCode',
            key: 'identityCode',
            width: 120,
            align: 'center', // Center align
            ...getColumnSearchProps('identityCode', 'Mã định danh'),
        },

        {
            title: 'Vị trí',
            dataIndex: 'location',
            key: 'location',
            width: 120,
            align: 'center', // Center align
            ...getColumnSearchProps('location', 'Vị trí'),
        },
        {
            title: 'Người mua',
            dataIndex: 'employeeBuyer',
            key: 'employeeBuyer',
            width: 150,
            render: (employeeId) => getEmployeeName(employeeId),
            align: 'center', // Center align
            filters: employeeOptions.map(option => ({
                text: option.label,
                value: option.value,
            })),
            onFilter: (value, record) => record.employeeBuyer === value,
        },
        {
            title: 'Người giữ',
            dataIndex: 'employeeKeeper',
            key: 'employeeKeeper',
            width: 150,
            render: (employeeId) => getEmployeeName(employeeId),
            align: 'center', // Center align
            filters: employeeOptions.map(option => ({
                text: option.label,
                value: option.value,
            })),
            onFilter: (value, record) => record.employeeKeeper === value,
        },

        {
            title: 'Ngày tạo',
            dataIndex: 'timeCreate',
            key: 'timeCreate',
            width: 150,
            render: (timestamp) => formatDate(timestamp),
            sorter: (a, b) => a.timeCreate - b.timeCreate,
            align: 'center', // Center align
        },
        {
            title: 'Thao tác',
            key: 'action',
            fixed: 'right',
            width: 120,
            render: (_, record) => (
                <Space>
                    <Button
                        type="primary"
                        ghost
                        icon={<EditOutlined />}
                        onClick={() => {
                            setEditingAsset(record);
                            form.setFieldsValue(record);
                            setIsModalVisible(true);
                        }}
                    />

                    <Popconfirm
                        title="Bạn có chắc chắn muốn xóa?"
                        onConfirm={() => handleDelete(record.deviceID)}
                    >
                        <Button icon={<DeleteOutlined />} danger />
                    </Popconfirm>
                </Space>
            ),
            align: 'center', // Center align
        },
    ];

    const handleGlobalSearch = (value) => {
        const searchLower = value.toLowerCase();
        const filtered = assets.filter(asset => {
            return (
                asset.name?.toLowerCase().includes(searchLower) ||
                asset.category?.toLowerCase().includes(searchLower) ||
                asset.brand?.toLowerCase().includes(searchLower) ||
                asset.identityCode?.toLowerCase().includes(searchLower) ||
                asset.location?.toLowerCase().includes(searchLower) ||
                asset.model?.toLowerCase().includes(searchLower) ||
                asset.groupName?.toLowerCase().includes(searchLower) ||
                asset.deviceID?.toString().includes(searchLower) ||
                getEmployeeName(asset.employeeBuyer)?.toLowerCase().includes(searchLower) ||
                getEmployeeName(asset.employeeKeeper)?.toLowerCase().includes(searchLower)
            );
        });
        setFilteredAssets(filtered);
    };
    return (
        <div className='card' style={{ padding: 24 }}>
            <div className="mb-4">
                <Row gutter={[16, 16]} align="middle" justify="space-between">
                    <Col>
                        <Space>
                            <Button
                                icon={<ReloadOutlined />}
                                onClick={() => {
                                    handleReset();
                                    setFilteredAssets(assets);
                                }}
                            >
                                Làm mới
                            </Button>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={() => {
                                    setEditingAsset(null);
                                    form.resetFields();
                                    setIsModalVisible(true);
                                }}
                            >
                                Thêm tài sản mới
                            </Button>
                        </Space>
                    </Col>
                </Row>
                <Divider />
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} md={8} lg={6}>
                        <Input
                            prefix={<SearchOutlined />}
                            placeholder="Tìm kiếm tổng thể..."
                            allowClear
                            onChange={(e) => handleGlobalSearch(e.target.value)}
                        />
                    </Col>
                </Row>
            </div>

            <Table
                bordered
                columns={columns}
                dataSource={filteredAssets}
                rowKey="deviceID"
                loading={loading}
                scroll={{ x: 1500, y: 'calc(90vh - 100px)' }}
                pagination={false}
                footer={() => `Tổng ${filteredAssets.length} mục`}
                locale={{
                    emptyText: <EmptyState />,
                }}
            />

            <Modal
                title={editingAsset ? 'Cập nhật thông tin tài sản' : 'Thêm tài sản mới'}
                open={isModalVisible}
                onCancel={() => {
                    setIsModalVisible(false);
                    form.resetFields();
                }}
                width={800}
                footer={null}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="name"
                                label="Tên tài sản"
                                rules={[{ required: true, message: 'Vui lòng nhập tên tài sản' }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="category"
                                label="Danh mục"
                                rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="status"
                                label="Trạng thái"
                                rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
                            >
                                <Select options={statusOptions} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="brand"
                                label="Thương hiệu"
                                rules={[{ required: true, message: 'Vui lòng nhập thương hiệu' }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="groupName"
                                label="Nhóm"
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="model"
                                label="Model"
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="identityCode"
                                label="Mã định danh"
                                rules={[{ required: true, message: 'Vui lòng nhập mã định danh' }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="invoiceCode"
                                label="Mã hóa đơn"
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="price"
                                label="Giá"
                                rules={[{ required: true, message: 'Vui lòng nhập giá' }]}
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                    min={0}
                                    placeholder="Nhập giá tài sản"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="quantity"
                                label="Số lượng"
                                rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    min={1}
                                    defaultValue={1}
                                    placeholder="Nhập số lượng"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="location"
                                label="Vị trí"
                                rules={[{ required: true, message: 'Vui lòng nhập vị trí' }]}
                            >
                                <Input placeholder="Nhập vị trí tài sản" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="employeeBuyer"
                                label="Người mua"
                                rules={[{ required: true, message: 'Vui lòng chọn người mua' }]}
                            >
                                <Select
                                    showSearch
                                    placeholder="Chọn người mua"
                                    options={employeeOptions}
                                    filterOption={(input, option) =>
                                        option?.label.toLowerCase().includes(input.toLowerCase())
                                    }
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="employeeKeeper"
                                label="Người giữ"
                                rules={[{ required: true, message: 'Vui lòng chọn người giữ' }]}
                            >
                                <Select
                                    showSearch
                                    placeholder="Chọn người giữ"
                                    options={employeeOptions}
                                    filterOption={(input, option) =>
                                        option?.label.toLowerCase().includes(input.toLowerCase())
                                    }
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item
                                name="description"
                                label="Mô tả"
                            >
                                <Input.TextArea
                                    rows={4}
                                    placeholder="Nhập mô tả chi tiết về tài sản"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item className="text-right">
                        <Space>
                            <Button onClick={() => {
                                setIsModalVisible(false);
                                form.resetFields();
                            }}>
                                Hủy
                            </Button>
                            <Button type="primary" htmlType="submit">
                                {editingAsset ? 'Cập nhật' : 'Thêm mới'}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default AssetManagement;