import { Link } from "react-router-dom"
import "./menu.scss"
import ChartIcon from '../../assets/chart.svg';
import Post2Icon from '../../assets/post2.svg';
import OrderIcon from '../../assets/order.svg';
import HomeIcon from '../../assets/home.svg';
import ElementIcon from '../../assets/element.svg';

const menuData = [
  {
    id: 1,
    title: "Chính",
    listItems: [
      {
        id: 1,
        title: "Thống kê ",
        url: "/dashboard",
        icon: ChartIcon,
      },
    ],
  },
  {
    id: 4,
    title: "Quản lý",
    listItems: [
      {
        id: 1,
        title: "Bài viết",
        url: "/article/manage",
        icon: Post2Icon,
      },
      {
        id: 2,
        title: "Quảng cáo",
        url: "/ads/manage",
        icon: OrderIcon,
      },
    ],
  },
  {
    id: 2,
    title: "Cấu hình",
    listItems: [
      {
        id: 1,
        title: "Home",
        url: "/config/home",
        icon: HomeIcon,
      },
      {
        id: 2,
        title: "Web",
        url: "/config/web",
        icon: ElementIcon,
      },
    ],
  },
  {
    id: 5,
    title: "Thùng rác",
    listItems: [
      {
        id: 1,
        title: "Bài viết đã xóa",
        url: "/trash/article-deleted",
        icon: Post2Icon,
      },
    ],
  }
];
const Menu = () => {


  return (
    <div className="menu">

      {menuData.map((item) => (

        <div className="item" key={item.id}>
          <span className="title">
            {item.title}
          </span>

          {item.listItems.map((listItem) => (
            <Link to={listItem.url} className="listItem" key={listItem.id}>
              <img src={listItem.icon} alt="" />
              <span className="listItemTitle">
                {listItem.title}
              </span>
            </Link>
          ))}
        </div>

      ))}

    </div>
  )
}

export default Menu