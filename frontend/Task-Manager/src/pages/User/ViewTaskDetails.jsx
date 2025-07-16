import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import axiosInstance from '../../utils/axiosInstance'
import { API_PATHS } from '../../utils/apiPaths'
import DashboardLayout from '../../components/layout/DashboardLayout'
import moment from 'moment'
import AvatarGroup from '../../components/AvatarGroup'
import { LuSquareArrowOutUpRight } from 'react-icons/lu'

const ViewTaskDetails = () => {
  const { id } = useParams()
  const [task, setTask] = useState(null)

  const getStatusTagColor = (status) => {
    switch (status) {
      case 'In Progress':
        return 'text-cyan-500 bg-cyan-50 border border-cyan-500/10'
      case 'Completed':
        return 'text-lime-500 bg-lime-50 border border-lime-500/20'
      default:
        return 'text-violet-500 bg-violet-50 border border-violet-500/10'
    }
  }

  // get Task info by ID
  const getTaskDetailsByID = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.TASKS.GET_TASK_BY_ID(id))

      if (response.data) {
        const taskInfo = response.data
        setTask(taskInfo)
      }
    } catch (error) {
      console.error('Error in getTaskDetailsByID', error)
    }
  }

  // handle todo check
  const updateTodoChecklist = async (index) => {
    const todoChecklist = [...(task?.todoChecklist || [])]
    const taskId = id
    if (todoChecklist && todoChecklist[index]) {
      todoChecklist[index].completed = !todoChecklist[index].completed

      try {
        const response = await axiosInstance.put(API_PATHS.TASKS.UPDATE_TODO_CHECKLIST(taskId), {
          todoChecklist
        })

        if (response.status === 200) {
          setTask(response.data?.task || task)
        } else {
          // optionally recert the toggle if the API call fails.
          todoChecklist[index].completed = !todoChecklist[index].completed
        }
      } catch (error) {
        todoChecklist[index].completed = !todoChecklist[index].completed
      }
    }
  }

  // Handle attechment link lick
  const handleLinkClick = (link) => {
    if (!/^https?:\/\//i.test(link)) {
      link = 'https://' + link
    }
    window.open(link, '_blank')
  }

  useEffect(() => {
    if (id) {
      getTaskDetailsByID()
    }
    return () => { }
  }, [id])
  return (
    <DashboardLayout activeMenu='My Tasks'>
      <div className='mt-5'>
        {task && (<div className='grid grid-cols-1 md:grid-cols-4 mt-4'>
          <div className='form-card col-span-3'>
            <div className='flex items-center justify-between'>
              <h2 className='text-sm md:text-2xl font-medium'>
                {task?.title}
              </h2>
              <div className={`text-[11px] md:text-[13px] font-medium ${getStatusTagColor(task?.status)} px-4 py-0.5 rounded`}>
                {task?.status}
              </div>
            </div>

            <div className='mt-4'>
              <InfoBox label='Description' value={task?.description} />
            </div>

            <div className='grid grid-cols-12 gap-4 mt-4'>
              <div className='col-span-6 md:col-span-4'>
                <InfoBox label='Priority' value={task?.priority} />
              </div>
              <div className='col-span-6 md:col-span-4'>
                <InfoBox label='Due Date' value={task?.dueDate ? moment(task?.dueDate).format('Do MMM YYYY') : 'N/A'} />
              </div>
              <div className='col-span-6 md:col-span-4'>
                <label className='text-xs font-medium text-slate-500'>
                  Assigned To
                </label>

                <AvatarGroup
                  avatars={task?.assignedTo?.map((item) => item?.profileImageUrl) || []}
                  maxVisible={5}
                />
              </div>
            </div>

            <div className='mt-2'>
              <label className='text-xs font-medium text-slate-500'>
                Todo Checklist
              </label>

              {task?.todoChecklist?.map((item, index) => (
                <TodoCheckList
                  key={`todo_${index}`}
                  text={item.text}
                  isChecked={item?.completed}
                  onChange={() => updateTodoChecklist(index)}
                />
              ))}
            </div>

            {task?.attachments?.length > 0 && (
              <div className='mt-2'>
                <label className='text-xs font-medium text-slate-500'>
                  Attachments
                </label>
                {task?.attachments?.map((link, index) => (
                  <Attachment
                    key={`link_${index}`}
                    link={link}
                    index={index}
                    onClick={() => handleLinkClick(link)} // ✅ fixed
                  />
                ))}

              </div>
            )}
          </div>
        </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default ViewTaskDetails

const InfoBox = ({ label, value }) => {
  return (
    <>
      <label className='text-xs font-medium text-slate-500'>{label}</label>
      <p className='text-[12px] md:text-[13px] text-gray-700 mt-0.5'>{value}</p>
    </>
  )
}

const TodoCheckList = ({ text, isChecked, onChange }) => {
  return (
    <>
      <div className='flex items-center gap-3 p-3'>
        <input
          type='checkbox'
          checked={isChecked}
          onChange={onChange}
          className='w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded-sm outline-none cursor-pointer'
        />
        <p className='text-[13px] text-gray-800'>{text}</p>
      </div>
    </>
  )
}

const Attachment = ({ link, index, onClick }) => {
  return (
    <div className='flex justify-between bg-gray-50 border border-gray-100 px-3 py-2 rounded-md mb-3 mt-2 cursor-pointer' onClick={onClick}>
      <div className='flex-1 flex items-center gap-3'>
        <span className='text-xs text-gray-400 font-semibold mr-2'>
          {index < 9 ? `0${index + 1}` : index + 1}
        </span>

        <p className='text-xs text-black'>{link}</p>
      </div>

      <LuSquareArrowOutUpRight className='text-gray-400' />
    </div>
  )
}
