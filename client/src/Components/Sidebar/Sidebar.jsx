import React from 'react'
import './Sidebar.css'
import {NavLink} from 'react-router-dom'
import add_achievement_logo from '../../assets/add_achievement_logo.png'
import all_achievement_logo from '../../assets/all_achievement_logo.png'
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
      <NavLink to='givecomplaint' className='nav-link'>
        <div className='sidebar-item'>
          <img src={all_achievement_logo} className='sidebar-logo'  alt="" /> 
          Complaints & Feedback
        </div>
      </NavLink>
      <NavLink to='leavreq' className='nav-link'>
        <div className='sidebar-item'>
          <img src={all_achievement_logo} className='sidebar-logo'  alt="" /> 
          leave Request
        </div>
      </NavLink>
      <NavLink to='selectroom' className='nav-link'>
        <div className='sidebar-item'>
          <img src={all_achievement_logo} className='sidebar-logo'  alt="" /> 
          Select Room
        </div>
      </NavLink>
      
    </div>
  )
}

export default Sidebar