// Script pour générer le bundle Android en contournant le problème Metro/Node 22
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('📦 Génération du bundle Android...\n');

// Vérifier que le dossier assets existe
const assetsDir = path.join(__dirname, 'android', 'app', 'src', 'main', 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
  console.log('✅ Dossier assets créé');
}

// Copier le bundle depuis le dossier temporaire Expo
try {
  // Utiliser expo export pour générer le bundle
  console.log('🔄 Export Expo en cours...');
  execSync('npx expo export --platform android --output-dir temp-android-bundle --no-minify', {
    stdio: 'inherit',
    cwd: __dirname,
    env: { ...process.env, NODE_OPTIONS: '--no-experimental-fetch' }
  });

  // Copier le bundle généré
  const bundlePath = path.join(__dirname, 'temp-android-bundle', '_expo', 'static', 'js', 'android', 'index.android.bundle');
  const destPath = path.join(assetsDir, 'index.android.bundle');
  
  if (fs.existsSync(bundlePath)) {
    fs.copyFileSync(bundlePath, destPath);
    console.log('✅ Bundle copié vers android/app/src/main/assets/index.android.bundle');
  } else {
    console.error('❌ Bundle non trouvé dans temp-android-bundle');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Erreur lors de la génération du bundle:', error.message);
  process.exit(1);
}

console.log('\n✅ Bundle Android généré avec succès!');
console.log('📍 Chemin: android/app/src/main/assets/index.android.bundle');

