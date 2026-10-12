import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppTheme } from '../theme/AppTheme';
import ArshiaWatermark from '../components/ArshiaWatermark';
import PressableScale from '../components/PressableScale';
import { useAdmin } from '../context/AdminContext';

interface MenuEntry {
  screen: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

const ENTRIES: MenuEntry[] = [
  {
    screen: 'IranianSatellite',
    title: 'Iranian Satellite',
    description: 'GEM TV family, Manoto, BBC Persian and more, grouped by network.',
    icon: 'globe-outline',
    color: '#E63946',
  },
  {
    screen: 'Search',
    title: 'Search',
    description: 'Find a film or a channel by name across the whole catalogue.',
    icon: 'search-outline',
    color: '#3B82F6',
  },
  {
    screen: 'Series',
    title: 'Series',
    description: 'Seasons and episodes, with a continue-watching row.',
    icon: 'albums-outline',
    color: '#14B8A6',
  },
  {
    screen: 'Favorites',
    title: 'My Favorites',
    description: 'Everything you bookmarked, ready to play again.',
    icon: 'heart-outline',
    color: '#EC4899',
  },
  {
    screen: 'Subscription',
    title: 'Subscription',
    description: 'Arshia TV+ plans, online payment and card to card.',
    icon: 'card-outline',
    color: '#22C55E',
  },
  {
    screen: 'Admin',
    title: 'Manager panel',
    description: 'Owner sign-in: hide folders, remove channels, set the card number.',
    icon: 'shield-checkmark-outline',
    color: '#F59E0B',
  },
];

const INSTALL_STEPS = [
  'Arshia TV is a native app, so it installs on a phone like any other and opens full screen with its own icon.',
  'Build it from Snapp with the Publish button: Android gets a downloadable APK you can send to anyone, iPhone gets an App Store build.',
  'Everything in this app works the same once installed — live channels, folders, the subscription screen and the manager panel.',
];

interface MenuCardProps {
  entry: MenuEntry;
  index: number;
  onPress: () => void;
}

const MenuCard: React.FC<MenuCardProps> = ({ entry, index, onPress }) => {
  const enter = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(enter, {
      toValue: 1,
      duration: 420,
      delay: Math.min(index * 70, 350),
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [enter, index]);

  return (
    <Animated.View
      style={{
        opacity: enter,
        transform: [
          { translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [22, 0] }) },
        ],
      }}
    >
      <PressableScale onPress={onPress} style={styles.card} accessibilityLabel={entry.title}>
        <View style={[styles.cardIcon, { backgroundColor: entry.color + '26' }]}>
          <Ionicons name={entry.icon as any} size={20} color={entry.color} />
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle}>{entry.title}</Text>
          <Text style={styles.cardText}>{entry.description}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={AppTheme.colors.textMuted} />
      </PressableScale>
    </Animated.View>
  );
};

const MorePage: React.FC<any> = ({ navigation }) => {
  const { isAdmin } = useAdmin();
  const [installOpen, setInstallOpen] = useState(false);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title}>More from Arshia TV</Text>
            <Text style={styles.subtitle}>
              {isAdmin ? 'Signed in as the manager.' : 'Every shelf in one place.'}
            </Text>
          </View>
          {isAdmin ? (
            <View style={styles.adminPill}>
              <Ionicons name="shield-checkmark" size={12} color={AppTheme.colors.primary} />
              <Text style={styles.adminPillText}>Manager</Text>
            </View>
          ) : (
            <ArshiaWatermark size={11} />
          )}
        </View>

        {ENTRIES.map((entry, index) => (
          <MenuCard
            key={entry.screen}
            entry={entry}
            index={index}
            onPress={() => navigation.navigate(entry.screen)}
          />
        ))}

        <PressableScale
          onPress={() => setInstallOpen((prev) => !prev)}
          style={styles.card}
          accessibilityLabel="Install on your phone"
        >
          <View style={[styles.cardIcon, { backgroundColor: '#8B5CF626' }]}>
            <Ionicons name="phone-portrait-outline" size={20} color="#8B5CF6" />
          </View>
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>Install on your phone</Text>
            <Text style={styles.cardText}>How Arshia TV becomes an app on the home screen.</Text>
          </View>
          <Ionicons
            name={installOpen ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={AppTheme.colors.textMuted}
          />
        </PressableScale>

        {installOpen ? (
          <View style={styles.note}>
            <Ionicons name="phone-portrait-outline" size={18} color={AppTheme.colors.textMuted} />
            <View style={styles.noteBody}>
              {INSTALL_STEPS.map((step, index) => (
                <View key={step} style={styles.step}>
                  <View style={styles.stepBadge}>
                    <Text style={styles.stepBadgeText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.noteText}>{step}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppTheme.colors.background,
  },
  content: {
    paddingHorizontal: AppTheme.spacing.lg,
    paddingBottom: AppTheme.spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: AppTheme.spacing.sm,
    paddingBottom: AppTheme.spacing.lg,
  },
  headerText: {
    flex: 1,
    marginRight: AppTheme.spacing.sm,
  },
  title: {
    color: AppTheme.colors.text,
    fontSize: AppTheme.typography.fontSize.heading,
    fontWeight: AppTheme.typography.fontWeight.extrabold,
  },
  subtitle: {
    color: AppTheme.colors.textMuted,
    fontSize: AppTheme.typography.fontSize.sm,
    marginTop: 2,
  },
  adminPill: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 24,
    paddingHorizontal: 9,
    borderRadius: AppTheme.borderRadius.full,
    backgroundColor: AppTheme.colors.primary + '1F',
    borderWidth: 1,
    borderColor: AppTheme.colors.primary + '59',
  },
  adminPillText: {
    color: AppTheme.colors.primary,
    fontSize: 10,
    fontWeight: AppTheme.typography.fontWeight.bold,
    marginLeft: 4,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: AppTheme.spacing.md,
    marginBottom: AppTheme.spacing.md,
    borderRadius: AppTheme.borderRadius.lg,
    backgroundColor: AppTheme.colors.card,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    ...AppTheme.elevation.sm,
  },
  cardIcon: {
    width: 42,
    height: 42,
    borderRadius: AppTheme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: AppTheme.spacing.md,
  },
  cardBody: {
    flex: 1,
    marginRight: AppTheme.spacing.sm,
  },
  cardTitle: {
    color: AppTheme.colors.text,
    fontSize: AppTheme.typography.fontSize.lg,
    fontWeight: AppTheme.typography.fontWeight.bold,
  },
  cardText: {
    color: AppTheme.colors.textMuted,
    fontSize: AppTheme.typography.fontSize.sm,
    lineHeight: 18,
    marginTop: 3,
  },
  note: {
    flexDirection: 'row',
    marginBottom: AppTheme.spacing.md,
    padding: AppTheme.spacing.md,
    borderRadius: AppTheme.borderRadius.md,
    backgroundColor: AppTheme.colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
  },
  noteBody: {
    flex: 1,
    marginLeft: AppTheme.spacing.sm,
  },
  step: {
    flexDirection: 'row',
    marginBottom: AppTheme.spacing.sm,
  },
  stepBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppTheme.colors.secondary,
    marginRight: AppTheme.spacing.sm,
    marginTop: 1,
  },
  stepBadgeText: {
    color: AppTheme.colors.white,
    fontSize: 10,
    fontWeight: AppTheme.typography.fontWeight.bold,
  },
  noteText: {
    flex: 1,
    color: AppTheme.colors.textMuted,
    fontSize: AppTheme.typography.fontSize.sm,
    lineHeight: 18,
  },
});

export default MorePage;
