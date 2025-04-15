import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import UserLayout from "./layouts/UserLayout";
import Login from "./pages/Login";
import Home from "./pages/Home";
import AdminLayout from "./layouts/AdminLayout";
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
              </Route>
              <Route path="/forum" element={<Forum />}>
                <Route index element={<ThreadList />} />
                <Route path="thread/:id" element={<ThreadDetail />} />
              </Route>
              <Route path="/products" element={<Product />} />
            </Route>
          </Route>

          {/* Admin Routes (accessible only to admin and staff) */}
          <Route
            path="/admin"
            element={<ProtectedRoute allowedRoles={["admin", "staff"]} />}
          >
            <Route element={<AdminLayout />}>
              <Route index element={<AdminHome />} />

              {/* Admin-only Routes */}
              <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
                <Route path="user-lists" element={<AdminUserLists />} />
                <Route path="category-lists" element={<AdminCategoryList />} />
                <Route path="product-lists" element={<AdminProductList />} />
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
