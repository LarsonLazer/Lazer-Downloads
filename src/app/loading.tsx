import React from 'react';

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-pulse">
      <div className="h-44 rounded-2xl bg-[#151B23] border border-white/10" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-36 rounded-xl bg-[#151B23] border border-white/10" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-72 rounded-xl bg-[#151B23] border border-white/10" />
        ))}
      </div>
    </div>
  );
}
