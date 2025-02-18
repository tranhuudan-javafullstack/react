import { default as React } from 'react';
import { Outlet } from 'react-router-dom';
import Menu from './components/menu/Menu.jsx';
import Navbar from './components/navbar/Navbar.jsx';
import './styles/global.scss';

const Layout = () => (

    <div className="main">
        <Navbar />
        <div className="container">
            <div className="menuContainer">
                <Menu />
            </div>
            <div className="contentContainer">
                <Outlet />
            </div>
        </div>
    </div>
);

export default Layout;