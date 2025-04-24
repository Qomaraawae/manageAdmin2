import { db } from "./firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

// LOST ITEMS
export const saveLostItemReport = async (reportData) => {
  try {
    const docRef = await addDoc(collection(db, "lost_items"), reportData);
    return docRef.id;
  } catch (error) {
    throw new Error("Failed to save lost item: " + error.message);
  }
};

// RETURNED ITEMS (ditambahkan)
export const saveReturnedItemReport = async (reportData) => {
  try {
    const docRef = await addDoc(collection(db, "returned_items"), reportData);
    return docRef.id;
  } catch (error) {
    throw new Error("Failed to save returned item: " + error.message);
  }
};

// DELETE REPORT (universal)
export const deleteReport = async (collectionName, id) => {
  try {
    await deleteDoc(doc(db, collectionName, id));
  } catch (error) {
    throw new Error(`Failed to delete ${collectionName}: ` + error.message);
  }
};

// REALTIME LISTENERS
export const setupReportsListener = (collectionName, callback) => {
  return onSnapshot(collection(db, collectionName), (snapshot) => {
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    callback(data);
  });
};

// MOVE REPORT FROM LOST TO RETURNED
export const moveReportToReturned = async (report) => {
  try {
    // Persiapkan data untuk koleksi returned_items
    const returnedData = {
      ...report,
      returnedAt: serverTimestamp(), // Tambahkan timestamp saat dikonfirmasi
    };

    // Hapus id dari object yang akan disimpan
    const { id, ...dataWithoutId } = returnedData;

    // Simpan ke koleksi returned_items
    const docRef = await addDoc(
      collection(db, "returned_items"),
      dataWithoutId
    );

    // Setelah berhasil dipindahkan, hapus dari lost_items
    await deleteDoc(doc(db, "lost_items", report.id));

    return docRef.id;
  } catch (error) {
    throw new Error(
      "Failed to move report to returned items: " + error.message
    );
  }
};
