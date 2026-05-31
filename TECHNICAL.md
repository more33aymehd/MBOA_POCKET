# TECHNICAL.md — Mboapocket Development Roadmap

## 🎯 Vision générale

**Mboapocket** est une application mobile financière complète, développée par **phases indépendantes et testables**.

Chaque phase produit une **app fonctionnelle et deployable** sans dépendre des phases suivantes.

Stack :
- **Mobile** : React Native Expo (JavaScript)
- **Backend** : Spring Boot 3 (Java)
- **Database** : MySQL 8
- **IDE** : VS Code + Claude Code extension

---

## 📋 Structure du projet

```
mboapocket/
├── backend/                    # Spring Boot
│   ├── src/main/java/
│   │   └── com/mboapocket/
│   │       ├── auth/
│   │       ├── budget/
│   │       ├── expense/
│   │       ├── transaction/
│   │       ├── tontine/
│   │       ├── deal/
│   │       └── config/
│   ├── pom.xml
│   ├── Dockerfile
│   └── application.properties
│
├── mobile/                     # React Native Expo
│   ├── app.json
│   ├── package.json
│   ├── src/
│   │   ├── screens/
│   │   ├── components/
│   │   ├── services/
│   │   ├── context/
│   │   ├── navigation/
│   │   ├── styles/
│   │   └── utils/
│   └── README.md
│
├── CLAUDE.md                   # Design system
├── TECHNICAL.md                # This file
└── README.md                   # Main project overview
```

---

## 🚀 Phases de développement

### **PHASE 0 — Setup complet du projet** (1-2h)
**Objectif** : Avoir un projet qui démarre sans erreur.

**Livrables** :
- [x] Dossiers backend + mobile créés
- [x] `pom.xml` avec dépendances Spring Boot (web, JPA, MySQL, Lombok, Security, JWT)
- [x] `package.json` avec dépendances Expo
- [x] `application.properties` configuré (port 8080, MySQL, JWT)
- [x] Dockerfile pour backend
- [x] README avec instructions de lancement

**Frontend fonctionnel** :
- [x] Splash screen vert Mboapocket
- [x] Commande `expo start` qui fonctionne
- [x] Navigation 5 onglets (Accueil, Payer, Budget, Communauté, Profil)
- [x] Palette couleurs + theme.ts Mboapocket

**Backend fonctionnel** :
- [x] Serveur Spring Boot démarre sur `http://localhost:8080`
- [x] Endpoint `GET /api/health` retourne `{ "status": "OK" }`

**Base de données** :
- [x] MySQL local
- [x] Base `mboapocket_dev` créée

---

### **PHASE 1 — Authentification** (3-4h)
**Objectif** : Inscription + Connexion + JWT.

**Livrables backend** :
- [x] Entité `User` (id, nom, email, telephone, password, dateCreation)
- [x] Migration SQL : `CREATE TABLE users` (via JPA ddl-auto)
- [x] AuthController : `POST /api/auth/register`, `POST /api/auth/login`
- [x] JWT : génération + validation (jjwt 0.12.3)
- [x] Réponse : `{ token, userId, nom, email }`
- [x] PasswordEncoder (BCrypt)
- [x] Spring Security — routes publiques + filtre JWT + CORS

**Livrables frontend** :
- [x] Écran LoginScreen (email + password) — design Pencil 06
- [x] Écran RegisterScreen (nom + email + téléphone + password) — design Pencil 05
- [x] AuthContext : stockage JWT dans AsyncStorage
- [x] authService.ts : appels API
- [x] Navigation conditionnelle : connecté → HomeScreen, sinon → LoginScreen
- [x] Persistance : token persiste après fermeture de l'app

**Test indépendant** :
```
✅ Créer un compte
✅ Se connecter
✅ Rester connecté après fermeture/réouverture
✅ Se déconnecter (ProfileScreen)
```

---

### **PHASE 2 — Budget mensuel** (2-3h)
**Objectif** : Créer et visualiser son budget du mois.

**Livrables backend** :
- [x] Entité `Budget` (id, userId, montantTotal, mois, annee, objectifEpargne)
- [x] Migration SQL : `CREATE TABLE budgets` (via JPA ddl-auto)
- [x] BudgetController (routes JWT) :
  - `POST /api/budgets` → créer
  - `GET /api/budgets/current` → récupérer budget du mois en cours
  - `PUT /api/budgets/{id}` → modifier
- [x] Calcul auto du "montant restant" (Phase 2 : montantRestant = montantTotal)

**Livrables frontend** :
- [x] HomeScreen : Hero Card gradient vert (montant total, restant, objectif, progress bar)
- [x] SetupBudget screen (app/setup-budget.tsx) — design Pencil 07, 2 étapes + chips rapides
- [x] budgetService.ts avec appels API authentifiés
- [x] fetchAuth() : token JWT envoyé sur chaque requête
- [x] utils/format.ts : formatFCFA, nomMois

**Test indépendant** :
```
✅ Créer un budget pour le mois
✅ Voir le budget sur HomeScreen (Hero Card verte)
✅ Modifier le budget (PUT /api/budgets/{id})
✅ Les données persistent après rechargement
```

---

### **PHASE 3 — Catégories & Dépenses** (3-4h)
**Objectif** : Créer des zones de dépenses et enregistrer des dépenses.

**Livrables backend** :
- [ ] Entité `Category` (id, userId, nom, icone, montantAlloue, couleur)
- [ ] Entité `Expense` (id, userId, categoryId, montant, description, date)
- [ ] Migrations SQL
- [ ] CategoryController (CRUD, JWT) :
  - `POST /api/categories`
  - `GET /api/categories`
  - `PUT /api/categories/{id}`
  - `DELETE /api/categories/{id}`
- [ ] ExpenseController :
  - `POST /api/expenses` → ajouter dépense
  - `GET /api/expenses?mois=6&annee=2025` → liste du mois
  - `DELETE /api/expenses/{id}`
  - `PUT /api/expenses/{id}` → modifier
- [ ] Recalcul auto du "montant restant" par catégorie

**Livrables frontend** :
- [ ] CategoriesScreen : liste des catégories + progression budgétaire
- [ ] AddExpenseScreen : formulaire (montant, catégorie, description, date)
- [ ] Mise à jour HomeScreen : affiche total dépensé + restant global
- [ ] categoryService.js + expenseService.js
- [ ] Modal pour sélectionner une catégorie avec ses détails

**Test indépendant** :
```
✅ Créer une catégorie
✅ Ajouter une dépense
✅ Voir la progression de la catégorie
✅ Budget global se met à jour
✅ Supprimer une dépense
✅ Les données persistent
```

---

### **PHASE 4 — Questionnaire IA & Allocation budget** (4-5h)
**Objectif** : L'IA propose une allocation budgétaire personnalisée.

**Livrables backend** :
- [ ] Entité `UserProfile` (id, userId, revenuMensuel, situation, priorites, nombrePersonnesCharge, etc.)
- [ ] Migration SQL
- [ ] Endpoint `POST /api/ai/questionnaire` → retourne les questions à poser
- [ ] Endpoint `POST /api/ai/propose-budget` → analyse les réponses + propose allocation
- [ ] Logic : calcul d'allocation basée sur percentages (Alimentation 30%, Transport 15%, etc.)
- [ ] Endpoint `POST /api/ai/save-allocation` → sauvegarde l'allocation

**Livrables frontend** :
- [ ] QuestionnaireScreen : affiche questions une par une (chat-like)
- [ ] Stockage réponses temporaire (context ou state)
- [ ] PropositionScreen : affiche les catégories proposées + montants
- [ ] Boutons pour éditer chaque proposition
- [ ] Validation et sauvegarde

**Test indépendant** :
```
✅ Répondre au questionnaire
✅ Voir les propositions d'allocation
✅ Modifier les montants
✅ Les catégories sont créées avec les montants alloués
✅ Le budget global reflète les allocations
```

---

### **PHASE 5 — Paiement mobile (Orange Money / MTN)** (4-5h)
**Objectif** : Effectuer des paiements et enregistrer les dépenses auto.

**Livrables backend** :
- [ ] Entité `Payment` (id, userId, categoryId, montant, methode, statut, codeReference, date)
- [ ] Migration SQL
- [ ] PaymentController :
  - `POST /api/payments/initiate` → initier paiement (OM/MTN)
  - `POST /api/payments/confirm` → confirmer avec PIN
  - `GET /api/payments/history` → historique
- [ ] Intégration mock Orange Money API (pour dev local)
- [ ] Auto-création d'une Expense quand paiement confirmé

**Livrables frontend** :
- [ ] PayScreen : choix zone + moyen de paiement
- [ ] Formulaire : montant + sélection marchand
- [ ] ConfirmationScreen : récap + PIN input (4 chiffres)
- [ ] SuccessScreen : confirmation + reçu
- [ ] Mise à jour budget auto après paiement
- [ ] paymentService.js

**Test indépendant** :
```
✅ Sélectionner une catégorie
✅ Entrer montant + sélectionner moyen de paiement
✅ Confirmer avec PIN
✅ Dépense créée automatiquement
✅ Budget de la catégorie mis à jour
✅ Historique des paiements visible
```

---

### **PHASE 6 — Scanner & Reconnaissance (QR/Code marchand)** (3-4h)
**Objectif** : Filmer un code ou un numéro marchand et pré-remplir le paiement.

**Livrables backend** :
- [ ] Endpoint `POST /api/qr/decode` → parse un QR code ou numéro merchant
- [ ] Retour : `{ merchant, merchantCode, suggestedAmount }`
- [ ] Format attendu : QR standard ou numéro simple (6-12 chiffres)

**Livrables frontend** :
- [ ] Intégrer `expo-camera` + `expo-barcode-scanner`
- [ ] ScannerScreen : interface caméra avec cadre de scan
- [ ] Parse QR code ou code marchand manuel
- [ ] Pré-remplissage du formulaire de paiement
- [ ] Fallback : saisie manuelle du numéro
- [ ] scannerService.js

**Test indépendant** :
```
✅ Ouvrir la caméra
✅ Scanner un code QR
✅ Extraire les données
✅ Pré-remplir le formulaire de paiement
✅ Continuer le flow de paiement normalement
```

---

### **PHASE 7 — Rappel fin de journée & Saisie cash** (2-3h)
**Objectif** : Rappeler à l'utilisateur d'enregistrer ses dépenses cash.

**Livrables backend** :
- [ ] Endpoint `GET /api/notifications/daily-reminder` → retourne rappel du jour
- [ ] Logic : une fois par jour (18h30 local)

**Livrables frontend** :
- [ ] Intégrer `expo-notifications`
- [ ] Notification push locale (18h30 chaque jour)
- [ ] CashReminderModal : formulaire pour saisir dépenses cash du jour
- [ ] Option : ajouter plusieurs dépenses
- [ ] CashExpenseScreen : écran dédié pour saisir cash en détail
- [ ] Mise à jour budget après validation

**Test indépendant** :
```
✅ Notification push à 18h30
✅ Ouvrir le modal de rappel
✅ Ajouter des dépenses cash
✅ Budget se met à jour
✅ Historique enregistre les dépenses
```

---

### **PHASE 8 — Tontines / Cotisations** (5-6h)
**Objectif** : Créer et gérer des cotisations collectives.

**Livrables backend** :
- [ ] Entité `Tontine` (id, creatorId, nom, montantParTour, frequence, statut, dateCreation)
- [ ] Entité `TontineMember` (tontineId, userId, ordre, aRecu, dateAdhesion)
- [ ] Entité `TontinePayment` (id, tontineId, payerId, montant, date, statut)
- [ ] Migrations SQL
- [ ] TontineController :
  - `POST /api/tontines` → créer
  - `POST /api/tontines/{id}/join` → rejoindre
  - `POST /api/tontines/{id}/pay` → enregistrer paiement
  - `GET /api/tontines/my` → mes tontines
  - `GET /api/tontines/{id}` → détails + membres + paiements
  - `PUT /api/tontines/{id}/tour` → avancer au tour suivant
- [ ] Logic : calcul du tour actuel, vérification paiements reçus

**Livrables frontend** :
- [ ] TontinesScreen : liste de mes tontines
- [ ] CreateTontineScreen : formulaire (nom, montant, fréquence, ajouter membres par email)
- [ ] TontineDetailScreen : détails, membres, historique paiements
- [ ] Bouton "Payer maintenant" → PayScreen pré-rempli
- [ ] Affichage du tour en cours + qui doit payer
- [ ] tontineService.js

**Test indépendant** :
```
✅ Créer une tontine
✅ Inviter des membres (par email)
✅ Membres reçoivent notification
✅ Accepter invitation
✅ Enregistrer un paiement
✅ Avancer au tour suivant automatiquement
✅ Historique completo
```

---

### **PHASE 9 — Géolocalisation & Bons plans** (3-4h)
**Objectif** : Proposer des bons plans près de l'utilisateur.

**Livrables backend** :
- [ ] Entité `Deal` (id, titre, description, categorie, latitude, longitude, rayon, expiration, reduction)
- [ ] Migration SQL
- [ ] DealController :
  - `GET /api/deals/nearby?lat=&lng=&rayon=500` → bons plans à proximité
  - `POST /api/deals` → créer (admin only)
  - `GET /api/deals/{id}` → détails
- [ ] Logic : calcul distance (haversine formula)

**Livrables frontend** :
- [ ] Intégrer `expo-location`
- [ ] DealsScreen : liste + carte (MapView)
- [ ] Géolocalisation utilisateur (demander permission)
- [ ] Affichage des deals en fonction de la position
- [ ] Notification si deal détecté à proximité
- [ ] Filtre par catégorie
- [ ] dealService.js

**Test indépendant** :
```
✅ Demander permission géolocalisation
✅ Récupérer position utilisateur
✅ Afficher deals à proximité
✅ Notification si deal détecté
✅ Ouvrir deal detail
```

---

### **PHASE 10 — Dashboard & Statistiques** (3-4h)
**Objectif** : Visualiser les statistiques et le bilan mensuel.

**Livrables backend** :
- [ ] Endpoint `GET /api/stats/monthly` → résumé du mois
- [ ] Endpoint `GET /api/stats/by-category` → dépenses par catégorie
- [ ] Endpoint `GET /api/stats/comparison` → ce mois vs mois précédent
- [ ] Endpoint `GET /api/stats/savings` → objectif épargne vs réalisé

**Livrables frontend** :
- [ ] BilanMensuelScreen : graphiques + résumé
- [ ] Donut chart : répartition par catégorie
- [ ] Bar chart : comparaison mois précédent
- [ ] Points forts / points à améliorer
- [ ] Export PDF du bilan
- [ ] statsService.js

**Test indépendant** :
```
✅ Voir le résumé du mois
✅ Voir répartition par catégorie (graphique)
✅ Comparaison avec mois précédent
✅ Points forts/faibles identifiés
✅ Export PDF fonctionne
```

---

### **PHASE 11 — Profil & Paramètres** (2-3h)
**Objectif** : Gérer le profil et les préférences.

**Livrables backend** :
- [ ] Entité `UserPreferences` (id, userId, theme, notifications, langue)
- [ ] Migration SQL
- [ ] UserController :
  - `GET /api/users/{id}` → profil
  - `PUT /api/users/{id}` → modifier profil
  - `PUT /api/users/{id}/preferences` → modifier préférences
  - `DELETE /api/users/{id}` → supprimer compte
  - `POST /api/users/change-password` → changer mot de passe

**Livrables frontend** :
- [ ] ProfileScreen : infos utilisateur + stats globales
- [ ] EditProfileModal : modifier nom, email, photo
- [ ] SettingsScreen : notifications, mode sombre, langue
- [ ] ChangePasswordModal
- [ ] DeleteAccountWarning
- [ ] userService.js

**Test indépendant** :
```
✅ Voir profil
✅ Modifier infos
✅ Changer mode sombre/clair
✅ Changer mot de passe
✅ Désactiver notifications
```

---

### **PHASE 12 — Notifications & Alertes** (2-3h)
**Objectif** : Système complet de notifications.

**Livrables backend** :
- [ ] Entité `Notification` (id, userId, type, message, lue, date)
- [ ] Migration SQL
- [ ] NotificationController :
  - `GET /api/notifications` → liste
  - `PUT /api/notifications/{id}/read` → marquer comme lu
  - `DELETE /api/notifications/{id}`
- [ ] Events : paiement, dépassement budget, rappel tontine, etc.

**Livrables frontend** :
- [ ] NotificationsScreen : centre de notifications
- [ ] Push notifications (expo-notifications)
- [ ] Badge sur bell icon si non-lues
- [ ] Navigation depuis notification vers écran pertinent
- [ ] notificationService.js

**Test indépendant** :
```
✅ Recevoir notifications
✅ Voir liste des notifications
✅ Badge compte les non-lues
✅ Cliquer pour naviguer
✅ Marquer comme lu
```

---

## 🔄 Workflow de développement

### Pour chaque phase :

1. **Claude Code crée le backend** (entités + contrôleurs + services)
2. **Tests avec Postman/Insomnia** : chaque endpoint fonctionne
3. **Claude Code crée le frontend** (screens + services + context)
4. **Test mobile** : tout fonctionne sur Expo
5. **Validation** : données persistent, API répond correctement
6. **Merge** : intégration dans la branche principale

### Commandes de test

```bash
# Backend
cd backend
mvn clean install
mvn spring-boot:run

# Frontend
cd mobile
expo start
# Scanner QR code dans l'app Expo

# Postman
Import API Postman collection
Test tous les endpoints

# Mobile
Ajouter un élément
Vérifier dans l'app
Rechargement de l'app
Vérifier persistence
```

---

## 📊 État du projet

| Phase | Nom | Statut | % | Durée estimée |
|-------|-----|--------|---|---|
| 0 | Setup | ✅ DONE | 100% | 1-2h |
| 1 | Auth | ✅ DONE | 100% | 3-4h |
| 2 | Budget | ✅ DONE | 100% | 2-3h |
| 3 | Dépenses | ⏳ TODO | 0% | 3-4h |
| 4 | IA & Allocation | ⏳ TODO | 0% | 4-5h |
| 5 | Paiement Mobile | ✅ DONE | 100% | 4-5h |
| 6 | Scanner | ✅ DONE | 100% | 3-4h |
| 7 | Rappel Cash | ⏳ TODO | 0% | 2-3h |
| 8 | Tontines | ✅ DONE | 100% | 5-6h |
| 9 | Géolocalisation | ✅ DONE | 100% | 3-4h |
| 10 | Stats/Dashboard | ✅ DONE | 100% | 3-4h |
| 11 | Profil | ✅ DONE | 100% | 2-3h |
| 12 | Notifications | ⏳ TODO | 0% | 2-3h |

**Durée totale estimée** : 38-49 heures de développement  
**Progression** : 9 / 13 phases — ~69%

---

## 🎯 Checklist finale

- [ ] Toutes les phases complétées
- [ ] Tous les tests passent
- [ ] App testée sur Expo (iOS simulator ou Android)
- [ ] Backend déployable (Docker)
- [ ] Base de données initialisée
- [ ] Documentation API complète
- [ ] README avec instructions de déploiement
- [ ] Designs Hi-Fi implémentés

---

## 📞 Notes importantes

- **Chaque phase est indépendante** → pas de dépendance d'ordre
- **Tests continus** → valider chaque phase avant la suivante
- **Données persistantes** → vérifier AsyncStorage + API à chaque modification
- **Git branches** → une branche par phase
- **Documentation** → READMEs à jour après chaque phase

