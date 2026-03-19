import { useState, useEffect, useCallback } from 'react';
import baseUrl from '../baseUrl/baseUrl';

/**
 * Shared hook for dashboard data fetching.
 * Handles enquiries + optional extra endpoints, calculates monthly stats.
 * @param {string[]} extraEndpoints - additional API paths to fetch (e.g. ['/api/orders', '/api/financial-sanctions'])
 */
export const useDashboardData = (extraEndpoints = []) => {
  const [enquiries, setEnquiries] = useState([]);
  const [extras, setExtras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [enquiriesRes, ...extraRes] = await Promise.all([
        fetch(`${baseUrl}/api/enquiries`, { headers }),
        ...extraEndpoints.map(ep =>
          fetch(`${baseUrl}${ep}`, { headers }).catch(() => ({ ok: false }))
        ),
      ]);

      if (!enquiriesRes.ok) throw new Error('Failed to fetch enquiries');

      const enquiriesData = await enquiriesRes.json();
      const extraData = await Promise.all(
        extraRes.map(r => (r.ok ? r.json() : Promise.resolve({ data: [] })))
      );

      setEnquiries(enquiriesData.data || []);
      setExtras(extraData.map(d => d.data || []));
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const refresh = () => { setRefreshing(true); fetchData(); };

  /** Calculate last-6-months stats from an enquiries array */
  const calcMonthlyStats = (enqs, locale = 'en-US') =>
    Array.from({ length: 6 }, (_, i) => {
      const now = new Date();
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const month = date.toLocaleDateString(locale, { month: 'short', year: 'numeric' });
      const m = enqs.filter(e => {
        const d = new Date(e.created_at);
        return d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear();
      });
      return {
        month,
        total: m.length,
        approved: m.filter(e => e.status === 'APPROVED').length,
        rejected: m.filter(e => e.status === 'REJECTED').length,
        pending: m.filter(e => ['PENDING', 'FORWARDED'].includes(e.status)).length,
      };
    });

  /** Standard enquiry status counts */
  const counts = {
    total: enquiries.length,
    pending: enquiries.filter(e => e.status === 'PENDING').length,
    approved: enquiries.filter(e => e.status === 'APPROVED').length,
    rejected: enquiries.filter(e => e.status === 'REJECTED').length,
    forwarded: enquiries.filter(e => e.status === 'FORWARDED').length,
    escalated: enquiries.filter(e => e.status === 'ESCALATED').length,
    completed: enquiries.filter(e => e.status === 'COMPLETED').length,
    inProgress: enquiries.filter(e => e.status === 'IN_PROGRESS').length,
    pendingOrForwarded: enquiries.filter(e => ['PENDING', 'FORWARDED'].includes(e.status)).length,
  };

  const recent = [...enquiries]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 10);

  return { enquiries, extras, loading, error, refreshing, refresh, counts, recent, calcMonthlyStats };
};
