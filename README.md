# CocktailRecipe

Application web permettant de découvrir, créer et partager des recettes de cocktails. Le projet est composé d'une interface utilisateur Angular et d'une API Laravel avec MongoDB.

## Table des matières

- [Technologies utilisées](#technologies-utilisées)
- [Structure du projet](#structure-du-projet)
- [Installation](#installation)
- [Lancement du projet](#lancement-du-projet)
- [Fonctionnalités](#fonctionnalités)
- [API](#api)
- [Authentification](#authentification)

## Technologies utilisées

### Frontend

- Angular 17
- Tailwind CSS

### Backend

- Laravel
- MongoDB
- Sanctum (Authentication)

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
│   │   ├── guards/             # Guards d'authentification
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
├── routes/                     # Définition des routes de l'API
├── config/                     # Configuration de l'application
└── ...
```

## Installation

### Prérequis

- Node.js (v16+)
- PHP 8.1+
- Composer
- MongoDB

### Cloner le projet

```bash
# Cloner le dépôt
git clone https://github.com/EnzoTurpin/Projet-SQL
cd CocktailRecipe
```

### Installation du backend

```bash
# Accéder au dossier du backend
cd laravel-app

# Installer les dépendances
composer install

# Configurer les variables d'environnement
cp .env.example .env
# Modifiez le fichier .env avec vos paramètres (URL MongoDB, etc.)

# Générer la clé d'application
php artisan key:generate
```

### Installation du frontend

```bash
# Accéder au dossier du frontend
cd angular-app

# Installer les dépendances
npm install
```

## Lancement du projet

### Démarrer le backend

```bash
# Dans le dossier laravel-app
php artisan serve
# Le serveur démarrera sur http://localhost:8000
```

### Démarrer le frontend

```bash
# Dans le dossier angular-app
ng serve
# L'application sera accessible sur http://localhost:4200
```

## Fonctionnalités

- **Exploration de cocktails** : Découvrez une vaste collection de recettes de cocktails.
- **Recherche avancée** : Recherchez des cocktails par nom, ingrédient, catégorie, etc.
- **Filtres** : Filtrez par catégorie, verre, et ingrédients.
- **Création de compte** : Inscrivez-vous pour créer et partager vos propres recettes.
- **Dashboard admin** : Interface d'administration pour gérer les recettes (réservé aux administrateurs).
- **Responsive design** : Interface adaptée à tous les appareils.

## API

L'API REST fournit des endpoints pour :

### Authentification

- `POST /api/auth/register` : Inscription d'un nouvel utilisateur.
- `POST /api/auth/login` : Connexion d'un utilisateur.
- `GET /api/auth/me` : Récupération des informations de l'utilisateur connecté.

### Recettes

- `GET /api/recipes` : Liste toutes les recettes.
- `GET /api/recipes/{id}` : Détails d'une recette spécifique.
- `POST /api/recipes` : Crée une nouvelle recette (authentification requise).
- `PUT /api/recipes/{id}` : Met à jour une recette (authentification requise).
- `DELETE /api/recipes/{id}` : Supprime une recette (authentification requise).

### Filtres

- `GET /api/categories` : Liste toutes les catégories.
- `GET /api/glasses` : Liste tous les types de verres.
- `GET /api/ingredients` : Liste tous les ingrédients.

---

## Contributeurs

- [Enzo Turpin](https://github.com/EnzoTurpin)
- [Daryl Matro](https://github.com/Darylmatro)
