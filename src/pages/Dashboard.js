import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  addDoc,
  getDoc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

// Fungsi untuk mengupload gambar ke Cloudinary
const uploadImageToCloudinary = async (image) => {
  const cloudinaryUrl =
    "https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload";
  const formData = new FormData();
  formData.append("file", image);
  formData.append("upload_preset", "YOUR_UPLOAD_PRESET");

  try {
    const response = await axios.post(cloudinaryUrl, formData);
    return response.data.secure_url; // Mendapatkan URL gambar yang ter-upload
  } catch (error) {
    console.error("Error uploading image to Cloudinary", error);
    return null;
  }
};

// Helper function untuk format tanggal Firestore
const formatFirestoreDate = (firestoreTimestamp) => {
  if (firestoreTimestamp && firestoreTimestamp.seconds) {
    return new Date(firestoreTimestamp.seconds * 1000).toLocaleString();
  }
  return "Tanggal tidak tersedia";
};

function Dashboard() {
  const { isAdmin } = useAuth();
  const [lostReports, setLostReports] = useState([]);
  const [returnedReports, setReturnedReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up realtime listeners
    const unsubscribeLost = onSnapshot(
      collection(db, "lost_items"),
      (snapshot) => {
        const updatedData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setLostReports(updatedData);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error fetching lost items:", error);
        toast.error("Gagal mengambil data barang hilang");
        setIsLoading(false);
      }
    );

    const unsubscribeReturned = onSnapshot(
      collection(db, "returned_items"),
      (snapshot) => {
        const updatedData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setReturnedReports(updatedData);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error fetching returned items:", error);
        toast.error("Gagal mengambil data barang yang dikembalikan");
        setIsLoading(false);
      }
    );

    // Clean up listeners
    return () => {
      unsubscribeLost();
      unsubscribeReturned();
    };
  }, []);

  const refreshData = async () => {
    setIsLoading(true);
    try {
      const querySnapshotLost = await getDocs(collection(db, "lost_items"));
      const reportsDataLost = querySnapshotLost.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setLostReports(reportsDataLost);

      const querySnapshotReturned = await getDocs(
        collection(db, "returned_items")
      );
      const reportsDataReturned = querySnapshotReturned.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setReturnedReports(reportsDataReturned);

      toast.info("Data berhasil diperbarui");
    } catch (error) {
      console.error("Error refreshing data: ", error);
      toast.error("Gagal memperbarui data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmation = async (report, fromCollection) => {
    try {
      let imageUrl = report.foto;
      if (report.imageFile) {
        imageUrl = await uploadImageToCloudinary(report.imageFile);
      }

      const targetCollection =
        fromCollection === "returned_items" ? "found_items" : "returned_items";

      // Hindari menyertakan ID dari dokumen asal
      const { id, ...reportWithoutId } = report;

      await addDoc(collection(db, targetCollection), {
        ...reportWithoutId,
        originalId: id, // simpan ID asli sebagai referensi jika diperlukan
        confirmedAt: new Date(),
        foto: imageUrl,
      });

      await deleteDoc(doc(db, fromCollection, id));

      toast.success("Laporan berhasil dikonfirmasi!");
    } catch (error) {
      console.error("Error confirming report: ", error);
      toast.error("Gagal mengonfirmasi laporan.");
    }
  };

  const handleDelete = async (id, collectionName) => {
    try {
      // Simpan referensi dokumen
      const docRef = doc(db, collectionName, id);

      // Hapus dokumen
      await deleteDoc(docRef);

      // Verifikasi penghapusan
      setTimeout(async () => {
        try {
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            console.warn("Dokumen masih ada setelah penghapusan");
            toast.warning("Dokumen mungkin belum sepenuhnya terhapus");
          }
        } catch (verifyError) {
          console.error("Error verifying deletion:", verifyError);
        }
      }, 1000);

      toast.success("Laporan berhasil dihapus!");
    } catch (error) {
      console.error("Error deleting report: ", error);
      toast.error(
        `Gagal menghapus laporan: ${error.message || "Unknown error"}`
      );
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6 text-center">
        <p className="text-gray-600">Memuat data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <button
          onClick={refreshData}
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors"
        >
          Refresh Data
        </button>
      </div>

      <p className="text-gray-600 mb-6">
        Berikut adalah laporan barang hilang:
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {lostReports.length === 0 ? (
          <p className="text-gray-500">Belum ada laporan barang hilang.</p>
        ) : (
          lostReports.map((report) => (
            <div
              key={`lost_${report.id}`}
              className="p-4 border border-gray-300 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <h2 className="text-lg font-bold text-gray-700">
                {report.namaBarang || "Nama tidak tersedia"}
              </h2>
              <p className="text-gray-600">
                Kategori: {report.kategori || "Tidak dikategorikan"}
              </p>
              <p className="text-gray-600">
                Deskripsi: {report.deskripsi || "Tidak ada deskripsi"}
              </p>
              <p className="text-gray-600">
                Tanggal: {formatFirestoreDate(report.tanggal)}
              </p>
              {report.foto && (
                <img
                  src={report.foto}
                  alt="Foto barang hilang"
                  className="mt-4 w-full h-auto object-cover rounded-lg"
                />
              )}
              {isAdmin && (
                <>
                  <button
                    onClick={() => handleConfirmation(report, "lost_items")}
                    className="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg w-full transition-colors"
                  >
                    Konfirmasi Barang
                  </button>
                  <button
                    onClick={() => handleDelete(report.id, "lost_items")}
                    className="mt-2 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg w-full transition-colors"
                  >
                    Hapus Laporan
                  </button>
                </>
              )}
            </div>
          ))
        )}
      </div>

      <h1 className="text-3xl font-bold text-gray-800 mt-10 mb-4">
        Laporan Pengembalian Barang
      </h1>
      <p className="text-gray-600 mb-6">
        Berikut adalah laporan barang yang telah dikembalikan:
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {returnedReports.length === 0 ? (
          <p className="text-gray-500">
            Belum ada laporan barang yang dikembalikan.
          </p>
        ) : (
          returnedReports.map((report) => (
            <div
              key={`returned_${report.id}`}
              className="p-4 border border-gray-300 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <h2 className="text-lg font-bold text-gray-700">
                {report.namaBarang || "Nama tidak tersedia"}
              </h2>
              <p className="text-gray-600">
                Kategori: {report.kategori || "Tidak dikategorikan"}
              </p>
              <p className="text-gray-600">
                Deskripsi: {report.deskripsi || "Tidak ada deskripsi"}
              </p>
              <p className="text-gray-600">
                Tanggal Pengembalian: {formatFirestoreDate(report.returnedAt)}
              </p>
              {report.foto && (
                <img
                  src={report.foto}
                  alt="Foto barang dikembalikan"
                  className="mt-4 w-full h-auto object-cover rounded-lg"
                />
              )}
              {isAdmin && (
                <>
                  <button
                    onClick={() => handleConfirmation(report, "returned_items")}
                    className="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg w-full transition-colors"
                  >
                    Konfirmasi Barang
                  </button>
                  <button
                    onClick={() => handleDelete(report.id, "returned_items")}
                    className="mt-2 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg w-full transition-colors"
                  >
                    Hapus Laporan
                  </button>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Dashboard;
