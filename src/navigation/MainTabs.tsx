import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import PagerView from 'react-native-pager-view';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import LiveScreen from '../screens/LiveScreen';
import SleepScreen from '../screens/SleepScreen';
import InsightsScreen from '../screens/InsightsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const TAB_NAMES = ['Home', 'Live', 'Sleep', 'Insights', 'Settings'];

const ICONS: Record<string, { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }> = {
  Home: { active: 'home', inactive: 'home-outline' },
  Live: { active: 'videocam', inactive: 'videocam-outline' },
  Sleep: { active: 'moon', inactive: 'moon-outline' },
  Insights: { active: 'bar-chart', inactive: 'bar-chart-outline' },
  Settings: { active: 'settings', inactive: 'settings-outline' },
};

export default function MainTabs({ navigation: parentNavigation }: any) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const pagerRef = useRef<PagerView>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  function goToTab(index: number) {
    pagerRef.current?.setPage(index);
    setActiveIndex(index);
  }

  const tabAwareNavigation = {
    ...parentNavigation,
    navigate: (name: string, params?: any) => {
      const idx = TAB_NAMES.indexOf(name);
      if (idx !== -1) {
        goToTab(idx);
      } else {
        parentNavigation.navigate(name, params);
      }
    },
  };

  const labels: Record<string, string> = {
    Home: t('home'),
    Live: t('live'),
    Sleep: t('sleep'),
    Insights: t('insights'),
    Settings: t('settings'),
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <PagerView
        ref={pagerRef}
        style={{ flex: 1 }}
        initialPage={0}
        onPageSelected={(e) => setActiveIndex(e.nativeEvent.position)}
      >
        <View key="0" style={{ flex: 1 }}>
          <HomeScreen navigation={tabAwareNavigation} />
        </View>
        <View key="1" style={{ flex: 1 }}>
          <LiveScreen navigation={tabAwareNavigation} />
        </View>
        <View key="2" style={{ flex: 1 }}>
          <SleepScreen navigation={tabAwareNavigation} />
        </View>
        <View key="3" style={{ flex: 1 }}>
          <InsightsScreen navigation={tabAwareNavigation} />
        </View>
        <View key="4" style={{ flex: 1 }}>
          <SettingsScreen navigation={tabAwareNavigation} />
        </View>
      </PagerView>

      <View
        style={[
          styles.tabBar,
          {
            backgroundColor: colors.card,
          },
        ]}
      >
        {TAB_NAMES.map((name, index) => {
          const focused = activeIndex === index;
          const iconSet = ICONS[name];
          const iconName = focused ? iconSet.active : iconSet.inactive;
          const color = focused ? colors.primary : colors.textMuted;
          return (
            <TouchableOpacity key={name} style={styles.tabItem} onPress={() => goToTab(index)}>
              <Ionicons name={iconName} size={22} color={color} />
              <Text style={[styles.tabLabel, { color }]}>{labels[name]}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    height: Platform.OS === 'ios' ? 84 : 66,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 28 : 10,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
});