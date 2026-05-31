import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, RefreshControl, ActivityIndicator, Alert,
} from 'react-native';
import * as Location from 'expo-location';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Radius, Layout, Shadows } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { dealService } from '../../services/dealService';

// Coordonnées centre Yaoundé par défaut
const YAOUNDE = { latitude: 3.8667, longitude: 11.5167 };

const FILTRES = [
  { id: 'TOUS',     label: 'Tous',      icon: 'tag-multiple' },
  { id: 'RESTOS',   label: 'Restos',    icon: 'silverware-fork-knife' },
  { id: 'SHOPPING', label: 'Shopping',  icon: 'shopping' },
  { id: 'SERVICES', label: 'Services',  icon: 'tools' },
  { id: 'SANTE',    label: 'Santé',     icon: 'medical-bag' },
];

const CAT_COLORS = {
  RESTOS: '#FF6B6B', SHOPPING: '#4ECDC4', SERVICES: '#F5A623',
  SANTE: '#1B8A5A', TOUS: Colors.primary,
};

function StarRating({ rating }) {
  return (
    <View style={styles.stars}>
      <MaterialCommunityIcons name="star" size={13} color="#F59E0B" />
      <Text style={styles.ratingText}>{rating?.toFixed(1)}</Text>
    </View>
  );
}

function MapPlaceholder({ deals, userLocation }) {
  const pins = deals.slice(0, 6);
  return (
    <View style={styles.mapCard}>
      {/* Fond carte stylisé */}
      <View style={styles.mapBg}>
        <View style={styles.mapGrid} />
        <View style={[styles.mapGrid, styles.mapGridH]} />
        <View style={styles.mapRoad} />
        <View style={[styles.mapRoad, styles.mapRoadV]} />
      </View>

      {/* Pin utilisateur */}
      <View style={[styles.pin, styles.pinUser, { top: '45%', left: '48%' }]}>
        <MaterialCommunityIcons name="account-circle" size={22} color="#3B82F6" />
      </View>

      {/* Pins deals */}
      {pins.map((d, i) => {
        const positions = [
          { top: '20%', left: '20%' }, { top: '30%', left: '65%' },
          { top: '55%', left: '75%' }, { top: '70%', left: '25%' },
          { top: '15%', left: '50%' }, { top: '65%', left: '55%' },
        ];
        const pos = positions[i] || { top: '50%', left: '50%' };
        const color = CAT_COLORS[d.categorie] || Colors.secondary;
        return (
          <View key={d.id} style={[styles.pin, { top: pos.top, left: pos.left }]}>
            <View style={[styles.pinBubble, { backgroundColor: color }]}>
              <Text style={styles.pinEmoji}>{d.icone}</Text>
            </View>
          </View>
        );
      })}

      <View style={styles.mapOverlayBadge}>
        <MaterialCommunityIcons name="map-marker" size={14} color={Colors.primary} />
        <Text style={styles.mapOverlayText}>{userLocation?.city ?? 'Yaoundé'}</Text>
      </View>
    </View>
  );
}

function DealCard({ deal, onPress }) {
  const color = CAT_COLORS[deal.categorie] || Colors.primary;
  const dist = deal.distanceKm != null
    ? deal.distanceKm < 1 ? `${Math.round(deal.distanceKm * 1000)} m` : `${deal.distanceKm} km`
    : null;

  return (
    <TouchableOpacity style={styles.dealCard} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.dealIconBg, { backgroundColor: color + '20' }]}>
        <Text style={styles.dealEmoji}>{deal.icone ?? '🏷️'}</Text>
      </View>

      <View style={styles.dealInfo}>
        <Text style={styles.dealTitre} numberOfLines={1}>{deal.titre}</Text>
        <Text style={styles.dealDesc} numberOfLines={1}>{deal.description}</Text>
        <View style={styles.dealMeta}>
          <StarRating rating={deal.rating} />
          <Text style={styles.dealAvis}>{deal.nbAvis} avis</Text>
        </View>
      </View>

      <View style={styles.dealRight}>
        {dist && <Text style={styles.dealDist}>{dist}</Text>}
        {deal.reduction && (
          <View style={[styles.reductionBadge, { backgroundColor: color + '15' }]}>
            <Text style={[styles.reductionText, { color }]}>{deal.reduction}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function BonsPlansScreen({ navigation }) {
  const { token } = useAuth();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filtre, setFiltre] = useState('TOUS');
  const [location, setLocation] = useState(null);
  const [cityName, setCityName] = useState('Yaoundé');

  async function getLocation() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setLocation(loc.coords);
        // Reverse geocoding pour le nom de ville
        const geo = await Location.reverseGeocodeAsync(loc.coords);
        if (geo?.[0]?.city) setCityName(geo[0].city);
        return loc.coords;
      }
    } catch { }
    // Fallback Yaoundé
    return YAOUNDE;
  }

  const load = useCallback(async (coords) => {
    try {
      const loc = coords || location || YAOUNDE;
      const data = await dealService.getNearby(
        token, loc.latitude, loc.longitude, 15,
        filtre === 'TOUS' ? undefined : filtre
      );
      setDeals(data ?? []);
    } catch { } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, filtre, location]);

  useEffect(() => {
    setLoading(true);
    getLocation().then(coords => load(coords));
  }, []);

  useEffect(() => {
    if (!loading) load();
  }, [filtre]);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Bons plans</Text>
        <TouchableOpacity style={styles.locationChip}>
          <MaterialCommunityIcons name="map-marker" size={14} color={Colors.primary} />
          <Text style={styles.locationText}>{cityName}</Text>
        </TouchableOpacity>
      </View>

      {/* Filtres */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtresScroll}>
        <View style={styles.filtresRow}>
          {FILTRES.map(f => {
            const active = filtre === f.id;
            return (
              <TouchableOpacity
                key={f.id}
                style={[styles.filtreChip, active && styles.filtreChipActive]}
                onPress={() => setFiltre(f.id)}>
                <MaterialCommunityIcons
                  name={f.icon}
                  size={13}
                  color={active ? Colors.white : Colors.textSecondary}
                />
                <Text style={[styles.filtreLabel, active && styles.filtreLabelActive]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); load(); }}
            tintColor={Colors.primary}
          />
        }>

        {/* Mini carte */}
        <MapPlaceholder deals={deals} userLocation={{ city: cityName }} />

        {/* Liste des deals */}
        <View style={styles.listSection}>
          {loading ? (
            <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
          ) : deals.length === 0 ? (
            <View style={styles.empty}>
              <MaterialCommunityIcons name="tag-off-outline" size={48} color={Colors.textSecondary} />
              <Text style={styles.emptyTitle}>Aucun bon plan trouvé</Text>
              <Text style={styles.emptySub}>Essayez une autre catégorie ou élargissez la zone.</Text>
            </View>
          ) : (
            deals.map(deal => (
              <DealCard
                key={deal.id}
                deal={deal}
                onPress={() => navigation.navigate('DealDetail', { deal })}
              />
            ))
          )}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F5F7' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Layout.screenPaddingHorizontal,
    paddingTop: 16, paddingBottom: 10,
  },
  title: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary },
  locationChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.white, borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: Colors.primary + '30',
    ...Shadows.card,
  },
  locationText: { fontSize: 13, fontWeight: '600', color: Colors.primary },

  filtresScroll: { marginBottom: 4 },
  filtresRow: {
    flexDirection: 'row', gap: 8,
    paddingHorizontal: Layout.screenPaddingHorizontal,
    paddingBottom: 8,
  },
  filtreChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, backgroundColor: Colors.white,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  filtreChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filtreLabel: { fontSize: 13, fontWeight: '500', color: Colors.textSecondary },
  filtreLabelActive: { color: Colors.white },

  /* Mini carte stylisée */
  mapCard: {
    marginHorizontal: Layout.screenPaddingHorizontal,
    height: 160, borderRadius: Radius.card,
    backgroundColor: '#C8D8C0', overflow: 'hidden',
    position: 'relative', marginBottom: 16,
    ...Shadows.card,
  },
  mapBg: { ...StyleSheet.absoluteFillObject },
  mapGrid: {
    position: 'absolute', width: '100%', height: 1,
    backgroundColor: 'rgba(255,255,255,0.3)', top: '33%',
  },
  mapGridH: { top: '66%' },
  mapRoad: {
    position: 'absolute', height: '100%', width: 3,
    backgroundColor: 'rgba(255,255,255,0.5)', left: '40%',
  },
  mapRoadV: { width: '100%', height: 3, top: '50%', left: 0 },
  pin: { position: 'absolute', alignItems: 'center' },
  pinUser: {},
  pinBubble: {
    width: 28, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3, shadowRadius: 4, elevation: 4,
  },
  pinEmoji: { fontSize: 14 },
  mapOverlayBadge: {
    position: 'absolute', bottom: 8, right: 10,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.white, borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 4,
    ...Shadows.card,
  },
  mapOverlayText: { fontSize: 11, fontWeight: '600', color: Colors.primary },

  /* Liste */
  listSection: { paddingHorizontal: Layout.screenPaddingHorizontal, gap: 10 },

  dealCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.white, borderRadius: Radius.card,
    padding: 14, ...Shadows.card,
  },
  dealIconBg: {
    width: 48, height: 48, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  dealEmoji: { fontSize: 22 },
  dealInfo: { flex: 1, gap: 3 },
  dealTitre: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  dealDesc: { fontSize: 12, color: Colors.secondary, fontWeight: '500' },
  dealMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  stars: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingText: { fontSize: 12, fontWeight: '600', color: Colors.textPrimary },
  dealAvis: { fontSize: 11, color: Colors.textSecondary },

  dealRight: { alignItems: 'flex-end', gap: 6, flexShrink: 0 },
  dealDist: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  reductionBadge: { borderRadius: 99, paddingHorizontal: 8, paddingVertical: 4 },
  reductionText: { fontSize: 11, fontWeight: '700' },

  empty: { alignItems: 'center', paddingTop: 40, gap: 10 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  emptySub: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', paddingHorizontal: 40 },
});
