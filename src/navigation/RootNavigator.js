import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Tabs from './Tabs';
import SymptomStep1Screen from '../screens/SymptomStep1Screen';
import SymptomStep2Screen from '../screens/SymptomStep2Screen';
import SymptomReviewScreen from '../screens/SymptomReviewScreen';
import SymptomResultScreen from '../screens/SymptomResultScreen';
import CommunityScreen from '../screens/CommunityScreen';
import CommunityNewPostScreen from '../screens/CommunityNewPostScreen';
import PlaceDetailScreen from '../screens/PlaceDetailScreen';
import ShopScreen from '../screens/ShopScreen';

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false
      }}
    >
      <Stack.Screen name="Tabs" component={Tabs} />
      <Stack.Screen name="SymptomStep1" component={SymptomStep1Screen} />
      <Stack.Screen name="SymptomStep2" component={SymptomStep2Screen} />
      <Stack.Screen name="SymptomReview" component={SymptomReviewScreen} />
      <Stack.Screen name="SymptomResult" component={SymptomResultScreen} />
      <Stack.Screen name="Community" component={CommunityScreen} />
      <Stack.Screen name="CommunityNew" component={CommunityNewPostScreen} />
      <Stack.Screen name="PlaceDetail" component={PlaceDetailScreen} />
      <Stack.Screen name="Shop" component={ShopScreen} />
    </Stack.Navigator>
  );
};

export default RootNavigator;
