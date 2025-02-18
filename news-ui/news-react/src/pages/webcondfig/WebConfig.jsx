import { MinusCircleOutlined, PlusOutlined, HomeOutlined } from '@ant-design/icons';
import { Button, Divider, Form, Image, Input, message, Select, Space, Upload, Breadcrumb, Typography } from 'antd';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import MyColorPicker from '../../components/colorPicker/myColorPicker';
import { useWebConfigMutation } from '../../hooks/useMutations.js';
import { useWebConfigQuery } from '../../hooks/useQueries.js';
import { useNotificationProvider } from '../../provider/NotificationProvider.jsx';
import './webconfig.scss';
import MyCkeditor from '../../components/ckeditor/myCkeditor.jsx';
const { Title } = Typography;

const WebConfig = () => {
    const [formLayoutAndTheme] = Form.useForm();
    const [formCategory] = Form.useForm();
    const [formFooter] = Form.useForm();
    const {
        data,
        error,
        isError,
        refetch,
    } = useWebConfigQuery('get-web-config');
    const { openerror, opensuccess } = useNotificationProvider();
    const prevDataRef = useRef();
    const saveWebConfigLayoutAndThemeMutation = useWebConfigMutation('save-layout-theme')
    const saveWebConfigCategoryMutation = useWebConfigMutation('save-category')
    const saveWebConfigFooterMutation = useWebConfigMutation('save-footer')
    useEffect(() => {
        if (data && data !== prevDataRef.current) {

            setBase64Image(data.logoBase64);
            setFileList([{ url: data.logoBase64 }]);
            formLayoutAndTheme.setFieldsValue({
                layout: data.layoutId,
                color: data.colorId,
            });
            formCategory.setFieldsValue({
                categoriesItems: data.categories.map(category => ({
                    categoryId: category.categoryId,
                    categoryName: category.categoryName
                }))
            });
            formFooter.setFieldsValue({
                left: setDataInitContentLeft(data.footers.left),
                right: setDataInitContentRight(data.footers.right),
                center: setDataInitContentCenter(data.footers.center),
            });
            prevDataRef.current = data;
        }
    }, [data, formLayoutAndTheme, formCategory]);
    useEffect(() => {
        if (isError) {
            message.error('Failed to fetch web configuration');
        }
    }, [isError]);
    const [base64Image, setBase64Image] = useState(null);
    const [previewImage, setPreviewImage] = useState('');
    const [fileList, setFileList] = useState([]);


    const handleImageChange = useCallback(({ fileList }) => {
        setFileList(fileList);
        if (fileList[0]?.originFileObj) {
            const reader = new FileReader();
            reader.onload = (e) => setBase64Image(e.target.result);
            reader.readAsDataURL(fileList[0].originFileObj);
        }
    }, []);

    const handlePreview = useCallback(() => setPreviewImage(base64Image), [base64Image]);
    const handleRemove = useCallback(() => {
        setFileList([]);
        setBase64Image(null);
    }, []);

    const [isInputAddedCategory, setIsInputAddedCategory] = useState(true);

    const handleSubmitLayoutAndTheme = useCallback(async () => {
        try {
            const values = await formLayoutAndTheme.validateFields();

            const payload = {
                layoutAndThemeData: {
                    layoutId: values.layout,
                    colorId: 1,
                    logoBase64: base64Image
                }
            };

            await saveWebConfigLayoutAndThemeMutation.mutateAsync(payload);
            opensuccess('Web configuration saved', 'Web configuration has been updated successfully');
            setIsInputAddedCategory(true);
        } catch (error) {
            openerror('Error submitting form', error.message);
        }
    }, [formLayoutAndTheme, base64Image, saveWebConfigLayoutAndThemeMutation, opensuccess, openerror]);
    const handleSubmitCategory = useCallback(async () => {
        try {
            const values = await formCategory.validateFields();

            const payload = {
                categoryData: {
                    categories: values.categoriesItems.map((category) => ({
                        categoryId: category.categoryId,
                        categoryName: category.categoryName
                    })),
                }
            };

            await saveWebConfigCategoryMutation.mutateAsync(payload);
            opensuccess('Web configuration saved', 'Web configuration has been updated successfully');
            setIsInputAddedCategory(true);
        } catch (error) {
            openerror('Error submitting form', error.message);
        }
    }, [formCategory, saveWebConfigCategoryMutation, opensuccess, openerror]);
    const handleSubmitFooter = useCallback(async () => {
        try {
            const payload = {
                footerData: {
                    left: editorContentLeft,
                    right: editorContentRight,
                    center: editorContentCenter
                }
            };

            await saveWebConfigFooterMutation.mutateAsync(payload);
            opensuccess('Web configuration saved', 'Web configuration has been updated successfully');
        } catch (error) {
            openerror('Error submitting form', error.message);
        }
    }, [formFooter, saveWebConfigFooterMutation, opensuccess, openerror]);


    const CategoryFields = ({ fields, add, remove }) => (
        <>
            {fields.map((field, index) => (
                <Form.Item
                    required={false}
                    key={field.key}
                >
                    <Form.Item
                        {...field}
                        name={[field.name, 'categoryId']}
                        noStyle
                    >
                        <Input type="hidden" />
                    </Form.Item>
                    <Form.Item
                        {...field}
                        name={[field.name, 'categoryName']}
                        validateTrigger={['onChange', 'onBlur']}
                        rules={[{
                            required: true,
                            whitespace: true,
                            message: "Please input category name or delete this field."
                        }]}
                        noStyle
                    >
                        <Input placeholder="Category name" style={{ width: '60%' }} />
                    </Form.Item>
                    <MinusCircleOutlined className="dynamic-delete-button" onClick={() => {
                        remove(field.name);
                        setIsInputAddedCategory(true);
                    }} />
                </Form.Item>
            ))}
            <Form.Item>
                {isInputAddedCategory && (<Button
                    type="dashed"
                    onClick={() => {
                        add();
                        setIsInputAddedCategory(false);
                    }}
                    style={{
                        width: '100%',
                    }}
                    block
                    icon={<PlusOutlined />}
                >
                    Thêm thể loại
                </Button>)}
            </Form.Item>
        </>
    );
    const [editorContentLeft, setEditorContentLeft] = useState('');
    const [editorContentRight, setEditorContentRight] = useState('');
    const [editorContentCenter, setEditorContentCenter] = useState('');
    const [dataInitContentLeft, setDataInitContentLeft] = useState('');
    const [dataInitContentRight, setDataInitContentRight] = useState('');
    const [dataInitContentCenter, setDataInitContentCenter] = useState('');

    return (
        <div className='webconfig'>
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
                        title: 'Cấu hình trang WEB',
                    },
                    ]}
                />
                <div className="title">
                    <Title level={3}>Quản lý cấu hình web</Title>
                </div>
                <div className="control">
                    <Button type="primary" onClick={refetch}> Tải lại</Button>
                </div>
            </div>
            <div className="form-webconfig">
                <div className="form-layout-colors">
                    <Form
                        labelCol={{
                            span: 50,
                        }}
                        wrapperCol={{
                            span: 50,
                        }}
                        layout="vertical"
                        onFinish={handleSubmitLayoutAndTheme}
                        form={formLayoutAndTheme}>

                        <div className="form">
                            <h2>Bố cục và chủ đề </h2>
                            <Form.Item
                                label="Logo trang web"
                                name="logoBase64"
                            >
                                <Upload
                                    listType="picture-card"
                                    fileList={fileList}
                                    onChange={handleImageChange}
                                    onPreview={handlePreview}
                                    onRemove={handleRemove}
                                    maxCount={1}
                                >
                                    {fileList.length >= 1 ? null : (
                                        <button style={{ border: 0, background: 'none' }} type="button">
                                            <PlusOutlined />
                                            <div style={{ marginTop: 8, color: 'white' }}>Tải lên</div>
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
                            <Form.Item label="Bố cục" name="layout">
                                <Select
                                    style={{
                                        width: 155,
                                    }}
                                >
                                    {[1, 2, 3, 4].map(i => (<Select.Option key={`layout${i}`} value={i}>
                                        <Image
                                            src="https://letsenhance.io/static/8f5e523ee6b2479e26ecc91b9c25261e/1015f/MainAfter.jpg"
                                            style={{ width: 20, height: 20, marginRight: 10 }}
                                        />
                                        Bố cục {i}
                                    </Select.Option>))}

                                </Select>
                            </Form.Item>
                            <Form.Item label="Màu sắc" name="color">
                                <MyColorPicker />
                            </Form.Item>

                        </div>

                        <Form.Item style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
                            <Button type="primary" size="large" htmlType="submit">
                                Lưu bố cục và chủ đề
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
                <div className="form-footer">
                    <Form
                        labelCol={{
                            span: 10,
                        }}
                        wrapperCol={{
                            span: 50,
                        }}
                        layout="horizontal"
                        onFinish={handleSubmitFooter}
                        form={formFooter}>
                        <div className="form">
                            <h2>Thành phần chân trang</h2>
                            <div className="ckeditors">
                                <div className="left">
                                    <h3>Bên trái</h3>
                                    <MyCkeditor onDataChange={setEditorContentLeft} initData={dataInitContentLeft} />
                                </div>
                                <div className="right">
                                    <h3>Bên phải</h3>
                                    <MyCkeditor onDataChange={setEditorContentRight} initData={dataInitContentRight} />
                                </div>
                                <div className="center">
                                    <h3>Ở Giữa</h3>
                                    <MyCkeditor onDataChange={setEditorContentCenter} initData={dataInitContentCenter} />
                                </div>
                            </div>
                        </div>
                        <Form.Item style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
                            <Button type="primary" size="large" htmlType="submit">
                                Lưu thành phần chân trang
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
                <div className="form-category">
                    <Form
                        labelCol={{
                            span: 10,
                        }}
                        wrapperCol={{
                            span: 50,
                        }}
                        layout="horizontal"
                        onFinish={handleSubmitCategory}
                        form={formCategory}>
                        <div className="form">
                            <h2>Danh sách thể loại</h2>
                            <Form.List name="categoriesItems">
                                {(fields, { add, remove }) => (
                                    <CategoryFields fields={fields} add={add} remove={remove} />
                                )}
                            </Form.List>
                        </div>
                        <Form.Item style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
                            <Button type="primary" size="large" htmlType="submit">
                                Lưu danh sách thể loại
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            </div>

        </div>
    );
};

export default WebConfig;