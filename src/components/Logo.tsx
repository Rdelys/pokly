import React from 'react';
import { Image, StyleSheet, View, ViewStyle } from 'react-native';

type Props = {
  size?: number;
  style?: ViewStyle;
};

// ⚠️ Remplace le fichier assets/logo.png par ton propre logo.
// Le chemin est : /assets/logo.png à la racine du projet.
export default function Logo({ size = 120, style }: Props) {
  return (
    <View style={[styles.container, style]}>
      <Image
        source={require('../../assets/logo.png')}
        style={{ width: size, height: size }}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
