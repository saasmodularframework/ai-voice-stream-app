const html = htm.bind(React.createElement), { useState, useEffect, useRef } = React;
const MODELS = Array.from({ length: 10 }, (_, i) => `models/computer${i + 1}.glb`);

const emit = o => window.dispatchEvent(new CustomEvent('mstv', { detail: JSON.stringify(o) }));
const store = {
  get: (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};
const fmt = s => { s = Math.floor(s || 0); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
