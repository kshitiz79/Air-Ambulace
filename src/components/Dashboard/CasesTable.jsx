import React from 'react';
import { Link } from 'react-router-dom';
import { FaFileAlt, FaEye } from 'react-icons/fa';
import StatusBadge from './StatusBadge';
import { useLanguage } from '../../contexts/LanguageContext';

/**
 * CasesTable — reusable recent cases table for all dashboards.
 * Props:
 *   cases         — array of enquiry objects
 *   baseRoute     — e.g. '/collector-dashboard' or '/dme-dashboard'
 *   approvalRoute — e.g. '/collector-dashboard/approval-reject'
 *   viewAllRoute  — override for "View All" link (defaults to baseRoute/case-files)
 *   accentColor   — tailwind color name e.g. 'green', 'teal'
 *   filter        — { status, date }
 *   onFilterChange — handler
 *   formatDate    — fn(dateString) => string
 *   localize      — fn(enquiry) => localized enquiry
 */
const CasesTable = ({
  cases = [],
  baseRoute,
  approvalRoute,
  viewAllRoute,
  accentColor = 'green',
  filter,
  onFilterChange,
  formatDate,
  localize,
}) => {
  const { t } = useLanguage();
  const viewAllClass = `bg-${accentColor}-600 hover:bg-${accentColor}-700`;
  const linkClass = `text-${accentColor}-600 hover:text-${accentColor}-900`;
  const resolvedViewAll = viewAllRoute || `${baseRoute}/case-files`;

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
          <FaFileAlt className={`mr-2 text-${accentColor}-600`} />
          {t.recentCases || 'Recent Cases'} ({cases.length})
        </h2>
        <div className="flex items-center space-x-4">
          {filter && onFilterChange && (
            <select
              name="status"
              value={filter.status}
              onChange={onFilterChange}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="ALL">{t.allStatus || 'All Status'}</option>
              <option value="PENDING">{t.pending || 'Pending'}</option>
              <option value="FORWARDED">{t.forwarded || 'Forwarded'}</option>
              <option value="APPROVED">{t.approved || 'Approved'}</option>
              <option value="REJECTED">{t.rejected || 'Rejected'}</option>
            </select>
          )}
          <Link
            to={resolvedViewAll}
            className={`flex items-center px-4 py-2 ${viewAllClass} text-white rounded-lg transition text-sm`}
          >
            <FaEye className="mr-2" />{t.viewAll || 'View All'}
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto">
        {cases.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <FaFileAlt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p>{t.noCasesFound || 'No cases found.'}</p>
          </div>
        ) : (
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                {[
                  t.enquiryCode || 'Enquiry Code',
                  t.patientName || 'Patient Name',
                  t.status || 'Status',
                  t.hospital || 'Hospital',
                  t.date || 'Date',
                  t.actions || 'Actions',
                ].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {cases.slice(0, 5).map(enq => {
                const e = localize ? localize(enq) : enq;
                return (
                  <tr key={enq.enquiry_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{enq.enquiry_code || `ENQ${enq.enquiry_id}`}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{e.patient_name}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={enq.status} label={t[enq.status?.toLowerCase()] || enq.status} />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{enq.hospital?.name || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{formatDate ? formatDate(enq.created_at) : enq.created_at}</td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <Link to={`${baseRoute}/case-file/${enq.enquiry_id}`} className={`${linkClass} mr-3`}>
                        <FaEye className="inline mr-1" />{t.view || 'View'}
                      </Link>
                      {approvalRoute && (
                        <Link to={approvalRoute} className="text-blue-600 hover:text-blue-900">
                          {t.review || 'Review'}
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default CasesTable;
