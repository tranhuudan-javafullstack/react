import { List, Tabs } from 'antd';
import React, { useEffect, useState } from "react";
import BarChartBox from "../../components/barChartBox/barChartBox.jsx";
import ChartBox from "../../components/chartBox/chartBox.jsx";
import ChartBoxTotal from "../../components/chartBox/chartBoxTotal.jsx";
import PieChartBox from "../../components/pieChartBox/pieChartBox.jsx";
import TopBox from "../../components/topBox/topBox";
import { useDashboardQuery } from '../../hooks/useQueries.js';
import "./home.scss";

const getRandomColor = () =>
    '#' + Array.from({ length: 6 }, () => Math.floor(Math.random() * 16).toString(16)).join('');



const Home = () => {
    const { data: dashboardData } = useDashboardQuery('get-dashboard');

    const [dashboardState, setDashboardState] = useState({
        totalArticle: {},
        totalCategory: {},
        totalComment: {},
        totalSlideBanner: {},
        totalView: {},
        totalTags: {},
        totalArticle3: {},
        totalProviders: {},
        totalArticle2: {},
        totalArticleCategory: { title: '', chartData: [] },
        processedComments: [],
        articleHot: [],
        articleConcern: [],
        articleLatest: [],
        totalAds: []
    });

    useEffect(() => {
        if (dashboardData) {
            const {
                totalCommentLatest,
                totalArticle,
                totalComment,
                totalCategory,
                totalView,
                totalSlideBanner,
                totalTags,
                totalArticle3,
                totalProviders,
                totalArticle2,
                totalArticleByCategory,
                articleHot,
                articleLatest,
                articleConcern,
                totalAds
            } = dashboardData;

            setDashboardState({
                processedComments: totalCommentLatest || [],
                totalArticleCategory: {
                    title: "Các bài viết theo thể loại",
                    chartData: (totalArticleByCategory || []).map(item => ({ ...item, color: getRandomColor() }))
                },
                totalArticle: transformChartData("Tổng bài viết", totalArticle, '#/article/manage'),
                totalComment: transformChartData("Tổng bình luận", totalComment, '#/article/manage'),
                totalView: transformTotalData("Tổng lượt xem", totalView, '#/article/manage'),
                totalSlideBanner: transformTotalData("Tổng slide banner", totalSlideBanner, '#/article/manage'),
                totalTags: transformTotalData("Tổng tags", totalTags, '#/article/manage'),
                totalArticle3: transformTotalData("Tổng bai viết đã xóa", totalArticle3, '#/article/manage'),
                totalProviders: transformTotalData("Tổng nhà cung cấp quảng cáo", totalProviders, '#/article/manage'),
                totalArticle2: transformTotalData("Tổng bài viết", totalArticle2, '#/article/manage'),
                totalCategory: transformTotalData("Tổng thể loại", totalCategory, '#/config/web'),
                articleHot: (articleHot || []).map(item => ({
                    articleId: item.articleId,
                    author: item.author,
                    thumbnail: item.thumbnailBase64,
                    href: '#/article/' + item.articleId,
                    categoryName: item.category.categoryName,
                    title: item.title,
                    view: item.views,
                })),
                articleConcern: (articleConcern || []).map(item => ({
                    articleId: item.articleId,
                    author: item.author,
                    thumbnail: item.thumbnailBase64,
                    href: '#/article/' + item.articleId,
                    categoryName: item.category.categoryName,
                    title: item.title,
                    countComments: item.countComments
                })),
                articleLatest: (articleLatest || []).map(item => ({
                    articleId: item.articleId,
                    author: item.author,
                    thumbnail: item.thumbnailBase64,
                    href: '#/article/' + item.articleId,
                    categoryName: item.category.categoryName,
                    title: item.title,
                    createdAt: item.createdAt
                })),
                totalAds: totalAds || []
            });
        }
    }, [dashboardData]);

    const transformChartData = (title, data, direct) => ({
        title,
        number: data?.number || 0,
        percentage: data?.percentage || 0,
        chartData: data?.data || [],
        direct
    });

    const transformTotalData = (title, number, direct) => ({
        title,
        number: number || 0,
        direct
    });

    return (
        <div className="home">
            {[
                { key: 'totalArticle2', className: 'box box13' },
                { key: 'totalTags', className: 'box box14' },
                { key: 'totalProviders', className: 'box box15' },
                { key: 'totalSlideBanner', className: 'box box16' },
                { key: 'totalProviders', className: 'box box17' },
                { key: 'totalArticle3', className: 'box box18' },
            ].map(({ key, className }) => (
                <div key={key} className={className}>
                    <ChartBoxTotal {...dashboardState[key]} />
                </div>
            ))}
            {[
                { key: 'totalArticle', className: 'box box1' },
            ].map(({ key, className }) => (
                <div key={key} className={className}>
                    <ChartBox {...dashboardState[key]} />
                </div>
            ))}
            {[
                { key: 'totalCategory', className: 'box box5' },
                { key: 'totalView', className: 'box box3' },
            ].map(({ key, className }) => (
                <div key={key} className={className}>
                    <ChartBoxTotal {...dashboardState[key]} />
                </div>
            ))}
            {[
                { key: 'totalComment', className: 'box box2' },
            ].map(({ key, className }) => (
                <div key={key} className={className}>
                    <ChartBox {...dashboardState[key]} />
                </div>
            ))}
            <div className="box box9">
                <BarChartBox data={dashboardState.totalAds} />
            </div>
            <div className="box box10">
                <PieChartBox
                    title={dashboardState.totalArticleCategory.title}
                    chartData={dashboardState.totalArticleCategory.chartData}
                />
            </div>
            <div className="box box11">
                <TopBox comments={dashboardState.processedComments} />
            </div>
            <div className="box box12">
                <Tabs
                    type="card"
                    items={[
                        {
                            label: 'Nóng nhất',
                            key: 'hot',
                            children: (
                                <List
                                    itemLayout="vertical"
                                    size="small"
                                    dataSource={dashboardState.articleHot}
                                    renderItem={(item) => (
                                        <List.Item
                                            key={item.articleId}
                                            extra={
                                                <a href={item.href}>
                                                    <img
                                                        width={200}
                                                        alt="logo"
                                                        src={item.thumbnail}
                                                    /></a>
                                            }
                                        >
                                            <div className="data">
                                                <div className="author">
                                                    Tác giả:
                                                    <span>   {item.author}</span>
                                                </div>
                                                <div className="category">
                                                    Thể loại:
                                                    <span> {item.categoryName}</span></div>
                                                <div className="tag"></div>
                                                <div className="title">
                                                    Tiêu đề:
                                                    <span> {item.title}</span></div>
                                                <div className="view">
                                                    Số lượt xem:
                                                    <span> {item.view}</span></div>
                                            </div>
                                        </List.Item>
                                    )}
                                />
                            )
                        },
                        {
                            label: 'Quan tâm nhất',
                            key: 'concern',
                            children: (
                                <List
                                    itemLayout="vertical"
                                    size="small"
                                    dataSource={dashboardState.articleConcern}
                                    renderItem={(item) => (
                                        <List.Item
                                            key={item.articleId}
                                            extra={
                                                <a href={item.href}><img
                                                    width={200}
                                                    alt="logo"
                                                    src={item.thumbnail}
                                                /></a>
                                            }
                                        >
                                            <div className="data">
                                                <div className="author">
                                                    Tác giả:
                                                    <span>   {item.author}</span>
                                                </div>
                                                <div className="category">
                                                    Thể loại:
                                                    <span> {item.categoryName}</span></div>
                                                <div className="tag"></div>
                                                <div className="title">
                                                    Tiêu đề:
                                                    <span> {item.title}</span></div>
                                                <div className="countComments">
                                                    Lượt bình luận:
                                                    <span> {item.countComments}</span></div>
                                            </div>
                                        </List.Item>
                                    )}
                                />
                            )
                        },
                        {
                            label: 'Mới nhất',
                            key: 'latest',
                            children: (
                                <List
                                    itemLayout="vertical"
                                    size="small"
                                    dataSource={dashboardState.articleLatest}
                                    renderItem={(item) => (
                                        <List.Item
                                            key={item.articleId}
                                            extra={
                                                <a href={item.href}><img
                                                    width={200}
                                                    alt="logo"
                                                    src={item.thumbnail}
                                                /></a>
                                            }
                                        >
                                            <div className="data">
                                                <div className="author">
                                                    Tác giả:
                                                    <span>   {item.author}</span>
                                                </div>
                                                <div className="category">
                                                    Thể loại:
                                                    <span> {item.categoryName}</span></div>
                                                <div className="tag"></div>
                                                <div className="title">
                                                    Tiêu đề:
                                                    <span> {item.title}</span></div>
                                                <div className="createdAt">
                                                    Ngày tạo: <span>{new Date(item.createdAt).toLocaleString()}
                                                    </span>  </div>
                                            </div>
                                        </List.Item>
                                    )}
                                />
                            )
                        }
                    ]}
                />

            </div>
        </div>
    );
}

export default Home;