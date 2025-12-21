import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { purchaseOrdersService, ordersService, designsService, materialsService, extractApiError } from "../../../services/api";
import type { PurchaseOrderResponseDto } from "../../../services/api/purchaseOrders.service";
import type { ClientOrderResponseDto } from "../../../services/api/types";
import DeleteIcon from "@mui/icons-material/Delete";

function WarehouseDashboard() {
  const { t } = useTranslation();
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrderResponseDto[]>([]);
  const [readyOrders, setReadyOrders] = useState<ClientOrderResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedPurchaseOrder, setSelectedPurchaseOrder] = useState<PurchaseOrderResponseDto | null>(null);
  const [receiptInvoiceNumber, setReceiptInvoiceNumber] = useState("");
  const [receiptItems, setReceiptItems] = useState<Array<{ materialId: number; amount: number; originalAmount: number }>>([]);
  const [showShipmentModal, setShowShipmentModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<ClientOrderResponseDto | null>(null);
  const [shipmentMaterials, setShipmentMaterials] = useState<Array<{ materialId: number; materialName: string; amount: number; originalAmount: number }>>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const purchaseOrdersData = await purchaseOrdersService.getPurchaseOrders({
          status: 'CREATED',
        });
        setPurchaseOrders(purchaseOrdersData);

        const ordersData = await ordersService.getOrders({
          status: 'READY_FOR_PRODUCTION',
        });
        setReadyOrders(ordersData);
      } catch (err) {
        const apiError = extractApiError(err);
        setError(apiError.message || 'Ошибка загрузки данных');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const handleRegisterReceipt = async (purchaseOrderId: number) => {
    try {
      const order = purchaseOrders.find(po => po.id === purchaseOrderId);
      if (!order) return;

      setSelectedPurchaseOrder(order);
      setReceiptInvoiceNumber("");
      setReceiptItems(
        order.materials.map(m => ({
          materialId: m.materialId,
          amount: m.amount,
          originalAmount: m.amount,
        }))
      );
      setShowReceiptModal(true);
    } catch (err) {
      const apiError = extractApiError(err);
      setError(apiError.message || 'Ошибка открытия формы регистрации поступления');
    }
  };

  const handleSaveReceipt = async () => {
    if (!selectedPurchaseOrder || !receiptInvoiceNumber.trim()) {
      setError('Заполните номер накладной');
      return;
    }

    if (receiptItems.length === 0) {
      setError('Добавьте хотя бы один материал');
      return;
    }

    try {
      setError(null);
      await purchaseOrdersService.registerReceipt(selectedPurchaseOrder.id, {
        invoiceNumber: receiptInvoiceNumber,
        receivedItems: receiptItems.map(item => ({
          materialId: item.materialId,
          amount: item.amount,
        })),
      });

      setShowReceiptModal(false);
      setSelectedPurchaseOrder(null);
      setReceiptInvoiceNumber("");
      setReceiptItems([]);

      const purchaseOrdersData = await purchaseOrdersService.getPurchaseOrders({
        status: 'CREATED',
      });
      setPurchaseOrders(purchaseOrdersData);
    } catch (err) {
      const apiError = extractApiError(err);
      setError(apiError.message || 'Ошибка регистрации поступления');
    }
  };

  const handleRemoveReceiptItem = (index: number) => {
    setReceiptItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleProcessShipment = async (orderId: number) => {
    try {
      const order = readyOrders.find(o => o.id === orderId);
      if (!order) return;

      setSelectedOrder(order);

      if (order.productDesignId) {
        const design = await designsService.getDesignById(order.productDesignId);
        const materialsWithNames = await Promise.all(
          design.requiredMaterials.map(async (rm) => {
            try {
              const material = await materialsService.getMaterialById(rm.materialId);
              return {
                materialId: rm.materialId,
                materialName: material.name,
                amount: rm.amount,
                originalAmount: rm.amount,
              };
            } catch {
              return {
                materialId: rm.materialId,
                materialName: `Материал #${rm.materialId}`,
                amount: rm.amount,
                originalAmount: rm.amount,
              };
            }
          })
        );
        setShipmentMaterials(materialsWithNames);
      } else {
        setShipmentMaterials([]);
      }

      setShowShipmentModal(true);
    } catch (err) {
      const apiError = extractApiError(err);
      setError(apiError.message || 'Ошибка открытия формы обработки отгрузки');
    }
  };

  const handleSaveShipment = async () => {
    if (!selectedOrder) return;

    try {
      setError(null);

      await ordersService.changeOrderStatus(selectedOrder.id, 'COMPLETED', 'Заказ отгружен');

      setShowShipmentModal(false);
      setSelectedOrder(null);
      setShipmentMaterials([]);

      const ordersData = await ordersService.getOrders({
        status: 'READY_FOR_PRODUCTION',
      });
      setReadyOrders(ordersData);
    } catch (err) {
      const apiError = extractApiError(err);
      setError(apiError.message || 'Ошибка обработки отгрузки');
    }
  };

  const handleRemoveShipmentMaterial = (index: number) => {
    setShipmentMaterials(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateShipmentMaterialAmount = (index: number, amount: number) => {
    setShipmentMaterials(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], amount: Math.max(0, amount) };
      return updated;
    });
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-72px)] bg-stone-950 text-white px-4 py-10 flex items-center justify-center">
        <div className="text-gray-400">{t("catalog.loading")}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-72px)] bg-stone-950 text-white px-4 py-10 flex items-center justify-center">
        <div className="text-red-400">{error}</div>
      </div>
    );
  }

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
                {purchaseOrders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-3 py-8 text-center text-gray-500"
                    >
                      {t("warehouse.noReceipts")}
                    </td>
                  </tr>
                ) : (
                  purchaseOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-3 py-3">
                        <div className="text-sm font-medium">
                          Заявка #{order.id}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-300">
                        Менеджер #{order.supplyManagerId}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-300">
                        {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                      </td>
                      <td className="px-3 py-3 text-right">
                        <button
                          onClick={() => handleRegisterReceipt(order.id)}
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
                {readyOrders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-3 py-8 text-center text-gray-500"
                    >
                      {t("warehouse.noOrders")}
                    </td>
                  </tr>
                ) : (
                  readyOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-3 py-3">
                        <div className="text-sm font-medium">Заказ #{order.id}</div>
                        <div className="text-xs text-gray-500">ID: {order.id}</div>
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-300">
                        Заявка #{order.clientApplicationId}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-300">
                        —
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-300">
                        {new Date(order.createdAt).toLocaleDateString('ru-RU')}
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

      {/* Модальное окно регистрации поступления */}
      {showReceiptModal && selectedPurchaseOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-stone-900 rounded-2xl border border-gray-800 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">
              {t("warehouse.registerReceipt")} - Заявка #{selectedPurchaseOrder.id}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Номер накладной *
                </label>
                <input
                  type="text"
                  value={receiptInvoiceNumber}
                  onChange={(e) => setReceiptInvoiceNumber(e.target.value)}
                  className="w-full rounded-xl bg-stone-950/70 border border-gray-700 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                  placeholder="INV-2023-12345"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Полученные материалы
                </label>
                <div className="space-y-2">
                  {receiptItems.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 bg-stone-800/50 rounded-lg px-3 py-2 border border-gray-700"
                    >
                      <div className="flex-1">
                        <div className="text-sm text-white">
                          Материал #{item.materialId}
                        </div>
                        <div className="text-xs text-gray-400">
                          Ожидалось: {item.originalAmount}
                        </div>
                      </div>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.amount}
                        onChange={(e) => {
                          const newItems = [...receiptItems];
                          newItems[index] = { ...newItems[index], amount: parseFloat(e.target.value) || 0 };
                          setReceiptItems(newItems);
                        }}
                        className="w-24 rounded-lg bg-stone-950/70 border border-gray-700 px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                      />
                      <button
                        onClick={() => handleRemoveReceiptItem(index)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <DeleteIcon fontSize="small" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={handleSaveReceipt}
                className="flex-1 rounded-full bg-white text-black text-sm font-medium py-2.5 hover:bg-gray-200 transition-colors"
              >
                Сохранить
              </button>
              <button
                onClick={() => {
                  setShowReceiptModal(false);
                  setSelectedPurchaseOrder(null);
                  setReceiptInvoiceNumber("");
                  setReceiptItems([]);
                }}
                className="flex-1 rounded-full bg-stone-950 text-white border border-gray-700 text-sm font-medium py-2.5 hover:bg-gray-900 transition-colors"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {showShipmentModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-stone-900 rounded-2xl border border-gray-800 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">
              {t("warehouse.processShipment")} - Заказ #{selectedOrder.id}
            </h2>

            <div className="space-y-4">
              <div className="text-sm text-gray-400 mb-2">
                Материалы для отгрузки (можно удалить или изменить количество):
              </div>
              <div className="space-y-2">
                {shipmentMaterials.length === 0 ? (
                  <div className="text-sm text-gray-500 text-center py-4">
                    Материалы не найдены
                  </div>
                ) : (
                  shipmentMaterials.map((material, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 bg-stone-800/50 rounded-lg px-3 py-2 border border-gray-700"
                    >
                      <div className="flex-1">
                        <div className="text-sm text-white">
                          {material.materialName}
                        </div>
                        <div className="text-xs text-gray-400">
                          Ожидалось: {material.originalAmount}
                        </div>
                      </div>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={material.amount}
                        onChange={(e) => handleUpdateShipmentMaterialAmount(index, parseFloat(e.target.value) || 0)}
                        className="w-24 rounded-lg bg-stone-950/70 border border-gray-700 px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                      />
                      <button
                        onClick={() => handleRemoveShipmentMaterial(index)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <DeleteIcon fontSize="small" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={handleSaveShipment}
                className="flex-1 rounded-full bg-white text-black text-sm font-medium py-2.5 hover:bg-gray-200 transition-colors"
              >
                Сохранить и завершить заказ
              </button>
              <button
                onClick={() => {
                  setShowShipmentModal(false);
                  setSelectedOrder(null);
                  setShipmentMaterials([]);
                }}
                className="flex-1 rounded-full bg-stone-950 text-white border border-gray-700 text-sm font-medium py-2.5 hover:bg-gray-900 transition-colors"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WarehouseDashboard;