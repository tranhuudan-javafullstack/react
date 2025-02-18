import { API_DOMAIN_LOCAL } from '../component/domain';
import API from './index';



export const updateCategory = (data) => API.post(API_DOMAIN_LOCAL+'api/fandb/owner/setup-menu/category/update', data);
export const deleteCategory = (data) => API.post(API_DOMAIN_LOCAL+'api/fandb/owner/setup-menu/category/delete', data);
export const createCategory = (data) => API.post(API_DOMAIN_LOCAL+'api/fandb/owner/setup-menu/category/create', data);
export const addFoodToCategory = (data) => API.post(API_DOMAIN_LOCAL+'api/fandb/owner/setup-menu/food-link-category/create', data);
export const deleteFoodFromCategory = (data) => API.post(API_DOMAIN_LOCAL+'api/fandb/owner/setup-menu/food-link-category/delete', data);