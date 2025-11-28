export const BASE_URL = import.meta.env.VITE_BASE_URL ;
export const API_PATHS = {
    AUTH: {
        REGISTER: '/api/auth/register',
        LOGIN: '/api/auth/login',
        GET_PROFILE: '/api/auth/profile',
        SEND_REGISTRATION_OTP: '/api/auth/send-registration-otp',
        VERIFY_REGISTRATION_OTP: '/api/auth/verify-registration-otp',
        FORGOT_PASSWORD: '/api/auth/forgot-password',
        RESET_PASSWORD: '/api/auth/reset-password',
        DELETE_ACCOUNT_REQUEST: '/api/auth/delete-account-request',
        CONFIRM_DELETE_ACCOUNT: '/api/auth/confirm-delete-account',
    },

    USERS: {
        GET_ALL_USERS: '/api/users',
        GET_USER_BY_ID: (userId) => `/api/users/${userId}`,
        CREATE_USER: '/api/users',
        UPDATE_USER: (userId) => `/api/users/${userId}`,
        DELETE_USER: (userId) => `/api/users/${userId}`,
    },

    TASKS: {
        GET_DASHBOARD_DATA: '/api/tasks/dashboard-data',
        GET_USER_DASHBOARD_DATA: `/api/tasks/user-dashboard-data`,
        GET_ALL_TASKS: '/api/tasks',
        GET_TASK_BY_ID: (taskId) => `/api/tasks/${taskId}`,
        CREATE_TASK: '/api/tasks',
        UPDATE_TASK: (taskId) => `/api/tasks/${taskId}`,
        DELETE_TASK: (taskId) => `/api/tasks/${taskId}`,

        UPDATE_TASK_STATUS: (taskId) => `/api/tasks/${taskId}/status`,
        UPDATE_TODO_CHECKLIST: (taskId) => `/api/tasks/${taskId}/todo`,
    },

    REPORTS: {
        EXPORT_TASKS: '/api/reports/export/tasks',
        EXPORT_USERS: '/api/reports/export/users',
    },

    IMAGE : {
        UPLOAD_IMAGE: '/api/auth/upload-image',
    },
};
