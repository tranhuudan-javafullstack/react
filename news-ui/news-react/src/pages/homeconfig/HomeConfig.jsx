import {
    CheckCircleOutlined,
    DeleteOutlined,
    EditOutlined,
    ExclamationCircleOutlined,
    HomeOutlined,
    MenuOutlined,
    PlusOutlined,
    QuestionCircleOutlined
} from '@ant-design/icons';
import { DragSortTable } from '@ant-design/pro-components';
import {
    Alert,
    Breadcrumb,
    Button,
    Checkbox,
    Form,
    Image,
    Input,
    message,
    Modal,
    Popconfirm,
    Select,
    Space,
    Switch,
    Tabs,
    Tag,
    Typography,
    Upload
} from 'antd';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { LazyLoadComponent } from 'react-lazy-load-image-component';
import { useNavigate } from 'react-router-dom';
import { useHomeConfigMutation } from '../../hooks/useMutations.js';
import { useAdsQuery, useArticleQuery, useHomeConfigQuery, useWebConfigQuery } from '../../hooks/useQueries.js';
import { useNotificationProvider } from '../../provider/NotificationProvider.jsx';
import './homeconfig.scss';
const { Title } = Typography;

const HomeConfig = () => {
    const { openerror, opensuccess } = useNotificationProvider();

    const navigate = useNavigate();
    const [form2] = Form.useForm();
    const [form3] = Form.useForm();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();

    const { data: homeConfigData, refetch, } = useHomeConfigQuery('get-home-config');
    const { data: adsData, error: adsError } = useAdsQuery('get-all');

    // ads
    const saveAdsHome = useHomeConfigMutation('save-ads');

    useEffect(() => {
        if (homeConfigData) {

            const adsValues = {};
            for (let i = 1; i <= 7; i++) {
                adsValues[`position_${i}`] = 'NONE';
                adsValues[`type-ads-position_${i}`] = 0;
            }
            const adsType = homeConfigData.adsTypes;
            adsType.map((item) => {
                const items = item.adsIndex;
                const numberPosition = items.positionId;
                const type = item.type;
                adsValues[`position_${numberPosition}`] = items.adsId;
                adsValues[`type-ads-position_${numberPosition}`] = type;
            })
            form2.setFieldsValue(adsValues);
        }
    }, [homeConfigData, form2]);


    const getSortedPositions = useCallback(() => {
        if (!adsData) return [];
        return Object.keys(adsData).sort((a, b) => {
            const posA = parseInt(a.split('_')[1], 10);
            const posB = parseInt(b.split('_')[1], 10);
            return posA - posB;
        });

    }, [adsData]);

    const handleSelectChange = useCallback((value, position) => {
        const adsSelectField = `${position}`;
        if (value === 1) {
            const firstAdsId = adsData[position][0]?.adsId;
            form2.setFieldsValue({ [adsSelectField]: firstAdsId });
        }

    }, [adsData, form2]);
    const values2 = Form.useWatch([], form2);

    useEffect(() => {
        form2
            .validateFields({ validateOnly: true })
            .then(() => {
                // Validation passed, you can handle success logic here
            })
            .catch((errorInfo) => {
                console.error('Validation Failed:', errorInfo);
            });
    }, [form2, values2]);

    const handleSubmit = useCallback(async () => {
        try {
            const formValues = form2.getFieldsValue();
            const adsData = [];

            Object.keys(formValues).forEach(key => {
                if (key.startsWith('position_')) {
                    const positionId = parseInt(key.split('_')[1], 10);
                    const adsId = formValues[key];
                    const type = formValues[`type-ads-${key}`];

                    if (type === 1) {
                        adsData.push({
                            type,
                            adsIndex: {
                                positionId, adsId,
                            }
                        });
                    } else if (type === 2 || type === 3) {
                        adsData.push({
                            type,
                            adsIndex: {
                                positionId,
                                adsId: 0,
                            }
                        });
                    }
                }
            });

            await saveAdsHome.mutateAsync({ adsData });
            opensuccess('slide banner created successfully', 'slide banner has been created successfully');
        } catch (error) {
            openerror('Error submitting form', error.message);
        }
    }, [form2, saveAdsHome, opensuccess, openerror]);
    // slide banner
    const [open, setOpen] = useState(false);
    const [open2, setOpen2] = useState(false);
    const [form1] = Form.useForm();
    const [slideBannerData, setSlideBannerData] = useState([]);
    const [fileList, setFileList] = useState([]);
    const [fileList2, setFileList2] = useState([]);
    const [previewImage, setPreviewImage] = useState('');
    const [previewImage2, setPreviewImage2] = useState('');

    const [base64Image, setBase64Image] = useState(null);
    const [base64Image2, setBase64Image2] = useState(null);
    const uploadSlideBannerMutation = useHomeConfigMutation('upload-slide-banner');
    const updateSlideBannerMutation = useHomeConfigMutation('update-slide-banner');
    const deleteSlideBannerMutation = useHomeConfigMutation('delete-slide-banner');
    const statusSlideBannerMutation = useHomeConfigMutation('set-status-slide-banner');
    const swapSlideBannerMutation = useHomeConfigMutation('swap-slide-banner');


    useEffect(() => {
        if (homeConfigData && homeConfigData.listSlideBanner) {
            const formattedData = homeConfigData.listSlideBanner.map(item => ({
                ...item,
                name: item.slideBannerId + "." + item.type,
            }));
            setSlideBannerData(formattedData);
            setGroupArticleData(homeConfigData.groupArticle)
        }
    }, [homeConfigData]);
    const handlePreview = useCallback(() => setPreviewImage(base64Image), [base64Image]);

    const handlePreview2 = async (file) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj);
        }
        setPreviewImage2(base64Image2 || file.url || file.preview);
    };


    const fileToBinary = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const binaryData = reader.result;
                resolve(binaryData);
            };
            reader.onerror = () => {
                reject(new Error('Unable to read the file as binary data'));
            };
            reader.readAsArrayBuffer(file);
        });
    };

    const handleOk = useCallback(async () => {
        try {
            const values = await form1.validateFields();
            const file = fileList[0]?.originFileObj;

            if (!file) {
                message.error('Please upload an image');
                return;
            }
            const fileExtension = file.name.split('.').pop();
            const urlDirection = encodeURIComponent(values.url);

            const binaryData = await fileToBinary(file);

            await uploadSlideBannerMutation.mutateAsync({
                fileExtension, urlDirection, binaryData
            });
            opensuccess('slide banner created successfully', 'slide banner has been created successfully');
            setOpen(false);
            await refetch();
            form1.resetFields()
            setPreviewImage('')
            setBase64Image(null);
            setFileList([])
        } catch (error) {
            openerror('Error submitting form', error.message);
        }
    }, [form1, fileList, uploadSlideBannerMutation, openerror, opensuccess, refetch]);

    const handleOk2 = useCallback(async () => {
        try {
            const values = await form3.validateFields();
            const file = fileList2[0];

            if (!file) {
                message.error('Please upload an image');
                return;
            }
            let binaryData;
            let fileExtension = file.name.split('.').pop();
            const urlDirection = encodeURIComponent(values.url);

            if (file.originFileObj) {
                // This is a newly uploaded file
                binaryData = await fileToBinary(file.originFileObj);
            } else if (file.url) {
                // This is an existing file, fetch it and convert to binary
                binaryData = await fetchImageAsBinary(file.url);
            } else {
                message.error('Invalid file data');
                return;
            }

            // const binaryData = await fileToBinary(file);

            await updateSlideBannerMutation.mutateAsync({
                name: slideBannerUpdate, fileExtension, urlDirection, binaryData
            });
            opensuccess('Article updated successfully', 'Article has been updated successfully');
            setOpen2(false);
            await refetch();
            setPreviewImage2('')
            setBase64Image2(null);
            setFileList2([])
        } catch (error) {
            openerror('Error submitting form', error.message);
        }
    }, [form1, fileList, updateSlideBannerMutation, openerror, opensuccess, refetch]);
    const [count, setCount] = useState(0);
    const getBase64 = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });
    const fetchImageAsBinary = async (url) => {
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsArrayBuffer(blob);
        });
    };
    const [slideBannerUpdate, setSlideBannerUpdate] = useState(null);
    const {
        data: slideBannerByNameData, refetch: slideBannerByNameRefetch, isFetching: slideBannerIsFetching
    } = useHomeConfigQuery('get-slide-banner-by-name', { name: slideBannerUpdate, count: count });

    useEffect(() => {
        if (slideBannerByNameData) {
            const valueInit = {
                url: slideBannerByNameData.urlDirection,
            };
            form3.setFieldsValue(valueInit);
            setFileList2([{
                url: slideBannerByNameData.path,
                name: slideBannerByNameData.slideBannerId + '.' + slideBannerByNameData.type,
                status: 'done',
                uid: slideBannerByNameData.slideBannerId,
            },]);
        }
    }, [slideBannerByNameData, form3]);

    const handleDelete = useCallback(async (slideBannerId) => {
        try {
            await deleteSlideBannerMutation.mutateAsync({ 'name': slideBannerId });
            opensuccess('Delete successful', 'slide banner has been deleted.');
        } catch (err) {
            openerror('Delete failed', 'side banner has not been deleted.' + err);
        }
    }, [deleteSlideBannerMutation, opensuccess, openerror]);


    const columns = [{
        title: 'Order', dataIndex: 'order', key: 'order',
    }, {
        title: 'Hình ảnh', dataIndex: 'path', key: 'path', render: (path) => (<LazyLoadComponent>
            <Image src={path} alt="Slide banner" width={150} height={100} />
        </LazyLoadComponent>),
    }, {
        title: 'Name', dataIndex: 'name', key: 'name', width: 150
    }, {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: (_, record) => (record.status ? (<Space direction="vertical">
            <Switch defaultChecked onChange={() => {
                onChangeSwitch(record.name)
            }} />
            <Tag icon={<CheckCircleOutlined />} color="success"> Đã họat động </Tag>
        </Space>) : (<Space direction="vertical">
            <Switch onChange={() => {
                onChangeSwitch(record.name)
            }} />
            <Tag icon={<ExclamationCircleOutlined />} color="error"> Chưa họat động </Tag>
        </Space>)),
    }, {
        title: 'URL Direction', dataIndex: 'urlDirection', key: 'urlDirection', width: 450,
        render: (_, record) => (
            <Tag color='blue'>
                <a href={record.urlDirection} target="_blank" rel="noopener noreferrer">
                    {record.urlDirection}
                </a>
            </Tag>

        )
    }, {
        title: 'Hành động', key: 'action', fixed: 'right', render: (text, record) => (<span>
            <Button
                icon={<EditOutlined />}
                onClick={() => {
                    setSlideBannerUpdate(record.name)
                    setCount(count + 1)
                    setOpen2(true);
                }}
                style={{ marginRight: 8 }}
            >
                Sửa
            </Button>
            <Popconfirm
                onConfirm={() => handleDelete(record.name)}
                title="Delete the article"
                description={`Are you sure to delete this slide banner with name "${record.name}"?`}
                icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
            >
                <Button icon={<DeleteOutlined />} danger>Xóa</Button>
            </Popconfirm>
        </span>),
    },];


    const sortedData = useMemo(() => slideBannerData ? [...slideBannerData].sort((a, b) => a.orderId - b.orderId) : [], [slideBannerData]);

    const handleDragSortEnd = async (beforeIndex, afterIndex) => {
        try {
            await swapSlideBannerMutation.mutateAsync({ 'sortIdAfter': afterIndex, 'sortIdBefore': beforeIndex });
            opensuccess('swap successful', 'slide banner has been swap.');
            await refetch();
        } catch (err) {
            openerror('swap failed', 'side banner has not been swap.' + err);
        }
    };
    const onChangeSwitch = useCallback(async (slideBannerId) => {
        try {
            await statusSlideBannerMutation.mutateAsync({ 'name': slideBannerId });
            opensuccess('status successful', 'slide banner has been status.');
        } catch (err) {
            openerror('status failed', 'side banner has not been status.' + err);
        }
    }, [statusSlideBannerMutation, opensuccess, openerror]);
    // article group
    const [groupType, setGroupType] = useState('NONE');
    const [isEditing, setIsEditing] = useState(false);
    const [currentGroupId, setCurrentGroupId] = useState(null);
    const [groupArticleData, setGroupArticleData] = useState([]);
    const [categoryId, setCategoryId] = useState(null);
    const swapArticleGroupMutation = useHomeConfigMutation('swap-article-groups');
    const saveArticleGroupMutation = useHomeConfigMutation('article-groups-save');
    const deleteArticleGroupMutation = useHomeConfigMutation('article-groups-delete');
    const { data: articlesByCategory } = useArticleQuery('get-by-category', {
        categoryId: categoryId,
        enabled: ((groupType === 'FIX_CATEGORY' || groupType === 'AUTO_CATEGORY') && categoryId != null)
    });

    const { data: allArticles } = useArticleQuery('get-all-overview2', {
        enabled: groupType === 'FIX_CUSTOM'
    });
    const { data: currentGroupData, refetch: refetchGroupData } = useHomeConfigQuery('article-group-get', {
        articleGroupId: currentGroupId, enabled: isEditing && currentGroupId !== null
    });
    const { data: categoryData } = useWebConfigQuery('get-categories2', {
        enabled: (groupType === 'FIX_CATEGORY' || groupType === 'AUTO_CATEGORY')
    });

    useEffect(() => {
        if (currentGroupData) {
            const valueInit = {
                layoutId: currentGroupData.layoutId,
                orderId: currentGroupData.orderId === 0 ? 0 : 2,
                groupType: currentGroupData.groupType,
                title: currentGroupData.articleSetting.title || '',
                categoryId: currentGroupData.articleSetting.categoryId || 0,
                isComment: currentGroupData.articleSetting.isComment || null,
                isView: currentGroupData.articleSetting.isView || null,
                articleChilds: currentGroupData.listArticleChilds || [],
                articleMain: currentGroupData.articleMain || 0,
            }
            form.setFieldsValue(valueInit);
            setGroupType(currentGroupData.groupType);
            setCategoryId(currentGroupData.articleSetting.categoryId || null)
        }
    }, [currentGroupData, form]);


    const handleOk5 = useCallback(async () => {
        try {
            const values = await form.validateFields();
            const payload = {
                groupArticleData: {
                    groupId: isEditing ? currentGroupId : 0,
                    layoutId: parseInt(values.layoutId),
                    orderId: values.orderId,
                    groupType: values.groupType,
                    articleSetting: {
                        categoryId: values.categoryId || 0,
                        title: values.title || '',
                        isComment: values.isComment || false,
                        isView: values.isView || false
                    },
                    listArticleChilds: values.articleChilds || [],
                    articleMain: values.articleMain || 0
                }
            };
            await saveArticleGroupMutation.mutateAsync(payload);
            opensuccess('Article group updated successfully', 'The article group has been updated.');

            setIsModalVisible(false);
            form.resetFields();
            // Assuming you have a function to refetch the list of article groups
            // refetchArticleGroups();
        } catch (error) {
            openerror('Error saving article group', error.message);
        }
    }, [form, isEditing, currentGroupId, saveArticleGroupMutation, opensuccess, openerror]);

    const showModal = (groupId = null) => {
        setCurrentGroupId(groupId);
        setIsEditing(!!groupId);
        setIsModalVisible(true);
        if (!groupId) {
            form.resetFields();
            form.setFieldsValue({
                layoutId: 1, orderId: 0, groupType: 'HOT', categoryId: 0, articleChilds: [], title: '',
            });
            setGroupType('HOT');
            setCategoryId(null);
        }
    };

    const handleDelete2 = useCallback(async (groupId) => {
        try {
            await deleteArticleGroupMutation.mutateAsync({ 'articleGroupId': groupId });
            opensuccess('Delete successful', 'slide banner has been deleted.');
        } catch (err) {
            openerror('Delete failed', 'side banner has not been deleted.' + err);
        }
    }, [deleteArticleGroupMutation, opensuccess, openerror]);

    const columns2 = [{
        title: 'Thứ tự', dataIndex: 'orderId', key: 'orderId',
    }, {
        title: 'Bố cục', dataIndex: 'layoutId', key: 'layoutId',
    }, {
        title: 'loại nhóm', dataIndex: 'groupType', key: 'groupType',
        render: (_, record) => (
            <Tag color='blue'> {record.groupType} </Tag>
        )
    }, {
        title: 'tiêu đề', dataIndex: ['articleSetting', 'title'], key: 'groupType',
    }, {
        title: 'Cài đặt hiển thị',
        dataIndex: ['articleSetting'],
        key: 'articleSetting',
        render: (_, record) => (<Space direction="vertical">
            {record.articleSetting.isCreatedAt && (<Checkbox defaultChecked disabled name='isCreatedAt'>
                createdAt
            </Checkbox>)}
            {record.articleSetting.isComment && (<Checkbox defaultChecked disabled name='isComment'>
                isComment
            </Checkbox>)}
            {record.articleSetting.isView && (<Checkbox defaultChecked disabled name='isView'>
                isView
            </Checkbox>)}
        </Space>),
    }, {
        title: 'Thao tác', key: 'action', render: (text, record) => (<span>
            <Button
                icon={<EditOutlined />}
                onClick={() => showModal(record.groupId)}
                style={{ marginRight: 8 }}
            >
                Sửa thông tin
            </Button>

            <Popconfirm
                onConfirm={() => handleDelete2(record.groupId)}
                title="Delete the article"
                description={`Are you sure to delete this group article with id "${record.groupId}"?`}
                icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
            >
                <Button icon={<DeleteOutlined />} danger>Xóa </Button>
            </Popconfirm>
        </span>),
    },];
    const sortedData2 = useMemo(() => groupArticleData ? [...groupArticleData].sort((a, b) => a.orderId - b.orderId) : [], [groupArticleData]);
    const handleDragSortEnd2 = async (beforeIndex, afterIndex) => {
        try {
            await swapArticleGroupMutation.mutateAsync({ 'sortIdAfter': afterIndex, 'sortIdBefore': beforeIndex });
            opensuccess('swap successful', 'group article has been swap.');
            await refetch();
        } catch (err) {
            openerror('swap failed', 'group article has not been swap.' + err);
        }
    };
    const allPositionsEmpty = useMemo(() => {
        if (!adsData) return true;
        return Object.values(adsData).every(arr => arr.length === 0);
    }, [adsData]);

    return (<>
        <Modal
            afterClose={() => {
                setCurrentGroupId(null);
                setIsEditing(false);
            }}
            title={isEditing ? "Edit Article Group" : "Add Article Group"}
            open={isModalVisible}
            onOk={handleOk5}
            onCancel={() => setIsModalVisible(false)}
            footer={(_, { OkBtn, CancelBtn }) => (<>
                <Button onClick={() => form.resetFields()}>Reset</Button>
                <CancelBtn />
                <OkBtn />
            </>)}
        >
            <Form form={form} layout="vertical">
                <Form.Item name="layoutId" label="Layout">
                    <Select>
                        {[1, 2, 3, 4].map(i => (<Select.Option key={`layout${i}`} value={i}>
                            <Image
                                src="https://letsenhance.io/static/8f5e523ee6b2479e26ecc91b9c25261e/1015f/MainAfter.jpg"
                                style={{ width: 20, height: 20, marginRight: 10 }}
                            />
                            Bố cục {i}
                        </Select.Option>))}
                    </Select>
                </Form.Item>
                <Form.Item name="orderId" label="Order">
                    <Select>
                        <Select.Option value={0}>First</Select.Option>
                        <Select.Option value={1}>Last</Select.Option>
                        <Select.Option value={2}>Custom Position</Select.Option>
                    </Select>
                </Form.Item>
                <Form.Item name="groupType" label="Group Type">
                    <Select onChange={(value) => {
                        setGroupType(value);
                        form.setFieldsValue({ categoryId: categoryData[0].categoryId });
                        setCategoryId(categoryData[0].categoryId);
                    }}>
                        <Select.Option value="FIX_CATEGORY">FIX_CATEGORY</Select.Option>
                        <Select.Option value="FIX_CUSTOM">FIX_CUSTOM</Select.Option>
                        <Select.Option value="AUTO_CUSTOM">AUTO_CUSTOM</Select.Option>
                        <Select.Option value="AUTO_CATEGORY">AUTO_CATEGORY</Select.Option>
                        <Select.Option value="HOT">HOT</Select.Option>
                        <Select.Option value="CONCERN">CONCERN</Select.Option>
                        <Select.Option value="LATEST">LATEST</Select.Option>
                    </Select>
                </Form.Item>
                {(groupType === 'FIX_CATEGORY' || groupType === 'AUTO_CATEGORY') && (
                    <Form.Item name="categoryId" label="Category">
                        <Select style={{ width: '100%' }}
                            showSearch
                            placeholder="Search to Select Articles"
                            optionFilterProp="children"
                            filterOption={(input, option) => (option?.children ?? '').toLowerCase().indexOf(input.toLowerCase()) >= 0}
                            filterSort={(optionA, optionB) => (optionA?.children ?? '').toLowerCase().localeCompare((optionB?.children ?? '').toLowerCase())}
                            onChange={(value) => {
                                setCategoryId(value);
                                form.setFieldsValue({ articleChilds: [] });
                            }}>
                            {categoryData?.map(category => (
                                <Select.Option key={category.categoryId} value={category.categoryId}>
                                    {category.categoryName}
                                </Select.Option>))}
                        </Select>
                    </Form.Item>)}
                {(groupType === 'FIX_CUSTOM' || groupType === 'FIX_CATEGORY') && (
                    <Form.Item name="articleChilds" label="Article Children">
                        <Select
                            mode="multiple"
                            showSearch
                            style={{ width: '100%' }}
                            placeholder="Search to Select Articles"
                            optionFilterProp="children"
                            filterOption={(input, option) => (option?.children ?? '').toLowerCase().indexOf(input.toLowerCase()) >= 0}
                            filterSort={(optionA, optionB) => (optionA?.children ?? '').toLowerCase().localeCompare((optionB?.children ?? '').toLowerCase())}
                        >
                            {((groupType === 'FIX_CATEGORY' || groupType === 'AUTO_CATEGORY') ? articlesByCategory : allArticles)?.map(article => (
                                <Select.Option key={article.articleId} value={article.articleId}>
                                    {article.slug}
                                </Select.Option>))}
                        </Select>
                    </Form.Item>)}

                {(groupType === 'FIX_CUSTOM' || groupType === 'FIX_CATEGORY') && (
                    <Form.Item name="articleMain" label="Article Main">
                        <Select
                            showSearch
                            style={{ width: '100%' }}
                            placeholder="Search to Select Articles"
                            optionFilterProp="main"
                            filterOption={(input, option) => (option?.children ?? '').toLowerCase().indexOf(input.toLowerCase()) >= 0}
                            filterSort={(optionA, optionB) => (optionA?.children ?? '').toLowerCase().localeCompare((optionB?.children ?? '').toLowerCase())}
                        >
                            {((groupType === 'FIX_CATEGORY' || groupType === 'AUTO_CATEGORY') ? articlesByCategory : allArticles)?.map(article => (
                                <Select.Option key={article.articleId} value={article.articleId}>
                                    {article.slug}
                                </Select.Option>))}
                        </Select>
                    </Form.Item>)}
                {(groupType === 'FIX_CUSTOM' || groupType === 'AUTO_CUSTOM') && (<Form.Item name="title" label="Title">
                    <Input />
                </Form.Item>)}
                {(groupType === 'AUTO_CUSTOM' || groupType === 'AUTO_CATEGORY' || groupType === 'HOT' || groupType === 'CONCERN' || groupType === 'LATEST') && (
                    <Space direction="horizontal">
                        <Form.Item name="isView" label="View" valuePropName="checked" key="View">
                            <Switch />
                        </Form.Item>
                        <Form.Item name="isComment" label="Comment" valuePropName="checked" key="Comment">
                            <Switch />
                        </Form.Item>
                    </Space>)}

            </Form>
        </Modal>

        <div className='homeconfig'>
            <div className="breadcrumb">
                <Breadcrumb
                    items={[{
                        href: '#', title: <HomeOutlined />,
                    }, {
                        href: '#/dashboard', title: (<span>Thống kê chung</span>),
                    }, {
                        title: 'Cấu hình trang HOME',
                    },]}
                />
                <div className="title">
                    <Title level={3}>Quản lý cấu hình HOME</Title>
                </div>
                <div className="control">
                    <Button type="primary" onClick={refetch}>  Tải lại</Button>
                </div>
            </div>
            <div className="main-content">
                <div className="right">
                    <Tabs
                        type="card"
                        items={[{
                            key: '2', label: 'Nhóm bài viết', children: (<>
                                <div className="slidebanner-head">
                                    <h2>Danh sách nhóm bài viết</h2>
                                    <Button onClick={() => showModal()} type="primary">Thêm nhóm bài viết
                                    </Button>
                                </div>
                                <DragSortTable
                                    headerTitle="(Kéo để sắp xếp)"
                                    columns={columns2}
                                    rowKey="groupId"
                                    search={false}
                                    size="small"
                                    pagination={{ pageSize: 30, position: ['bottomCenter'] }}
                                    dataSource={sortedData2}
                                    dragSortKey="orderId"
                                    onDragSortEnd={handleDragSortEnd2}
                                    dragSortHandlerRender={(rowData, idx) => {
                                        return (<>
                                            <MenuOutlined style={{ cursor: 'grab', color: 'gold' }} />
                                            &nbsp;{idx + 1} - nhóm {rowData.groupId}
                                        </>);
                                    }}
                                />
                            </>),
                        }, {
                            key: '1', label: 'Slide Banner', children: (<>
                                <div className="slidebanner-head">
                                    <h2>Danh sách slide banner</h2>
                                    <Button onClick={() => setOpen(true)} type="primary">Thêm slide
                                        banner</Button>
                                </div>
                                <DragSortTable
                                    scroll={{ x: 'max-content', }}
                                    headerTitle="(Kéo để sắp xếp)"
                                    columns={columns}
                                    rowKey="slideBannerId"
                                    size="small"
                                    search={false}
                                    pagination={{ pageSize: 30, position: ['bottomCenter'] }}
                                    dataSource={sortedData}
                                    dragSortKey="order"
                                    onDragSortEnd={handleDragSortEnd}
                                    dragSortHandlerRender={(rowData, idx) => {
                                        return (<>
                                            <MenuOutlined style={{ cursor: 'grab', color: 'gold' }} />
                                            &nbsp;{idx + 1} - Slide {rowData.slideBannerId}
                                        </>)
                                    }}
                                />
                            </>), forceRender: true,
                        },]}
                    />
                </div>
                <div className="left info-ads">
                    <h2>Thông tin quảng cáo</h2>
                    {!allPositionsEmpty ? (
                        <Form
                            form={form2}
                            labelCol={{ span: 10 }}
                            wrapperCol={{ span: 10 }}
                            layout="horizontal"
                            size="large">
                            {getSortedPositions().map((position) => {
                                if (adsData[position]?.length === 0) {
                                    return null; // Không hiển thị nếu mảng rỗng
                                }
                                return (

                                    <div className="" style={{ display: 'flex', justifyContent: 'start', gap: '20px' }} key={position}>
                                        <Form.Item label="Chọn loại" name={`type-ads-${position}`}>
                                            <Select style={{ width: 120 }}
                                                onChange={(value) => handleSelectChange(value, position)}>
                                                <Select.Option value={0}>NONE</Select.Option>
                                                <Select.Option value={1}>FIXED</Select.Option>
                                                <Select.Option value={2}>RANDOM</Select.Option>
                                                <Select.Option value={3}>RATE</Select.Option>
                                            </Select>
                                        </Form.Item>
                                        <Form.Item
                                            label={`Vị trí ${position.split('_')[1]}`}
                                            name={position}
                                            style={{
                                                display: form2.getFieldValue(`type-ads-${position}`) !== 1 ? 'none' : 'block'
                                            }}
                                        >
                                            <Select
                                                showSearch
                                                placeholder="Search to Select Articles"
                                                optionFilterProp="children"
                                                filterOption={(input, option) => (option?.children ?? '').toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                                filterSort={(optionA, optionB) => (optionA?.children ?? '').toLowerCase().localeCompare((optionB?.children ?? '').toLowerCase())}
                                                style={{ width: 200 }}>
                                                {adsData[position].map(ad => (<Select.Option key={ad.adsId} value={ad.adsId}>
                                                    {ad.title}
                                                </Select.Option>))}
                                            </Select>
                                        </Form.Item>
                                    </div>)
                            }
                            )}
                            <Form.Item style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
                                <Button type="primary" onClick={handleSubmit}  >
                                    Lưu thay đổi
                                </Button>
                            </Form.Item>
                        </Form>
                    ) : (
                        <Alert
                            message="Cảnh báo"
                            description="Chưa có quảng cáo nào"
                            type="warning"
                            action={
                                <Button danger size="small" onClick={() => navigate('/ads/manage')}> hãy bấm vào đây để thêm</Button>
                            }
                            showIcon
                        />
                    )}
                </div>
            </div>
        </div>
        <Modal
            open={open}
            title="Thêm slide banner"
            onOk={handleOk}
            onCancel={() => {
                setOpen(false);
            }}
            footer={(_, { OkBtn, CancelBtn }) => (<>
                <Button key="reset" onClick={() => {
                    form1.resetFields();
                    setFileList([]);
                    setBase64Image(null);
                }}>
                    Nhập lại thông tin
                </Button>
                <CancelBtn />
                <OkBtn />
            </>)}
        >
            <Form
                form={form1}
                labelCol={{
                    span: 10,
                }}
                wrapperCol={{
                    span: 14,
                }}
                layout="horizontal"
                style={{
                    maxWidth: 600,
                }}
            >
                <Form.Item label="Đường dẫn điều hướng đến" name="url" rules={[{
                    type: 'url', message: 'Please enter a valid URL!',
                }, {
                    required: true, message: 'URL is required!',
                },]}>
                    <Input />
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
                            if (fileList[0]?.originFileObj) {
                                const reader = new FileReader();
                                reader.onload = (e) => setBase64Image(e.target.result);
                                reader.readAsDataURL(fileList[0].originFileObj);
                            }
                        }}
                        onPreview={handlePreview}
                        onRemove={() => {
                            setFileList([]);
                            setBase64Image(null);
                        }}
                        maxCount={1}
                        showUploadList={{
                            showPreviewIcon: true, showRemoveIcon: true,
                        }}
                    >
                        {fileList.length >= 1 ? null : (<button style={{ border: 0, background: 'none' }} type="button">
                            <PlusOutlined />
                            <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
                        </button>)}
                    </Upload>
                    {previewImage && (<Image
                        alt="preview"
                        style={{ maxWidth: '90%', maxHeight: '80%', objectFit: 'contain', display: 'none' }}
                        preview={{
                            visible: !!previewImage, src: previewImage, onVisibleChange: (visible) => {
                                if (!visible) setPreviewImage('');
                            },
                        }}
                    />)}
                </Form.Item>
            </Form>
        </Modal>
        <Modal
            destroyOnClose={true}
            open={open2}
            title="sửa slide banner"
            onOk={handleOk2}
            onCancel={() => {
                setOpen2(false);
                setBase64Image2(null)
                setFileList2([])
                setPreviewImage2('')
            }}
            footer={(_, { OkBtn, CancelBtn }) => (<>
                <Button key="reset" >
                    Tải lại
                </Button>
                <CancelBtn />
                <OkBtn />
            </>)}
        >
            <Form
                form={form3}
                labelCol={{
                    span: 4,
                }}
                wrapperCol={{
                    span: 14,
                }}
                layout="horizontal"
                style={{
                    maxWidth: 600,
                }}
            >
                <Form.Item label="URL" name="url" rules={[{
                    type: 'url', message: 'Please enter a valid URL!',
                }, {
                    required: true, message: 'URL is required!',
                },]}>
                    <Input />
                </Form.Item>
                <Form.Item label="Image" valuePropName="fileList2" getValueFromEvent={(e) => {
                    if (Array.isArray(e)) {
                        return e;
                    }
                    return e?.fileList2;
                }} name="image">
                    <Upload
                        name="avatar"
                        listType="picture-card"
                        className="avatar-uploader"
                        fileList={fileList2}
                        onChange={({ fileList }) => {
                            setFileList2(fileList);
                            if (fileList2[0]?.originFileObj) {
                                const reader = new FileReader();
                                reader.onload = (e) => setBase64Image2(e.target.result);
                                reader.readAsDataURL(fileList2[0].originFileObj);
                            }
                        }}
                        onPreview={handlePreview2}
                        onRemove={() => {
                            setFileList2([]);
                            setBase64Image2(null);
                        }}
                        maxCount={1}
                        showUploadList={{
                            showPreviewIcon: true, showRemoveIcon: true,
                        }}
                    >
                        {fileList2.length >= 1 ? null : (<button style={{ border: 0, background: 'none' }} type="button">
                            <PlusOutlined />
                            <div style={{ marginTop: 8 }}>Upload</div>
                        </button>)}
                    </Upload>
                    {previewImage2 && (<Image
                        alt="preview"
                        style={{ maxWidth: '90%', maxHeight: '80%', objectFit: 'contain', display: 'none' }}
                        preview={{
                            visible: !!previewImage2, src: previewImage2, onVisibleChange: (visible) => {
                                if (!visible) setPreviewImage2('');
                            }, afterOpenChange: (visible) => !visible && setPreviewImage2(''),
                        }}
                    />)}
                </Form.Item>
            </Form>
        </Modal>
    </>);
};

export default HomeConfig;
