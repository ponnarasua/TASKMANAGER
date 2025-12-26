import React, { useContext, useEffect, useState } from 'react'
import { UserContext } from '../../context/userContext';
import { useNavigate } from 'react-router-dom';
import { SIDE_MENU_DATA, SIDE_MENU_USER_DATA } from '../../utils/data';
import User from '../../assets/images/User.png';

const SideMenu = ({activeMenu}) => {
  const { user } = useContext(UserContext);
  const [sideMenuData, setSideMenuData] = useState([]);

  const navigate = useNavigate();

  const handleClick = (route) => {
    navigate(route);
  }

  useEffect(() => {
    if(user) {
      setSideMenuData(user.role === 'admin' ? SIDE_MENU_DATA :SIDE_MENU_USER_DATA);
    }
    return () => {};
  },[user]);
  
  return (
    <div className='w-64 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col'>
      {/* User Profile Section */}
      <div className='flex flex-col items-center py-6 px-4 border-b border-gray-100 dark:border-gray-800'>
        <div className='relative'>
          <img 
            src={user?.profileImageUrl ? (user.profileImageUrl.startsWith('http') ? user.profileImageUrl : `${import.meta.env.VITE_UPLOAD || ''}${user.profileImageUrl}`) : User}
            alt='Profile Image'
            className='w-16 h-16 rounded-full object-cover border-2 border-gray-100 dark:border-gray-700'
          />
          {user?.role == "admin" && (
            <div className='absolute -bottom-1 left-1/2 -translate-x-1/2 text-[9px] font-semibold text-white bg-primary px-2 py-0.5 rounded-full whitespace-nowrap'>
              Admin
            </div>
          )}
        </div>

        <h5 className='text-gray-900 dark:text-white font-medium text-sm mt-4 text-center'>
          {user?.name || ""}
        </h5>

        <p className='text-[11px] text-gray-500 dark:text-gray-400 truncate max-w-full'>{user?.email || ""}</p>
      </div>
      
      {/* Menu Items */}
      <nav className='flex-1 px-3 py-4 overflow-y-auto'>
        <ul className='space-y-1'>
          {sideMenuData.map((item, index) => (
            <li key={`menu_${index}`}>
              <button 
                className={`w-full flex items-center gap-3 text-[13px] font-medium rounded-lg px-3 py-2.5 transition-colors duration-150 ${
                  activeMenu == item.label 
                    ? 'text-primary bg-primary/10 dark:bg-primary/20' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                  } cursor-pointer`}
                onClick={() => handleClick(item.path)}
              >
                <item.icon className={`text-lg flex-shrink-0 ${
                  activeMenu == item.label ? 'text-primary' : 'text-gray-400 dark:text-gray-500'
                }`} />
                <span className='truncate'>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

export default SideMenu