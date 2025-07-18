import React from 'react';
import { useThemeStyles } from '../../hooks/useThemeStyles';

const ThemeButton = ({ 
  children, 
  variant = "primary", 
  size = "md",
  className = "",
  icon: Icon,
  ...props 
}) => {
  const styles = useThemeStyles();

  const variants = {
    primary: styles.primaryButton,
    secondary: styles.secondaryButton,
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      className={`
        inline-flex items-center justify-center
        font-medium rounded-md
        transition-colors duration-200
        ${styles.focusRing}
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      {...props}
    >
      {Icon && <Icon className="mr-2" />}
      {children}
    </button>
  );
};

export default ThemeButton;