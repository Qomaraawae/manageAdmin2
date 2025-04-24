const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json"); // Sesuaikan path

// Inisialisasi Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://qomaraa-403b2-default-rtdb.firebaseio.com", // Ganti dengan URL proyek Anda
});

admin.auth().setCustomUserClaims(uid, { role: "admin" });

const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };
