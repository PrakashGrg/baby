import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import MainTabs from './MainTabs';
import ChildModeScreen from '../screens/ChildModeScreen';
import BabyProfileScreen from '../screens/BabyProfileScreen';
import DevicesScreen from '../screens/DevicesScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import PrivacyScreen from '../screens/PrivacyScreen';
import HelpScreen from '../screens/HelpScreen';
import AboutScreen from '../screens/AboutScreen';
import LanguageScreen from '../screens/LanguageScreen';
import { colors } from '../theme';

const Stack = createNativeStackNavigator();

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen
            name="ChildMode"
            component={ChildModeScreen}
            options={{ presentation: 'fullScreenModal' }}
          />
          <Stack.Screen name="BabyProfile" component={BabyProfileScreen} />
          <Stack.Screen name="Devices" component={DevicesScreen} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} /><Stack.Screen name="Privacy" component={PrivacyScreen} />
          <Stack.Screen name="Help" component={HelpScreen} />
          <Stack.Screen name="About" component={AboutScreen} />
          <Stack.Screen name="Language" component={LanguageScreen} />
        </Stack.Navigator>
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});