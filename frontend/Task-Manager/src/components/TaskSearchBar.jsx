import React, { useState, useCallback, useEffect, useRef } from 'react';
import { LuSearch, LuX, LuFilter, LuCalendar, LuUser, LuFlag, LuLoader } from 'react-icons/lu';

const TaskSearchBar = ({ 
  onSearch, 
  onClear,
  placeholder = "Search tasks...",
  showFilters = true,
  users = [],
  isLoading = false,
  className = ""
}) => {
  const [query, setQuery] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    assignee: '',
    dueDateFrom: '',
    dueDateTo: ''
  });
  
  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  // Debounced search
  const debouncedSearch = useCallback((searchQuery, searchFilters) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      onSearch(searchQuery, searchFilters);
    }, 300);
  }, [onSearch]);

  // Trigger search on query or filter change
  useEffect(() => {
    const hasQuery = query.trim().length > 0;
    const hasFilters = Object.values(filters).some(v => v !== '');
    
    if (hasQuery || hasFilters) {
      debouncedSearch(query, filters);
    }
    
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, filters, debouncedSearch]);

  const handleClear = () => {
    setQuery('');
    setFilters({
      status: '',
      priority: '',
      assignee: '',
      dueDateFrom: '',
      dueDateTo: ''
    });
    setShowAdvanced(false);
    onClear?.();
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== '');
  const hasActiveSearch = query.trim().length > 0 || hasActiveFilters;

  return (
    <div className={`relative ${className}`}>
      {/* Main Search Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
            {isLoading ? (
              <LuLoader className="w-5 h-5 animate-spin" />
            ) : (
              <LuSearch className="w-5 h-5" />
            )}
          </div>
          
          <input
            ref={searchRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-10 pr-10 py-2.5 text-sm border border-gray-200 dark:border-gray-700 
                       rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                       placeholder-gray-400 dark:placeholder-gray-500
                       focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
                       transition-all duration-200"
          />
          
          {hasActiveSearch && (
            <button
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 
                         dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
            >
              <LuX className="w-4 h-4" />
            </button>
          )}
        </div>

        {showFilters && (
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg border
                       transition-all duration-200 ${
              showAdvanced || hasActiveFilters
                ? 'bg-primary text-white border-primary'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-gray-300'
            }`}
          >
            <LuFilter className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
            {hasActiveFilters && (
              <span className="flex items-center justify-center w-5 h-5 text-xs bg-white text-primary rounded-full">
                {Object.values(filters).filter(v => v !== '').length}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Advanced Filters Panel */}
      {showAdvanced && showFilters && (
        <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-white dark:bg-gray-800 
                       border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Status Filter */}
            <div>
              <label className="flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                <LuFlag className="w-3.5 h-3.5" />
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 
                           rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white
                           focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                <LuFlag className="w-3.5 h-3.5" />
                Priority
              </label>
              <select
                value={filters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 
                           rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white
                           focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">All Priorities</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            {/* Assignee Filter */}
            {users.length > 0 && (
              <div>
                <label className="flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                  <LuUser className="w-3.5 h-3.5" />
                  Assignee
                </label>
                <select
                  value={filters.assignee}
                  onChange={(e) => handleFilterChange('assignee', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 
                             rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white
                             focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">All Assignees</option>
                  {users.map(user => (
                    <option key={user._id} value={user._id}>{user.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Due Date From */}
            <div>
              <label className="flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                <LuCalendar className="w-3.5 h-3.5" />
                Due From
              </label>
              <input
                type="date"
                value={filters.dueDateFrom}
                onChange={(e) => handleFilterChange('dueDateFrom', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 
                           rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white
                           focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            {/* Due Date To */}
            <div>
              <label className="flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                <LuCalendar className="w-3.5 h-3.5" />
                Due To
              </label>
              <input
                type="date"
                value={filters.dueDateTo}
                onChange={(e) => handleFilterChange('dueDateTo', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 
                           rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white
                           focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <button
                onClick={handleClear}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 
                           hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskSearchBar;
