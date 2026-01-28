# 📱 Checklist de Test Multi-Appareils
## HorizonTech MBA Website - Tests iOS/iPadOS/macOS

---

## 🎯 Objectif
Vérifier que toutes les fonctionnalités du site fonctionnent correctement sur iPhone, iPad et Mac.

---

## 📱 TESTS IPHONE (iOS)

### ✅ Navigation de Base
- [ ] **Page d'accueil** charge correctement
- [ ] **Scroll** fluide sur toute la page
- [ ] **Header sticky** reste visible en scrollant
- [ ] **Logo** visible et correct
- [ ] **Menu mobile** (hamburger) s'ouvre et se ferme
- [ ] **Liens de navigation** fonctionnent (About, Services, Contact, FAQ)

### 🌍 Changement de Langue
- [ ] **Bouton de langue** (FR/EN) est visible
- [ ] **Clic sur le bouton** ouvre le dropdown
- [ ] **Sélection Français** fonctionne (page se recharge en FR)
- [ ] **Sélection English** fonctionne (page se recharge en EN)
- [ ] **Contenu change** correctement après changement de langue
- [ ] **URL change** correctement (/fr/ ou /en/)

### 📧 Formulaire de Contact
- [ ] **Formulaire visible** sur page Contact
- [ ] **Champs de saisie** fonctionnent au toucher
- [ ] **Clavier iOS** apparaît correctement
- [ ] **Email field** affiche clavier email iOS
- [ ] **Validation** fonctionne (champs requis)
- [ ] **Bouton Submit** réactif au toucher
- [ ] **Message de confirmation** Formspree apparaît après envoi

### 📅 Système de Réservation
- [ ] **Bouton "Book a Meeting"** visible
- [ ] **Clic ouvre** Microsoft Bookings
- [ ] **Page Bookings** s'ouvre correctement dans Safari
- [ ] **Interface Bookings** responsive sur iPhone
- [ ] **Possibilité de réserver** un créneau

### 🎨 Design & UX
- [ ] **Images** chargent correctement
- [ ] **Texte lisible** (taille appropriée)
- [ ] **Boutons** assez grands pour le toucher (min 44x44px)
- [ ] **Espacement** correct entre éléments tactiles
- [ ] **Couleurs** cohérentes avec la charte
- [ ] **Animations** fluides (pas de lag)

### 🔒 Cookies & Confidentialité
- [ ] **Banner cookies** apparaît au premier chargement
- [ ] **Boutons Accept/Reject** fonctionnent
- [ ] **Lien "Politique de cookies"** fonctionne
- [ ] **Préférences sauvegardées** (pas de réaffichage après reload)

### ⚡ Performance
- [ ] **Temps de chargement** < 3 secondes
- [ ] **Pas de lag** lors du scroll
- [ ] **Transitions** fluides
- [ ] **Pas d'erreurs** en console (vérifier avec Remote Debugging)

### 📞 Liens de Contact
- [ ] **Numéro de téléphone** cliquable (ouvre Phone app)
- [ ] **Email** cliquable (ouvre Mail app)
- [ ] **Lien externe** (si présent) ouvre Safari

---

## 📱 TESTS IPAD (iPadOS)

### ✅ Layout & Responsive
- [ ] **Mode Portrait** : Layout adapté
- [ ] **Mode Paysage** : Layout adapté
- [ ] **Navigation** ne se transforme PAS en hamburger (tablette)
- [ ] **Header** proportions correctes
- [ ] **Images** bien dimensionnées
- [ ] **Texte** taille appropriée (ni trop grand, ni trop petit)

### 🖱️ Interactions Tactiles & Souris
- [ ] **Touch** fonctionne (si iPad avec écran tactile)
- [ ] **Trackpad/Souris** fonctionne (si Magic Keyboard/Trackpad)
- [ ] **Hover effects** fonctionnent avec souris
- [ ] **Boutons** réactifs au toucher ET au clic souris

### 🌍 Split View & Multitasking
- [ ] **Split View** (2 apps côte à côte) : site reste utilisable
- [ ] **Slide Over** : site s'adapte à la largeur réduite
- [ ] **Picture-in-Picture** : pas de conflit avec vidéos (si applicable)

### 🔄 Rotation & Adaptation
- [ ] **Rotation Portrait → Paysage** : smooth, pas de casse
- [ ] **Rotation Paysage → Portrait** : smooth, pas de casse
- [ ] **Contenu** se réorganise correctement

---

## 💻 TESTS MAC (macOS)

### ✅ Navigation Desktop
- [ ] **Menu horizontal** visible et fonctionnel
- [ ] **Hover effects** sur liens et boutons
- [ ] **Cursor** change au survol (pointer sur boutons)
- [ ] **Dropdown langue** fonctionne au clic ET au hover
- [ ] **Toutes les pages** accessibles via menu

### 🖱️ Interactions Souris & Trackpad
- [ ] **Clic gauche** fonctionne partout
- [ ] **Scroll souris** fluide
- [ ] **Scroll trackpad** avec inertie naturelle macOS
- [ ] **Pinch to zoom** sur trackpad (si activé)
- [ ] **Gestes trackpad** (back/forward) fonctionnent

### ⌨️ Accessibilité Clavier
- [ ] **Tab** navigue entre liens et boutons
- [ ] **Enter** active boutons et liens
- [ ] **Espace** scroll la page
- [ ] **Focus visible** sur éléments (outline bleu)

### 🌐 Navigateurs
- [ ] **Safari** : tout fonctionne
- [ ] **Chrome** : tout fonctionne
- [ ] **Firefox** : tout fonctionne
- [ ] **Edge** : tout fonctionne

### 🖥️ Résolutions
- [ ] **13" MacBook** (2560×1600) : layout correct
- [ ] **14" MacBook Pro** (3024×1964) : layout correct
- [ ] **16" MacBook Pro** (3456×2234) : layout correct
- [ ] **iMac 24"** (4480×2520) : layout correct
- [ ] **Studio Display** (5120×2880) : layout correct

### 📊 Analytics & Tracking
- [ ] **Google Analytics** (GA4) fonctionne
- [ ] **Google Tag Manager** charge correctement
- [ ] **Événements** trackés (page views, clics)

---

## 🔍 TESTS CROSS-DEVICE

### 🔄 Continuité entre Appareils
- [ ] **Handoff** : ouvrir page sur iPhone, continuer sur Mac
- [ ] **iCloud Tabs** : page visible dans liste des onglets
- [ ] **AirDrop** : partage d'URL fonctionne

### 📱→💻 Responsive Breakpoints
- [ ] **iPhone SE** (375px) : layout mobile compact
- [ ] **iPhone 14 Pro** (393px) : layout mobile standard
- [ ] **iPhone 14 Pro Max** (430px) : layout mobile large
- [ ] **iPad Mini** (744px) : layout tablette portrait
- [ ] **iPad Air** (820px) : layout tablette portrait
- [ ] **iPad Pro 11"** (834px) : layout tablette
- [ ] **iPad Pro 12.9"** (1024px) : layout tablette/desktop
- [ ] **MacBook** (1280px+) : layout desktop
- [ ] **iMac/Studio Display** (1920px+) : layout desktop large

---

## 🛠️ OUTILS DE TEST

### 📱 Sur iPhone/iPad (Tests Réels)
1. Ouvrir **https://www.horizontechmba.com/**
2. Tester en **Safari** (navigateur par défaut iOS)
3. Tester en **Chrome iOS** (moteur WebKit obligatoire sur iOS)
4. Vérifier en **mode privé** (pas de cache)

### 💻 Sur Mac (Tests Réels)
1. Ouvrir dans **Safari, Chrome, Firefox**
2. Tester avec **responsive design mode** (Cmd+Option+I → Device toolbar)
3. Utiliser **BrowserStack** ou **LambdaTest** pour tests cross-browser

### 🔧 Remote Debugging (iPhone → Mac)
1. iPhone : Réglages > Safari > Avancé > Inspecteur Web (ON)
2. Mac : Safari > Développement > [Nom iPhone] > [Page]
3. Voir console JavaScript, erreurs réseau, performance

### 📊 Lighthouse (Performance)
```bash
# Sur Mac, dans Chrome DevTools
1. Ouvrir DevTools (Cmd+Option+I)
2. Aller dans l'onglet "Lighthouse"
3. Sélectionner "Mobile" ou "Desktop"
4. Lancer l'audit
5. Vérifier scores : Performance, Accessibility, Best Practices, SEO
```

### 🌐 Test Cross-Browser Automatisé
```bash
# Utiliser BrowserStack ou équivalent
- Safari 17+ sur iPhone 15
- Safari 17+ sur iPad Pro
- Safari 17+ sur macOS Sonoma
- Chrome sur macOS
```

---

## 🐛 BUGS CONNUS & SOLUTIONS

### iPhone
- ❌ **Problème** : Changement de langue ne marche pas
- ✅ **Solution** : Ajout support `touchstart` event (FIXED)

### iPad
- ✅ Aucun bug connu actuellement

### Mac
- ✅ Aucun bug connu actuellement

---

## 📝 RAPPORT DE TEST

### Template de Rapport
```
Date: [DATE]
Testeur: [NOM]
Appareil: [iPhone 15 Pro / iPad Air / MacBook Pro M3]
OS: [iOS 17.3 / iPadOS 17.3 / macOS 14.3]
Navigateur: [Safari 17.3 / Chrome 120]

✅ Tests Réussis: [X/Y]
❌ Tests Échoués: [X/Y]
⚠️  Bugs Trouvés: [Liste]

Détails:
- [Description du test]
- [Résultat attendu vs résultat obtenu]
- [Captures d'écran si applicable]
```

---

## 🚀 CHECKLIST POST-DÉPLOIEMENT

Après chaque déploiement sur GitHub Pages :

1. ✅ Attendre 2-3 minutes pour propagation
2. ✅ Vider cache navigateur (Cmd+Shift+R)
3. ✅ Tester sur au moins 1 iPhone
4. ✅ Tester sur au moins 1 Mac
5. ✅ Vérifier formulaire de contact
6. ✅ Vérifier changement de langue
7. ✅ Vérifier booking Microsoft
8. ✅ Lancer `npm run test:post-deploy`

---

## 📊 MÉTRIQUES DE SUCCÈS

### Performance Targets
- ✅ **Time to Interactive** : < 3s sur 4G
- ✅ **First Contentful Paint** : < 1.5s
- ✅ **Largest Contentful Paint** : < 2.5s
- ✅ **Cumulative Layout Shift** : < 0.1
- ✅ **Lighthouse Score** : > 90/100

### Fonctionnalité
- ✅ **100% des fonctionnalités** opérationnelles sur iOS
- ✅ **100% des fonctionnalités** opérationnelles sur iPadOS
- ✅ **100% des fonctionnalités** opérationnelles sur macOS
- ✅ **0 erreur JavaScript** en console
- ✅ **0 erreur réseau** (404, 500)

---

## 🔗 LIENS UTILES

- **Site Production** : https://www.horizontechmba.com/
- **GitHub Repository** : https://github.com/MontassarBA/horizontechmba.github.io
- **GitHub Actions** : https://github.com/MontassarBA/horizontechmba.github.io/actions
- **Test Post-Deploy** : `npm run test:post-deploy`
- **Formspree Dashboard** : https://formspree.io/forms/mzdgpgbq
- **Microsoft Bookings** : https://outlook.office365.com/book/horizontech

---

**Version** : 1.0  
**Dernière mise à jour** : 28 janvier 2026  
**Maintenu par** : HorizonTech MBA Team
