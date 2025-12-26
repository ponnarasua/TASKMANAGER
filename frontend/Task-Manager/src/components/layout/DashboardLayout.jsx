import React, { useContext, useState } from 'react';
import { UserContext } from '../../context/userContext';
import Navbar from './Navbar';
import SideMenu from './SideMenu';

const DashboardLayout = ({ children, activeMenu }) => {
  const { user } = useContext(UserContext);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-950'>
        <Navbar activeMenu={activeMenu} toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />

        {user && (
            <div className='flex pt-[61px]'>
                {/* Sidebar - Fixed position with smooth slide */}
                <aside 
                    className={`max-[1080px]:hidden fixed left-0 top-[61px] h-[calc(100vh-61px)] z-20 w-64 transform transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
                >
                    <SideMenu activeMenu={activeMenu} />
                </aside>
                
                {/* Main content with smooth margin transition */}
                <main className={`flex-1 min-h-[calc(100vh-61px)] transition-[margin] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                    sidebarOpen ? 'ml-64 max-[1080px]:ml-0' : 'ml-0'
                } p-6`}>
                    {children}
                </main>
            </div>
        )}
    </div>
  )
}

export default DashboardLayout