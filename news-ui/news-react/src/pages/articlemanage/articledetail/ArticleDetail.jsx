import { HomeOutlined, PlusOutlined } from '@ant-design/icons';
import { Alert, Breadcrumb, Button, Col, Form, Image, Input, Row, Select, Typography, Upload, Space } from 'antd';
import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import MyCkeditor from '../../../components/ckeditor/myCkeditor.jsx';
import { useAdsQuery, useArticleQuery, useWebConfigQuery } from '../../../hooks/useQueries.js';
import { useNotificationProvider } from '../../../provider/NotificationProvider.jsx';
import './articledetail.scss';
const { Title, Text } = Typography;
const AVATAR_NAMES = [
    "Samantha", "Daisy", "Simba", "Jasmine", "Boo", "Bailey", "Toby", "Sugar", "Spooky", "Cuddles",
    "Buddy", "Oscar", "Boots", "Sheba", "Harley", "Buster", "Scooter", "Mimi", "Abby", "Tinkerbell"
];

import { useNavigate } from 'react-router-dom';
function getRandomAvatar() {
    const avatarRandom = AVATAR_NAMES[Math.floor(Math.random() * AVATAR_NAMES.length)];
    return `https://api.dicebear.com/9.x/adventurer/svg?seed=${avatarRandom}`;
}
const ArticleDetail = () => {

    const navigate = useNavigate();
    const { id } = useParams();
    const [form1] = Form.useForm();
    const [form2] = Form.useForm();
    const { openerror } = useNotificationProvider();
    const [base64Image, setBase64Image] = useState('');
    const [previewImage, setPreviewImage] = useState('');
    const [fileList, setFileList] = useState([]);
    const [dataInit, setDataInit] = useState('');
    const {
        data: articleIdData,
        refetch,
    } = useArticleQuery('get-by-id', { articleId: id });
    const { data: adsData, error: adsError } = useAdsQuery('get-all');
    const { data: categoryData, error: categoryError } = useWebConfigQuery('get-categories');
    useEffect(() => {
        if (articleIdData) {
            setDataInit(articleIdData.content);
            form1.setFieldsValue({
                title: articleIdData.title,
                slug: articleIdData.slug,
                category: articleIdData.category.categoryId,
                tags: articleIdData.tags.map(tag => tag),
                publish: articleIdData.isPublished,
            });
            if (articleIdData.thumbnailBase64) {
                setBase64Image(articleIdData.thumbnailBase64);
                setFileList([{ url: articleIdData.thumbnailBase64 }]);
                form1.setFieldsValue({
                    thumbnail: articleIdData.thumbnailBase64
                });
            }
            const adsValues = {};
            for (let i = 1; i <= 7; i++) {
                adsValues[`position_${i}`] = 'NONE';
                adsValues[`type-ads-position_${i}`] = 'NONE';
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
    }, [articleIdData, form1, form2]);



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
        setPreviewImage(base64Image);
    }, [base64Image]);



    const allPositionsEmpty = useMemo(() => {
        if (!adsData) return true;
        return Object.values(adsData).every(arr => arr.length === 0);
    }, [adsData]);

    return (
        <div className="articledetail">
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
                        title: 'Chi tiết bài viết ' + id,
                    },
                    ]}
                />
                <div className="title">
                    <Title level={3}>Chi tiết bài viết {id}</Title>
                </div>
                <div className="control">
                    <Space><Button type='primary' onClick={() => navigate(`/article/${id}/edit`)}>
                        Sửa
                    </Button>
                        <Button type='primary' onClick={async () => {
                            await refetch();
                        }}>
                            Tải lại
                        </Button></Space>
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
                        <Form.Item
                            label="Ảnh thu nhỏ bài viết"
                            name="thumbnail"
                            rules={[{ required: true }]}
                        >
                            <Upload disabled
                                name="avatar"
                                listType="picture-card"
                                className="avatar-uploader"
                                fileList={fileList}
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
                                        <div style={{ marginTop: 8 }}>Upload</div>
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
                        <Form.Item label="Tiêu đề bài viết" name="title"  >
                            <Input disabled style={{ color: 'white' }} />
                        </Form.Item>
                        <Form.Item label="Đường dẫn bài viết" name="slug" >
                            <Input disabled style={{ color: 'white' }} />
                        </Form.Item>
                        <Form.Item
                            label="danh sách thẻ tags"
                            name="tags"
                            className='tags'
                        >
                            <Select disabled
                                mode="tags"
                                style={{
                                    width: '100%',
                                }}
                                placeholder="Chọn các loại thẻ tags"
                            />
                        </Form.Item>
                        <Form.Item label="Thể loại" name="category" rules={[{ required: true, message: 'Thể loại không được trống' }]}>
                            <Select disabled>
                                {categoryData && categoryData.map(category => (
                                    <Select.Option key={category.categoryId} value={category.categoryId}>
                                        {category.categoryName}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Form.Item label="Nội dung bài viết" name="content">
                            <MyCkeditor initData={dataInit} isView={true} />
                        </Form.Item>

                    </Form>
                </div>
                <div className="info-ads">
                    <div className="ads">
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
                                                <Select disabled style={{ width: 120 }} >
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
                                                    display: form2.getFieldValue(`type-ads-${position}`) === 'RANDOM' ||
                                                        form2.getFieldValue(`type-ads-${position}`) === 'RATE' ? 'none' : 'block'
                                                }}
                                            >
                                                <Select disabled style={{ width: 200 }}>
                                                    <Select.Option value="NONE">NONE</Select.Option>
                                                    {adsData[position].map(ad => (
                                                        <Select.Option key={ad.adsId} value={ad.adsId}>
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
                            <Alert message="Chưa có quảng cáo nào để hiển thị" type="info" showIcon />
                        )}
                    </div>
                    <div className="article">
                        <h2>Thông tin chi tiết bài viết</h2>
                        <div className="info">
                            <Row gutter={[0, 0]}  >
                                {[
                                    { label: 'Lượt xem', value: articleIdData?.views || 0 },
                                    { label: 'Lượt comment', value: articleIdData?.countComments  },
                                    { label: 'Trạng thái', value: articleIdData?.isPublished ? 'Đã xuất bản' : 'Chưa xuất bản' },
                                    { label: 'Ngày tạo', value: new Date(articleIdData?.createdAt).toLocaleString() },
                                    { label: 'Ngày cập nhật', value: new Date(articleIdData?.updatedAt).toLocaleString() },
                                    { label: 'Tác giả', value: articleIdData?.author || 'Không có thông tin' },
                                ].map((detail, index) => (
                                    <React.Fragment key={index} >
                                        <Col span={12} style={{ padding: '10px 0 10px 0' }} >
                                            <Text style={{ color: 'white', fontSize: '15px', textTransform: 'uppercase' }}   >{detail.label}:</Text>
                                        </Col>
                                        <Col span={12} style={{ padding: '10px 0 10px 0', textAlign: 'end' }} >
                                            <Text style={{ color: 'white', fontSize: '20px' }}>{detail.value}</Text>
                                        </Col>
                                    </React.Fragment>
                                ))}
                            </Row>
                        </div>
                    </div>
                    <div className="comment">
                        <h2>Thông tin comment</h2>
                        <div className="list"  >
                            {Array.isArray(articleIdData?.comments) && articleIdData?.comments.length > 0 ? (
                                articleIdData?.comments.map((comment) => (
                                    <div className="listItem" key={comment.commentId}>
                                        <div className="commentContent">
                                            <p>{comment.commentContent}</p>
                                            <span className="createdAt">
                                                {new Date(comment.createdAt).toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="user">
                                            <img src={getRandomAvatar()} alt="" />
                                            <div className="userTexts">
                                                <span className="username">{comment.username || 'Anonymous'}</span>
                                                <span className="email">{comment.email || 'No email'}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <Alert message="Chưa có bình luận nào" type="info" />
                            )}
                        </div>
                    </div>
                </div>
            </div>



        </div>
    );
}

export default ArticleDetail;