 import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';


class AppState extends ChangeNotifier {
  AppState(SharedPreferences p)
      : _p = p,
        dark = p.getBool('dark') ?? true,
        favorites = {...?p.getStringList('favs')},
        history = (jsonDecode(p.getString('hist') ?? '{}') as Map).map((k, v) => MapEntry('$k', (v as num).toDouble()));

  final SharedPreferences _p;
  bool dark;
  final Set<String> favorites;
  final Map<String, double> history;
  String query = '', category = 'All';
  String? activeId;

  void toggleTheme() { dark = !dark; _p.setBool('dark', dark); notifyListeners(); }
  void toggleFav(String id) {
    favorites.contains(id) ? favorites.remove(id) : favorites.add(id);
    _p.setStringList('favs', favorites.toList()); notifyListeners();
  }
  void setProgress(String id, double t) { history[id] = t; _p.setString('hist', jsonEncode(history)); notifyListeners(); }
  void setActive(String id) { activeId = id; notifyListeners(); }
  void setQuery(String q) { query = q; notifyListeners(); }
  void setCategory(String c) { category = c; notifyListeners(); }
}
