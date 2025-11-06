#!/usr/bin/env node

/**
 * Script pour injecter les métadonnées Open Graph dans le HTML généré par Expo
 * Usage: node scripts/inject-metadata.js
 */

const fs = require('fs');
const path = require('path');

const HTML_FILE = path.join(__dirname, '../web/dist/index.html');
const METADATA = `
    <!-- Primary Meta Tags -->
    <meta name="title" content="ChampionTrackPRO - The Training Intelligence" />
    <meta name="description" content="Optimisez vos entraînements avec ChampionTrackPRO, la solution d'intelligence pour le sport. Suivez votre planning, soumettez vos questionnaires et analysez vos performances." />
    <meta name="keywords" content="sport, entraînement, planning, questionnaire, performance, athlète, coach" />
    <meta name="author" content="ChampionTrackPRO" />
    <meta name="theme-color" content="#0E1528" />
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://championtrackpro.vercel.app/" />
    <meta property="og:title" content="ChampionTrackPRO - The Training Intelligence" />
    <meta property="og:description" content="Optimisez vos entraînements avec ChampionTrackPRO, la solution d'intelligence pour le sport. Suivez votre planning, soumettez vos questionnaires et analysez vos performances." />
    <meta property="og:image" content="https://championtrackpro.vercel.app/og-image.png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="ChampionTrackPRO - The Training Intelligence" />
    <meta property="og:site_name" content="ChampionTrackPRO" />
    <meta property="og:locale" content="en_US" />
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="https://championtrackpro.vercel.app/" />
    <meta name="twitter:title" content="ChampionTrackPRO - The Training Intelligence" />
    <meta name="twitter:description" content="Optimisez vos entraînements avec ChampionTrackPRO, la solution d'intelligence pour le sport. Suivez votre planning, soumettez vos questionnaires et analysez vos performances." />
    <meta name="twitter:image" content="https://championtrackpro.vercel.app/og-image.png" />
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
  
  // Vérifier si les métadonnées sont déjà présentes
  if (html.includes('og:title')) {
    console.log('✅ Les métadonnées sont déjà présentes dans le HTML');
    return;
  }

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
}

injectMetadata();

