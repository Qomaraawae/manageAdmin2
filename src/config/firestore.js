// Import Firestore services dari Firebase
import { db } from "./firebase"; // Mengimpor konfigurasi firebase yang sudah dibuat
import { collection, addDoc } from "firebase/firestore"; // Fungsi untuk menambah data ke koleksi

// Fungsi untuk menyimpan data laporan barang hilang ke Firestore
export const saveLostItemReport = async (reportData) => {
  try {
    const docRef = await addDoc(collection(db, "lost_items"), reportData);
    console.log(
      "Laporan barang hilang berhasil disimpan dengan ID: ",
      docRef.id
    );
    return docRef.id; // Mengembalikan ID laporan yang baru disimpan
  } catch (e) {
    console.error("Error menambah laporan barang hilang: ", e);
    throw e; // Melempar error jika gagal
  }
};
