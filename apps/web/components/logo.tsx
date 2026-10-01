'use client';

import React from 'react';
import Link from 'next/link';

export interface LogoProps {
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Color theme variant */
  variant?: 'dark' | 'light';
  /** Whether to show the text next to the squircle icon */
  showText?: boolean;
  /** Text style: 'Tecnologia' | 'simple' | 'none' */
  textStyle?: 'tecnologia' | 'simple';
  /** Custom subtitle below the text (e.g. "Cuidar da cidade") */
  subtitle?: string;
  /** Optional link destination */
  href?: string;
  /** Custom className for the container */
  className?: string;
}

export function Logo({
  size = 'md',
  variant = 'dark',
  showText = true,
  textStyle = 'tecnologia',
  subtitle,
  href,
  className = ''
}: LogoProps) {
  // Dimensions and typography matching the official "u. Urboa Tecnologia" standard
  const sizeMap = {
    sm: {
      box: 'w-6 h-6 rounded-[7px] text-[11px]',
      title: 'text-sm',
      gap: 'gap-2'
    },
    md: {
      box: 'w-8 h-8 rounded-[9px] text-[14px]',
      title: 'text-[17px]',
      gap: 'gap-2.5'
    },
    lg: {
      box: 'w-10 h-10 rounded-xl text-[17px]',
      title: 'text-xl',
      gap: 'gap-3'
    }
  };

  const currentSize = sizeMap[size];

  // Visual appearance
  const boxStyles = variant === 'light'
    ? 'bg-white text-[#0A2540] shadow-sm'
    : 'bg-[#0A2540] text-white shadow-xs';

  const textStyles = variant === 'light'
    ? 'text-white'
    : 'text-[#0F172A]';

  const content = (
    <div className={`inline-flex items-center ${currentSize.gap} group select-none ${className}`}>
      {/* Official "u." Squircle Badge */}
      <div 
        className={`${currentSize.box} ${boxStyles} flex items-center justify-center font-bold tracking-tight transition-transform duration-200 group-hover:scale-105 shrink-0`}
      >
        <span className="leading-none select-none">u.</span>
      </div>

      {/* Brand Text */}
      {showText && (
        <div className="flex flex-col min-w-0">
          <div className={`flex items-baseline gap-1.5 ${currentSize.title} font-bold tracking-tight ${textStyles} leading-none`}>
            <span>Urboa</span>
            {textStyle === 'tecnologia' && (
              <span className={variant === 'light' ? 'text-sky-200/90 font-medium' : 'text-[#0F172A] font-bold'}>
                Tecnologia
              </span>
            )}
          </div>
          {subtitle && (
            <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase mt-1">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center focus:outline-none">
        {content}
      </Link>
    );
  }

  return content;
}
