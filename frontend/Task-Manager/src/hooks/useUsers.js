import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../utils/axiosInstance';
import { API_PATHS } from '../utils/apiPaths';

// Query keys for cache management
export const userKeys = {
  all: ['users'],
  lists: () => [...userKeys.all, 'list'],
  list: (filters) => [...userKeys.lists(), filters],
  details: () => [...userKeys.all, 'detail'],
  detail: (id) => [...userKeys.details(), id],
};

// Fetch all users
export const useUsers = () => {
  return useQuery({
    queryKey: userKeys.lists(),
    queryFn: async () => {
      const response = await axiosInstance.get(API_PATHS.USERS.GET_ALL_USERS);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Fetch single user by ID
export const useUser = (userId) => {
  return useQuery({
    queryKey: userKeys.detail(userId),
    queryFn: async () => {
      const response = await axiosInstance.get(API_PATHS.USERS.GET_USER_BY_ID(userId));
      return response.data;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Update user mutation
export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, userData }) => {
      const response = await axiosInstance.put(
        API_PATHS.USERS.UPDATE_USER(userId),
        userData
      );
      return response.data;
    },
    onSuccess: (data, { userId }) => {
      queryClient.setQueryData(userKeys.detail(userId), data);
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
};

// Delete user mutation
export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userId) => {
      const response = await axiosInstance.delete(API_PATHS.USERS.DELETE_USER(userId));
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
};
