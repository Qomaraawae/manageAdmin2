import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomeComponent from "./components/HomeComponent";
import LaporanHilangan from "./components/LaporanHilangan";
import LaporanTemuan from "./components/LaporanTemuan";
import AdminPage from "./pages/AdminPage";
import DashboardPage from "./pages/Dashboard";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./routes/AdminRoute";
import { ToastContainer } from "react-toastify";

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="bg-gradient-to-r from-blue-100 via-indigo-100 to-purple-100 min-h-screen font-sans text-gray-800">
          <Navbar />
          <div className="container mx-auto p-6">
            <Routes>
              <Route path="/" element={<HomeComponent />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/laporan-hilangan" element={<LaporanHilangan />} />
              <Route
                path="/laporan-ditemukan"
                element={
                  <PrivateRoute>
                    <LaporanTemuan />
                  </PrivateRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <DashboardPage />
                  </PrivateRoute>
                }
              />
              <Route path="/admin-login" element={<AdminPage />} />
            </Routes>
          </div>
          <ToastContainer />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
