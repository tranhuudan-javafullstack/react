import React from 'react';
import { Card, Button, Popconfirm, Tag, Space, Table, Typography } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';

const { Title } = Typography;

const AddOnManagement = ({ addOns, showAddOnModal, handleDeleteAddOn, showAddOnItemModal, handleDeleteAddOnItem }) => {
    const columns = [
        {
            title: 'Tiêu đề',
            dataIndex: 'title',
            key: 'title',
        },
        {
            title: 'Loại',
            dataIndex: 'type',
            key: 'type',
            render: (type) => (
                <Tag color={type === 1 ? 'red' : type === 2 ? 'green' : 'blue'}>
                    {type === 1 ? 'Ít nhất 1' : type === 2 ? 'Tùy chọn' : 'Chọn 1'}
                </Tag>
            ),
        },
        {
            title: 'Sắp xếp',
            dataIndex: 'sorting',
            key: 'sorting',
        },
        {
            title: 'Hành động',
            key: 'actions',
            render: (_, addon) => (
                <Space>
                    <Button onClick={() => showAddOnModal(addon)} icon={<EditOutlined />} />
                    <Popconfirm
                        title="Are you sure you want to delete this add-on?"
                        onConfirm={() => handleDeleteAddOn(addon.addOnID)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const expandedRowRender = (addon) => {
        const itemColumns = [
            { title: 'Tiêu đề', dataIndex: 'title', key: 'title' },
            { title: 'Giá', dataIndex: 'price', key: 'price' },
            { title: 'Chọn mặc định', dataIndex: 'isDefault', key: 'isDefault', render: (isDefault) => isDefault ? 'Yes' : 'No' },
            {
                title: 'Hành động',
                key: 'actions',
                render: (_, item) => (
                    <Space>
                        <Button onClick={() => showAddOnItemModal(addon.addOnID, item)} icon={<EditOutlined />} />
                        <Popconfirm
                            title="Bạn có muốn xóa lựa chọn này?"
                            onConfirm={() => handleDeleteAddOnItem(addon.addOnID, item.addOnItemID)}
                            okText="Yes"
                            cancelText="No"
                        >
                            <Button icon={<DeleteOutlined />} />
                        </Popconfirm>
                    </Space>
                ),
            },
        ];

        return (
            <Card
                className='ms-5'
                title="Các lựa chọn"
                extra={
                    <Button
                        onClick={() =>
                            showAddOnItemModal(addon.addOnID)
                        }
                        icon={
                            <PlusOutlined />}>
                        Thêm lựa chọn
                    </Button>}>
                <Table
                    className='ms-5'
                    columns={itemColumns}
                    dataSource={addon.listItem || []}
                    pagination={false}
                    rowKey="addOnItemID"
                />
            </Card>
        );
    };

    return (
        <Card
            title={<Title level={4}>Lựa chọn thêm</Title>}
            extra={<Button onClick={() => showAddOnModal()} icon={<PlusOutlined />}>Thêm lựa chọn mới</Button>}
        >
            <Table
                className='ms-5'
                columns={columns}
                pagination={false}
                expandable={{
                    expandedRowRender,
                }}
                dataSource={addOns}
                rowKey="addOnID"
                rowStyle={{ backgroundColor: '#222222!Important' }}
            />
        </Card>
    );
};

export default AddOnManagement;