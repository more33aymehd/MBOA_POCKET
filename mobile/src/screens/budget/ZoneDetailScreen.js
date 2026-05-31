import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, RefreshControl, Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Radius, Layout, Shadows } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { categoryService } from '../../services/categoryService';
import { expenseService } from '../../services/expenseService';
import { formatFCFA } from '../../utils/format';
import { useFocusEffect } from '@react-navigation/native';

function progressColor(pct) {
  if (pct >= 90) return Colors.danger;
  if (pct >= 70) return Colors.warning;
  return Colors.primary;
}

function groupByDate(expenses) {
  const groups = {};
  for (const e of expenses) {
    const key = e.date;
    if (!groups[key]) groups[key] = [];
    groups[key].push(e);
  }
  return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
}

function dateLabel(dateStr) {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Aujourd'hui";
  if (d.toDateString() === yesterday.toDateString()) return 'Hier';
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
}

export default function ZoneDetailScreen({ navigation, route }) {
  const id = route.params?.id;
  const { token } = useAuth();
  const [category, setCategory] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!token || !id) return;
    try {
      const [cats, exps] = await Promise.all([
        categoryService.getAll(token),
        expenseService.getByCategory(token, Number(id)),
      ]);
      setCategory(cats.find(c => c.id === Number(id)) ?? null);
      setExpenses(exps ?? []);
    } finally {
      setRefreshing(false);
    }
  }, [token, id]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function deleteExpense(expId) {
    Alert.alert('Supprimer', 'Supprimer cette dépense ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => { await expenseService.delete(token, expId); load(); } },
    ]);
  }

  const pct = category?.progressPercent ?? 0;
  const color = progressColor(pct);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{category?.icone ?? '💰'} {category?.nom ?? ''}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={color} />}>

        {category && (
          <View style={styles.budgetCard}>
            <View style={styles.budgetCardTop}>
              <View style={styles.statsCol}>
                {[
                  { label: 'Alloué', value: category.montantAlloue, color: Colors.textPrimary },
                  { label: 'Dépensé', value: category.montantDepense, color: Colors.secondary },
                  { label: 'Restant', value: category.montantRestant, color: category.montantRestant >= 0 ? Colors.success : Colors.danger },
                ].map(s => (
                  <View key={s.label} style={styles.statRow}>
                    <Text style={styles.statLabel}>{s.label}</Text>
                    <Text style={[styles.statValue, { color: s.color }]}>{formatFCFA(s.value)}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.ring}>
                <View style={[styles.ringOuter, { borderColor: color + '30' }]}>
                  <Text style={[styles.ringPct, { color }]}>{Math.round(pct)}%</Text>
                  <Text style={styles.ringLabel}>utilisé</Text>
                </View>
              </View>
            </View>
            {pct >= 80 && (
              <View style={styles.warning}>
                <MaterialCommunityIcons name="alert-triangle" size={18} color="#92400E" />
                <Text style={styles.warningText}>Attention, budget presque épuisé</Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.section}>
          {expenses.length === 0 ? (
            <View style={styles.empty}>
              <MaterialCommunityIcons name="receipt-text-outline" size={40} color={Colors.textSecondary} />
              <Text style={styles.emptyText}>Aucune dépense ce mois</Text>
            </View>
          ) : (
            groupByDate(expenses).map(([date, items]) => (
              <View key={date} style={styles.group}>
                <Text style={styles.groupDate}>{dateLabel(date)}</Text>
                {items.map(exp => (
                  <TouchableOpacity
                    key={exp.id}
                    style={styles.expenseRow}
                    onLongPress={() => deleteExpense(exp.id)}>
                    <View style={styles.expLeft}>
                      <Text style={styles.expDesc}>{exp.description || exp.categoryNom}</Text>
                      <Text style={styles.expDate}>{new Date(exp.date).toLocaleDateString('fr-FR')}</Text>
                    </View>
                    <Text style={styles.expAmount}>- {formatFCFA(exp.montant)}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <View style={styles.fabArea}>
        <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AddExpense', { categoryId: id })}>
          <MaterialCommunityIcons name="plus" size={20} color={Colors.white} />
          <Text style={styles.fabLabel}>Ajouter une dépense</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Layout.screenPaddingHorizontal, paddingTop: 12, paddingBottom: 8,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary },
  scroll: { paddingBottom: 100 },
  budgetCard: {
    marginHorizontal: Layout.screenPaddingHorizontal, marginTop: 12,
    backgroundColor: Colors.white, borderRadius: Radius.card,
    padding: 20, gap: 16, ...Shadows.card,
  },
  budgetCardTop: { flexDirection: 'row', gap: 16 },
  statsCol: { flex: 1, gap: 10 },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statLabel: { fontSize: 13, color: Colors.textSecondary },
  statValue: { fontSize: 14, fontWeight: '700' },
  ring: { alignItems: 'center', justifyContent: 'center' },
  ringOuter: {
    width: 80, height: 80, borderRadius: 40,
    borderWidth: 8, alignItems: 'center', justifyContent: 'center',
  },
  ringPct: { fontSize: 16, fontWeight: '700' },
  ringLabel: { fontSize: 10, color: Colors.textSecondary },
  warning: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#FEF3C7', borderRadius: 10, padding: 10,
  },
  warningText: { fontSize: 13, fontWeight: '500', color: '#92400E' },
  section: { paddingHorizontal: Layout.screenPaddingHorizontal, marginTop: 16, gap: 16 },
  empty: { alignItems: 'center', paddingTop: 40, gap: 8 },
  emptyText: { fontSize: 14, color: Colors.textSecondary },
  group: { gap: 4 },
  groupDate: { fontSize: 13, fontWeight: '500', color: Colors.textSecondary, paddingVertical: 4 },
  expenseRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 12, paddingHorizontal: 16,
    backgroundColor: Colors.surfaceCard, borderRadius: 10,
  },
  expLeft: { gap: 2 },
  expDesc: { fontSize: 14, fontWeight: '500', color: Colors.textPrimary },
  expDate: { fontSize: 12, color: Colors.textSecondary },
  expAmount: { fontSize: 15, fontWeight: '700', color: Colors.danger },
  fabArea: { paddingHorizontal: Layout.screenPaddingHorizontal, paddingBottom: 16 },
  fab: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, height: 50, backgroundColor: Colors.primary,
    borderRadius: Radius.button, ...Shadows.button,
  },
  fabLabel: { color: Colors.white, fontSize: 15, fontWeight: '500' },
});
