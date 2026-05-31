import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, RefreshControl, ActivityIndicator, Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, G } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Radius, Layout, Shadows } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { statsService } from '../../services/statsService';
import { formatFCFA, nomMois } from '../../utils/format';
import { useFocusEffect } from '@react-navigation/native';

// ── Donut Chart SVG ──
function DonutChart({ categories, size = 160 }) {
  const r = size / 2 - 16;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;

  const filtered = categories.filter(c => c.montantDepense > 0);
  const total = filtered.reduce((s, c) => s + c.montantDepense, 0);

  let offset = 0;
  const segments = filtered.map(cat => {
    const pct = total > 0 ? cat.montantDepense / total : 0;
    const dash = pct * circumference;
    const gap = circumference - dash;
    const seg = { cat, dash, gap, offset };
    offset += dash;
    return seg;
  });

  const colors = ['#1B8A5A', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'];

  if (filtered.length === 0) {
    return (
      <View style={[styles.donutWrap, { width: size, height: size }]}>
        <View style={[styles.donutEmpty, { width: size, height: size, borderRadius: size / 2 }]} />
        <View style={styles.donutCenter}>
          <Text style={styles.donutCenterText}>—</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.donutWrap, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <G rotation="-90" origin={`${cx},${cy}`}>
          {segments.map(({ cat, dash, gap, offset: off }, i) => (
            <Circle
              key={cat.categoryId ?? i}
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke={cat.couleur || colors[i % colors.length]}
              strokeWidth={22}
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={-off}
            />
          ))}
        </G>
      </Svg>
      {/* Centre */}
      <View style={styles.donutCenter}>
        <Text style={styles.donutCenterPct}>{Math.round(filtered[0]?.pourcentageBudget ?? 0)}%</Text>
        <Text style={styles.donutCenterLabel} numberOfLines={1}>{filtered[0]?.nom ?? ''}</Text>
      </View>
    </View>
  );
}

// ── Bar Chart ──
function BarChart({ categories }) {
  const max = Math.max(...categories.map(c => Math.max(c.montantAlloue, c.montantDepense)), 1);
  const colors = ['#1B8A5A', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'];

  return (
    <View style={styles.barChart}>
      <View style={styles.barsRow}>
        {categories.slice(0, 6).map((cat, i) => {
          const hAlloue = ((cat.montantAlloue / max) * 80);
          const hDepense = ((cat.montantDepense / max) * 80);
          const color = cat.couleur || colors[i % colors.length];
          const over = cat.montantDepense > cat.montantAlloue;
          return (
            <View key={cat.categoryId ?? i} style={styles.barGroup}>
              <View style={styles.barBars}>
                {/* Alloué (fond) */}
                <View style={[styles.bar, styles.barAlloue, { height: Math.max(hAlloue, 4) }]} />
                {/* Dépensé (avant) */}
                <View style={[
                  styles.bar, styles.barDepense,
                  { height: Math.max(hDepense, 4), backgroundColor: over ? Colors.danger : color },
                ]} />
              </View>
              <Text style={styles.barLabel} numberOfLines={1}>{cat.nom.slice(0, 5)}</Text>
            </View>
          );
        })}
      </View>
      <View style={styles.barLegend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#E5E7EB' }]} />
          <Text style={styles.legendText}>Alloué</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.primary }]} />
          <Text style={styles.legendText}>Dépensé</Text>
        </View>
      </View>
    </View>
  );
}

export default function BilanMensuelScreen({ navigation }) {
  const { token } = useAuth();
  const now = new Date();
  const [mois, setMois] = useState(now.getMonth() + 1);
  const [annee, setAnnee] = useState(now.getFullYear());
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const data = await statsService.getMonthly(token, mois, annee);
      setStats(data);
    } catch { } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, mois, annee]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  function prevMois() {
    if (mois === 1) { setMois(12); setAnnee(a => a - 1); }
    else setMois(m => m - 1);
  }
  function nextMois() {
    if (mois === 12) { setMois(1); setAnnee(a => a + 1); }
    else setMois(m => m + 1);
  }

  async function handleShare() {
    if (!stats) return;
    const txt = `📊 Bilan ${nomMois(mois)} ${annee} — Mboapocket\n\n`
      + `Revenu : ${formatFCFA(stats.revenuMensuel)}\n`
      + `Dépensé : ${formatFCFA(stats.totalDepense)}\n`
      + `Restant : ${formatFCFA(stats.montantRestant)}\n`
      + `Épargne : ${formatFCFA(stats.epargnRealisee)}\n\n`
      + (stats.pointsForts?.map(p => `✅ ${p}`).join('\n') ?? '');
    await Share.share({ message: txt });
  }

  const isCurrentMonth = mois === now.getMonth() + 1 && annee === now.getFullYear();
  const cats = stats?.categories ?? [];
  const COLORS_MAP = ['#1B8A5A', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'];

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bilan Mensuel</Text>
        <TouchableOpacity onPress={handleShare}>
          <MaterialCommunityIcons name="share-variant-outline" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Sélecteur de mois */}
      <View style={styles.monthSelector}>
        <TouchableOpacity onPress={prevMois} style={styles.arrowBtn}>
          <MaterialCommunityIcons name="chevron-left" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.monthLabel}>{nomMois(mois)} {annee}</Text>
        <TouchableOpacity onPress={nextMois} style={styles.arrowBtn} disabled={isCurrentMonth}>
          <MaterialCommunityIcons name="chevron-right" size={22} color={isCurrentMonth ? '#D1D5DB' : Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 60 }} />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={Colors.primary} />}>

          {/* Hero Card Gradient */}
          <LinearGradient colors={['#1B8A5A', '#156B46']} style={styles.heroCard} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}>
            {isCurrentMonth ? (
              <View style={styles.heroBadge}>
                <MaterialCommunityIcons name="clock-outline" size={12} color="rgba(255,255,255,0.8)" />
                <Text style={styles.heroBadgeText}>Mois en cours</Text>
              </View>
            ) : (
              <View style={styles.heroBadge}>
                <MaterialCommunityIcons name="check-circle" size={12} color="rgba(255,255,255,0.8)" />
                <Text style={styles.heroBadgeText}>Mois terminé</Text>
              </View>
            )}

            <View style={styles.heroStats}>
              <View style={styles.heroStat}>
                <Text style={styles.heroStatLabel}>Revenu</Text>
                <Text style={styles.heroStatVal}>{stats?.revenuMensuel ? (stats.revenuMensuel / 1000).toFixed(0) + 'K' : '—'}</Text>
              </View>
              <View style={styles.heroStatDivider} />
              <View style={styles.heroStat}>
                <Text style={styles.heroStatLabel}>Dépensé</Text>
                <Text style={styles.heroStatVal}>{stats?.totalDepense ? (stats.totalDepense / 1000).toFixed(0) + 'K' : '—'}</Text>
              </View>
              <View style={styles.heroStatDivider} />
              <View style={styles.heroStat}>
                <Text style={styles.heroStatLabel}>Épargne</Text>
                <Text style={styles.heroStatVal}>
                  {stats?.epargnRealisee != null ? (Math.max(stats.epargnRealisee, 0) / 1000).toFixed(0) + 'K' : '—'}
                  {stats?.epargnRealisee > 0 ? ' 💰' : ''}
                </Text>
              </View>
            </View>

            <Text style={styles.heroNote}>Montants en FCFA</Text>

            {/* Barre de consommation */}
            {stats?.revenuMensuel > 0 && (
              <View style={styles.heroBar}>
                <View style={[styles.heroBarFill, {
                  width: `${Math.min(stats.tauxUtilisation, 100)}%`,
                  backgroundColor: stats.tauxUtilisation > 90 ? Colors.danger : stats.tauxUtilisation > 70 ? Colors.warning : '#4ADE80',
                }]} />
              </View>
            )}
            {stats?.evolutionPct !== undefined && (
              <Text style={styles.heroEvol}>
                {stats.evolutionPct > 0 ? `↑ +${stats.evolutionPct}%` : stats.evolutionPct < 0 ? `↓ ${stats.evolutionPct}%` : '= Stable'} vs mois précédent
              </Text>
            )}
          </LinearGradient>

          {/* Donut + Légende */}
          {cats.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Répartition des dépenses</Text>
              <View style={styles.donutSection}>
                <DonutChart categories={cats} size={150} />
                <View style={styles.legend}>
                  {cats.filter(c => c.montantDepense > 0).slice(0, 6).map((cat, i) => (
                    <View key={cat.categoryId ?? i} style={styles.legendRow}>
                      <View style={[styles.legendDotBig, { backgroundColor: cat.couleur || COLORS_MAP[i % COLORS_MAP.length] }]} />
                      <Text style={styles.legendName} numberOfLines={1}>{cat.nom}</Text>
                      <Text style={styles.legendPct}>{cat.pourcentageBudget?.toFixed(0)}%</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* Points forts */}
          {((stats?.pointsForts?.length > 0) || (stats?.pointsFaibles?.length > 0)) && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Points forts</Text>
              {(stats?.pointsForts ?? []).map((p, i) => (
                <View key={i} style={styles.pointRow}>
                  <MaterialCommunityIcons name="check-circle" size={20} color={Colors.success} />
                  <Text style={styles.pointText}>{p}</Text>
                </View>
              ))}
              {(stats?.pointsFaibles ?? []).map((p, i) => (
                <View key={i} style={styles.pointRow}>
                  <MaterialCommunityIcons name="alert-circle" size={20} color={Colors.warning} />
                  <Text style={styles.pointText}>{p}</Text>
                </View>
              ))}
              {(stats?.pointsForts?.length === 0 && stats?.pointsFaibles?.length === 0) && (
                <Text style={styles.noPoints}>Pas encore assez de données ce mois.</Text>
              )}
            </View>
          )}

          {/* Bar Chart comparaison */}
          {cats.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Budget par zone</Text>
              <BarChart categories={cats} />
            </View>
          )}

          {/* Détail catégories */}
          {cats.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Détail par zone</Text>
              {cats.map((cat, i) => {
                const color = cat.couleur || COLORS_MAP[i % COLORS_MAP.length];
                const over = cat.progressPercent > 100;
                return (
                  <View key={cat.categoryId ?? i} style={[styles.catRow, i > 0 && { borderTopWidth: 1, borderTopColor: '#F3F4F6' }]}>
                    <View style={[styles.catIconBg, { backgroundColor: color + '20' }]}>
                      <Text style={styles.catEmoji}>{cat.icone}</Text>
                    </View>
                    <View style={styles.catInfo}>
                      <View style={styles.catTop}>
                        <Text style={styles.catNom}>{cat.nom}</Text>
                        <Text style={[styles.catPct, { color: over ? Colors.danger : color }]}>
                          {cat.progressPercent?.toFixed(0)}%
                        </Text>
                      </View>
                      <View style={styles.catBar}>
                        <View style={[styles.catBarFill, {
                          width: `${Math.min(cat.progressPercent, 100)}%`,
                          backgroundColor: over ? Colors.danger : color,
                        }]} />
                      </View>
                      <Text style={styles.catAmounts}>
                        {formatFCFA(cat.montantDepense)} / {formatFCFA(cat.montantAlloue)}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {/* Bouton mois suivant */}
          {!isCurrentMonth && (
            <TouchableOpacity style={styles.nextMonthBtn} onPress={nextMois}>
              <Text style={styles.nextMonthLabel}>Voir le mois de {nomMois(mois === 12 ? 1 : mois + 1)}</Text>
              <MaterialCommunityIcons name="chevron-right" size={18} color={Colors.primary} />
            </TouchableOpacity>
          )}

          <View style={{ height: 32 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F5F7' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Layout.screenPaddingHorizontal, paddingVertical: 14,
    backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },

  monthSelector: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 16, paddingVertical: 10,
    backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  arrowBtn: { padding: 4 },
  monthLabel: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, minWidth: 140, textAlign: 'center' },

  /* Hero Card */
  heroCard: {
    marginHorizontal: Layout.screenPaddingHorizontal,
    marginTop: 16, borderRadius: 20, padding: 18, gap: 10,
  },
  heroBadge: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  heroBadgeText: { fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: '500' },
  heroStats: { flexDirection: 'row', alignItems: 'center' },
  heroStat: { flex: 1, alignItems: 'center', gap: 3 },
  heroStatLabel: { fontSize: 11, color: 'rgba(255,255,255,0.65)', fontWeight: '500' },
  heroStatVal: { fontSize: 20, fontWeight: '800', color: Colors.white },
  heroStatDivider: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.2)' },
  heroNote: { fontSize: 10, color: 'rgba(255,255,255,0.45)', textAlign: 'center' },
  heroBar: { height: 5, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 3, overflow: 'hidden' },
  heroBarFill: { height: '100%', borderRadius: 3 },
  heroEvol: { fontSize: 11, color: 'rgba(255,255,255,0.6)', textAlign: 'center' },

  /* Cards */
  card: {
    backgroundColor: Colors.white, borderRadius: Radius.card,
    marginHorizontal: Layout.screenPaddingHorizontal,
    marginTop: 14, padding: 16, gap: 14, ...Shadows.card,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },

  /* Donut */
  donutSection: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  donutWrap: { position: 'relative', alignItems: 'center', justifyContent: 'center' },
  donutEmpty: { borderWidth: 22, borderColor: '#E5E7EB' },
  donutCenter: { position: 'absolute', alignItems: 'center' },
  donutCenterPct: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
  donutCenterLabel: { fontSize: 10, color: Colors.textSecondary, maxWidth: 70, textAlign: 'center' },
  donutCenterText: { fontSize: 20, color: Colors.textSecondary },

  /* Légende donut */
  legend: { flex: 1, gap: 6 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendDotBig: { width: 10, height: 10, borderRadius: 5, flexShrink: 0 },
  legendName: { flex: 1, fontSize: 12, color: Colors.textPrimary },
  legendPct: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary },

  /* Points forts/faibles */
  pointRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  pointText: { flex: 1, fontSize: 13, color: Colors.textPrimary, lineHeight: 20 },
  noPoints: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center' },

  /* Bar Chart */
  barChart: { gap: 10 },
  barsRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 90 },
  barGroup: { flex: 1, alignItems: 'center', gap: 4 },
  barBars: { flexDirection: 'row', alignItems: 'flex-end', gap: 2 },
  bar: { width: 12, borderRadius: 4, minHeight: 4 },
  barAlloue: { backgroundColor: '#E5E7EB' },
  barDepense: { backgroundColor: Colors.primary },
  barLabel: { fontSize: 9, color: Colors.textSecondary, textAlign: 'center' },
  barLegend: { flexDirection: 'row', justifyContent: 'center', gap: 20 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, color: Colors.textSecondary },

  /* Détail catégories */
  catRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  catIconBg: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  catEmoji: { fontSize: 18 },
  catInfo: { flex: 1, gap: 5 },
  catTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  catNom: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  catPct: { fontSize: 13, fontWeight: '700' },
  catBar: { height: 5, backgroundColor: '#E8F5EE', borderRadius: 99, overflow: 'hidden' },
  catBarFill: { height: '100%', borderRadius: 99 },
  catAmounts: { fontSize: 11, color: Colors.textSecondary },

  /* Navigation mois */
  nextMonthBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, marginHorizontal: Layout.screenPaddingHorizontal, marginTop: 14,
    backgroundColor: Colors.white, borderRadius: Radius.card,
    padding: 16, ...Shadows.card,
  },
  nextMonthLabel: { fontSize: 14, fontWeight: '600', color: Colors.primary },
});
