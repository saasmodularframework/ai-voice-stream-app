import 'dart:js_interop';
import 'package:flutter/foundation.dart';
import 'package:web/web.dart' as web;

ValueNotifier<bool> watchOnline() {
  final n = ValueNotifier<bool>(web.window.navigator.onLine);
  web.window.addEventListener('online', ((web.Event _) => n.value = true).toJS);
  web.window.addEventListener('offline', ((web.Event _) => n.value = false).toJS);
  return n;
}
