import React from 'react';
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider } from './src/context/ThemeContext';
import { LanguageProvider } from './src/context/LanguageContext';
import { RoomProvider } from './src/context/RoomContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <RoomProvider>
          <AuthProvider>
            <AppNavigator />
          </AuthProvider>
        </RoomProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}