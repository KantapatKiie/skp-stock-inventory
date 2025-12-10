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
          {/* ตัวเลือกขนาดพิมพ์ - ซ่อนตอนพิมพ์ */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border print:hidden">
            <h3 className="font-semibold text-blue-900 mb-3">
              📏 {t("products.printSettings")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-green-500 rounded"></span>
                <span>ขนาด: 5 x 3.5 cm (แนะนำ)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-blue-500 rounded"></span>
                <span>ระยะสแกน: 30-60 cm</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-orange-500 rounded"></span>
                <span>เหมาะสำหรับ: ติดป้าย/เคาน์เตอร์</span>
              </div>
            </div>
          </div>

          {/* พื้นที่พิมพ์ปรับปรุงใหม่ */}
          <div className="print:grid print:grid-cols-4 print:gap-3 print:p-4">
            {/* สำหรับหน้าจอ Preview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
              {products.map((product) => {
                const categoryName =
                  product.categories?.name || product.category?.name || "-";
                const qrData = product?.barcode || product?.sku || "";

                return (
                  <div
                    key={product.id}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-3 bg-white"
                    style={{ minHeight: "280px" }}
                  >
                    {/* Logo */}
                    <div className="flex justify-center mb-2">
                      <img 
                        src={logoSkp} 
                        alt="SKP Logo" 
                        className="h-8 w-auto object-contain"
                      />
                    </div>

                    {/* QR Code */}
                    <div className="flex justify-center mb-2">
                      <QRCodeSVG
                        value={qrData}
                        size={100}
                        level="H"
                        includeMargin={true}
                      />
                    </div>

                    {/* Product Information */}
                    <div className="text-center space-y-1">
                      {/* SKU */}
                      <div className="font-mono text-sm font-bold text-gray-900">
                        {product.sku}
                      </div>

                      {/* Product Name */}
                      <div className="font-semibold text-xs text-gray-800 line-clamp-2 leading-tight">
                        {product.name}
                      </div>

                      {/* Category */}
                      <div className="text-xs text-gray-600">
                        <span className="inline-block px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                          {categoryName}
                        </span>
                      </div>

                      {/* Unit */}
                      <div className="text-xs text-gray-500">
                        {product.unit}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* สำหรับการพิมพ์จริง - ขนาดที่เหมาะสม */}
            {products.map((product) => {
              const categoryName =
                product.categories?.name || product.category?.name || "-";
              const qrData = product?.barcode || product?.sku || "";

              return (
                <div
                  key={`print-${product.id}`}
                  className="hidden print:block print:border print:border-gray-800 print:bg-white print:page-break-inside-avoid"
                  style={{
                    width: "5cm",
                    height: "3.5cm", 
                    padding: "2mm",
                    margin: "1mm"
                  }}
                >
                  {/* Logo - เล็กลง */}
                  <div className="print:flex print:justify-center print:mb-1">
                    <img 
                      src={logoSkp} 
                      alt="SKP" 
                      style={{ height: "8mm", width: "auto" }}
                    />
                  </div>

                  {/* QR Code - ขนาดเหมาะสำหรับสแกน */}
                  <div className="print:flex print:justify-center print:mb-1">
                    <QRCodeSVG
                      value={qrData}
                      size={60} // ประมาณ 2.1cm - เหมาะสำหรับสแกนระยะ 30-60cm
                      level="H"
                      includeMargin={false}
                    />
                  </div>

                  {/* ข้อมูลสินค้าแบบกะทัดรัด */}
                  <div 
                    className="print:text-center"
                    style={{ fontSize: "6pt", lineHeight: "1.1" }}
                  >
                    {/* SKU */}
                    <div 
                      className="print:font-bold print:text-black"
                      style={{ fontSize: "7pt", marginBottom: "0.5mm" }}
                    >
                      {product.sku}
                    </div>

                    {/* Product Name - ย่อให้พอดี */}
                    <div 
                      className="print:text-black"
                      style={{ 
                        fontSize: "5pt", 
                        maxHeight: "6mm",
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical"
                      }}
                    >
                      {product.name.length > 40 ? 
                        product.name.substring(0, 40) + "..." : 
                        product.name
                      }
                    </div>

                    {/* Barcode/Unit */}
                    <div 
                      className="print:text-gray-600"
                      style={{ fontSize: "4pt", marginTop: "0.5mm" }}
                    >
                      {product.barcode || product.sku} • {product.unit}
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
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          body {
            margin: 0;
            padding: 0;
          }
          
          @page {
            size: A4;
            margin: 5mm;
          }

          /* จัดการแบ่งหน้าแบบสมดุล */
          .print\\:page-break-inside-avoid {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }

          /* จัดตำแหน่งให้สมดุลในหน้า A4 */
          .print\\:grid-cols-4 {
            display: grid !important;
            grid-template-columns: repeat(4, 1fr) !important;
            gap: 3mm !important;
            padding: 5mm !important;
            justify-content: space-evenly !important;
          }

          /* ขนาดพื้นที่พิมพ์แต่ละช่อง */
          .print\\:border {
            border: 1px solid #000 !important;
          }

          .print\\:bg-white {
            background: white !important;
          }

          .print\\:text-center {
            text-align: center !important;
          }

          .print\\:text-black {
            color: #000 !important;
          }

          .print\\:text-gray-600 {
            color: #666 !important;
          }

          .print\\:font-bold {
            font-weight: bold !important;
          }

          .print\\:flex {
            display: flex !important;
          }

          .print\\:justify-center {
            justify-content: center !important;
          }

          .print\\:mb-1 {
            margin-bottom: 1mm !important;
          }

          /* ซ่อนส่วนที่ไม่ต้องการตอนพิมพ์ */
          .print\\:hidden {
            display: none !important;
          }

          .print\\:block {
            display: block !important;
          }

          /* ปรับขนาดให้พอดีกับ A4 - 16 ช่องต่อหน้า (4x4) */
          /* ขนาดจริง 5cm x 3.5cm */
          [style*="width: 5cm"] {
            width: 5cm !important;
            height: 3.5cm !important;
          }
        }

        /* สำหรับการ Preview บนหน้าจอ */
        @media screen {
          .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        }
      `}</style>
    </div>
  );
}
