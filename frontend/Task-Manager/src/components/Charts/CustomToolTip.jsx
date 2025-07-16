import React from 'react'

const CustomToolTip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className='bg-white shadow-md rounded-lg p-2 border border-gray-300'>
        <p className='text-xs font-semibold text-purple-800 mb-1'>{payload[0].name}</p>
        <p className='text-sm text-gray-600'>
          Count : <span className='text-sm font-medium text-gray-900'>{payload[0].value}</span>
        </p>
      </div>
    )
  }
  return null
}

export default CustomToolTip
