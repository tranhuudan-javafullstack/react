import { Link } from 'react-router-dom';
import './chartBox.scss';
const ChartBoxTotal = (props) => {
    return (
        <div className="chartBox">
            <div className="boxInfo">
                <div className="title">
                    <span>{props.title}</span>
                </div>
                <h1 style={{ color: 'skyblue' }}>{props.number}</h1>
                <Link to={props.direct} style={{ color: "white", textDecoration: 'underline' }}>Xem chi tiết</Link>
            </div>
        </div>
    );
};

export default ChartBoxTotal;
