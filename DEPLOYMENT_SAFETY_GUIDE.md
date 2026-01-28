# 🛡️ GUIDE COMPLET - Éviter les Déploiements Cassés

## Le Problème
Vous faites un changement → le site casse en production → vous devez corriger en urgence.

## La Solution
Exécutez ces vérifications **TOUJOURS** avant de faire `git push`.

---

## 📋 CHECKLIST PRÉ-DÉPLOIEMENT (À faire à chaque fois!)

### 1️⃣ **Avant de coder** - Préparez votre branche
```bash
git status  # Assurez-vous que tout est propre
git pull    # Récupérez les derniers changements
```

### 2️⃣ **Pendant le codage** - Testez fréquemment
```bash
npm run dev  # Lance le serveur de développement sur http://localhost:3000
# Naviguez et testez manuellement votre changement
```

### 3️⃣ **Avant le commit** - Tests de commit
```bash
npm run test:pre-commit  # Exécuté automatiquement par le pre-commit hook
```
✅ Si tous les tests passent → vous pouvez committer  
❌ Si un test échoue → réparez avant de committer

### 4️⃣ **Avant le push** - Vérification complète PRÉ-DÉPLOIEMENT
```bash
npm run pre-deploy-check
```

Ce script vérifie:
- ✅ Tous les fichiers critiques sont générés
- ✅ Le contenu HTML est correct
- ✅ Les variables JS sont injectées
- ✅ Les en-têtes de sécurité sont présents
- ✅ Tous les tests passent
- ✅ Pas d'erreurs JavaScript

**Si tout est ✅ vert** → vous pouvez faire `git push`  
**Si quelque chose est ❌** → RÉPAREZ avant de pusher!

### 5️⃣ **Après le push** - Monitorer le déploiement
```bash
gh run watch  # Regardez le GitHub Actions en direct
# Ou vérifiez sur: https://github.com/MontassarBA/horizontechmba.github.io/actions
```

---

## 🚀 PROCESSUS COMPLET (Étape par étape)

### Exemple: Vous voulez changer le texte d'un service

```bash
# 1. Préparation
git status  # Vérifier que c'est propre

# 2. Développement
npm run dev
# → Faites votre changement dans src/components/ServicesPreview.astro
# → Le navigateur recharge automatiquement
# → Vérifiez que ça marche en local

# 3. Arrêtez le dev
Ctrl+C  # Arrêtez le serveur de développement

# 4. Commit avec tests automatisés
git add .
git commit -m "feat: Update service text"
# ✅ Les tests pre-commit s'exécutent automatiquement
# Si ❌ les tests échouent → réparez et recommittez

# 5. AVANT de pusher - Vérification ultime
npm run pre-deploy-check
# ✅ Tout vert? Continuez...
# ❌ Des erreurs? Réparez d'abord!

# 6. Deployez en confiance
git push origin main

# 7. Monitorer
gh run watch  # Regardez le déploiement en direct
```

---

## ❌ ERREURS COURANTES À ÉVITER

### ❌ Erreur 1: Push directement sans tests
```bash
git commit -m "quick fix"
git push origin main  # ← DANGEREUX!
```
**✅ Correctement:**
```bash
npm run pre-deploy-check  # Vérifiez d'abord
git push origin main
```

### ❌ Erreur 2: Modifier sans tester en local
**✅ Correctement:**
```bash
npm run dev  # Démarrez le serveur
# Naviguez et testez votre changement
# PUIS committez
```

### ❌ Erreur 3: Ne pas vérifier le build
**✅ Correctement:**
```bash
npm run build  # Assurez-vous que ça compile
npm run test:all  # Exécutez tous les tests
```

### ❌ Erreur 4: Ignorer les avertissements pré-commit
**✅ Correctement:**
Si pré-commit échoue → RÉPAREZ → recommittez  
(Ne forcez pas avec `--no-verify`)

---

## 🔍 QUELQUES SCÉNARIOS

### Scénario 1: Je veux changer le titre d'une page
```bash
npm run dev
# Éditez src/pages/fr/index.astro
# Vérifiez dans http://localhost:3000/fr/
Ctrl+C
npm run pre-deploy-check  # ← CRITIQUE!
git add . && git commit -m "..."
git push origin main
```

### Scénario 2: Je veux ajouter une nouvelle section
```bash
npm run dev
# Créez src/components/NewSection.astro
# Importez-la dans la page
# Testez en local
Ctrl+C
npm run pre-deploy-check  # ← CRITIQUE!
git add . && git commit -m "..."
git push origin main
```

### Scénario 3: Je veux modifier les styles
```bash
npm run dev
# Modifiez les classes Tailwind
# Vérifiez le résultat en live
Ctrl+C
npm run pre-deploy-check  # ← CRITIQUE!
git add . && git commit -m "..."
git push origin main
```

---

## 📊 CE QUE VÉRIFIE CHAQUE COMMANDE

### `npm run dev` - Serveur de développement
- Recharge en direct (hot reload)
- Erreurs affichées immédiatement
- **Utilisation:** Pendant le développement

### `npm run test:pre-commit` - Tests de commit
- Vérification syntaxe
- Build du projet
- Pages générées
- Contenu critique
- Tests fonctionnels
- **Utilisation:** Avant chaque commit (automatique)

### `npm run pre-deploy-check` - Vérification pré-déploiement
- Build complet
- Fichiers générés
- Contenu HTML
- Variables JS
- En-têtes sécurité
- Tous les tests
- **Utilisation:** Avant `git push` (OBLIGATOIRE!)

### `gh run watch` - Monitor déploiement
- Affiche le statut en temps réel
- Montre les erreurs
- **Utilisation:** Après `git push`

---

## 🚨 EN CAS D'URGENCE (Site cassé!)

Si le site casse après un déploiement:

```bash
# 1. Reverter le dernier commit
git revert HEAD
git push origin main

# 2. Monitorer le redéploiement
gh run watch

# 3. Une fois que c'est fixé, analyzer ce qui s'est passé
git log --oneline -5  # Voir les derniers commits

# 4. Prévenez ça à l'avenir:
npm run pre-deploy-check  # Avant CHAQUE push!
```

---

## ✅ RÉSUMÉ: LA RÈGLE D'OR

**AVANT CHAQUE `git push origin main`:**
```bash
npm run pre-deploy-check
```

**SI tout est ✅ vert:**
```bash
git push origin main
```

**SI quelque chose est ❌:**
- Réparez l'erreur
- Recommittez
- Réexécutez `npm run pre-deploy-check`
- Ensuite pushez

---

## 🎯 CONCLUSION

Vous avez maintenant:
- ✅ **Pre-commit hooks** - Tests auto avant chaque commit
- ✅ **Pre-deploy check** - Vérification ultime avant push
- ✅ **GitHub Actions CI/CD** - Tests supplémentaires en cloud
- ✅ **Cette documentation** - Guide complet

**C'est impossible d'avoir une surprise de déploiement si vous:**
1. Testez en local (`npm run dev`)
2. Respectez les pre-commits (automatique)
3. Exécutez `npm run pre-deploy-check` avant push
4. Monitorer le déploiement avec `gh run watch`

**Bonne pratique = Déploiements sans stress! 🚀**
