import React from 'react'
import User from '../../assets/images/User.png'

// Simple status colors for stat cards (without borders for cleaner look)
const getStatColor = (status) => {
    switch(status) {
        case "In Progress":
            return "text-cyan-500 bg-cyan-50/50 dark:bg-cyan-900/20";
        case "Completed":
            return "text-lime-500 bg-lime-50/50 dark:bg-lime-900/20";
        default:
            return "text-violet-500 bg-violet-50/50 dark:bg-violet-900/20";
    }
};

const UserCard = ({userInfo}) => {

  return (
    <div className='user-card p-2'>
        <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
                <img 
                    src={userInfo?.profileImageUrl || User}
                    className='w-12 h-12 rounded-full border border-white dark:border-gray-700'
                />
                
                <div>
                    <p className='text-sm font-medium text-gray-900 dark:text-white'>{userInfo?.name}</p>
                    <p className='text-xs text-gray-500 dark:text-gray-400'>{userInfo?.email}</p>
                </div>
            </div>
        </div>
        
        <div className='flex items-end gap-3 mt-5'>
            <StatCard 
                label = "Pending"
                count = {userInfo?.pendingTasks || 0 }
                status = "Pending"
                />
            <StatCard 
                label = "In Progress"
                count = {userInfo?.inProgressTasks || 0 }
                status = "In Progress"
                />
            <StatCard 
                label = "Completed"
                count = {userInfo?.completedTasks || 0 }
                status = "Completed"
                />

        </div>
    </div>
  )
}

export default UserCard ; 

const StatCard = ({label, count, status}) => {
    return (
        <div className={`flex-1 text-[10px] font-medium ${getStatColor(status)} px-4 py-0.5 rounded`}>
            <span className='text-[12px] font-semibold'>{count}</span><br/>{label}
        </div>
    )
};