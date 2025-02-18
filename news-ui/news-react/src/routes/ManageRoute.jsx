import { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute.jsx';
import { Result, Button } from 'antd';
import Layout from '../Layout.jsx';
import ProtectedRouteLogin from './ProtectedRouteLogin.jsx';

const Home = lazy(() => import('../pages/home/Home.jsx'));
const LoginOwner = lazy(() => import('../pages/login/Login.jsx'));
const WebConfig = lazy(() => import('../pages/webcondfig/WebConfig.jsx'));
const HomeConfig = lazy(() => import('../pages/homeconfig/HomeConfig.jsx'));
const AdsManage = lazy(() => import('../pages/adsmanage/AdsManage.jsx'));
const ArticleManage = lazy(() => import('../pages/articlemanage/ArticleManage.jsx'));
const ArticleEdit = lazy(() => import('../pages/articlemanage/articleedit/ArticleEdit.jsx'));
const ArticleCreate = lazy(() => import('../pages/articlemanage/articlecreate/ArticleCreate.jsx'));
const AdsPositionManage = lazy(() => import('../pages/adsmanage/adspositionmanage/AdsPositionManage.jsx'));
const ArticleDeleted = lazy(() => import('../pages/articlemanage/articledeleted/ArticleDeleted.jsx'));
const ArticleDetail = lazy(() => import('../pages/articlemanage/articledetail//ArticleDetail.jsx'));
const Router = () => (
    <Routes>
        <Route path='/' element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="dashboard" element={<Home />} />
            <Route path="config/web" element={<WebConfig />} />
            <Route path="config/home" element={<HomeConfig />} />
            <Route path="ads/manage" element={<AdsManage />} />
            <Route path="article/manage" element={<ArticleManage />} />
            <Route path="article/create" element={<ArticleCreate />} />
            <Route path="article/:id/edit" element={<ArticleEdit />} />
            <Route path="article/:id" element={<ArticleDetail />} />
            <Route path="ads/position/:positionId" element={<AdsPositionManage />} />
            <Route path="trash/article-deleted" element={<ArticleDeleted />} />
        </Route>
        <Route path="/login" element={<ProtectedRouteLogin><LoginOwner /></ProtectedRouteLogin>} />
        <Route path="*" element={
            <Result
                status="404"
                title="404"
                subTitle="Sorry, the page you visited does not exist."
                extra={<Button type="primary" onClick={() => window.location.href = '/'}>Back Home</Button>}
            />
        } />
    </Routes>
);

export default Router;
