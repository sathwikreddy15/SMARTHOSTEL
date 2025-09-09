import React, { useEffect, useState } from 'react'
import './Admin.css'
import Navbar from '../Navbar/Navbar'
import Sidebar from '../Sidebar/Sidebar'
import { Outlet } from 'react-router-dom'
import Login from '../LoginAndRegister/LoginAndRegister'
const Admin = () => {
  let [classe,setclasse]=useState('admin-main')
  return (
    <div className='admin'>
      <Login fun={setclasse}/>
      <Navbar />
      <div className={classe}>
      <Sidebar />
      <Outlet />
      </div>
    </div>
  )
}

export default Admin