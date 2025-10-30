# ChampionTrackPro - Design System Guide

## 🎨 Direction Artistique

### Palette de Couleurs
- **Background Principal**: `#0A0F1B` (Deep navy blue-black)
- **Background Secondaire**: `#1A1A2E` (Slightly lighter dark blue)
- **Surface**: `#2C2C4A` (Card backgrounds)
- **Accent Principal**: `#00C2FF` (Bright cyan)
- **Accent Secondaire**: `#6A5CFF` (Purple accent)
- **Texte Principal**: `#FFFFFF`
- **Texte Secondaire**: `#A0A2A8`

### Gradients
- **Principal**: `#00C2FF` → `#6A5CFF`
- **Secondaire**: `#4A90E2` → `#00C2FF`
- **Succès**: `#22C55E` → `#16A34A`
- **Avertissement**: `#F59E0B` → `#D97706`
- **Danger**: `#EF4444` → `#DC2626`

### Typographie
- **UI**: Inter, -apple-system, BlinkMacSystemFont, sans-serif
- **Brand**: Cinzel, serif
- **Mono**: JetBrains Mono, monospace

## 🧩 Composants Modernes

### 1. Écrans Principaux
- `AthleteHomeNew` - Écran d'accueil athlète avec design moderne
- `ScheduleScreenNew` - Planning avec vues Jour/Semaine/Mois
- `LoginScreenNew` - Connexion avec design élégant
- `QuestionnaireScreenNew` - Questionnaire avec sliders interactifs
- `AdminDashboardNew` - Dashboard admin avec cartes d'équipes
- `CreateAccountScreenNew` - Création de compte avec sélection de rôle
- `LandingScreenNew` - Page d'accueil avec CTA

### 2. Composants Réutilisables
- `ModernButton` - Boutons avec gradients et états
- `ModernCard` - Cartes avec ombres et bordures
- `ModernSlider` - Sliders interactifs avec contrôles
- `BottomNavigationNew` - Navigation avec gradients actifs

### 3. Navigation
- `BottomNavigationNew` - Navigation bottom avec indicateurs visuels

## 🎯 Utilisation

### Import des Composants
```typescript
import { 
  AthleteHomeNew, 
  ScheduleScreenNew, 
  LoginScreenNew,
  ModernButton,
  ModernCard,
  ModernSlider 
} from '../src/stitch_components';
```

### Exemple d'Utilisation
```typescript
// Bouton moderne
<ModernButton
  title="Créer Équipe"
  onPress={handleCreateTeam}
  variant="primary"
  size="large"
/>

// Carte moderne
<ModernCard variant="elevated" padding="large">
  <Text>Contenu de la carte</Text>
</ModernCard>

// Slider moderne
<ModernSlider
  title="Intensité Moyenne"
  description="Niveau d'intensité général"
  value={intensity}
  onValueChange={setIntensity}
  min={0}
  max={100}
  step={10}
/>
```

## 🎨 Tokens de Design

### Espacement
- `xs: 4px`, `sm: 8px`, `md: 12px`, `lg: 16px`, `xl: 24px`, `xxl: 32px`, `xxxl: 48px`

### Rayons
- `xs: 4px`, `sm: 8px`, `md: 12px`, `lg: 16px`, `xl: 20px`, `xxl: 24px`, `full: 9999px`

### Ombres
- `glow` - Effet de lueur cyan
- `glowPurple` - Effet de lueur violet
- `card` - Ombre de carte subtile
- `button` - Ombre de bouton

## 🚀 Fonctionnalités

### Écrans Athlète
- **Accueil**: Sessions du jour avec statuts (Respond/Completed)
- **Planning**: Vues Jour/Semaine/Mois avec navigation
- **Questionnaire**: Sliders interactifs, évaluation de la douleur
- **Profil**: Gestion des informations personnelles

### Écrans Admin
- **Dashboard**: Gestion des équipes avec import de calendrier
- **Détails Équipe**: Vue détaillée avec membres et événements
- **Import ICS**: Import automatique des calendriers Google

### Navigation
- **Bottom Navigation**: Navigation avec indicateurs visuels
- **Gradients Actifs**: Mise en évidence de l'onglet actif
- **Animations**: Transitions fluides entre les écrans

## 📱 Responsive Design

### Mobile First
- Design optimisé pour mobile
- Navigation tactile intuitive
- Gestes de navigation fluides

### Web Compatibility
- Support complet du web
- Navigation clavier
- Accessibilité WCAG

## 🎨 Effets Visuels

### Gradients
- Gradients horizontaux pour les boutons
- Effets de lueur pour les éléments actifs
- Transitions fluides entre les couleurs

### Ombres
- Ombres subtiles pour la profondeur
- Effets de lueur pour les éléments interactifs
- Élévation visuelle des cartes

### Animations
- Transitions de 150ms (rapide) à 350ms (lent)
- Animations d'entrée et de sortie
- Feedback visuel sur les interactions

## 🔧 Personnalisation

### Tokens Personnalisables
Tous les tokens sont centralisés dans `src/theme/tokens.ts` :
- Couleurs
- Espacements
- Typographie
- Ombres
- Animations

### Variantes de Composants
- Boutons : primary, secondary, success, warning, danger
- Cartes : default, surface, elevated
- Sliders : personnalisables min/max/step

## 📋 Checklist d'Implémentation

- [x] Système de design mis à jour
- [x] Écran d'accueil moderne
- [x] Écran de planning avec vues multiples
- [x] Écran de connexion élégant
- [x] Questionnaire interactif
- [x] Dashboard admin moderne
- [x] Composants réutilisables
- [x] Navigation bottom
- [x] Guide d'utilisation

## 🎯 Prochaines Étapes

1. **Intégration**: Remplacer les anciens composants par les nouveaux
2. **Tests**: Tester tous les écrans sur mobile et web
3. **Optimisation**: Ajuster les performances et animations
4. **Documentation**: Compléter la documentation des composants
5. **Accessibilité**: Vérifier la conformité WCAG

