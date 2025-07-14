import React from 'react';
import { FiBell, FiSettings, FiUser } from 'react-icons/fi';

const Header = ({ greeting, children }) => {
  return (
    <header className="bg-gradient-to-r from-white to-blue-100 text-blue-900 p-4 flex justify-between items-center   ">
      <h2 className="text-xl font-semibold">{greeting}</h2>
      <div className="flex items-center space-x-4">
        {children}
      </div>
    </header>
  );
};

export default Header;