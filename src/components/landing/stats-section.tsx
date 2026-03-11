"use client";

import { useEffect, useRef, useState } from "react";

type Stat = {
  value: string;
  numericValue: number | null;
  suffix: string;
  label: string;
};

const stats: Stat[] = [
  { value: "4+", numericValue: 4, suffix: "+", label: "AIモデル対応" },
  { value: "8+", numericValue: 8, suffix: "+", label: "テンプレート" },
  { value: "4種", numericValue: 4, suffix: "種", label: "UI生成タイプ" },
  { value: "∞", numericValue: null, suffix: "", label: "カスタマイズ可能" },
];

function AnimatedStat({ stat, inView }: { stat: Stat; inView: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView || stat.numericValue === null) return;

    const target = stat.numericValue;
    const duration = 1500;
    const steps = 30;
    const increment = target / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [inView, stat.numericValue]);

  return (
    <div className="text-center">
      <div className="text-4xl font-bold text-gray-900 sm:text-5xl dark:text-white">
        {stat.numericValue === null ? (
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">
            ∞
          </span>
        ) : (
          <>
            {inView ? count : 0}
            {stat.suffix}
          </>
        )}
      </div>
      <div className="mt-2 text-sm font-medium text-gray-600 dark:text-gray-400">
        {stat.label}
      </div>
    </div>
  );
}

export function StatsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-20" ref={ref}>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map((stat) => (
            <AnimatedStat key={stat.label} stat={stat} inView={inView} />
          ))}
        </div>
      </div>
    </section>
  );
}
