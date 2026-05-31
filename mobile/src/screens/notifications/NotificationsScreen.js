import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, RefreshControl, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Colors, Radius, Layout, Shadows } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { notificationService } from '../../services/notificationService';

const TABS = ['Toutes', 'Paiements', 'Budget', 'Tontines'];
const TAB_TYPE_MAP = {
  Paiements: 'PAIEMENT',
  Budget: 'BUDGET',
  Tontines: 'TONTINE',
};

const TYPE_META = {
  BUDGET:   { icon: 'alert-circle', color: '#F59E0B' },
  PAIEMENT: { icon: 'check-circle', color: Colors.success },
  TONTINE:  { icon: 'account-group', color: '#8B5CF6' },
  CASH:     { icon: 'cash-clock', color: Colors.secondary },
  DEAL:     { icon: 'tag', color: Colors.primary },
  SYSTEM:   { icon: 'bell', color: Colors.textSecondary },
};

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return "à l'instant";
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)}min`;
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)}h`;
  if (diff < 172800) return 'Hier';
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

function NotifCard({ notif, onPress, onDelete }) {
  const meta = TYPE_META[notif.type] ?? TYPE_META.SYSTEM;
  return (
    <TouchableOpacity
      style={[styles.notifCard, !notif.lue && styles.notifCardUnread]}
      onPress={() => onPress(notif)}
      onLongPress={() => onDelete(notif)}>
      <View style={[styles.notifIcon, { backgroundColor: meta.color + '20' }]}>
        <MaterialCommunityIcons name={meta.icon} size={20} color={meta.color} />
      </View>
      <View style={styles.notifInfo}>
        <Text style={[styles.notifTitre, !notif.lue && { fontWeight: '700' }]} numberOfLines={2}>
          {notif.titre}
        </Text>
        <Text style={styles.notifSousTitre} numberOfLines={1}>{notif.message}</Text>
        <Text style={styles.notifTemps}>{timeAgo(notif.date)}</Text>
      </View>
      {!notif.lue && <View style={[styles.unreadDot, { backgroundColor: meta.color }]} />}
    </TouchableOpacity>
  );
}

export default function NotificationsScreen({ navigation }) {
  const { token } = useAuth();
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState('Toutes');
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (tab = activeTab) => {
    if (!token) return;
    try {
      const type = TAB_TYPE_MAP[tab] ?? null;
      const data = await notificationService.getAll(token, type);
      setNotifs(data ?? []);
    } catch { } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, activeTab]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  function switchTab(tab) {
    setActiveTab(tab);
    setLoading(true);
    const type = TAB_TYPE_MAP[tab] ?? null;
    notificationService.getAll(token, type)
      .then(data => setNotifs(data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  async function handlePress(notif) {
    if (!notif.lue) {
      await notificationService.markRead(token, notif.id).catch(() => {});
      setNotifs(prev => prev.map(n => n.id === notif.id ? { ...n, lue: true } : n));
    }
  }

  async function handleDelete(notif) {
    await notificationService.delete(token, notif.id).catch(() => {});
    setNotifs(prev => prev.filter(n => n.id !== notif.id));
  }

  async function markAllRead() {
    await notificationService.markAllRead(token).catch(() => {});
    setNotifs(prev => prev.map(n => ({ ...n, lue: true })));
  }

  const unreadCount = notifs.filter(n => !n.lue).length;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        {unreadCount > 0 ? (
          <TouchableOpacity onPress={markAllRead}>
            <Text style={styles.markAll}>Tout lire</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 52 }} />
        )}
      </View>

      {/* Tabs */}
      <ScrollView
        horizontal showsHorizontalScrollIndicator={false}
        style={styles.tabsScroll} contentContainerStyle={styles.tabsContent}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => switchTab(tab)}>
            <Text style={[styles.tabLabel, activeTab === tab && styles.tabLabelActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Liste */}
      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={Colors.primary} size="large" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); load(); }}
              tintColor={Colors.primary}
            />
          }>
          {notifs.length === 0 ? (
            <View style={styles.empty}>
              <MaterialCommunityIcons name="bell-off-outline" size={56} color={Colors.textSecondary} />
              <Text style={styles.emptyTitle}>Aucune notification</Text>
              <Text style={styles.emptyText}>Vous êtes à jour !</Text>
            </View>
          ) : (
            notifs.map(notif => (
              <NotifCard
                key={notif.id}
                notif={notif}
                onPress={handlePress}
                onDelete={handleDelete}
              />
            ))
          )}
          {notifs.length > 0 && (
            <Text style={styles.hint}>Appui long pour supprimer une notification</Text>
          )}
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
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  badge: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: Colors.danger, alignItems: 'center', justifyContent: 'center',
  },
  badgeText: { fontSize: 10, fontWeight: '700', color: Colors.white },
  markAll: { fontSize: 13, color: Colors.primary, fontWeight: '600' },

  tabsScroll: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
    maxHeight: 52, flexGrow: 0,
  },
  tabsContent: { flexDirection: 'row', gap: 4, paddingHorizontal: 16, paddingVertical: 8 },
  tab: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20 },
  tabActive: { backgroundColor: Colors.primary },
  tabLabel: { fontSize: 13, fontWeight: '500', color: Colors.textSecondary },
  tabLabelActive: { color: Colors.white },

  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  list: { padding: 16, gap: 10, paddingBottom: 32 },

  notifCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.white, borderRadius: Radius.card,
    padding: 14, ...Shadows.card,
  },
  notifCardUnread: { borderLeftWidth: 3, borderLeftColor: Colors.primary },
  notifIcon: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  notifInfo: { flex: 1, gap: 3 },
  notifTitre: { fontSize: 14, color: Colors.textPrimary, lineHeight: 19 },
  notifSousTitre: { fontSize: 12, color: Colors.textSecondary },
  notifTemps: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },

  empty: { alignItems: 'center', paddingTop: 80, gap: 10 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  emptyText: { fontSize: 13, color: Colors.textSecondary },

  hint: {
    textAlign: 'center', fontSize: 11, color: Colors.textSecondary,
    marginTop: 4, paddingBottom: 8,
  },
});
