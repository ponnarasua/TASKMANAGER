/**
 * Domain Helper Utilities
 * Centralized domain validation and organization matching
 */

const { PUBLIC_DOMAINS } = require('./constants');

/**
 * Extract domain from email address
 * @param {string} email - Email address
 * @returns {string} Domain part of the email
 */
const getOrgDomain = (email) => {
    if (!email || typeof email !== 'string') return '';
    return email.split('@')[1]?.toLowerCase() || '';
};

/**
 * Check if a domain is a public email domain
 * @param {string} domain - Domain to check
 * @returns {boolean} True if public domain
 */
const isPublicDomain = (domain) => {
    if (!domain) return false;
    return PUBLIC_DOMAINS.includes(domain.toLowerCase());
};

/**
 * Check if an email uses a public domain
 * @param {string} email - Email address to check
 * @returns {boolean} True if email uses a public domain
 */
const isPublicEmail = (email) => {
    const domain = getOrgDomain(email);
    return isPublicDomain(domain);
};

/**
 * Get organization domain from user's email
 * Returns null if it's a public domain
 * @param {string} email - User's email
 * @returns {string|null} Organization domain or null
 */
const getOrganizationDomain = (email) => {
    const domain = getOrgDomain(email);
    if (isPublicDomain(domain)) {
        return null;
    }
    return domain;
};

/**
 * Build a regex pattern for matching emails in the same organization
 * @param {string} domain - Organization domain
 * @returns {RegExp} Regex pattern for email matching
 */
const buildOrgEmailRegex = (domain) => {
    return new RegExp(`@${domain}$`, 'i');
};

/**
 * Build MongoDB query for finding users in the same organization
 * @param {string} domain - Organization domain
 * @returns {Object} MongoDB query object
 */
const buildOrgUserQuery = (domain) => {
    return { email: { $regex: `@${domain}$`, $options: 'i' } };
};

/**
 * Get frontend URL from environment or default
 * @returns {string} Frontend URL
 */
const getFrontendUrl = () => {
    return process.env.FRONTEND_URL || 'http://localhost:5173';
};

/**
 * Build task URL for frontend
 * @param {string} taskId - Task ID
 * @returns {string} Full task URL
 */
const buildTaskUrl = (taskId) => {
    return `${getFrontendUrl()}/user/task-details/${taskId}`;
};

module.exports = {
    getOrgDomain,
    isPublicDomain,
    isPublicEmail,
    getOrganizationDomain,
    buildOrgEmailRegex,
    buildOrgUserQuery,
    getFrontendUrl,
    buildTaskUrl,
};
