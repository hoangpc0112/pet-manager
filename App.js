import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';
import RootNavigator from './src/navigation/RootNavigator';
import { AppDataProvider } from './src/context/AppDataContext';
import { AuthProvider } from './src/context/AuthContext';

if (Constants.executionEnvironment !== 'storeClient') {
  import('expo-notifications')
    .then((Notifications) => {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
          shouldShowBanner: true,
          shouldShowList: true
        })
      });
    })
    .catch(() => {
      // Ignore notification setup failure outside development builds.
    });
}

export default function App() {
  return (
    <AuthProvider>
      <AppDataProvider>
        <NavigationContainer>
          <StatusBar style="dark" />
          <RootNavigator />
        </NavigationContainer>
      </AppDataProvider>
    </AuthProvider>
  );
}
