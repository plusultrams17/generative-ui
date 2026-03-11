export type UserContext = {
  locale: "ja" | "en";
  theme: "light" | "dark" | "system";
  skillLevel: "beginner" | "intermediate" | "advanced";
  sessionCount: number;
  frequentActions: string[];
  recentErrors: number;
  deviceType: "mobile" | "tablet" | "desktop";
  screenWidth: number;
};

export const defaultUserContext: UserContext = {
  locale: "ja",
  theme: "system",
  skillLevel: "beginner",
  sessionCount: 0,
  frequentActions: [],
  recentErrors: 0,
  deviceType: "desktop",
  screenWidth: 1920,
};
