// scene.js
const bgStyle = (v, theater) => ({ background: theater ? '#000' : `linear-gradient(180deg,${v.background.top},${v.background.bottom})`, transition: 'background .8s ease' });
const Badge = ({ v }) => html`<span class="rounded-full border border-white/30 bg-white/15 px-2 py-0.5 text-[11px] uppercase tracking-wider">
  <i class=${'fa-solid ' + v.icon + ' mr-1'}></i>${v.type === '2d' ? '2D' : '3D'} scene · ${v.category}</span>`;
const Fact = ({ v }) => html`<p class="mt-3 border-l-4 border-white/60 pl-3 text-sm italic opacity-90">${v.fact}</p>`;
const PercentBar = ({ pct }) => html`<div class="absolute inset-x-1 bottom-1 h-1.5 overflow-hidden rounded bg-white/20"><div class="h-full bg-emerald-400" style=${{ width: pct + '%' }}></div></div>`;

function ModelCanvas({ src, v }) {
  const ref = useRef(), [pct, setPct] = useState(0);
  useEffect(() => { const el = ref.current, f = e => setPct(e.detail.totalProgress * 100);
    el.addEventListener('progress', f); return () => el.removeEventListener('progress', f); }, []);
  return html`<div class="pointer-events-none absolute bottom-2 right-2 h-32 w-32 rounded-lg bg-slate-900/60">
    <model-viewer ref=${ref} src=${src} auto-rotate="" camera-controls="" camera-orbit=${'45deg 65deg ' + Math.round(v.cameraDistance * 11) + '%'} class="h-full w-full"></model-viewer>
    ${pct < 100 && html`<${PercentBar} pct=${pct}/>`}</div>`;
}