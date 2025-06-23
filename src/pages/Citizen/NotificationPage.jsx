import React, { useState } from 'react';

export default function NotificationPage() {
  const [notificationStore, setNotificationStore] = useState([
    { id: 1, message: 'Appointment confirmed' },
    { id: 2, message: 'Air ambulance dispatched' },
  ]);

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Notifications</h2>
      {notificationStore.length === 0 ? (
        <p>No notifications available.</p>
      ) : (
        <ul className="space-y-2">
          {notificationStore.map((notification) => (
            <li key={notification.id} className="p-2 border rounded">
              {notification.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
