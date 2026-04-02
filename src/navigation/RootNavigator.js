import React, { useState } from 'react';
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
import AuthMethodScreen from '../screens/AuthMethodScreen';
import AuthPhoneScreen from '../screens/AuthPhoneScreen';
import AuthOtpScreen from '../screens/AuthOtpScreen';

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return (
      <Stack.Navigator
        screenOptions={{
          headerShown: false
        }}
      >
        <Stack.Screen name="SignIn">
          {(props) => <SignInScreen {...props} onAuthenticated={() => setIsAuthenticated(true)} />}
        </Stack.Screen>
        <Stack.Screen name="SignUp">
          {(props) => <SignUpScreen {...props} onAuthenticated={() => setIsAuthenticated(true)} />}
        </Stack.Screen>
        <Stack.Screen name="AuthMethod" component={AuthMethodScreen} />
        <Stack.Screen name="AuthPhone" component={AuthPhoneScreen} />
        <Stack.Screen name="AuthOtp">
          {(props) => <AuthOtpScreen {...props} onAuthenticated={() => setIsAuthenticated(true)} />}
        </Stack.Screen>
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
        {(props) => <Tabs {...props} onLogout={() => setIsAuthenticated(false)} />}
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

export default RootNavigator;
