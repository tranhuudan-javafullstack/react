import { HomeOutlined } from '@ant-design/icons';
import { Breadcrumb, Card, Col, Row } from 'antd';
import React, { useEffect, useState } from 'react';

import { useAdsQuery } from '../../hooks/useQueries.js';
import { useNotificationProvider } from '../../provider/NotificationProvider.jsx';
import './adsmanage.scss';

const AdsManage = () => {
    const { openerror, opensuccess } = useNotificationProvider();
    const { data, error } = useAdsQuery('get-all-positions');


    const [positions, setPositions] = useState([]);
    useEffect(() => {
        if (data) {
            setPositions(data);
        }
    }, [data, error, openerror]);

    return (
        <div className="adsmanage">
            <div className="breadcrumb">
                <Breadcrumb
                    items={[
                        { href: '#', title: <HomeOutlined /> },
                        { href: '#/dashboard', title: <span>Thống kê chung</span> },
                        { title: 'Danh sách các vị trí quảng cáo' },
                    ]}
                />
            </div>
            <Row gutter={[21, 21]}>
                {positions.map((position) => (
                    <Col key={position.positionId} span={position.positionId <= 4 ? 6 : 8}>
                        <Card
                            title={position.name}
                            bordered={false}
                            extra={<a href={`#/ads/position/${position.positionId}`}>Chi tiết</a>}
                        >
                            Vị trí {position.positionId}
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
    );
}

export default AdsManage;