function VideoCard({ v, api }) {
  const frame = useRef(), root = useRef(), P = useRef(), ag = useRef({});
  const [s, set] = useState({ t: 0, d: 0, playing: false, buf: false, err: null, rate: 1, q: 'auto', qs: [], vol: 1, loop: false, cc: false, ccs: [], theater: false });
  const up = x => set(o => ({ ...o, ...x }));
  const [model, setModel] = useState(null), [agent, setAgent] = useState('idle'), [mic, setMic] = useState({ lvl: 0, muted: false });
  const [marks, setMarks] = useState(store.get('bm:' + v.id, [])), [key, setKey] = useState(0);
  const [net, setNet] = useState(navigator.connection?.effectiveType || '');
  const p = () => P.current;

  useEffect(() => {
    const c = navigator.connection; if (!c) return;
    const f = () => setNet(c.effectiveType); c.addEventListener('change', f); return () => c.removeEventListener('change', f);
  }, []);

  useEffect(() => { 
    const pl = new Vimeo.Player(frame.current); P.current = pl;
    let iv, saved = 0, sent = 0;
    const pick = () => setModel(MODELS[Math.floor(Math.random() * MODELS.length)]);
    pl.on('loaded', async () => {
      const d = await pl.getDuration(), at = store.get('pos:' + v.id, 0);
      if (at > 5 && at < d - 5) pl.setCurrentTime(at);                       // resume position
      up({ d, err: null, qs: await pl.getQualities().catch(() => []), ccs: await pl.getTextTracks().catch(() => []) });
    });
    pl.on('timeupdate', e => {
      up({ t: e.seconds, d: e.duration });
      if (Math.abs(e.seconds - saved) >= 5) { saved = e.seconds; store.set('pos:' + v.id, e.seconds); }
      if (Math.abs(e.seconds - sent) >= 10) { sent = e.seconds; emit({ type: 'progress', id: v.id, t: e.seconds }); }
    });
    pl.on('play', () => { up({ playing: true }); pick(); clearInterval(iv); iv = setInterval(pick, 8000); emit({ type: 'play', id: v.id }); });
    pl.on('pause', () => { up({ playing: false }); clearInterval(iv); });
    pl.on('ended', () => { clearInterval(iv); setModel(null); store.set('pos:' + v.id, 0); emit({ type: 'ended', id: v.id }); });
    pl.on('bufferstart', () => up({ buf: true })); pl.on('bufferend', () => up({ buf: false }));
    pl.on('error', e => { up({ err: e.message || 'Playback error' }); emit({ type: 'error', id: v.id, msg: e.message }); });
    const onPlay = e => e.detail === v.id && pl.play().catch(() => {});    
    window.addEventListener('mstv-play', onPlay);
    return () => { clearInterval(iv); window.removeEventListener('mstv-play', onPlay); };
  }, [key]);

  useEffect(() => () => { clearInterval(ag.current.iv); ag.current.mic?.close(); ag.current.cl?.leave(); }, []);

  const A = {
    toggle: async () => (await p().getPaused()) ? p().play() : p().pause(),
    skip: async d => p().setCurrentTime(Math.max(0, (await p().getCurrentTime()) + d)),
    rate: r => { p().setPlaybackRate(+r); up({ rate: +r }); },
    quality: q => { p().setQuality(q); up({ q }); },
    vol: x => { p().setVolume(+x); up({ vol: +x }); },
    loop: () => { p().setLoop(!s.loop); up({ loop: !s.loop }); },
    cc: () => { if (s.cc) { p().disableTextTrack(); up({ cc: false }); } else if (s.ccs[0]) { p().enableTextTrack(s.ccs[0].language, s.ccs[0].kind); up({ cc: true }); } },
    pip: () => p().requestPictureInPicture().catch(() => {}),
    fs: () => root.current.requestFullscreen?.(),
    mark: () => { const m = [...marks, Math.floor(s.t)]; setMarks(m); store.set('bm:' + v.id, m); emit({ type: 'bookmark', id: v.id, t: s.t }); },
  };
  const onKey = e => { const k = e.key;
    if (k === ' ') A.toggle(); else if (k === 'ArrowRight') A.skip(10); else if (k === 'ArrowLeft') A.skip(-10);
    else if (k === 'm') A.vol(s.vol ? 0 : 1); else if (k === 'f') A.fs(); else if (k === 'c') A.cc();
    else if (k === 't') up({ theater: !s.theater }); else if (k === 'b') A.mark(); else return;
    e.preventDefault(); };

  async function toggleAgent() {
    const a = ag.current;
    if (agent === 'live') { clearInterval(a.iv); a.mic.close(); await a.cl.leave(); return setAgent('idle'); }
    try {
      setAgent('starting');
      const r = await (await fetch(api + '/api/agent/start', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ videoId: v.id }) })).json();
      if (r.error) throw new Error(r.error);
      a.cl = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
      a.cl.on('user-published', async (u, t) => { await a.cl.subscribe(u, t); if (t === 'audio') u.audioTrack.play(); });
      await a.cl.join(r.appId, r.channel, r.token, r.uid);
      a.mic = await AgoraRTC.createMicrophoneAudioTrack(); await a.cl.publish(a.mic);
      a.iv = setInterval(() => setMic(m => ({ ...m, lvl: a.mic.getVolumeLevel() })), 150);   // mic level meter
      setAgent('live'); emit({ type: 'agent_start', id: v.id });
    } catch (e) { console.error(e); setAgent('error'); emit({ type: 'error', id: v.id, msg: String(e.message || e) }); }
  }
  const muteMic = () => { const m = !mic.muted; ag.current.mic.setEnabled(!m); setMic(x => ({ ...x, muted: m })); };

  return html`<section ref=${root} tabIndex="0" onKeyDown=${onKey}
    class="h-full overflow-y-auto rounded-2xl p-4 text-slate-100 outline-none ring-1 ring-white/10" style=${bgStyle(v, s.theater)}
    onMouseEnter=${() => window.dispatchEvent(new CustomEvent('mstv-cat', { detail: v.icon }))}>
    <div class="mb-2 flex items-center justify-between pr-10"><div class="flex flex-wrap items-center gap-2"><h2 class="text-lg font-semibold">${v.title}</h2><${Badge} v=${v}/></div>
      <span class="rounded bg-slate-800 px-2 py-1 text-xs">${net ? '📶 ' + net : ''}</span></div>
    <div class="relative aspect-video overflow-hidden rounded-xl bg-black">
      <iframe key=${key} ref=${frame} class="h-full w-full" allow="autoplay; fullscreen; picture-in-picture" title=${v.title}
        src=${'https://player.vimeo.com/video/' + v.id}></iframe>
      ${s.buf && html`<${Spinner}/>`}
      ${s.err && html`<${ErrorOverlay} msg=${s.err} retry=${() => { up({ err: null }); setKey(k => k + 1); }}/>`}
      ${model && html`<${ModelCanvas} key=${model} src=${model} v=${v}/>`}
    </div>
    <div class="mt-2 flex items-center gap-2 text-xs"><span>${fmt(s.t)}</span>
      <input type="range" class="flex-1" min="0" max=${s.d || 1} step="1" value=${s.t} onInput=${e => p().setCurrentTime(+e.target.value)}/>
      <span>${fmt(s.d)}</span></div>
    <div class="mt-2 flex flex-wrap items-center gap-2">
      <${Btn} on=${A.toggle} title="Play/pause (Space)">${s.playing ? '⏸' : '▶️'}<//>
      <${Btn} on=${() => A.skip(-10)} title="Back 10s (←)">⏪10<//><${Btn} on=${() => A.skip(10)} title="Forward 10s (→)">10⏩<//>
      <${Pick} title="Speed" value=${s.rate} on=${A.rate} options=${[0.5, 0.75, 1, 1.25, 1.5, 2].map(x => [x, x + '×'])}/>
      <${Pick} title="Quality" value=${s.q} on=${A.quality} options=${s.qs.length ? s.qs.map(q => [q.id, q.label]) : [['auto', 'Auto']]}/>
      <${Btn} on=${A.cc} active=${s.cc} title="Captions (C)">CC<//><${Btn} on=${A.loop} active=${s.loop} title="Loop">🔁<//>
      <${Btn} on=${A.pip} title="Picture-in-picture">🗗<//><${Btn} on=${A.fs} title="Fullscreen (F)">⛶<//>
      <${Btn} on=${() => up({ theater: !s.theater })} active=${s.theater} title="Theater mode (T)">🎭<//>
      <${Btn} on=${A.mark} title="Bookmark (B)">🔖<//>
      <input type="range" title="Volume" min="0" max="1" step="0.05" value=${s.vol} class="w-20" onInput=${e => A.vol(e.target.value)}/>
    </div>
    ${marks.length > 0 && html`<div class="mt-2 flex flex-wrap gap-1 text-xs">${marks.map((m, i) =>
      html`<button key=${i} class="rounded bg-slate-800 px-2 py-0.5" onClick=${() => p().setCurrentTime(m)}>🔖 ${fmt(m)}</button>`)}</div>`}
    <div class="mt-3 flex items-center gap-2">
      <button onClick=${toggleAgent} disabled=${agent === 'starting'}
        class=${'rounded-lg px-4 py-2 text-sm font-medium ' + (agent === 'live' ? 'bg-rose-600' : 'bg-indigo-600 hover:bg-indigo-500')}>
        ${agent === 'live' ? '⚠️ Guide Assistant' : agent === 'starting' ? 'Starting…' : agent === 'error' ? 'Error – retry' : '🎙️ Ask AI about this video'}</button>
      ${agent === 'live' && html`<${Btn} on=${muteMic} active=${mic.muted} title="Mute mic">${mic.muted ? '🔇' : '🎤'}<//><${MicMeter} level=${mic.lvl}/>`}
    </div>
    <${Fact} v=${v}/><${LiveMetrics} v=${v} api=${api}/><${PdfButton} v=${v} marks=${marks}/>
    <p class="mt-2 text-[11px] text-slate-500">Space play · ←/→ ±10s · M mute · F fullscreen · C captions · T theater · B bookmark</p>
  </section>`;
}
window.mountVideoCard = (el, json, api) => ReactDOM.createRoot(el).render(html`<${VideoCard} v=${JSON.parse(json)} api=${api}/>`);
