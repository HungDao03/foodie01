import './App.css';
import { Route, Routes } from 'react-router';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThemeProvider, CssBaseline } from '@mui/material';

import Homepage from './pages/home/index.jsx';
import FoodCardList from './pages/User/index.jsx';
import OrderHistory from './pages/User/history/index.jsx';
import CartPage from './pages/User/cart/index.jsx';
import Account from './pages/Account/index.jsx';
import OAuth2Success from './pages/OAuth2Success/index.jsx';
import Unauthorized from './pages/User/Unauthorized/index.jsx';
import AdminPage from './pages/Admin/Dashboard/index.jsx';
import VerifySuccessPage from './pages/Verify/VerifySuccess/index.jsx';
import VerifyAccount from './pages/Verify/VerifyAccount/index.jsx';
import MainUser from './components/layout/user/Main/index.jsx';
import MainAdmin from './components/layout/admin/Main/index.jsx';
import useThemeStore from "./components/store/dark-light.jsx";
import UserManagementPage from "./pages/Admin/User/index.jsx";
import FoodItems from "./pages/Admin/FoodItems/index.jsx";
import CategoriesManager from "./pages/Admin/Categories/index.jsx";
import OrderManagement from "./pages/Admin/Oder/index.jsx";
import Favorites from "./pages/User/Favorites/index.jsx";
import ChatPage from "./pages/User/chat/index.jsx";
import AdminChatPage from "./pages/Admin/chat/index.jsx";

function App() {
    const { currentTheme, isDarkMode } = useThemeStore();

    return (
        <ThemeProvider theme={currentTheme}>
            <CssBaseline />
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme={isDarkMode ? 'dark' : 'light'} // Đồng bộ với theme
            />
            <Routes>
                <Route path="unauthorized" element={<Unauthorized />} />
                <Route path="/oauth2-success" element={<OAuth2Success />} />
                <Route path="/verify-success" element={<VerifySuccessPage />} />
                <Route path="/verify-account" element={<VerifyAccount />} />
                <Route path="" element={<Homepage />} />
                <Route path="/user" element={<MainUser />}>
                    <Route path="" element={<FoodCardList />} />
                    <Route path="account" element={<Account />} />
                    <Route path="history" element={<OrderHistory />} />
                    <Route path="cart" element={<CartPage />} />
                    <Route path="Favorites" element={<Favorites />} />
                    <Route path="chat" element={<ChatPage />} />
                </Route>
                <Route path="/admin" element={<MainAdmin />}>
                    <Route path="" element={<AdminPage />} />
                    <Route path="account" element={<Account />} />
                    <Route path="users" element={<UserManagementPage/> } />
                    <Route path="fooditems" element={<FoodItems />} />
                    <Route path="categories" element={<CategoriesManager  />} />
                    <Route path="orders" element={ <OrderManagement  />} />
                    <Route path="chat" element={<AdminChatPage />} />
                </Route>
            </Routes>
        </ThemeProvider>
    );
}

export default App;