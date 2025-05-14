import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import AdminHeader from './AdminHeader'
import AdminNavbar from './AdminNavbar'

function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);  

  const handleMenuCollapse = (value) => {
    setCollapsed(value);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AdminHeader 
        collapsed={collapsed}
        onMenuCollapse={handleMenuCollapse} 
      />
      <div className="flex flex-1">
        <AdminNavbar collapsed={collapsed} />
        <main className="flex-1 bg-gray-100 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
