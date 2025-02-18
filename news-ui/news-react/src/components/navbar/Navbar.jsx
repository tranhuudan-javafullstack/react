import "./navbar.scss"
import { Link } from 'react-router-dom';

import LoginIcon from '../../assets/logo.svg';
import NotificationIcon from '../../assets/notifications.svg';
import SearchIcon from '../../assets/search.svg';
import AppIcon from '../../assets/app.svg';
import ExpandIcon from '../../assets/expand.svg';

const Navbar = () => {
    return (
        <div className="navbar">
            <Link to="/" className="logo">
                <img src={LoginIcon} alt="" />
                <span>Huudan-Admin</span>
            </Link>
            <div className="icons">
                <img src={SearchIcon} alt="" className="icon" />
                <img src={AppIcon} alt="" className="icon" />
                <img src={ExpandIcon} alt="" className="icon" />
                <div className="notification">
                    <img src={NotificationIcon} alt="" />
                    <span>1</span>
                </div>
                <div className="user">
                    <img
                        src="https://images.pexels.com/photos/11038549/pexels-photo-11038549.jpeg?auto=compress&cs=tinysrgb&w=1600&lazy=load"
                        alt=""
                    />
                    <span>huudan</span>
                </div>
                <img src="settings.svg" alt="" className="icon" />
            </div>
        </div>
    )
}

export default Navbar;
