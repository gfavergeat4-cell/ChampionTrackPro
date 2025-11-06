#!/usr/bin/env node

/**
 * Script pour injecter les métadonnées Open Graph dans le HTML généré par Expo
 * Usage: node scripts/inject-metadata.js
 */

const fs = require('fs');
const path = require('path');

const HTML_FILE = path.join(__dirname, '../web/dist/index.html');
const OG_IMAGE_SOURCE = path.join(__dirname, '../web/og-image.jpg');
const OG_IMAGE_DEST = path.join(__dirname, '../web/dist/og-image.jpg');
const METADATA = `
    <!-- Primary Meta Tags -->
    <meta name="title" content="ChampionTrackPRO" />
    <meta name="description" content="The Training Intelligence" />
    <meta name="keywords" content="sport, entraînement, planning, questionnaire, performance, athlète, coach" />
    <meta name="author" content="ChampionTrackPRO" />
    <meta name="theme-color" content="#0E1528" />
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://champion-track-pro.vercel.app/" />
    <meta property="og:title" content="ChampionTrackPRO" />
    <meta property="og:description" content="The Training Intelligence" />
    <meta property="og:image" content="https://champion-track-pro.vercel.app/og-image.jpg" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="ChampionTrackPRO - The Training Intelligence" />
    <meta property="og:site_name" content="ChampionTrackPRO" />
    <meta property="og:locale" content="en_US" />
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="https://champion-track-pro.vercel.app/" />
    <meta name="twitter:title" content="ChampionTrackPRO" />
    <meta name="twitter:description" content="The Training Intelligence" />
    <meta name="twitter:image" content="https://champion-track-pro.vercel.app/og-image.jpg" />
    <meta name="twitter:image:alt" content="ChampionTrackPRO - The Training Intelligence" />
    
    <!-- Favicon -->
    <link rel="icon" type="image/png" href="/favicon.png" />
    <link rel="apple-touch-icon" href="/icon.png" />
`;

function injectMetadata() {
  if (!fs.existsSync(HTML_FILE)) {
    console.error(`❌ Fichier HTML non trouvé: ${HTML_FILE}`);
    console.error('   Exécutez d\'abord: npm run web:build');
    process.exit(1);
  }

  let html = fs.readFileSync(HTML_FILE, 'utf8');
  
  // Supprimer les anciennes métadonnées Open Graph et Twitter si elles existent
  // Cela permet de les remplacer par les nouvelles versions
  html = html.replace(/<!-- Open Graph \/ Facebook -->[\s\S]*?<!-- Twitter -->[\s\S]*?<meta name="twitter:image:alt"[^>]*>/g, '');
  html = html.replace(/<meta property="og:[^>]*>/g, '');
  html = html.replace(/<meta name="twitter:[^>]*>/g, '');
  html = html.replace(/<meta name="description"[^>]*>/g, '');
  html = html.replace(/<meta name="title"[^>]*>/g, '');
  html = html.replace(/<meta name="keywords"[^>]*>/g, '');
  html = html.replace(/<meta name="author"[^>]*>/g, '');
  html = html.replace(/<meta name="theme-color"[^>]*>/g, '');

  // Trouver la balise </head> et insérer les métadonnées avant
  const headEndIndex = html.indexOf('</head>');
  if (headEndIndex === -1) {
    console.error('❌ Balise </head> non trouvée dans le HTML');
    process.exit(1);
  }

  // Insérer les métadonnées avant </head>
  html = html.slice(0, headEndIndex) + METADATA + html.slice(headEndIndex);

  // Mettre à jour le titre si nécessaire
  html = html.replace(
    /<title>.*?<\/title>/,
    '<title>ChampionTrackPRO - The Training Intelligence</title>'
  );

  fs.writeFileSync(HTML_FILE, html, 'utf8');
  console.log('✅ Métadonnées injectées avec succès dans le HTML');
  
  // Copier l'image Open Graph si elle existe
  copyOGImage();
}

function copyOGImage() {
  if (fs.existsSync(OG_IMAGE_SOURCE)) {
    const distDir = path.dirname(OG_IMAGE_DEST);
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir, { recursive: true });
    }
    
    fs.copyFileSync(OG_IMAGE_SOURCE, OG_IMAGE_DEST);
    const stats = fs.statSync(OG_IMAGE_DEST);
    const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`✅ Image Open Graph copiée: ${OG_IMAGE_DEST} (${fileSizeMB} MB)`);
  } else {
    console.warn(`⚠️  Image Open Graph non trouvée: ${OG_IMAGE_SOURCE}`);
    console.warn(`   Générez-la avec: npm run og:generate`);
  }
}

injectMetadata();

