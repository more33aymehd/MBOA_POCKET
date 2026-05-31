import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, ActivityIndicator, Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Radius, Layout, Shadows } from '../../constants/theme';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import KeyboardLayout from '../../components/KeyboardLayout';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password) {
      Alert.alert('Champs requis', 'Remplissez email et mot de passe.');
      return;
    }
    try {
      setLoading(true);
      const res = await authService.login(email.trim(), password);
      await login(res.token, { id: res.userId, nom: res.nom, email: res.email });
      navigation.replace('MainTabs');
    } catch (e) {
      Alert.alert('Erreur', e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardLayout>
        <View style={styles.inner}>
          {/* Logo */}
          <View style={styles.logoArea}>
            <View style={styles.logoBox}>
              <Text style={styles.logoLetter}>M</Text>
            </View>
            <Text style={styles.title}>Bon retour 👋</Text>
            <Text style={styles.subtitle}>Connectez-vous à votre compte</Text>
          </View>

          {/* Formulaire */}
          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="email@exemple.com"
                placeholderTextColor={Colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Mot de passe</Text>
              <View style={styles.pwdRow}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Entrez votre mot de passe"
                  placeholderTextColor={Colors.textSecondary}
                  secureTextEntry={!showPwd}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
                <TouchableOpacity onPress={() => setShowPwd(!showPwd)} style={styles.eyeBtn}>
                  <MaterialCommunityIcons name={showPwd ? 'eye-off' : 'eye'} size={20} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.forgotRow}>
                <Text style={styles.forgot}>Mot de passe oublié ?</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={[styles.btn, loading && { opacity: 0.7 }]} onPress={handleLogin} disabled={loading}>
              {loading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.btnLabel}>Se connecter</Text>}
            </TouchableOpacity>

            <View style={styles.orRow}>
              <View style={styles.line} /><Text style={styles.orText}>ou</Text><View style={styles.line} />
            </View>

            <TouchableOpacity style={styles.socialBtn}>
              <MaterialCommunityIcons name="google" size={20} color="#EA4335" />
              <Text style={styles.socialLabel}>Continuer avec Google</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.registerRow}>
            <Text style={styles.registerText}>Pas encore de compte ? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>S'inscrire</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardLayout>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  inner: { flex: 1, paddingHorizontal: Layout.screenPaddingHorizontal, paddingTop: 40 },
  logoArea: { alignItems: 'center', gap: 8, marginBottom: 36 },
  logoBox: {
    width: 56, height: 56, borderRadius: 16,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  logoLetter: { fontSize: 24, fontWeight: '800', color: Colors.white },
  title: { fontSize: 26, fontWeight: '700', color: Colors.textPrimary },
  subtitle: { fontSize: 14, color: Colors.textSecondary },
  form: { gap: 20 },
  field: { gap: 6 },
  label: { fontSize: 13, fontWeight: '500', color: Colors.textPrimary },
  input: {
    height: Layout.inputHeight, backgroundColor: Colors.surfaceCard,
    borderRadius: Radius.input, borderWidth: 1, borderColor: '#E5E7EB',
    paddingHorizontal: 16, fontSize: 15, color: Colors.textPrimary,
  },
  pwdRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  eyeBtn: {
    width: Layout.inputHeight, height: Layout.inputHeight,
    backgroundColor: Colors.surfaceCard, borderRadius: Radius.input,
    borderWidth: 1, borderColor: '#E5E7EB',
    alignItems: 'center', justifyContent: 'center',
  },
  forgotRow: { alignItems: 'flex-end', marginTop: 4 },
  forgot: { fontSize: 13, color: Colors.primary, fontWeight: '500' },
  btn: {
    height: Layout.buttonHeight, backgroundColor: Colors.primary,
    borderRadius: Radius.button, alignItems: 'center', justifyContent: 'center',
    marginTop: 4, ...Shadows.button,
  },
  btnLabel: { color: Colors.white, fontSize: 16, fontWeight: '600' },
  orRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  line: { flex: 1, height: 1, backgroundColor: '#E5E7EB' },
  orText: { fontSize: 13, color: Colors.textSecondary },
  socialBtn: {
    height: 48, borderRadius: Radius.input, borderWidth: 1, borderColor: '#E5E7EB',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
  },
  socialLabel: { fontSize: 15, fontWeight: '500', color: Colors.textPrimary },
  registerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 28 },
  registerText: { fontSize: 14, color: Colors.textSecondary },
  registerLink: { fontSize: 14, color: Colors.primary, fontWeight: '600' },
});
