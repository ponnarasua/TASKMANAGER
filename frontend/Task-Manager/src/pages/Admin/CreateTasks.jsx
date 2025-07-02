import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import moment from 'moment';
import { LuTrash } from 'react-icons/lu';
import SelectDropdown from '../../components/Inputs/SelectDropdown';
import { PRIORITY_DATA } from './../../utils/data';
import SelectUsers from '../../components/Inputs/SelectUsers';
import TodoListInput from '../../components/Inputs/TodoListInput';
import AddAttachments from '../../components/Inputs/AddAttachments';
import Modal from '../../components/Modal';
import DeleteAlert from '../../components/DeleteAlert';

const CreateTasks = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();


  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    priority: PRIORITY_DATA[0],
    dueDate: null,
    assignedTo: [],
    todoChecklist: [],
    attachments: [],
  });

  const [currentTask, setCurrentTask] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [openDeleteAlert, setOpenDeleteAlert] = useState(false);

  const handleValueChange = (key, value) => {
    setTaskData((prev) => ({ ...prev, [key]: value }));
  };

  const clearData = () => {
    setTaskData({
      title: '',
      description: '',
      priority: PRIORITY_DATA[0],
      dueDate: null,
      assignedTo: [],
      todoChecklist: [],
      attachments: [],
    });
  };

  const createTasks = async () => {
    setLoading(true);
    try {
      const todoList = taskData.todoChecklist.map((item) => ({
        text: item,
        completed: false,
      }));

      const payload = {
        ...taskData,
        priority: taskData.priority?.value || 'Low',
        dueDate: new Date(taskData.dueDate).toISOString(),
        todoChecklist: todoList,
      };

      await axiosInstance.post(API_PATHS.TASKS.CREATE_TASK, payload);
      toast.success('Task Created Successfully');
      clearData();
    } catch (error) {
      console.error('Error in Create Task', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTask = async () => {
    setLoading(true);
    try {
      const prevTodoChecklist = currentTask?.todoChecklist || [];
      const todoList = taskData.todoChecklist.map((item) => {
        const match = prevTodoChecklist.find((t) => t.text === item);
        return {
          text: item,
          completed: match ? match.completed : false,
        };
      });

      await axiosInstance.put(API_PATHS.TASKS.UPDATE_TASK(taskId), {
        ...taskData,
        dueDate: new Date(taskData.dueDate).toISOString(),
        todoChecklist: todoList,
        priority: taskData.priority?.value || 'Low',
      });

      toast.success('Task Updated Successfully');
      navigate('/admin/tasks');
    } catch (error) {
      console.error('Error in Update Task', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    setError(null);

    if (!taskData.title.trim()) return setError('Title is required');
    if (!taskData.description.trim()) return setError('Description is required');
    if (!taskData.dueDate) return setError('Due Date is required');
    if (taskData.assignedTo?.length === 0) return setError('Assign at least one member');
    if (taskData.todoChecklist?.length === 0) return setError('Add at least one todo item');

    taskId ? updateTask() : createTasks();
  };

  const getTaskDetailsById = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.TASKS.GET_TASK_BY_ID(taskId));
      if(response.data) {
        const task = response.data;
        console.log("Fetched Task:", task);
        setCurrentTask(task);
        setTaskData({
          title: task.title,
          description: task.description,
          priority: PRIORITY_DATA.find((p) => p.value === task.priority) || PRIORITY_DATA[0],
          dueDate: task.dueDate ? moment(task.dueDate).format('YYYY-MM-DD') : null,
          assignedTo: task.assignedTo?.map((u) => u._id) || [],
          todoChecklist: task.todoChecklist?.map((i) => i.text) || [],
          attachments: task.attachments || [],
        });
      }
    } catch (error) {
      console.error('Error fetching task by ID', error);
    }
  };
  
  // Delete Task
  const deleteTask = async () => {
    try {
      await axiosInstance.delete(API_PATHS.TASKS.DELETE_TASK(taskId));
      setOpenDeleteAlert(false);
      toast.success('Expense details deleted successfully');
      navigate('/admin/tasks');
    }catch(error) {
      console.error('Error in Delete Task', error);
    }
  }

  useEffect(() => {
    if (taskId) {
      getTaskDetailsById();
    }
  }, [taskId]);  

  return (
    <DashboardLayout activeMenu="Create Task">
      <div className="mt-5">
        <div className="grid grid-cols-1 md:grid-cols-4 mt-4">
          <div className="form-card col-span-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-medium">
                {taskId ? 'Update Task' : 'Create Task'}
              </h2>
              {taskId && (
                <button
                  className="flex items-center gap-1.5 text-[13px] font-medium text-rose-500 bg-rose-50 rounded px-2 py-1 border border-rose-100 hover:border-rose-300 cursor-pointer"
                  onClick={() => setOpenDeleteAlert(true)}
                >
                  <LuTrash className="text-base" /> Delete
                </button>
              )}
            </div>

            <div className="mt-4">
              <label className="text-xs font-medium text-slate-600">Task Title</label>
              <input
                className="form-input"
                placeholder="Create App UI"
                value={taskData.title}
                onChange={({ target }) => handleValueChange('title', target.value)}
              />
            </div>

            <div className="mt-3">
              <label className="text-xs font-medium text-slate-600">Description</label>
              <textarea
                className="form-input"
                rows={4}
                placeholder="Description"
                value={taskData.description}
                onChange={({ target }) => handleValueChange('description', target.value)}
              />
            </div>

            <div className="grid grid-cols-12 gap-4 mt-2">
              <div className="col-span-6 md:col-span-4">
                <label className="text-xs font-medium text-slate-600">Priority</label>
                <SelectDropdown
                  options={PRIORITY_DATA}
                  value={taskData.priority}
                  onChange={(value) => handleValueChange('priority', value)}
                />
              </div>

              <div className="col-span-6 md:col-span-4">
                <label className="text-xs font-medium text-slate-600">Due Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={taskData.dueDate || ''}
                  onChange={({ target }) => handleValueChange('dueDate', target.value)}
                />
              </div>

              <div className="col-span-12 md:col-span-3">
                <label className="text-xs font-medium text-slate-600">Assigned To</label>
                <SelectUsers
                  selectedUsers={taskData.assignedTo}
                  setSelectedUsers={(value) => handleValueChange('assignedTo', value)}
                />
              </div>
            </div>

            <div className="mt-3">
              <label className="text-xs font-medium text-slate-600">TODO Checklist</label>
              <TodoListInput
                todoList={taskData.todoChecklist}
                setTodoList={(value) => handleValueChange('todoChecklist', value)}
              />
            </div>

            <div className="mt-3">
              <label className="text-xs font-medium text-slate-600">Add Attachments</label>
              <AddAttachments
                attachments={taskData.attachments}
                setAttachments={(value) => handleValueChange('attachments', value)}
              />
            </div>

            {error && <p className="text-xs text-red-500 mt-5">{error}</p>}

            <div className="flex justify-end mt-7">
              <button className="add-btn" onClick={handleSubmit} disabled={loading}>
                {taskId ? 'UPDATE TASK' : 'CREATE TASK'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <Modal 
        isOpen={openDeleteAlert}
        onClose={() => setOpenDeleteAlert(false)}
        title="Delete Task"
        >
          <DeleteAlert
            content = "Are you sure you want to delete this task?"
            onDelete = {() => deleteTask()}
          />
        </Modal>

    </DashboardLayout>
  );
};

export default CreateTasks;
