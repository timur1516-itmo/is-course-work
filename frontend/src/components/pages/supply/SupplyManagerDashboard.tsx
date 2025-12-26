import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage, FieldArray } from "formik";
import * as Yup from "yup";
import { purchaseOrdersService, extractApiError } from "../../../services/api";
import type { PurchaseOrderResponseDto, PurchaseOrderRequestDto, PurchaseOrderMaterialDto } from "../../../services/api/purchaseOrders.service";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import VisibilityIcon from "@mui/icons-material/Visibility";

function SupplyManagerDashboard() {
  const { t } = useTranslation();
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrderResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrderResponseDto | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const ordersData = await purchaseOrdersService.getPurchaseOrders();
      setPurchaseOrders(Array.isArray(ordersData) ? ordersData : []);
    } catch (err) {
      const apiError = extractApiError(err);
      setError(apiError.message || 'Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrder = () => {
    setShowCreateModal(true);
    setError(null);
  };

  const handleEditOrder = (order: PurchaseOrderResponseDto) => {
    setSelectedOrder(order);
    setShowEditModal(true);
    setError(null);
  };

  const handleViewDetails = (order: PurchaseOrderResponseDto) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const handleSubmitCreate = async (values: PurchaseOrderRequestDto) => {
    try {
      setError(null);
      await purchaseOrdersService.createPurchaseOrder(values);
      setShowCreateModal(false);
      await loadData();
    } catch (err) {
      const apiError = extractApiError(err);
      setError(apiError.message || 'Ошибка создания заявки');
    }
  };

  const handleSubmitEdit = async (values: { materials: PurchaseOrderMaterialDto[] }) => {
    if (!selectedOrder) return;

    try {
      setError(null);
      await purchaseOrdersService.updateMaterialsInPurchaseOrder(selectedOrder.id, values.materials);
      setShowEditModal(false);
      setSelectedOrder(null);
      await loadData();
    } catch (err) {
      const apiError = extractApiError(err);
      setError(apiError.message || 'Ошибка обновления заявки');
    }
  };

  const materialValidationSchema = Yup.object({
    materialId: Yup.number().required(t("supply.materialRequired")),
    amount: Yup.number().required(t("supply.amountRequired")).min(0.01, t("supply.amountMin")),
    priceForUnit: Yup.number().required(t("supply.priceRequired")).min(0, t("supply.priceMin")),
    supplier: Yup.string().required(t("supply.supplierRequired")),
  });

  const createOrderValidationSchema = Yup.object({
    materials: Yup.array()
      .of(materialValidationSchema)
      .min(1, t("supply.atLeastOneMaterial"))
      .required(),
  });

  const initialMaterialValues: PurchaseOrderMaterialDto = {
    materialId: 0,
    amount: 0,
    priceForUnit: 0,
    supplier: "",
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 text-white flex items-center justify-center">
        <div>{t("catalog.loading")}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-semibold mb-2">{t("supply.dashboard")}</h1>
            <p className="text-gray-400">{t("supply.dashboardDescription")}</p>
          </div>
          <button
            onClick={handleCreateOrder}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black font-medium hover:bg-gray-200 transition-colors"
          >
            <AddIcon />
            {t("supply.createOrder")}
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/40 text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="rounded-3xl border border-gray-800 bg-stone-900/80 shadow-[0_0_40px_rgba(0,0,0,0.5)] overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-stone-800/50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">{t("supply.orderId")}</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">{t("supply.status")}</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">{t("supply.createdAt")}</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">{t("supply.materialsCount")}</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">{t("supply.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {purchaseOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    {t("supply.noOrders")}
                  </td>
                </tr>
              ) : (
                purchaseOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-stone-800/30 transition-colors">
                    <td className="px-6 py-4 text-sm">#{order.id}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                          order.status === "COMPLETED"
                            ? "bg-emerald-500/10 text-emerald-300 ring-emerald-500/40"
                            : "bg-sky-500/10 text-sky-300 ring-sky-500/40"
                        }`}
                      >
                        {order.status === "COMPLETED" ? t("supply.completed") : t("supply.created")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {order.materials?.length || 0}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewDetails(order)}
                          className="p-2 rounded-lg bg-stone-800/50 hover:bg-stone-700/50 transition-colors"
                          title={t("supply.viewDetails")}
                        >
                          <VisibilityIcon fontSize="small" />
                        </button>
                        {order.status === "CREATED" && (
                          <button
                            onClick={() => handleEditOrder(order)}
                            className="p-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 transition-colors"
                            title={t("supply.approveOrder")}
                          >
                            <CheckCircleIcon fontSize="small" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Модальное окно создания заявки */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-stone-900 rounded-3xl border border-gray-800 p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-semibold mb-6">{t("supply.createOrder")}</h2>
              <Formik
                initialValues={{ materials: [initialMaterialValues] }}
                validationSchema={createOrderValidationSchema}
                onSubmit={handleSubmitCreate}
              >
                {({ values, isSubmitting }) => (
                  <Form>
                    <FieldArray name="materials">
                      {({ push, remove }) => (
                        <div className="space-y-4">
                          {values.materials.map((_, index) => (
                            <div key={index} className="p-4 rounded-xl bg-stone-800/50 border border-gray-700">
                              <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium">{t("supply.material")} {index + 1}</h3>
                                {values.materials.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => remove(index)}
                                    className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </button>
                                )}
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm text-gray-300 mb-1">
                                    {t("supply.materialId")} *
                                  </label>
                                  <Field
                                    name={`materials.${index}.materialId`}
                                    type="number"
                                    className="w-full rounded-xl bg-stone-950/70 border border-gray-700 px-4 py-2.5 text-sm text-white"
                                  />
                                  <ErrorMessage
                                    name={`materials.${index}.materialId`}
                                    component="div"
                                    className="text-xs text-red-400 mt-1"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm text-gray-300 mb-1">
                                    {t("supply.amount")} *
                                  </label>
                                  <Field
                                    name={`materials.${index}.amount`}
                                    type="number"
                                    step="0.01"
                                    className="w-full rounded-xl bg-stone-950/70 border border-gray-700 px-4 py-2.5 text-sm text-white"
                                  />
                                  <ErrorMessage
                                    name={`materials.${index}.amount`}
                                    component="div"
                                    className="text-xs text-red-400 mt-1"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm text-gray-300 mb-1">
                                    {t("supply.priceForUnit")} *
                                  </label>
                                  <Field
                                    name={`materials.${index}.priceForUnit`}
                                    type="number"
                                    step="0.01"
                                    className="w-full rounded-xl bg-stone-950/70 border border-gray-700 px-4 py-2.5 text-sm text-white"
                                  />
                                  <ErrorMessage
                                    name={`materials.${index}.priceForUnit`}
                                    component="div"
                                    className="text-xs text-red-400 mt-1"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm text-gray-300 mb-1">
                                    {t("supply.supplier")} *
                                  </label>
                                  <Field
                                    name={`materials.${index}.supplier`}
                                    className="w-full rounded-xl bg-stone-950/70 border border-gray-700 px-4 py-2.5 text-sm text-white"
                                  />
                                  <ErrorMessage
                                    name={`materials.${index}.supplier`}
                                    component="div"
                                    className="text-xs text-red-400 mt-1"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => push(initialMaterialValues)}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-700 hover:bg-stone-800/50 transition-colors"
                          >
                            <AddIcon />
                            {t("supply.addMaterial")}
                          </button>
                        </div>
                      )}
                    </FieldArray>
                    <div className="flex gap-4 mt-6">
                      <button
                        type="button"
                        onClick={() => setShowCreateModal(false)}
                        className="flex-1 rounded-full border border-gray-700 text-white text-sm font-medium py-2.5 hover:bg-gray-800 transition-colors"
                      >
                        {t("application.cancel")}
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 rounded-full bg-white text-black text-sm font-medium py-2.5 hover:bg-gray-200 transition-colors disabled:opacity-50"
                      >
                        {isSubmitting ? t("application.submitting") : t("supply.create")}
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        )}

        {/* Модальное окно редактирования/утверждения заявки */}
        {showEditModal && selectedOrder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-stone-900 rounded-3xl border border-gray-800 p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-semibold mb-6">{t("supply.approveOrder")} #{selectedOrder.id}</h2>
              <Formik
                initialValues={{ materials: selectedOrder.materials || [] }}
                validationSchema={createOrderValidationSchema}
                onSubmit={handleSubmitEdit}
              >
                {({ values, isSubmitting }) => (
                  <Form>
                    <FieldArray name="materials">
                      {({ push, remove }) => (
                        <div className="space-y-4">
                          {values.materials.map((_, index) => (
                            <div key={index} className="p-4 rounded-xl bg-stone-800/50 border border-gray-700">
                              <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium">{t("supply.material")} {index + 1}</h3>
                                {values.materials.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => remove(index)}
                                    className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </button>
                                )}
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm text-gray-300 mb-1">
                                    {t("supply.materialId")} *
                                  </label>
                                  <Field
                                    name={`materials.${index}.materialId`}
                                    type="number"
                                    className="w-full rounded-xl bg-stone-950/70 border border-gray-700 px-4 py-2.5 text-sm text-white"
                                  />
                                  <ErrorMessage
                                    name={`materials.${index}.materialId`}
                                    component="div"
                                    className="text-xs text-red-400 mt-1"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm text-gray-300 mb-1">
                                    {t("supply.amount")} *
                                  </label>
                                  <Field
                                    name={`materials.${index}.amount`}
                                    type="number"
                                    step="0.01"
                                    className="w-full rounded-xl bg-stone-950/70 border border-gray-700 px-4 py-2.5 text-sm text-white"
                                  />
                                  <ErrorMessage
                                    name={`materials.${index}.amount`}
                                    component="div"
                                    className="text-xs text-red-400 mt-1"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm text-gray-300 mb-1">
                                    {t("supply.priceForUnit")} *
                                  </label>
                                  <Field
                                    name={`materials.${index}.priceForUnit`}
                                    type="number"
                                    step="0.01"
                                    className="w-full rounded-xl bg-stone-950/70 border border-gray-700 px-4 py-2.5 text-sm text-white"
                                  />
                                  <ErrorMessage
                                    name={`materials.${index}.priceForUnit`}
                                    component="div"
                                    className="text-xs text-red-400 mt-1"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm text-gray-300 mb-1">
                                    {t("supply.supplier")} *
                                  </label>
                                  <Field
                                    name={`materials.${index}.supplier`}
                                    className="w-full rounded-xl bg-stone-950/70 border border-gray-700 px-4 py-2.5 text-sm text-white"
                                  />
                                  <ErrorMessage
                                    name={`materials.${index}.supplier`}
                                    component="div"
                                    className="text-xs text-red-400 mt-1"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => push(initialMaterialValues)}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-700 hover:bg-stone-800/50 transition-colors"
                          >
                            <AddIcon />
                            {t("supply.addMaterial")}
                          </button>
                        </div>
                      )}
                    </FieldArray>
                    <div className="flex gap-4 mt-6">
                      <button
                        type="button"
                        onClick={() => {
                          setShowEditModal(false);
                          setSelectedOrder(null);
                        }}
                        className="flex-1 rounded-full border border-gray-700 text-white text-sm font-medium py-2.5 hover:bg-gray-800 transition-colors"
                      >
                        {t("application.cancel")}
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 rounded-full bg-white text-black text-sm font-medium py-2.5 hover:bg-gray-200 transition-colors disabled:opacity-50"
                      >
                        {isSubmitting ? t("application.submitting") : t("supply.approve")}
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        )}

        {/* Модальное окно просмотра деталей заявки */}
        {showDetailsModal && selectedOrder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-stone-900 rounded-3xl border border-gray-800 p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-semibold mb-6">{t("supply.orderDetails")} #{selectedOrder.id}</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">{t("supply.status")}</label>
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                      selectedOrder.status === "COMPLETED"
                        ? "bg-emerald-500/10 text-emerald-300 ring-emerald-500/40"
                        : "bg-sky-500/10 text-sky-300 ring-sky-500/40"
                    }`}
                  >
                    {selectedOrder.status === "COMPLETED" ? t("supply.completed") : t("supply.created")}
                  </span>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">{t("supply.createdAt")}</label>
                  <p className="text-white">
                    {new Date(selectedOrder.createdAt).toLocaleString('ru-RU')}
                  </p>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">{t("supply.materials")}</label>
                  <div className="space-y-2">
                    {selectedOrder.materials && selectedOrder.materials.length > 0 ? (
                      selectedOrder.materials.map((material, index) => (
                        <div key={index} className="p-4 rounded-xl bg-stone-800/50 border border-gray-700">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <span className="text-xs text-gray-400">{t("supply.materialId")}:</span>
                              <p className="text-white">{material.materialId}</p>
                            </div>
                            <div>
                              <span className="text-xs text-gray-400">{t("supply.amount")}:</span>
                              <p className="text-white">{material.amount}</p>
                            </div>
                            <div>
                              <span className="text-xs text-gray-400">{t("supply.priceForUnit")}:</span>
                              <p className="text-white">{material.priceForUnit}</p>
                            </div>
                            <div>
                              <span className="text-xs text-gray-400">{t("supply.supplier")}:</span>
                              <p className="text-white">{material.supplier}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">{t("supply.noMaterials")}</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedOrder(null);
                  }}
                  className="px-6 py-2 rounded-full bg-white text-black text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  {t("profile.closeProfileSettings")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SupplyManagerDashboard;

