import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Tabs from './Tabs';
import SymptomStep1Screen from '../screens/SymptomStep1Screen';
import SymptomStep2Screen from '../screens/SymptomStep2Screen';
import SymptomReviewScreen from '../screens/SymptomReviewScreen';
import SymptomResultScreen from '../screens/SymptomResultScreen';
import CommunityScreen from '../screens/CommunityScreen';
import CommunityNewPostScreen from '../screens/CommunityNewPostScreen';
import NearbyServicesScreen from '../screens/NearbyServicesScreen';
import PlaceDetailScreen from '../screens/PlaceDetailScreen';
import ShopScreen from '../screens/ShopScreen';
import PetDetailScreen from '../screens/PetDetailScreen';
import PetVaccinesScreen from '../screens/PetVaccinesScreen';
import PetNewLogScreen from '../screens/PetNewLogScreen';
import PetNewScreen from '../screens/PetNewScreen';
import PetSwitcherScreen from '../screens/PetSwitcherScreen';
import SignInScreen from '../screens/SignInScreen';
import SignUpScreen from '../screens/SignUpScreen';
import AuthOtpScreen from '../screens/AuthOtpScreen';
import { useAuth } from '../context/AuthContext';
import theme from '../theme';

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
  const { isAuthenticated, isAuthLoading, signOut } = useAuth();

  if (isAuthLoading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <Stack.Navigator
        screenOptions={{
          headerShown: false
        }}
      >
        <Stack.Screen name="SignIn" component={SignInScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="AuthOtp" component={AuthOtpScreen} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false
      }}
    >
      <Stack.Screen name="Tabs">
        {(props) => <Tabs {...props} onLogout={signOut} />}
      </Stack.Screen>
      <Stack.Screen name="SymptomStep1" component={SymptomStep1Screen} />
      <Stack.Screen name="SymptomStep2" component={SymptomStep2Screen} />
      <Stack.Screen name="SymptomReview" component={SymptomReviewScreen} />
      <Stack.Screen name="SymptomResult" component={SymptomResultScreen} />
      <Stack.Screen name="Community" component={CommunityScreen} />
      <Stack.Screen name="CommunityNew" component={CommunityNewPostScreen} />
      <Stack.Screen name="NearbyServices" component={NearbyServicesScreen} />
      <Stack.Screen name="PlaceDetail" component={PlaceDetailScreen} />
      <Stack.Screen name="Shop" component={ShopScreen} />
      <Stack.Screen name="PetDetail" component={PetDetailScreen} />
      <Stack.Screen name="PetVaccines" component={PetVaccinesScreen} />
      <Stack.Screen name="PetNewLog" component={PetNewLogScreen} />
      <Stack.Screen name="PetNew" component={PetNewScreen} />
      <Stack.Screen name="PetSwitcher" component={PetSwitcherScreen} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background
  }
});

export default RootNavigator;
