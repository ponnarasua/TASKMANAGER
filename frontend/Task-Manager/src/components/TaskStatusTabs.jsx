import React from 'react'

const TaskStatusTabs = ({ tabs, activeTab, setActiveTab }) => {
  // Keyboard navigation for tabs
  const handleKeyDown = (e, idx) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      setActiveTab(tabs[(idx + 1) % tabs.length].label);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setActiveTab(tabs[(idx - 1 + tabs.length) % tabs.length].label);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setActiveTab(tabs[idx].label);
    }
  };
  return (
    <div className='my-2'>
      <div className='flex' role='tablist' aria-label='Task status tabs'>
        {tabs.map((tab, idx) => (
          <button
            key={tab.label}
            className={`relative px-3 md:px-4 py-2 text-sm font-medium ${
              activeTab === tab.label
                ? 'text-primary'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            } cursor-pointer`}
            onClick={() => setActiveTab(tab.label)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            role='tab'
            aria-selected={activeTab === tab.label}
            tabIndex={activeTab === tab.label ? 0 : -1}
          >
            <span className='text-xs'>{tab.label}</span>
            {activeTab === tab.label && (
              <div className='absolute bottom-0 left-0 w-full h-0.5 bg-primary'></div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TaskStatusTabs