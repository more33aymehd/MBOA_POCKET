import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  FlatList, Dimensions, SafeAreaView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Radius, Layout, Shadows } from '../constants/theme';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    icon: 'chart-pie',
    iconBg: '#E8F5EE',
    title: 'Gérez votre budget',
    subtitle: "L'IA analyse vos habitudes et alloue votre budget automatiquement",
  },
  {
    id: '2',
    icon: 'cellphone',
    iconBg: '#FFF3E0',
    title: 'Paiement mobile',
    subtitle: 'Payez avec Orange Money, MTN MoMo directement depuis l\'app',
  },
  {
    id: '3',
    icon: 'account-group',
    iconBg: '#E8F0FE',
    title: 'Tontines & Communauté',
    subtitle: 'Créez des cotisations collectives et gérez l\'entraide financière',
  },
];

export default function OnboardingScreen({ navigation }) {
  const [index, setIndex] = useState(0);
  const flatRef = useRef(null);

  function next() {
    if (index < SLIDES.length - 1) {
      flatRef.current?.scrollToIndex({ index: index + 1 });
      setIndex(index + 1);
    } else {
      navigation.replace('Login');
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        ref={flatRef}
        data={SLIDES}
        horizontal pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={e => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
        keyExtractor={i => i.id}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <View style={[styles.illustrationArea, { backgroundColor: item.iconBg }]}>
              <MaterialCommunityIcons name={item.icon} size={80} color={Colors.primary} />
            </View>
            <View style={styles.textArea}>
              <Text style={styles.slideTitle}>{item.title}</Text>
              <Text style={styles.slideSub}>{item.subtitle}</Text>
            </View>
          </View>
        )}
      />

      <View style={styles.bottom}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
          ))}
        </View>
        <TouchableOpacity style={styles.btn} onPress={next}>
          <Text style={styles.btnLabel}>
            {index < SLIDES.length - 1 ? 'Suivant' : 'Commencer'}
          </Text>
        </TouchableOpacity>
        {index < SLIDES.length - 1 && (
          <TouchableOpacity onPress={() => navigation.replace('Login')}>
            <Text style={styles.skip}>Passer</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  slide: { width, flex: 1 },
  illustrationArea: {
    height: 380, width,
    alignItems: 'center', justifyContent: 'center',
  },
  textArea: {
    padding: 32, gap: 12,
  },
  slideTitle: { fontSize: 26, fontWeight: '700', color: Colors.textPrimary },
  slideSub: { fontSize: 15, color: Colors.textSecondary, lineHeight: 22 },
  bottom: {
    paddingHorizontal: Layout.screenPaddingHorizontal,
    paddingBottom: 34, gap: 16, alignItems: 'center',
  },
  dots: { flexDirection: 'row', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#E5E7EB' },
  dotActive: { width: 24, backgroundColor: Colors.primary },
  btn: {
    width: '100%', height: Layout.buttonHeight,
    backgroundColor: Colors.primary, borderRadius: Radius.button,
    alignItems: 'center', justifyContent: 'center',
    ...Shadows.button,
  },
  btnLabel: { color: Colors.white, fontSize: 16, fontWeight: '600' },
  skip: { fontSize: 14, color: Colors.textSecondary, fontWeight: '500' },
});
