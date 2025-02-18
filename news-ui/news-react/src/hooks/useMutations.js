import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAxiosSetup } from './useAxiosInterceptors.js';
const createApiConfig = (axiosInstance) => ({
    get: async (url) => {
        const response = await axiosInstance.get(url);
        return response.data.data;
    },
    post: async (url, payload, config = {}) => {
        const response = await axiosInstance.post(url, payload, config);
        return response.data;
    }
});
const createMutationHook = (configFactory) => (action) => {
    const axiosInstance = useAxiosSetup();
    const queryClient = useQueryClient();
    const mutationConfig = configFactory(createApiConfig(axiosInstance), queryClient);

    const config = mutationConfig[action];

    if (!config) {
        throw new Error(`Invalid action type: ${action}`);
    }

    return useMutation(config);
};

const homeConfigMutationConfig = (api, queryClient) => ({
    'upload-slide-banner': {
        mutationFn: (payload) => api.post(
            `api/owner/content-marketing/slide-banners/upload?fileExtension=${payload.fileExtension}&urlDirection=${payload.urlDirection}`,
            payload.binaryData,
            { headers: { 'Content-Type': 'application/octet-stream' } }
        ),
        onSuccess: () => queryClient.invalidateQueries(['slide-banners'])
    },
    'update-slide-banner': {
        mutationFn: (payload) => api.post(
            `api/owner/content-marketing/slide-banners/update?fileExtension=${payload.fileExtension}&urlDirection=${payload.urlDirection}&name=${payload.name}`,
            payload.binaryData,
            { headers: { 'Content-Type': 'application/octet-stream' } }
        ),
        onSuccess: () => queryClient.invalidateQueries(['slide-banners'])
    },
    'delete-slide-banner': {
        mutationFn: (payload) => api.post('api/owner/content-marketing/slide-banners/delete', payload),
        onSuccess: () => queryClient.invalidateQueries(['slide-banners'])
    },
    'set-status-slide-banner': {
        mutationFn: (payload) => api.post('api/owner/content-marketing/slide-banners/status', payload),
        onSuccess: () => queryClient.invalidateQueries(['slide-banners'])
    },
    'swap-slide-banner': {
        mutationFn: (payload) => api.post('api/owner/content-marketing/slide-banners/swap', payload),
        onSuccess: () => queryClient.invalidateQueries(['slide-banners'])
    },
    'swap-article-groups': {
        mutationFn: (payload) => api.post('api/owner/content-marketing/article-groups/swap', payload),
        onSuccess: () => queryClient.invalidateQueries(['article-groups'])
    },
    'save-home-config': {
        mutationFn: (payload) => api.post('api/owner/content-marketing/slide-banners/delete', payload),
        onSuccess: () => queryClient.invalidateQueries(['home-config'])
    },
    'article-groups-save': {
        mutationFn: (payload) => api.post('api/owner/content-marketing/article-groups', payload),
        onSuccess: () => queryClient.invalidateQueries(['article-groups'])
    },
    'article-groups-delete': {
        mutationFn: (payload) => api.post('api/owner/content-marketing/article-groups/delete', payload),
        onSuccess: () => queryClient.invalidateQueries(['article-groups'])
    },
    'save-ads': {
        mutationFn: (payload) => api.post('api/owner/content-marketing/home-config/save-ads', payload),
        onSuccess: () => queryClient.invalidateQueries(['home-ads'])
    },
});

const adsMutationConfig = (api, queryClient) => ({
    'save': {
        mutationFn: (payload) => api.post('api/owner/content-marketing/ads', payload),
        onSuccess: () => queryClient.invalidateQueries(['ads'])
    },
    'delete': {
        mutationFn: (payload) => api.post('api/owner/content-marketing/ads/delete', payload),
        onSuccess: () => queryClient.invalidateQueries(['ads'])
    },
});

const articleMutationConfig = (api, queryClient) => ({
    'create': {
        mutationFn: (payload) => api.post('api/owner/content-marketing/articles/create', payload),
        onSuccess: () => queryClient.invalidateQueries(['articles'])
    },
    'update': {
        mutationFn: (payload) => api.post('api/owner/content-marketing/articles/update', payload),
        onSuccess: () => queryClient.invalidateQueries(['articles'])
    },
    'published': {
        mutationFn: (payload) => api.post('api/owner/content-marketing/articles/published', payload),
        onSuccess: () => queryClient.invalidateQueries(['articles'])
    },
    'delete': {
        mutationFn: (payload) => api.post('api/owner/content-marketing/articles/delete', payload),
        onSuccess: () => queryClient.invalidateQueries(['articles'])
    }, 'delete-permanently': {
        mutationFn: (payload) => api.post('api/owner/content-marketing/articles/delete-permanently', payload),
        onSuccess: () => queryClient.invalidateQueries(['articles'])
    },
    'restore': {
        mutationFn: (payload) => api.post('api/owner/content-marketing/articles/restore', payload),
        onSuccess: () => queryClient.invalidateQueries(['articles'])
    },
    'comments-delete': {
        mutationFn: (payload) => api.post('api/owner/content-marketing/comments/delete', payload),
        onSuccess: () => queryClient.invalidateQueries(['comments'])
    },
    'comments-update': {
        mutationFn: (payload) => api.post('api/owner/content-marketing/comments/update', payload),
        onSuccess: () => queryClient.invalidateQueries(['comments'])
    },
    'comments-add': {
        mutationFn: (payload) => api.post('api/owner/content-marketing/comments', payload),
        onSuccess: () => queryClient.invalidateQueries(['comments'])
    },
    'save-ads': {
        mutationFn: (payload) => api.post('api/owner/content-marketing/articles-ads', payload),
        onSuccess: () => queryClient.invalidateQueries(['articles'])
    }
});

const webConfigMutationConfig = (api, queryClient) => ({
    'save-layout-theme': {
        mutationFn: (payload) => api.post('api/owner/content-marketing/web-config/layout-theme', payload),
        onSuccess: () => queryClient.invalidateQueries(['web-config'])
    },
    'save-category': {
        mutationFn: (payload) => api.post('api/owner/content-marketing/web-config/category', payload),
        onSuccess: () => queryClient.invalidateQueries(['web-config'])
    },
    'save-footer': {
        mutationFn: (payload) => api.post('api/owner/content-marketing/web-config/footer', payload),
        onSuccess: () => queryClient.invalidateQueries(['web-config'])
    },
});


export const useHomeConfigMutation = createMutationHook(homeConfigMutationConfig);
export const useAdsMutation = createMutationHook(adsMutationConfig);
export const useArticleMutation = createMutationHook(articleMutationConfig);
export const useWebConfigMutation = createMutationHook(webConfigMutationConfig);