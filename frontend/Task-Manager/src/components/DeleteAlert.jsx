import React from 'react'

const DeleteAlert = ({content, onDelete}) => {
  return (
    <div >
        <p className='text-sm text-gray-700 dark:text-gray-300'>{content}</p>
        <div className='flex justify-end mt-6'>
            <button 
                type ="button"
                className='flex items-center justify-center gap-1.5 text-xs md:text-sm font-medium text-rose-500 whitespace-nowrap bg-rose-50 dark:bg-rose-900/30 border border-rose-100 dark:border-rose-800 rounded-lg px-4 py-2 cursor-pointer hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors'
                onClick={onDelete}
                >
                    Delete
                </button>
        </div>
    </div>
  )
}

export default DeleteAlert