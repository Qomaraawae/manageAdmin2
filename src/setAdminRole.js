const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // Sesuaikan path

// Inisialisasi Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://qomaraa-403b2-default-rtdb.firebaseio.com' // Ganti dengan Project ID Anda
});

// Fungsi untuk set role admin
async function setAdminRole(email) {
  try {
    // 1. Dapatkan user berdasarkan email
    const user = await admin.auth().getUserByEmail(email);
    
    // 2. Set custom claim "role: admin"
    await admin.auth().setCustomUserClaims(user.uid, { 
      role: 'admin' 
    });
    
    console.log(`✅ Berhasil! User ${email} (UID: ${user.uid}) sekarang adalah ADMIN.`);
  } catch (error) {
    console.error('❌ Gagal:', error.message);
  }
}

// Contoh penggunaan
setAdminRole('luthfikomara04@gmail.com'); 
