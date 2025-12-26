import React from 'react'
import { LuChevronDown } from 'react-icons/lu'

const PriorityFilter = ({ selectedPriority, onPriorityChange, sortOrder, onSortOrderChange }) => {
  const priorityOptions = [
    { label: "All Priorities", value: "All" },
    { label: "High", value: "High" },
    { label: "Medium", value: "Medium" },
    { label: "Low", value: "Low" }
  ];

  const sortOptions = [
    { label: "Priority: High to Low", value: "desc" },
    { label: "Priority: Low to High", value: "asc" },
    { label: "Date: Newest First", value: "newest" },
    { label: "Date: Oldest First", value: "oldest" }
  ];

  return (
    <div className='flex flex-col sm:flex-row gap-3'>
      {/* Priority Filter Dropdown */}
      <div className='relative'>
        <select
          value={selectedPriority}
          onChange={(e) => onPriorityChange(e.target.value)}
          className='appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary cursor-pointer'
        >
          {priorityOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <LuChevronDown className='absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none' size={16} />
      </div>

      {/* Sort Order Dropdown */}
      <div className='relative'>
        <select
          value={sortOrder}
          onChange={(e) => onSortOrderChange(e.target.value)}
          className='appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary cursor-pointer'
        >
          {sortOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <LuChevronDown className='absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none' size={16} />
      </div>
    </div>
  )
}

export default PriorityFilter