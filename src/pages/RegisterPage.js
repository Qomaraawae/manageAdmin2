import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const isValidEmail = (email) => {
    if (!email || typeof email !== "string") return false;
    const trimmedEmail = email.trim();
    if (!trimmedEmail) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(trimmedEmail);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password, confirmPassword } = formData;
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    console.log("Register attempt:", {
      name: trimmedName,
      email: trimmedEmail,
    });

    if (!trimmedName) {
      toast.error("Nama tidak boleh kosong!", { position: "top-center" });
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      toast.error("Format email tidak valid!", { position: "top-center" });
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Password tidak cocok!", { position: "top-center" });
      return;
    }

    if (password.length < 6) {
      toast.error("Password harus minimal 6 karakter!", {
        position: "top-center",
      });
      return;
    }

    try {
      setLoading(true);
      await register(trimmedName, trimmedEmail, password);
      toast.success("Registrasi berhasil! Silakan login.", {
        position: "top-center",
      });
      navigate("/login");
    } catch (error) {
      console.error("Register error:", error);
      if (error.code === "auth/email-already-in-use") {
        toast.error("Email sudah terdaftar. Silakan gunakan email lain.", {
          position: "top-center",
        });
      } else if (error.code === "auth/invalid-email") {
        toast.error("Format email tidak valid.", { position: "top-center" });
      } else if (error.code === "auth/weak-password") {
        toast.error(
          "Password terlalu lemah. Harap gunakan password minimal 6 karakter.",
          { position: "top-center" }
        );
      } else {
        toast.error("Terjadi kesalahan saat registrasi: " + error.message, {
          position: "top-center",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Daftar Akun Baru
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Atau{" "}
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              masuk ke akun yang sudah ada
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="name" className="sr-only">
                Nama Lengkap
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="appearance-none rounded-t-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Nama Lengkap"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="email" className="sr-only">
                Alamat Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Alamat Email"
                value={formData.email}
                onChange={(e) => {
                  const { name, value } = e.target;
                  setFormData((prev) => ({
                    ...prev,
                    [name]: value,
                  }));
                  if (value && !isValidEmail(value)) {
                    toast.warn("Format email tidak valid!", {
                      position: "top-center",
                    });
                  }
                }}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="sr-only">
                Konfirmasi Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="appearance-none rounded-b-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Konfirmasi Password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
            >
              {loading ? "Memproses..." : "Daftar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
