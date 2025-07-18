import React from 'react';
import { useThemeStyles } from '../../hooks/useThemeStyles';

const ThemeInput = ({ 
  type = "text", 
  placeholder, 
  value, 
  onChange, 
  className = "",
  icon: Icon,
  ...props 
}) => {
  const styles = useThemeStyles();

  return (
    <div className="relative">
      {Icon && (
        <Icon className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${styles.mutedText}`} />
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`
          w-full 
          ${Icon ? 'pl-10' : 'pl-3'} 
          pr-3 py-2 
          ${styles.inputBackground} 
          ${styles.inputText} 
          ${styles.inputPlaceholder}
          border ${styles.inputBorder} 
          rounded-md 
          ${styles.focusRing}
          transition-colors duration-200
          ${className}
        `}
        {...props}
      />
    </div>
  );
};

export default ThemeInput;