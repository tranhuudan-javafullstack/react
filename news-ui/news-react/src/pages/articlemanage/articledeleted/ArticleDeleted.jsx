import { ClearOutlined, HomeOutlined, LoadingOutlined, QuestionCircleOutlined, SearchOutlined } from '@ant-design/icons';
import { Breadcrumb, Button, Image, Input, Popconfirm, Select, Space, Table, Tooltip, Typography } from 'antd';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { LazyLoadComponent } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { useNavigate } from 'react-router-dom';
import { useArticleMutation } from '../../../hooks/useMutations.js';
import { useArticleQuery } from '../../../hooks/useQueries.js';
import { useNotificationProvider } from '../../../provider/NotificationProvider';
import './articledeleted.scss';
const { Title } = Typography;

const ArticleDeleted = () => {
    // State management
    const [searchedColumn, setSearchedColumn] = useState('');
    const [categoryFilters, setCategoryFilters] = useState([]);
    const [filteredInfo, setFilteredInfo] = useState({});
    const [sortedInfo, setSortedInfo] = useState({});

    // Hooks
    const { openerror, opensuccess } = useNotificationProvider();
    const navigate = useNavigate();
    const deleteArticleMutation = useArticleMutation('delete-permanently');
    const restoreArticleMutation = useArticleMutation('restore');

    // Queries
    const {
        data,
        error,
        isError,
        isFetching,
        refetch,
    } = useArticleQuery('get-all-articles-deleted');


    // Effects
    useEffect(() => {
        if (data) {
            const uniqueCategories = [...new Set(data.map(item => item.category.categoryName))];
            const filters = uniqueCategories.map(category => ({ text: category, value: category }));
            setCategoryFilters(filters);
        }
    }, [data]);

    useEffect(() => {
        if (isError) {
            openerror('Error fetching articles', error.message);
        }
    }, [isError, error, openerror]);

    // Memoized values
    const sortedData = useMemo(() =>
        data ? [...data].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)) : []
        , [data]);

    // Handlers
    const handleSearch = useCallback((selectedKeys, confirm, dataIndex) => {
        confirm();
        setSearchedColumn(dataIndex);
    }, []);

    const handleReset = useCallback((clearFilters, confirm, dataIndex) => {
        clearFilters();
        confirm();
        if (searchedColumn === dataIndex) {
            setSearchedColumn('');
        }
    }, [searchedColumn]);




    const handleDelete = useCallback(async (id) => {
        try {
            await deleteArticleMutation.mutateAsync({ 'articleId': id });
            opensuccess('Delete successful', 'Article has been deleted.');
        } catch (err) {
            openerror('Delete failed', 'Article has not been deleted.' + err);
        }
    }, [deleteArticleMutation, opensuccess, openerror]);
    const handleStore = useCallback(async (id) => {
        try {
            await restoreArticleMutation.mutateAsync({ 'articleId': id });
            opensuccess('Restore successful', 'Article has been restore.');
        } catch (err) {
            openerror('Restore failed', 'Article has not been restore.' + err);
        }
    }, [deleteArticleMutation, opensuccess, openerror]);

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

    const columns = useMemo(() => [
        {
            title: 'Tiêu đề',
            dataIndex: 'title',
            key: 'title',
            ...getColumnSearchProps('title'),
            sorter: (a, b) => a.title.localeCompare(b.title),
        },
        {
            title: 'Ảnh thu nhỏ',
            dataIndex: 'thumbnailBase64',
            key: 'thumbnail',
            render: (_, record) => (
                <LazyLoadComponent>
                    <Image
                        src={record.thumbnailBase64}
                        alt={record.title}
                        width={50}
                        height={50}
                        style={{ objectFit: 'cover' }}
                    />
                </LazyLoadComponent>
            ),
        },
        {
            title: 'Tác giả',
            dataIndex: 'author',
            key: 'author',
            ...getColumnSearchProps('author'),
            sorter: (a, b) => a.author.localeCompare(b.author),
        },
        {
            title: 'Thể loại',
            dataIndex: ['category', 'categoryName'],
            key: 'category',
            filters: categoryFilters,
            onFilter: (value, record) => record.category.categoryName === value,
            filterSearch: true,
            sorter: (a, b) => a.category.categoryName.localeCompare(b.category.categoryName),
            filteredValue: filteredInfo['category'] || null,
            sortOrder: sortedInfo.columnKey === 'category' ? sortedInfo.order : null,
        },
        {
            title: 'Ngày cập nhật',
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            sorter: (a, b) => new Date(a.updatedAt) - new Date(b.updatedAt),
            sortOrder: sortedInfo.columnKey === 'updatedAt' ? sortedInfo.order : null,
            render: (updatedAt) => new Date(updatedAt).toLocaleString()
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button type="primary" onClick={() => {
                        handleStore(record.articleId)
                    }}>Khôi phục</Button>
                    <Button onClick={() => navigate(`/article/${record.articleId}`)} >Xem chi tiết</Button>
                    <Popconfirm
                        onConfirm={() => handleDelete(record.articleId)}
                        title="Delete the article"
                        description={`Are you sure to delete this article with title "${record.title}"?`}
                        icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                    >
                        <Button danger>Xóa</Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ], [getColumnSearchProps, categoryFilters, filteredInfo, sortedInfo, navigate, handleDelete]);

    // Row selection configuration
    const defaultCheckedList = columns.map((item) => item.key);
    const [checkedList, setCheckedList] = useState(defaultCheckedList);

    const options = columns.map(({ key, title }) => ({
        label: title,
        value: key,
    }));

    const newColumns = columns.map((item) => ({
        ...item,
        hidden: !checkedList.includes(item.key),
    }));

    const filteredColumns = newColumns.filter((column) => !column.hidden);

    const handleColumnVisibilityChange = (value) => {
        setCheckedList(value);
    };
    return (
        <div className='articledeleted'>
            <div className="breadcrumb">
                <Breadcrumb
                    items={[{
                        href: '#',
                        title: <HomeOutlined />,
                    }, {
                        href: '#/dashboard',
                        title: (
                            <span>Thống kê chung</span>
                        ),
                    },
                    {
                        title: 'Danh sách các bài viết đã xóa',
                    },
                    ]}
                />
                <div className="title">
                    <Title level={3}>Các bài viết đã xóa</Title>
                </div>
                <div className="control">
                    <Space  >
                        <Button onClick={refetch}>
                            Tải lại
                        </Button>
                        <Select
                            mode="multiple"
                            style={{ minWidth: '200px' }}
                            placeholder="Chọn cột hiển thị"
                            value={checkedList}
                            onChange={(value) => {
                                setCheckedList(value);
                            }}
                            options={options}
                            maxTagCount={'responsive'}
                            maxTagPlaceholder={(omittedValues) => (
                                <Tooltip
                                    overlayStyle={{
                                        pointerEvents: 'none',
                                    }}
                                    title={omittedValues.map(({ label }) => label).join(', ')}
                                >
                                    <span>Các cột hiển thị</span>
                                </Tooltip>
                            )}
                        />

                        <Button icon={<ClearOutlined />} onClick={() => {
                            setFilteredInfo({});
                            setSortedInfo({});
                        }}>
                            Làm sạch bộ lọc và sắp xếp
                        </Button>
                    </Space>
                </div>
            </div>


            <div className="main-content">

                <Table
                    rowKey="id"
                    columns={filteredColumns}
                    dataSource={sortedData}
                    pagination={{ position: ['bottomCenter'] }}
                    onChange={(pagination, filters, sorter) => {
                        setFilteredInfo(filters);
                        setSortedInfo(sorter);
                    }}
                    scroll={{ x: 'max-content' }}
                    loading={{
                        spinning: isFetching,
                        indicator: <LoadingOutlined spin />,
                        size: 'large',
                    }}
                    bordered
                    size="small"
                />
            </div>
        </div>
    );
};

export default ArticleDeleted;