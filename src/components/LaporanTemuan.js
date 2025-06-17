import React, { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc, addDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

function LaporanTemuan() {
  const { isAdmin } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "found_items"));
        const reportsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setReports(reportsData);
      } catch (error) {
        console.error("Error fetching found reports: ", error);
        toast.error("Gagal mengambil data laporan");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus laporan ini?")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "found_items", id));
      setReports((prevReports) => prevReports.filter((item) => item.id !== id));
      toast.success("Laporan berhasil dihapus!");
    } catch (error) {
      console.error("Error deleting report: ", error);
      toast.error("Gagal menghapus laporan.");
    }
  };

  const handleReturnToLost = async (report) => {
    try {
      await addDoc(collection(db, "returned_items"), {
        ...report,
        returnedAt: new Date(),
        status: "dikembalikan ke barang hilang",
      });

      await deleteDoc(doc(db, "found_items", report.id));

      toast.success("Laporan dikembalikan ke barang hilang!");

      setReports((prevReports) =>
        prevReports.filter((item) => item.id !== report.id)
      );
    } catch (error) {
      console.error("Error returning report: ", error);
      toast.error("Gagal mengembalikan laporan.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Laporan Ditemukan</h1>
      </div>

      <p className="text-gray-600 mb-6">Berikut adalah laporan barang yang telah ditemukan:</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.length === 0 ? (
          <p className="text-gray-500">Belum ada laporan barang ditemukan.</p>
        ) : (
          reports.map((report) => (
            <div
              key={report.id}
              className="p-4 border border-gray-300 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <h2 className="text-lg font-bold text-gray-700">{report.namaBarang}</h2>
              <p className="text-gray-600">Kategori: {report.kategori}</p>
              <p className="text-gray-600">Deskripsi: {report.deskripsi}</p>
              <p className="text-gray-600">
                Tanggal Ditemukan: {new Date(report.confirmedAt.seconds * 1000).toLocaleString()}
              </p>
              {report.foto && (
                <img
                  src={report.foto}
                  alt="Foto barang ditemukan"
                  className="mt-4 w-full h-auto object-cover rounded-lg"
                />
              )}
              {isAdmin && (
                <div className="flex flex-col gap-2 mt-4">
                  <button
                    onClick={() => handleReturnToLost(report)}
                    className="bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600 transition-colors"
                  >
                    Kembalikan ke Barang Hilang
                  </button>
                  <button
                    onClick={() => handleDelete(report.id)}
                    className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Hapus Laporan
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default LaporanTemuan;