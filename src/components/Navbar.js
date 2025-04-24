import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { auth } from "../config/firebase";
import { Menu, X } from "lucide-react";

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
    setMenuOpen(false);
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <nav className="bg-gray-900 text-white p-4 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-extrabold text-yellow-400 hover:text-yellow-500 transition-colors duration-300"
          onClick={() => setMenuOpen(false)}
        >
          Laporan Kehilangan
        </Link>

        {/* Tombol Hamburger untuk Mobile */}
        <button
          className="md:hidden text-white focus:outline-none"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* Menu Desktop */}
        <div className="hidden md:flex items-center space-x-6">
          <Link
            to="/laporan-hilangan"
            className="text-lg hover:text-yellow-500 transition-all duration-300"
          >
            Laporan Hilangan
          </Link>
          <Link
            to="/dashboard"
            className="text-lg hover:text-yellow-500 transition-all duration-300"
          >
            Dashboard
          </Link>

          {user ? (
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white py-2 px-6 rounded-lg hover:bg-red-600 transition-all duration-300"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/admin-login"
              className="bg-red-500 text-white py-2 px-6 rounded-lg hover:bg-red-600 transition-all duration-300"
            >
              Login
            </Link>
          )}
        </div>

        {/* Menu Mobile */}
        {menuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-gray-900 w-full px-6 py-4 shadow-lg">
            <div className="flex flex-col space-y-4">
              <Link
                to="/laporan-hilangan"
                className="text-lg hover:text-yellow-500 py-2 transition-all duration-300"
                onClick={() => setMenuOpen(false)}
              >
                Laporan Hilangan
              </Link>
              <Link
                to="/laporan-ditemukan"
                className="text-lg hover:text-yellow-500 py-2 transition-all duration-300"
                onClick={() => setMenuOpen(false)}
              >
                Laporan Ditemukan
              </Link>
              <Link
                to="/dashboard"
                className="text-lg hover:text-yellow-500 py-2 transition-all duration-300"
                onClick={() => setMenuOpen(false)}
              >
                Dashboard
              </Link>

              {user ? (
                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white py-2 px-6 rounded-lg hover:bg-red-600 transition-all duration-300 w-full text-left"
                >
                  Logout
                </button>
              ) : (
                <Link
                  to="/admin-login"
                  className="bg-red-500 text-white py-2 px-6 rounded-lg hover:bg-red-600 transition-all duration-300 w-full text-center"
                  onClick={() => setMenuOpen(false)}
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
