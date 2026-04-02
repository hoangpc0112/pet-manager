import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import theme from '../theme';
import HomeScreen from '../screens/HomeScreen';
import ExploreScreen from '../screens/ExploreScreen';
import PetsScreen from '../screens/PetsScreen';
import JournalScreen from '../screens/JournalScreen';
import RemindersScreen from '../screens/RemindersScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const Tabs = ({ onLogout }) => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E5E7EB',
          height: 64,
          paddingBottom: 10
        },
        tabBarLabelStyle: {
          fontSize: 11,
          marginTop: 2
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textLight,
        tabBarIcon: ({ color, size }) => {
          let name = 'home';
          if (route.name === 'Explore') name = 'compass';
          if (route.name === 'Pets') name = 'paw';
          if (route.name === 'Journal') name = 'document-text';
          if (route.name === 'Reminders') name = 'notifications';
          if (route.name === 'Profile') name = 'person';
          return <Ionicons name={name} size={22} color={color} />;
        }
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Trang chủ' }} />
      <Tab.Screen name="Explore" component={ExploreScreen} options={{ tabBarLabel: 'Khám phá' }} />
      <Tab.Screen name="Pets" component={PetsScreen} options={{ tabBarLabel: 'Thú cưng' }} />
      <Tab.Screen name="Journal" component={JournalScreen} options={{ tabBarLabel: 'Nhật ký' }} />
      <Tab.Screen name="Reminders" component={RemindersScreen} options={{ tabBarLabel: 'Nhắc nhở' }} />
      <Tab.Screen name="Profile" options={{ tabBarLabel: 'Hồ sơ' }}>
        {(props) => <ProfileScreen {...props} onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

export default Tabs;
