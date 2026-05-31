import React, { useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Notifications from 'expo-notifications';
import { AuthProvider } from './src/context/AuthContext';
import { AiFlowProvider } from './src/context/AiFlowContext';
import AppNavigator from './src/navigation/AppNavigator';
import { notificationService } from './src/services/notificationService';

export default function App() {
  const notifListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    notificationService.scheduleDailyReminder();

    notifListener.current = Notifications.addNotificationReceivedListener(() => {});

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const screen = response.notification.request.content.data?.screen;
      if (screen) {
      }
    });

    return () => {
      notifListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <AiFlowProvider>
          <StatusBar style="dark" />
          <AppNavigator />
        </AiFlowProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
