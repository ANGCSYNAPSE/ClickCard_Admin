/**
 * Centralized environment configuration
 * All env vars are defined here for consistency
 */

// API Configuration
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://click-card-backend.vercel.app";

// Site URL
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://localhost:3001";

// Main ClickCard web app — the admin login screen links back here.
export const WEB_URL = process.env.NEXT_PUBLIC_WEB_URL || "https://clickcard-2.vercel.app";

// Environment
export const IS_PRODUCTION = process.env.NODE_ENV === "production";
export const IS_DEVELOPMENT = process.env.NODE_ENV === "development";
