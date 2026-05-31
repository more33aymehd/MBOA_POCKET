# Mboapocket 💚

Application mobile financière tout-en-un pour le marché camerounais.
Gestion de budget IA · Paiements mobiles · Tontines · Bons plans géolocalisés

---

## Prérequis

| Outil | Version | Téléchargement |
|-------|---------|----------------|
| Java | 17+ | https://adoptium.net |
| Maven | 3.8+ | inclus dans le repo (`./mvnw`) |
| Node.js | 18+ | https://nodejs.org |
| MySQL | 8.0+ | https://dev.mysql.com ou Docker |
| Expo Go | dernière | App Store / Play Store |

---

## Installation en 3 étapes

### 1. Cloner le projet

```bash
git clone https://github.com/more33aymehd/MBOA_POCKET.git
cd MBOA_POCKET
```

### 2. Backend (Spring Boot)

```bash
cd mboapocket_app
```

Copier et configurer les variables d'environnement :

```bash
cp src/main/resources/application.properties.example \
   src/main/resources/application.properties
```

Ouvrir `application.properties` et remplir :

```properties
spring.datasource.password=TON_MOT_DE_PASSE_MYSQL
jwt.secret=UNE_CLE_LONGUE_ET_ALEATOIRE
groq.api.key=gsk_...        # https://console.groq.com/keys
campay.token=...             # https://demo.campay.net (sandbox gratuit)
campay.app-id=...
```

Lancer le backend :

```bash
./mvnw spring-boot:run
# Windows : mvnw.cmd spring-boot:run
```

Vérifier que ça tourne :

```bash
curl http://localhost:8080/api/health
# → {"status":"OK"}
```

### 3. Frontend (React Native Expo)

```bash
cd mobile
npm install
```

Ouvrir `src/services/api.js` et remplacer l'IP par celle affichée dans Metro :

```js
const BASE_URL = 'http://TON_IP_LOCALE:8080/api';
// Exemple : 'http://192.168.1.42:8080/api'
```

> Ton IP locale s'affiche dans le terminal quand tu lances `expo start`
> sous la forme `exp://192.168.x.x:8081`

Lancer l'app :

```bash
npx expo start
```

Scanner le QR code avec **Expo Go** (iOS ou Android).

---

## Base de données

Le schéma est créé automatiquement au démarrage via JPA (`ddl-auto=update`).

Si tu pars de zéro, crée juste la base :

```sql
CREATE DATABASE mboapocket_dev;
```

**Avec Docker (alternative rapide) :**

```bash
docker run --name mboapocket-mysql \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=mboapocket_dev \
  -p 3306:3306 -d mysql:8.0
```

Dans ce cas, `application.properties` :
```properties
spring.datasource.username=root
spring.datasource.password=root
```

---

## Structure du projet

```
MBOA_POCKET/
├── mboapocket_app/          # Backend Spring Boot 4
│   ├── src/main/java/       # Code Java (auth, budget, tontines...)
│   ├── src/main/resources/
│   │   ├── application.properties.example   ← template à copier
│   │   └── application.properties           ← ton fichier local (ignoré par git)
│   └── pom.xml
│
├── mobile/                  # Frontend React Native Expo
│   ├── src/
│   │   ├── screens/         # 26 écrans
│   │   ├── services/        # Appels API
│   │   ├── navigation/      # React Navigation
│   │   └── context/         # Auth, AI flow
│   ├── app.json
│   └── package.json
│
├── Mboa_app_figma_design    # Maquettes Pencil.dev (26 écrans)
├── CLAUDE.md                # Design system complet
└── TECHNICAL.md             # Roadmap phases 0→12
```

---

## Fonctionnalités

| Phase | Fonctionnalité | Statut |
|-------|---------------|--------|
| 0 | Setup & navigation | ✅ |
| 1 | Authentification JWT | ✅ |
| 2 | Budget mensuel | ✅ |
| 3 | Catégories & dépenses | ✅ |
| 4 | Questionnaire IA (Groq) | ✅ |
| 5 | Paiement mobile (CamPay) | ✅ |
| 6 | Scanner QR marchand | ✅ |
| 7 | Rappel cash 18h30 | ✅ |
| 8 | Tontines | ✅ |
| 9 | Bons plans géolocalisés | ✅ |
| 10 | Stats & bilan mensuel | ✅ |
| 11 | Profil & paramètres | ✅ |
| 12 | Notifications | ✅ |

---

## Dépannage

**`Connection refused` sur l'app mobile**
→ Vérifie que ton téléphone et ton PC sont sur le même réseau Wi-Fi
→ Vérifie l'IP dans `mobile/src/services/api.js`

**`Access denied` MySQL**
→ Vérifie `spring.datasource.username` et `password` dans `application.properties`

**`jwt.secret` trop court**
→ La clé JWT doit faire au moins 256 bits. Génère-en une avec :
```bash
openssl rand -base64 32
```

**L'app ne reçoit pas de notifications**
→ Les notifications locales fonctionnent sur vrai téléphone uniquement (pas simulateur)
→ Accepte les permissions quand l'app les demande au premier lancement
