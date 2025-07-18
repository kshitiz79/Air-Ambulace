import React from 'react';
import { useThemeStyles } from '../../hooks/useThemeStyles';

const PageWrapper = ({ 
  children, 
  className = "", 
  maxWidth = "max-w-7xl",
  padding = "p-6" 
}) => {
  const styles = useThemeStyles();
  
  return (
    <div className={`${styles.pageBackground} ${className}`}>
      <div className={`${maxWidth} mx-auto ${padding}`}>
        {children}
      </div>
    </div>
  );
};

export default PageWrapper;