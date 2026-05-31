import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, Switch, Alert, Modal, TextInput,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Radius, Layout, Shadows } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import { formatFCFA } from '../../utils/format';
import { useFocusEffect } from '@react-navigation/native';

// ── Modal Modifier Profil ──
function EditProfileModal({ visible, profile, token, onClose, onSaved }) {
  const [nom, setNom] = useState(profile?.nom ?? '');
  const [telephone, setTelephone] = useState(profile?.telephone ?? '');
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    try {
      setLoading(true);
      const updated = await userService.updateProfile(token, { nom: nom.trim(), telephone: telephone.trim() });
      onSaved(updated);
      onClose();
    } catch (e) {
      Alert.alert('Erreur', e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.modalSafe}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.modalCancel}>Annuler</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Modifier le profil</Text>
          <TouchableOpacity onPress={handleSave} disabled={loading}>
            {loading ? <ActivityIndicator color={Colors.primary} /> : <Text style={styles.modalSave}>Sauver</Text>}
          </TouchableOpacity>
        </View>
        <View style={styles.modalBody}>
          <View style={styles.modalField}>
            <Text style={styles.fieldLabel}>Nom complet</Text>
            <TextInput style={styles.fieldInput} value={nom} onChangeText={setNom} placeholder="Votre nom" placeholderTextColor={Colors.textSecondary} />
          </View>
          <View style={styles.modalField}>
            <Text style={styles.fieldLabel}>Téléphone</Text>
            <TextInput style={styles.fieldInput} value={telephone} onChangeText={setTelephone} placeholder="+237 6XX XXX XXX" placeholderTextColor={Colors.textSecondary} keyboardType="phone-pad" />
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

// ── Modal Changer Mot de Passe ──
function ChangePasswordModal({ visible, token, onClose }) {
  const [current, setCurrent] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleChange() {
    if (newPwd.length < 8) return Alert.alert('Erreur', 'Minimum 8 caractères.');
    if (newPwd !== confirm) return Alert.alert('Erreur', 'Les mots de passe ne correspondent pas.');
    try {
      setLoading(true);
      await userService.changePassword(token, current, newPwd);
      Alert.alert('✅ Succès', 'Mot de passe modifié.');
      setCurrent(''); setNewPwd(''); setConfirm('');
      onClose();
    } catch (e) {
      Alert.alert('Erreur', e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.modalSafe}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}><Text style={styles.modalCancel}>Annuler</Text></TouchableOpacity>
          <Text style={styles.modalTitle}>Changer le mot de passe</Text>
          <TouchableOpacity onPress={handleChange} disabled={loading}>
            {loading ? <ActivityIndicator color={Colors.primary} /> : <Text style={styles.modalSave}>Valider</Text>}
          </TouchableOpacity>
        </View>
        <View style={styles.modalBody}>
          {[
            { label: 'Mot de passe actuel', val: current, set: setCurrent },
            { label: 'Nouveau mot de passe', val: newPwd, set: setNewPwd },
            { label: 'Confirmer le nouveau', val: confirm, set: setConfirm },
          ].map(f => (
            <View key={f.label} style={styles.modalField}>
              <Text style={styles.fieldLabel}>{f.label}</Text>
              <TextInput style={styles.fieldInput} value={f.val} onChangeText={f.set} secureTextEntry placeholderTextColor={Colors.textSecondary} placeholder="••••••••" />
            </View>
          ))}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

export default function ProfileScreen({ navigation }) {
  const { user, token, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [pwdOpen, setPwdOpen] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const data = await userService.getProfile(token);
      setProfile(data);
    } catch { } finally {
      setRefreshing(false);
    }
  }, [token]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function togglePref(key, value) {
    try {
      const updated = await userService.updatePreferences(token, { [key]: value });
      setProfile(updated);
    } catch (e) {
      Alert.alert('Erreur', e.message);
    }
  }

  function handleLogout() {
    Alert.alert('Déconnexion', 'Voulez-vous vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Se déconnecter', style: 'destructive', onPress: () => { logout(); navigation.replace('Login'); } },
    ]);
  }

  function handleDeleteAccount() {
    Alert.alert('Supprimer le compte', 'Cette action est irréversible. Toutes vos données seront supprimées.', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive',
        onPress: async () => {
          try {
            await userService.deleteAccount(token);
            logout();
            navigation.replace('Login');
          } catch (e) { Alert.alert('Erreur', e.message); }
        },
      },
    ]);
  }

  const initiales = (profile?.nom ?? user?.nom ?? 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const PARAMS = [
    { key: 'notificationsEnabled', label: 'Notifications', icon: 'bell-outline', value: profile?.notificationsEnabled ?? true },
    { key: 'modeSombre', label: 'Mode sombre', icon: 'weather-night', value: profile?.modeSombre ?? false },
    { key: 'partagerStats', label: 'Partager mes stats', icon: 'chart-bar', value: profile?.partagerStats ?? false },
  ];

  const COMPTE_ITEMS = [
    { label: 'Changer le mot de passe', icon: 'lock-outline', onPress: () => setPwdOpen(true) },
    { label: 'Notifications', icon: 'bell-ring-outline', onPress: () => navigation.navigate('Notifications') },
    { label: 'Bilan mensuel', icon: 'chart-pie', onPress: () => navigation.navigate('BilanMensuel') },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={Colors.primary} />}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mon profil</Text>
        </View>

        {/* Avatar + Nom */}
        <View style={styles.profileSection}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{initiales}</Text>
          </View>
          <Text style={styles.profileName}>{profile?.nom ?? user?.nom ?? '—'}</Text>
          <Text style={styles.profileEmail}>{profile?.email ?? user?.email ?? '—'}</Text>
          <TouchableOpacity style={styles.editBtn} onPress={() => setEditOpen(true)}>
            <MaterialCommunityIcons name="pencil-outline" size={16} color={Colors.primary} />
            <Text style={styles.editBtnLabel}>Modifier le profil</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statVal} numberOfLines={1}>
              {profile?.depensesTotales ? (profile.depensesTotales / 1000).toFixed(0) + 'K' : '—'}
            </Text>
            <Text style={styles.statLabel}>Dépenses totales</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statVal}>{profile?.tauxBudgetRespect?.toFixed(0) ?? '—'}%</Text>
            <Text style={styles.statLabel}>Budget respecté</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statVal}>
              {profile?.epargneTotal ? (profile.epargneTotal / 1000).toFixed(0) + 'K' : '0K'}
            </Text>
            <Text style={styles.statLabel}>Épargné</Text>
          </View>
        </View>

        {/* Paramètres toggles */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>PARAMÈTRES</Text>
        </View>
        <View style={styles.settingsCard}>
          {PARAMS.map((p, i) => (
            <View key={p.key} style={[styles.settingRow, i > 0 && styles.settingBorder]}>
              <MaterialCommunityIcons name={p.icon} size={20} color={Colors.textSecondary} />
              <Text style={styles.settingLabel}>{p.label}</Text>
              <Switch
                value={p.value}
                onValueChange={v => togglePref(p.key, v)}
                trackColor={{ false: '#E5E7EB', true: Colors.primary }}
                thumbColor={Colors.white}
              />
            </View>
          ))}
        </View>

        {/* Compte */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>COMPTE</Text>
        </View>
        <View style={styles.settingsCard}>
          {COMPTE_ITEMS.map((item, i) => (
            <TouchableOpacity key={item.label} style={[styles.settingRow, i > 0 && styles.settingBorder]} onPress={item.onPress}>
              <MaterialCommunityIcons name={item.icon} size={20} color={Colors.textSecondary} />
              <Text style={styles.settingLabel}>{item.label}</Text>
              <MaterialCommunityIcons name="chevron-right" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={[styles.settingRow, styles.settingBorder]} onPress={handleDeleteAccount}>
            <MaterialCommunityIcons name="delete-outline" size={20} color={Colors.danger} />
            <Text style={[styles.settingLabel, { color: Colors.danger }]}>Supprimer le compte</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color={Colors.danger} />
          </TouchableOpacity>
        </View>

        {/* Déconnexion */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={20} color={Colors.danger} />
          <Text style={styles.logoutLabel}>Se déconnecter</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      <EditProfileModal
        visible={editOpen}
        profile={profile}
        token={token}
        onClose={() => setEditOpen(false)}
        onSaved={setProfile}
      />
      <ChangePasswordModal
        visible={pwdOpen}
        token={token}
        onClose={() => setPwdOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F5F7' },

  header: { alignItems: 'center', paddingVertical: 14 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },

  profileSection: {
    backgroundColor: Colors.white, alignItems: 'center',
    paddingVertical: 24, paddingHorizontal: 20, gap: 6,
  },
  avatarCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
    marginBottom: 4,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
  },
  avatarText: { fontSize: 30, fontWeight: '800', color: Colors.white },
  profileName: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary },
  profileEmail: { fontSize: 13, color: Colors.textSecondary },
  editBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1.5, borderColor: Colors.primary,
    borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, marginTop: 8,
  },
  editBtnLabel: { fontSize: 13, fontWeight: '600', color: Colors.primary },

  statsRow: {
    flexDirection: 'row', backgroundColor: Colors.white,
    paddingVertical: 16, paddingHorizontal: 8, marginTop: 10,
    ...Shadows.card,
  },
  statBox: { flex: 1, alignItems: 'center', gap: 3 },
  statVal: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
  statLabel: { fontSize: 10, color: Colors.textSecondary, textAlign: 'center' },
  statDivider: { width: 1, backgroundColor: '#E5E7EB', alignSelf: 'stretch', marginVertical: 4 },

  sectionHeader: { paddingHorizontal: Layout.screenPaddingHorizontal, paddingTop: 20, paddingBottom: 8 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: Colors.textSecondary, letterSpacing: 0.8 },

  settingsCard: {
    backgroundColor: Colors.white, marginHorizontal: Layout.screenPaddingHorizontal,
    borderRadius: Radius.card, overflow: 'hidden', ...Shadows.card,
  },
  settingRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingHorizontal: 16, paddingVertical: 15,
  },
  settingBorder: { borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  settingLabel: { flex: 1, fontSize: 15, color: Colors.textPrimary },

  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginHorizontal: Layout.screenPaddingHorizontal, marginTop: 14,
    height: 52, borderRadius: Radius.button,
    borderWidth: 1.5, borderColor: Colors.danger,
    backgroundColor: '#FFF5F5',
  },
  logoutLabel: { fontSize: 15, fontWeight: '700', color: Colors.danger },

  /* Modals */
  modalSafe: { flex: 1, backgroundColor: Colors.white },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  modalCancel: { fontSize: 15, color: Colors.textSecondary },
  modalTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  modalSave: { fontSize: 15, fontWeight: '700', color: Colors.primary },
  modalBody: { padding: 20, gap: 20 },
  modalField: { gap: 6 },
  fieldLabel: { fontSize: 13, fontWeight: '500', color: Colors.textPrimary },
  fieldInput: {
    height: 52, backgroundColor: Colors.surfaceCard,
    borderRadius: Radius.input, borderWidth: 1, borderColor: '#E5E7EB',
    paddingHorizontal: 16, fontSize: 15, color: Colors.textPrimary,
  },
});
