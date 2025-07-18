import React from 'react';
import { useThemeStyles } from '../../hooks/useThemeStyles';

const ThemeCard = ({ 
  children, 
  className = "", 
  padding = "p-6",
  shadow = true,
  border = false 
}) => {
  const styles = useThemeStyles();
  
  return (
    <div className={`
      ${styles.cardBackground} 
      rounded-lg 
      ${shadow ? styles.cardShadow : ''} 
      ${border ? `border ${styles.borderColor}` : ''} 
      ${padding} 
      ${className}
    `}>
      {children}
    </div>
  );
};

export default ThemeCard;