import type { Publication } from "./types";

/** Author order, venue, year, and publication status must be owner-confirmed. */
export const publications: readonly Publication[] = [];

/** Requested display groups; future years do not imply accepted publications. */
export const publicationYears = [2027, 2026, 2025] as const;
