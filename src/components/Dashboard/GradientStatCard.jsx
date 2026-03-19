import React from 'react';

/**
 * GradientStatCard — reusable gradient stat card used across all dashboards.
 * Props: label, value, subLabel, icon, from, to (tailwind gradient colors)
 */
const GradientStatCard = ({ label, value, subLabel, icon, from = 'from-blue-500', to = 'to-blue-600' }) => (
  <div className={`bg-gradient-to-r ${from} ${to} rounded-lg shadow-sm p-6 text-white`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-white/80 text-sm font-medium">{label}</p>
        <p className="text-3xl font-bold">{value}</p>
        {subLabel && <p className="text-white/70 text-sm mt-1">{subLabel}</p>}
      </div>
      <div className="bg-white/20 rounded-full p-3 text-2xl">{icon}</div>
    </div>
  </div>
);

export default GradientStatCard;
