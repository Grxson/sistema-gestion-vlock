import React from 'react';
import Alert from './Alert';

const AlertContainer = ({ alerts, onRemoveAlert }) => {
  if (!alerts || alerts.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm w-full">
      {alerts.map((alert) => (
        <Alert
          key={alert.id}
          type={alert.type}
          title={alert.title}
          message={alert.message}
          actions={alert.actions}
          autoClose={alert.autoClose}
          duration={alert.duration}
          onClose={() => onRemoveAlert(alert.id)}
          className="transform transition-all duration-300 ease-in-out"
        />
      ))}
    </div>
  );
};

export default AlertContainer;
