import { useTranslation } from "react-i18next";
import { useState } from "react";
import type { DesignerOrder } from "../../../types/orders";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import DownloadIcon from "@mui/icons-material/Download";

// const statusLabelKeys: Record<OrderStatus, string> = {
//   REQUEST: "profile.request",
//   CREATED: "profile.created",
//   PROCESSING: "profile.processing",
//   ON_APPROVAL: "profile.onApproval",
//   REVISION: "profile.revision",
//   APPROVED: "profile.approved",
//   WAITING_PAYMENT: "profile.waitingPayment",
//   PAID: "profile.paid",
//   READY_FOR_PRODUCTION: "profile.readyForProduction",
//   IN_PRODUCTION: "profile.inProduction",
//   COMPLETED: "profile.completed",
//   CANCELLED: "profile.cancelled",
// };
//
// const statusStyles: Record<OrderStatus, string> = {
//   REQUEST: "bg-sky-500/10 text-sky-300 ring-sky-500/40",
//   CREATED: "bg-sky-500/10 text-sky-300 ring-sky-500/40",
//   PROCESSING: "bg-indigo-500/10 text-indigo-300 ring-indigo-500/40",
//   ON_APPROVAL: "bg-amber-500/10 text-amber-300 ring-amber-500/40",
//   REVISION: "bg-orange-500/10 text-orange-300 ring-orange-500/40",
//   APPROVED: "bg-emerald-500/10 text-emerald-300 ring-emerald-500/40",
//   WAITING_PAYMENT: "bg-yellow-500/10 text-yellow-300 ring-yellow-500/40",
//   PAID: "bg-green-500/10 text-green-300 ring-green-500/40",
//   READY_FOR_PRODUCTION: "bg-cyan-500/10 text-cyan-300 ring-cyan-500/40",
//   IN_PRODUCTION: "bg-purple-500/10 text-purple-300 ring-purple-500/40",
//   COMPLETED: "bg-emerald-500/10 text-emerald-300 ring-emerald-500/40",
//   CANCELLED: "bg-red-500/10 text-red-300 ring-red-500/40",
// };

const mockOrders: DesignerOrder[] = [
  {
    id: "ORD-2025-001",
    name: "Комплект панелей для стенда",
    clientName: "Иван Петров",
    orderDate: "12.11.2025",
    expectedDate: "25.11.2025",
    status: "PROCESSING",
    attachedFiles: ["specification.pdf", "sketch.dwg"],
  },
  {
    id: "ORD-2025-002",
    name: "Логотип из нержавейки 600×300",
    clientName: "Мария Сидорова",
    orderDate: "18.11.2025",
    expectedDate: "30.11.2025",
    status: "ON_APPROVAL",
    attachedFiles: ["logo.png", "requirements.docx"],
  },
  {
    id: "ORD-2025-003",
    name: "Набор декоративных панелей",
    clientName: "Алексей Иванов",
    orderDate: "20.11.2025",
    expectedDate: "05.12.2025",
    status: "REVISION",
    attachedFiles: ["design.pdf"],
  },
];

function DesignerDashboard() {
  const { t } = useTranslation();
  const [orders] = useState<DesignerOrder[]>(mockOrders);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  // TODO: Загрузка данных с API
  // useEffect(() => {
  //   fetchOrders().then(setOrders);
  // }, []);

  const toggleOrder = (orderId: string) => {
    setExpandedOrders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const handle3DModelUpload = (orderId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // TODO: Загрузка файла на сервер
      console.log(`Uploading 3D model for order ${orderId}:`, file.name);
    }
    event.target.value = "";
  };

  const handleUPGenerate = (orderId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // TODO: Генерация и загрузка УП
      console.log(`Generating UP for order ${orderId}:`, file.name);
    }
    event.target.value = "";
  };

  const handleFileDownload = (fileName: string) => {
    // TODO: Реализовать скачивание файла
    console.log(`Downloading file: ${fileName}`);
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-stone-950 text-white px-4 py-10 flex justify-center">
      <div className="w-full max-w-7xl space-y-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {t("designer.dashboard")}
          </h1>
        </div>

        <section className="rounded-3xl border border-gray-800 bg-stone-900/80 shadow-[0_0_40px_rgba(0,0,0,0.5)] p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">
                {t("designer.ordersForDesign")}
              </h2>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border-separate border-spacing-y-2">
              <thead>
                <tr className="text-xs uppercase text-gray-500">
                  <th className="text-left px-3 pb-2">{t("manager.order")}</th>
                  <th className="text-left px-3 pb-2">{t("manager.client")}</th>
                  <th className="text-right px-3 pb-2"></th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-3 py-8 text-center text-gray-500"
                    >
                      {t("designer.noOrders")}
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => {
                    const isExpanded = expandedOrders.has(order.id);
                    return (
                      <>
                        <tr
                          key={order.id}
                          onClick={() => toggleOrder(order.id)}
                          className="cursor-pointer hover:bg-gray-800/50 transition-colors"
                        >
                          <td className="px-3 py-3">
                            <div className="text-sm font-medium">{order.name}</div>
                            <div className="text-xs text-gray-500">№ {order.id}</div>
                          </td>
                          <td className="px-3 py-3 text-sm text-gray-300">
                            {order.clientName}
                          </td>
                          <td className="px-3 py-3 text-right">
                            {isExpanded ? (
                              <ExpandLessIcon className="text-gray-400" />
                            ) : (
                              <ExpandMoreIcon className="text-gray-400" />
                            )}
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr key={`${order.id}-details`}>
                            <td colSpan={3} className="px-3 py-4">
                              <div className="bg-stone-800/50 rounded-xl p-6 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <div className="text-xs text-gray-500 mb-1">
                                      {t("designer.orderDate")}
                                    </div>
                                    <div className="text-sm text-white">
                                      {order.orderDate}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-xs text-gray-500 mb-1">
                                      {t("designer.expectedDate")}
                                    </div>
                                    <div className="text-sm text-white">
                                      {order.expectedDate}
                                    </div>
                                  </div>
                                </div>

                                {order.attachedFiles.length > 0 && (
                                  <div>
                                    <div className="text-xs text-gray-500 mb-2">
                                      {t("designer.attachedFiles")}
                                    </div>
                                    <div className="space-y-2">
                                      {order.attachedFiles.map((fileName, index) => (
                                        <div
                                          key={index}
                                          className="flex items-center justify-between bg-stone-700/50 rounded-lg px-3 py-2"
                                        >
                                          <span className="text-sm text-gray-300">
                                            {fileName}
                                          </span>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleFileDownload(fileName);
                                            }}
                                            className="text-gray-400 hover:text-white transition-colors"
                                          >
                                            <DownloadIcon fontSize="small" />
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                <div className="flex gap-4 pt-2">
                                  <label className="flex-1">
                                    <input
                                      type="file"
                                      accept=".stl,.obj,.3ds,.step,.iges"
                                      onChange={(e) => handle3DModelUpload(order.id, e)}
                                      className="hidden"
                                    />
                                    <span className="block w-full rounded-full bg-white text-black text-sm font-medium py-2.5 text-center hover:bg-gray-200 transition-colors cursor-pointer">
                                      {t("designer.upload3DModel")}
                                    </span>
                                  </label>
                                  <label className="flex-1">
                                    <input
                                      type="file"
                                      accept=".nc,.cnc,.tap"
                                      onChange={(e) => handleUPGenerate(order.id, e)}
                                      className="hidden"
                                    />
                                    <span className="block w-full rounded-full bg-stone-950 text-white border border-gray-700 text-sm font-medium py-2.5 text-center hover:bg-gray-900 transition-colors cursor-pointer">
                                      {t("designer.generateUP")}
                                    </span>
                                  </label>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

export default DesignerDashboard;

