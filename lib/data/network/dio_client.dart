import 'package:dio/dio.dart';
import '../../config/api_config.dart';

const apiBase = ApiConfig.baseUrl;

class DioClient {
  late final Dio _dio;

  DioClient() {
    _dio = Dio(BaseOptions(
      baseUrl: ApiConfig.baseUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
      headers: ApiConfig.headers,
    ))
      ..interceptors.addAll([
        _retry(),
        LogInterceptor(request: true, requestBody: false, responseBody: false, error: true),
      ]);
  }

  Interceptor _retry() => InterceptorsWrapper(onError: (e, h) async {
        final n = (e.requestOptions.extra['n'] ?? 0) as int;
        if (n < 2 && e.type != DioExceptionType.badResponse) {
          e.requestOptions.extra['n'] = n + 1;
          await Future.delayed(Duration(milliseconds: 400 * (n + 1)));
          try {
            return h.resolve(await _dio.fetch(e.requestOptions));
          } catch (_) {}
        }
        h.next(e);
      });

  Dio get instance => _dio;
}
