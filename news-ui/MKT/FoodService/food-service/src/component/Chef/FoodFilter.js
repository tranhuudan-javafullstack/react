import { useState } from 'react';
import { Dropdown, Checkbox, Space, Button } from 'antd';

const FoodFilter = ({ selectedFoodIDs, setSelectedFoodIDs, menu, handleFoodIDSelect }) => {
    const [dropdownVisible, setDropdownVisible] = useState(false); // Trạng thái để kiểm soát dropdown

    const handleMenuClick = (e) => {
        e.stopPropagation();
    };

    // Hàm thay đổi trạng thái dropdown
    const handleDropdownVisibleChange = (flag) => {
        setDropdownVisible(flag); // Cập nhật trạng thái mở/đóng của dropdown
    };

    return (
        <Dropdown
            overlay={(
                <div
                    style={{
                        maxHeight: '200px',
                        padding: '10px',
                        backgroundColor: 'white',
                        borderRadius: '15px',
                        border: '1px solid #ccc',
                    }}
                    onClick={handleMenuClick}
                >
                    <div>
                        <Checkbox
                            indeterminate={selectedFoodIDs.length > 0 && selectedFoodIDs.length < menu.length}
                            onChange={(e) => {
                                const newSelection = e.target.checked ? menu.map(food => food.foodID) : [];
                                setSelectedFoodIDs(newSelection);
                                localStorage.setItem('selectedFoodIDs', JSON.stringify(newSelection));
                            }}
                            checked={selectedFoodIDs.length === menu.length}
                        >
                            Chọn tất cả
                        </Checkbox>
                        <div style={{ maxHeight: '150px', overflowY: 'scroll', marginTop: '10px', marginLeft: '30px' }}>
                            <Space direction="vertical">
                                {menu.map(food => (
                                    <Checkbox
                                        key={food.foodID}
                                        onChange={() => handleFoodIDSelect(food.foodID)}
                                        checked={selectedFoodIDs.includes(food.foodID)}
                                    >
                                        {food.title}
                                    </Checkbox>
                                ))}
                            </Space>
                        </div>
                    </div>
                </div>
            )}
trigger = { ['click']} // Kích hoạt dropdown khi click
visible = { dropdownVisible } // Điều khiển trạng thái hiển thị của dropdown
onVisibleChange = { handleDropdownVisibleChange } // Thay đổi trạng thái khi click ra ngoài
    >
    <Button onClick={() => setDropdownVisible(!dropdownVisible)}>Chọn Món Ăn</Button>
        </Dropdown >
    );
};

export default FoodFilter;
