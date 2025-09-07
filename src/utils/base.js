// src/utils/base.js
export const BASE = process.env.BASE_URL || '/';
export const withBase = (p) => BASE + (p.startsWith('/') ? p.slice(1) : p);
