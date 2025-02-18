import React, { useState, useEffect } from 'react';
import { Image } from 'antd';
import { global } from '../../../api';
import { API_DOMAIN, API_DOMAIN_LOCAL } from '../../domain';

const FoodImage = ({ food }) => {
    const [imageSrc, setImageSrc] = useState('');

    useEffect(() => {
        const fetchImage = async () => {
            const imageUrl = `${API_DOMAIN}global/fandb/image/food?foodID=${food.foodID}`;
            const cachedImageUrl = await global.getImageFromCache(food.foodID);

            setImageSrc(cachedImageUrl ? cachedImageUrl : imageUrl);
        };
        fetchImage();
    }, [food.foodID]);

    return (
        <Image
            style={{ width: '100%', height: '100%', borderRadius: '10px' }}
            src={imageSrc}
            alt={food.title}
            onError={(event) => event.target.src = `${API_DOMAIN_LOCAL}resource/foodservice/Global/food-default.png`}
        />
    );
};

export default FoodImage;
