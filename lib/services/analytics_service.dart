import 'dart:async';
import 'package:dio/dio.dart';

class AnalyticsService {
  AnalyticsService(this._dio);
  final Dio _dio;
  final _q = <Map<String, dynamic>>[];
  Timer? _t;

  void track(Map<String, dynamic> e) { _q.add(e); _t ??= Timer(const Duration(seconds: 5), flush); }

  Future<void> flush() async {
    _t = null;
    if (_q.isEmpty) return;
    final batch = List.of(_q); _q.clear();
    try { await _dio.post('/api/events', data: {'events': batch}); } catch (_) {}
  }
}

