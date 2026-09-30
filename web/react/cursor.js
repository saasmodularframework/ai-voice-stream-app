function CustomCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 }), [icon, setIcon] = useState('fa-arrow-pointer');
  useEffect(() => {
    const m = e => setPos({ x: e.clientX + 12, y: e.clientY + 12 }), c = e => setIcon(e.detail || 'fa-arrow-pointer');
    window.addEventListener('mousemove', m); window.addEventListener('mstv-cat', c);
    return () => { window.removeEventListener('mousemove', m); window.removeEventListener('mstv-cat', c); };
  }, []);
  return html`<div style=${{ position: 'fixed', top: 0, left: 0, transform: `translate(${pos.x}px,${pos.y}px)`, pointerEvents: 'none', zIndex: 99999, color: '#00ffcc', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,.5))' }}>
    <i class=${'fa-solid ' + icon}></i></div>`;
}
window.addEventListener('DOMContentLoaded', () => { const d = document.createElement('div'); document.body.appendChild(d); ReactDOM.createRoot(d).render(html`<${CustomCursor}/>`); });
