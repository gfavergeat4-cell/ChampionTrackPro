# Script final pour build APK avec bundle correct
Write-Host "📦 Build APK Android - ChampionTrackPro" -ForegroundColor Cyan
Write-Host ""

# 1. Générer le bundle
Write-Host "🔄 Génération du bundle..." -ForegroundColor Yellow
node build-bundle-android.js
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors de la génération du bundle" -ForegroundColor Red
    exit 1
}

# 2. Vérifier que le bundle existe
$bundlePath = "android\app\src\main\assets\index.android.bundle"
if (-not (Test-Path $bundlePath)) {
    Write-Host "❌ Bundle non trouvé à $bundlePath" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Bundle trouvé: $bundlePath" -ForegroundColor Green

# 3. Build APK
Write-Host "🔨 Build APK Debug..." -ForegroundColor Yellow
Set-Location android
.\gradlew.bat assembleDebug
if ($LASTEXITCODE -ne 0) {
    Set-Location ..
    Write-Host "❌ Erreur lors du build" -ForegroundColor Red
    exit 1
}
Set-Location ..

# 4. Vérifier l'APK
$apkPath = "android\app\build\outputs\apk\debug\app-debug.apk"
if (Test-Path $apkPath) {
    $apkSize = (Get-Item $apkPath).Length / 1MB
    $fullPath = (Resolve-Path $apkPath).Path
    Write-Host ""
    Write-Host "✅ APK généré avec succès!" -ForegroundColor Green
    Write-Host "📍 Chemin: $fullPath" -ForegroundColor Cyan
    Write-Host "📦 Taille: $([math]::Round($apkSize, 2)) MB" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📱 Instructions:" -ForegroundColor Yellow
    Write-Host "   1. Transférez l'APK sur votre téléphone Android"
    Write-Host "   2. Activez 'Sources inconnues' dans les paramètres de sécurité"
    Write-Host "   3. Installez l'APK en le tapant"
} else {
    Write-Host "❌ APK non trouvé" -ForegroundColor Red
    exit 1
}

