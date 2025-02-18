import {
  createHashRouter,
  Outlet,
  RouterProvider
} from "react-router-dom";
import './App.css';
import Footer from './components/footer/Footer.jsx';
import Menu from './components/menu/Menu.jsx';
import Navbar from './components/navbar/Navbar.jsx';
import Home from "./pages/home/Home.jsx";
import Login from './pages/login/Login.jsx';
import "./styles/global.scss";
import Sidebar from "./components/sidebar/Sidebar.jsx";
function App() {

  const Layout = () => {

    return (
      <div className="main">
        <Navbar />
        <div className="container">
          <div className="menuContainer">
            <Menu />
          </div>
          <div className="contentContainer">
            <Outlet />
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const router = createHashRouter([

    {
      path: "/",
      element: <Layout />,
      children: [
        {
          path: "home",
          element: <Home />
        }
      ]
    },
    {
      path: "/login",
      element: <Login />
    },
    {
      path: "/sidebar-test",
      element: <Sidebar />
    }
  ]);
  return (
    <RouterProvider router={router} />
  )
}

export default App
