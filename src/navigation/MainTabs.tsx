import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import LiveScreen from '../screens/LiveScreen';
import SleepScreen from '../screens/SleepScreen';
import InsightsScreen from '../screens/InsightsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  const { colors } = useTheme();
  const { t } = useLanguage();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: t('home') }} />
      <Tab.Screen name="Live" component={LiveScreen} options={{ tabBarLabel: t('live') }} />
      <Tab.Screen name="Sleep" component={SleepScreen} options={{ tabBarLabel: t('sleep') }} />
      <Tab.Screen name="Insights" component={InsightsScreen} options={{ tabBarLabel: t('insights') }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ tabBarLabel: t('settings') }} />
    </Tab.Navigator>
  );
}