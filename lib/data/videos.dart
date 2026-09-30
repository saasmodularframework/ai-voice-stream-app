import '../models/video_item.dart';

/// Bundled scene list (mirrors data/videos.json) used when the API is unreachable.
/// Replace REPLACE_* with real Vimeo ids.
const fallbackVideos = <VideoItem>[
  VideoItem(id: 'vimeo_id01', title: 'Microservices: the big picture', context: 'Decomposing a monolith into independently deployable services.', category: 'Fundamentals', icon: 'fa-cubes', type: '3d',
    fact: 'Netflix runs on hundreds of microservices, each owned by a small team.', cameraDistance: 9,
    background: VideoBackground(top: '#0b3d16', bottom: '#1c5c2a')),
  VideoItem(id: 'vimeo_id02', title: 'API gateways & service discovery', context: 'Routing, discovery, and edge concerns in microservices.', category: 'Networking', icon: 'fa-network-wired', type: '3d',
    fact: 'An API gateway gives clients one entry point to many services.', cameraDistance: 9,
    background: VideoBackground(top: '#012a4a', bottom: '#01497c')),
  VideoItem(id: 'vimeo_id03', title: 'Event-driven messaging', context: 'Kafka/queues, async communication, eventual consistency.', category: 'Messaging', icon: 'fa-envelope', type: '3d',
    fact: 'Event-driven systems trade immediate consistency for looser coupling.', cameraDistance: 9,
    background: VideoBackground(top: '#3a4a4f', bottom: '#7c9a92')),
  VideoItem(id: 'vimeo_id04', title: 'Data per service & sagas', context: 'Database-per-service and saga pattern for distributed transactions.', category: 'Data', icon: 'fa-database', type: '2d',
    fact: 'Each service owning its database avoids shared-schema coupling.', cameraDistance: 6,
    background: VideoBackground(top: '#7a4a1f', bottom: '#e9c46a')),
  VideoItem(id: 'vimeo_id05', title: 'Resilience patterns', context: 'Circuit breakers, retries, bulkheads, timeouts.', category: 'Resilience', icon: 'fa-shield-halved', type: '3d',
    fact: 'A circuit breaker stops calling a failing service so it can recover.', cameraDistance: 9,
    background: VideoBackground(top: '#123524', bottom: '#2e6b46')),
  VideoItem(id: 'vimeo_id06', title: 'Observability', context: 'Tracing, metrics, and logs across services.', category: 'Operations', icon: 'fa-chart-line', type: '2d',
    fact: 'Distributed tracing follows one request across every service it touches.', cameraDistance: 6,
    background: VideoBackground(top: '#0a1e3f', bottom: '#3a6ea5')),
];
