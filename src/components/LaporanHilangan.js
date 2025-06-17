import React, { useState } from "react";
import axios from "axios";
import { saveLostItemReport } from "../config/firestore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function LaporanHilangan() {
  const [namaBarang, setNamaBarang] = useState("");
  const [kategori, setKategori] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [foto, setFoto] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFoto(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!namaBarang || !kategori || !deskripsi || !foto) {
      toast.error("Mohon lengkapi semua field dan unggah gambar.", { 
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return;
    }
  
    const formData = new FormData();
    formData.append("file", foto);
    formData.append("upload_preset", "qomaraawae");
    formData.append("cloud_name", "dm1zqexxt");
  
    try {
      const response = await axios.post(
        "https://api.cloudinary.com/v1_1/dm1zqexxt/image/upload",
        formData,
        {
          onUploadProgress: (progressEvent) => {
            const progress = (progressEvent.loaded / progressEvent.total) * 100;
            setUploadProgress(progress);
          },
        }
      );
  
      const downloadURL = response.data.secure_url;
      const reportData = {
        namaBarang,
        kategori,
        deskripsi,
        foto: downloadURL,
        tanggal: new Date(),
      };
  
      await saveLostItemReport(reportData);
  
      toast.success("Laporan barang hilang berhasil disimpan!", { 
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
  
      navigate("/dashboard");
  
    } catch (error) {
      console.error("Error uploading image to Cloudinary:", error);
      toast.error("Gagal mengunggah gambar.", { 
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };  

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Laporan Barang Hilang</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700">Nama Barang</label>
            <input
              type="text"
              value={namaBarang}
              onChange={(e) => setNamaBarang(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-700">Kategori</label>
            <input
              type="text"
              value={kategori}
              onChange={(e) => setKategori(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-700">Deskripsi</label>
            <textarea
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-700">Unggah Foto</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          {uploadProgress > 0 && (
            <div className="text-blue-500 font-medium">
              Upload Progress: {uploadProgress.toFixed(0)}%
            </div>
          )}
          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition"
          >
            Kirim Laporan
          </button>
        </form>
      </div>
    </div>
  );
}

export default LaporanHilangan;