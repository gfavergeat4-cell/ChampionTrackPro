const fs = require("fs");
const path = require("path");

function tryPatch(appPath, importPath) {
  if (!fs.existsSync(appPath)) return false;
  let src = fs.readFileSync(appPath, "utf8");

  if (src.includes("WelcomeScreen")) return true; // already imported/patched maybe

  // Insert import after first import block
  const importLine = `import WelcomeScreen from "${importPath}";`;
  if (src.includes("from \"react\"") || src.includes("from 'react'")) {
    src = src.replace(/(\nimport[^\n]*\n)(?!import)/, `$1${importLine}\n`);
  } else {
    src = `${importLine}\n` + src;
  }

  // Inject <Stack.Screen .../> before </Stack.Navigator>
  if (src.includes("</Stack.Navigator>")) {
    src = src.replace(
      /<\/Stack\.Navigator>/,
      `  <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />\n    </Stack.Navigator>`
    );
  } else {
    // Fallback: set initial component to Welcome if there's a NavigationContainer+Stack already created
    if (src.includes("createNativeStackNavigator")) {
      // no Stack.Navigator found — avoid breaking code
      console.warn("Stack.Navigator not found; skipping screen injection.");
    }
  }

  fs.writeFileSync(appPath, src, "utf8");
  return true;
}

const candidates = ["App.tsx", "App.js"].filter(f => fs.existsSync(f));
if (candidates.length === 0) {
  console.error("App.(js|tsx) not found. Skipping patch.");
  process.exit(0);
}

let patched = false;

// Try relative imports for common layouts
patched = tryPatch("App.tsx", "./src/screens/WelcomeScreen") || patched;
patched = tryPatch("App.js", "./src/screens/WelcomeScreen") || patched;

console.log(patched ? "App patched (import + screen if possible)." : "No changes.");
