/**
 * Shared color utilities for consistent styling across the app
 * This file contains all color-related constants and helper functions
 */

// Label colors with dark mode support
export const LABEL_COLORS = [
  { bg: 'bg-red-100 dark:bg-red-900/40', text: 'text-red-700 dark:text-red-300', border: 'border-red-200 dark:border-red-700' },
  { bg: 'bg-blue-100 dark:bg-blue-900/40', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-700' },
  { bg: 'bg-green-100 dark:bg-green-900/40', text: 'text-green-700 dark:text-green-300', border: 'border-green-200 dark:border-green-700' },
  { bg: 'bg-yellow-100 dark:bg-yellow-900/40', text: 'text-yellow-700 dark:text-yellow-300', border: 'border-yellow-200 dark:border-yellow-700' },
  { bg: 'bg-purple-100 dark:bg-purple-900/40', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-700' },
  { bg: 'bg-pink-100 dark:bg-pink-900/40', text: 'text-pink-700 dark:text-pink-300', border: 'border-pink-200 dark:border-pink-700' },
  { bg: 'bg-indigo-100 dark:bg-indigo-900/40', text: 'text-indigo-700 dark:text-indigo-300', border: 'border-indigo-200 dark:border-indigo-700' },
  { bg: 'bg-orange-100 dark:bg-orange-900/40', text: 'text-orange-700 dark:text-orange-300', border: 'border-orange-200 dark:border-orange-700' },
];

// Chart colors for pie/bar charts
export const CHART_COLORS = ["#8D51FF", "#00B8DB", "#7BCE00"];

// Suggested labels for quick selection
export const SUGGESTED_LABELS = ['Bug', 'Feature', 'Enhancement', 'Urgent', 'Documentation', 'Review', 'Testing', 'Design'];

/**
 * Get consistent color for a label based on its text
 * Uses a hash function to always return the same color for the same label
 * @param {string} label - The label text
 * @returns {object} Object with bg, text, and border classes
 */
export const getLabelColor = (label) => {
  let hash = 0;
  for (let i = 0; i < label.length; i++) {
    hash = label.charCodeAt(i) + ((hash << 5) - hash);
  }
  return LABEL_COLORS[Math.abs(hash) % LABEL_COLORS.length];
};

/**
 * Get status tag color classes
 * @param {string} status - The task status (Pending, In Progress, Completed)
 * @returns {string} Tailwind CSS classes for the status tag
 */
export const getStatusTagColor = (status) => {
  switch (status) {
    case "In Progress":
      return "text-cyan-500 bg-cyan-50 dark:bg-cyan-900/30 border border-cyan-500/10";
    case "Completed":
      return "text-lime-500 bg-lime-50 dark:bg-lime-900/30 border border-lime-500/20";
    default:
      return "text-violet-500 bg-violet-50 dark:bg-violet-900/30 border border-violet-500/10";
  }
};

/**
 * Get priority tag color classes
 * @param {string} priority - The task priority (Low, Medium, High)
 * @returns {string} Tailwind CSS classes for the priority tag
 */
export const getPriorityTagColor = (priority) => {
  switch (priority) {
    case "Low":
      return "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-500/10";
    case "Medium":
      return "text-amber-500 bg-amber-50 dark:bg-amber-900/30 border border-amber-500/10";
    case "High":
      return "text-red-500 bg-red-50 dark:bg-red-900/30 border border-red-500/10";
    default:
      return "text-rose-500 bg-rose-50 dark:bg-rose-900/30 border border-rose-500/10";
  }
};

/**
 * Get user initials from name
 * @param {string} name - The user's full name
 * @returns {string} Initials (1-2 characters)
 */
export const getInitials = (name) => {
  if (!name) return 'U';
  const names = name.trim().split(' ').filter(Boolean);
  if (names.length >= 2) {
    return (names[0][0] + names[1][0]).toUpperCase();
  }
  return names[0][0].toUpperCase();
};

/**
 * Priority colors for charts/emails (hex values)
 */
export const PRIORITY_HEX_COLORS = {
  High: '#ef4444',
  Medium: '#f59e0b',
  Low: '#22c55e'
};

/**
 * Status colors for charts (hex values)
 */
export const STATUS_HEX_COLORS = {
  Pending: '#8b5cf6',
  'In Progress': '#06b6d4',
  Completed: '#84cc16'
};
