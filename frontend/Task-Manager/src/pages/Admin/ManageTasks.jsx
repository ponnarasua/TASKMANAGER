import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { LuFileSpreadsheet } from 'react-icons/lu';
import TaskStatusTabs from '../../components/TaskStatusTabs';
import TaskCard from '../../components/Cards/TaskCard';
import PriorityFilter from '../../components/PriorityFilter';
import toast from 'react-hot-toast';

const ManageTasks = () => {
  const [allTasks, setAllTasks] = useState([]);
  const [tabs, setTabs] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState("desc");
  const [filteredAndSortedTasks, setFilteredAndSortedTasks] = useState([]);

  const navigate = useNavigate();

  const getAllTasks = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.TASKS.GET_ALL_TASKS, {
        params: {
          status: filterStatus === "All" ? "" : filterStatus,
        },
      });
      setAllTasks(response.data?.tasks || []);

      const statusSummary = response.data?.statusSummary || [];

      const statusArray = [
        { label: "All", count: statusSummary.all || 0 },
        { label: "Pending", count: statusSummary.pendingTasks || 0 },
        { label: "In Progress", count: statusSummary.inProgressTasks || 0 },
        { label: "Completed", count: statusSummary.completedTasks || 0 },
      ];

      setTabs(statusArray);
    } catch (error) {
      console.error("Error fetching tasks", error);
    }
  };

  const handleClick = (taskData) => {
    navigate(`/admin/create-tasks/${taskData._id}`);
  };

  // Filter and sort tasks based on priority and sort order
  const filterAndSortTasks = () => {
    let filtered = [...allTasks];

    // Filter by priority
    if (priorityFilter !== "All") {
      filtered = filtered.filter(task => task.priority === priorityFilter);
    }

    // Sort tasks
    filtered.sort((a, b) => {
      switch (sortOrder) {
        case "desc":
          // High > Medium > Low
          const priorityOrder = { "High": 3, "Medium": 2, "Low": 1 };
          return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
        case "asc":
          // Low > Medium > High
          const priorityOrderAsc = { "High": 1, "Medium": 2, "Low": 3 };
          return (priorityOrderAsc[b.priority] || 0) - (priorityOrderAsc[a.priority] || 0);
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        default:
          return 0;
      }
    });

    setFilteredAndSortedTasks(filtered);
  };

  // download task report
  const handleDownloadReport = async () => {
    try{
      const response = await axiosInstance.get(API_PATHS.REPORTS.EXPORT_TASKS, {
        responseType: 'blob',
      });

      // Create a URl for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'task_details.xlsx');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error in Download expensive details", error);
      toast.error("Error in Download expense details. Please try again.");
    }
  };

  useEffect(() => {
    getAllTasks();
  }, [filterStatus]);

  useEffect(() => {
    filterAndSortTasks();
  }, [allTasks, priorityFilter, sortOrder]);

  return (
    <DashboardLayout activeMenu="Manage Tasks">
      <div className="my-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between">
          <div className="flex items-center justify-between gap-5">
            <h2 className="text-xl font-medium">Manage Tasks</h2>
          </div>

          <div className="flex items-center gap-3">
            {tabs && tabs.length > 0 && (
              <TaskStatusTabs
                tabs={tabs}
                activeTab={filterStatus}
                setActiveTab={setFilterStatus}
              />
            )}
            <button className="hidden lg:flex download-btn" onClick={() => handleDownloadReport()}>
              <LuFileSpreadsheet className="text-lg" />
              Download Report
            </button>
          </div>
        </div>

        {/* Priority Filter and Sort */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Filter & Sort:</span>
            <PriorityFilter
              selectedPriority={priorityFilter}
              onPriorityChange={setPriorityFilter}
              sortOrder={sortOrder}
              onSortOrderChange={setSortOrder}
            />
          </div>
          <div className="text-sm text-gray-500">
            Showing {filteredAndSortedTasks.length} of {allTasks.length} tasks
          </div>
        </div>

        <div className="mt-4">
          {filteredAndSortedTasks && filteredAndSortedTasks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {filteredAndSortedTasks.map((item) => (
                <TaskCard
                key={item._id}
                title={item.title}
                description={item.description}
                priority={item.priority}
                status={item.status}
                progress={item.progress}
                createdAt={item.createdAt}
                dueDate={item.dueDate}
                assignedTo={item.assignedTo?.map((user) => user.profileImageUrl)}
                attachmentCount={item.attachments?.length || 0}
                completedTodoCount={item.completedCount || 0}
                todoChecklist={item.todoChecklist || []}
                onClick={() => handleClick(item)}          
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="bg-gray-50 rounded-full p-6 mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No {filterStatus === 'All' ? '' : filterStatus.toLowerCase()} tasks found
              </h3>
              <p className="text-gray-500 max-w-md">
                {filterStatus === 'All' 
                  ? "No tasks have been created yet. Start by creating your first task to get organized!"
                  : `No ${filterStatus.toLowerCase()} tasks found. Try switching to a different filter or create new tasks.`
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ManageTasks;
