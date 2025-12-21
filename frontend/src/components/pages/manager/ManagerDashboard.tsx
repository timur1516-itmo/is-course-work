import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import { ordersService, applicationsService, extractApiError } from "../../../services/api";
import type { ClientOrderResponseDto, OrderStatus, ClientApplicationResponseDto } from "../../../services/api/types";

const statusLabelKeys: Record<OrderStatus, string> = {
  CREATED: "profile.created",
  IN_PROGRESS: "profile.processing",
  PENDING_APPROVAL: "profile.onApproval",
  REWORK: "profile.revision",
  APPROVED: "profile.approved",
  AWAITING_PAYMENT: "profile.waitingPayment",
  PAID: "profile.paid",
  READY_FOR_PRODUCTION: "profile.readyForProduction",
  IN_PRODUCTION: "profile.inProduction",
  COMPLETED: "profile.completed",
};

const statusStyles: Record<OrderStatus, string> = {
  CREATED: "bg-sky-500/10 text-sky-300 ring-sky-500/40",
  IN_PROGRESS: "bg-indigo-500/10 text-indigo-300 ring-indigo-500/40",
  PENDING_APPROVAL: "bg-amber-500/10 text-amber-300 ring-amber-500/40",
  REWORK: "bg-orange-500/10 text-orange-300 ring-orange-500/40",
  APPROVED: "bg-emerald-500/10 text-emerald-300 ring-emerald-500/40",
  AWAITING_PAYMENT: "bg-yellow-500/10 text-yellow-300 ring-yellow-500/40",
  PAID: "bg-green-500/10 text-green-300 ring-green-500/40",
  READY_FOR_PRODUCTION: "bg-cyan-500/10 text-cyan-300 ring-cyan-500/40",
  IN_PRODUCTION: "bg-purple-500/10 text-purple-300 ring-purple-500/40",
  COMPLETED: "bg-emerald-500/10 text-emerald-300 ring-emerald-500/40",
};

interface ManagerStats {
  newApplicationsCount: number;
  currentApplicationsCount: number;
  pendingApprovalCount: number;
}

function ManagerDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<ClientOrderResponseDto[]>([]);
  const [applications, setApplications] = useState<ClientApplicationResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Загружаем заказы
        const ordersData = await ordersService.getOrders();
        setOrders(ordersData);
        
        // Загружаем заявки
        const applicationsData = await applicationsService.getApplications();
        setApplications(applicationsData.content || []);
      } catch (err) {
        const apiError = extractApiError(err);
        setError(apiError.message || 'Ошибка загрузки данных');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const stats = useMemo<ManagerStats>(() => {
    const newApplicationsCount = applications.filter(
      (app) => !app.id || !orders.some(order => order.clientApplicationId === app.id)
    ).length;

    const currentApplicationsCount = orders.filter(
      (order) => order.status === "CREATED" || order.status === "IN_PROGRESS"
    ).length;

    const pendingApprovalCount = orders.filter(
      (order) => order.status === "PENDING_APPROVAL" || order.status === "REWORK"
    ).length;
    
    return {
      newApplicationsCount,
      currentApplicationsCount,
      pendingApprovalCount,
    };
  }, [orders, applications]);

  const filteredOrders = useMemo(() => {
    if (!activeFilter) {
      return orders;
    }

    switch (activeFilter) {
      case "current":
        return orders.filter(
          (order) => order.status === "CREATED" || order.status === "IN_PROGRESS"
        );
      case "approval":
        return orders.filter(
          (order) =>
            order.status === "IN_PROGRESS" ||
            order.status === "PENDING_APPROVAL" ||
            order.status === "REWORK"
        );
      default:
        return orders;
    }
  }, [activeFilter, orders]);

  const handleNewApplicationsClick = () => {
    navigate("/manager/applications?filter=new");
  };

  const handleCurrentApplicationsClick = () => {
    setActiveFilter("current");
  };

  const handlePendingApprovalClick = () => {
    setActiveFilter("approval");
  };

  const handleClearFilter = () => {
    setActiveFilter(null);
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
            {t("manager.dashboard")}
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={handleNewApplicationsClick}
            className="rounded-3xl border border-gray-800 bg-stone-900/80 shadow-[0_0_40px_rgba(0,0,0,0.5)] p-6 hover:bg-stone-800 transition-colors text-left"
          >
            <div className="text-xs uppercase tracking-wide text-gray-500 mb-2">
              {t("manager.newApplications")}
            </div>
            <div className="text-4xl font-bold text-white mb-2">
              {stats.newApplicationsCount}
            </div>
            <div className="text-sm text-gray-400">
              {t("manager.newApplications")}
            </div>
          </button>

          <button
            onClick={handleCurrentApplicationsClick}
            className={`rounded-3xl border shadow-[0_0_40px_rgba(0,0,0,0.5)] p-6 transition-colors text-left ${
              activeFilter === "current"
                ? "border-emerald-500 bg-stone-800"
                : "border-gray-800 bg-stone-900/80 hover:bg-stone-800"
            }`}
          >
            <div className="text-xs uppercase tracking-wide text-gray-500 mb-2">
              {t("manager.currentApplications")}
            </div>
            <div className="text-4xl font-bold text-white mb-2">
              {stats.currentApplicationsCount}
            </div>
            <div className="text-sm text-gray-400">
              {t("manager.currentApplications")}
            </div>
          </button>

          <button
            onClick={handlePendingApprovalClick}
            className={`rounded-3xl border shadow-[0_0_40px_rgba(0,0,0,0.5)] p-6 transition-colors text-left ${
              activeFilter === "approval"
                ? "border-emerald-500 bg-stone-800"
                : "border-gray-800 bg-stone-900/80 hover:bg-stone-800"
            }`}
          >
            <div className="text-xs uppercase tracking-wide text-gray-500 mb-2">
              {t("manager.pendingApproval")}
            </div>
            <div className="text-4xl font-bold text-white mb-2">
              {stats.pendingApprovalCount}
            </div>
            <div className="text-sm text-gray-400">
              {t("manager.pendingApproval")}
            </div>
          </button>
        </div>

        <section className="rounded-3xl border border-gray-800 bg-stone-900/80 shadow-[0_0_40px_rgba(0,0,0,0.5)] p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">
                {t("manager.ordersList")}
              </h2>
              {activeFilter && (
                <button
                  onClick={handleClearFilter}
                  className="text-xs text-gray-400 hover:text-white mt-1"
                >
                  Сбросить фильтр
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border-separate border-spacing-y-2">
              <thead>
                <tr className="text-xs uppercase text-gray-500">
                  <th className="text-left px-3 pb-2">{t("manager.order")}</th>
                  <th className="text-left px-3 pb-2">{t("manager.client")}</th>
                  <th className="text-left px-3 pb-2">{t("manager.status")}</th>
                  <th className="text-left px-3 pb-2">
                    {t("manager.orderDate")}
                  </th>
                  <th className="text-right px-3 pb-2">
                    {t("profile.orderActions")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-8 text-center text-gray-500">
                      {t("manager.noOrders")}
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-3 py-3">
                        <div className="text-sm font-medium">Заказ #{order.id}</div>
                        <div className="text-xs text-gray-500">ID: {order.id}</div>
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-300">
                        Клиент #{order.clientApplicationId}
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={[
                            "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1",
                            statusStyles[order.status],
                          ].join(" ")}
                        >
                          {t(statusLabelKeys[order.status])}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-xs text-gray-300">
                        {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                      </td>
                      <td className="px-3 py-3 text-right">
                        <Link
                          to={`/orders/${order.id}`}
                          className="text-xs rounded-full border border-gray-700 px-3 py-1 hover:bg-gray-800 transition-colors"
                        >
                          {t("manager.openOrder")}
                        </Link>
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

export default ManagerDashboard;

