import React, { useState, useEffect, useRef } from 'react';
import { LogOut, MenuIcon, Settings, SidebarCloseIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from 'antd';
import './Sidebar.css';

const Sidebar = () => {
  const [activeItem, setActiveItem] = useState('');
  const [language, setLanguage] = useState(0);
  const [collapsed, setCollapsed] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState({
    "menu-order": true,
    "settings": false
  });
  const dropdownRefs = useRef({});
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const savedLanguage = localStorage.getItem('languageID');
    if (savedLanguage !== null) {
      setLanguage(parseInt(savedLanguage));
    }
    const currentPath = location.pathname;
    const currentMenuItem = menuItems.find(item => item.path === currentPath);
    if (currentMenuItem) {
      setActiveItem(currentMenuItem.id);
    }

    if (currentPath.includes('/resource/foodservice/owner/order/')) {
      setActiveItem('menu-order');
    }
    if (currentPath.includes('/resource/foodservice/owner/edit/')) {
      setActiveItem('menu-management');
    }
  }, [location.pathname]);

  const handleLanguageChange = (e) => {
    const languageID = parseInt(e.target.value);
    setLanguage(languageID);
    localStorage.setItem('languageID', languageID);
  };

  const handleItemClick = (itemId, path) => {
    if (path) {
      navigate(path);
    }
    setActiveItem(itemId);
  };

  const handleToggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  const handleToggleDropdown = (itemId) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const menuItems = [
    { id: 'menu-management', icon: '🍔', label: 'Quản lý menu', permission: 1, path: '/' },
    {
      id: 'menu-order',
      icon: '🍽️',
      label: 'Vận hành nhà hàng',
      permission: 1,
      isDropdown: true,
      subItems: [
        { id: 'reciept', icon: '📃', label: 'Hóa đơn', permission: 1, path: 'recipe-management' },
        { id: 'Order', icon: '📔', label: 'Order', permission: 1, path: 'order' },
        { id: 'chef', icon: '👨‍🍳', label: 'Bếp', permission: 1, path: 'chef' },
      ],
    },
  ];

  const settingsItem = {
    id: 'settings',
    icon: <Settings />,
    label: 'Cài đặt',
    permission: 1,
    isDropdown: true,
    subItems: [
      { id: 'bill', icon: '📄', label: 'Hóa đơn', permission: 1, path: 'bill' },
      { id: 'order-settings', icon: '🗒️', label: 'Biên lai', permission: 1, path: 'order-settings' },
      { id: 'surcharge', icon: '💰', label: 'Phí chung', permission: 1, path: 'externalbills' },
    ],
  };

  return (
    <>
      <nav className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-content">
          <Button type='text' className="sidebar-toggle" onClick={handleToggleCollapse} icon={collapsed ? <MenuIcon /> : <SidebarCloseIcon />} />
          <select
            className="language-select w-50"
            value={language}
            onChange={handleLanguageChange}
          >
            <option value={0}>English</option>
            <option value={1}>Tiếng Việt</option>
            <option value={2}>中 文 ( 台 灣 )</option>
          </select>
          <div className="sidebar-header">
            <h4>Food Service</h4>
          </div>
          <ul className="sidebar-menu">
            {menuItems.map((item) => (
              <li key={item.id}>
                {item.isDropdown ? (
                  <div>
                    <div
                      className={`sidebar-item ${activeItem === item.id ? 'active' : ''}`}
                      onClick={() => handleToggleDropdown(item.id)}
                    >
                      {item.icon} {item.label} {openDropdowns[item.id] ? <ChevronUp /> : <ChevronDown />}
                    </div>
                    <div
                      className={`dropdown-container ${openDropdowns[item.id] ? 'open' : ''}`}
                    >
                      <ul>
                        {item.subItems.map((subItem) => (
                          <li
                            key={subItem.id}
                            className={`sidebar-item sub-item ${activeItem === subItem.id ? 'active' : ''}`}
                            onClick={() => handleItemClick(subItem.id, subItem.path)}
                            data-permission={subItem.permission}
                          >
                            {subItem.icon} {subItem.label}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`sidebar-item ${activeItem === item.id ? 'active' : ''}`}
                    onClick={() => handleItemClick(item.id, item.path)}
                    data-permission={item.permission}
                  >
                    {item.icon} {item.label}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
        <div className="sidebar-footer">
          <div>
            <div
              className={`sidebar-item ${activeItem === settingsItem.id ? 'active' : ''}`}
              onClick={() => handleToggleDropdown(settingsItem.id)}
            >
              {settingsItem.icon} {settingsItem.label} {openDropdowns[settingsItem.id] ? <ChevronUp /> : <ChevronDown />}
            </div>
            <div
              className={`dropdown-container ${openDropdowns[settingsItem.id] ? 'open' : ''}`}
              ref={el => dropdownRefs.current[settingsItem.id] = el}
              style={openDropdowns[settingsItem.id] ? { height: dropdownRefs.current[settingsItem.id]?.scrollHeight + 'px' } : { height: '0px' }}
            >
              <ul>
                {settingsItem.subItems.map((subItem) => (
                  <li
                    key={subItem.id}
                    className={`sidebar-item sub-item ${activeItem === subItem.id ? 'active' : ''}`}
                    onClick={() => handleItemClick(subItem.id, subItem.path)}
                    data-permission={subItem.permission}
                  >
                    {subItem.icon} {subItem.label}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Sidebar;