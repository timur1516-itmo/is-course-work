import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import { ordersService, applicationsService, clientsService, extractApiError } from "../../../services/api";
import type { ClientOrderResponseDto, ClientApplicationResponseDto, ClientResponseDto } from "../../../services/api/types";
import { getOrderStatusTranslationKey, getOrderStatusStyle } from "../../../utils/orderStatus";

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
  const [clients, setClients] = useState<Map<number, ClientResponseDto>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const formatOrderName = (order: ClientOrderResponseDto): string => {
    const date = new Date(order.createdAt);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `ORD-${year}-${month}-${day}-${order.id}`;
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [ordersData, applicationsData] = await Promise.all([
          ordersService.getOrders(),
          applicationsService.getApplications()
        ]);
        
        const ordersArray = Array.isArray(ordersData) ? ordersData : [];
        setOrders(ordersArray);
        setApplications(applicationsData.content || []);

        const clientsMap = new Map<number, ClientResponseDto>();
        const uniqueClientIds = new Set<number>();

        applicationsData.content?.forEach(app => {
          if (app.clientId) {
            uniqueClientIds.add(app.clientId);
          }
        });

        for (const clientId of uniqueClientIds) {
          try {
            const client = await clientsService.getClientById(clientId);
            clientsMap.set(clientId, client);
          } catch (err) {
            console.error(`Failed to load client ${clientId}:`, err);
          }
        }
        
        setClients(clientsMap);
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
    const ordersArray = Array.isArray(orders) ? orders : [];
    const applicationsArray = Array.isArray(applications) ? applications : [];
    
    const newApplicationsCount = applicationsArray.filter(
      (app) => !app.id || !ordersArray.some(order => order.clientApplicationId === app.id)
    ).length;

    const currentApplicationsCount = ordersArray.filter(
      (order) => order.status === "CREATED" || order.status === "IN_PROGRESS"
    ).length;

    const pendingApprovalCount = ordersArray.filter(
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
    navigate("/applications?filter=new");
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
                  filteredOrders.map((order) => {
                    const application = applications.find(app => app.id === order.clientApplicationId);
                    const client = application ? clients.get(application.clientId) : null;
                    
                    return (
                      <tr key={order.id}>
                        <td className="px-3 py-3">
                          <div className="text-sm font-medium">{formatOrderName(order)}</div>
                          <div className="text-xs text-gray-500">ID: {order.id}</div>
                        </td>
                        <td className="px-3 py-3 text-sm text-gray-300">
                          {client ? (
                            `${client.person.firstName} ${client.person.lastName}`
                          ) : (
                            <span className="text-gray-500">{t("catalog.loading")}</span>
                          )}
                        </td>
                      <td className="px-3 py-3">
                        <span
                          className={[
                            "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1",
                            getOrderStatusStyle(order.status),
                          ].join(" ")}
                        >
                          {t(getOrderStatusTranslationKey(order.status))}
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

export default ManagerDashboard;

