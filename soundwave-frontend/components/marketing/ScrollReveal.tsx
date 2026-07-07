'use client';

// ============================================================
// SOUNDWAVE — SCROLL REVEAL
// Fades + slides children in once they enter the viewport.
// Pure IntersectionObserver + CSS transition, no dependencies.
// ============================================================

import { useEffect, useRef, useState, type ReactNode } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  delayMs?: number;
  as?: 'div' | 'section';
}

export function ScrollReveal({ children, delayMs = 0, as = 'div' }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const Tag = as;

  return (
    <Tag
      ref={ref as never}
      className={`sw-reveal${isVisible ? ' is-visible' : ''}`}
      style={{ transitionDelay: isVisible ? `${delayMs}ms` : '0ms' }}
    >
      {children}
    </Tag>
  );
}
