import { API_DOMAIN_LOCAL } from '../component/domain';
import API from './index';

export const fetchOrderDetails = (receiptID) => API.post(API_DOMAIN_LOCAL + 'api/fandb/running/query-receipt-detail', { receiptID });
export const updateServiceCharge = (data) => API.post(API_DOMAIN_LOCAL+'api/fandb/running/waiter/service-charge/update', data);
export const createServiceCharge = (data) => API.post(API_DOMAIN_LOCAL+'api/fandb/running/waiter/service-charge/create', data);
export const deteteServiceCharge = (id) => API.post(API_DOMAIN_LOCAL+'api/fandb/running/waiter/service-charge/delete', id);
export const fetchExternalBills = () => API.post(API_DOMAIN_LOCAL+'api/fandb/owner/setup-receipt/get-external-bill');