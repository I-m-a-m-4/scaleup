'use client';

import { useEffect } from 'react';

export function RippleEffect() {
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const body = document.body;
      const ripple = document.createElement('div');
      
      ripple.className = 'ripple';
      ripple.style.left = `${e.clientX}px`;
      ripple.style.top = `${e.clientY}px`;
      
      body.appendChild(ripple);
      
      // Clean up the ripple element after the animation is done
      setTimeout(() => {
        ripple.remove();
      }, 700);
    };

    document.body.addEventListener('click', handleClick);

    return () => {
      document.body.removeEventListener('click', handleClick);
    };
  }, []);

  return null;
}
