import { useTheme } from '../contexts/ThemeContext';

export const useThemeStyles = () => {
  const { isDark } = useTheme();

  return {
    // Page backgrounds
    pageBackground: isDark ? 'bg-slate-900 min-h-screen' : 'bg-gray-50 min-h-screen',
    
    // Card backgrounds
    cardBackground: isDark ? 'bg-slate-800' : 'bg-white',
    cardBorder: isDark ? 'border-slate-700' : 'border-gray-200',
    
    // Text colors
    primaryText: isDark ? 'text-slate-100' : 'text-gray-800',
    secondaryText: isDark ? 'text-slate-300' : 'text-gray-600',
    mutedText: isDark ? 'text-slate-400' : 'text-gray-500',
    
    // Input styles
    inputBackground: isDark ? 'bg-slate-700' : 'bg-white',
    inputBorder: isDark ? 'border-slate-600' : 'border-gray-300',
    inputText: isDark ? 'text-slate-100' : 'text-gray-900',
    inputPlaceholder: isDark ? 'placeholder-slate-400' : 'placeholder-gray-500',
    
    // Table styles
    tableHeader: isDark ? 'bg-slate-700' : 'bg-gray-50',
    tableHeaderText: isDark ? 'text-slate-300' : 'text-gray-500',
    tableRow: isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-50',
    tableBorder: isDark ? 'divide-slate-700' : 'divide-gray-200',
    
    // Button styles
    primaryButton: isDark 
      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
      : 'bg-blue-600 hover:bg-blue-700 text-white',
    secondaryButton: isDark 
      ? 'bg-slate-700 hover:bg-slate-600 text-slate-200 border-slate-600' 
      : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300',
    
    // Status colors (these remain the same for visibility)
    statusPending: 'bg-yellow-100 text-yellow-800',
    statusApproved: 'bg-green-100 text-green-800',
    statusRejected: 'bg-red-100 text-red-800',
    statusForwarded: 'bg-blue-100 text-blue-800',
    statusEscalated: 'bg-purple-100 text-purple-800',
    statusCompleted: 'bg-gray-100 text-gray-800',
    statusInProgress: 'bg-pink-100 text-pink-800',
    
    // Loading and empty states
    loadingBackground: isDark ? 'bg-slate-800' : 'bg-white',
    loadingShimmer: isDark ? 'bg-slate-700' : 'bg-gray-200',
    
    // Shadows
    cardShadow: isDark ? 'shadow-xl shadow-slate-900/20' : 'shadow-lg',
    
    // Borders
    borderColor: isDark ? 'border-slate-700' : 'border-gray-200',
    
    // Focus states
    focusRing: 'focus:ring-2 focus:ring-blue-500 focus:border-transparent',
    
    // Utility function to get status color
    getStatusColor: (status) => {
      const statusColors = {
        PENDING: 'bg-yellow-100 text-yellow-800',
        APPROVED: 'bg-green-100 text-green-800',
        REJECTED: 'bg-red-100 text-red-800',
        FORWARDED: 'bg-blue-100 text-blue-800',
        ESCALATED: 'bg-purple-100 text-purple-800',
        COMPLETED: 'bg-gray-100 text-gray-800',
        IN_PROGRESS: 'bg-pink-100 text-pink-800',
      };
      return statusColors[status] || 'bg-gray-100 text-gray-800';
    }
  };
};