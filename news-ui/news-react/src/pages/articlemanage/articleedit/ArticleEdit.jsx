import { HomeOutlined, PlusOutlined } from '@ant-design/icons';
import { Alert, Breadcrumb, Button, Form, Image, Input, Select, Switch, Typography, Upload } from 'antd';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MyCkeditor from '../../../components/ckeditor/myCkeditor.jsx';
import { useArticleMutation } from '../../../hooks/useMutations.js';
import { useAdsQuery, useArticleQuery, useWebConfigQuery } from '../../../hooks/useQueries.js';
import { useNotificationProvider } from '../../../provider/NotificationProvider.jsx';
import './articleedit.scss';

const { Title } = Typography;
const ArticleEdit = () => {
    const { id } = useParams();

    const navigate = useNavigate();
    const [form1] = Form.useForm();
    const [form2] = Form.useForm();
    const { openerror, opensuccess } = useNotificationProvider();
    const [base64Image, setBase64Image] = useState('');
    const [previewImage, setPreviewImage] = useState('');
    const [fileList, setFileList] = useState([]);
    const [editorContent, setEditorContent] = useState('');
    const [dataInit, setDataInit] = useState('');
    const [submittable, setSubmittable] = useState(false);
    const {
        data: articleIdData,
        refetch,
    } = useArticleQuery('get-by-id', { articleId: id });
    const { data: adsData, error: adsError } = useAdsQuery('get-all');
    const { data: categoryData, error: categoryError } = useWebConfigQuery('get-categories');
    const updateArticleMutation = useArticleMutation('update');
    const saveAdsArticleMutation = useArticleMutation('save-ads');

    useEffect(() => {
        if (adsError) {
            openerror('Error fetching ads', adsError.message);
        }
        if (categoryError) {
            openerror('Error fetching categories', categoryError.message);
        }
    }, [adsError, categoryError, openerror]);

    const getSortedPositions = useCallback(() => {
        if (!adsData) return [];
        return Object.keys(adsData).sort((a, b) => {
            const posA = parseInt(a.split('_')[1], 10);
            const posB = parseInt(b.split('_')[1], 10);
            return posA - posB;
        });
    }, [adsData]);


    const handlePreview = useCallback(() => {
        if (base64Image)
            setPreviewImage(base64Image);
    }, [base64Image]);


    const values1 = Form.useWatch([], form1);
    const values2 = Form.useWatch([], form2);

    useEffect(() => {
        Promise.all([
            form1.validateFields({ validateOnly: true }),
            form2.validateFields({ validateOnly: true })
        ])
            .then(() => setSubmittable(true))
            .catch(() => setSubmittable(false));
    }, [form1, form2, values1, values2]);
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



    const handleSelectChange = useCallback((value, position) => {
        const adsSelectField = `${position}`;
        if (value === 1) {
            const firstAdsId = adsData[position][0]?.adsId;
            form2.setFieldsValue({ [adsSelectField]: firstAdsId });
        }
    }, [form2, adsData]);
    const handleSubmitAll = useCallback(async () => {
        try {
            const values = await form1.validateFields();

            const payload = {
                articleData: {
                    articleId: parseInt(id),
                    title: values.title,
                    content: editorContent,
                    thumbnailBase64: base64Image,
                    categoryId: values.category,
                    isPublished: values.publish || false,
                    tags: values.tags || [],
                    author: 1
                }
            };

            await updateArticleMutation.mutateAsync(payload);
            opensuccess('Article updated successfully', 'Article has been updated successfully');
        } catch (error) {
            openerror('Error submitting form', error.message);
        }
    }, [base64Image, editorContent, updateArticleMutation, opensuccess, openerror, form1]);
    const handleSubmitAds = useCallback(async () => {
        try {
            const values = await form2.validateFields();
            const positions = getSortedPositions();
            const adsType = positions
                .map(position => {
                    const typeKey = `type-ads-${position}`;
                    const adsValue = values[position];
                    const type = values[typeKey];

                    if (!type || type === 0) return null;

                    return {
                        adsIndex: {
                            positionId: parseInt(position.split('_')[1], 10),
                            adsId: type === 1 ? adsValue : 0
                        },
                        type: type
                    };
                })
                .filter(Boolean);
            const payload = {
                articleAdsData: {
                    articleId: parseInt(id),
                    adsData: adsType,
                }
            };

            await saveAdsArticleMutation.mutateAsync(payload);
            opensuccess('Article updated successfully', 'Article has been updated successfully');
        } catch (error) {
            openerror('Error submitting form', error.message);
        }
    }, [saveAdsArticleMutation, opensuccess, openerror, form2, getSortedPositions]);
    const allPositionsEmpty = useMemo(() => {
        if (!adsData) return true;
        return Object.values(adsData).every(arr => arr.length === 0);
    }, [adsData]);

    useEffect(() => {
        if (adsData && categoryData && articleIdData) {
            setDataInit(articleIdData.content);
            form1.setFieldsValue({
                title: articleIdData.title,
                category: articleIdData.category.categoryId,
                tags: articleIdData.tags.map(tag => tag),
                publish: articleIdData.isPublished,
            });
            if (articleIdData.thumbnailBase64) {
                setBase64Image(articleIdData.thumbnailBase64)
                setFileList([{
                    name: articleIdData.title,
                    url: articleIdData.thumbnailBase64,
                    status: 'done',
                    uid: articleIdData.articleId,
                }]);
            }
            setEditorContent(articleIdData.content);
            const adsValues = {};
            for (let i = 1; i <= 7; i++) {
                adsValues[`position_${i}`] = 'NONE';
                adsValues[`type-ads-position_${i}`] = 0;
            }

            const adsType = articleIdData.adsType;
            adsType.map((item) => {
                const adsData = item.adsIndex;
                const type = item.type;
                const numberPosition = adsData.positionId;
                adsValues[`position_${numberPosition}`] = adsData.adsId;
                adsValues[`type-ads-position_${numberPosition}`] = type;
            })
            form2.setFieldsValue(adsValues);
        }
    }, [articleIdData, form1, form2, adsData, categoryData]);

    return (
        <div className="articleedit">
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
                        href: '#/article/manage',
                        title: (
                            <span>Danh sách bài viết</span>
                        ),
                    },
                    {
                        title: 'Chỉnh sửa bài viết ' + id,
                    },
                    ]}
                />
                <div className="title">
                    <Title level={3}>Chỉnh sửa bài viết {id}</Title>
                </div>
                <div className="control">
                    <Button type='primary' onClick={async () => {
                        await refetch();
                    }}>
                        Tải lại
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
                        style={{ width: '100%' }}
                        initialValues={{ size: "large" }}
                        size={"large"}
                        labelWrap
                        name="wrap"
                    >
                        <Form.Item label="Tiêu đề bài viết" name="title" rules={[{ required: true, message: 'Tiêu đề bài viết không được trống' }]}>
                            <Input placeholder='Nhập tiêu đề bài viết' />
                        </Form.Item>
                        <Form.Item label="Thể loại"
                            name="category"

                        >
                            <Select style={{ width: '100%' }}
                                showSearch
                                optionFilterProp="children"
                                filterOption={(input, option) => (option?.children ?? '').toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                filterSort={(optionA, optionB) => (optionA?.children ?? '').toLowerCase().localeCompare((optionB?.children ?? '').toLowerCase())}
                            >
                                {categoryData && categoryData.map(category => (
                                    <Select.Option key={category.categoryId} value={category.categoryId}>
                                        {category.categoryName}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Form.Item label="Nội dung bài viết" name="content">
                            <MyCkeditor onDataChange={setEditorContent} initData={dataInit} />
                        </Form.Item>
                        <Form.Item
                            label="danh sách thẻ tags"
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
                        >
                            <Upload
                                name="avatar"
                                listType="picture-card"
                                className="avatar-uploader"
                                fileList={fileList}
                                onChange={({ fileList }) => {
                                    setFileList(fileList);
                                    if (fileList[0]?.originFileObj) {
                                        const reader = new FileReader();
                                        reader.onload = (e) => {
                                            setBase64Image(e.target.result);
                                        }
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
                                showUploadList={{
                                    showPreviewIcon: true,
                                    showRemoveIcon: true,
                                }}
                            >
                                {fileList.length >= 1 ? null : (
                                    <button style={{ border: 0, background: 'none' }} type="button">
                                        <PlusOutlined />
                                        <div style={{ marginTop: 8 }}>Tải lên</div>
                                    </button>
                                )}
                            </Upload>
                            {previewImage && (
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
                            )}
                        </Form.Item>

                        <Form.Item style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
                            <Button type="primary" onClick={handleSubmitAll} className={!submittable ? 'disabled-button' : ''}
                                disabled={!submittable}>
                                Lưu bài viết
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
                <div className="info-ads">
                    <h2>Thông tin quảng cáo</h2>
                    {!allPositionsEmpty ? (
                        <Form
                            form={form2}
                            labelCol={{ span: 10 }}
                            wrapperCol={{ span: 50 }}
                            layout="horizontal"
                            initialValues={{ size: "large" }}
                            size={"large"}
                        >
                            {getSortedPositions().map((position) => {
                                if (adsData[position]?.length === 0) {
                                    return null; // Không hiển thị nếu mảng rỗng
                                }
                                return (
                                    <div className="" style={{
                                        display: 'flex',
                                        justifyContent: 'start',
                                        gap: '20px'
                                    }}
                                        key={position}>
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
                                                optionFilterProp="children"
                                                filterOption={(input, option) => (option?.children ?? '').toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                                filterSort={(optionA, optionB) => (optionA?.children ?? '').toLowerCase().localeCompare((optionB?.children ?? '').toLowerCase())}
                                                style={{ width: 200 }}>
                                                {adsData[position].map(ad => (
                                                    <Select.Option key={ad.adsId} value={ad.adsId}>
                                                        {ad.title}
                                                    </Select.Option>
                                                ))}
                                            </Select>
                                        </Form.Item>
                                    </div>
                                )
                            })}
                            <Form.Item style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
                                <Button type="primary" onClick={handleSubmitAds} className={!submittable ? 'disabled-button' : ''}
                                    disabled={!submittable}>
                                    Lưu quảng cáo
                                </Button>
                            </Form.Item>
                        </Form>) : (
                        <Alert
                            message="Cảnh báo"
                            description="Chưa có quảng cáo nào"
                            type="warning"
                            action={
                                <Button danger size="small" onClick={() => navigate('/ads/manage')}>
                                    hãy bấm vào đây để thêm
                                </Button>
                            }
                            showIcon
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

export default ArticleEdit;