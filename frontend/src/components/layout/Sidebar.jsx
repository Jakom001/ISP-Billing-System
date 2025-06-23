import React, { useRef, useEffect } from 'react';
import { MonitorCheck, FolderOpenDot, CalendarClock, Users, BookOpen, ChartBarStacked, LogOut } from 'lucide-react';
import { useAuthContext } from '../../context/AuthContext';
import { NavLink } from 'react-router-dom';

const Sidebar = ({ isOpen, closeSidebar }) => {
  const { logout, isAuthenticated, isAdmin } = useAuthContext();
  const sidebarRef = useRef(null);

  const handleLinkClick = () => {
    if (window.innerWidth < 768) {
      closeSidebar(false); // close sidebar on small screens
    }
  };
  // Detect clicks outside the sidebar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        closeSidebar();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, closeSidebar]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout Failed");
    }
  };

  return (
    <>
    
      {isOpen && (
        <div className="fixed inset-0 backdrop-blur-[2px] bg-white/30 z-20 md:hidden" />
      )}
      {isAuthenticated && (
        <div
        ref={sidebarRef}
        className={`fixed md:sticky left-0 top-[80px] h-[calc(100vh-80px)] bg-white pt-2 border-r border-gray-200 z-30 transition-all duration-300 ${isOpen ? 'w-64' : 'w-0 md:w-64'} overflow-hidden`}
      >
        {/* Navigation links section */}
        
        <div className="flex-1 px-6 overflow-y-auto custom-scrollbar">

          <NavLink to="/dashboard" onClick={handleLinkClick} className={({isActive}) => 
            `mt-4 flex items-center gap-2 py-2 px-2 rounded-xl hover:bg-grayColor whitespace-nowrap ${isActive ? 'bg-primary hover:bg-secondary text-white' : ''}`
          }>
            <MonitorCheck size={20} /> <span>Dashboard</span>
          </NavLink>

          {isAdmin && (
            <NavLink to="/admin" onClick={handleLinkClick} className={({isActive}) => 
            `mt-4 flex items-center gap-2 py-2 px-2 rounded-xl hover:bg-grayColor whitespace-nowrap ${isActive ? 'bg-primary hover:bg-secondary text-white' : ''}`
          }>
            <MonitorCheck size={20} /> <span>Admin Dashboard</span>
          </NavLink>
          
          )}    

          <div className="my-4 border-b border-gray-300 w-full"></div>

          <NavLink to="/enterprises" onClick={handleLinkClick} className={({isActive}) => 
            `my-2 flex items-center gap-2 py-2 px-2 rounded-xl hover:bg-grayColor whitespace-nowrap ${isActive ? 'bg-primary hover:bg-secondary text-white' : ''}`
          }>
            <CalendarClock size={20} /> <span>Enterprises</span>
          </NavLink>

          <NavLink to="/participants" onClick={handleLinkClick} className={({isActive}) => 
            `my-2 flex items-center gap-2 py-2 px-2 rounded-xl hover:bg-grayColor whitespace-nowrap ${isActive ? 'bg-primary hover:bg-secondary text-white' : ''}`
          }>
            <Users size={20} /> <span>Particepants</span>
          </NavLink>

          <NavLink to="/sessions" onClick={handleLinkClick} className={({isActive}) => 
            `my-2 flex items-center gap-2 py-2 px-2 rounded-xl hover:bg-grayColor whitespace-nowrap ${isActive ? 'bg-primary hover:bg-secondary text-white' : ''}`
          }>
            <BookOpen size={20} /> <span>Business Coaching</span>
          </NavLink>

          

          


        </div>
      
        
      </div>
    )}

      
    </>
  );
};

export default Sidebar