import { useTranslation } from "react-i18next";
import { useState } from "react";
import type { MaterialReceipt, ShipmentOrder } from "../../../types/orders";

const mockReceipts: MaterialReceipt[] = [
  {
    invoiceNumber: "INV-2025-001",
    author: "Иван Петров",
    expectedDate: "25.11.2025",
    status: "PENDING",
  },
  {
    invoiceNumber: "INV-2025-002",
    author: "Мария Сидорова",
    expectedDate: "28.11.2025",
    status: "PENDING",
  },
  {
    invoiceNumber: "INV-2025-003",
    author: "Алексей Иванов",
    expectedDate: "30.11.2025",
    status: "PENDING",
  },
];

const mockShipmentOrders: ShipmentOrder[] = [
  {
    id: "ORD-2025-001",
    clientName: "Иван Петров",
    name: "Комплект панелей для стенда",
    material: "Нержавеющая сталь 2мм",
    expectedDate: "25.11.2025",
    status: "READY",
  },
  {
    id: "ORD-2025-002",
    clientName: "Мария Сидорова",
    name: "Логотип из нержавейки 600×300",
    material: "Алюминий 3мм",
    expectedDate: "28.11.2025",
    status: "READY",
  },
  {
    id: "ORD-2025-003",
    clientName: "Алексей Иванов",
    name: "Набор декоративных панелей",
    material: "Пластик 5мм",
    expectedDate: "30.11.2025",
    status: "READY",
  },
];

function WarehouseDashboard() {
  const { t } = useTranslation();
  const [receipts] = useState<MaterialReceipt[]>(mockReceipts);
  const [shipmentOrders] = useState<ShipmentOrder[]>(mockShipmentOrders);

  // TODO: Загрузка данных с API
  // useEffect(() => {
  //   fetchReceipts().then(setReceipts);
  //   fetchShipmentOrders().then(setShipmentOrders);
  // }, []);

  const handleRegisterReceipt = (invoiceNumber: string) => {
    // TODO: Отправка запроса на сервер о регистрации поступления
    console.log(`Registering receipt: ${invoiceNumber}`);
  };

  const handleProcessShipment = (orderId: string) => {
    // TODO: Отправка запроса на сервер об оформлении отгрузки
    console.log(`Processing shipment for order: ${orderId}`);
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-stone-950 text-white px-4 py-10 flex justify-center">
      <div className="w-full max-w-7xl space-y-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {t("warehouse.dashboard")}
          </h1>
        </div>

        <section className="rounded-3xl border border-gray-800 bg-stone-900/80 shadow-[0_0_40px_rgba(0,0,0,0.5)] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              {t("warehouse.materialReceipts")}
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border-separate border-spacing-y-2">
              <thead>
              <tr className="text-xs uppercase text-gray-500">
                <th className="text-left px-3 pb-2">
                  {t("warehouse.invoiceNumber")}
                </th>
                <th className="text-left px-3 pb-2">
                  {t("warehouse.author")}
                </th>
                <th className="text-left px-3 pb-2">
                  {t("warehouse.expectedDate")}
                </th>
                <th className="text-right px-3 pb-2">
                  {t("profile.orderActions")}
                </th>
              </tr>
              </thead>
              <tbody>
              {receipts.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-3 py-8 text-center text-gray-500"
                  >
                    {t("warehouse.noReceipts")}
                  </td>
                </tr>
              ) : (
                receipts.map((receipt) => (
                  <tr key={receipt.invoiceNumber}>
                    <td className="px-3 py-3">
                      <div className="text-sm font-medium">
                        {receipt.invoiceNumber}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-300">
                      {receipt.author}
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-300">
                      {receipt.expectedDate}
                    </td>
                    <td className="px-3 py-3 text-right">
                      <button
                        onClick={() =>
                          handleRegisterReceipt(receipt.invoiceNumber)
                        }
                        className="text-xs rounded-full border border-gray-700 px-3 py-1 hover:bg-gray-800 transition-colors"
                      >
                        {t("warehouse.registerReceipt")}
                      </button>
                    </td>
                  </tr>
                ))
              )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-3xl border border-gray-800 bg-stone-900/80 shadow-[0_0_40px_rgba(0,0,0,0.5)] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              {t("warehouse.ordersReadyForShipment")}
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border-separate border-spacing-y-2">
              <thead>
              <tr className="text-xs uppercase text-gray-500">
                <th className="text-left px-3 pb-2">
                  {t("warehouse.order")}
                </th>
                <th className="text-left px-3 pb-2">
                  {t("warehouse.client")}
                </th>
                <th className="text-left px-3 pb-2">
                  {t("warehouse.material")}
                </th>
                <th className="text-left px-3 pb-2">
                  {t("warehouse.expectedDate")}
                </th>
                <th className="text-right px-3 pb-2">
                  {t("profile.orderActions")}
                </th>
              </tr>
              </thead>
              <tbody>
              {shipmentOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-3 py-8 text-center text-gray-500"
                  >
                    {t("warehouse.noOrders")}
                  </td>
                </tr>
              ) : (
                shipmentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-3 py-3">
                      <div className="text-sm font-medium">{order.name}</div>
                      <div className="text-xs text-gray-500">№ {order.id}</div>
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-300">
                      {order.clientName}
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-300">
                      {order.material}
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-300">
                      {order.expectedDate}
                    </td>
                    <td className="px-3 py-3 text-right">
                      <button
                        onClick={() => handleProcessShipment(order.id)}
                        className="text-xs rounded-full border border-gray-700 px-3 py-1 hover:bg-gray-800 transition-colors"
                      >
                        {t("warehouse.processShipment")}
                      </button>
                    </td>
                  </tr>
                ))
              )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

export default WarehouseDashboard;
