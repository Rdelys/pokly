import * as Linking from 'expo-linking';
import { supabase } from './supabase';

export type RecoveryOutcome = 'valid' | 'invalid';

// ---------------------------------------------------------------------------
// Verrou de dédoublonnage. Conservé comme filet de sécurité pour d'anciens
// liens de reset qui traîneraient encore ; le flux normal passe maintenant
// par un code OTP saisi dans l'app, plus par ce chemin.
//
// Sur Android en particulier, la même URL de lancement peut déclencher
// l'event 'url' sur PLUSIEURS listeners en parallèle (SplashScreen ET
// RootNavigator, tous deux montés très tôt au cold start). Un code PKCE est
// à usage unique : si deux appelants tentent l'échange en même temps, l'un
// réussit et l'autre échoue. claimRecoveryUrl() garantit qu'une URL donnée
// n'est traitée que par le PREMIER appelant.
// ---------------------------------------------------------------------------
let claimedUrl: string | null = null;
let claimedPromise: Promise<RecoveryOutcome> | null = null;

export function claimRecoveryUrl(rawUrl: string): Promise<RecoveryOutcome> | null {
  if (claimedUrl === rawUrl && claimedPromise) {
    return null;
  }
  claimedUrl = rawUrl;
  claimedPromise = handleRecoveryUrl(rawUrl);
  return claimedPromise;
}

async function handleRecoveryUrl(rawUrl: string): Promise<RecoveryOutcome> {
  try {
    const parsed = Linking.parse(rawUrl);
    const qp = parsed.queryParams ?? {};

    const errorCode = (qp.error_code || qp.error) as string | undefined;
    if (errorCode) {
      console.warn('Lien de récupération invalide:', qp.error_description ?? errorCode);
      return 'invalid';
    }

    const code = qp.code as string | undefined;
    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(rawUrl);
      if (error) {
        console.warn('exchangeCodeForSession error:', error.message);
        return 'invalid';
      }
      return 'valid';
    }

    const tokenHash = (qp.token_hash || qp.token) as string | undefined;
    if (tokenHash) {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: 'recovery',
      });
      if (error) {
        console.warn('verifyOtp error:', error.message);
        return 'invalid';
      }
      return 'valid';
    }

    const hashPart = rawUrl.split('#')[1];
    if (hashPart) {
      const params = new URLSearchParams(hashPart);
      const hashError = params.get('error_code') || params.get('error');
      if (hashError) return 'invalid';

      const access_token = params.get('access_token');
      const refresh_token = params.get('refresh_token');
      if (access_token && refresh_token) {
        const { error } = await supabase.auth.setSession({ access_token, refresh_token });
        if (error) {
          console.warn('setSession error:', error.message);
          return 'invalid';
        }
        return 'valid';
      }
    }

    return 'invalid';
  } catch (e: any) {
    console.warn('handleRecoveryUrl threw:', e?.message);
    return 'invalid';
  }
}

// Détection volontairement tolérante : on ne se fie pas uniquement au
// parsing hostname/path de expo-linking (son comportement varie selon
// Expo Go / build standalone / Android / iOS pour un schéma custom). On
// cherche directement la présence du segment dans l'URL brute, en
// s'appuyant en complément sur les query params attendus pour ce flux.
export function isResetPasswordUrl(rawUrl: string): boolean {
  if (rawUrl.includes('reset-password')) return true;
  try {
    const parsed = Linking.parse(rawUrl);
    const qp = parsed.queryParams ?? {};
    const type = qp.type as string | undefined;
    return type === 'recovery';
  } catch {
    return false;
  }
}