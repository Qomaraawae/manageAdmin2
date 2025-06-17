import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  deleteReport,
  setupReportsListener,
  moveReportToReturned,
} from "../config/firestore";
import { toast } from "react-toastify";
import "../output.css";

// Helper untuk format tanggal
const formatDate = (timestamp) => {
  if (!timestamp?.seconds) return "Tanggal tidak tersedia";
  return new Date(timestamp.seconds * 1000).toLocaleString();
};

function Dashboard() {
  const { isAdmin } = useAuth();
  const [lostReports, setLostReports] = useState([]);
  const [returnedReports, setReturnedReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePopover, setActivePopover] = useState(null);
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });

  // Realtime listeners
  useEffect(() => {
    const unsubscribeLost = setupReportsListener("lost_items", setLostReports);
    const unsubscribeReturned = setupReportsListener(
      "returned_items",
      setReturnedReports
    );

    setLoading(false);

    return () => {
      unsubscribeLost();
      unsubscribeReturned();
    };
  }, []);

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
        top: buttonRect.top + scrollTop - 10, // Posisi di atas tombol
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
    } catch (error) {
      toast.error(`Gagal menghapus: ${error.message}`);
      console.error("Delete error:", error);
    }
  };

  // Fungsi konfirmasi barang ditemukan dengan popover
  const handleConfirmReturn = async (report) => {
    try {
      await moveReportToReturned(report);
      setActivePopover(null);
      toast.success("Barang berhasil dikonfirmasi sebagai ditemukan!");
    } catch (error) {
      toast.error(`Gagal mengkonfirmasi: ${error.message}`);
      console.error("Confirmation error:", error);
    }
  };

  if (loading)
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>Memuat data...</p>
      </div>
    );

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
              />
            ))}
          </div>
        )}
      </div>

      {/* Laporan Barang Dikembalikan */}
      <div className="dashboard-section">
        <div className="section-header">
          <h3>Laporan Barang Ditemukan</h3>
          <span className="item-count">{returnedReports.length} barang</span>
        </div>

        {returnedReports.length === 0 ? (
          <div className="empty-state">
            <p>Belum ada laporan barang yang ditemukan</p>
          </div>
        ) : (
          <div className="reports-grid">
            {returnedReports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                onDelete={(e) => togglePopover(`delete-${report.id}`, e)}
                isAdmin={isAdmin}
                showReturnDate
                type="returned"
              />
            ))}
          </div>
        )}
      </div>

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
  showReturnDate,
  type,
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
          <span className="info-label">
            {showReturnDate ? "Dikembalikan:" : "Dilaporkan:"}
          </span>
          <span className="info-value date">
            {showReturnDate
              ? formatDate(report.returnedAt)
              : formatDate(report.tanggal)}
          </span>
        </div>
      </div>

      {report.foto && (
        <div className="card-image">
          <img src={report.foto} alt="Foto barang" />
        </div>
      )}

      {isAdmin && (
        <div className="card-actions">
          {!showReturnDate && (
            <button className="btn confirm-btn" onClick={onConfirm}>
              <i className="fas fa-check-circle"></i> Konfirmasi Barang
            </button>
          )}

          <button className="btn delete-btn" onClick={onDelete}>
            <i className="fas fa-trash"></i> Hapus Laporan
          </button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
