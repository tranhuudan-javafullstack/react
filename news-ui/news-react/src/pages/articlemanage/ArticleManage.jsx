import {
    CheckCircleOutlined,
    ClearOutlined,
    HomeOutlined,
    LoadingOutlined,
    QuestionCircleOutlined,
    SearchOutlined
} from '@ant-design/icons';
import { Breadcrumb, Button, Image, Input, Popconfirm, Select, Space, Switch, Table, Tag, Tooltip, Typography } from 'antd';
import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { LazyLoadComponent } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { useNavigate } from 'react-router-dom';
import { useArticleMutation } from '../../hooks/useMutations.js';
import { useArticleQuery } from '../../hooks/useQueries.js';
import { useNotificationProvider } from '../../provider/NotificationProvider';
import './articlemanage.scss';

const { Title } = Typography;

const ArticleManage = () => {
    const [categoryFilters, setCategoryFilters] = useState([]);
    const [filteredInfo, setFilteredInfo] = useState({});
    const [sortedInfo, setSortedInfo] = useState({});

    // Cache previous filter/sort conditions
    const prevFilterRef = useRef(filteredInfo);
    const prevSortRef = useRef(sortedInfo);

    // Hooks
    const { openerror, opensuccess } = useNotificationProvider();
    const navigate = useNavigate();
    const deleteArticleMutation = useArticleMutation('delete');
    const publishedArticleMutation = useArticleMutation('published');

    // Queries
    const {
        data,
        error,
        isError,
        isFetching,
        refetch,
    } = useArticleQuery('get-all-overview');

    // Memoize category filters computation
    useEffect(() => {
        if (data) {
            const categoryMap = new Map();
            data.forEach(item => {
                categoryMap.set(item.category.categoryName, true);
            });
            const filters = Array.from(categoryMap.keys()).map(category => ({
                text: category,
                value: category
            }));
            setCategoryFilters(filters);
        }
    }, [data]);

    useEffect(() => {
        if (isError) {
            openerror('Error fetching articles', error.message);
        }
    }, [isError, error, openerror]);

    // Memoize sorted and filtered data
    const processedData = useMemo(() => {
        if (!data) return [];

        let result = [...data];

        // Apply filters
        if (Object.keys(filteredInfo).length > 0) {
            Object.entries(filteredInfo).forEach(([key, value]) => {
                if (!value || value.length === 0) return;

                if (key === 'isPublished') {
                    result = result.filter(item => item.isPublished === value[0]);
                } else if (key === 'category') {
                    result = result.filter(item => value.includes(item.category.categoryName));
                }
                // Add other filter conditions as needed
            });
        }

        // Apply sorting
        if (sortedInfo.columnKey) {
            const { columnKey, order } = sortedInfo;
            result.sort((a, b) => {
                let comparison = 0;

                switch (columnKey) {
                    case 'title':
                        comparison = a.title.localeCompare(b.title);
                        break;
                    case 'countAds':
                        comparison = a.countAds - b.countAds;
                        break;
                    case 'views':
                        comparison = a.views - b.views;
                        break;
                    case 'category':
                        comparison = a.category.categoryName.localeCompare(b.category.categoryName);
                        break;
                    case 'updatedAt':
                        comparison = new Date(a.updatedAt) - new Date(b.updatedAt);
                        break;
                    default:
                        comparison = 0;
                }

                return order === 'ascend' ? comparison : -comparison;
            });
        }

        return result;
    }, [data, filteredInfo, sortedInfo]);

    // Memoize handlers
    const handleSearch = useCallback((selectedKeys, confirm, dataIndex) => {
        confirm();
    }, []);

    const handleReset = useCallback((clearFilters, confirm, dataIndex) => {
        clearFilters();
        confirm();
    }, []);

    const handleDelete = useCallback(async (id) => {
        try {
            await deleteArticleMutation.mutateAsync({ 'articleId': id });
            opensuccess('Delete successful', 'Article has been deleted.');
        } catch (err) {
            openerror('Delete failed', 'Article has not been deleted.' + err);
        }
    }, [deleteArticleMutation, opensuccess, openerror]);

    const onChangeSwitch = useCallback(async (articleId) => {
        try {
            await publishedArticleMutation.mutateAsync({ "articleId": articleId });
            opensuccess('change successful', 'Article has been change.');
        } catch (err) {
            openerror('change failed', 'Article has not been change.' + err);
        }
    }, [publishedArticleMutation, opensuccess, openerror]);

    // Memoize column search props
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

    // Memoize render functions
    const renderPublishedColumn = useCallback((_, record) => (
        record.isPublished ? (
            <Space direction="vertical">
                <Switch checked={true} onChange={() => onChangeSwitch(record.articleId)} />
                <Tag icon={<CheckCircleOutlined />} color="success">Đã xuất bản</Tag>
            </Space>
        ) : (
            <Space direction="vertical">
                <Switch checked={false} onChange={() => onChangeSwitch(record.articleId)} />
                <Tag icon={<CheckCircleOutlined />} color="error">Chưa xuất bản</Tag>
            </Space>
        )
    ), [onChangeSwitch]);

    const renderActionColumn = useCallback((_, record) => (
        <Space size="middle" direction='horizontal'>
            <Button type="primary" onClick={() => navigate(`/article/${record.articleId}/edit`)}>Sửa</Button>
            <Button onClick={() => navigate(`/article/${record.articleId}`)}>Xem chi tiết</Button>
            <Popconfirm
                onConfirm={() => handleDelete(record.articleId)}
                title="Delete the article"
                description={`Are you sure to delete this article with title "${record.title}"?`}
                icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
            >
                <Button danger>Xóa</Button>
            </Popconfirm>
        </Space>
    ), [navigate, handleDelete]);

    // Memoize columns configuration
    const columns = useMemo(() => [
        {
            title: 'Xuất bản',
            key: 'isPublished',
            dataIndex: 'isPublished',
            render: renderPublishedColumn,
            width: 50,
            filteredValue: filteredInfo['isPublished'] || null,
            filters: [
                { text: 'Đã xuất bản', value: true },
                { text: 'Chưa xuất bản', value: false }
            ],
            onFilter: (value, record) => record.isPublished === value,
            filterSearch: true,
            align: 'center',
        },
        {
            title: 'Tiêu đề',
            dataIndex: 'title',
            key: 'title',
            width: 170,
            ...getColumnSearchProps('title'),
            sorter: true,
            render: (_, record) => (
                <Space direction='vertical'>
                    <span style={{ color: 'green' }} >   {record.title}</span>
                    <a style={{ color: 'blue', textDecoration: 'underline' }} target='_blank' href={`http://localhost/article?title=${record.slug}`}>{record.slug}</a>
                </Space>
            )
        },
        {
            title: 'Số lượng quảng cáo',
            dataIndex: 'countAds',
            key: 'countAds',
            sorter: true,
            sortOrder: sortedInfo.columnKey === 'countAds' ? sortedInfo.order : null,
            width: 70,
            align: 'center',
            render: (_, record) => (<><Tag color='warning'>{record.countAds} quảng cáo</Tag>  </>),
        },
        {
            title: 'Số lượng bình luận',
            dataIndex: 'countComments',
            key: 'countComments',
            sorter: true,
            sortOrder: sortedInfo.columnKey === 'countComments' ? sortedInfo.order : null,
            width: 70,
            align: 'center',
            render: (_, record) => (<><Tag color='warning'>{record.countComments} bình luận</Tag> </>)
        },
        {
            title: 'Số lượt xem',
            dataIndex: 'views',
            key: 'views',
            width: 50,
            sortOrder: sortedInfo.columnKey === 'views' ? sortedInfo.order : null,
            sorter: true, align: 'center',
            render: (_, record) => (<><Tag color='warning'>{record.views} lượt xem</Tag> </>)
        },
        {
            title: 'Ảnh thu nhỏ',
            dataIndex: 'thumbnailBase64',
            key: 'thumbnail',
            width: 50, align: 'center',
            render: (_, record) => (
                <LazyLoadComponent>
                    <Image
                        src={record.thumbnailBase64}
                        alt={record.title}
                        width={70}
                        height={50}
                        style={{ objectFit: 'cover' }}
                    />
                </LazyLoadComponent>
            ),
        },
        {
            title: 'Thể loại',
            dataIndex: ['category', 'categoryName'],
            key: 'category',
            sorter: true,
            sortOrder: sortedInfo.columnKey === 'category' ? sortedInfo.order : null,
            width: 50,
            filteredValue: filteredInfo['category'] || null,
            filters: categoryFilters,
            onFilter: (value, record) => record.category.categoryName === value,
            filterSearch: true, align: 'center',
            render: (_, record) => (
                <Tag color='warning'>{record.category.categoryName}</Tag>
            )
        },
        {
            title: 'Ngày tạo / ngày cập nhật',
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            sortOrder: sortedInfo.columnKey === 'updatedAt' ? sortedInfo.order : null,
            sorter: true,
            width: 80, align: 'center',
            render: (_, record) => (
                <Space direction='vertical'>
                    <span style={{ color: 'green' }}>{new Date(record.createdAt).toLocaleString()}</span>
                    <span style={{ color: 'blue' }}>
                        {new Date(record.updatedAt).toLocaleString()}</span>

                </Space>
            )
        },
        {
            title: 'Thao tác',
            key: 'action',
            fixed: 'right',
            width: 100,
            render: renderActionColumn,
        },
    ], [
        categoryFilters,
        filteredInfo,
        getColumnSearchProps,
        renderPublishedColumn,
        renderActionColumn
    ]);

    // Handle table change with debounce
    const handleTableChange = useCallback((pagination, filters, sorter) => {
        // Only update if filters or sorter actually changed
        if (JSON.stringify(filters) !== JSON.stringify(prevFilterRef.current)) {
            setFilteredInfo(filters);
            prevFilterRef.current = filters;
        }
        if (JSON.stringify(sorter) !== JSON.stringify(prevSortRef.current)) {
            setSortedInfo(sorter);
            prevSortRef.current = sorter;
        }
    }, []);
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

    return (
        <div className='articlemanage'>
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
                        title: 'Danh sách các bài viết',
                    },
                    ]}
                />
                <div className="title">
                    <Title level={3}>Quản lý bài viết</Title>
                </div>
                <div className="control">
                    <Space  >
                        <Button type="primary" onClick={() => navigate('/article/create')}>Tạo mới</Button>
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
            </div >
            <div className="main-content"  >
                <Table
                    virtual
                    bordered={false}
                    tableLayout="fixed"
                    // rowSelection={{
                    //     selectedRowKeys,
                    //     onChange: setSelectedRowKeys,
                    //     selections: [
                    //         Table.SELECTION_ALL,
                    //         Table.SELECTION_INVERT,
                    //         Table.SELECTION_NONE,
                    //     ],
                    // }}
                    rowKey="articleId"
                    columns={filteredColumns}
                    dataSource={processedData}
                    pagination={{
                        pageSize: 250,
                        position: ['bottomCenter'],
                        showSizeChanger: true,
                        showQuickJumper: true
                    }}
                    sticky={false}
                    onChange={handleTableChange}
                    scroll={{
                        x: 'max-content',
                        y: 850,
                        scrollToFirstRowOnChange: true
                    }}
                    loading={{
                        spinning: isFetching,
                        indicator: <LoadingOutlined spin />,
                        size: 'large',
                    }}
                    size="small"

                />
            </div>
        </div>
    );
};

export default ArticleManage;