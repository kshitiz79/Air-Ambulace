import React from 'react';

export default function EmergencyContact() {
  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Emergency Contacts</h2>
      <p className="mb-4">For immediate assistance, contact the following:</p>
      <ul className="list-disc ml-6">
        <li>Helpline: +91-1800-123-4567</li>
        <li>Air Rescuers Support: +91-987-654-3210</li>
        <li>Email: support@airambulance.mp.gov.in</li>
      </ul>
    </div>
  );
}
