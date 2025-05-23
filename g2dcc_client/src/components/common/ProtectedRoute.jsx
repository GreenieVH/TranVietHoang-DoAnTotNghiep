import { Navigate, Outlet } from "react-router-dom";

export const ProtectedRoute = ({ allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem("user_detail"));

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    alert("Bạn không có quyền truy cập vào trang này");
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
