import { API_DOMAIN, API_DOMAIN_LOCAL } from '../component/domain';
import API from './index';

export const fetchMenu = async () => {
    try {
        const languageID = localStorage.getItem('languageID') || '0';
        const response = await API.get(`${API_DOMAIN_LOCAL}fandb/menu${languageID}`);
        return response
    } catch (error) {
        console.error('Failed to fetch menu:', error);
        throw error;
    }
};
// Hàm để lấy danh sách món ăn từ API
const listFoods = async () => {
    try {
        const response = await API.get(`${API_DOMAIN_LOCAL}fandb/menu0`);
        return response.data.data.Foods;
    } catch (error) {
        console.error('Failed to fetch menu:', error);
        throw error;
    }
};

const openDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('food-images-db', 1);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('images')) {
                db.createObjectStore('images', { keyPath: 'id' });
            }
        };

        request.onsuccess = (event) => {
            resolve(event.target.result);
        };

        request.onerror = (event) => {
            reject(`IndexedDB error: ${event.target.errorCode}`);
        };
    });
};

// Hàm để tải danh sách hình ảnh (kèm link) cho các món ăn
export const fetchImageList = async () => {
    try {
        const foods = await listFoods();
        const listImage = foods.map(food => ({
            id: food.foodID,
            url: `http://fandbsoft.com:999/fandb/image/food?foodID=${parseInt(food.foodID)}` // Tạo URL hình ảnh
        }));
        return listImage;
    } catch (error) {
        console.error('Failed to fetch menu:', error);
        throw error;
    }
};

// Hàm cache toàn bộ hình ảnh vào Cache Storage
export const cacheAllImages = async () => {
    try {
        const listImage = await fetchImageList();
        const db = await openDB();

        // Xóa toàn bộ ảnh trong IndexedDB trước khi cache mới
        const clearTransaction = db.transaction(['images'], 'readwrite');
        const clearStore = clearTransaction.objectStore('images');

        await new Promise((resolve, reject) => {
            const clearRequest = clearStore.clear(); // Xóa toàn bộ ảnh trong store
            clearRequest.onsuccess = () => resolve();
            clearRequest.onerror = () => reject('Lỗi khi xóa ảnh trong IndexedDB');
        });

        clearTransaction.oncomplete = () => {
            console.log('Xóa toàn bộ ảnh trong IndexedDB thành công.');
        };

        clearTransaction.onerror = (error) => {
            console.error('Lỗi trong transaction xóa ảnh:', error);
        };

        for (const image of listImage) {
            try {
                // Fetch ảnh trước và chuẩn bị blob trước khi bắt đầu transaction
                const response = await fetch(image.url); // Fetch ảnh từ URL
                const blob = await response.blob();

                // Bắt đầu transaction để lưu hình ảnh vào IndexedDB
                const transaction = db.transaction(['images'], 'readwrite');
                const store = transaction.objectStore('images');

                // Kiểm tra xem ảnh đã có trong IndexedDB chưa
                const existingImage = await new Promise((resolve, reject) => {
                    const getRequest = store.get(image.id);
                    getRequest.onsuccess = () => resolve(getRequest.result);
                    getRequest.onerror = () => reject('Error getting image from IndexedDB');
                });

                if (!existingImage) {
                    // Đảm bảo rằng lưu trữ vào IndexedDB được thực hiện trong transaction
                    await new Promise((resolve, reject) => {
                        const putRequest = store.put({ id: image.id, url: image.url, blob });
                        putRequest.onsuccess = () => resolve();
                        putRequest.onerror = () => reject('Error saving image to IndexedDB');
                    });

                    console.log(`Đã cache ảnh cho foodID ${image.id}`);
                } else {
                    console.log(`Ảnh cho foodID ${image.id} đã có trong IndexedDB`);
                }

                // Hoàn tất transaction
                transaction.oncomplete = () => {
                    console.log(`Transaction hoàn thành cho foodID ${image.id}`);
                };

                transaction.onerror = (error) => {
                    console.error(`Lỗi trong transaction cho foodID ${image.id}:`, error);
                };
            } catch (fetchError) {
                console.error(`Lỗi khi fetch ảnh cho foodID ${image.id}:`, fetchError);
            }
        }

        console.log('Hoàn tất việc cache toàn bộ hình ảnh.');
    } catch (error) {
        console.error('Lỗi khi cache toàn bộ hình ảnh:', error);
        throw error;
    }
};



export const getImageFromCache = async (foodID) => {
    try {
        const db = await openDB();
        const transaction = db.transaction(['images'], 'readonly');
        const store = transaction.objectStore('images');

        // Tìm hình ảnh trong IndexedDB
        const image = await new Promise((resolve, reject) => {
            const getRequest = store.get(foodID);
            getRequest.onsuccess = () => resolve(getRequest.result);
            getRequest.onerror = () => reject('Error getting image from IndexedDB');
        });

        if (image) {
            const blob = image.blob;
            return URL.createObjectURL(blob); // Trả về URL của hình ảnh
        } else {
            console.warn(`Không tìm thấy ảnh trong IndexedDB cho foodID ${foodID}`);
            return null;
        }
    } catch (error) {
        console.error('Lỗi khi lấy ảnh từ IndexedDB:', error);
        throw error;
    }
};

