# Script PowerShell pour build APK Android
# Gère automatiquement le problème Metro/Node 22

Write-Host "📦 Build APK Android - ChampionTrackPro" -ForegroundColor Cyan
Write-Host ""

# Étape 1: Renommer metro.config.cjs temporairement si présent
$metroBackup = $false
if (Test-Path "metro.config.cjs") {
    Rename-Item -Path "metro.config.cjs" -NewName "metro.config.cjs.backup" -Force
    $metroBackup = $true
    Write-Host "✅ metro.config.cjs renommé temporairement" -ForegroundColor Yellow
}

try {
    # Étape 2: Nettoyer les caches
    Write-Host "🧹 Nettoyage des caches..." -ForegroundColor Yellow
    if (Test-Path ".expo") { Remove-Item -Recurse -Force ".expo" -ErrorAction SilentlyContinue }
    if (Test-Path ".cache") { Remove-Item -Recurse -Force ".cache" -ErrorAction SilentlyContinue }
    if (Test-Path "android\app\build") { Remove-Item -Recurse -Force "android\app\build" -ErrorAction SilentlyContinue }
    if (Test-Path "android\build") { Remove-Item -Recurse -Force "android\build" -ErrorAction SilentlyContinue }
    
    # Étape 3: Créer les dossiers nécessaires
    Write-Host "📁 Création des dossiers..." -ForegroundColor Yellow
    if (-not (Test-Path "android\app\src\main\assets")) {
        New-Item -ItemType Directory -Path "android\app\src\main\assets" -Force | Out-Null
    }
    if (-not (Test-Path "android\app\src\main\res")) {
        New-Item -ItemType Directory -Path "android\app\src\main\res" -Force | Out-Null
    }
    
    # Étape 4: Générer le bundle
    Write-Host "🔄 Génération du bundle Android..." -ForegroundColor Yellow
    npx expo export --platform android --output-dir android-bundle --clear
    
    # Étape 5: Copier le bundle
    Write-Host "📋 Copie du bundle..." -ForegroundColor Yellow
    $bundleFile = Get-ChildItem "android-bundle\_expo\static\js\android\index-*.hbc" -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($bundleFile) {
        Copy-Item $bundleFile.FullName -Destination "android\app\src\main\assets\index.android.bundle" -Force
        Write-Host "✅ Bundle copié: android/app/src/main/assets/index.android.bundle" -ForegroundColor Green
    } else {
        Write-Host "❌ Bundle non trouvé dans android-bundle" -ForegroundColor Red
        exit 1
    }
    
    # Étape 6: Nettoyer Gradle
    Write-Host "🧹 Nettoyage Gradle..." -ForegroundColor Yellow
    Set-Location android
    & .\gradlew.bat clean
    Set-Location ..
    
    # Étape 7: Build APK Debug
    Write-Host "🔨 Build APK Debug..." -ForegroundColor Yellow
    Set-Location android
    & .\gradlew.bat assembleDebug
    Set-Location ..
    
    # Vérifier le résultat
    $apkPath = "android\app\build\outputs\apk\debug\app-debug.apk"
    if (Test-Path $apkPath) {
        $apkSize = (Get-Item $apkPath).Length / 1MB
        Write-Host ""
        Write-Host "✅ APK généré avec succès!" -ForegroundColor Green
        Write-Host "📍 Chemin: $((Get-Location).Path)\$apkPath" -ForegroundColor Cyan
        Write-Host "📦 Taille: $([math]::Round($apkSize, 2)) MB" -ForegroundColor Cyan
    } else {
        Write-Host "❌ APK non trouvé à l'emplacement attendu" -ForegroundColor Red
        exit 1
    }
    
} finally {
    # Restaurer metro.config.cjs si nécessaire
    if ($metroBackup -and (Test-Path "metro.config.cjs.backup")) {
        Rename-Item -Path "metro.config.cjs.backup" -NewName "metro.config.cjs" -Force
        Write-Host "✅ metro.config.cjs restauré" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "🎉 Build terminé!" -ForegroundColor Green

