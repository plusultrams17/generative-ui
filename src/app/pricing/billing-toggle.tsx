"use client";

import { useState, createContext, useContext } from "react";

type BillingPeriod = "monthly" | "annual";

const BillingContext = createContext<{
  period: BillingPeriod;
  setPeriod: (p: BillingPeriod) => void;
}>({ period: "monthly", setPeriod: () => {} });

export function useBillingPeriod() {
  return useContext(BillingContext);
}

export function BillingToggle({ children }: { children: React.ReactNode }) {
  const [period, setPeriod] = useState<BillingPeriod>("monthly");

  return (
    <BillingContext value={{ period, setPeriod }}>
      <div className="mb-8 flex items-center justify-center gap-3">
        <button
          onClick={() => setPeriod("monthly")}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            period === "monthly"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          月払い
        </button>
        <button
          onClick={() => setPeriod("annual")}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            period === "annual"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          年払い
          <span className="ml-1.5 inline-block rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700 dark:bg-green-900/40 dark:text-green-400">
            2ヶ月無料
          </span>
        </button>
      </div>
      {children}
    </BillingContext>
  );
}

export function PriceDisplay() {
  const { period } = useBillingPeriod();

  if (period === "annual") {
    return (
      <div className="mt-4">
        <span className="text-4xl font-bold">¥39,800</span>
        <span className="text-muted-foreground">/年</span>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-sm text-muted-foreground line-through">¥47,760</span>
          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-900/40 dark:text-green-400">
            ¥7,960おトク
          </span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">1日あたり約109円</p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <span className="text-4xl font-bold">¥3,980</span>
      <span className="text-muted-foreground">/月</span>
      <p className="mt-1 text-xs text-muted-foreground">1日あたり約130円</p>
    </div>
  );
}
