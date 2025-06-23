import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  deleteReport,
  setupReportsListener,
  moveReportToReturned,
} from "../config/firestore";
import { toast } from "react-toastify";
import logger from "../utils/logger";
import "../output.css";

// Helper untuk format tanggal
const formatDate = (timestamp) => {
  if (!timestamp?.seconds) return "Tanggal tidak tersedia";
  return new Date(timestamp.seconds * 1000).toLocaleString();
};

// Komponen Modal untuk preview gambar
const ImagePreviewModal = ({ imageUrl, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="relative max-w-4xl max-h-[90vh]">
        <button
          className="absolute top-2 right-2 text-white text-2xl bg-gray-800 rounded-full w-8 h-8 flex items-center justify-center"
          onClick={onClose}
        >
          ×
        </button>
        <img
          src={imageUrl}
          alt="Preview"
          className="max-w-full max-h-[90vh] object-contain"
        />
      </div>
    </div>
  );
};

function Dashboard() {
  const { isAdmin, user } = useAuth();
  const [lostReports, setLostReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePopover, setActivePopover] = useState(null);
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });
  const [previewImage, setPreviewImage] = useState(null);

  // Realtime listeners
  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    const unsubscribeLost = setupReportsListener("lost_items", (data) => {
      logger.log("Lost reports updated:", data);
      setLostReports(data);
    });

    setLoading(false);

    return () => {
      unsubscribeLost();
    };
  }, [isAdmin]);

  // Tambahkan event listener untuk menutup popover ketika klik di luar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        activePopover &&
        !event.target.closest(".popover") &&
        !event.target.closest(".btn")
      ) {
        setActivePopover(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activePopover]);

  // Fungsi untuk toggle popover
  const togglePopover = (popoverId, event) => {
    if (event) {
      const buttonRect = event.currentTarget.getBoundingClientRect();
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;

      setPopoverPosition({
        top: buttonRect.top + scrollTop - 10,
        left: buttonRect.left + buttonRect.width / 2,
      });
    }

    setActivePopover(activePopover === popoverId ? null : popoverId);
  };

  // Fungsi hapus dengan popover
  const handleDelete = async (id, collectionName) => {
    try {
      await deleteReport(collectionName, id);
      setActivePopover(null);
      toast.success("Laporan berhasil dihapus!");
      logger.log(`Deleted report ${id} from ${collectionName}`);
    } catch (error) {
      logger.error("Delete error:", error.code, error.message);
      toast.error(`Gagal menghapus: ${error.message}`);
    }
  };

  // Fungsi konfirmasi barang ditemukan dengan popover
  const handleConfirmReturn = async (report) => {
    if (!isAdmin || !user?.uid) {
      toast.error("Akses ditolak: Anda bukan admin atau tidak login");
      logger.warn("Confirm attempt without admin access or user UID");
      return;
    }

    try {
      await moveReportToReturned(report, user.uid);
      setActivePopover(null);
      toast.success("Barang berhasil dikonfirmasi sebagai ditemukan!");
      logger.log(`Confirmed report ${report.id} by admin ${user.uid}`);
    } catch (error) {
      logger.error("Confirmation error:", error.code, error.message);
      toast.error(`Gagal mengkonfirmasi: ${error.message}`);
    }
  };

  // Fungsi untuk membuka preview gambar
  const handleImageClick = (imageUrl) => {
    setPreviewImage(imageUrl);
  };

  // Fungsi untuk menutup preview gambar
  const handleClosePreview = () => {
    setPreviewImage(null);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>Memuat data...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="access-denied">
        <h2>Akses Ditolak</h2>
        <p>Hanya admin yang dapat mengakses dashboard ini.</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Dashboard</h2>

      {/* Laporan Barang Hilang */}
      <div className="dashboard-section">
        <div className="section-header">
          <h3>Laporan Barang Hilang</h3>
          <span className="item-count">{lostReports.length} barang</span>
        </div>

        {lostReports.length === 0 ? (
          <div className="empty-state">
            <p>Belum ada laporan barang hilang</p>
          </div>
        ) : (
          <div className="reports-grid">
            {lostReports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                onDelete={(e) => togglePopover(`delete-${report.id}`, e)}
                onConfirm={(e) => togglePopover(`confirm-${report.id}`, e)}
                isAdmin={isAdmin}
                type="lost"
                onImageClick={handleImageClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal Preview Gambar */}
      {previewImage && (
        <ImagePreviewModal
          imageUrl={previewImage}
          onClose={handleClosePreview}
        />
      )}

      {/* Floating Popovers */}
      {activePopover && activePopover.startsWith("confirm-") && (
        <div
          className="popover floating-popover confirm-popover"
          style={{
            top: `${popoverPosition.top}px`,
            left: `${popoverPosition.left}px`,
          }}
        >
          <div className="popover-header">
            <i className="fas fa-info-circle"></i>
            <h5>Konfirmasi Barang</h5>
            <button
              className="close-btn"
              onClick={() => setActivePopover(null)}
            >
              ×
            </button>
          </div>
          <div className="popover-body">
            <p>Apakah Anda yakin barang ini telah ditemukan?</p>
            <p>Barang akan dipindahkan ke laporan barang ditemukan.</p>
          </div>
          <div className="popover-footer">
            <button
              className="btn cancel-btn"
              onClick={() => setActivePopover(null)}
            >
              Batal
            </button>
            <button
              className="btn confirm-action-btn"
              onClick={() =>
                handleConfirmReturn(
                  lostReports.find(
                    (report) => `confirm-${report.id}` === activePopover
                  )
                )
              }
            >
              <i className="fas fa-check"></i> Ya, Konfirmasi
            </button>
          </div>
        </div>
      )}

      {activePopover && activePopover.startsWith("delete-") && (
        <div
          className="popover floating-popover delete-popover"
          style={{
            top: `${popoverPosition.top}px`,
            left: `${popoverPosition.left}px`,
          }}
        >
          <div className="popover-header">
            <i className="fas fa-exclamation-triangle"></i>
            <h5>Hapus Laporan</h5>
            <button
              className="close-btn"
              onClick={() => setActivePopover(null)}
            >
              ×
            </button>
          </div>
          <div className="popover-body">
            <p>Apakah Anda yakin ingin menghapus laporan ini?</p>
            <p className="warning-text">Tindakan ini tidak dapat dibatalkan!</p>
          </div>
          <div className="popover-footer">
            <button
              className="btn cancel-btn"
              onClick={() => setActivePopover(null)}
            >
              Batal
            </button>
            <button
              className="btn delete-action-btn"
              onClick={() => {
                const id = activePopover.split("-")[1];
                const isLostItem = lostReports.some(
                  (report) => report.id === id
                );
                handleDelete(id, isLostItem ? "lost_items" : "returned_items");
              }}
            >
              <i className="fas fa-trash"></i> Ya, Hapus
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Komponen Card yang bisa dipakai ulang
const ReportCard = ({
  report,
  onDelete,
  onConfirm,
  isAdmin,
  type,
  onImageClick,
}) => {
  return (
    <div className={`report-card ${type}`}>
      <div className="card-header">
        <h4 className="item-name">{report.namaBarang || "Tanpa Nama"}</h4>
        <span className={`status-badge ${type}`}>
          {type === "lost" ? "Hilang" : "Ditemukan"}
        </span>
      </div>

      <div className="card-content">
        <div className="info-row">
          <span className="info-label">Kategori:</span>
          <span className="info-value">{report.kategori || "-"}</span>
        </div>

        <div className="info-row">
          <span className="info-label">Deskripsi:</span>
          <span className="info-value description">
            {report.deskripsi || "-"}
          </span>
        </div>

        <div className="info-row">
          <span className="info-label">Dilaporkan:</span>
          <span className="info-value date">{formatDate(report.tanggal)}</span>
        </div>
      </div>

      {report.foto && (
        <div className="card-image">
          <img
            src={report.foto}
            alt="Foto barang"
            className="cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => onImageClick(report.foto)}
          />
        </div>
      )}

      {isAdmin && (
        <div className="card-actions">
          <button className="btn confirm-btn" onClick={onConfirm}>
            <i className="fas fa-check-circle"></i> Konfirmasi Barang
          </button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
