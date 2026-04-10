# Éclat Auto — Site Web

Service de détailing automobile professionnel à domicile au Québec.

## Stack technique

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** (thème luxe noir/or)
- **Prisma + SQLite** (base de données locale)
- **NextAuth.js** (authentification admin)
- **next-intl** (bilingue FR/EN)

## Démarrage rapide

### 1. Cloner et installer les dépendances

```bash
cd eclat-auto-next
npm install
```

### 2. Configurer les variables d'environnement

```bash
cp .env.example .env
```

Générez un secret sécurisé pour NextAuth :

```bash
openssl rand -base64 32
```

Collez le résultat dans `.env` :

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="votre-secret-ici"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Initialiser la base de données

```bash
npm run db:push    # Crée les tables SQLite
npm run db:seed    # Insère les données initiales (admin + réservations exemples)
```

### 4. Lancer le serveur de développement

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) — vous serez redirigé vers `/fr`.

---

## Pages disponibles

| URL | Description |
|-----|-------------|
| `/fr` | Accueil en français |
| `/en` | Accueil en anglais |
| `/fr/reservation` | Formulaire de réservation (wizard multi-étapes) |
| `/en/reservation` | Formulaire de réservation en anglais |
| `/fr/admin` | Tableau de bord admin |
| `/fr/admin/login` | Page de connexion admin |
| `/fr/admin/reservations` | Liste complète des réservations |

---

## Identifiants admin

Après le seeding :

| Champ | Valeur |
|-------|--------|
| Email | `admin@eclatauto.ca` |
| Mot de passe | `Admin123!` |

> ⚠️ **Changez ce mot de passe en production!**

---

## Services offerts

| Service | Prix de base |
|---------|-------------|
| Lavage extérieur de base | 49 $ |
| Lavage extérieur + intérieur | 89 $ |
| Shampooing sièges et tapis | 149 $ |
| Décontamination | 199 $ |
| Protection peinture | 299 $ |

*Prix ajustés selon le type de véhicule (compact, berline, SUV, camionnette, fourgonnette)*

---

## Structure du projet

```
eclat-auto-next/
├── app/
│   ├── [locale]/              # Routes localisées (fr/en)
│   │   ├── page.tsx           # Page d'accueil
│   │   ├── reservation/       # Wizard de réservation
│   │   └── admin/             # Panel admin
│   │       ├── login/         # Page de connexion
│   │       ├── page.tsx       # Dashboard
│   │       └── reservations/  # Gestion des réservations
│   ├── api/
│   │   ├── auth/              # NextAuth endpoints
│   │   ├── reservations/      # API publique (POST)
│   │   └── admin/reservations/ # API admin (GET, PATCH, DELETE)
│   └── globals.css
├── components/
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── home/                  # Sections de la page d'accueil
│   │   ├── Hero.tsx
│   │   ├── Services.tsx
│   │   ├── WhyUs.tsx
│   │   ├── Process.tsx
│   │   └── ContactCTA.tsx
│   ├── booking/
│   │   └── BookingWizard.tsx  # Wizard 5 étapes
│   └── admin/
│       ├── AdminShell.tsx     # Layout + auth guard
│       ├── AdminNav.tsx       # Sidebar de navigation
│       ├── ReservationsTable.tsx
│       └── StatusBadge.tsx
├── lib/
│   ├── auth.ts                # Configuration NextAuth
│   ├── constants.ts           # Services, véhicules, créneaux
│   └── prisma.ts              # Client Prisma (singleton)
├── messages/
│   ├── fr.json                # Traductions françaises
│   └── en.json                # Traductions anglaises
├── prisma/
│   ├── schema.prisma          # Schéma DB
│   └── seed.ts                # Données initiales
├── i18n.ts                    # Configuration next-intl
└── middleware.ts              # Routing de langue
```

---

## Commandes utiles

```bash
npm run dev          # Serveur de développement
npm run build        # Build de production
npm run start        # Serveur de production
npm run db:push      # Synchroniser le schéma Prisma
npm run db:seed      # Insérer les données de test
npm run db:studio    # Interface graphique Prisma Studio
npm run db:reset     # Réinitialiser la DB et re-seeder
```

---

## Branding

| Couleur | Code |
|---------|------|
| Noir profond | `#0a0a0a` |
| Or | `#C9A84C` |
| Blanc cassé | `#F5F5F0` |

---

## Déploiement

Pour déployer en production (ex: Vercel) :

1. Remplacez SQLite par PostgreSQL/MySQL dans `prisma/schema.prisma`
2. Configurez les variables d'environnement sur votre hébergeur
3. Exécutez `npx prisma migrate deploy` au lieu de `db:push`
4. `npm run build && npm run start`

---

## Licence

Propriétaire — Éclat Auto © 2026
