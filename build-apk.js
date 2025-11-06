const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Building ChampionTrackPRO APK...');

try {
  // Vérifier que nous sommes dans le bon répertoire
  if (!fs.existsSync('package.json')) {
    throw new Error('❌ package.json not found. Please run this script from the project root.');
  }

  console.log('📦 Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });

  console.log('🔧 Building Android APK...');
  
  // Créer le dossier de sortie
  const outputDir = path.join(__dirname, 'android-build');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Build avec Expo
  console.log('📱 Building for Android...');
  execSync('npx expo build:android --type apk', { stdio: 'inherit' });

  console.log('✅ APK build completed!');
  console.log('📁 Check the android-build folder for your APK file.');
  console.log('📱 You can now install the APK on your Android device.');

} catch (error) {
  console.error('❌ Build failed:', error.message);
  console.log('\n🔧 Alternative method:');
  console.log('1. Run: npx expo build:android --type apk');
  console.log('2. Or use: npx expo run:android --variant release');
  process.exit(1);
}


