import React, { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc, addDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

// Fungsi untuk mengupload gambar ke Cloudinary
const uploadImageToCloudinary = async (image) => {
  const cloudinaryUrl = "https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload";
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

function Dashboard() {
  const { isAdmin } = useAuth();
  const [lostReports, setLostReports] = useState([]);
  const [returnedReports, setReturnedReports] = useState([]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const querySnapshotLost = await getDocs(collection(db, "lost_items"));
        const reportsDataLost = querySnapshotLost.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setLostReports(reportsDataLost);

        const querySnapshotReturned = await getDocs(collection(db, "returned_items"));
        const reportsDataReturned = querySnapshotReturned.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setReturnedReports(reportsDataReturned);
      } catch (error) {
        console.error("Error fetching reports: ", error);
      }
    };

    fetchReports();
  }, []);

  const handleConfirmation = async (report, fromCollection) => {
    try {
      let imageUrl = report.foto;
      if (report.imageFile) {
        imageUrl = await uploadImageToCloudinary(report.imageFile);
      }

      const targetCollection = fromCollection === "returned_items" ? "found_items" : "returned_items";
      await addDoc(collection(db, targetCollection), {
        ...report,
        confirmedAt: new Date(),
        foto: imageUrl,
      });

      await deleteDoc(doc(db, fromCollection, report.id));
      setReturnedReports((prevReports) => prevReports.filter((item) => item.id !== report.id));
      setLostReports((prevReports) => prevReports.filter((item) => item.id !== report.id));

      toast.success("Laporan berhasil dikonfirmasi!");
    } catch (error) {
      console.error("Error confirming report: ", error);
      toast.error("Gagal mengonfirmasi laporan.");
    }
  };

  const handleDelete = async (id, collectionName) => {
    try {
      await deleteDoc(doc(db, collectionName, id));
      if (collectionName === "returned_items") {
        setReturnedReports((prevReports) => prevReports.filter((item) => item.id !== id));
      } else {
        setLostReports((prevReports) => prevReports.filter((item) => item.id !== id));
      }
      toast.success("Laporan berhasil dihapus!");
    } catch (error) {
      console.error("Error deleting report: ", error);
      toast.error("Gagal menghapus laporan.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Dashboard</h1>
      <p className="text-gray-600 mb-6">Berikut adalah laporan barang hilang:</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {lostReports.length === 0 ? (
          <p className="text-gray-500">Belum ada laporan barang hilang.</p>
        ) : (
          lostReports.map((report) => (
            <div key={report.id} className="p-4 border border-gray-300 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
              <h2 className="text-lg font-bold text-gray-700">{report.namaBarang}</h2>
              <p className="text-gray-600">Kategori: {report.kategori}</p>
              <p className="text-gray-600">Deskripsi: {report.deskripsi}</p>
              <p className="text-gray-600">Tanggal: {new Date(report.tanggal.seconds * 1000).toLocaleString()}</p>
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
                    className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-lg w-full"
                  >
                    Konfirmasi Barang
                  </button>
                  <button
                    onClick={() => handleDelete(report.id, "lost_items")}
                    className="mt-2 bg-red-500 text-white py-2 px-4 rounded-lg w-full"
                  >
                    Hapus Laporan
                  </button>
                </>
              )}
            </div>
          ))
        )}
      </div>

      <h1 className="text-3xl font-bold text-gray-800 mt-10 mb-4">Laporan Pengembalian Barang</h1>
      <p className="text-gray-600 mb-6">Berikut adalah laporan barang yang telah dikembalikan:</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {returnedReports.length === 0 ? (
          <p className="text-gray-500">Belum ada laporan barang yang dikembalikan.</p>
        ) : (
          returnedReports.map((report) => (
            <div key={report.id} className="p-4 border border-gray-300 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
              <h2 className="text-lg font-bold text-gray-700">{report.namaBarang}</h2>
              <p className="text-gray-600">Kategori: {report.kategori}</p>
              <p className="text-gray-600">Deskripsi: {report.deskripsi}</p>
              <p className="text-gray-600">Tanggal Pengembalian: {new Date(report.returnedAt.seconds * 1000).toLocaleString()}</p>
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
                    className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-lg w-full"
                  >
                    Konfirmasi Barang
                  </button>
                  <button
                    onClick={() => handleDelete(report.id, "returned_items")}
                    className="mt-2 bg-red-500 text-white py-2 px-4 rounded-lg w-full"
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