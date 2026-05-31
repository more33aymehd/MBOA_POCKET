import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, RefreshControl, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Radius, Layout, Shadows } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { categoryService } from '../../services/categoryService';
import { budgetService } from '../../services/budgetService';
import { formatFCFA, nomMois } from '../../utils/format';
import { useFocusEffect } from '@react-navigation/native';

function progressColor(pct) {
  if (pct >= 90) return Colors.danger;
  if (pct >= 70) return Colors.warning;
  return Colors.primary;
}

function ZoneCard({ cat, onPress }) {
  const pct = Math.min(cat.progressPercent ?? 0, 100);
  const color = progressColor(pct);

  return (
    <TouchableOpacity style={styles.zoneCard} onPress={onPress} activeOpacity={0.7}>
      {/* Ligne du haut : icône + nom + pourcentage */}
      <View style={styles.zoneRow}>
        <View style={[styles.zoneIconBg, { backgroundColor: (cat.couleur || Colors.primary) + '20' }]}>
          <Text style={styles.zoneIcon}>{cat.icone}</Text>
        </View>
        <View style={styles.zoneTexts}>
          <Text style={styles.zoneNom}>{cat.nom}</Text>
          <Text style={styles.zoneSub}>
            {formatFCFA(cat.montantDepense ?? 0)} / {formatFCFA(cat.montantAlloue)}
          </Text>
        </View>
        <View style={styles.zoneRight}>
          <Text style={[styles.zonePct, { color }]}>{Math.round(pct)}%</Text>
          <MaterialCommunityIcons name="chevron-right" size={16} color={Colors.textSecondary} />
        </View>
      </View>

      {/* Barre de progression — ligne séparée sous le contenu */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
    </TouchableOpacity>
  );
}

export default function BudgetScreen({ navigation }) {
  const { token } = useAuth();
  const now = new Date();
  const [mois, setMois] = useState(now.getMonth() + 1);
  const [annee] = useState(now.getFullYear());
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const cats = await categoryService.getAll(token, mois, annee);
      setCategories(cats ?? []);
    } catch { } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, mois, annee]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const totalAlloue = categories.reduce((s, c) => s + c.montantAlloue, 0);
  const totalDepense = categories.reduce((s, c) => s + (c.montantDepense ?? 0), 0);
  const totalRestant = totalAlloue - totalDepense;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={Colors.primary} />
        }>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Mon Budget</Text>
          <View style={styles.monthRow}>
            <TouchableOpacity onPress={() => setMois(m => m === 1 ? 12 : m - 1)}>
              <MaterialCommunityIcons name="chevron-left" size={22} color={Colors.textSecondary} />
            </TouchableOpacity>
            <Text style={styles.monthLabel}>{nomMois(mois)} {annee}</Text>
            <TouchableOpacity onPress={() => setMois(m => m === 12 ? 1 : m + 1)}>
              <MaterialCommunityIcons name="chevron-right" size={22} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Résumé */}
        <View style={styles.summaryCard}>
          <View style={styles.statCol}>
            <Text style={styles.statLabel}>Total alloué</Text>
            <Text style={styles.statValue}>{(totalAlloue / 1000).toFixed(0)}K</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text style={styles.statLabel}>Dépensé</Text>
            <Text style={[styles.statValue, { color: Colors.secondary }]}>{(totalDepense / 1000).toFixed(0)}K</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text style={styles.statLabel}>Restant</Text>
            <Text style={[styles.statValue, { color: Colors.success }]}>{(totalRestant / 1000).toFixed(0)}K</Text>
          </View>
        </View>

        {/* Bannière IA */}
        <TouchableOpacity
          style={styles.iaBanner}
          onPress={() => navigation.navigate('SetupBudget')}>
          <MaterialCommunityIcons name="shimmer" size={20} color={Colors.white} />
          <View style={{ flex: 1 }}>
            <Text style={styles.iaBannerTitle}>Analyser avec l'IA ✨</Text>
            <Text style={styles.iaBannerSub}>Génère ton budget automatiquement</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={20} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>

        {/* Liste des zones */}
        {loading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
        ) : categories.length === 0 ? (
          <View style={styles.empty}>
            <MaterialCommunityIcons name="wallet-outline" size={48} color={Colors.textSecondary} />
            <Text style={styles.emptyTitle}>Aucune zone de dépenses</Text>
            <Text style={styles.emptySub}>Appuyez sur + pour créer votre première zone</Text>
          </View>
        ) : (
          <View style={styles.zoneList}>
            {categories.map(cat => (
              <ZoneCard
                key={cat.id}
                cat={cat}
                onPress={() => navigation.navigate('ZoneDetail', { id: cat.id })}
              />
            ))}
          </View>
        )}

        <View style={{ height: 80 }} />
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AddCategory')}>
        <MaterialCommunityIcons name="plus" size={24} color={Colors.white} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F5F7' },

  header: { paddingHorizontal: Layout.screenPaddingHorizontal, paddingTop: 16, gap: 8 },
  title: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary },
  monthRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  monthLabel: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '600', color: Colors.textPrimary },

  summaryCard: {
    marginHorizontal: Layout.screenPaddingHorizontal,
    marginTop: 16,
    backgroundColor: Colors.white,
    borderRadius: Radius.card,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    ...Shadows.card,
  },
  statCol: { flex: 1, alignItems: 'center', gap: 4 },
  statLabel: { fontSize: 11, color: Colors.textSecondary },
  statValue: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  statDivider: { width: 1, height: 32, backgroundColor: '#E5E7EB' },

  iaBanner: {
    marginHorizontal: Layout.screenPaddingHorizontal,
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.secondary,
    borderRadius: Radius.card,
    padding: 14,
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  iaBannerTitle: { fontSize: 14, fontWeight: '700', color: Colors.white },
  iaBannerSub: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 },

  empty: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary },
  emptySub: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', paddingHorizontal: 40 },

  zoneList: {
    marginTop: 16,
    paddingHorizontal: Layout.screenPaddingHorizontal,
    gap: 10,
  },

  /* Zone Card — layout vertical strict */
  zoneCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.card,
    padding: 16,
    gap: 12,
    ...Shadows.card,
  },
  zoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  zoneIconBg: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  zoneIcon: { fontSize: 20 },
  zoneTexts: { flex: 1, gap: 2 },
  zoneNom: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  zoneSub: { fontSize: 12, color: Colors.textSecondary },
  zoneRight: { flexDirection: 'row', alignItems: 'center', gap: 4, flexShrink: 0 },
  zonePct: { fontSize: 14, fontWeight: '700' },

  /* Barre de progression — toujours en bas de la card, pleine largeur */
  progressTrack: {
    height: 8,
    backgroundColor: '#E8F5EE',
    borderRadius: 99,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 99,
  },

  fab: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
});
