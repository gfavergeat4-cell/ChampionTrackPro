// Script pour générer le bundle Android correctement
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('📦 Génération du bundle Android...\n');

const assetsDir = path.join(__dirname, 'android', 'app', 'src', 'main', 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Renommer metro.config.cjs temporairement
const metroBackup = path.join(__dirname, 'metro.config.cjs.backup');
const metroConfig = path.join(__dirname, 'metro.config.cjs');
if (fs.existsSync(metroConfig)) {
  fs.renameSync(metroConfig, metroBackup);
  console.log('✅ metro.config.cjs renommé temporairement');
}

try {
  // Utiliser Expo export pour générer le bundle
  console.log('🔄 Export Expo en cours...');
  execSync('npx expo export --platform android --output-dir android-bundle --clear', {
    stdio: 'inherit',
    cwd: __dirname
  });

  // Chercher le bundle .hbc (Hermes bytecode)
  const bundleDir = path.join(__dirname, 'android-bundle', '_expo', 'static', 'js', 'android');
  const bundleFiles = fs.readdirSync(bundleDir, { recursive: true });
  const hbcFile = bundleFiles.find(f => f.endsWith('.hbc'));
  
  if (hbcFile) {
    const sourcePath = path.join(bundleDir, hbcFile);
    const destPath = path.join(assetsDir, 'index.android.bundle');
    
    // Copier le bundle .hbc
    fs.copyFileSync(sourcePath, destPath);
    console.log('✅ Bundle Hermes (.hbc) copié vers android/app/src/main/assets/index.android.bundle');
    
    // Pour Hermes, nous devons aussi copier le source map si disponible
    const sourceMapFile = bundleFiles.find(f => f.endsWith('.hbc.map'));
    if (sourceMapFile) {
      const mapSourcePath = path.join(bundleDir, sourceMapFile);
      const mapDestPath = path.join(assetsDir, 'index.android.bundle.map');
      fs.copyFileSync(mapSourcePath, mapDestPath);
      console.log('✅ Source map copié');
    }
  } else {
    console.error('❌ Bundle .hbc non trouvé');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Erreur:', error.message);
  process.exit(1);
} finally {
  // Restaurer metro.config.cjs
  if (fs.existsSync(metroBackup)) {
    fs.renameSync(metroBackup, metroConfig);
    console.log('✅ metro.config.cjs restauré');
  }
}

console.log('\n✅ Bundle Android généré avec succès!');

