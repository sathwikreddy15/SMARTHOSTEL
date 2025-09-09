import React from 'react'
import './Sidebar.css'
import {NavLink} from 'react-router-dom'
import add_achievement_logo from '../../assets/add_achievement_logo.png'
// import all_achievement_logo from '../../assets/all_achievement_logo.png'
import request_achievement_logo from '../../assets/request_achievement.png'
import home_icon from '../../assets/home_logo.png'
const Sidebar = () => {
  return (
    <div className='sidebar'>
      <NavLink to='' className='nav-link'>
        <div className='sidebar-item'>
          <img src={home_icon} className='sidebar-logo' alt="" /> 
          Home
        </div>
        </NavLink>
      <NavLink to='complaints' className='nav-link'>
        <div className='sidebar-item'>
          <img src={request_achievement_logo} className='sidebar-logo' alt="" /> 
          Complaints
        </div>
        </NavLink>
        <NavLink to='leaveApproval' className='nav-link'>
        <div className='sidebar-item'>
          <img src={request_achievement_logo} className='sidebar-logo' alt="" /> 
          Leave Approvals
        </div>
        </NavLink>
        <NavLink to='logs' className='nav-link'>
        <div className='sidebar-item'>
          <img src={request_achievement_logo} className='sidebar-logo' alt="" /> 
          Logs
        </div>
        </NavLink>
      
    </div>
  )
}

export default Sidebar