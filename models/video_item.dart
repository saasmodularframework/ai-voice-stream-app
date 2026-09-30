import 'package:flutter/material.dart';

class VideoBackground {
  final String top, bottom; 
  const VideoBackground({required this.top, required this.bottom});
  static Color _c(String h) => Color(int.parse('FF${h.substring(1)}', radix: 16));
  Color get topColor => _c(top);
  Color get bottomColor => _c(bottom);
  Map<String, String> toJson() => {'top': top, 'bottom': bottom};
}

class VideoItem {
  final String id, title, context, category, icon, type, fact; 
  final double cameraDistance;
  final VideoBackground background;
  const VideoItem({
    required this.id, required this.title, required this.context, required this.category,
    required this.icon, required this.type, required this.fact,
    required this.cameraDistance, required this.background,
  });
  factory VideoItem.fromJson(Map j) => VideoItem(
        id: '${j['id']}', title: '${j['title']}', context: '${j['context']}',
        category: '${j['category'] ?? 'General'}', icon: '${j['icon'] ?? 'fa-arrow-pointer'}',
        type: '${j['type'] ?? '3d'}', fact: '${j['fact'] ?? ''}',
        cameraDistance: (j['cameraDistance'] as num? ?? 9).toDouble(),
        background: VideoBackground(top: '${(j['background'] as Map)['top']}', bottom: '${(j['background'] as Map)['bottom']}'),
      );
  Map<String, dynamic> toJson() => {
        'id': id, 'title': title, 'context': context, 'category': category, 'icon': icon, 'type': type,
        'fact': fact, 'cameraDistance': cameraDistance, 'background': background.toJson(),
      };
}
