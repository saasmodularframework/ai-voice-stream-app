// index.js
const express = require('express');
const path = require('path');
const { Readable } = require('stream');
const { Sequelize, DataTypes } = require('sequelize');
const { RtcTokenBuilder, RtcRole } = require('agora-token');
const videos = require('../data/videos.json');
const E = process.env;

const sequelize = E.DATABASE_URL
  ? new Sequelize(E.DATABASE_URL, { logging: false, dialectModule: require('pg') })
  : new Sequelize({ dialect: 'sqlite', storage: '/tmp/app.sqlite', logging: false });
const Session = sequelize.define('Session', { videoId: DataTypes.STRING, channel: DataTypes.STRING, agentId: DataTypes.STRING });
const Message = sequelize.define('Message', { role: DataTypes.STRING, content: DataTypes.TEXT });
Session.hasMany(Message);
const Event = sequelize.define('Event', { type: DataTypes.STRING, videoId: DataTypes.STRING, payload: DataTypes.TEXT });
const ready = sequelize.sync();

const app = express();
app.use(express.json({ limit: '2mb' }));
app.use(async (_q, _s, n) => { await ready; n(); });

app.get('/api/videos', (q, r) => { const s = (q.query.q || '').toLowerCase(), c = q.query.category;
  r.json(videos.filter(v => (!c || c === 'All' || v.category === c) && (v.title + ' ' + v.context).toLowerCase().includes(s))); });

app.post('/api/agent/start', async (q, r) => {
  try {
    const video = videos.find(v => v.id === q.body.videoId);
    if (!video) return r.status(404).json({ error: 'unknown video' });
    const channel = 'vid-' + video.id + '-' + Date.now(), userUid = Math.floor(Math.random() * 1e6) + 1000, agentUid = 1;
    const exp = Math.floor(Date.now() / 1000) + 3600;
    const tok = uid => RtcTokenBuilder.buildTokenWithUid(E.AGORA_APP_ID, E.AGORA_APP_CERT, channel, uid, RtcRole.PUBLISHER, exp, exp);
    const session = await Session.create({ videoId: video.id, channel });
    const auth = Buffer.from(`${E.AGORA_CUSTOMER_KEY}:${E.AGORA_CUSTOMER_SECRET}`).toString('base64');
    const resp = await fetch(`https://api.agora.io/api/conversational-ai-agent/v2/projects/${E.AGORA_APP_ID}/join`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Basic ' + auth },
      body: JSON.stringify({ name: 'agent-' + session.id + '-' + Date.now(), properties: {
        channel, token: tok(agentUid), agent_rtc_uid: String(agentUid), remote_rtc_uids: [String(userUid)],
        llm: { url: `${E.PUBLIC_URL}/api/llm?session=${session.id}`, api_key: 'unused',
               system_messages: [{ role: 'system', content: `You discuss a video titled "${video.title}" about microservice architecture. Context: ${video.context}. Keep answers short and spoken-friendly.` }],
               params: { model: E.OLLAMA_MODEL || 'llama3.1' } },
      } }) });
    const data = await resp.json();
    await session.update({ agentId: data.agent_id });
    r.json({ appId: E.AGORA_APP_ID, channel, uid: userUid, token: tok(userUid), sessionId: session.id });
  } catch (e) { r.status(500).json({ error: String(e) }); }
});

app.post('/api/llm', async (q, r) => {
  try {
    const msgs = q.body.messages || [], last = msgs[msgs.length - 1];
    if (q.query.session && last) await Message.create({ SessionId: q.query.session, role: last.role, content: String(last.content) });
    const up = await fetch(`${E.OLLAMA_URL}/v1/chat/completions`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...q.body, model: E.OLLAMA_MODEL || 'llama3.1' }) });
    r.status(up.status); r.setHeader('Content-Type', up.headers.get('content-type') || 'application/json');
    Readable.fromWeb(up.body).pipe(r);
  } catch (e) { r.status(502).json({ error: String(e) }); }
});

app.post('/api/events', async (q, r) => { await Event.bulkCreate((q.body.events || []).slice(0, 50).map(e => ({ type: e.type, videoId: e.id, payload: JSON.stringify(e) }))); r.json({ ok: true }); });
app.get('/api/videos/:id/live-data', async (q, r) => { const w = { videoId: q.params.id };
  const [plays, bookmarks] = await Promise.all(['play', 'bookmark'].map(type => Event.count({ where: { ...w, type } })));
  r.json({ plays, bookmarks, sessions: await Session.count({ where: w }) }); });
app.get('/api/sessions', async (_q, r) => r.json(await Session.findAll({ include: Message, order: [['id', 'DESC']], limit: 20 })));

app.use(express.static(path.join(__dirname, '../public')));
module.exports = app;
if (require.main === module) app.listen(3000, () => console.log('http://localhost:3000'));
