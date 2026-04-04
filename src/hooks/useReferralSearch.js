import { useState, useCallback, useRef } from 'react';
import baseUrl from '../baseUrl/baseUrl';

/**
 * Debounced search hook for referral authority master data.
 * type: 'PHYSICIAN' | 'RECOMMENDING' | 'APPROVAL'
 */
export const useReferralSearch = (type) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const timer = useRef(null);

  const search = useCallback((query) => {
    clearTimeout(timer.current);
    if (query === undefined) { setResults([]); return; }

    const performFetch = async (q) => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const res = await fetch(
          `${baseUrl}/api/referral-authorities?type=${type}&search=${encodeURIComponent(q)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        setResults(data.data || []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    if (query === '') {
      performFetch('');
    } else {
      timer.current = setTimeout(() => performFetch(query), 300);
    }
  }, [type]);

  const clear = () => setResults([]);

  return { results, loading, search, clear };
};
