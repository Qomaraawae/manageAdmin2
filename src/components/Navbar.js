import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { auth } from "../config/firebase";
import { Menu, X } from "lucide-react"; // Ikon menu dari lucide-react

function Navbar() {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    auth.signOut();
    setMenuOpen(false); // Tutup menu setelah logout
  };

  // Fungsi untuk toggle menu
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <nav className="bg-gray-900 text-white p-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-extrabold text-yellow-400 hover:text-yellow-500 transition-colors duration-300"
        >
          Laporan Kehilangan
        </Link>

        {/* Tombol Hamburger untuk Mobile */}
        <button
          className="md:hidden text-white"
          onClick={toggleMenu} // Fungsi toggle menu
        >
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* Menu Links */}
        <div
          className={`absolute md:static top-16 left-0 w-full md:w-auto bg-gray-900 md:bg-transparent flex flex-col md:flex-row md:items-center space-y-6 md:space-y-0 md:space-x-6 px-6 md:px-0 transition-all duration-300 ease-in-out transform ${
            menuOpen
              ? "translate-x-0 opacity-100"
              : "-translate-x-full md:translate-x-0 opacity-0"
          }`}
        >
          <Link
            to="/laporan-hilangan"
            className="text-lg hover:text-yellow-500 transition-all duration-300 ease-in-out transform hover:scale-105"
            onClick={() => setMenuOpen(false)} // Tutup menu saat klik di mobile
          >
            Laporan Hilangan
          </Link>
          <Link
            to="/laporan-ditemukan"
            className="text-lg hover:text-yellow-500 transition-all duration-300 ease-in-out transform hover:scale-105"
            onClick={() => setMenuOpen(false)}
          >
            Laporan Ditemukan
          </Link>
          <Link
            to="/dashboard"
            className="text-lg hover:text-yellow-500 transition-all duration-300 ease-in-out transform hover:scale-105"
            onClick={() => setMenuOpen(false)}
          >
            Dashboard
          </Link>

          {user ? (
            <>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white py-2 px-6 rounded-lg shadow-lg hover:bg-red-600 transition-all duration-300 ease-in-out transform hover:scale-105"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/admin-login"
              className="bg-red-500 text-white py-2 px-6 rounded-lg shadow-lg hover:bg-red-600 transition-all duration-300 ease-in-out transform hover:scale-105"
              onClick={() => setMenuOpen(false)}
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
