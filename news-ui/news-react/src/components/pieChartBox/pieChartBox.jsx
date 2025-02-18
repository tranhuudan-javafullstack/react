
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Alert } from 'antd'
import './pieChartBox.scss';


const pieChartBox = ({ title, chartData }) => {

    return (
        <div className='pieChartBox'>
            <h2 style={{ marginBottom: '25px' }}>{title}</h2>
            {
                chartData.length === 0 ?
                    (<Alert message="Chưa có bài viết nào" type="info" />) :
                    (<><div className="chart">
                        <ResponsiveContainer width="99%" height={300}>
                            <PieChart>
                                <Tooltip
                                    contentStyle={{ backgroundColor: "white", borderRadius: '5px' }}
                                    labelStyle={{ fill: 'black' }}
                                />
                                <Pie
                                    data={chartData}
                                    innerRadius={"70%"}
                                    outerRadius={"90%"}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {chartData.map((item) => (
                                        <Cell key={item.name} fill={item.color} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                        <div className="options">
                            {chartData.map((item) => (
                                <div className="option" key={item.name}>
                                    <div className="title">
                                        <div className="dot" style={{ backgroundColor: item.color }} />
                                        <span className="name">{item.name}</span>
                                    </div>
                                    <span className="value">({item.value})</span>
                                </div>
                            ))}
                        </div></>)
            }

        </div>
    );
};

export default pieChartBox;