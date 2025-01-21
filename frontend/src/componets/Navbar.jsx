import React from 'react'
import { NavLink } from 'react-router-dom'

const Navbar = () => {
  return (
    <div>
        <nav className='flex justify-between  py-4 '>
          <div className="logo">
            <NavLink to="/"> 
            {/* <img src="logo.png" alt="Logo" /> */}
            <span>BarakaLink</span>
            </NavLink>
            
          </div>
          <ul className='flex justify-between'>
            <li><NavLink className="p-4" to="/">Dashboard</NavLink></li>
            <li><NavLink className="p-4" to="/users">Users</NavLink></li>
            <li><NavLink className="p-4" to="/packages">Packages</NavLink></li>
            <li><NavLink className="p-4" to="/payments">Payments</NavLink></li>
            <li></li>
            
          </ul>
        </nav>
    </div>
  )
}

export default Navbar