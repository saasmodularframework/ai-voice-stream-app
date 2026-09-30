import 'package:flutter/material.dart';

final messengerKey = GlobalKey<ScaffoldMessengerState>();

void toast(String m) => messengerKey.currentState
  ?..hideCurrentSnackBar()
  ..showSnackBar(SnackBar(content: Text(m), behavior: SnackBarBehavior.floating));
