import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { ConfigProvider } from 'antd';
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000,
      cacheTime: 15 * 60 * 1000,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      retry: 0,
      refetchOnMount: true,
      retryDelay: attempt => Math.min(attempt > 1 ? 2 ** attempt * 1000 : 1000, 30 * 1000),
    },
    mutations: {
      retry: 1, // Số lần retry khi mutation thất bại
      retryDelay: attempt => Math.min(1000 * 2 ** attempt, 30000),
    },
  },
});
createRoot(document.getElementById('root')).render(
  <QueryClientProvider client={queryClient}>
    <ConfigProvider theme={{ hashed: false }}>
      <App />
    </ConfigProvider>
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>
)
