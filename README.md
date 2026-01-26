# HorizontechMBA Website

Site web bilingue (EN/FR) pour HorizontechMBA - Consultation en ingénierie et solutions technologiques innovantes.

## 🚀 Technologies

- **Framework**: [Astro](https://astro.build/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Hébergement**: GitHub Pages
- **Domaine**: horizontechmba.com

## 📁 Structure du projet

```
/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   ├── LanguagePicker.astro
│   │   └── ...
│   ├── i18n/
│   │   ├── ui.ts          # Traductions
│   │   └── utils.ts       # Utilitaires i18n
│   ├── layouts/
│   │   └── Layout.astro
│   └── pages/
│       ├── index.astro    # Redirection vers /en/
│       ├── en/            # Pages anglaises
│       └── fr/            # Pages françaises
├── astro.config.mjs
├── tailwind.config.mjs
└── package.json
```

## 🛠️ Commandes

| Commande | Action |
|----------|--------|
| `npm install` | Installer les dépendances |
| `npm run dev` | Démarrer le serveur de développement |
| `npm run build` | Construire le site pour la production |
| `npm run preview` | Prévisualiser la version de production |

## 🌐 Configuration du domaine (GoDaddy)

Pour configurer le domaine horizontechmba.com :

### Enregistrements A (apex domain)
| Type | Name | Value |
|------|------|-------|
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |

### Enregistrement CNAME (www)
| Type | Name | Value |
|------|------|-------|
| CNAME | www | MontassarBA.github.io |

## 📧 Configuration du formulaire de contact

Le formulaire de contact utilise [Formspree](https://formspree.io/). Pour l'activer :

1. Créer un compte sur Formspree
2. Créer un nouveau formulaire
3. Remplacer `YOUR_FORM_ID` dans les fichiers contact.astro par votre ID de formulaire

## 🚀 Déploiement

Le site se déploie automatiquement via GitHub Actions lors de chaque push sur la branche `main`.

## 📝 Licence

© 2026 HorizontechMBA. Tous droits réservés.
