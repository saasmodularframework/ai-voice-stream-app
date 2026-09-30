import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'data/network/dio_client.dart';
import 'pages/home_page.dart';
import 'services/analytics_service.dart';
import 'services/video_api_service.dart';
import 'services/app_state.dart';
import 'services/react_bridge.dart';
import 'services/toast_service.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final state = AppState(await SharedPreferences.getInstance());
  final dio = DioClient().instance;
  final bridge = ReactBridge(state, AnalyticsService(dio));
  runApp(ListenableBuilder(
      listenable: state,
      builder: (_, __) => MaterialApp(
            debugShowCheckedModeBanner: false,
            scaffoldMessengerKey: messengerKey,
            themeMode: state.dark ? ThemeMode.dark : ThemeMode.light,
            theme: ThemeData.light(useMaterial3: true),
            darkTheme: ThemeData.dark(useMaterial3: true),
            home: HomePage(state: state, api: VideoApiService(dio), bridge: bridge),
          )));
}
