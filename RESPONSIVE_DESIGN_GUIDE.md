# Guide du Design Responsive - ChampionTrackPro

## 🎯 Vue d'ensemble

Ce guide explique comment adapter l'affichage de l'application selon le support utilisé (web/laptop vs mobile) en utilisant des techniques de responsive design.

## 📱 Breakpoints et Détection de Plateforme

### Breakpoints
```typescript
breakpoints: {
  xs: 480,    // Mobile small
  sm: 768,    // Mobile large  
  md: 1024,   // Tablet
  lg: 1280,   // Laptop
  xl: 1536,   // Desktop
  xxl: 1920   // Large desktop
}
```

### Détection de Plateforme
```typescript
const device = useDevice();

// Propriétés disponibles
device.isWeb        // true si web
device.isMobile     // true si mobile (xs, sm)
device.isTablet     // true si tablet (md)
device.isDesktop    // true si desktop (lg, xl, xxl)
device.screenWidth  // largeur de l'écran
device.screenHeight // hauteur de l'écran
device.orientation // 'portrait' | 'landscape'
device.breakpoint   // 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'
```

## 🎨 Adaptation des Composants

### 1. Espacement Responsive
```typescript
import { getResponsiveSpacing } from '../utils/responsive';

// Utilisation
const padding = getResponsiveSpacing('lg', device);
// Retourne: 16px sur mobile, 20px sur tablet, 24px sur laptop, 32px sur desktop
```

### 2. Tailles de Police Responsive
```typescript
import { getResponsiveFontSize } from '../utils/responsive';

// Utilisation
const fontSize = getResponsiveFontSize('xl', device);
// Retourne: 18px sur mobile, 20px sur tablet, 22px sur laptop, 24px sur desktop
```

### 3. Styles Conditionnels
```typescript
// Styles différents selon la plateforme
<View style={[
  styles.container,
  device.isMobile && styles.containerMobile,
  device.isDesktop && styles.containerDesktop
]}>
```

## 📐 Layouts Responsive

### 1. Navigation
- **Mobile/Tablet**: Navigation bottom
- **Desktop**: Sidebar verticale

```typescript
import ResponsiveNavigation from '../stitch_components/ResponsiveNavigation';

<ResponsiveNavigation
  tabs={tabs}
  onTabPress={handleTabPress}
/>
```

### 2. Grilles et Colonnes
```typescript
// Nombre de colonnes selon l'écran
const columns = getGridColumns(device);
// Mobile: 1, Tablet: 2, Desktop: 3, Large Desktop: 4
```

### 3. Conteneurs
```typescript
// Largeur maximale du contenu
const maxWidth = getMaxContentWidth(device);
// Mobile: 100%, Tablet: 768px, Desktop: 1200px, Large: 1400px
```

## 🎯 Exemples d'Implémentation

### 1. Écran d'Accueil Responsive
```typescript
export default function AthleteHome() {
  const device = useDevice();
  
  return (
    <View style={[
      styles.container,
      getMainContainerStyle(device)
    ]}>
      {/* Header adaptatif */}
      <View style={[
        styles.header,
        device.isMobile ? styles.headerMobile : styles.headerDesktop
      ]}>
        <Text style={[
          styles.title,
          { fontSize: getResponsiveFontSize('xxxl', device) }
        ]}>
          WELCOME BACK
        </Text>
      </View>
      
      {/* Sessions en grille sur desktop */}
      <View style={[
        styles.sessionsList,
        device.isDesktop && styles.sessionsListDesktop
      ]}>
        {sessions.map(session => (
          <View style={[
            styles.sessionCard,
            device.isDesktop && styles.sessionCardDesktop
          ]}>
            {/* Contenu de la session */}
          </View>
        ))}
      </View>
    </View>
  );
}
```

### 2. Navigation Responsive
```typescript
// Mobile: Bottom navigation
// Desktop: Sidebar
<ResponsiveLayout
  navigation={<ResponsiveNavigation tabs={tabs} onTabPress={handleTabPress} />}
  sidebar={device.isDesktop ? <Sidebar /> : null}
>
  <MainContent />
</ResponsiveLayout>
```

### 3. Questionnaire Responsive
```typescript
export default function QuestionnaireScreen() {
  const device = useDevice();
  
  return (
    <ScrollView style={styles.container}>
      {questions.map(question => (
        <View style={[
          styles.questionCard,
          device.isDesktop && styles.questionCardDesktop
        ]}>
          <Text style={[
            styles.questionTitle,
            { fontSize: getResponsiveFontSize('lg', device) }
          ]}>
            {question.title}
          </Text>
          
          {/* Slider adaptatif */}
          <ModernSlider
            value={question.value}
            onValueChange={setValue}
            style={device.isMobile ? styles.sliderMobile : styles.sliderDesktop}
          />
        </View>
      ))}
    </ScrollView>
  );
}
```

## 📱 Comportements par Plateforme

### Mobile (xs, sm)
- **Navigation**: Bottom navigation
- **Layout**: Colonne unique
- **Espacement**: Réduit
- **Police**: Plus petite
- **Interactions**: Touch-friendly

### Tablet (md)
- **Navigation**: Bottom navigation
- **Layout**: 2 colonnes
- **Espacement**: Moyen
- **Police**: Taille moyenne
- **Interactions**: Touch + hover

### Desktop (lg, xl, xxl)
- **Navigation**: Sidebar
- **Layout**: 3+ colonnes
- **Espacement**: Généreux
- **Police**: Plus grande
- **Interactions**: Hover + clavier

## 🎨 Tokens Responsive

### Espacement Responsive
```typescript
responsiveSpacing: {
  xs: { xs: 4, sm: 6, md: 8, lg: 10, xl: 12 },
  sm: { xs: 8, sm: 12, md: 16, lg: 20, xl: 24 },
  md: { xs: 12, sm: 16, md: 20, lg: 24, xl: 32 },
  lg: { xs: 16, sm: 20, md: 24, lg: 32, xl: 40 },
  xl: { xs: 24, sm: 32, md: 40, lg: 48, xl: 64 }
}
```

### Tailles de Police Responsive
```typescript
responsiveFontSizes: {
  xs: { xs: 10, sm: 11, md: 12, lg: 13, xl: 14 },
  sm: { xs: 12, sm: 13, md: 14, lg: 15, xl: 16 },
  md: { xs: 14, sm: 15, md: 16, lg: 17, xl: 18 },
  lg: { xs: 16, sm: 17, md: 18, lg: 19, xl: 20 },
  xl: { xs: 18, sm: 20, md: 22, lg: 24, xl: 26 },
  xxl: { xs: 20, sm: 24, md: 28, lg: 32, xl: 36 },
  xxxl: { xs: 24, sm: 28, md: 32, lg: 36, xl: 40 },
  display: { xs: 32, sm: 40, md: 48, lg: 56, xl: 64 }
}
```

## 🔧 Utilitaires Responsive

### Fonctions Utilitaires
```typescript
// Obtenir la valeur responsive
const value = getResponsiveValue({
  xs: 'mobile',
  md: 'tablet', 
  lg: 'desktop'
}, device);

// Obtenir le nombre de colonnes
const columns = getGridColumns(device);

// Obtenir la largeur maximale
const maxWidth = getMaxContentWidth(device);

// Déterminer la navigation
const showBottomNav = shouldShowBottomNavigation(device);
const showSidebar = shouldShowSidebar(device);
```

## 📋 Checklist d'Implémentation

### Pour chaque composant:
- [ ] Importer `useDevice` hook
- [ ] Utiliser `getResponsiveSpacing` pour les espacements
- [ ] Utiliser `getResponsiveFontSize` pour les polices
- [ ] Ajouter des styles conditionnels selon `device.isMobile/Desktop`
- [ ] Tester sur différentes tailles d'écran
- [ ] Vérifier la navigation (bottom vs sidebar)
- [ ] Optimiser les interactions (touch vs hover)

### Styles Responsive:
- [ ] Mobile: Layout en colonne, espacement réduit
- [ ] Tablet: Layout en 2 colonnes, espacement moyen
- [ ] Desktop: Layout en 3+ colonnes, espacement généreux
- [ ] Navigation adaptative (bottom vs sidebar)
- [ ] Grilles responsives
- [ ] Typographie adaptative

## 🚀 Bonnes Pratiques

1. **Mobile First**: Commencer par le design mobile
2. **Progressive Enhancement**: Améliorer pour les écrans plus grands
3. **Touch-Friendly**: Boutons et zones de touch adaptés
4. **Performance**: Optimiser les images et animations
5. **Accessibilité**: Maintenir la lisibilité sur tous les écrans
6. **Tests**: Tester sur différentes tailles et orientations

## 📱 Exemples de Rendu

### Mobile (375px)
- Navigation bottom
- 1 colonne
- Espacement: 12px
- Police: 14px

### Tablet (768px)
- Navigation bottom
- 2 colonnes
- Espacement: 16px
- Police: 16px

### Desktop (1280px)
- Sidebar
- 3 colonnes
- Espacement: 24px
- Police: 18px

### Large Desktop (1920px)
- Sidebar
- 4 colonnes
- Espacement: 32px
- Police: 20px


