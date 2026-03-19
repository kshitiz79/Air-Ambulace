import React, { useEffect, useState } from 'react';

let showToastFn = null;

export function triggerScriptWarning(message) {
  if (showToastFn) showToastFn(message);
}

export default function ScriptWarningToast() {
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    showToastFn = (msg) => {
      setMessage(msg);
      setVisible(true);
      setTimeout(() => setVisible(false), 2500);
    };
    return () => { showToastFn = null; };
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 bg-orange-500 text-white px-5 py-3 rounded-xl shadow-xl animate-bounce-in text-sm font-semibold">
      <span className="text-lg">⚠️</span>
      {message}
    </div>
  );
}
