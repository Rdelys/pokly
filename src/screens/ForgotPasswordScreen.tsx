import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import Logo from '../components/Logo';
import TextField from '../components/TextField';
import PasswordField from '../components/PasswordField';
import PrimaryButton from '../components/PrimaryButton';
import { supabase } from '../lib/supabase';
import { colors, spacing, typography } from '../theme/colors';
import { useLanguage } from '../lib/i18n/LanguageContext';

type Props = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;

type Step = 'email' | 'code' | 'success';

export default function ForgotPasswordScreen({ navigation }: Props) {
  const { t } = useLanguage();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');

  // Un seul verrou pour les DEUX boutons de l'étape "code" (valider le
  // reset / renvoyer un code). Sans ça, les deux boutons partagent le même
  // état visuel de chargement mais restent cliquables indépendamment : on
  // pouvait déclencher un renvoi de code pendant que la vérification du
  // précédent était encore en cours, provoquant deux appels Supabase en
  // parallèle sur le même compte.
  const [pendingAction, setPendingAction] = useState<'send' | 'verify' | null>(null);
  const isBusy = pendingAction !== null;

  const handleSendCode = async () => {
    if (isBusy) return;
    setError('');
    if (!email.trim()) {
      setError(t('errorFillFields'));
      return;
    }
    setPendingAction('send');
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim());
    setPendingAction(null);

    if (resetError) {
      setError(resetError.message);
      return;
    }
    setStep('code');
  };

  const handleVerifyAndReset = async () => {
    if (isBusy) return;
    setError('');

    if (!otpCode.trim()) {
      setError(t('errorFillFields'));
      return;
    }
    if (newPassword.length < 6) {
      setError(t('errorPasswordShort'));
      return;
    }

    setPendingAction('verify');
    const { error: otpError } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: otpCode.trim(),
      type: 'recovery',
    });

    if (otpError) {
      setPendingAction(null);
      setError(otpError.message);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    setPendingAction(null);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setStep('success');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Logo size={90} />
            <Text style={styles.title}>{t('forgotPasswordTitle')}</Text>
            <Text style={styles.subtitle}>
              {step === 'email' ? t('forgotPasswordSubtitle') : t('resetPasswordSubtitle')}
            </Text>
          </View>

          {step === 'success' ? (
            <>
              <Text style={styles.success}>{t('resetPasswordSuccess')}</Text>
              <PrimaryButton
                title={t('backToLogin')}
                onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Login' }] })}
                style={{ marginTop: spacing.lg }}
              />
            </>
          ) : step === 'email' ? (
            <View style={styles.form}>
              <TextField
                label={t('emailLabel')}
                placeholder={t('emailPlaceholder')}
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
              {!!error && <Text style={styles.error}>{error}</Text>}
              <PrimaryButton
                title={t('sendResetLink')}
                onPress={handleSendCode}
                loading={pendingAction === 'send'}
                style={{ marginTop: spacing.sm }}
              />
            </View>
          ) : (
            <View style={styles.form}>
              <Text style={styles.hint}>{email.trim()}</Text>
              <TextField
                label={t('otpCodeLabel')}
                placeholder={t('otpCodePlaceholder')}
                keyboardType="number-pad"
                maxLength={12}
                value={otpCode}
                onChangeText={setOtpCode}
                editable={!isBusy}
              />
              <PasswordField
                label={t('newPasswordLabel')}
                placeholder={t('passwordPlaceholder')}
                value={newPassword}
                onChangeText={setNewPassword}
                editable={!isBusy}
              />
              {!!error && <Text style={styles.error}>{error}</Text>}
              <PrimaryButton
                title={t('resetPasswordButton')}
                onPress={handleVerifyAndReset}
                loading={pendingAction === 'verify'}
                disabled={isBusy}
                style={{ marginTop: spacing.sm }}
              />
              <PrimaryButton
                title={t('sendResetLink')}
                onPress={handleSendCode}
                loading={pendingAction === 'send'}
                disabled={isBusy}
                variant="outline"
                style={{ marginTop: spacing.sm }}
              />
            </View>
          )}

          {step !== 'success' && (
            <PrimaryButton
              title={t('backToLogin')}
              onPress={() => navigation.goBack()}
              variant="outline"
              disabled={isBusy}
              style={{ marginTop: spacing.lg }}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    justifyContent: 'center',
  },
  header: { alignItems: 'center', marginBottom: spacing.xl },
  title: { ...typography.h2, color: colors.text, marginTop: spacing.md, textAlign: 'center' },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  hint: {
    ...typography.small,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  form: { marginBottom: spacing.xl },
  error: { color: colors.error, ...typography.small, marginBottom: spacing.sm },
  success: {
    ...typography.body,
    color: colors.success,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
});