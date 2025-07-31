'use client';

import React, { useMemo, useRef, useEffect, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';

type StatItem = { title: string; value: number; suffix?: string };
type StatsProps = {
  stats?: StatItem[];
  className?: string;
  heading?: string;
};

const DEFAULT_STATS: StatItem[] = [
  { title: 'Live Auctions', value: 124, suffix: '+' },
  { title: 'Happy Users', value: 5000, suffix: '+' },
  { title: 'Items Sold', value: 1023, suffix: '+' },
  { title: 'Trusted Sellers', value: 120, suffix: '+' },
];

export default function Stats({
  stats = DEFAULT_STATS,
  className = '',
  heading = 'Auction Stats',
}: StatsProps) {
  const reduceMotion = useReducedMotion();

  const containerRef = useRef<HTMLElement | null>(null);
  const inView = useInView(containerRef, { once: true, margin: '-80px 0px' });

  const items = useMemo(
    () =>
      stats.map((s) => ({
        ...s,
        // format large numbers nicely
        formatted: new Intl.NumberFormat(undefined, {
          notation: s.value >= 10000 ? 'compact' : 'standard',
          maximumFractionDigits: 1,
        }).format(s.value),
      })),
    [stats]
  );

  return (
    <motion.section
      ref={containerRef}
      aria-labelledby="stats-heading"
      initial={reduceMotion ? {} : { opacity: 0, y: 16 }}
      whileInView={reduceMotion ? {} : { opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className={`bg-emerald-50 py-12 px-6 text-center ${className}`}
    >
      <h2 id="stats-heading" className="text-2xl sm:text-3xl font-semibold text-emerald-800 mb-8">
        {heading}
      </h2>

      <ul className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto">
        {items.map((stat) => (
          <li key={stat.title} className="h-full">
            <motion.div
              initial={reduceMotion ? {} : { opacity: 0, y: 12 }}
              whileInView={reduceMotion ? {} : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px 0px' }}
              transition={{ duration: 0.45 }}
              whileHover={reduceMotion ? {} : { y: -3, scale: 1.02 }}
              whileTap={reduceMotion ? {} : { scale: 0.98 }}
              className="bg-white p-6 rounded-xl shadow ring-1 ring-emerald-100/70 h-full"
            >
              <AnimatedNumber
                value={stat.value}
                inView={inView}
                reduceMotion={!!reduceMotion}
                className="text-3xl sm:text-4xl font-extrabold tracking-tight text-emerald-700"
              />
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-emerald-700">
                {stat.suffix ?? ''}
              </span>
              <p className="mt-1 text-gray-600">{stat.title}</p>

              <span
                aria-hidden="true"
                className="mt-4 block h-0.5 w-12 mx-auto bg-emerald-500/70 scale-x-0 group-hover:scale-x-100 transition-transform duration-300"
              />
            </motion.div>
          </li>
        ))}
      </ul>
    </motion.section>
  );
}

function AnimatedNumber({
  value,
  inView,
  reduceMotion,
  className,
}: {
  value: number;
  inView: boolean;
  reduceMotion: boolean;
  className?: string;
}) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduceMotion) {
      setDisplay(value);
      return;
    }

    let raf = 0;
    const duration = 900;
    const start = performance.now();
    const startVal = 0;
    const endVal = value;

    const step = (t: number) => {
      const elapsed = t - start;
      const progress = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startVal + (endVal - startVal) * eased);
      setDisplay(current);
      if (progress < 1) raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduceMotion, value]);

  const formatted = useMemo(
    () =>
      new Intl.NumberFormat(undefined, {
        notation: value >= 10000 ? 'compact' : 'standard',
        maximumFractionDigits: 1,
      }).format(display),
    [display, value]
  );

  return <span className={className}>{formatted}</span>;
}
