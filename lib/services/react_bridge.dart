import 'dart:convert';
import 'dart:js_interop';
import 'dart:ui_web' as ui_web;
import 'package:web/web.dart' as web;
import '../data/network/dio_client.dart';
import '../models/video_item.dart';
import 'analytics_service.dart';
import 'app_state.dart';
import 'toast_service.dart';

@JS('mountVideoCard')
external void _mount(web.HTMLElement el, JSString json, JSString api);

class ReactBridge {
  ReactBridge(this.state, this.analytics);
  final AppState state;
  final AnalyticsService analytics;
  final _reg = <String>{};

  String viewType(VideoItem v) {
    final t = 'react-card-${v.id}';
    if (_reg.add(t)) {
      ui_web.platformViewRegistry.registerViewFactory(t, (int _) {
        final el = web.document.createElement('div') as web.HTMLElement;
        el.style.width = '100%';
        el.style.height = '100%';
        _mount(el, jsonEncode(v.toJson()).toJS, apiBase.toJS);
        return el;
      });
    }
    return t;
  }

  void listen({required void Function(String id) onEnded}) {
    web.window.addEventListener('mstv', ((web.Event e) {
      final m = jsonDecode(((e as web.CustomEvent).detail as JSString).toDart) as Map;
      analytics.track(Map<String, dynamic>.from(m));
      switch (m['type']) {
        case 'progress': state.setProgress('${m['id']}', (m['t'] as num).toDouble());
        case 'play': state.setActive('${m['id']}');
        case 'ended': onEnded('${m['id']}');
        case 'error': toast('Video error: ${m['msg'] ?? 'playback failed'}');
        case 'bookmark': toast('Bookmark saved');
      }
    }).toJS);
  }

  void play(String id) =>
      web.window.dispatchEvent(web.CustomEvent('mstv-play', web.CustomEventInit(detail: id.toJS)));
}
