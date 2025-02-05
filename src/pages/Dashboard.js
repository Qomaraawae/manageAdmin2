import React, { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc, addDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const { isAdmin } = useAuth(); // Mendapatkan isAdmin dari AuthContext
  const [reports, setReports] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "lost_items"));
        const reportsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setReports(reportsData);
      } catch (error) {
        console.error("Error fetching reports: ", error);
      }
    };

    fetchReports();
  }, []);

  const handleConfirmation = async (report) => {
    try {
      await addDoc(collection(db, "found_items"), {
        ...report,
        confirmedAt: new Date(),
      });

      await deleteDoc(doc(db, "lost_items", report.id));
      setReports((prevReports) => prevReports.filter((item) => item.id !== report.id));
      
      toast.success("Laporan berhasil dikonfirmasi!", {
        position: "top-center",
        autoClose: 5000,
      });
      
      navigate("/laporan-ditemukan");
    } catch (error) {
      console.error("Error confirming report: ", error);
      toast.error("Gagal mengonfirmasi laporan.", {
        position: "top-center",
        autoClose: 5000,
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "lost_items", id));
      setReports((prevReports) => prevReports.filter((item) => item.id !== id));
      toast.success("Laporan berhasil dihapus!", {
        position: "top-center",
        autoClose: 5000,
      });
    } catch (error) {
      console.error("Error deleting report: ", error);
      toast.error("Gagal menghapus laporan.", {
        position: "top-center",
        autoClose: 5000,
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Dashboard</h1>
      <p className="text-gray-600 mb-6">Berikut adalah laporan barang hilang:</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.length === 0 ? (
          <p className="text-gray-500">Belum ada laporan barang hilang.</p>
        ) : (
          reports.map((report) => (
            <div key={report.id} className="p-4 border border-gray-300 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
              <h2 className="text-lg font-bold text-gray-700">{report.namaBarang}</h2>
              <p className="text-gray-600">Kategori: {report.kategori}</p>
              <p className="text-gray-600">Deskripsi: {report.deskripsi}</p>
              <p className="text-gray-600">
                Tanggal: {new Date(report.tanggal.seconds * 1000).toLocaleString()}
              </p>
              {report.foto && (
                <img
                  src={report.foto}
                  alt="Foto barang hilang"
                  className="mt-4 w-full h-56 object-cover rounded-lg"
                />
              )}
              {isAdmin && (
                <>
                  <button
                    onClick={() => handleConfirmation(report)}
                    className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-lg w-full"
                  >
                    Konfirmasi Barang
                  </button>
                  <button
                    onClick={() => handleDelete(report.id)}
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
