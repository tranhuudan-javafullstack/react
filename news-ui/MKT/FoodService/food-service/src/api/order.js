import { API_DOMAIN_LOCAL } from '../component/domain';
import API from './index';


export const fetchOrders = () => API.post(API_DOMAIN_LOCAL+'api/fandb/running/kitchen-staff/query-order', {});
export const createOrder = (data) => API.post(API_DOMAIN_LOCAL+'api/fandb/running/waiter/order/create', data);