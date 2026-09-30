const Btn = ({ on, title, active, children }) => html`<button title=${title} onClick=${on}
  class=${'rounded px-2 py-1 text-sm ' + (active ? 'bg-indigo-600' : 'bg-slate-800 hover:bg-slate-700')}>${children}</button>`;
const Pick = ({ title, value, options, on }) => html`<select title=${title} value=${value} onChange=${e => on(e.target.value)}
  class="rounded bg-slate-800 px-1 py-1 text-sm">${options.map(([v, l]) => html`<option key=${v} value=${v}>${l}</option>`)}</select>`;
const Spinner = () => html`<div class="absolute inset-0 flex items-center justify-center bg-black/40">
  <div class="h-10 w-10 animate-spin rounded-full border-4 border-white/30 border-t-white"></div></div>`;
const ErrorOverlay = ({ msg, retry }) => html`<div class="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/80 text-sm">
  <span>⚠️ ${msg}</span><${Btn} on=${retry}>Retry<//></div>`;
const MicMeter = ({ level }) => html`<div class="h-2 w-24 overflow-hidden rounded bg-slate-700"><div class="h-full bg-emerald-400 transition-all" style=${{ width: Math.min(100, level * 100) + '%' }}></div></div>`;
