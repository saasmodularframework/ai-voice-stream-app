// scene.js
const bgStyle = (v, theater) => ({ background: theater ? '#000' : `linear-gradient(180deg,${v.background.top},${v.background.bottom})`, transition: 'background .8s ease' });
const Badge = ({ v }) => html`<span class="rounded-full border border-white/30 bg-white/15 px-2 py-0.5 text-[11px] uppercase tracking-wider">
  <i class=${'fa-solid ' + v.icon + ' mr-1'}></i>${v.type === '2d' ? '2D' : '3D'} scene · ${v.category}</span>`;
const Fact = ({ v }) => html`<p class="mt-3 border-l-4 border-white/60 pl-3 text-sm italic opacity-90">${v.fact}</p>`;
const PercentBar = ({ pct }) => html`<div class="absolute inset-x-1 bottom-1 h-1.5 overflow-hidden rounded bg-white/20"><div class="h-full bg-emerald-400" style=${{ width: pct + '%' }}></div></div>`;
