# Mboapocket

Projet Mboapocket — application mobile financière avec backend Spring Boot et base MySQL.

## Structure du projet

- `backend/` : Spring Boot 3 backend
- `mobile/` : React Native Expo frontend
- `CLAUDE.md` : design system
- `TECHNICAL.md` : roadmap technique

## Setup

### Backend

1. Installer Maven et Java 17.
2. Lancer MySQL local ou Docker.
3. Depuis `backend/` :
   ```bash
   mvn spring-boot:run
   ```
4. Vérifier l'API :
   ```bash
   curl http://localhost:8080/api/health
   ```
   → `{ "status": "OK" }`

### Mobile

1. Installer Node.js et Expo CLI (`npm install -g expo-cli`).
2. Depuis `mobile/` :
   ```bash
   npm install
   expo start
   ```
3. Ouvrir dans Expo Go ou le navigateur.

### Base de données

#### Option Docker

```bash
docker run --name mboapocket-mysql -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=mboapocket_dev -p 3306:3306 -d mysql:8.0
```

#### Option SQL

Exécuter le script `database-init.sql` ou ces commandes :

```sql
CREATE DATABASE mboapocket_dev;
USE mboapocket_dev;
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Commandes de test

- Backend : `cd backend && mvn spring-boot:run`
- Mobile : `cd mobile && npm install && expo start`
- Base MySQL : `docker ps` ou exécuter le script SQL

## Notes

- Le backend contient pour l'instant uniquement le endpoint `GET /api/health`.
- Le mobile contient un splash screen et une navigation de base.
- La configuration de l'API est fournie via `mobile/.env`.
