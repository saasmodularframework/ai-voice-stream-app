class ApiConfig {
  static const baseUrl = String.fromEnvironment('API', defaultValue: '');
  static const headers = {'Content-Type': 'application/json'};
}
