import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppTheme } from '../theme/AppTheme';
import InsetPressable from '../components/InsetPressable';
import PressableScale from '../components/PressableScale';
import { GROUPS } from '../data/channels';
import { DEFAULT_ADMIN_PIN, useAdmin } from '../context/AdminContext';

/**
 * The manager area.
 *
 * Unlock with the PIN and the tools that change the app appear: folders can be hidden
 * from everyone, removed channels can be restored, and the card-to-card details used by
 * the subscription screen are set here. Lock again and the app is a normal viewer for
 * whoever is holding the phone.
 */
const AdminPage: React.FC<any> = ({ navigation }) => {
  const {
    isAdmin,
    pin,
    unlock,
    lock,
    changePin,
    hiddenGroups,
    toggleGroup,
    removedChannelIds,
    restoreChannels,
    payCard,
    updatePayCard,
  } = useAdmin();

  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [newPin, setNewPin] = useState('');
  const [card, setCard] = useState(payCard);

  const submitPin = () => {
    if (unlock(pinInput)) {
      setPinInput('');
      setPinError('');
      return;
    }
    setPinError('That PIN does not match. Try again.');
  };

  const saveCard = () => {
    updatePayCard(card);
    Alert.alert('Saved', 'The card details now show on the subscription screen.');
  };

  const savePin = () => {
    if (newPin.trim().length < 4) {
      Alert.alert('Too short', 'Use at least four digits.');
      return;
    }
    changePin(newPin);
    setNewPin('');
    Alert.alert('PIN changed', 'Use the new PIN the next time you unlock.');
  };

  if (!isAdmin) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <PressableScale
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={19} color={AppTheme.colors.text} />
          </PressableScale>

          <View style={styles.lockIcon}>
            <Ionicons name="lock-closed" size={26} color={AppTheme.colors.primary} />
          </View>
          <Text style={styles.lockTitle}>Manager sign-in</Text>
          <Text style={styles.lockText}>
            Enter the manager PIN. Everyone else keeps using Arshia TV as a normal viewer.
          </Text>

          <TextInput
            value={pinInput}
            onChangeText={(value) => {
              setPinInput(value);
              setPinError('');
            }}
            placeholder="PIN"
            placeholderTextColor={AppTheme.colors.placeholder}
            keyboardType="number-pad"
            secureTextEntry
            maxLength={8}
            style={styles.input}
          />

          {pinError ? <Text style={styles.error}>{pinError}</Text> : null}

          <PressableScale onPress={submitPin} style={styles.primaryButton} accessibilityLabel="Unlock manager mode">
            <Ionicons name="key-outline" size={17} color={AppTheme.colors.white} />
            <Text style={styles.primaryButtonText}>Unlock</Text>
          </PressableScale>

          {pin === DEFAULT_ADMIN_PIN ? (
            <View style={styles.note}>
              <Ionicons name="information-circle-outline" size={18} color={AppTheme.colors.textMuted} />
              <Text style={styles.noteText}>
                The PIN is still the factory one: {DEFAULT_ADMIN_PIN}. Change it from this screen
                once you are in.
              </Text>
            </View>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <PressableScale
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={19} color={AppTheme.colors.text} />
          </PressableScale>
          <View style={styles.headerText}>
            <Text style={styles.title}>Manager panel</Text>
            <Text style={styles.subtitle}>Signed in as the owner of Arshia TV.</Text>
          </View>
          <PressableScale onPress={lock} style={styles.lockButton} accessibilityLabel="Lock manager mode">
            <Ionicons name="lock-closed-outline" size={16} color={AppTheme.colors.text} />
          </PressableScale>
        </View>

        <Text style={styles.sectionLabel}>Folders everyone sees</Text>
        {GROUPS.map((group) => {
          const hidden = hiddenGroups.includes(group.key);
          return (
            <InsetPressable
              key={group.key}
              onPress={() => toggleGroup(group.key)}
              accent={hidden ? undefined : group.color}
              style={styles.row}
              accessibilityLabel={`${group.label} folder`}
            >
              <View style={[styles.rowIcon, { backgroundColor: group.color + '2E' }]}>
                <Ionicons name={group.icon as any} size={16} color={group.color} />
              </View>
              <Text style={styles.rowLabel}>{group.label}</Text>
              <View style={[styles.switchPill, hidden ? styles.switchOff : styles.switchOn]}>
                <Text style={[styles.switchText, hidden ? styles.switchTextOff : styles.switchTextOn]}>
                  {hidden ? 'Hidden' : 'Visible'}
                </Text>
              </View>
            </InsetPressable>
          );
        })}

        <Text style={styles.sectionLabel}>Removed channels</Text>
        <View style={styles.cardBox}>
          <Text style={styles.cardBoxText}>
            {removedChannelIds.length === 0
              ? 'You have not removed any channel. Long-press a channel button on the Live TV page to remove it.'
              : `${removedChannelIds.length} channel${removedChannelIds.length > 1 ? 's are' : ' is'} removed from the list.`}
          </Text>
          {removedChannelIds.length > 0 ? (
            <PressableScale onPress={restoreChannels} style={styles.secondaryButton} accessibilityLabel="Restore removed channels">
              <Ionicons name="refresh" size={15} color={AppTheme.colors.white} />
              <Text style={styles.secondaryButtonText}>Restore all</Text>
            </PressableScale>
          ) : null}
        </View>

        <Text style={styles.sectionLabel}>Card to card details</Text>
        <View style={styles.cardBox}>
          <Text style={styles.fieldLabel}>Bank</Text>
          <TextInput
            value={card.bank}
            onChangeText={(value) => setCard((prev) => ({ ...prev, bank: value }))}
            placeholder="e.g. Bank Melli"
            placeholderTextColor={AppTheme.colors.placeholder}
            style={styles.input}
          />
          <Text style={styles.fieldLabel}>Card number</Text>
          <TextInput
            value={card.number}
            onChangeText={(value) => setCard((prev) => ({ ...prev, number: value }))}
            placeholder="6037 1234 5678 9012"
            placeholderTextColor={AppTheme.colors.placeholder}
            keyboardType="number-pad"
            maxLength={19}
            style={styles.input}
          />
          <Text style={styles.fieldLabel}>Name on the card</Text>
          <TextInput
            value={card.holder}
            onChangeText={(value) => setCard((prev) => ({ ...prev, holder: value }))}
            placeholder="Full name"
            placeholderTextColor={AppTheme.colors.placeholder}
            style={styles.input}
          />
          <PressableScale onPress={saveCard} style={styles.secondaryButton} accessibilityLabel="Save card details">
            <Ionicons name="save-outline" size={15} color={AppTheme.colors.white} />
            <Text style={styles.secondaryButtonText}>Save details</Text>
          </PressableScale>
        </View>

        <Text style={styles.sectionLabel}>Manager PIN</Text>
        <View style={styles.cardBox}>
          <TextInput
            value={newPin}
            onChangeText={setNewPin}
            placeholder="New PIN"
            placeholderTextColor={AppTheme.colors.placeholder}
            keyboardType="number-pad"
            secureTextEntry
            maxLength={8}
            style={styles.input}
          />
          <PressableScale onPress={savePin} style={styles.secondaryButton} accessibilityLabel="Change PIN">
            <Ionicons name="key-outline" size={15} color={AppTheme.colors.white} />
            <Text style={styles.secondaryButtonText}>Change PIN</Text>
          </PressableScale>
        </View>

        <View style={styles.note}>
          <Ionicons name="information-circle-outline" size={18} color={AppTheme.colors.textMuted} />
          <Text style={styles.noteText}>
            These settings last for as long as the app stays open, so set them again after a
            restart.
          </Text>
        </View>
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
    paddingTop: AppTheme.spacing.sm,
    paddingBottom: AppTheme.spacing.lg,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: AppTheme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppTheme.colors.surface,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    marginRight: AppTheme.spacing.md,
  },
  headerText: {
    flex: 1,
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
  lockButton: {
    width: 40,
    height: 40,
    borderRadius: AppTheme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppTheme.colors.surface,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
  },
  lockIcon: {
    alignSelf: 'center',
    width: 62,
    height: 62,
    borderRadius: AppTheme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppTheme.colors.primary + '1F',
    borderWidth: 1,
    borderColor: AppTheme.colors.primary + '59',
    marginTop: AppTheme.spacing.xl,
  },
  lockTitle: {
    color: AppTheme.colors.text,
    fontSize: AppTheme.typography.fontSize.heading,
    fontWeight: AppTheme.typography.fontWeight.extrabold,
    textAlign: 'center',
    marginTop: AppTheme.spacing.md,
  },
  lockText: {
    color: AppTheme.colors.textMuted,
    fontSize: AppTheme.typography.fontSize.sm,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: AppTheme.spacing.lg,
  },
  input: {
    height: 46,
    paddingHorizontal: AppTheme.spacing.md,
    borderRadius: AppTheme.borderRadius.md,
    backgroundColor: '#0B111C',
    borderWidth: 1.5,
    borderTopColor: 'rgba(0,0,0,0.7)',
    borderLeftColor: 'rgba(0,0,0,0.7)',
    borderBottomColor: 'rgba(255,255,255,0.10)',
    borderRightColor: 'rgba(255,255,255,0.10)',
    color: AppTheme.colors.text,
    fontSize: AppTheme.typography.fontSize.md,
    marginBottom: AppTheme.spacing.sm,
  },
  error: {
    color: AppTheme.colors.error,
    fontSize: AppTheme.typography.fontSize.sm,
    marginBottom: AppTheme.spacing.sm,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: AppTheme.borderRadius.md,
    backgroundColor: AppTheme.colors.primary,
    ...AppTheme.elevation.md,
  },
  primaryButtonText: {
    color: AppTheme.colors.white,
    fontSize: AppTheme.typography.fontSize.md,
    fontWeight: AppTheme.typography.fontWeight.bold,
    marginLeft: AppTheme.spacing.sm,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    height: 40,
    paddingHorizontal: AppTheme.spacing.md,
    borderRadius: AppTheme.borderRadius.full,
    backgroundColor: AppTheme.colors.secondary,
    marginTop: AppTheme.spacing.sm,
  },
  secondaryButtonText: {
    color: AppTheme.colors.white,
    fontSize: AppTheme.typography.fontSize.sm,
    fontWeight: AppTheme.typography.fontWeight.semibold,
    marginLeft: 6,
  },
  sectionLabel: {
    color: AppTheme.colors.textMuted,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    fontWeight: AppTheme.typography.fontWeight.semibold,
    marginTop: AppTheme.spacing.lg,
    marginBottom: AppTheme.spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: AppTheme.spacing.sm,
    paddingLeft: AppTheme.spacing.md,
    marginBottom: AppTheme.spacing.sm,
  },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: AppTheme.borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: AppTheme.spacing.sm,
  },
  rowLabel: {
    flex: 1,
    color: AppTheme.colors.text,
    fontSize: AppTheme.typography.fontSize.md,
    fontWeight: AppTheme.typography.fontWeight.semibold,
  },
  switchPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: AppTheme.borderRadius.full,
    borderWidth: 1,
  },
  switchOn: {
    backgroundColor: AppTheme.colors.success + '1F',
    borderColor: AppTheme.colors.success + '59',
  },
  switchOff: {
    backgroundColor: AppTheme.colors.disabled + '33',
    borderColor: AppTheme.colors.border,
  },
  switchText: {
    fontSize: 10,
    fontWeight: AppTheme.typography.fontWeight.bold,
  },
  switchTextOn: {
    color: AppTheme.colors.success,
  },
  switchTextOff: {
    color: AppTheme.colors.textMuted,
  },
  cardBox: {
    padding: AppTheme.spacing.md,
    borderRadius: AppTheme.borderRadius.lg,
    backgroundColor: AppTheme.colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
  },
  cardBoxText: {
    color: AppTheme.colors.textSecondary,
    fontSize: AppTheme.typography.fontSize.sm,
    lineHeight: 18,
  },
  fieldLabel: {
    color: AppTheme.colors.textMuted,
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    fontWeight: AppTheme.typography.fontWeight.semibold,
    marginBottom: 5,
  },
  note: {
    flexDirection: 'row',
    marginTop: AppTheme.spacing.lg,
    padding: AppTheme.spacing.md,
    borderRadius: AppTheme.borderRadius.md,
    backgroundColor: AppTheme.colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
  },
  noteText: {
    flex: 1,
    color: AppTheme.colors.textMuted,
    fontSize: AppTheme.typography.fontSize.sm,
    lineHeight: 18,
    marginLeft: AppTheme.spacing.sm,
  },
});

export default AdminPage;
    
