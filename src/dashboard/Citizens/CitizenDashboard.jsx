import React from 'react';
import { Outlet, Link } from 'react-router-dom';

const CitizenDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header Section */}
      <header className="bg-blue-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold">Citizen Dashboard</h1>
          <p className="mt-2 text-sm">Access all your services in one place</p>
        </div>
      </header>

      {/* Navigation Section */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <ul className="flex flex-wrap gap-4 sm:gap-6">
            {[
              { to: "", label: "Home" },
              { to: "enquiry-form", label: "Enquiry Form" },
              { to: "status-check", label: "Status Check" },
              { to: "dox-upload", label: "Upload Documents" },
              { to: "emergency-contact", label: "Emergency Contact" },
              { to: "notification", label: "Notifications" },
              { to: "faq-page", label: "FAQs" },
            ].map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200 px-3 py-2 rounded-md hover:bg-blue-50"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Main Content Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default CitizenDashboard;