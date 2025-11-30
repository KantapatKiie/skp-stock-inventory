import { QRCodeSVG } from "qrcode.react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Product } from "@/types";
import logoSkp from "@/assets/images/logo-skp.webp";

interface QRCodePrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
}

export default function QRCodePrintModal({
  isOpen,
  onClose,
  products,
}: QRCodePrintModalProps) {
  const { t } = useLanguage();

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const formatDate = () => {
    const now = new Date();
    return now.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 print:bg-white">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto print:max-w-full print:shadow-none print:m-0">
        {/* Header - ซ่อนตอนพิมพ์ */}
        <div className="p-6 border-b border-gray-200 print:hidden">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">
              {t("products.printQRCode")}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {t("products.printQRCodeDescription")} ({products.length}{" "}
            {t("products.items")})
          </p>
        </div>

        {/* Preview Area */}
        <div className="p-6 print:p-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 print:grid-cols-3 print:gap-2">
            {products.map((product) => {
              const categoryName =
                product.categories?.name || product.category?.name || "-";
              //   const qrData = JSON.stringify({
              //     id: product.id,
              //     sku: product.sku,
              //     barcode: product.barcode || product.sku,
              //     name: product.name,
              //     category: categoryName,
              //   });

              const qrData = product?.barcode || product?.sku || "";

              return (
                <div
                  key={product.id}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-white print:border-solid print:border-gray-400 print:page-break-inside-avoid"
                  style={{ minHeight: "320px" }}
                >
                  {/* Logo */}
                  <div className="flex justify-center mb-2">
                    <img 
                      src={logoSkp} 
                      alt="SKP Logo" 
                      className="h-12 w-auto object-contain"
                    />
                  </div>

                  {/* QR Code */}
                  <div className="flex justify-center mb-3">
                    <QRCodeSVG
                      value={qrData}
                      size={120}
                      level="H"
                      includeMargin={true}
                      className="print:w-32 print:h-32"
                    />
                  </div>

                  {/* Product Information */}
                  <div className="text-center space-y-1">
                    {/* SKU */}
                    <div className="font-mono text-lg font-bold text-gray-900">
                      {product.sku}
                    </div>

                    {/* Product Name */}
                    <div className="font-semibold text-sm text-gray-800 line-clamp-2">
                      {product.name}
                    </div>

                    {/* Category */}
                    <div className="text-xs text-gray-600">
                      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded">
                        {categoryName}
                      </span>
                    </div>

                    {/* Barcode */}
                    <div className="font-mono text-xs text-gray-700 mt-2 pt-2 border-t border-gray-200">
                      {product.barcode || product.sku}
                    </div>

                    {/* Unit */}
                    <div className="text-xs text-gray-500">
                      {t("products.unit")}: {product.unit}
                    </div>

                    {/* Print Date - แสดงเฉพาะตอนพิมพ์ */}
                    <div className="hidden print:block text-xs text-gray-400 mt-2 pt-2 border-t border-gray-200">
                      {formatDate()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions - ซ่อนตอนพิมพ์ */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 print:hidden">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            {t("common.cancel")}
          </button>
          <button
            onClick={handlePrint}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
            {t("products.print")}
          </button>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          
          @page {
            size: A4;
            margin: 10mm;
          }

          .print\\:page-break-inside-avoid {
            page-break-inside: avoid;
            break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
}
