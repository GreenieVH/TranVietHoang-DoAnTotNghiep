import React from 'react'
import AdminHeader from '../components/layout/Admin/AdminHeader'
import AdminNavbar from '../components/layout/Admin/AdminNavbar'
import { Outlet } from 'react-router-dom'

function AdminLayout() {
  return (
    <div className='max-w-[1536px] w-screen mx-auto'>
      <AdminHeader/>
      <div className='flex'>
        <AdminNavbar/>
        <Outlet/>
      </div>
    </div>
  )
}

export default AdminLayout
