import { Link } from 'react-router-dom';
import { Line, LineChart, ResponsiveContainer, Tooltip } from 'recharts';
import './chartBox.scss';
// Định nghĩa component bằng JavaScript
const ChartBox = (props) => {
    return (
        <div className="chartBox">
            <div className="boxInfo">
                <div className="title">
                    <span>{props.title}</span>
                </div>
                <h1 style={{ color: 'skyblue' }}>{props.number}</h1>
                <Link to={props.direct} style={{ color: "white", textDecoration: 'underline' }}>Xem chi tiết</Link>
            </div>
            <div className="chartInfo">
                <div className="chart">
                    <ResponsiveContainer width="99%" height="100%">
                        <LineChart data={props.chartData}>
                            <Tooltip
                                contentStyle={{ backgroundColor: "white", borderRadius: '5px' }}
                                labelStyle={{ display: "none" }}
                            />
                            <Line type="monotone" dataKey="value" stroke="gold" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <div className="texts">
                    <span className="percentage" style={{ color: props.percentage < 0 ? "tomato" : "limegreen" }}>
                        {props.percentage}%
                    </span>
                    <span className="duration">Tháng này</span>
                </div>
            </div>
        </div>
    );
};

export default ChartBox;
