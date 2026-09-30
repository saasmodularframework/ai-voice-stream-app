import 'package:flutter/material.dart';
import '../models/video_item.dart';
import '../services/video_api_service.dart';
import '../services/app_state.dart';
import '../services/connectivity_service.dart';
import '../services/react_bridge.dart';
import '../services/toast_service.dart';
import '../widgets/continue_watching_row.dart';
import '../widgets/fade_slide_in.dart';
import '../widgets/filter_bar.dart';
import '../widgets/offline_banner.dart';
import '../widgets/react_video_card.dart';
import '../widgets/scene_background.dart';
import '../widgets/scene_nav_bar.dart';
import '../widgets/skeleton_card.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key, required this.state, required this.api, required this.bridge});
  final AppState state;
  final VideoApiService api;
  final ReactBridge bridge;
  @override State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  late Future<List<VideoItem>> _f = widget.api.fetchVideos();
  final _sc = ScrollController();
  final _keys = <String, GlobalKey>{};
  final _online = watchOnline();
  List<VideoItem> _list = [];
  double _progress = 0;
  bool _showTop = false;

  @override
  void initState() {
    super.initState();
    _sc.addListener(() => setState(() {
          final m = _sc.position.maxScrollExtent;
          _progress = m > 0 ? _sc.offset / m : 0; 
          _showTop = _sc.offset > 500;            
        }));
    widget.bridge.listen(onEnded: _next);
  }

  void _next(String id) {
    final i = _list.indexWhere((v) => v.id == id);
    if (i < 0 || i + 1 >= _list.length) return;
    final n = _list[i + 1];
    toast('Up next: ${n.title}');
    final ctx = _keys[n.id]?.currentContext;
    if (ctx != null) Scrollable.ensureVisible(ctx, duration: const Duration(milliseconds: 600));
    Future.delayed(const Duration(milliseconds: 700), () => widget.bridge.play(n.id));
  }

  VideoItem? _active() { for (final v in _list) { if (v.id == widget.state.activeId) return v; } return null; }
  void _step(int d) {
    if (_list.isEmpty) return;
    final i = _list.indexWhere((v) => v.id == widget.state.activeId);
    final n = _list[(i < 0 ? 0 : i + d).clamp(0, _list.length - 1)];
    widget.state.setActive(n.id);
    _jump(n);
  }

  void _jump(VideoItem v) {
    final ctx = _keys[v.id]?.currentContext;
    if (ctx != null) Scrollable.ensureVisible(ctx, duration: const Duration(milliseconds: 500));
    widget.bridge.play(v.id);
  }

  @override
  Widget build(BuildContext context) {
    final s = widget.state;
    return Scaffold(
      appBar: AppBar(
        title: const Text('Microservice Architecture TV'),
        actions: [IconButton(tooltip: 'Toggle theme', icon: Icon(s.dark ? Icons.light_mode : Icons.dark_mode), onPressed: s.toggleTheme)],
        bottom: PreferredSize(preferredSize: const Size.fromHeight(3), child: LinearProgressIndicator(value: _progress, minHeight: 3)),
      ),
      floatingActionButton: _showTop
          ? FloatingActionButton.small(onPressed: () => _sc.animateTo(0, duration: const Duration(milliseconds: 500), curve: Curves.easeOut), child: const Icon(Icons.arrow_upward))
          : null,
      bottomNavigationBar: _list.isEmpty ? null : SceneNavBar(
          index: _list.indexWhere((v) => v.id == widget.state.activeId).clamp(0, _list.length - 1), total: _list.length,
          onPrev: () => _step(-1), onNext: () => _step(1)),
      body: SceneBackground(video: _active(), child: Column(children: [
        OfflineBanner(_online),
        Expanded(child: FutureBuilder<List<VideoItem>>(
          future: _f,
          builder: (c, snap) {
            if (!snap.hasData) {
              return ListView(padding: const EdgeInsets.all(16), children: [
                for (var i = 0; i < 3; i++) const Padding(padding: EdgeInsets.only(bottom: 16), child: SizedBox(height: 300, child: SkeletonCard())),
              ]);
            }
            _list = snap.data!;
            final cats = _list.map((v) => v.category).toSet().toList();
            return RefreshIndicator( // Feature: pull-to-refresh
              onRefresh: () async { setState(() => _f = widget.api.fetchVideos()); await _f; },
              child: ListenableBuilder(listenable: s, builder: (_, __) {
                final items = _list.where((v) =>
                    (s.category == 'All' || (s.category == '★ Favorites' ? s.favorites.contains(v.id) : v.category == s.category)) &&
                    ('${v.title} ${v.context}').toLowerCase().contains(s.query.toLowerCase())).toList();
                return CustomScrollView(controller: _sc, slivers: [
                  SliverToBoxAdapter(child: ContinueWatchingRow(state: s, videos: _list, onTap: _jump)),
                  SliverToBoxAdapter(child: FilterBar(state: s, categories: cats)),
                  if (items.isEmpty)
                    const SliverFillRemaining(hasScrollBody: false, child: Center(child: Text('No videos match your filters'))),
                  SliverPadding(padding: const EdgeInsets.all(16), sliver: SliverLayoutBuilder(builder: (_, k) => SliverGrid( // Feature: responsive grid
                    gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: k.crossAxisExtent > 1100 ? 2 : 1, mainAxisExtent: 700, mainAxisSpacing: 24, crossAxisSpacing: 24),
                    delegate: SliverChildBuilderDelegate(childCount: items.length, (_, i) => FadeSlideIn(
                        child: KeyedSubtree(key: _keys.putIfAbsent(items[i].id, () => GlobalKey()),
                            child: ReactVideoCard(video: items[i], bridge: widget.bridge, state: s)))),
                  ))),
                ]);
              }),
            );
          },
        )),
      ])),
    );
  }
}
