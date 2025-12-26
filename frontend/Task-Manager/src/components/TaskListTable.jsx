import React from 'react';
import moment from 'moment';
import { LuBellRing } from 'react-icons/lu';

const TaskListTable = ({ tableData }) => {
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800';
      case 'Pending':
        return 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800';
      case 'In Progress':
        return 'bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700';
    }
  };

  const getPriorityBadgeColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800';
      case 'Medium':
        return 'bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800';
      case 'Low':
        return 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700';
    }
  };

  return (
    <div className='overflow-x-auto p-0 rounded-lg mt-3'>
      <table className='min-w-full'>
        <thead>
          <tr className='text-left'>
            <th className='py-3 px-4 text-gray-800 dark:text-gray-200 font-medium text-[13px]'>Name</th>
            <th className='py-3 px-4 text-gray-800 dark:text-gray-200 font-medium text-[13px]'>Status</th>
            <th className='py-3 px-4 text-gray-800 dark:text-gray-200 font-medium text-[13px]'>Priority</th>
            <th className='py-3 px-4 text-gray-800 dark:text-gray-200 font-medium text-[13px] hidden md:table-cell'>Created On</th>
            <th className='py-3 px-4 text-gray-800 dark:text-gray-200 font-medium text-[13px] hidden sm:table-cell'>
              <span className='sr-only'>Reminder</span>
            </th>
          </tr>
        </thead>

        {tableData.length === 0 ? (
          <tbody>
            <tr>
              <td colSpan="5" className="text-center text-gray-500 dark:text-gray-400 py-6">
                No tasks available.
              </td>
            </tr>
          </tbody>
        ) : (
          <tbody>
            {tableData.map((task, index) => (
              <tr key={task._id || index} className='border-t border-gray-200 dark:border-gray-700'>
                <td className='my-3 mx-4 text-gray-700 dark:text-gray-300 text-[13px] line-clamp-1 overflow-hidden'>
                  {task.title}
                </td>
                <td className='py-4 px-4'>
                  <span className={`px-2 py-1 text-xs rounded inline-block ${getStatusBadgeColor(task.status)}`}>
                    {task.status}
                  </span>
                </td>
                <td className='py-4 px-4'>
                  <span className={`px-2 py-1 text-xs rounded inline-block ${getPriorityBadgeColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </td>
                <td className='py-4 px-4 text-gray-700 dark:text-gray-300 text-[13px] text-nowrap hidden md:table-cell'>
                  {task.createdAt ? moment(task.createdAt).format('Do MM YYYY') : 'N/A'}
                </td>
                <td className='py-4 px-4 hidden sm:table-cell'>
                  {task.reminderSent && (
                    <span className='flex items-center gap-1 text-amber-600 dark:text-amber-400' title={`Reminder sent${task.reminderSentAt ? ` on ${moment(task.reminderSentAt).format('Do MMM YYYY, h:mm A')}` : ''}`}>
                      <LuBellRing className='text-base' />
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        )}
      </table>
    </div>
  );
};

export default TaskListTable;
