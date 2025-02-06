import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { auth } from "../config/firebase"; // Impor auth dari firebase.js

function Navbar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Cek status login saat halaman pertama kali dimuat
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user); // Set status user
    });
    return () => unsubscribe(); // Bersihkan listener saat komponen unmount
  }, []);

  const handleLogout = () => {
    auth.signOut(); // Keluar dari akun
  };

  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between items-center shadow-lg">
      <Link to="/" className="text-2xl font-extrabold text-yellow-400 hover:text-yellow-500 transition-colors duration-300">
        Laporan Kehilangan
      </Link>
      <div className="flex space-x-6">
        <Link
          to="/laporan-hilangan"
          className="text-lg hover:text-yellow-500 transition-colors duration-300"
        >
          Laporan Hilangan
        </Link>
        <Link
          to="/laporan-ditemukan"
          className="text-lg hover:text-yellow-500 transition-colors duration-300"
        >
          Laporan Ditemukan
        </Link>
        <Link
          to="/dashboard"
          className="text-lg hover:text-yellow-500 transition-colors duration-300"
        >
          Dashboard
        </Link>

        {/* Jika sudah login sebagai admin, tampilkan opsi tambahan */}
        {user ? (
          <>
            <Link
              to="/admin-dashboard"
              className="text-lg hover:text-yellow-500 transition-colors duration-300"
            >
              Admin Dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white py-2 px-4 rounded-lg shadow-lg hover:bg-red-600 transition-colors duration-300"
            >
              Logout
            </button>
          </>
        ) : (
          <Link
            to="/admin-login"
            className="bg-red-500 text-white py-2 px-4 rounded-lg shadow-lg hover:bg-red-600 transition-colors duration-300"
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
