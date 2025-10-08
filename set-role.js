const admin = require("firebase-admin");
const sa = require("./serviceAccountKey.json");
admin.initializeApp({ credential: admin.credential.cert(sa) });
const db = admin.firestore();
const auth = admin.auth();

async function setRoleByEmail(email, role) {
  const user = await auth.getUserByEmail(email);
  const uid = user.uid;
  await db.collection("users").doc(uid).set({ role, updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
  console.log(`OK: ${email} (${uid}) -> role=${role}`);
}

const email = process.argv[2];
const role  = process.argv[3] || "admin";
if (!email) { console.error("Usage: node set-role.js <email> [role]"); process.exit(1); }

setRoleByEmail(email, role).then(()=>process.exit(0)).catch(err => { console.error(err); process.exit(1); });
