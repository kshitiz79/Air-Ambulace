import React from 'react';

const STATUS_COLORS = {
  PENDING:     'bg-yellow-100 text-yellow-800',
  FORWARDED:   'bg-blue-100 text-blue-800',
  APPROVED:    'bg-green-100 text-green-800',
  REJECTED:    'bg-red-100 text-red-800',
  ESCALATED:   'bg-purple-100 text-purple-800',
  COMPLETED:   'bg-teal-100 text-teal-800',
  IN_PROGRESS: 'bg-indigo-100 text-indigo-800',
};

/**
 * StatusBadge — renders a colored pill for enquiry/case status.
 * Props: status (string), label (optional override text)
 */
const StatusBadge = ({ status, label }) => (
  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${STATUS_COLORS[status] || 'bg-gray-100 text-gray-800'}`}>
    {label || status}
  </span>
);

export default StatusBadge;
