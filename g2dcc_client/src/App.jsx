import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import UserLayout from "./layouts/User/UserLayout";
import Login from "./pages/Login";
import Home from "./pages/Home";
import AdminLayout from "./layouts/Admin/AdminLayout";
import AdminHome from "./pages/Admin/AdminHome";
import AdminUserLists from "./pages/Admin/AdminUserLists";
import Profile from "./pages/Profile";
import ScrollToTop from "./components/common/ScrollToTop";
import Forum from "./pages/Forum";
import ThreadList from "./components/features/Thread/ThreadList";
import ThreadDetail from "./components/features/Thread/ThreadDetail";
import ProfileInfo from "./components/features/Profile/ProfileInfo";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "./components/common/ProtectedRoute";
import Product from "./pages/Product";
import AdminCategoryList from "./pages/Admin/AdminCategoryList";
import AdminProductList from "./pages/Admin/AdminProductList";
import ProductDetailPage from "./pages/ProductDetail";
import AdminBrandList from "./pages/Admin/AdminBrandList";
import CartPage from "./pages/Cart";
import WishlistPage from "./pages/Wishlist";
// Import order components
import OrderList from "./pages/OrderList";
import OrderDetail from "./components/features/Order/OrderDetail";
import OrderForm from "./components/features/Order/OrderForm";
// Import admin order components
import AdminOrderList from "./pages/Admin/AdminOrderList";
import AdminOrderShipment from "./components/features/Admin/AdminOrderShipment";
import AdminBannerList from "./pages/Admin/AdminBannerList";
import OrderHistory from "./components/features/Order/OrderHistory";
import AdminPromotionList from "./pages/Admin/AdminPromotionList";
import Promotions from "./pages/Promotions";
import AdminStaffList from "./pages/Admin/AdminStaffList";
import Dashboard from "./components/features/Admin/Dashboard";
import OrderStatistics from "./components/features/Admin/OrderStatistics";
import AdminInventoryLogs from "./pages/Admin/AdminInventoryLogs";
import AdminOrderLogs from "./pages/Admin/AdminOrderLogs";

function App() {
  return (
    <>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />

          {/* User Routes (accessible to all authenticated users) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<UserLayout />}>
              <Route index element={<Home />} />
              <Route path="/profile" element={<Profile />}>
                <Route index element={<ProfileInfo />} />
                <Route path="order-history" element={<OrderHistory />} />
                <Route path="wishlist" element={<WishlistPage />} />
                <Route path="orders" element={<OrderList />} />
              </Route>
              <Route path="/forum" element={<Forum />}>
                <Route index element={<ThreadList />} />
                <Route path="thread/:id" element={<ThreadDetail />} />
              </Route>
              <Route path="/promotions" element={<Promotions />} />
              <Route path="/products" element={<Product />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
              <Route path="/cart" element={<CartPage />} />
              {/* Order Routes */}
              <Route path="/orders/new" element={<OrderForm />} />
              <Route path="/orders/:id" element={<OrderDetail />} />
            </Route>
          </Route>

          {/* Admin Routes (accessible only to admin and staff) */}
          <Route
            path="/admin"
            element={<ProtectedRoute allowedRoles={["admin", "staff"]} />}
          >
            <Route element={<AdminLayout />}>
              <Route index element={<AdminHome />} />
              <Route path="product-lists" element={<AdminProductList />} />
              <Route path="category-lists" element={<AdminCategoryList />} />
              <Route path="brand-lists" element={<AdminBrandList />} />
              <Route path="banner-lists" element={<AdminBannerList />} />
              <Route path="orders" element={<AdminOrderList />} />
              <Route path="orders/:id" element={<OrderDetail />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="order-statistics" element={<OrderStatistics />} />
              <Route path="inventory-logs" element={<AdminInventoryLogs />} />
              <Route path="order-logs" element={<AdminOrderLogs />} />
              <Route
                path="orders/:id/shipment"
                element={<AdminOrderShipment />}
              />
              <Route path="promotion-lists" element={<AdminPromotionList />} />
              {/* Admin-only Routes */}
              <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
                <Route path="user-lists" element={<AdminUserLists />} />
                <Route path="staff-lists" element={<AdminStaffList />} />
              </Route>
            </Route>
          </Route>

          {/* 404 Page (optional) */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
