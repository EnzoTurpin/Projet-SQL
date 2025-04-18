# CocktailRecipe

Application web permettant de découvrir, créer et partager des recettes de cocktails. Le projet est composé d'une interface utilisateur Angular et d'une API Laravel.

## Table des matières

- [Technologies utilisées](#technologies-utilisées)
- [Structure du projet](#structure-du-projet)
- [Installation](#installation)
- [Configuration](#configuration)
- [Utilisation](#utilisation)
- [Fonctionnalités](#fonctionnalités)
- [API](#api)
- [Authentification](#authentification)

## Technologies utilisées

### Frontend

- Angular 17
- Tailwind CSS
- RxJS
- Angular Router

### Backend

- Laravel 10
- Sanctum (Authentication)
- MongoDB

## Structure du projet

Le projet est divisé en deux parties principales :

### Frontend (angular-app)

```
angular-app/
├── src/
│   ├── app/
│   │   ├── components/         # Composants réutilisables
│   │   ├── pages/              # Pages de l'application
│   │   ├── services/           # Services pour la logique métier
│   │   ├── models/             # Interfaces et classes TypeScript
│   │   ├── interceptors/       # Intercepteurs HTTP
│   │   └── interfaces/         # Interfaces TypeScript
│   ├── assets/                 # Images, icônes, etc.
│   └── environments/           # Configurations d'environnement
└── ...
```

### Backend (laravel-app)

```
laravel-app/
├── app/
│   ├── Http/
│   │   ├── Controllers/        # Contrôleurs de l'API
│   │   └── Middleware/         # Middleware personnalisés
│   ├── Models/                 # Modèles de données
│   └── ...
├── routes/
│   └── api.php                 # Définition des routes de l'API
└── ...
```

## Installation

### Prérequis

- Node.js (v16+)
- PHP 8.1+
- Composer
- MongoDB
- (Optionnel) Docker et Docker Compose

### Installation du frontend

```bash
# Accéder au dossier du frontend
cd angular-app

# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev
```

### Installation du backend

```bash
# Accéder au dossier du backend
cd laravel-app

# Installer les dépendances
composer install

# Copier le fichier d'environnement
cp .env.example .env

# Générer la clé d'application
php artisan key:generate

# Démarrer le serveur de développement
php artisan serve
```

## Configuration

### Configuration du frontend (angular-app)

Modifier `src/environments/environment.ts` pour configurer l'URL de l'API :

```typescript
export const environment = {
  production: false,
  apiUrl: "http://localhost:8000/api",
};
```

### Configuration du backend (laravel-app)

Modifier le fichier `.env` pour configurer la connexion à la base de données MongoDB et les paramètres CORS :

```
DB_CONNECTION=mongodb
DB_HOST=127.0.0.1
DB_PORT=27017
DB_DATABASE=cocktail_recipe
DB_USERNAME=
DB_PASSWORD=

CORS_ALLOWED_ORIGINS=http://localhost:4200
SANCTUM_STATEFUL_DOMAINS=localhost:4200
SESSION_DOMAIN=localhost
```

## Utilisation

### Développement

- Frontend : http://localhost:4200
- Backend : http://localhost:8000

## Fonctionnalités

- **Exploration de cocktails** : Découvrez une vaste collection de recettes de cocktails.
- **Recherche avancée** : Recherchez des cocktails par nom, ingrédient, catégorie, etc.
- **Création de compte** : Inscrivez-vous pour créer et partager vos propres recettes.
- **Responsive design** : Interface adaptée à tous les appareils (ordinateurs, tablettes, smartphones).

## API

L'API REST fournit des endpoints pour :

### Recettes

- `GET /api/recipes` : Liste toutes les recettes.
- `GET /api/recipes/{id}` : Détails d'une recette spécifique.
- `POST /api/recipes` : Crée une nouvelle recette (authentification requise).
- `PUT /api/recipes/{id}` : Met à jour une recette (authentification requise).
- `DELETE /api/recipes/{id}` : Supprime une recette (authentification requise).

### Ingrédients

- `GET /api/ingredients` : Liste tous les ingrédients.
- `GET /api/ingredients/{id}` : Détails d'un ingrédient spécifique.

## Authentification

L'application utilise Laravel Sanctum pour l'authentification par cookies. Les points d'entrée sont :

- `POST /api/login` : Connexion d'un utilisateur.
- `POST /api/register` : Inscription d'un nouvel utilisateur.
- `POST /api/logout` : Déconnexion (authentification requise).
- `GET /api/me` : Récupération des informations de l'utilisateur connecté.

L'authentification est gérée via des cookies de session et CSRF, ce qui nécessite que les requêtes incluent les en-têtes appropriés.

---

## Contributeurs

- [Enzo Turpin](https://github.com/EnzoTurpin)
- [Daryl Matro](Darylmatro)
