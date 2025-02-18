import React, { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Radio, Button } from 'antd';

const ServiceChargeEditModal = ({ visible, onCancel, onFinish, currentServiceCharge }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (currentServiceCharge) {
      form.setFieldsValue({
        title: currentServiceCharge.title,
        quantity: currentServiceCharge.quantity,
        isPercent: currentServiceCharge.isPercent,
        value: currentServiceCharge.value
      });
    }
  }, [currentServiceCharge, form]);

  return (
    <Modal
      title="Cập nhật phí dịch vụ"
      open={visible}
      onCancel={onCancel}
      footer={null}
    >
      <Form
        form={form}
        onFinish={onFinish}
        key={currentServiceCharge ? currentServiceCharge.scID : 'serviceChargeForm'}
      >
        <Form.Item name="title" label="Tên phí" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="quantity" label="Số lượng" rules={[{ required: true }]}>
          <InputNumber min={1} />
        </Form.Item>
        <Form.Item name="isPercent" label="Loại phí">
          <Radio.Group>
            <Radio value={false}>Giá trị cố định</Radio>
            <Radio value={true}>Phần trăm</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item name="value" label="Giá trị" rules={[{ required: true }]}>
          <InputNumber min={0} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">Cập nhật</Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ServiceChargeEditModal;