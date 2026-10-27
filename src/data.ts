import { getMockData } from "./mock";
import type { SkillproofData } from "./types";

declare global {
  interface Window {
    __SKILLPROOF_DATA__: SkillproofData | null;
  }
}

export function getData(): SkillproofData | null {
  if (window.__SKILLPROOF_DATA__) return window.__SKILLPROOF_DATA__;
  if (import.meta.env.DEV) return getMockData();
  return null;
}
