/**
 * Backward-compatible type barrel.
 *
 * Feature modules now keep shared domain types in src/shared/types, while
 * older pages and data modules still import from "../types". Re-export the
 * shared definitions here so those imports resolve consistently in Vite.
 */
export * from './shared/types';
