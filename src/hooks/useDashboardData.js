import { useState, useEffect } from 'react';
import baseUrl from '../baseUrl/baseUrl';

export const useDashboardData = (role) => {
  const [stats, setStats] = useState({});
  const [chartData, setChartData] = useState({});
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Mock data generator for development
  const generateMockData = (userRole) => {
    const baseStats = {
      SDM: {
        totalEnquiries: Math.floor(Math.random() * 500) + 100,
        pendingReview: Math.floor(Math.random() * 50) + 10,
        approved: Math.floor(Math.random() * 200) + 50,
        rejected: Math.floor(Math.random() * 30) + 5,
        forwardedToDM: Math.floor(Math.random() * 100) + 20,
        queryToCMO: Math.floor(Math.random() * 40) + 5
      },
      DM: {
        totalCases: Math.floor(Math.random() * 300) + 80,
        pendingApproval: Math.floor(Math.random() * 40) + 8,
        approved: Math.floor(Math.random() * 150) + 40,
        rejected: Math.floor(Math.random() * 20) + 3,
        financialSanctions: Math.floor(Math.random() * 80) + 15,
        ordersReleased: Math.floor(Math.random() * 60) + 12
      },
      CMO: {
        totalBeneficiaries: Math.floor(Math.random() * 800) + 200,
        activeEnquiries: Math.floor(Math.random() * 60) + 15,
        completedCases: Math.floor(Math.random() * 400) + 100,
        pendingDocuments: Math.floor(Math.random() * 25) + 5,
        escalatedCases: Math.floor(Math.random() * 15) + 2,
        queriesFromSDM: Math.floor(Math.random() * 30) + 5
      }
    };

    const activities = [
      {
        type: 'enquiry',
        description: 'New enquiry submitted by Ramesh Patel',
        timestamp: new Date(Date.now() - Math.random() * 3600000)
      },
      {
        type: 'approval',
        description: 'Case ENQ001 approved for air ambulance service',
        timestamp: new Date(Date.now() - Math.random() * 7200000)
      },
      {
        type: 'rejection',
        description: 'Case ENQ002 rejected due to incomplete documents',
        timestamp: new Date(Date.now() - Math.random() * 10800000)
      },
      {
        type: 'user',
        description: 'Profile updated successfully',
        timestamp: new Date(Date.now() - Math.random() * 14400000)
      },
      {
        type: 'enquiry',
        description: 'Query sent to CMO for case ENQ003',
        timestamp: new Date(Date.now() - Math.random() * 18000000)
      }
    ];

    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      month: new Date(2024, i).toLocaleString('default', { month: 'short' }),
      value: Math.floor(Math.random() * 100) + 20
    }));

    const statusData = userRole === 'SDM' ? [
      { name: 'Pending', value: baseStats.SDM.pendingReview, color: '#fbbf24' },
      { name: 'Approved', value: baseStats.SDM.approved, color: '#10b981' },
      { name: 'Rejected', value: baseStats.SDM.rejected, color: '#ef4444' },
      { name: 'Forwarded', value: baseStats.SDM.forwardedToDM, color: '#3b82f6' }
    ] : userRole === 'DM' ? [
      { name: 'Pending', value: baseStats.DM.pendingApproval, color: '#fbbf24' },
      { name: 'Approved', value: baseStats.DM.approved, color: '#10b981' },
      { name: 'Rejected', value: baseStats.DM.rejected, color: '#ef4444' },
      { name: 'Financial', value: baseStats.DM.financialSanctions, color: '#8b5cf6' }
    ] : [
      { name: 'Active', value: baseStats.CMO.activeEnquiries, color: '#3b82f6' },
      { name: 'Completed', value: baseStats.CMO.completedCases, color: '#10b981' },
      { name: 'Pending', value: baseStats.CMO.pendingDocuments, color: '#fbbf24' },
      { name: 'Escalated', value: baseStats.CMO.escalatedCases, color: '#ef4444' }
    ];

    return {
      stats: baseStats[userRole] || {},
      chartData: {
        monthly: monthlyData,
        status: statusData
      },
      activities: activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    };
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // For now, use mock data. Replace with actual API calls later
        const mockData = generateMockData(role);
        
        setStats(mockData.stats);
        setChartData(mockData.chartData);
        setRecentActivity(mockData.activities);
        
        // Uncomment below for actual API integration
        /*
        const response = await fetch(`${baseUrl}/api/dashboard/${role.toLowerCase()}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const data = await response.json();
        if (data.success) {
          setStats(data.stats);
          setChartData(data.chartData);
          setRecentActivity(data.activities);
        }
        */
        
        setError('');
      } catch (err) {
        console.error('Dashboard data fetch error:', err);
        setError('Failed to load dashboard data');
        
        // Fallback to mock data on error
        const mockData = generateMockData(role);
        setStats(mockData.stats);
        setChartData(mockData.chartData);
        setRecentActivity(mockData.activities);
      } finally {
        setLoading(false);
      }
    };

    if (role) {
      fetchDashboardData();
    }
  }, [role]);

  const refreshData = () => {
    const mockData = generateMockData(role);
    setStats(mockData.stats);
    setChartData(mockData.chartData);
    setRecentActivity(mockData.activities);
  };

  return {
    stats,
    chartData,
    recentActivity,
    loading,
    error,
    refreshData
  };
};