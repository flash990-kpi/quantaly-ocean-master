'use client';

import { useState, useEffect } from 'react';

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'ultrawide';
export type DeviceType = 'mobile' | 'tablet' | 'desktop' | 'ultrawide';
export type LayoutDensity = 'compact' | 'comfort' | 'spacious';

export interface ScreenSizeState {
  width: number;
  height: number;
  breakpoint: Breakpoint;
  deviceType: DeviceType;
  orientation: 'portrait' | 'landscape';
  isTouch: boolean;
  density: LayoutDensity;
  scale: number; // e.g. 100 for 100%
  paddingClass: string;
  gapClass: string;
  cardPaddingClass: string;
}

export function useScreenSize() {
  const [screenInfo, setScreenInfo] = useState<ScreenSizeState>({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
    breakpoint: 'lg',
    deviceType: 'desktop',
    orientation: 'landscape',
    isTouch: false,
    density: 'comfort',
    scale: 100,
    paddingClass: 'px-4 sm:px-6 lg:px-8',
    gapClass: 'gap-4 sm:gap-6',
    cardPaddingClass: 'p-4 sm:p-6',
  });

  const [userDensity, setUserDensity] = useState<LayoutDensity>('comfort');
  const [userScale, setUserScale] = useState<number>(100);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;

      let bp: Breakpoint = 'xs';
      let dev: DeviceType = 'mobile';

      if (w < 480) {
        bp = 'xs';
        dev = 'mobile';
      } else if (w < 640) {
        bp = 'sm';
        dev = 'mobile';
      } else if (w < 768) {
        bp = 'md';
        dev = 'tablet';
      } else if (w < 1024) {
        bp = 'lg';
        dev = 'tablet';
      } else if (w < 1280) {
        bp = 'xl';
        dev = 'desktop';
      } else if (w < 1536) {
        bp = '2xl';
        dev = 'desktop';
      } else {
        bp = 'ultrawide';
        dev = 'ultrawide';
      }

      const orient = w >= h ? 'landscape' : 'portrait';
      const touch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

      // Dynamic padding & spacing classes to ensure nothing is crammed ("ciucciato")
      let pad = 'px-3 py-3 sm:px-6 sm:py-5 lg:px-8 lg:py-6';
      let gap = 'gap-3 sm:gap-5 lg:gap-6';
      let cardPad = 'p-3.5 sm:p-5 lg:p-6';

      if (userDensity === 'compact') {
        pad = 'px-2.5 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-4';
        gap = 'gap-2.5 sm:gap-3.5 lg:gap-4';
        cardPad = 'p-3 sm:p-4 lg:p-5';
      } else if (userDensity === 'spacious') {
        pad = 'px-4 py-4 sm:px-8 sm:py-6 lg:px-12 lg:py-8';
        gap = 'gap-5 sm:gap-7 lg:gap-8';
        cardPad = 'p-5 sm:p-7 lg:p-8';
      }

      setScreenInfo({
        width: w,
        height: h,
        breakpoint: bp,
        deviceType: dev,
        orientation: orient,
        isTouch: touch,
        density: userDensity,
        scale: userScale,
        paddingClass: pad,
        gapClass: gap,
        cardPaddingClass: cardPad,
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [userDensity, userScale]);

  return {
    ...screenInfo,
    setUserDensity,
    setUserScale,
  };
}
