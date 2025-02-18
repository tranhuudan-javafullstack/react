import { useQuery } from '@tanstack/react-query';
import { useAxiosSetup } from './useAxiosInterceptors.js';

const createQueryConfig = (axiosInstance) => ({
    get: async (url) => {
        const response = await axiosInstance.get(url);
        return response.data.data;
    }
});

const createQueryHook = (configFactory) => (action, params) => {
    const axiosInstance = useAxiosSetup();
    const queryConfig = configFactory(createQueryConfig(axiosInstance));

    const config = queryConfig[action]?.(params);

    if (!config) {
        throw new Error(`Invalid action type: ${action}`);
    }

    return useQuery(config);
};

const adsQueryConfig = (api) => ({
    'get-all': () => ({
        queryKey: ['ads'],
        queryFn: () => api.get('api/owner/content-marketing/ads')
    }),
    'get-all-positions': () => ({
        queryKey: ['ads-positions'],
        queryFn: () => api.get('api/owner/content-marketing/ads/positions')
    }),
    'get-all-providers': () => ({
        queryKey: ['ads-providers'],
        queryFn: () => api.get('api/owner/content-marketing/ads/providers')
    }),
    'get-ads-by-id': ({ positionId, adsId }) => ({
        queryKey: ['ads', positionId, adsId],
        queryFn: () => api.get(`api/owner/content-marketing/ads-positions/by-id?positionId=${positionId}&adsId=${adsId}`),
        enabled: !!adsId && !!positionId
    }),
    'get-ads-position': ({ positionId }) => ({
        queryKey: ['ads-position', positionId],
        queryFn: () => api.get(`api/owner/content-marketing/ads-positions?positionId=${positionId}`),
        enabled: !!positionId
    })
});

const articleQueryConfig = (api) => ({
    'get-by-id': ({ articleId }) => ({
        queryKey: ['article', articleId],
        queryFn: () => api.get(`api/owner/content-marketing/articles/by-id?articleId=${articleId}`),
        enabled: !!articleId
    }),
    'get-by-adsId': ({ adsId }) => ({
        queryKey: ['article', adsId],
        queryFn: () => api.get(`api/owner/content-marketing/articles/adsId?adsId=${adsId}`),
        enabled: !!adsId
    }),
    'get-all-tags': () => ({
        queryKey: ['article-tags'],
        queryFn: () => api.get('api/owner/content-marketing/articles-tags'),
    }),
    'get-by-category': ({ categoryId, enabled }) => ({
        queryKey: ['article', categoryId],
        queryFn: () => api.get(`api/owner/content-marketing/articles/by-category?categoryId=${categoryId}`),
        enabled: enabled
    }),
    'get-all-overview': () => ({
        queryKey: ['articles'],
        queryFn: () => api.get('api/owner/content-marketing/articles')
    }),
    'get-all-overview2': ({ enabled }) => ({
        queryKey: ['articles'],
        queryFn: () => api.get('api/owner/content-marketing/articles'),
        enabled: enabled
    }),
    'get-all-articles-deleted': () => ({
        queryKey: ['articles-deleted'],
        queryFn: () => api.get('api/owner/content-marketing/articles-deleted')
    }),
    'get-all-comments': ({ articleId }) => ({
        queryKey: ['comments', articleId],
        queryFn: () => api.get(`api/owner/content-marketing/articles/comments?articleId=${articleId}`),
        enabled: !!articleId
    }),
    'get-all-comments-by-parent': ({ articleId, commentParentId }) => ({
        queryKey: ['comments', articleId, commentParentId],
        queryFn: () => api.get(`api/owner/content-marketing/comments/by-parent?articleId=${articleId}&commentParentId=${commentParentId}`),
        enabled: !!commentParentId && !!articleId
    })
});

const homeConfigQueryConfig = (api) => ({
    'get-slide-banner-data': ({ name }) => ({
        queryKey: ['slide-banners', name],
        queryFn: () => api.get(`api/owner/content-marketing/slide-banners?name=${name}`),
        enabled: !!name
    }),
    'get-slide-banner-by-name': ({ name, count }) => ({
        queryKey: ['slide-banners', name, count],
        queryFn: () => api.get(`api/owner/content-marketing/slide-banners/by-name?name=${name}`),
        enabled: !!name && !!count
    }),
    'get-home-config': () => ({
        queryKey: ['home-config'],
        queryFn: () => api.get('api/owner/content-marketing/home-config')
    }),
    'article-groups-get': () => ({
        queryKey: ['article-groups'],
        queryFn: () => api.get('api/owner/content-marketing/article-groups')
    }),
    'article-group-get': ({ articleGroupId, enabled }) => ({
        queryKey: ['article-groups', articleGroupId],
        queryFn: () => api.get(`api/owner/content-marketing/article-groups/by-id?articleGroupId=${articleGroupId}`),
        enabled: enabled
    })
});

const webConfigQueryConfig = (api) => ({
    'get-web-config': () => ({
        queryKey: ['web-config'],
        queryFn: () => api.get('api/owner/content-marketing/web-config')
    }),
    'get-categories': () => ({
        queryKey: ['categories'],
        queryFn: () => api.get('api/owner/content-marketing/categories')
    }),
    'get-categories2': ({ enabled }) => ({
        queryKey: ['categories2'],
        queryFn: () => api.get('api/owner/content-marketing/categories'),
        enabled: enabled,
    })
});
const dashboardQueryConfig = (api) => ({
    'get-dashboard': () => ({
        queryKey: ['dashboard'],
        queryFn: () => api.get('api/owner/content-marketing/dashboard'),
    }),
});

export const useAdsQuery = createQueryHook(adsQueryConfig);
export const useArticleQuery = createQueryHook(articleQueryConfig);
export const useHomeConfigQuery = createQueryHook(homeConfigQueryConfig);
export const useWebConfigQuery = createQueryHook(webConfigQueryConfig);
export const useDashboardQuery = createQueryHook(dashboardQueryConfig);