// User Roles
const USER_ROLES = {
    ADMIN: 'admin',
    MEMBER: 'member',
};

// Task Status
const TASK_STATUS = {
    PENDING: 'Pending',
    IN_PROGRESS: 'In Progress',
    COMPLETED: 'Completed',
};

// Task Priority
const TASK_PRIORITY = {
    LOW: 'Low',
    MEDIUM: 'Medium',
    HIGH: 'High',
};

// Public Email Domains - Users cannot register with these domains
const PUBLIC_DOMAINS = [
    'gmail.com',
    'yahoo.com',
    'yahoo.co.in',
    'yahoo.co.uk',
    'outlook.com',
    'hotmail.com',
    'live.com',
    'msn.com',
    'icloud.com',
    'me.com',
    'mac.com',
    'aol.com',
    'protonmail.com',
    'proton.me',
    'mail.com',
    'yandex.com',
    'zoho.com',
    'gmx.com',
    'inbox.com',
    'mail.ru',
    'rediffmail.com'
];

// Token Expiration
const TOKEN_EXPIRY = '7d';

// HTTP Status Codes
const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
};

module.exports = {
    USER_ROLES,
    TASK_STATUS,
    TASK_PRIORITY,
    PUBLIC_DOMAINS,
    TOKEN_EXPIRY,
    HTTP_STATUS,
};
