import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, RefreshControl, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Radius, Layout, Shadows } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { tontineService } from '../../services/tontineService';
import { formatFCFA } from '../../utils/format';
import { useFocusEffect } from '@react-navigation/native';

function AvatarGroup({ membres = [], max = 4 }) {
  const shown = membres.slice(0, max);
  const extra = membres.length - max;
  return (
    <View style={styles.avatarGroup}>
      {shown.map((m, i) => (
        <View key={m.id ?? i} style={[styles.avatar, { marginLeft: i === 0 ? 0 : -8, zIndex: max - i }]}>
          <Text style={styles.avatarText}>{(m.userNom ?? '?')[0].toUpperCase()}</Text>
        </View>
      ))}
      {extra > 0 && (
        <View style={[styles.avatar, styles.avatarExtra, { marginLeft: -8 }]}>
          <Text style={styles.avatarExtraText}>+{extra}</Text>
        </View>
      )}
    </View>
  );
}

function TontineCard({ tontine, onPress, onPay }) {
  const freq = { MENSUEL: 'mois', HEBDOMADAIRE: 'semaine', BIMENSUEL: '2 semaines' }[tontine.frequence] ?? 'mois';
  const isActive = tontine.statut === 'ACTIVE';

  return (
    <View style={styles.tontineCard}>
      <View style={styles.tontineHeader}>
        <AvatarGroup membres={tontine.membres ?? []} />
        <View style={[styles.statutBadge, isActive && styles.statutBadgeActive]}>
          <Text style={[styles.statutText, isActive && styles.statutTextActive]}>
            {isActive ? 'Actif' : tontine.statut}
          </Text>
        </View>
      </View>

      <Text style={styles.tontineName}>{tontine.nom}</Text>
      <Text style={styles.tontineInfo}>
        {formatFCFA(tontine.montantParTour)} / {freq} · {tontine.nbMembres} membre{tontine.nbMembres > 1 ? 's' : ''}
      </Text>

      {isActive && tontine.prochainBeneficiaire && (
        <View style={styles.tourInfo}>
          <MaterialCommunityIcons name="clock-outline" size={14} color={Colors.secondary} />
          <Text style={styles.tourText}>Tour de {tontine.prochainBeneficiaire}</Text>
        </View>
      )}

      {isActive && tontine.totalParTour && (
        <View style={styles.duRow}>
          <MaterialCommunityIcons name="arrow-up-circle" size={14} color={Colors.textSecondary} />
          <Text style={styles.duText}>À verser : {formatFCFA(tontine.montantParTour)}</Text>
        </View>
      )}

      <Text style={styles.nbPaiements}>
        Tour {tontine.tourActuel} / {tontine.nbTours}
      </Text>

      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.detailBtn} onPress={onPress}>
          <Text style={styles.detailBtnLabel}>Voir détails</Text>
        </TouchableOpacity>
        {isActive && (
          <TouchableOpacity style={styles.payBtn} onPress={onPay}>
            <Text style={styles.payBtnLabel}>Payer maintenant</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

export default function CommunityScreen({ navigation }) {
  const { token } = useAuth();
  const [tontines, setTontines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('actives');

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const data = await tontineService.getMy(token);
      setTontines(data ?? []);
    } catch { } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const actives = tontines.filter(t => t.statut === 'ACTIVE' || t.statut === 'EN_ATTENTE');
  const historique = tontines.filter(t => t.statut === 'TERMINEE');
  const displayed = activeTab === 'actives' ? actives : historique;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Mes tontines</Text>
        <TouchableOpacity style={styles.notifBtn}>
          <MaterialCommunityIcons name="bell-outline" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Accès Bons Plans */}
      <TouchableOpacity
        style={styles.bonsPlansBtn}
        onPress={() => navigation.navigate('BonsPlans')}>
        <MaterialCommunityIcons name="tag-multiple" size={16} color={Colors.secondary} />
        <Text style={styles.bonsPlansBtnLabel}>Bons plans à proximité</Text>
        <MaterialCommunityIcons name="chevron-right" size={16} color={Colors.secondary} />
      </TouchableOpacity>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'actives' && styles.tabActive]}
          onPress={() => setActiveTab('actives')}>
          <Text style={[styles.tabLabel, activeTab === 'actives' && styles.tabLabelActive]}>
            Actives {actives.length > 0 ? `(${actives.length})` : ''}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'historique' && styles.tabActive]}
          onPress={() => setActiveTab('historique')}>
          <Text style={[styles.tabLabel, activeTab === 'historique' && styles.tabLabelActive]}>
            Historique {historique.length > 0 ? `(${historique.length})` : ''}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={Colors.primary} />}>

        {loading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
        ) : displayed.length === 0 ? (
          <View style={styles.empty}>
            <MaterialCommunityIcons name="account-group-outline" size={56} color={Colors.textSecondary} />
            <Text style={styles.emptyTitle}>
              {activeTab === 'actives' ? 'Aucune tontine active' : 'Aucun historique'}
            </Text>
            <Text style={styles.emptySub}>
              {activeTab === 'actives' ? 'Créez ou rejoignez une tontine pour commencer.' : ''}
            </Text>
          </View>
        ) : (
          displayed.map(t => (
            <TontineCard
              key={t.id}
              tontine={t}
              onPress={() => navigation.navigate('TontineDetail', { id: t.id })}
              onPay={() => navigation.navigate('TontineDetail', { id: t.id })}
            />
          ))
        )}

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* FAB Créer */}
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('CreateTontine')}>
        <MaterialCommunityIcons name="plus" size={20} color={Colors.white} />
        <Text style={styles.fabLabel}>Créer une tontine</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F5F7' },

  /* placeholder — unused */ _: {},
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Layout.screenPaddingHorizontal, paddingTop: 16, paddingBottom: 8,
  },
  title: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary },
  notifBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center',
    ...Shadows.card,
  },

  bonsPlansBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: Layout.screenPaddingHorizontal, marginBottom: 8,
    backgroundColor: '#FFF8E7', borderRadius: Radius.input,
    padding: 12, borderWidth: 1, borderColor: Colors.secondary + '30',
  },
  bonsPlansBtnLabel: { flex: 1, fontSize: 13, fontWeight: '600', color: Colors.secondary },

  tabs: {
    flexDirection: 'row', paddingHorizontal: Layout.screenPaddingHorizontal,
    gap: 8, marginBottom: 4,
  },
  tab: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  tabActive: { backgroundColor: Colors.primary },
  tabLabel: { fontSize: 14, fontWeight: '500', color: Colors.textSecondary },
  tabLabelActive: { color: Colors.white },

  scroll: { paddingHorizontal: Layout.screenPaddingHorizontal, paddingTop: 8, gap: 14 },

  /* Tontine Card */
  tontineCard: {
    backgroundColor: Colors.white, borderRadius: Radius.card,
    padding: 16, gap: 8, ...Shadows.card,
  },
  tontineHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

  avatarGroup: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.white,
  },
  avatarText: { fontSize: 12, fontWeight: '700', color: Colors.white },
  avatarExtra: { backgroundColor: Colors.textSecondary },
  avatarExtraText: { fontSize: 10, fontWeight: '700', color: Colors.white },

  statutBadge: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99,
    backgroundColor: '#E5E7EB',
  },
  statutBadgeActive: { backgroundColor: Colors.accent },
  statutText: { fontSize: 11, fontWeight: '600', color: Colors.textSecondary },
  statutTextActive: { color: Colors.primary },

  tontineName: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  tontineInfo: { fontSize: 13, color: Colors.textSecondary },

  tourInfo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tourText: { fontSize: 13, color: Colors.secondary, fontWeight: '500' },

  duRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  duText: { fontSize: 13, color: Colors.textSecondary },

  nbPaiements: { fontSize: 12, color: Colors.textSecondary },

  cardActions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  detailBtn: {
    flex: 1, height: 40, borderRadius: Radius.button,
    borderWidth: 1.5, borderColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  detailBtnLabel: { fontSize: 13, fontWeight: '600', color: Colors.primary },
  payBtn: {
    flex: 1, height: 40, borderRadius: Radius.button,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
    ...Shadows.button,
  },
  payBtnLabel: { fontSize: 13, fontWeight: '600', color: Colors.white },

  /* Empty */
  empty: { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  emptySub: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', paddingHorizontal: 40 },

  /* FAB */
  fab: {
    position: 'absolute', bottom: 24, alignSelf: 'center',
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.primary, borderRadius: 28,
    paddingHorizontal: 20, paddingVertical: 14,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  fabLabel: { fontSize: 15, fontWeight: '600', color: Colors.white },
});
