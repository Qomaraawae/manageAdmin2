import { db } from "./firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import logger from "../utils/logger"; // Impor logger

// LOST ITEMS
export const saveLostItemReport = async (reportData) => {
  try {
    const docRef = await addDoc(collection(db, "lost_items"), {
      ...reportData,
      createdAt: serverTimestamp(),
    });
    logger.log("Saved lost item report:", docRef.id);
    return docRef.id;
  } catch (error) {
    logger.error("Error saving lost item:", error.code, error.message);
    throw new Error("Gagal menyimpan laporan barang hilang: " + error.message);
  }
};

// RETURNED ITEMS
export const saveReturnedItemReport = async (reportData, adminUid) => {
  try {
    const docRef = await addDoc(collection(db, "returned_items"), {
      ...reportData,
      returnedAt: serverTimestamp(),
      confirmedBy: adminUid,
    });
    logger.log("Saved returned item report:", docRef.id);
    return docRef.id;
  } catch (error) {
    logger.error("Error saving returned item:", error.code, error.message);
    throw new Error(
      "Gagal menyimpan laporan barang ditemukan: " + error.message
    );
  }
};

// DELETE REPORT
export const deleteReport = async (collectionName, id) => {
  try {
    await deleteDoc(doc(db, collectionName, id));
    logger.log(`Deleted report ${id} from ${collectionName}`);
  } catch (error) {
    logger.error(
      `Error deleting ${collectionName} report ${id}:`,
      error.code,
      error.message
    );
    throw new Error(
      `Gagal menghapus laporan dari ${collectionName}: ` + error.message
    );
  }
};

// REALTIME LISTENERS
export const setupReportsListener = (collectionName, callback) => {
  try {
    return onSnapshot(
      collection(db, collectionName),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        logger.log(
          `Received ${collectionName} snapshot with ${data.length} items`
        );
        callback(data);
      },
      (error) => {
        logger.error(
          `Error in ${collectionName} listener:`,
          error.code,
          error.message
        );
      }
    );
  } catch (error) {
    logger.error(
      `Error setting up ${collectionName} listener:`,
      error.code,
      error.message
    );
  }
};

// MOVE REPORT FROM LOST TO RETURNED
export const moveReportToReturned = async (report, adminUid) => {
  try {
    const returnedData = {
      ...report,
      returnedAt: serverTimestamp(),
      confirmedBy: adminUid,
    };

    const { id, ...dataWithoutId } = returnedData;

    const docRef = await addDoc(
      collection(db, "returned_items"),
      dataWithoutId
    );
    logger.log("Moved report to returned_items:", docRef.id);

    await deleteDoc(doc(db, "lost_items", report.id));
    logger.log("Deleted report from lost_items:", report.id);

    return docRef.id;
  } catch (error) {
    logger.error(
      "Error moving report to returned items:",
      error.code,
      error.message
    );
    throw new Error(
      "Gagal memindahkan laporan ke barang ditemukan: " + error.message
    );
  }
};
