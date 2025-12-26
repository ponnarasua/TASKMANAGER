import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../utils/axiosInstance';
import { API_PATHS } from '../utils/apiPaths';

// Query keys for cache management
export const taskKeys = {
  all: ['tasks'],
  lists: () => [...taskKeys.all, 'list'],
  list: (filters) => [...taskKeys.lists(), filters],
  details: () => [...taskKeys.all, 'detail'],
  detail: (id) => [...taskKeys.details(), id],
  dashboardStats: () => [...taskKeys.all, 'dashboard'],
};

// Fetch all tasks with optional filters and pagination
export const useTasks = (filters = {}) => {
  const { status, page = 1, limit = 20 } = filters;
  
  return useQuery({
    queryKey: taskKeys.list({ status, page, limit }),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (page) params.append('page', page);
      if (limit) params.append('limit', limit);
      
      const response = await axiosInstance.get(
        `${API_PATHS.TASKS.GET_ALL_TASKS}?${params.toString()}`
      );
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Fetch single task by ID
export const useTask = (taskId) => {
  return useQuery({
    queryKey: taskKeys.detail(taskId),
    queryFn: async () => {
      const response = await axiosInstance.get(API_PATHS.TASKS.GET_TASK_BY_ID(taskId));
      return response.data;
    },
    enabled: !!taskId, // Only fetch if taskId exists
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

// Fetch dashboard stats
export const useDashboardStats = () => {
  return useQuery({
    queryKey: taskKeys.dashboardStats(),
    queryFn: async () => {
      const response = await axiosInstance.get(API_PATHS.TASKS.GET_DASHBOARD_DATA);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Create task mutation
export const useCreateTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (taskData) => {
      const response = await axiosInstance.post(API_PATHS.TASKS.CREATE_TASK, taskData);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate all task lists to refetch
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      queryClient.invalidateQueries({ queryKey: taskKeys.dashboardStats() });
    },
  });
};

// Update task mutation
export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ taskId, taskData }) => {
      const response = await axiosInstance.put(
        API_PATHS.TASKS.UPDATE_TASK(taskId),
        taskData
      );
      return response.data;
    },
    onSuccess: (data, { taskId }) => {
      // Update the specific task in cache
      queryClient.setQueryData(taskKeys.detail(taskId), data);
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      queryClient.invalidateQueries({ queryKey: taskKeys.dashboardStats() });
    },
  });
};

// Delete task mutation
export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (taskId) => {
      const response = await axiosInstance.delete(API_PATHS.TASKS.DELETE_TASK(taskId));
      return response.data;
    },
    onSuccess: () => {
      // Invalidate all task queries
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
};

// Update task status mutation
export const useUpdateTaskStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ taskId, status }) => {
      const response = await axiosInstance.put(
        API_PATHS.TASKS.UPDATE_TASK_STATUS(taskId),
        { status }
      );
      return response.data;
    },
    onSuccess: (data, { taskId }) => {
      queryClient.setQueryData(taskKeys.detail(taskId), data);
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      queryClient.invalidateQueries({ queryKey: taskKeys.dashboardStats() });
    },
  });
};

// Update checklist item mutation
export const useUpdateChecklist = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ taskId, checklistIndex, completed }) => {
      const response = await axiosInstance.put(
        API_PATHS.TASKS.UPDATE_TODO_CHECKLIST(taskId),
        { index: checklistIndex, completed }
      );
      return response.data;
    },
    onSuccess: (data, { taskId }) => {
      queryClient.setQueryData(taskKeys.detail(taskId), data);
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });
};
