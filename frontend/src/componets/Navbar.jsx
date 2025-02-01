import React, { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { fetchCurrentUser, logout } from '../api/authApi'

const Navbar = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { user } = await fetchCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setCurrentUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div>
      <nav className='flex justify-between py-4'>
        <div className="logo">
          <Link to="/"> 
            <span>BarakaLink</span>
          </Link>
        </div>
        <ul className='flex justify-between'>
          <li><NavLink className="p-4" to="/">Dashboard</NavLink></li>
         
          
          {currentUser ? (
            <>
              <li><NavLink className="p-4" to="/users">Users</NavLink></li>
              <li><NavLink className="p-4" to="/packages">Packages</NavLink></li>
              <li><NavLink className="p-4" to="/payments">Payments</NavLink></li>
              <li>Welcome, {currentUser.firstName}</li>
              <li><button onClick={handleLogout}>Log out</button></li>
            </>
          ) : (
            <>
              <li><Link  className="p-4" to="/login">Log in</Link></li>
              <li><Link  className="p-4" to="/register">Sign up</Link></li>
            </>
          )}
        </ul>
      </nav>
    </div>
  )
}

export default Navbar