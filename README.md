# Microservice TV — Flutter Web (React cards embedded) + Express/Sequelize on Vercel
```
api/index.js        Express: /api/videos, /api/agent/start, /api/llm (Ollama proxy), /api/events, /api/sessions (Sequelize)
data/videos.json    Vimeo ids (REPLACE_*), titles, categories
public/             Vercel static output (Flutter build + models)
scripts/gen-glb.js  Generates 10 computer .glb models
lib/data/network/dio_client.dart · lib/data/videos.dart · lib/models/ · lib/services/ · lib/widgets/ · lib/pages/
web/index.html + web/react/{bridge,controls,player-card}.js   React components mounted by Flutter (HtmlElementView)
chrome-extension/   Detects Vimeo videos on any page
```
Run: `npm i && npm run models && npm run dev`, then `flutter create . --platforms web && flutter run -d chrome --dart-define=API=http://localhost:3000`
Deploy: `npm run build:web && vercel --prod`. Env vars: see .env.example. Ollama must be internet-reachable.

