import React from 'react'

const AvatarGroup = ({avatars, maxVisible = 3}) => {
  // Filter out empty/null/undefined avatar URLs
  const validAvatars = avatars.filter(avatar => avatar && avatar.trim() !== '');
  
  return (
    <div className='flex items-center'>
        {validAvatars.slice(0, maxVisible).map((avatar, index) => (
            <img
                key={index}
                src={avatar}
                alt={`Avatar ${index}`}
                className='w-9 h-9 rounded-full border-2 border-white dark:border-gray-800 -ml-3 first:ml-0 object-cover'
            />
        ))}
        {/* Show placeholder for users without profile images */}
        {avatars.length > validAvatars.length && validAvatars.length < maxVisible && (
            Array.from({ length: Math.min(avatars.length - validAvatars.length, maxVisible - validAvatars.length) }).map((_, index) => (
                <div
                    key={`placeholder-${index}`}
                    className='w-9 h-9 flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-300 text-sm font-medium rounded-full border-2 border-white dark:border-gray-800 -ml-3 first:ml-0'
                >
                    ?
                </div>
            ))
        )}
        {avatars.length > maxVisible && (
            <div className='w-9 h-9 flex items-center justify-center bg-blue-50 dark:bg-blue-900/30 text-sm font-medium rounded-full border-2 border-white dark:border-gray-800 -ml-3'>
                +{avatars.length - maxVisible}
            </div>
        )}
    </div>
  )
}

export default AvatarGroup