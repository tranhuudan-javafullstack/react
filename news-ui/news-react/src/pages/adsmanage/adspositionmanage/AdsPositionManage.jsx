import {
    ClearOutlined,
    HomeOutlined,
    LoadingOutlined,
    PlusOutlined,
    QuestionCircleOutlined,
    SearchOutlined
} from '@ant-design/icons';
import {
    Breadcrumb,
    Button,
    Divider,
    Form,
    Image,
    Input,
    Modal,
    Popconfirm,
    Select,
    Space, Table,
    Tooltip,
    Typography,
    Upload
} from 'antd';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LazyLoadComponent } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { useNavigate, useParams } from 'react-router-dom';
import { useAdsMutation } from '../../../hooks/useMutations.js';
import { useAdsQuery } from '../../../hooks/useQueries.js';
import { useNotificationProvider } from '../../../provider/NotificationProvider.jsx';
import './adspositionmanage.scss';

const { TextArea } = Input;
const { Title } = Typography;
const AdsPositionManage = () => {

    const { positionId } = useParams();

    const [searchedColumn, setSearchedColumn] = useState('');
    const [categoryFilters, setCategoryFilters] = useState([]);
    const [filteredInfo, setFilteredInfo] = useState({});
    const [sortedInfo, setSortedInfo] = useState({});
    const { openerror, opensuccess } = useNotificationProvider();
    const navigate = useNavigate();
    const deleteAdsPositionMutation = useAdsMutation('delete');
    const [adsSelecId, setAdsSelectId] = useState(null);

    const {
        data,
        refetch,
        isError,
        isFetching,
        error,
    } = useAdsQuery('get-ads-position', { positionId: positionId });

    const {
        data: adsPositionData,
        refetch: adsPositionRefetch,
        isError: adsPositionIsError,
        error: adsPositionError,
    } = useAdsQuery('get-ads-by-id', { positionId: positionId, adsId: adsSelecId });

    const {
        data: adsProviderData,
        isError: adsProviderIsError,
        error: adsProviderError,
    } = useAdsQuery('get-all-providers');

    const [openUpdate, setOpenUpdate] = useState(false);

    const saveAdsPositionMutation = useAdsMutation('save');


    const [base64ImageUpdate, setBase64ImageUpdate] = useState('');
    const [previewImageUpdate, setPreviewImageUpdate] = useState('');
    const [fileListUpdate, setFileListUpdate] = useState([]);

    const handlePreviewUpdate = useCallback(() => {
        setPreviewImageUpdate(base64ImageUpdate);
    }, [base64ImageUpdate]);


    useEffect(() => {
        if (isError) {
            openerror('Error fetching articles', error.message);
        }
        if (adsPositionIsError)
            openerror('Error fetching ads', adsPositionError.message);
    }, [isError, error, openerror, adsPositionError, adsPositionIsError]);

    const [form2] = Form.useForm();
    const [submittableUpdate, setSubmittableUpdate] = useState(false);
    const values2 = Form.useWatch([], form2);

    useEffect(() => {
        form2.validateFields({ validateOnly: true })
            .then(() => setSubmittableUpdate(true))
            .catch(() => setSubmittableUpdate(false));
    }, [form2, values2]);
    useEffect(() => {
        if (adsPositionData) {
            const valueInit = {
                partnerUpdate: adsPositionData.partner,
                titleUpdate: adsPositionData.title,
                descriptionUpdate: adsPositionData.description,
                urlUpdate: adsPositionData.url,
            };
            form2.setFieldsValue(valueInit);
            setFileListUpdate([
                {
                    url: adsPositionData.image,
                },
            ]);
            setBase64ImageUpdate(adsPositionData.image);
        }
    }, [adsPositionData, form2]);

    const [items, setItems] = useState([]);

    useEffect(
        () => {
            if (adsProviderData) {
                setItems(adsProviderData)
            }
        }
        , [adsProviderData])



    useEffect(() => {
        if (data) {
            const uniqueCategories = [...new Set(data.map(item => item.partner))];
            const filters = uniqueCategories.map(partner => ({ text: partner, value: partner }));
            setCategoryFilters(filters);
        }
    }, [data]);


    const sortedData = useMemo(() =>
        data ? [...data].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)) : []
        , [data]);

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
    const handleDelete = useCallback((asdId) => {
        try {
            deleteAdsPositionMutation.mutate({ 'positionId': positionId, 'adsId': asdId });
            opensuccess('Delete successful', 'Article has been deleted.');
        } catch (err) {
            openerror('Delete failed', 'Article has not been deleted.' + err);
        }
    }, [deleteAdsPositionMutation, opensuccess, openerror]);
    const [base64Image, setBase64Image] = useState('');
    const [previewImage, setPreviewImage] = useState('');
    const [fileList, setFileList] = useState([]);


    const handlePreview = useCallback(() => {
        setPreviewImage(base64Image);
    }, [base64Image]);


    const [open, setOpen] = useState(false);

    const [form1] = Form.useForm();
    const [submittable, setSubmittable] = useState(false);
    const values1 = Form.useWatch([], form1);

    useEffect(() => {
        form1.validateFields({ validateOnly: true })
            .then(() => setSubmittable(true))
            .catch(() => setSubmittable(false));
    }, [form1, values1]);

    const handleOk = useCallback(async () => {

        try {
            const articleValues = await form1.validateFields();

            const payload = {
                adsData: {
                    adsId: 0,
                    title: articleValues.title,
                    description: articleValues.description,
                    image: base64Image,
                    partner: articleValues.partner,
                    url: articleValues.url,
                    positionId: parseInt(positionId)
                }
            };

            await saveAdsPositionMutation.mutateAsync(payload);
            setOpen(false);
            opensuccess('Ads created successfully', 'Ads has been created successfully');
            form1.resetFields();
            setFileList([]);
            setBase64Image(null);
        } catch (error) {
            openerror('Error submitting form', error.message);
        }
    }, [base64Image, form1, positionId, saveAdsPositionMutation, opensuccess, openerror]);

    const handleOkUpdate = useCallback(async (adsId) => {
        try {
            const articleValues = await form2.validateFields();
            const payload = {
                adsData: {
                    adsId: adsId,
                    title: articleValues.titleUpdate,
                    description: articleValues.descriptionUpdate,
                    image: base64ImageUpdate,
                    partner: articleValues.partnerUpdate,
                    url: articleValues.urlUpdate,
                    positionId: positionId
                }
            };

            await saveAdsPositionMutation.mutateAsync(payload);
            setOpenUpdate(false);
            opensuccess('Ads created successfully', 'Ads has been created successfully');
            form2.resetFields();
            setFileListUpdate([]);
            setBase64ImageUpdate(null);
        } catch (error) {
            openerror('Error submitting form', error.message);
        }

    }, [base64ImageUpdate, form2, positionId, saveAdsPositionMutation, opensuccess, openerror]);

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


    const [isViewMode, setIsViewMode] = useState(false); const handleViewOrEdit = useCallback((record, isView = false) => {
        setAdsSelectId(record.adsId);
        setIsViewMode(isView);
        setOpenUpdate(true);
    }, []);
    const columns = useMemo(() => [
        {
            title: 'Tiêu đề',
            dataIndex: ['ads', 'title'],
            key: 'title',
            ...getColumnSearchProps('title'),
            sorter: (a, b) => a.title.localeCompare(b.title),
        },
        {
            title: 'Hình ảnh',
            dataIndex: ['ads', 'image'],
            key: 'image',
            render: (_, record) => (
                <LazyLoadComponent>
                    <Image
                        src={record.ads.image}
                        alt={record.ads.title}
                        width={100}
                        height={70}
                        style={{ objectFit: 'cover' }}
                    />
                </LazyLoadComponent>
            ),
        },
        {
            title: 'Bên cung cấp',
            dataIndex: ['ads', 'partner'],
            key: 'partner',
            ...getColumnSearchProps('partner'),
            sorter: (a, b) => a.partner.localeCompare(b.partner),
        },
        {
            title: 'Số bài viết sử dụng',
            dataIndex: 'countArticleUsed',
            key: 'countArticleUsed',
            sorter: (a, b) => a.countArticleUsed - b.countArticleUsed,
            sortOrder: sortedInfo.columnKey === 'countArticleUsed' ? sortedInfo.order : null,
            render: (_, record) => {
                return record.countArticleUsed + ' Bài viết'
            }
        },
        {
            title: 'Ngày cập nhật',
            dataIndex: ['ads', 'updatedAt'],
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
                    <Button type="primary" onClick={() => handleViewOrEdit(record, false)}>Sửa</Button>

                    <Button type="default" onClick={() => handleViewOrEdit(record, true)}>Xem chi tiết</Button>

                    <Popconfirm
                        onConfirm={() => handleDelete(record.adsId)}
                        title="Delete the ads"
                        description={`Are you sure to delete this ads with title "${record.ads.title}"?`}
                        icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                    >
                        <Button danger>Xóa</Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ], [getColumnSearchProps, categoryFilters, filteredInfo, sortedInfo, navigate, handleDelete]);

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



    let index = 0;


    const [name, setName] = useState('');
    const inputRef = useRef(null);

    const onNameChange = (event) => {
        setName(event.target.value);
    };


    const addItem = (e) => {
        e.preventDefault();
        setItems([...items, name || `New item ${index++}`]);
        setName('');
        setTimeout(() => {
            inputRef.current?.focus();
        }, 0);
    };

    return (
        <div className='adspositionmanage'>
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
                    }, {
                        href: '#/ads/manage',
                        title: (
                            <span>Quản lý vị trí</span>
                        ), menu: {
                            items: [
                                {
                                    key: '1',
                                    label: (
                                        <a rel="noopener noreferrer" href="#/ads/position/1">
                                            Vị trí 1
                                        </a>
                                    ),
                                },
                                {
                                    key: '2',
                                    label: (
                                        <a rel="noopener noreferrer" href="#/ads/position/2">
                                            Vị trí 2
                                        </a>
                                    ),
                                },
                                {
                                    key: '3',
                                    label: (
                                        <a rel="noopener noreferrer" href="#/ads/position/3">
                                            Vị trí 3
                                        </a>
                                    ),
                                },
                                {
                                    key: '4',
                                    label: (
                                        <a rel="noopener noreferrer" href="#/ads/position/4">
                                            Vị trí 4
                                        </a>
                                    ),
                                },
                                {
                                    key: '5',
                                    label: (
                                        <a rel="noopener noreferrer" href="#/ads/position/5">
                                            Vị trí 5
                                        </a>
                                    ),
                                },
                                {
                                    key: '6',
                                    label: (
                                        <a rel="noopener noreferrer" href="#/ads/position/6">
                                            Vị trí 6
                                        </a>
                                    ),
                                },
                                {
                                    key: '7',
                                    label: (
                                        <a rel="noopener noreferrer" href="#/ads/position/7">
                                            Vị trí 7
                                        </a>
                                    ),
                                },
                            ],
                        },
                    },
                    {
                        title: 'Danh sách quảng cáo của vị trí ' + positionId,
                    },
                    ]}
                />
                <div className="title">   <Title level={3}>Quản lý quảng cáo vị trí {positionId}</Title></div>
                <div className="control">
                    <Space  >
                        <Button type="primary" onClick={() => {
                            setOpen(true);
                        }}>Tạo mới</Button>
                        <Button onClick={refetch}>
                            Tải lại
                        </Button> <Select
                            mode="multiple"
                            style={{ minWidth: '200px' }}
                            placeholder="Chọn cột hiển thị"
                            value={checkedList}
                            onChange={handleColumnVisibilityChange}
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
                            setSearchedColumn('');
                            setFilteredInfo({});
                            setSortedInfo({});
                        }}>
                            Làm sạch bộ lọc và sắp xếp
                        </Button>
                    </Space>
                </div>
            </div>
            <Modal
                open={open}
                title={`Thêm quảng cáo mới vào vị trí ${positionId}`}
                onOk={handleOk}
                onCancel={() => {
                    setOpen(false);
                }}
                footer={(_, { OkBtn, CancelBtn }) => (
                    <>
                        <Button key="reset" onClick={() => {
                            form1.resetFields();
                            setFileList([]);
                            setBase64Image(null);
                        }}>
                            Nhập lại thông tin
                        </Button>
                        <CancelBtn />
                        <OkBtn className={!submittable ? 'disabled-button' : ''} disabled={!submittable} />
                    </>
                )}
            >
                <Form
                    form={form1}
                    labelCol={{
                        span: 10,
                    }}
                    wrapperCol={{
                        span: 50,
                    }}
                    layout="horizontal"
                    style={{
                        maxWidth: 1000,
                    }}
                >
                    <Form.Item label="Tiêu đề" name="title" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Đường dẫn chuyển hướng" name="url" rules={[
                        {
                            type: 'url',
                            message: 'Please enter a valid URL!',
                        },
                        {
                            required: true,
                            message: 'URL is required!',
                        },
                    ]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Bên cung cấp" rules={[{ required: true }]} name="partner">
                        <Select style={{
                            width: 250,
                        }}
                            placeholder="select type footer"
                            dropdownRender={(menu) => (
                                <>
                                    {menu}
                                    <Divider
                                        style={{
                                            margin: '8px 0',
                                        }}
                                    />
                                    <Space
                                        style={{
                                            padding: '0 8px 4px',
                                        }}
                                    >
                                        <Input
                                            placeholder="Please enter item"
                                            ref={inputRef}
                                            value={name}
                                            onChange={onNameChange}
                                            onKeyDown={(e) => e.stopPropagation()}
                                        />
                                        <Button
                                            type="text"
                                            icon={<PlusOutlined />}
                                            onClick={addItem}
                                        >
                                            Add item
                                        </Button>
                                    </Space>
                                </>
                            )}
                            options={items.map((item) => ({
                                label: item,
                                value: item,
                            }))} />
                    </Form.Item>
                    <Form.Item label="Mô tả" rules={[{ required: true }]} name="description">
                        <TextArea rows={4} />
                    </Form.Item>
                    <Form.Item label="Hình ảnh" valuePropName="fileList" getValueFromEvent={(e) => {
                        if (Array.isArray(e)) {
                            return e;
                        }
                        return e?.fileList;
                    }} name="image">
                        <Upload
                            name="avatar"
                            listType="picture-card"
                            className="avatar-uploader"
                            fileList={fileList}
                            onChange={({ fileList }) => {
                                setFileList(fileList);
                                if (fileList.length > 0 && fileList[0].originFileObj) {
                                    const file = fileList[0].originFileObj;
                                    const reader = new FileReader();
                                    reader.onload = (e) => {
                                        setBase64Image(e.target.result);
                                    };
                                    reader.readAsDataURL(file);
                                }
                            }}
                            onPreview={handlePreview}
                            onRemove={() => {
                                setFileList([]);
                                setBase64Image(null);
                            }}
                            maxCount={1}
                            showUploadList={{
                                showPreviewIcon: true,
                                showRemoveIcon: true,
                            }}
                        >
                            {fileList.length >= 1 ? null : (
                                <button style={{ border: 0, background: 'none' }} type="button">
                                    <PlusOutlined />
                                    <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
                                </button>
                            )}
                        </Upload>
                        {
                            previewImage && (
                                <Image
                                    alt="preview"
                                    style={{ maxWidth: '90%', maxHeight: '80%', objectFit: 'contain', display: 'none' }}
                                    preview={{
                                        visible: !!previewImage,
                                        src: previewImage,
                                        onVisibleChange: (visible) => {
                                            if (!visible) setPreviewImage('');
                                        },
                                    }}
                                />
                            )
                        }
                    </Form.Item>
                </Form>
            </Modal>
            <Modal
                open={openUpdate}
                title={`${isViewMode ? 'Xem chi tiết' : 'Sửa'} quảng cáo ở vị trí ${positionId}`}
                onOk={
                    () => {
                        if (!isViewMode) {
                            handleOkUpdate(adsSelecId);
                        } else {
                            setOpenUpdate(false);
                        }
                    }
                }
                onCancel={() => {
                    setOpenUpdate(false);
                    setAdsSelectId(null);
                    setIsViewMode(false);
                    form2.setFieldsValue({});
                }}
                footer={(_, { OkBtn, CancelBtn }) => (
                    <>
                        <Button key="refetch" onClick={adsPositionRefetch}>
                            Tải lại
                        </Button>
                        <CancelBtn />
                        {!isViewMode && (
                            <OkBtn className={!submittableUpdate ? 'disabled-button' : ''} disabled={!submittableUpdate} />
                        )}
                    </>
                )}
            >
                <Form
                    form={form2}
                    labelCol={{
                        span: 10,
                    }}
                    wrapperCol={{
                        span: 50,
                    }}
                    layout="horizontal"
                    style={{
                        maxWidth: 1000,
                    }}
                >
                    <Form.Item label="Tiêu đề" name="titleUpdate" rules={[{ required: true }]}>
                        <Input disabled={isViewMode} />
                    </Form.Item>
                    <Form.Item label="Đường dẫn chuyển hướng" name="urlUpdate" rules={[
                        {
                            type: 'url',
                            message: 'Please enter a valid URL!',
                        },
                        {
                            required: true,
                            message: 'URL is required!',
                        },
                    ]}>
                        <Input disabled={isViewMode} />
                    </Form.Item>
                    <Form.Item label="Bên cung cấp" rules={[{ required: true }]} name="partnerUpdate">
                        <Select disabled={isViewMode} style={{
                            width: 250,
                        }}
                            placeholder="select type footer"
                            dropdownRender={(menu) => (
                                <>
                                    {menu}
                                    <Divider
                                        style={{
                                            margin: '8px 0',
                                        }}
                                    />
                                    <Space
                                        style={{
                                            padding: '0 8px 4px',
                                        }}
                                    >
                                        <Input
                                            placeholder="Please enter item"
                                            ref={inputRef}
                                            value={name}
                                            onChange={onNameChange}
                                            onKeyDown={(e) => e.stopPropagation()}
                                        />
                                        <Button
                                            type="text"
                                            icon={<PlusOutlined />}
                                            onClick={addItem}
                                        >
                                            Add item
                                        </Button>
                                    </Space>
                                </>
                            )}
                            options={items.map((item) => ({
                                label: item,
                                value: item,
                            }))} />
                    </Form.Item>
                    <Form.Item label="Mô tả" rules={[{ required: true }]} name="descriptionUpdate">
                        <TextArea rows={4} disabled={isViewMode} />
                    </Form.Item>
                    <Form.Item label="Hình ảnh" valuePropName="fileListUpdate" getValueFromEvent={(e) => {
                        if (Array.isArray(e)) {
                            return e;
                        }
                        return e?.fileListUpdate;
                    }} name="imageUpdate">
                        <Upload
                            disabled={isViewMode}
                            name="avatar"
                            listType="picture-card"
                            className="avatar-uploader"
                            fileList={fileListUpdate}
                            onChange={({ fileList }) => {
                                if (!isViewMode) {
                                    setFileListUpdate(fileList);
                                    if (fileList.length > 0 && fileList[0].originFileObj) {
                                        const file = fileList[0].originFileObj;
                                        const reader = new FileReader();
                                        reader.onload = (e) => {
                                            setBase64ImageUpdate(e.target.result);
                                        };
                                        reader.readAsDataURL(file);
                                    }
                                }
                            }}
                            onPreview={handlePreviewUpdate}
                            onRemove={() => {
                                setFileListUpdate([]);
                                setBase64ImageUpdate(null);
                            }}
                            maxCount={1}
                            showUploadList={{
                                showPreviewIcon: true,
                                showRemoveIcon: true,
                            }}
                        >
                            {fileListUpdate.length >= 1 ? null : (
                                <button style={{ border: 0, background: 'none' }} type="button">
                                    <PlusOutlined />
                                    <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
                                </button>
                            )}
                        </Upload>
                        {
                            previewImageUpdate && (
                                <Image
                                    alt="preview"
                                    style={{ maxWidth: '90%', maxHeight: '80%', objectFit: 'contain', display: 'none' }}
                                    preview={{
                                        visible: !!previewImageUpdate,
                                        src: previewImageUpdate,
                                        onVisibleChange: (visible) => {
                                            if (!visible) setPreviewImageUpdate('');
                                        },
                                    }}
                                />
                            )
                        }
                    </Form.Item>
                </Form>
            </Modal>



            <div className="main-content">

                <Table
                    rowKey="id"
                    columns={filteredColumns}
                    dataSource={sortedData}
                    pagination={{
                        position: ['bottomCenter'], showSizeChanger: true,
                        showQuickJumper: true
                    }}
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
        </div>);
}

export default AdsPositionManage