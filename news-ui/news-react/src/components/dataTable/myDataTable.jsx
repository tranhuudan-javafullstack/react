import React, { useState, useCallback, useMemo } from 'react';
import { Button, Input, Modal, Popconfirm, Space, Spin, Table, Typography } from 'antd';
import { ClearOutlined, QuestionCircleOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';

const { Title } = Typography;

const MyDataTable = ({
    columns,
    dataSource,
    title,
    modalTitle,
    renderModalContent,
    onDelete,
    onReload,
    loading,
    error
}) => {
    // State management
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const [filteredInfo, setFilteredInfo] = useState({});
    const [sortedInfo, setSortedInfo] = useState({});
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [open, setOpen] = useState(false);
    const [modalId, setModalId] = useState(null);

    // Handlers
    const handleSearch = useCallback((selectedKeys, confirm, dataIndex) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
    }, []);

    const handleReset = useCallback((clearFilters, confirm, dataIndex) => {
        clearFilters();
        setSearchText('');
        confirm();
        if (searchedColumn === dataIndex) {
            setSearchedColumn('');
        }
    }, [searchedColumn]);

    const handleClearAll = useCallback(() => {
        setSearchText('');
        setSearchedColumn('');
        setFilteredInfo({});
        setSortedInfo({});
    }, []);

    const handleChange = useCallback((pagination, filters, sorter) => {
        setFilteredInfo(filters);
        setSortedInfo(sorter);
    }, []);

    const showModal = useCallback((id) => {
        setOpen(true);
        setModalId(id);
    }, []);

    // Column configuration
    const getColumnSearchProps = useCallback((dataIndex) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div style={{ padding: 8 }}>
                <Input
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    style={{ width: 188, marginBottom: 8, display: 'block' }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Search
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
        filterIcon: (filtered) => (
            <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
        ),
        onFilter: (value, record) =>
            record[dataIndex]
                ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
                : '',
        filteredValue: filteredInfo[dataIndex] || null,
        sortOrder: sortedInfo.columnKey === dataIndex ? sortedInfo.order : null,
    }), [handleSearch, handleReset, filteredInfo, sortedInfo]);

    // Enhance columns with search props
    const enhancedColumns = useMemo(() =>
        columns.map(column => ({
            ...column,
            ...(column.searchable ? getColumnSearchProps(column.dataIndex) : {}),
        }))
        , [columns, getColumnSearchProps]);

    // Row selection configuration
    const rowSelection = {
        selectedRowKeys,
        onChange: setSelectedRowKeys,
        selections: [
            Table.SELECTION_ALL,
            Table.SELECTION_INVERT,
            Table.SELECTION_NONE,
            {
                key: 'odd',
                text: 'Select Odd Row',
                onSelect: (changeableRowKeys) => {
                    setSelectedRowKeys(changeableRowKeys.filter((_, index) => index % 2 !== 0));
                },
            },
            {
                key: 'even',
                text: 'Select Even Row',
                onSelect: (changeableRowKeys) => {
                    setSelectedRowKeys(changeableRowKeys.filter((_, index) => index % 2 === 0));
                },
            },
        ],
    };

    return (
        <div className='reusable-data-table'>
            <Modal
                title={<p style={{ textAlign: 'center', textTransform: 'uppercase', fontSize: '20px' }}>
                    {modalTitle}
                </p>}
                open={open}
                onCancel={() => setOpen(false)}
                footer={<Button type="primary" onClick={() => setOpen(false)}>Close</Button>}
            >
                {renderModalContent(modalId)}
            </Modal>

            <Title level={2}>{title}</Title>
            <div className="main-content">
                <Space style={{ marginBottom: 16 }}>
                    <Button icon={<ReloadOutlined />} onClick={onReload} loading={loading}>
                        {loading ? 'Reloading...' : 'Reload data'}
                    </Button>
                    <Button icon={<ClearOutlined />} onClick={handleClearAll}>
                        Clear all filters and sorters
                    </Button>
                </Space>

                {loading ? (
                    <Spin size="large" style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        minHeight: '100vh',
                        position: 'absolute',
                        width: '100%',
                        top: 100,
                        left: 50,
                    }} />
                ) : (
                    <Table
                        rowSelection={rowSelection}
                        rowKey="id"
                        columns={enhancedColumns}
                        dataSource={dataSource}
                        pagination={{ position: ['bottomCenter'] }}
                        onChange={handleChange}
                        scroll={{ x: 'max-content' }}
                        loading={loading}
                        bordered
                        size="small"
                    />
                )}
            </div>
        </div>
    );
};

export default MyDataTable;