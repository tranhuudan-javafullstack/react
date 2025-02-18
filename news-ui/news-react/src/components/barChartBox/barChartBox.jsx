import './barChartBox.scss';
import { BarChart, Bar, ResponsiveContainer, Tooltip, Legend, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Alert } from 'antd'
import { useEffect, useState } from 'react';
const BarChartBox = ({ data }) => {
    const [lastDataValue, setLastDataValue] = useState(null);

    // useEffect sẽ cập nhật lastDataValue khi dữ liệu (data) thay đổi
    useEffect(() => {
        if (data.length !== 0) {
            setLastDataValue(data[data.length - 1].value === 0);
        } else {
            setLastDataValue(null); // Đặt giá trị mặc định khi không có dữ liệu
        }
    }, [data]);
    return (
        <div className="barChartBox">
            <h2 style={{ marginBottom: '25px' }}>Tổng quảng cáo</h2>
            {lastDataValue ? (<Alert message="Chưa có quảng cáo nào" type="info" />) : (<div className="chart">
                <ResponsiveContainer width="99%" height={300}>
                    <BarChart data={data} width={500}
                        height={300}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" stroke="white" />
                        <YAxis dataKey="value" stroke="white" />
                        <Tooltip
                            contentStyle={{ backgroundColor: "white", borderRadius: '5px' }}
                            labelStyle={{ display: 'none' }}
                            cursor={{ fill: 'none' }}
                        />
                        <Legend />
                        <Bar dataKey="value" fill='skyblue' />
                    </BarChart>
                </ResponsiveContainer>
            </div>)}

        </div>
    );
};

export default BarChartBox;
