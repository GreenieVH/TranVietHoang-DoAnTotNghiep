import React from "react";
import { useNavigate } from "react-router-dom";
import Dashboard from "../../components/features/Admin/Dashboard";

function AdminHome() {
  const navigate = useNavigate()
  return (
    <div className="w-4/5 p-10 relative">
      <button className="outline-1 px-2 py-1" onClick={()=>navigate("/")}>Main</button>
      <Dashboard/>
    </div>
  );
}

export default AdminHome;
