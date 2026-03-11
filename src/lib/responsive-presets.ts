export type DevicePreset = {
  name: string;
  width: number;
  height: number;
  category: "phone" | "tablet" | "laptop" | "desktop";
  icon: string;
};

export const DEVICE_PRESETS: DevicePreset[] = [
  // Phones
  { name: "iPhone SE", width: 375, height: 667, category: "phone", icon: "📱" },
  { name: "iPhone 14", width: 390, height: 844, category: "phone", icon: "📱" },
  { name: "iPhone 14 Pro Max", width: 430, height: 932, category: "phone", icon: "📱" },
  { name: "Pixel 7", width: 412, height: 915, category: "phone", icon: "📱" },
  { name: "Galaxy S23", width: 360, height: 780, category: "phone", icon: "📱" },
  // Tablets
  { name: "iPad Mini", width: 744, height: 1133, category: "tablet", icon: "📲" },
  { name: "iPad Air", width: 820, height: 1180, category: "tablet", icon: "📲" },
  { name: "iPad Pro 12.9", width: 1024, height: 1366, category: "tablet", icon: "📲" },
  // Laptops
  { name: "MacBook Air 13", width: 1280, height: 800, category: "laptop", icon: "💻" },
  { name: "MacBook Pro 16", width: 1728, height: 1117, category: "laptop", icon: "💻" },
  // Desktops
  { name: "Full HD", width: 1920, height: 1080, category: "desktop", icon: "🖥️" },
  { name: "4K", width: 3840, height: 2160, category: "desktop", icon: "🖥️" },
];

export type BreakpointConfig = {
  name: string;
  minWidth: number;
  color: string;
};

export const TAILWIND_BREAKPOINTS: BreakpointConfig[] = [
  { name: "sm", minWidth: 640, color: "#22c55e" },
  { name: "md", minWidth: 768, color: "#3b82f6" },
  { name: "lg", minWidth: 1024, color: "#a855f7" },
  { name: "xl", minWidth: 1280, color: "#f97316" },
  { name: "2xl", minWidth: 1536, color: "#ef4444" },
];

export function getActiveBreakpoints(width: number): string[] {
  return TAILWIND_BREAKPOINTS
    .filter((bp) => width >= bp.minWidth)
    .map((bp) => bp.name);
}

export function getDeviceForWidth(width: number): DevicePreset | undefined {
  return DEVICE_PRESETS.find((d) => d.width === width);
}
