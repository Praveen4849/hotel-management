import React from 'react';

const Loading = ({ message = 'Loading hotels...' }) => {
  return (
    <div className="loading-wrapper" role="status">
      <div className="spinner"></div>
      <p className="loading-text">{message}</p>
    </div>
  );
};

export default Loading;
