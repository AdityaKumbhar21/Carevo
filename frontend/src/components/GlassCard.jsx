import React from 'react';

export const GlassCard = ({ children, className = "" }) => (
  <div className={`bg-[#161022]/60 backdrop-blur-xl border border-white/10 rounded-xl ${className}`}>
    {children}
  </div>
);