import React, { useState, useEffect } from 'react';
import { Dropdown, Checkbox, List, Input, Badge, Typography, Space, Tooltip, Button } from 'antd';
import { UserOutlined, SearchOutlined, DownOutlined } from '@ant-design/icons';

const { Text } = Typography;

const EmployeeSelectorModal = ({
    nhanVienHienThi = [],
    handleEmployeeSelectionChange,
    tatCaNhanVien
}) => {
    const [checkedList, setCheckedList] = useState([]);
    const [checkAll, setCheckAll] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const initialCheckedList = nhanVienHienThi.length === 0
            ? tatCaNhanVien.map(nv => nv.value)
            : nhanVienHienThi;

        setCheckedList(initialCheckedList);
        setCheckAll(initialCheckedList.length === tatCaNhanVien.length);
    }, [nhanVienHienThi, tatCaNhanVien]);

    const filteredEmployees = tatCaNhanVien.filter(nv =>
        nv.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCheckboxChange = (checkedValues) => {
        setCheckedList(checkedValues);
        setCheckAll(checkedValues.length === tatCaNhanVien.length);
    };

    const handleCheckAllChange = (e) => {
        const checked = e.target.checked;
        const newCheckedList = checked ? tatCaNhanVien.map((nv) => nv.value) : [];
        setCheckedList(newCheckedList);
        setCheckAll(checked);
    };

    const handleOkClick = () => {
        handleEmployeeSelectionChange(checkedList);
        setOpen(false); // Close the dropdown after confirming selection
    };

    const handleSearch = (e) => {
        e.stopPropagation();
        setSearchTerm(e.target.value);
    };

    const handleDropdownOpenChange = (flag) => {
        setOpen(flag);
    };

    const renderSelectedCount = () => (
        <Space>
            <Text>Đã chọn:</Text>
            <Badge count={checkedList.length} style={{ backgroundColor: '#52c41a' }} />
        </Space>
    );

    const dropdownContent = (
        <div onClick={e => e.stopPropagation()} style={{ padding: '8px', width: '250px', backgroundColor: 'white', borderRadius: '10px' }}>
            <Space style={{ width: '100%', marginBottom: 16 }} direction="vertical">
                <Input
                    placeholder="Tìm kiếm nhân viên..."
                    prefix={<SearchOutlined />}
                    onChange={handleSearch}
                    allowClear
                    onClick={e => e.stopPropagation()}
                />

                <Space>
                    <Checkbox
                        indeterminate={checkedList.length > 0 && checkedList.length < tatCaNhanVien.length}
                        onChange={handleCheckAllChange}
                        checked={checkAll}
                    >
                        Chọn tất cả
                    </Checkbox>

                    {renderSelectedCount()}
                </Space>
            </Space>

            <Checkbox.Group
                style={{ width: '100%' }}
                value={checkedList}
                onChange={handleCheckboxChange}
            >
                <List
                    dataSource={filteredEmployees}
                    renderItem={(nhanVien) => (
                        <List.Item
                            style={{
                                padding: '8px',
                                margin: '4px 0',
                                backgroundColor: checkedList.includes(nhanVien.value) ? '#f0f7ff' : 'transparent',
                                borderRadius: '4px',
                                transition: 'all 0.3s'
                            }}
                        >
                            <Checkbox value={nhanVien.value} style={{ width: '100%' }}>
                                <Space>
                                    {nhanVien.label}
                                </Space>
                            </Checkbox>
                        </List.Item>
                    )}
                    style={{
                        maxHeight: '300px',
                        overflowY: 'auto',
                        border: '1px solid #f0f0f0',
                        borderRadius: '4px',
                        padding: '8px'
                    }}
                    locale={{ emptyText: 'Không tìm thấy nhân viên' }}
                />
            </Checkbox.Group>

            <div style={{ textAlign: 'right', marginTop: '8px' }}>
                <Button type="primary" onClick={handleOkClick}>
                    Ok
                </Button>
            </div>
        </div>
    );

    return (
        <div>
            <Dropdown
                open={open}
                onOpenChange={handleDropdownOpenChange}
                overlay={dropdownContent}
                trigger={['click']}
                placement="bottomRight"
            >
                <Tooltip title="Chọn nhân viên hiển thị" className="hover-effect">
                    <div className='hover-effect' style={{ cursor: 'pointer' }}>
                        <Space>
                            <UserOutlined className="clickable-icon" />
                            <span>({checkedList.length})</span>
                            <DownOutlined style={{ fontSize: '12px' }} />
                        </Space>
                    </div>
                </Tooltip>
            </Dropdown>

            <style jsx>{`
                .hover-effect:hover {
                    color: #1890ff;
                    transform: scale(1.1);
                }
                .hover-effect {
                    transition: color 0.3s, transform 0.3s;
                }
            `}</style>
        </div>
    );
};

export default EmployeeSelectorModal;
