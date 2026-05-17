/**
 * Centralized API base URL configuration for Qivora.
 * Dynamically resolves the API base URL to ensure cross-device local network testing
 * (e.g., testing on mobile devices via local IP) works out of the box without network errors.
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`;
