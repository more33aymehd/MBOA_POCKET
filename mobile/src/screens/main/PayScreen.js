import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, TextInput, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Radius, Layout, Shadows } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { categoryService } from '../../services/categoryService';
import { formatFCFA } from '../../utils/format';
import { useFocusEffect } from '@react-navigation/native';

const METHODS = [
  { id: 'ORANGE_MONEY', label: 'Orange Money', desc: 'Paiement mobile', color: '#FF6B00', icon: '🟠' },
  { id: 'MTN_MOMO', label: 'MTN MoMo', desc: 'Paiement mobile', color: '#FFC200', icon: '🟡' },
  { id: 'CASH', label: 'Cash', desc: 'Rappel fin de journée', color: '#6B7280', icon: '💵' },
  { id: 'MOCK', label: '🧪 Simulateur', desc: 'Test sans vrai paiement', color: Colors.primary, icon: '🧪' },
];

export default function PayScreen({ navigation }) {
  const { token } = useAuth();
  const { colors } = useTheme();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [montant, setMontant] = useState('');
  const [merchantName, setMerchantName] = useState('');
  const [phoneFrom, setPhoneFrom] = useState('');

  useFocusEffect(useCallback(() => {
    categoryService.getAll(token).then(setCategories).catch(() => {});
  }, [token]));

  function handleContinuer() {
    const m = parseInt(montant.replace(/\s/g, ''), 10);
    if (!selectedCategory) return Alert.alert('Zone requise', 'Sélectionnez une zone de dépense.');
    if (!selectedMethod) return Alert.alert('Méthode requise', 'Choisissez un moyen de paiement.');
    if (isNaN(m) || m <= 0) return Alert.alert('Montant invalide', 'Entrez un montant valide.');
    if ((selectedMethod === 'ORANGE_MONEY' || selectedMethod === 'MTN_MOMO') && !phoneFrom.trim()) {
      return Alert.alert('Téléphone requis', 'Entrez votre numéro mobile money.');
    }
    navigation.navigate('Confirmation', {
      categoryId: String(selectedCategory.id),
      categoryNom: selectedCategory.nom,
      categoryIcone: selectedCategory.icone,
      categoryRestant: String(selectedCategory.montantRestant ?? 0),
      montant: String(m),
      methode: selectedMethod,
      merchantName: merchantName.trim() || 'Marchand',
      phoneFrom: phoneFrom.trim(),
    });
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Effectuer un paiement</Text>
        <TouchableOpacity
          style={styles.scanBtn}
          onPress={() => navigation.navigate('Scanner', {
            categoryId: selectedCategory ? String(selectedCategory.id) : '',
            categoryNom: selectedCategory?.nom ?? '',
            categoryIcone: selectedCategory?.icone ?? '',
            categoryRestant: selectedCategory ? String(selectedCategory.montantRestant ?? 0) : '0',
          })}>
          <MaterialCommunityIcons name="qrcode-scan" size={22} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Zone de dépense</Text>
          <Text style={styles.sectionSub}>Sur quel budget imputer ce paiement ?</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chipsRow}>
              {categories.map(cat => {
                const active = selectedCategory?.id === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() => setSelectedCategory(cat)}>
                    <Text style={styles.chipEmoji}>{cat.icone}</Text>
                    <Text style={[styles.chipName, active && styles.chipNameActive]}>{cat.nom}</Text>
                    <Text style={[styles.chipAmt, active && styles.chipAmtActive]}>{formatFCFA(cat.montantRestant ?? 0)}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Montant (FCFA)</Text>
          <TextInput
            style={styles.input}
            value={montant}
            onChangeText={setMontant}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={Colors.textSecondary}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nom du marchand (optionnel)</Text>
          <TextInput
            style={styles.input}
            value={merchantName}
            onChangeText={setMerchantName}
            placeholder="Ex: Chez Paul Restaurant"
            placeholderTextColor={Colors.textSecondary}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Comment voulez-vous payer ?</Text>
          <View style={styles.methodsGrid}>
            {METHODS.map(m => {
              const active = selectedMethod === m.id;
              return (
                <TouchableOpacity
                  key={m.id}
                  style={[styles.methodCard, active && styles.methodCardActive]}
                  onPress={() => setSelectedMethod(m.id)}>
                  <View style={[styles.methodIconBg, { backgroundColor: m.color + '20' }]}>
                    <Text style={{ fontSize: 20 }}>{m.icon}</Text>
                  </View>
                  <Text style={styles.methodName}>{m.label}</Text>
                  <Text style={styles.methodDesc}>{m.desc}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {(selectedMethod === 'ORANGE_MONEY' || selectedMethod === 'MTN_MOMO') && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Votre numéro {selectedMethod === 'ORANGE_MONEY' ? 'Orange' : 'MTN'}
            </Text>
            <TextInput
              style={styles.input}
              value={phoneFrom}
              onChangeText={setPhoneFrom}
              placeholder="237690000000"
              placeholderTextColor={Colors.textSecondary}
              keyboardType="phone-pad"
            />
          </View>
        )}
      </ScrollView>

      <View style={styles.bottom}>
        <TouchableOpacity style={styles.btn} onPress={handleContinuer}>
          <Text style={styles.btnLabel}>Continuer</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F5F7' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, paddingHorizontal: Layout.screenPaddingHorizontal,
    backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
    position: 'relative',
  },
  title: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary },
  scanBtn: {
    position: 'absolute', right: Layout.screenPaddingHorizontal,
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center',
  },
  scroll: { paddingBottom: 24 },
  section: { backgroundColor: Colors.white, padding: Layout.screenPaddingHorizontal, marginBottom: 8, gap: 10 },
  sectionTitle: { fontSize: 15, fontWeight: '500', color: Colors.textPrimary },
  sectionSub: { fontSize: 13, color: Colors.textSecondary, marginTop: -4 },
  chipsRow: { flexDirection: 'row', gap: 8, paddingBottom: 4 },
  chip: {
    alignItems: 'center', gap: 2, borderRadius: 14,
    padding: 10, paddingHorizontal: 12,
    backgroundColor: Colors.surfaceCard, borderWidth: 1, borderColor: '#E5E7EB',
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipEmoji: { fontSize: 18 },
  chipName: { fontSize: 12, fontWeight: '500', color: Colors.textPrimary },
  chipNameActive: { color: Colors.white },
  chipAmt: { fontSize: 10, fontWeight: '700', color: Colors.textSecondary },
  chipAmtActive: { color: 'rgba(255,255,255,0.8)' },
  input: {
    height: Layout.inputHeight, backgroundColor: Colors.surfaceCard,
    borderRadius: Radius.input, borderWidth: 1, borderColor: '#E5E7EB',
    paddingHorizontal: 16, fontSize: 15, color: Colors.textPrimary,
  },
  methodsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  methodCard: {
    width: '47%', backgroundColor: Colors.white,
    borderRadius: Radius.card, padding: 14, gap: 8,
    borderWidth: 1, borderColor: '#E5E7EB', ...Shadows.card,
  },
  methodCardActive: { borderColor: Colors.primary, borderWidth: 2 },
  methodIconBg: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  methodName: { fontSize: 14, fontWeight: '500', color: Colors.textPrimary },
  methodDesc: { fontSize: 12, color: Colors.textSecondary },
  bottom: { padding: Layout.screenPaddingHorizontal, backgroundColor: Colors.white },
  btn: {
    height: Layout.buttonHeight, backgroundColor: Colors.primary,
    borderRadius: Radius.button, alignItems: 'center', justifyContent: 'center',
    ...Shadows.button,
  },
  btnLabel: { color: Colors.white, fontSize: 16, fontWeight: '500' },
});
