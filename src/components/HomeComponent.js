import React from "react";
import { useNavigate } from "react-router-dom";

function HomeComponent() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white px-4 text-center space-y-6">
      <h1 className="text-4xl md:text-5xl font-bold tracking-wide text-black">
        Selamat Datang di
        <span className="block text-blue-600">
          Aplikasi Laporan Barang Hilang
        </span>
      </h1>

      <p className="text-lg text-gray-700 max-w-lg">
        Laporkan barang yang hilang atau temukan barang yang hilang dengan mudah
        dan cepat.
      </p>

      <div className="flex flex-col md:flex-row gap-4">
        <button
          onClick={() => navigate("/laporan-hilangan")}
          className="px-8 py-3 text-lg font-semibold bg-blue-500 rounded-lg shadow-lg hover:bg-blue-600 transform hover:scale-105 transition duration-300 text-white"
        >
          Laporan Hilang
        </button>
      </div>
    </div>
  );
}

export default HomeComponent;
