import { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import LoadingSpinner from './LoadingSpinner';

export default function QRScannerModal({ onClose, onScanSuccess }) {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    let scanner = null;

    // Menggunakan setTimeout untuk menghindari masalah double-mounting 
    // pada React 18 Strict Mode yang menyebabkan dua kamera muncul sekaligus.
    const timer = setTimeout(() => {
      scanner = new Html5QrcodeScanner(
        'qr-reader',
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        false
      );

      const handleSuccess = (decodedText) => {
        scanner.clear().then(() => {
          onScanSuccess(decodedText);
        }).catch(console.error);
      };

      const handleError = (err) => {
        // Abaikan error frame tidak menemukan QR code
      };

      scanner.render(handleSuccess, handleError);
    }, 150); // Jeda singkat

    return () => {
      clearTimeout(timer);
      if (scanner) {
        scanner.clear().catch(console.error);
      }
    };
  }, [onScanSuccess]);

  const handleCloseModal = () => {
    setIsClosing(true);
    // Unmount akan memicu fungsi cleanup di useEffect, yang memanggil scanner.clear()
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[100] flex flex-col items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 relative shadow-2xl animate-slide-up flex flex-col max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={handleCloseModal}
          disabled={isClosing}
          className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors p-2 disabled:opacity-50"
          aria-label="Tutup Scanner"
        >
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-4 shrink-0">
          <h3 className="font-bold text-gray-900 text-lg">Scan QR Code Barang</h3>
          <p className="text-sm text-gray-500 mt-1">
            Posisikan kode QR di dalam area scan untuk mengubah status atau mencari barang.
          </p>
        </div>

        {/* Wrapper QR Reader */}
        <div className="flex-1 overflow-y-auto w-full relative min-h-[300px]">
          <div 
            id="qr-reader" 
            className="w-full overflow-hidden rounded-xl border-2 border-gray-100 bg-gray-50"
          ></div>
        </div>

        <div className="mt-6 shrink-0">
          <button onClick={handleCloseModal} disabled={isClosing} className="btn-secondary w-full">
            {isClosing ? <LoadingSpinner size="sm" color="gray-500" /> : 'Batal Scan'}
          </button>
        </div>
      </div>
      
      <style jsx="true">{`
        #qr-reader {
          border: none !important;
        }
        #qr-reader button {
          background-color: #0f172a !important; /* primary color */
          color: white !important;
          border-radius: 0.5rem !important;
          padding: 0.5rem 1rem !important;
          font-weight: 600 !important;
          font-size: 0.875rem !important;
          border: none !important;
          margin-top: 1rem !important;
          margin-bottom: 1rem !important;
        }
        #qr-reader__dashboard_section_csr span {
          color: #64748b !important;
          font-size: 0.875rem !important;
        }
        #qr-reader select {
          padding: 0.5rem !important;
          border-radius: 0.5rem !important;
          border: 1px solid #e2e8f0 !important;
          margin-bottom: 1rem !important;
        }
        #qr-reader__dashboard_section_swaplink {
          text-decoration: none !important;
          color: #3b82f6 !important;
        }
      `}</style>
    </div>
  );
}
