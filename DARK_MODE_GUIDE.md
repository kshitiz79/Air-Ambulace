# Dark Mode Implementation Guide

## 🌙 Overview

This guide explains how to make all components in the Air Ambulance application work with dark mode. The dark mode system is already implemented and ready to use.

## 🚀 Quick Start

### 1. Import Required Hooks

```jsx
import { useTheme } from '../contexts/ThemeContext';
import { useThemeStyles } from '../hooks/useThemeStyles';
```

### 2. Use in Your Component

```jsx
const MyComponent = () => {
  const { isDark, toggleTheme } = useTheme();
  const styles = useThemeStyles();

  return (
    <div className={styles.pageBackground}>
      <div className={styles.cardBackground}>
        <h1 className={styles.primaryText}>Hello World</h1>
        <p className={styles.secondaryText}>This supports dark mode!</p>
      </div>
    </div>
  );
};
```

## 🎨 Available Style Classes

### Page Backgrounds
- `styles.pageBackground` - Main page background with min-height

### Card/Container Backgrounds
- `styles.cardBackground` - Card background color
- `styles.cardBorder` - Card border color
- `styles.cardShadow` - Appropriate shadow for theme

### Text Colors
- `styles.primaryText` - Main text color
- `styles.secondaryText` - Secondary text color
- `styles.mutedText` - Muted/disabled text color

### Input Styles
- `styles.inputBackground` - Input background
- `styles.inputBorder` - Input border
- `styles.inputText` - Input text color
- `styles.inputPlaceholder` - Placeholder text color

### Table Styles
- `styles.tableHeader` - Table header background
- `styles.tableHeaderText` - Table header text color
- `styles.tableRow` - Table row hover state
- `styles.tableBorder` - Table border/divider color

### Button Styles
- `styles.primaryButton` - Primary button styling
- `styles.secondaryButton` - Secondary button styling

### Utility Styles
- `styles.borderColor` - General border color
- `styles.focusRing` - Focus ring styling

## 🧩 Pre-built Components

### ThemeCard
```jsx
import ThemeCard from '../components/Common/ThemeCard';

<ThemeCard>
  <h2>Card Content</h2>
  <p>Automatically themed!</p>
</ThemeCard>
```

### ThemeTable
```jsx
import ThemeTable from '../components/Common/ThemeTable';

<ThemeTable
  headers={['Name', 'Status', 'Date']}
  data={tableData}
  renderRow={(item) => (
    <>
      <td className="px-6 py-4">{item.name}</td>
      <td className="px-6 py-4">{item.status}</td>
      <td className="px-6 py-4">{item.date}</td>
    </>
  )}
/>
```

### ThemeInput
```jsx
import ThemeInput from '../components/Common/ThemeInput';
import { FaUser } from 'react-icons/fa';

<ThemeInput
  placeholder="Enter username"
  value={username}
  onChange={(e) => setUsername(e.target.value)}
  icon={FaUser}
/>
```

### ThemeButton
```jsx
import ThemeButton from '../components/Common/ThemeButton';
import { FaSave } from 'react-icons/fa';

<ThemeButton variant="primary" icon={FaSave}>
  Save Changes
</ThemeButton>
```

### PageWrapper
```jsx
import PageWrapper from '../components/Layout/PageWrapper';

<PageWrapper>
  <h1>Page Content</h1>
  <p>Automatically gets proper background and spacing</p>
</PageWrapper>
```

## 📝 Step-by-Step Page Conversion

### 1. Update Imports
```jsx
// Add these imports
import { useThemeStyles } from '../hooks/useThemeStyles';
// Optional: import { useTheme } from '../contexts/ThemeContext';
```

### 2. Add Hook to Component
```jsx
const MyPage = () => {
  const styles = useThemeStyles();
  // ... rest of component
```

### 3. Update Main Container
```jsx
// Before
<div className="min-h-screen bg-gray-50">

// After
<div className={styles.pageBackground}>
```

### 4. Update Cards/Containers
```jsx
// Before
<div className="bg-white rounded-lg shadow-lg p-6">

// After
<div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow} p-6`}>
```

### 5. Update Text Elements
```jsx
// Before
<h1 className="text-gray-800">Title</h1>
<p className="text-gray-600">Description</p>

// After
<h1 className={styles.primaryText}>Title</h1>
<p className={styles.secondaryText}>Description</p>
```

### 6. Update Form Elements
```jsx
// Before
<input className="bg-white border-gray-300 text-gray-900" />

// After
<input className={`${styles.inputBackground} border ${styles.inputBorder} ${styles.inputText}`} />
```

### 7. Update Tables
```jsx
// Before
<thead className="bg-gray-50">
  <th className="text-gray-500">Header</th>
</thead>
<tbody className="divide-y divide-gray-200">
  <tr className="hover:bg-gray-50">

// After
<thead className={styles.tableHeader}>
  <th className={styles.tableHeaderText}>Header</th>
</thead>
<tbody className={`divide-y ${styles.tableBorder}`}>
  <tr className={styles.tableRow}>
```

## 🎯 Status Colors

Status colors remain consistent for visibility:

```jsx
const getStatusColor = (status) => {
  const colors = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    APPROVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
    // ... etc
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

// Or use the utility
<span className={styles.getStatusColor(status)}>
  {status}
</span>
```

## 🔧 Advanced Usage

### Conditional Styling
```jsx
const { isDark } = useTheme();

<div className={`
  ${styles.cardBackground} 
  ${isDark ? 'border-2 border-blue-500' : 'border border-gray-200'}
`}>
```

### Custom Theme-Aware Components
```jsx
const CustomComponent = ({ children }) => {
  const styles = useThemeStyles();
  
  return (
    <div className={`
      ${styles.cardBackground}
      ${styles.cardShadow}
      rounded-lg p-4
      transition-colors duration-200
    `}>
      {children}
    </div>
  );
};
```

## ✅ Checklist for Page Conversion

- [ ] Import `useThemeStyles` hook
- [ ] Add `styles` variable to component
- [ ] Update main page container with `styles.pageBackground`
- [ ] Replace all `bg-white` with `styles.cardBackground`
- [ ] Replace all `bg-gray-50` with `styles.cardBackground`
- [ ] Update text colors (`text-gray-800` → `styles.primaryText`)
- [ ] Update input styling
- [ ] Update table styling
- [ ] Update button styling
- [ ] Test both light and dark modes
- [ ] Ensure proper contrast and readability

## 🎨 Theme Toggle

The theme toggle is already available in all headers. Users can:
- Click the sun/moon icon to switch themes
- Theme preference is automatically saved
- System theme is detected on first visit

## 🚨 Common Pitfalls

1. **Don't hardcode colors** - Always use the style utilities
2. **Test both themes** - Ensure readability in both modes
3. **Status colors** - Keep status badges consistent for visibility
4. **Loading states** - Use `styles.loadingShimmer` for skeleton screens
5. **Focus states** - Use `styles.focusRing` for accessibility

## 📱 Mobile Considerations

All theme styles are mobile-responsive and work across all screen sizes.

## 🎉 You're Done!

Once you follow this guide, your pages will automatically support dark mode with:
- ✅ Proper contrast ratios
- ✅ Smooth transitions
- ✅ Persistent theme selection
- ✅ Professional appearance
- ✅ Accessibility compliance