import React, { useState } from 'react';
import { Modal, Tabs, Radio, Button, Input } from 'antd';

const { TabPane } = Tabs;

const PrintModal = ({ visible, onCancel, onOk }) => {
  const [selectedTab, setSelectedTab] = useState('30x50');
  const [selectedOrientation, setSelectedOrientation] = useState('horizontal');



  const handleOrientationChange = (e) => {
    setSelectedOrientation(e.target.value);
  };

  const handleOk = () => {
    const templateId = selectedOrientation === 'horizontal' ? 1 : 2;
    onOk(templateId);
  };

  return (
    <Modal
      title="Print Order"
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button key="print" type="primary" onClick={handleOk}>
          Print
        </Button>,
      ]}
    >
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Tabs size='large' defaultActiveKey="30x50" style={{ width: '100%', textAlign: 'center' }}>
            <TabPane  tab="30x50" key="30x50">
              <Radio.Group onChange={handleOrientationChange} value={selectedOrientation} style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Radio style={{ marginBottom: '10px', width: '100%' }} value="horizontal">Ngang</Radio>
                <Radio style={{ width: '100%' }} value="vertical">Dọc</Radio>
              </div>
              </Radio.Group>
            </TabPane>
            <TabPane tab="58" key="58">
            <Radio.Group onChange={handleOrientationChange} value={selectedOrientation} style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Radio style={{ marginBottom: '10px', width: '100%' }} value="horizontal">Ngang</Radio>
                <Radio style={{ width: '100%' }} value="vertical">Dọc</Radio>
              </div>
              </Radio.Group>
            </TabPane>
            <TabPane tab="80" key="80">
            <Radio.Group onChange={handleOrientationChange} value={selectedOrientation} style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Radio style={{ marginBottom: '10px', width: '100%' }} value="horizontal">Ngang</Radio>
                <Radio style={{ width: '100%' }} value="vertical">Dọc</Radio>
              </div>
              </Radio.Group>
            </TabPane>
          </Tabs>
        </div>
      </div>
        <Input placeholder="Nhập tên khách" style={{ width: '100%', textAlign: 'center' }} />
    </Modal>
  );
};

export default PrintModal;