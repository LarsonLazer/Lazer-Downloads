import React from 'react';

interface BrandLogoProps {
  variant?: 'dark' | 'light';
  iconOnly?: boolean;
  className?: string;
}

export function BrandLogo({
  variant = 'dark',
  iconOnly = false,
  className = '',
}: BrandLogoProps) {
  const isDark = variant === 'dark';

  return (
    <span className={`inline-flex items-center gap-3 select-none ${className}`}>
      <svg
        width="36"
        height="36"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        <rect
          x="1"
          y="1"
          width="38"
          height="38"
          rx="10"
          fill={isDark ? '#151B23' : '#0B0F14'}
          stroke={isDark ? '#263140' : '#0B0F14'}
          strokeWidth="1.5"
        />
        <path
          d="M20 10V25"
          stroke="#00D084"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M14 19.5L20 25.5L26 19.5"
          stroke="#00D084"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12.5 30.5H27.5"
          stroke="#FFFFFF"
          strokeWidth="2.8"
          strokeLinecap="round"
        />
      </svg>

      {!iconOnly && (
        <span className="flex flex-col leading-none whitespace-nowrap">
          <span
            className={`font-display text-base font-bold tracking-wider ${
              isDark ? 'text-white' : 'text-[#0B0F14]'
            }`}
          >
            LAZER
          </span>
          <span
            className={`font-display text-[10px] font-semibold tracking-[0.22em] ${
              isDark ? 'text-[#00D084]' : 'text-[#009960]'
            }`}
          >
            DOWNLOADS
          </span>
        </span>
      )}
    </span>
  );
}
