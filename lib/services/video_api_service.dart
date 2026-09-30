import 'dart:convert';
import 'package:dio/dio.dart';
import '../data/videos.dart';
import '../models/video_item.dart';
import 'toast_service.dart';

class VideoApiService {
  VideoApiService(this._dio);
  final Dio _dio;

  Future<dynamic> _get(String path, [Map<String, dynamic>? query]) async {
    final r = await _dio.get(path, queryParameters: query);
    return r.data is String ? jsonDecode(r.data) : r.data;
  }

  Future<List<VideoItem>> fetchVideos({String? query, String? category}) async {
    try {
      final d = await _get('/api/videos', {
        if (query != null && query.isNotEmpty) 'q': query,
        if (category != null && category != 'All') 'category': category,
      });
      return (d as List).map((j) => VideoItem.fromJson(j as Map)).toList();
    } catch (_) {
      toast('Server unreachable – showing bundled list');
      return fallbackVideos;
    }
  }

  Future<List<VideoItem>> search(String q) => fetchVideos(query: q);

  Future<Map<String, dynamic>> liveData(String id) async =>
      Map<String, dynamic>.from(await _get('/api/videos/$id/live-data'));
}

