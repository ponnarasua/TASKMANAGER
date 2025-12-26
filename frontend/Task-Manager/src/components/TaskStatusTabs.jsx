import React from 'react'

const TaskStatusTabs = ({tabs, activeTab, setActiveTab}) => {
  return (
    <div className='my-2'>
        <div className='flex'>
            {tabs.map((tab) => (
                <button
                    key={tab.label}
                    className={`relative px-3 md:px-4 py-2 text-sm font-medium ${
                        activeTab === tab.label
                        ? 'text-primary'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    } cursor-pointer`}
                    onClick={() => setActiveTab(tab.label)}
                >
                  <span className='text-xs'>{tab.label}</span>
                  {activeTab === tab.label && (
                    <div className='absolute bottom-0 left-0 w-full h-0.5 bg-primary'></div>
                  )}
                </button>
            ))}
        </div>
    </div>
  )
}

export default TaskStatusTabs