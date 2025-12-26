import React, { useState } from 'react'
import { HiMiniPlus, HiOutlineTrash} from 'react-icons/hi2';
import { LuPaperclip } from 'react-icons/lu';

const AddAttachments = ({attachments, setAttachments}) => {
    const [option, setOption] = useState("");

    // Function to handle adding an option
    const handleAddOption = () => {
        if(option.trim()){
            setAttachments([...attachments, option.trim()]);
            setOption("");
        }
    };

    // Function to handle deleting an option
    const handleDeleteOption = (index) => {
        const updatedArr = attachments.filter((_, idx) => idx !== index);
        setAttachments(updatedArr);
    };

  return (
    <div>
        {attachments.map((item, index) => (
                <div 
                    key={item} 
                    className='flex justify-between bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 px-3 py-2 rounded-md mb-3 mt-2'>
                    <div className='flex-1 flex items-center gap-2 border border-gray-100 dark:border-gray-700'>
                        <LuPaperclip className='text-gray-400'/>
                        <p className='text-xs text-gray-900 dark:text-white'>{item}</p>
                    </div>

                    <button 
                        className='cursor-pointer' 
                        onClick={() => {handleDeleteOption(index)}}>
                        <HiOutlineTrash className='text-lg text-red-500'/>
                    </button>
                </div>
            ))
        }

        <div className='flex items-center gap-5 mt-4'>
            <div className='flexs-1 flex items-center gap-3 border border-gray-100 dark:border-gray-700 rounded-md px-3 bg-white dark:bg-gray-800'>
                <LuPaperclip className='text-gray-400'/>

                <input
                    type='text'
                    placeholder='Add File Link'
                    value={option}
                    onChange={({target}) => setOption(target.value)}
                    className='w-full text-[13px] text-gray-900 dark:text-white outline-none bg-white dark:bg-gray-800 py-2 placeholder:text-gray-500 dark:placeholder:text-gray-400'
                />
            </div>

            <button className='card-btn text-nowrap' onClick={handleAddOption}>
                <HiMiniPlus className='text-lg'/> Add
            </button>
        </div>
    </div>
  )
}

export default AddAttachments