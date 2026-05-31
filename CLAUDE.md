# CLAUDE.md — Mboapocket Design System

## 🎯 Contexte du projet

**Mboapocket** est une application mobile financière tout-en-un pensée pour les utilisateurs africains (marché camerounais en priorité). Elle combine :
- Gestion de budget personnel assistée par IA
- Paiements mobiles (Orange Money, MTN Mobile Money)
- Entraide financière communautaire (tontines)
- Géolocalisation et bons plans

**Stack mobile** : React Native Expo (JavaScript)

---

## 🎨 Identité visuelle

### Nom
**Mboapocket** — "Mboa" signifie "chez nous / notre maison" en argot camerounais. L'app doit dégager chaleur, confiance et modernité africaine.

### Style général
- **Direction** : Fintech moderne à identité africaine — chaud, vibrant, professionnel
- **Ambiance** : Confiant, accessible, communautaire
- **Référence** : Entre Revolut (clarté) et une identité visuelle afro-urbaine (chaleur, couleurs)

### Palette de couleurs
```
Primaire      : #1B8A5A  (vert émeraude africain — confiance, argent, nature)
Secondaire    : #F5A623  (orange chaud — énergie, Orange Money, soleil)
Accent        : #E8F5EE  (vert très clair — fonds de cards, backgrounds doux)
Dark bg       : #0F1F17  (vert très sombre — mode sombre)
Texte principal : #1A1A2E
Texte secondaire : #6B7280
Succès        : #22C55E
Danger        : #EF4444
Warning       : #F59E0B
Blanc         : #FFFFFF
Surface card  : #F9FAFB
```

### Typographie
```
Display / Titres  : "Plus Jakarta Sans" (Bold 700, 800)
Body / Interface  : "DM Sans" (Regular 400, Medium 500)
Chiffres / Montants : "Space Grotesk" (Bold — pour les montants financiers)
```

### Iconographie
- Style : Rounded, filled (pas outline)
- Librairie : Expo Vector Icons / MaterialCommunityIcons
- Taille standard : 24px (nav), 20px (inline), 32px (featured)

---

## 📐 Grille & Espacements

```
Border radius cards   : 16px
Border radius boutons : 12px
Border radius inputs  : 10px
Padding écran        : 20px horizontal
Espacement sections  : 24px
Hauteur bouton CTA   : 54px
Hauteur input        : 52px
Shadow cards         : 0px 4px 16px rgba(0,0,0,0.08)
```

---

## 🧩 Composants UI standards

### Bouton primaire
```
Background : #1B8A5A
Texte      : Blanc, DM Sans Medium 16px
Radius     : 12px
Height     : 54px
Shadow     : 0px 4px 12px rgba(27,138,90,0.3)
```

### Bouton secondaire
```
Background : transparent
Border     : 1.5px solid #1B8A5A
Texte      : #1B8A5A, DM Sans Medium 16px
```

### Card budget
```
Background  : #FFFFFF
Border      : none
Radius      : 16px
Shadow      : 0px 4px 16px rgba(0,0,0,0.08)
Padding     : 20px
```

### Barre de progression budget
```
Background track : #E8F5EE
Fill normal      : #1B8A5A
Fill warning     : #F59E0B  (>70%)
Fill danger      : #EF4444  (>90%)
Height           : 8px
Radius           : 99px
```

### Bottom Navigation Bar
```
Background : #FFFFFF
Shadow     : 0px -2px 12px rgba(0,0,0,0.06)
Icône actif : #1B8A5A
Icône inactif : #9CA3AF
Label       : DM Sans 11px
```

---

## 📱 Structure de navigation

### Bottom Tab Navigator (5 onglets)
```
1. 🏠 Accueil     → HomeScreen
2. 💳 Payer       → PayScreen
3. 📊 Budget      → BudgetScreen
4. 👥 Communauté  → CommunityScreen (Tontines + Bons plans)
5. 👤 Profil      → ProfileScreen
```

### Stack Navigator par tab
```
Accueil     → Home → DétailZone → Bilan mensuel
Payer       → Pay → Scanner → Confirmation → Succès
Budget      → Budget → SetupBudget → Questionnaire IA → Proposition IA
Communauté  → Tontines → CréerTontine → DétailTontine / BonsPlans
Profil      → Profil → Paramètres → Notifications
```

---

## 🖼️ Liste des 26 écrans à designer

### Groupe 1 — Onboarding
- [ ] 01_SplashScreen
- [ ] 02_Onboarding_1 (Gestion budget)
- [ ] 03_Onboarding_2 (Paiement mobile)
- [ ] 04_Onboarding_3 (Tontines & communauté)
- [ ] 05_Inscription
- [ ] 06_Connexion

### Groupe 2 — Setup Budget IA
- [ ] 07_SetupRevenu
- [ ] 08_QuestionnaireIA
- [ ] 09_PropositionIA
- [ ] 10_ValidationBudget

### Groupe 3 — Écrans principaux
- [ ] 11_HomeDashboard
- [ ] 12_ZonesDépenses
- [ ] 13_DétailZone
- [ ] 14_BilanMensuel

### Groupe 4 — Paiement
- [ ] 15_PayerScreen
- [ ] 16_ScannerFilmer
- [ ] 17_ConfirmationPaiement
- [ ] 18_SuccèsPaiement

### Groupe 5 — Rappel cash
- [ ] 19_RappelFinJournée
- [ ] 20_SaisieDépensesCash

### Groupe 6 — Tontines
- [ ] 21_MesTontines
- [ ] 22_CréerTontine
- [ ] 23_DétailTontine

### Groupe 7 — Bons plans & Profil
- [ ] 24_BonsPlans
- [ ] 25_Profil
- [ ] 26_Notifications

---

## 📏 Format des écrans

```
Taille de référence : iPhone 14 Pro — 393 x 852 px
Safe area top       : 59px (Dynamic Island)
Safe area bottom    : 34px
Format Pencil.dev   : Mobile frame activé
```

---

## 🧠 Règles de design IA (pour les prompts Pencil.dev)

1. **Toujours** utiliser la palette définie — ne pas inventer de nouvelles couleurs
2. **Toujours** afficher le bottom navigation bar sauf sur Onboarding/Auth
3. Les montants financiers utilisent **Space Grotesk Bold**
4. Les barres de progression indiquent l'état du budget (vert / orange / rouge)
5. Chaque écran a un **header clair** avec titre centré + icône retour si nécessaire
6. Les cards ont toujours une **ombre légère** (pas de border)
7. Mode clair uniquement pour le Lo-Fi — le Hi-Fi aura les deux modes
8. Chaque écran doit être **compréhensible sans texte** (icônes parlantes)

---

## ✅ Workflow design recommandé

```
1. Lo-Fi → valider structure et navigation (noir/blanc)
2. Hi-Fi Mode Clair → appliquer palette et typographie
3. Hi-Fi Mode Sombre → variante dark theme
4. Export vers Claude Code → générer les composants React Native
```
