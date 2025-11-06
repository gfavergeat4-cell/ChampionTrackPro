Write-Host "🚀 Building ChampionTrackPRO APK..." -ForegroundColor Cyan

try {
    # Vérifier que nous sommes dans le bon répertoire
    if (-not (Test-Path "package.json")) {
        throw "❌ package.json not found. Please run this script from the project root."
    }

    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install

    Write-Host "🔧 Building Android APK..." -ForegroundColor Yellow
    
    # Créer le dossier de sortie
    $outputDir = "android-build"
    if (-not (Test-Path $outputDir)) {
        New-Item -ItemType Directory -Path $outputDir -Force
    }

    Write-Host "📱 Building for Android..." -ForegroundColor Yellow
    npx expo build:android --type apk

    Write-Host "✅ APK build completed!" -ForegroundColor Green
    Write-Host "📁 Check the android-build folder for your APK file." -ForegroundColor Green
    Write-Host "📱 You can now install the APK on your Android device." -ForegroundColor Green

} catch {
    Write-Host "❌ Build failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔧 Alternative methods:" -ForegroundColor Yellow
    Write-Host "1. Run: npx expo build:android --type apk" -ForegroundColor White
    Write-Host "2. Or use: npx expo run:android --variant release" -ForegroundColor White
    Write-Host "3. Or use EAS Build: eas build --platform android --profile preview" -ForegroundColor White
}


