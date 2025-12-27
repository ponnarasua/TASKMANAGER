import React, { useRef } from 'react'
import Progress from '../Progress'
import AvatarGroup from '../AvatarGroup';
import { LuBellRing, LuPaperclip, LuCopy } from 'react-icons/lu';
import moment from 'moment';
import { getLabelColor, getStatusTagColor, getPriorityTagColor } from '../../utils/colors';

const TaskCard = ({
    taskId,
    title, 
    description, 
    priority, 
    status, 
    progress, 
    createdAt, 
    dueDate, 
    assignedTo, 
    attachmentCount, 
    completedTodoCount, 
    todoChecklist, 
    labels = [], 
    reminderSent, 
    onClick,
    onDuplicate,
    isAdmin = false
}) => {
    const clickCountRef = useRef(0);
    const clickTimerRef = useRef(null);

    const handleClick = (e) => {
        // If admin and onDuplicate is provided, track triple clicks
        if (isAdmin && onDuplicate) {
            clickCountRef.current += 1;

            if (clickTimerRef.current) {
                clearTimeout(clickTimerRef.current);
            }

            if (clickCountRef.current === 3) {
                e.stopPropagation();
                clickCountRef.current = 0;
                onDuplicate();
                return;
            }

            clickTimerRef.current = setTimeout(() => {
                // If not triple click, proceed with normal click after delay
                if (clickCountRef.current < 3 && clickCountRef.current > 0) {
                    onClick && onClick();
                }
                clickCountRef.current = 0;
            }, 300);
        } else {
            onClick && onClick();
        }
    };

    return (
        <div 
            className='bg-white dark:bg-gray-900 rounded-xl py-4 shadow-md shadow-gray-100 dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-800 cursor-pointer hover:shadow-lg transition-shadow relative group' 
            onClick={handleClick}
        >
            {/* Triple-click hint for admin */}
            {isAdmin && onDuplicate && (
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                        <LuCopy className="text-xs" />
                        3× click to duplicate
                    </div>
                </div>
            )}
            <div className='flex items-end gap-3 px-4'>
                <div className={`text-[11px] font-medium ${getStatusTagColor(status)} px-4 py-0.5 rounded`}>
                    {status}
                </div>
                <div className={`text-[11px] font-medium ${getPriorityTagColor(priority)} px-4 py-0.5 rounded`}>
                    {priority} Priority
                </div>
                {reminderSent && (
                    <div className='flex items-center gap-1 text-[11px] font-medium text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800' title='Due date reminder sent'>
                        <LuBellRing className='text-xs' />
                        Reminded
                    </div>
                )}
            </div>

            <div className={`px-4 border-l-[3px] ${
                status === "In Progress"
                    ? "border-cyan-500"
                    : status === "Completed"
                    ? "border-indigo-500"
                    : "border-violet-500"}`}>
                
                <p className='text-sm font-medium text-gray-800 dark:text-gray-100 mt-4 line-clamp-2'>
                    {title}
                </p>
                <p className='text-xs text-gray-500 dark:text-gray-400 mt-1.5 line-clamp-2 leading-[18px]'>
                    {description}
                </p>
                <p className='text-[13px] text-gray-700/80 dark:text-gray-300 font-medium mt-2 mb-2 leading-[18px]'>
                    Task Done:{" "}
                    <span className='font-semibold text-gray-700 dark:text-gray-200'>
                        {completedTodoCount} / {todoChecklist.length}
                    </span>
                </p>

                <Progress progress={progress} status={status} />
            </div>

            <div className='px-4'>
                <div className='flex items-center justify-between my-1'>
                    <div>
                        <label className='text-xs text-gray-500 dark:text-gray-400'>Start Date</label>
                        <p className='text-[13px] font-medium text-gray-900 dark:text-gray-100'>
                            {moment(createdAt).format("Do MMM YYYY")}
                        </p>
                    </div>
                    <div className=''>
                        <label className='text-xs text-gray-500 dark:text-gray-400'>Due Date</label>
                        <p className='text-[13px] font-medium text-gray-900 dark:text-gray-100'>
                            {moment(dueDate).format("Do MMM YYYY")}
                        </p>
                    </div>
                </div>

                <div className='flex items-center justify-between mt-3'>
                    <AvatarGroup avatars={assignedTo || []} />
                    <div className='flex items-center gap-2'>
                        {labels && labels.length > 0 && (
                            <div className='flex items-center gap-1'>
                                {labels.slice(0, 2).map((label) => {
                                    const color = getLabelColor(label);
                                    return (
                                        <span
                                            key={label}
                                            className={`text-[10px] px-1.5 py-0.5 rounded ${color.bg} ${color.text}`}
                                        >
                                            {label}
                                        </span>
                                    );
                                })}
                                {labels.length > 2 && (
                                    <span className='text-[10px] text-gray-500'>+{labels.length - 2}</span>
                                )}
                            </div>
                        )}
                        {attachmentCount > 0 && (
                            <div className='flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1.5 rounded-lg'>
                                <LuPaperclip className='text-primary'/> {" "}
                                <span className='text-xs text-gray-900 dark:text-gray-100'>{attachmentCount}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
  )
}

export default TaskCard