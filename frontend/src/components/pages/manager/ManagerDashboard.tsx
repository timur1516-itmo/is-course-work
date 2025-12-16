import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import type { Order, OrderStatus, ManagerStats } from "../../../types/orders";

const statusLabelKeys: Record<OrderStatus, string> = {
  REQUEST: "profile.request",
  CREATED: "profile.created",
  PROCESSING: "profile.processing",
  ON_APPROVAL: "profile.onApproval",
  REVISION: "profile.revision",
  APPROVED: "profile.approved",
  WAITING_PAYMENT: "profile.waitingPayment",
  PAID: "profile.paid",
  READY_FOR_PRODUCTION: "profile.readyForProduction",
  IN_PRODUCTION: "profile.inProduction",
  COMPLETED: "profile.completed",
  CANCELLED: "profile.cancelled",
};

const statusStyles: Record<OrderStatus, string> = {
  REQUEST: "bg-sky-500/10 text-sky-300 ring-sky-500/40",
  CREATED: "bg-sky-500/10 text-sky-300 ring-sky-500/40",
  PROCESSING: "bg-indigo-500/10 text-indigo-300 ring-indigo-500/40",
  ON_APPROVAL: "bg-amber-500/10 text-amber-300 ring-amber-500/40",
  REVISION: "bg-orange-500/10 text-orange-300 ring-orange-500/40",
  APPROVED: "bg-emerald-500/10 text-emerald-300 ring-emerald-500/40",
  WAITING_PAYMENT: "bg-yellow-500/10 text-yellow-300 ring-yellow-500/40",
  PAID: "bg-green-500/10 text-green-300 ring-green-500/40",
  READY_FOR_PRODUCTION: "bg-cyan-500/10 text-cyan-300 ring-cyan-500/40",
  IN_PRODUCTION: "bg-purple-500/10 text-purple-300 ring-purple-500/40",
  COMPLETED: "bg-emerald-500/10 text-emerald-300 ring-emerald-500/40",
  CANCELLED: "bg-red-500/10 text-red-300 ring-red-500/40",
};

const mockStats: ManagerStats = {
  newApplicationsCount: 5,
  currentApplicationsCount: 12,
  pendingApprovalCount: 8,
};

const mockOrders: Order[] = [
  {
    id: "ORD-2025-001",
    name: "Комплект панелей для стенда",
    clientName: "Иван Петров",
    createdAt: "12.11.2025",
    status: "IN_PRODUCTION",
  },
  {
    id: "ORD-2025-002",
    name: "Логотип из нержавейки 600×300",
    clientName: "Мария Сидорова",
    createdAt: "18.11.2025",
    status: "WAITING_PAYMENT",
  },
  {
    id: "ORD-2025-003",
    name: "Набор декоративных панелей",
    clientName: "Алексей Иванов",
    createdAt: "20.11.2025",
    status: "PROCESSING",
  },
];

function ManagerDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [stats] = useState<ManagerStats>(mockStats);
  const [orders] = useState<Order[]>(mockOrders);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>(mockOrders);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  // TODO: Загрузка данных с API
  // useEffect(() => {
  //   fetchStats().then(setStats);
  //   fetchOrders().then(setOrders);
  // }, []);

  useEffect(() => {
    if (!activeFilter) {
      setFilteredOrders(orders);
      return;
    }

    let filtered: Order[] = [];
    switch (activeFilter) {
      case "current":
        filtered = orders.filter(
          (order) => order.status === "CREATED" || order.status === "PROCESSING"
        );
        break;
      case "approval":
        filtered = orders.filter(
          (order) =>
            order.status === "PROCESSING" ||
            order.status === "ON_APPROVAL" ||
            order.status === "REVISION"
        );
        break;
      default:
        filtered = orders;
    }
    setFilteredOrders(filtered);
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
                        <div className="text-sm font-medium">{order.name}</div>
                        <div className="text-xs text-gray-500">№ {order.id}</div>
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-300">
                        {order.clientName}
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
                        {order.createdAt}
                      </td>
                      <td className="px-3 py-3 text-right">
                        <Link
                          to={`/manager/orders/${order.id}`}
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

