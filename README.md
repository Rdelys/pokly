# POKLY

Application mobile React Native (Expo) — écran de chargement, connexion, inscription et accueil, connectée à Supabase.

## 1. Installation

```bash
npm install
```

## 2. Remplacer le logo

Remplace le fichier :

```
assets/logo.png
```

par ton propre logo (PNG, idéalement carré, fond transparent). Aucune autre modification n'est nécessaire, il est déjà branché sur l'écran de chargement et les écrans de connexion/inscription via le composant `src/components/Logo.tsx`.

## 3. Configurer Supabase

Ouvre le fichier :

```
src/lib/supabase.ts
```

Et remplace les deux valeurs par les tiennes (Dashboard Supabase → Project Settings → API) :

```ts
const SUPABASE_URL = 'https://faux-projet.supabase.co';
const SUPABASE_ANON_KEY = 'fausse-cle-anon-a-remplacer';
```

### Créer la table `profiles`

Dans Supabase → SQL Editor, exécute :

```sql
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text not null,
  email text not null,
  created_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;

create policy "Les utilisateurs peuvent lire leur propre profil"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Les utilisateurs peuvent créer leur propre profil"
  on public.profiles for insert
  with check (auth.uid() = id);
```

### Vérifier les paramètres d'authentification

Dans Supabase → Authentication → Providers, l'authentification par e-mail/mot de passe doit être activée (activée par défaut).

Si tu veux désactiver la confirmation par e-mail pendant les tests (pour se connecter immédiatement après inscription) :
Authentication → Settings → décoche "Confirm email".

## 4. Lancer le projet

```bash
npx expo start --web
```

Cela ouvre l'app dans le navigateur. Tu peux aussi scanner le QR code avec l'app Expo Go sur ton téléphone pour tester en conditions réelles mobile.

## Structure du projet

```
src/
  components/    → Logo, PrimaryButton, TextField
  screens/       → SplashScreen, LoginScreen, SignupScreen, HomeScreen
  navigation/    → RootNavigator (stack : Splash → Login/Signup → Home)
  lib/           → client Supabase
  theme/         → couleurs, espacements, typographie (palette bleu/blanc)
assets/
  logo.png       → à remplacer par ton logo
```
