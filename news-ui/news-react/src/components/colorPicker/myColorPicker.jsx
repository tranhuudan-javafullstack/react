
import { cyan, generate, green, presetPalettes, red } from '@ant-design/colors';
import { Col, ColorPicker, Divider, Row, theme } from 'antd';
import { Space } from 'antd';
import './myColorPicker.css'

const genPresets = (presets = presetPalettes) =>
    Object.entries(presets).map(([label, colors]) => ({
        label,
        colors,
    }));

import React from 'react';

const MyColorPicker = () => {
    const { token } = theme.useToken();
    const presets = genPresets({
        primary: generate(token.colorPrimary),
        red,
        green,
        cyan,
    });

    const panelRender = (_, { components: { Picker, Presets } }) => (
        <Row justify="space-between" wrap={false}>
            <Col span={12}>
                <Presets />
            </Col>
            <Divider
                type="vertical"
                style={{
                    height: 'auto',
                }}
            />
            <Col flex="auto">
                <Picker />
            </Col>
        </Row>
    );

    return (
        <Space direction="vertical">
            <ColorPicker
                defaultValue={token.colorPrimary}
                style={{
                    popupOverlayInner: {
                        width: 480,
                    },
                }}
                allowClear
                presets={presets}
                panelRender={panelRender}
                showText={(color) => <span>Mã màu ({color.toHexString()})</span>}
            />
        </Space>
    );
};

export default MyColorPicker;