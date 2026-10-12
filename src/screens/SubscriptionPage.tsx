import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppTheme } from '../theme/AppTheme';
import ArshiaWatermark from '../components/ArshiaWatermark';
import InsetPressable from '../components/InsetPressable';
import PressableScale from '../components/PressableScale';
import { redirectToPaymentLink } from '../stripe';
import { useAdmin } from '../context/AdminContext';

interface Plan {
  id: string;
  label: string;
  price: string;
  unit: string;
  note: string;
  color: string;
  highlight: boolean;
}

const PLANS: Plan[] = [
  {
    id: 'monthly',
    label: 'Monthly',
    price: '99,000',
    unit: 'Toman / month',
    note: 'Cancel whenever you like',
    color: '#3B82F6',
    highlight: false,
  },
  {
    id: 'quarter',
    label: '3 Months',
    price: '249,000',
    unit: 'Toman / 3 months',
    note: 'Most popular · save 16%',
    color: '#E63946',
    highlight: true,
  },
  {
    id: 'yearly',
    label: 'Yearly',
    price: '799,000',
    unit: 'Toman / year',
    note: 'Best value · save 33%',
    color: '#22C55E',
    highlight: false,
  },
];

/** 6037 1234 5678 9012 — grouped so it is easy to read off the screen. */
function formatCard(raw: string): string {
  const digits = (raw || '').replace(/\D/g, '');
  if (!digits) return '';
  return digits.replace(/(.{4})/g, '$1 ').trim();
}

const SubscriptionPage: React.FC<any> = ({ navigation }) => {
  const { payCard } = useAdmin();
  const [plan, setPlan] = useState('quarter');

  const chosen = PLANS.find((item) => item.id === plan) || PLANS[0];
  const cardNumber = formatCard(payCard.number);
  const cardReady = !!(payCard.number || '').trim();

  const payOnline = () => {
    const opened = redirectToPaymentLink();
    if (!opened) {
      Alert.alert(
        'Online payment is not connected yet',
        'Add your Stripe payment link in Settings → Environment, then come back to this screen.'
      );
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <PressableScale
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={19} color={AppTheme.colors.text} />
          </PressableScale>
          <View style={styles.headerText}>
            <Text style={styles.title}>Arshia TV+</Text>
            <Text style={styles.subtitle}>Ad-free films, series and sport, on every device.</Text>
          </View>
          <ArshiaWatermark size={11} />
        </View>

        {PLANS.map((item) => {
          const isActive = plan === item.id;
          return (
            <InsetPressable
              key={item.id}
              onPress={() => setPlan(item.id)}
              accent={isActive ? item.color : undefined}
              style={[styles.plan, isActive ? { backgroundColor: item.color + '1F' } : null]}
              accessibilityLabel={`${item.label} plan`}
            >
              <View style={styles.planTop}>
                <View style={[styles.planIcon, { backgroundColor: item.color + '2E' }]}>
                  <Ionicons
                    name={item.highlight ? 'star' : 'ticket-outline'}
                    size={16}
                    color={item.color}
                  />
                </View>
                <Text style={styles.planLabel}>{item.label}</Text>
                <Ionicons
                  name={isActive ? 'radio-button-on' : 'radio-button-off'}
                  size={18}
                  color={isActive ? item.color : AppTheme.colors.textMuted}
                />
              </View>
              <Text style={styles.planPrice}>
                {item.price}
                <Text style={styles.planUnit}>  {item.unit}</Text>
              </Text>
              <Text style={styles.planNote}>{item.note}</Text>
            </InsetPressable>
          );
        })}

        <PressableScale onPress={payOnline} style={styles.payButton} accessibilityLabel="Pay online">
          <Ionicons name="card-outline" size={18} color={AppTheme.colors.white} />
          <Text style={styles.payButtonText}>Pay online · {chosen.price} Toman</Text>
        </PressableScale>

        <Text style={styles.sectionLabel}>Card to card</Text>
        <View style={styles.cardBox}>
          {cardReady ? (
            <>
              <Text style={styles.cardBank}>{payCard.bank || 'Bank'}</Text>
              <Text style={styles.cardNumber} selectable>
                {cardNumber}
              </Text>
              {payCard.holder ? <Text style={styles.cardHolder}>{payCard.holder}</Text> : null}
              <View style={styles.cardHint}>
                <Ionicons name="copy-outline" size={14} color={AppTheme.colors.textMuted} />
                <Text style={styles.cardHintText}>
                  Long-press the number to copy it, then transfer the amount for the plan you chose.
                </Text>
              </View>
            </>
          ) : (
            <View style={styles.cardEmpty}>
              <Ionicons name="alert-circle-outline" size={20} color={AppTheme.colors.warning} />
              <Text style={styles.cardEmptyTitle}>No card number set yet</Text>
              <Text style={styles.cardEmptyText}>
                The manager adds the card number from the Admin panel, and it appears here for
                everyone.
              </Text>
            </View>
          )}
        </View>

        <View style={styles.note}>
          <Ionicons name="information-circle-outline" size={18} color={AppTheme.colors.textMuted} />
          <Text style={styles.noteText}>
            Card to card transfers are confirmed by hand, so send the receipt in the chat once the
            transfer is done. Online payments are confirmed by the payment provider straight away.
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
    justifyContent: 'space-between',
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
  plan: {
    padding: AppTheme.spacing.md,
    paddingLeft: AppTheme.spacing.lg,
    marginBottom: AppTheme.spacing.sm,
  },
  planTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  planIcon: {
    width: 32,
    height: 32,
    borderRadius: AppTheme.borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: AppTheme.spacing.sm,
  },
  planLabel: {
    flex: 1,
    color: AppTheme.colors.text,
    fontSize: AppTheme.typography.fontSize.lg,
    fontWeight: AppTheme.typography.fontWeight.bold,
  },
  planPrice: {
    color: AppTheme.colors.text,
    fontSize: AppTheme.typography.fontSize.heading,
    fontWeight: AppTheme.typography.fontWeight.extrabold,
    marginTop: AppTheme.spacing.sm,
  },
  planUnit: {
    color: AppTheme.colors.textMuted,
    fontSize: AppTheme.typography.fontSize.sm,
    fontWeight: AppTheme.typography.fontWeight.medium,
  },
  planNote: {
    color: AppTheme.colors.textMuted,
    fontSize: AppTheme.typography.fontSize.sm,
    marginTop: 3,
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: AppTheme.borderRadius.md,
    backgroundColor: AppTheme.colors.primary,
    marginTop: AppTheme.spacing.sm,
    ...AppTheme.elevation.md,
  },
  payButtonText: {
    color: AppTheme.colors.white,
    fontSize: AppTheme.typography.fontSize.md,
    fontWeight: AppTheme.typography.fontWeight.bold,
    marginLeft: AppTheme.spacing.sm,
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
  cardBox: {
    padding: AppTheme.spacing.md,
    borderRadius: AppTheme.borderRadius.lg,
    backgroundColor: AppTheme.colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
  },
  cardBank: {
    color: AppTheme.colors.textMuted,
    fontSize: AppTheme.typography.fontSize.sm,
    fontWeight: AppTheme.typography.fontWeight.semibold,
  },
  cardNumber: {
    color: AppTheme.colors.text,
    fontSize: AppTheme.typography.fontSize.xxl,
    fontWeight: AppTheme.typography.fontWeight.extrabold,
    letterSpacing: 1.6,
    marginTop: 6,
  },
  cardHolder: {
    color: AppTheme.colors.textSecondary,
    fontSize: AppTheme.typography.fontSize.md,
    marginTop: 6,
  },
  cardHint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: AppTheme.spacing.md,
  },
  cardHintText: {
    flex: 1,
    color: AppTheme.colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
    marginLeft: 6,
  },
  cardEmpty: {
    alignItems: 'center',
  },
  cardEmptyTitle: {
    color: AppTheme.colors.text,
    fontSize: AppTheme.typography.fontSize.md,
    fontWeight: AppTheme.typography.fontWeight.bold,
    marginTop: AppTheme.spacing.sm,
  },
  cardEmptyText: {
    color: AppTheme.colors.textMuted,
    fontSize: AppTheme.typography.fontSize.sm,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
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

export default SubscriptionPage;
  
