import React from 'react';

function Copyright() {
  const year = new Date().getFullYear();

  return (
    <div className="copyright-badge" aria-label={`Copyright Yulian Yuriev ${year}`}>
      © {year} Yulian Yuriev
    </div>
  );
}

export default Copyright;
