import { HomeOutlined, PlusOutlined } from '@ant-design/icons';
import { Breadcrumb, Button, Form, Image, Input, Select, Switch, Typography, Upload, Alert } from 'antd';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MyCkeditor from '../../../components/ckeditor/myCkeditor.jsx';
import { useArticleMutation } from '../../../hooks/useMutations.js';
import { useAdsQuery, useArticleQuery, useWebConfigQuery } from '../../../hooks/useQueries.js';
import { useNotificationProvider } from '../../../provider/NotificationProvider.jsx';
import './articlecreate.scss';

const { Title } = Typography;

const ArticleCreate = () => {
    const [form1] = Form.useForm();
    const [form2] = Form.useForm();
    const [base64Image, setBase64Image] = useState(null);
    const [previewImage, setPreviewImage] = useState('');
    const [fileList, setFileList] = useState([]);
    const [editorContent, setEditorContent] = useState('');
    const [submittable, setSubmittable] = useState(false);
    const navigate = useNavigate();
    const { openerror, opensuccess } = useNotificationProvider();
    const { data: adsData, error: adsError } = useAdsQuery('get-all');
    const { data: categoryData, error: categoryError } = useWebConfigQuery('get-categories');
    const createArticleMutation = useArticleMutation('create');
    const { data: tagsData, error: tagsError } = useArticleQuery('get-all-tags')
    const [tags, setTags] = useState([]);
    useEffect(() => {
        if (tagsData) {
            const tags2 = [];
            tagsData.map(tag =>
                tags2.push({ text: tag, value: tag })
            )
            setTags(tags2)
        }
    }, [tagsData])


    useEffect(() => {
        if (adsError) openerror('Error fetching ads', adsError.message);
        if (categoryError) openerror('Error fetching categories', categoryError.message);
    }, [adsError, categoryError, openerror]);

    useEffect(() => {
        if (categoryData?.length > 0) {
            form1.setFieldsValue({ "category": categoryData[0].categoryId });
        }
    }, [categoryData, form1]);

    useEffect(() => {
        if (adsData) {
            const defaultAdsValues = {};
            for (let i = 1; i <= 7; i++) {
                defaultAdsValues[`position_${i}`] = 'NONE';
                defaultAdsValues[`type-ads-position_${i}`] = 0;
            }
            form2.setFieldsValue(defaultAdsValues);
        }
    }, [adsData, form2]);



    const handlePreview = useCallback(() => setPreviewImage(base64Image), [base64Image]);

    const handleReset = useCallback(() => {
        form1.resetFields();
        if (categoryData?.length > 0) {
            form1.setFieldsValue({ "category": categoryData[0].categoryId });
        }

        form2.resetFields();
        if (adsData) {
            const defaultAdsValues = {};
            for (let i = 1; i <= 7; i++) {
                defaultAdsValues[`position_${i}`] = 'NONE';
                defaultAdsValues[`type-ads-position_${i}`] = 0;
            }
            form2.setFieldsValue(defaultAdsValues);
        }

        setFileList([]);
        setBase64Image(null);
        setPreviewImage('');
        setEditorContent('');
    }, [categoryData, adsData, form1, form2]);

    const getSortedPositions = useCallback(() => {
        if (!adsData) return [];
        return Object.keys(adsData).sort((a, b) => {
            const [, posA] = a.split('_');
            const [, posB] = b.split('_');
            return parseInt(posA, 10) - parseInt(posB, 10);
        });

    }, [adsData]);


    const values1 = Form.useWatch([], form1);
    const values2 = Form.useWatch([], form2);

    useEffect(() => {
        Promise.all([form1.validateFields({ validateOnly: true }),
        form2.validateFields({ validateOnly: true })])
            .then(() => setSubmittable(true))
            .catch(() => setSubmittable(false));
    }, [form1, form2, values1, values2]);



    const handleSelectChange = useCallback((value, position) => {
        const adsSelectField = `${position}`;
        if (value === 1) {
            const firstAdsId = adsData[position][0]?.adsId;
            form2.setFieldsValue({ [adsSelectField]: firstAdsId });
        }
    }, [form2, adsData]);
    const handleSubmitAll = useCallback(async () => {
        try {
            const [articleValues, adsValues] = await Promise.all([form1.validateFields(), form2.validateFields()]);

            const adsType = getSortedPositions()
                .map(position => {
                    const typeKey = `type-ads-${position}`;
                    const adsValue = adsValues[position];
                    const type = adsValues[typeKey]
                    if (type === 1) {
                        return {
                            type: type,
                            adsIndex: {
                                positionId: parseInt(position.split('_')[1], 10),
                                adsId: adsValue
                            }
                        };
                    } else if (type === 2 || type === 3) {
                        return {
                            type: type,
                            adsIndex: {
                                positionId: parseInt(position.split('_')[1], 10),
                                adsId: 0
                            }
                        };
                    }
                    return null;
                })
                .filter(item => item !== null);

            const payload = {
                articleData: {
                    articleId: 0,
                    title: articleValues.title,
                    content: editorContent,
                    thumbnailBase64: base64Image,
                    categoryId: articleValues.category,
                    isPublished: articleValues.publish || false,
                    adsType: adsType,
                    tags: articleValues.tags || [],
                    author: 1
                }
            };
            await createArticleMutation.mutateAsync(payload);
            opensuccess('Article created successfully', 'Article has been created successfully');
            navigate('/article/manage');
        } catch (error) {
            openerror('Error submitting form', error.message);
        }
    }, [base64Image, editorContent, createArticleMutation, opensuccess, openerror, navigate, form1, form2, getSortedPositions]);
    const allPositionsEmpty = useMemo(() => {
        if (!adsData) return true;
        return Object.values(adsData).every(arr => arr.length === 0);
    }, [adsData]);

    return (<div className="articlecreate">
        <div className="breadcrumb">
            <Breadcrumb
                items={[{
                    href: '#', title: <HomeOutlined />,
                }, {
                    href: '#/dashboard', title: (<span>Thống kê chung</span>),
                }, {
                    href: '#/article/manage', title: (<span>Danh sách bài viết</span>),
                }, {
                    title: "tạo mới bài viết"
                },]}
            />
            <div className="title">
                <Title level={3}>Tạo mới bài viết</Title>
            </div>
            <div className="control">
                <Button type="primary" onClick={handleReset}>
                    Nhập thông tin lại từ đầu
                </Button>
            </div>
        </div>
        <div className="main-content">
            <div className="info-article">
                <h2>Thông tin bài viết</h2>
                <Form
                    form={form1}
                    labelCol={{ span: 3 }}
                    wrapperCol={{ span: 25 }}
                    layout="horizontal"
                    size="large"
                    labelWrap
                    name="wrap"
                >
                    <Form.Item label="Tiêu đề bài viết" name="title" hasFeedback validateFirst
                        rules={[{ required: true, message: 'Tiêu đề bài viết không được trống' }, {
                            max: 150, message: ' Tiêu đề bài viết không được vượt quá 150 ký tự',
                        }]}>
                        <Input placeholder="Nhập tiêu đề" />
                    </Form.Item>
                    <Form.Item label="Thể loại" name="category"  >
                        <Select style={{ width: '100%' }}
                            showSearch
                            placeholder="Search to Select Articles"
                            optionFilterProp="children"
                            filterOption={(input, option) => (option?.children ?? '').toLowerCase().indexOf(input.toLowerCase()) >= 0}
                            filterSort={(optionA, optionB) => (optionA?.children ?? '').toLowerCase().localeCompare((optionB?.children ?? '').toLowerCase())}
                        >
                            {categoryData?.map(category => (
                                <Select.Option key={category.categoryId} value={category.categoryId}>
                                    {category.categoryName}
                                </Select.Option>))}
                        </Select>
                    </Form.Item>
                    <Form.Item label="Nội dung bài viết" name="content" >
                        <MyCkeditor onDataChange={setEditorContent} />
                    </Form.Item>
                    <Form.Item
                        label="Danh sách thẻ tags"
                        name="tags"
                    >
                        <Select

                            mode="tags"
                            style={{
                                width: '100%',
                            }}
                            placeholder="Chọn các loại thẻ tags"
                            options={tags}
                        />
                    </Form.Item>
                    <Form.Item
                        label="Xuất bản ngay"
                        name="publish"
                    >
                        <Switch defaultChecked />
                    </Form.Item>
                    <Form.Item
                        label="Ảnh thu nhỏ bài viết"
                        name="thumbnail"
                        rules={[{ required: true }]}
                    >
                        <Upload
                            listType="picture-card"
                            fileList={fileList}
                            onChange={({ fileList }) => {
                                setFileList(fileList);
                                if (fileList[0]?.originFileObj) {
                                    const reader = new FileReader();
                                    reader.onload = (e) => setBase64Image(e.target.result);
                                    reader.readAsDataURL(fileList[0].originFileObj);
                                } else {
                                    setBase64Image(null);
                                    form1.setFieldsValue({
                                        thumbnail: undefined
                                    });
                                }
                            }}
                            onPreview={handlePreview}
                            maxCount={1}
                        >
                            {fileList.length >= 1 ? null : (
                                <button style={{ border: 0, background: 'none' }} type="button">
                                    <PlusOutlined />
                                    <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
                                </button>)}
                        </Upload>
                    </Form.Item>
                    {previewImage && (<Image
                        alt="preview"
                        style={{ maxWidth: '90%', maxHeight: '80%', objectFit: 'contain', display: 'none' }}
                        preview={{
                            visible: !!previewImage, src: previewImage, onVisibleChange: (visible) => {
                                if (!visible) setPreviewImage('');
                            },
                        }}
                    />)}
                </Form>
            </div>
            <div className="info-ads">
                <h2>Thông tin quảng cáo</h2>
                {!allPositionsEmpty ? (
                    <Form
                        form={form2}
                        labelCol={{ span: 10 }}
                        wrapperCol={{ span: 10 }}
                        layout="horizontal"
                        size="large"
                    >
                        {getSortedPositions().map((position) => {
                            if (adsData[position]?.length === 0) {
                                return null; // Không hiển thị nếu mảng rỗng
                            }
                            return (
                                <div className="" style={{ display: 'flex', justifyContent: 'start', gap: '20px' }} key={position}>
                                    <Form.Item label="Chọn loại" name={`type-ads-${position}`}>
                                        <Select
                                            style={{ width: 120 }}
                                            onChange={(value) => handleSelectChange(value, position)}
                                        >
                                            <Select.Option value={0}>NONE</Select.Option>
                                            <Select.Option value={1}>FIXED</Select.Option>
                                            <Select.Option value={2}>RANDOM</Select.Option>
                                            <Select.Option value={3}>RATE</Select.Option>
                                        </Select>
                                    </Form.Item>

                                    <Form.Item
                                        label={`Vị trí ${position.split('_')[1]}`}
                                        name={position}
                                        style={{ display: form2.getFieldValue(`type-ads-${position}`) !== 1 ? 'none' : 'block' }}
                                    >
                                        <Select
                                            showSearch
                                            placeholder="Search to Select Articles"
                                            optionFilterProp="children"
                                            filterOption={(input, option) => (option?.children ?? '').toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                            filterSort={(optionA, optionB) => (optionA?.children ?? '').toLowerCase().localeCompare((optionB?.children ?? '').toLowerCase())}
                                            style={{ width: 200 }}
                                        >
                                            {adsData[position].map(ad => (
                                                <Select.Option key={`${position}-${ad.adsId}`} value={ad.adsId}>
                                                    {ad.title}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </div>
                            )
                        }
                        )}
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

        <Form.Item style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
            <Button type="primary" size="large" onClick={handleSubmitAll}
                className={!submittable ? 'disabled-button' : ''} disabled={!submittable}>
                Lưu thay đổi
            </Button>
        </Form.Item>

    </div>);
};

export default ArticleCreate;