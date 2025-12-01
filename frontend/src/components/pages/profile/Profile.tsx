import { Link } from "react-router-dom";
import {useTranslation} from "react-i18next";
import { useState } from "react";

type OrderStatus =
  | "REQUEST"
  | "CREATED"
  | "PROCESSING"
  | "ON_APPROVAL"
  | "REVISION"
  | "APPROVED"
  | "WAITING_PAYMENT"
  | "PAID"
  | "READY_FOR_PRODUCTION"
  | "IN_PRODUCTION"
  | "COMPLETED"
  | "CANCELLED";

interface Order {
  id: string;
  name: string;
  createdAt: string;
  completedAt?: string;
  status: OrderStatus;
}

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
  READY_FOR_PRODUCTION:
    "bg-cyan-500/10 text-cyan-300 ring-cyan-500/40",
  IN_PRODUCTION: "bg-purple-500/10 text-purple-300 ring-purple-500/40",
  COMPLETED: "bg-emerald-500/10 text-emerald-300 ring-emerald-500/40",
  CANCELLED: "bg-red-500/10 text-red-300 ring-red-500/40",
};

const currentOrdersMock: Order[] = [
  {
    id: "ORD-2025-001",
    name: "Комплект панелей для стенда",
    createdAt: "12.11.2025",
    status: "IN_PRODUCTION",
  },
  {
    id: "ORD-2025-002",
    name: "Логотип из нержавейки 600×300",
    createdAt: "18.11.2025",
    status: "WAITING_PAYMENT",
  },
];

const historyOrdersMock: Order[] = [
  {
    id: "ORD-2025-0001",
    name: "Набор декоративных панелей",
    createdAt: "03.10.2025",
    completedAt: "10.10.2025",
    status: "COMPLETED",
  },
  {
    id: "ORD-2025-0002",
    name: "Таблички на двери офисов",
    createdAt: "21.09.2025",
    completedAt: "25.09.2025",
    status: "CANCELLED",
  },
];

function ProfilePage() {
  const {t} = useTranslation();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const currentOrders = currentOrdersMock;
  const historyOrders = historyOrdersMock;

  const handleUpdateContacts = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: отправка на сервер
    console.log("update contacts");
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: отправка на сервер
    console.log("change password");
  };

  return (
    <div className="min-h-[calc(100vh-72px-72px)] bg-stone-950 text-white px-4 py-10 flex justify-center">
      <div className="w-full max-w-6xl space-y-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              {t("profile.title")}
            </h1>
            <p className="mt-2 text-sm text-gray-400 max-w-xl">
              {t("profile.profileSubtitle")}
            </p>
          </div>
          <div className="rounded-2xl border border-gray-800 bg-stone-900/80 px-4 py-3 text-sm text-gray-300">
            <div className="flex items-center justify-between gap-4">
              <div className="text-right">
                <div className="text-xs uppercase tracking-wide text-gray-500">
                  {t("profile.completedOrders")}
                </div>
                <div className="font-medium">
                  {historyOrders.filter((o) => o.status === "COMPLETED").length}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-8">
          <div className="space-y-6">
            {!isSettingsOpen && (
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="w-full rounded-full bg-white text-black text-sm font-medium py-2.5 hover:bg-gray-200 transition-colors"
              >
                {t("profile.openProfileSettings")}
              </button>
            )}
            {currentOrders.length > 0 && (
              <section className="rounded-3xl border border-gray-800 bg-stone-900/80 shadow-[0_0_40px_rgba(0,0,0,0.5)] p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold">
                      {t("profile.activeOrders")}
                    </h2>
                    <p className="text-xs text-gray-400 mt-1">
                      {t("profile.activeOrdersInfo")}
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm border-separate border-spacing-y-2">
                    <thead>
                    <tr className="text-xs uppercase text-gray-500">
                      <th className="text-left px-3 pb-2">{t("profile.order")}</th>
                      <th className="text-left px-3 pb-2">{t("profile.applicationDate")}</th>
                      <th className="text-left px-3 pb-2">{t("profile.orderStatus")}</th>
                      <th className="text-right px-3 pb-2">{t("profile.orderActions")}</th>
                    </tr>
                    </thead>
                    <tbody>
                    {currentOrders.map((order) => (
                      <tr key={order.id}>
                        <td className="px-3 py-3">
                          <div className="text-sm font-medium">{order.name}</div>
                          <div className="text-xs text-gray-500">№ {order.id}</div>
                        </td>
                        <td className="px-3 py-3 text-xs text-gray-300">
                          {order.createdAt}
                        </td>
                        <td className="px-3 py-3">
                        <span className={[
                          "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1",
                          statusStyles[order.status],
                        ].join(" ")}>
                          {t(statusLabelKeys[order.status])}
                        </span>
                        </td>
                        <td className="px-3 py-3 text-right">
                          <Link
                            to={`/orders/${order.id}`}
                            className="text-xs rounded-full border border-gray-700 px-3 py-1 hover:bg-gray-800 transition-colors"
                          >
                            {t("profile.openOrder")}
                          </Link>
                        </td>
                      </tr>
                    ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            <section className="rounded-3xl border border-gray-800 bg-stone-900/80 shadow-[0_0_40px_rgba(0,0,0,0.5)] p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold">
                    {t("profile.orderHistory")}
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">
                    {t("profile.orderHistoryInfo")}
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm border-separate border-spacing-y-2">
                  <thead>
                  <tr className="text-xs uppercase text-gray-500">
                    <th className="text-left px-3 pb-2">{t("profile.order")}</th>
                    <th className="text-left px-3 pb-2">
                      {t("profile.orderDate")}
                    </th>
                    <th className="text-left px-3 pb-2">
                      {t("profile.orderEndDate")}
                    </th>
                    <th className="text-left px-3 pb-2">{t("profile.orderStatus")}</th>
                    <th className="text-right px-3 pb-2">{t("profile.orderActions")}</th>
                  </tr>
                  </thead>
                  <tbody>
                  {historyOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-3 py-1">
                        <div className="text-sm font-medium">
                          {order.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          № {order.id}
                        </div>
                      </td>
                      <td className="px-3 py-1 text-xs text-gray-300">
                        {order.createdAt}
                      </td>
                      <td className="px-3 py-1 text-xs text-gray-300">
                        {order.completedAt ?? "—"}
                      </td>
                      <td className="px-3 py-1">
                          <span
                            className={[
                              "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1",
                              statusStyles[order.status],
                            ].join(" ")}
                          >
                            {t(statusLabelKeys[order.status])}
                          </span>
                      </td>
                      <td className="px-3 py-1 text-right">
                        <Link
                          to={`/orders/${order.id}`}
                          className="text-xs rounded-full border border-gray-700 px-3 py-1 hover:bg-gray-800 transition-colors"
                        >
                          {t("profile.open")}
                        </Link>
                      </td>
                    </tr>
                  ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <aside className={`space-y-6 transition-all duration-500 ease-in-out origin-top ${
            isSettingsOpen 
              ? 'opacity-100 max-h-[5000px] scale-y-100 overflow-visible' 
              : 'opacity-0 max-h-0 scale-y-0 overflow-hidden'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                {t("profile.profileAndContacts")}
              </h2>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="rounded-full bg-stone-950 text-white border border-gray-700 text-sm font-medium px-4 py-2 hover:bg-gray-900 transition-colors"
              >
                {t("profile.closeProfileSettings")}
              </button>
            </div>
            <section className="rounded-3xl border border-gray-800 bg-stone-900/80 shadow-[0_0_40px_rgba(0,0,0,0.5)] p-6">
              <p className="text-xs text-gray-400 mb-4">
                {t("profile.profileAndContactsInfo")}
              </p>

              <form onSubmit={handleUpdateContacts} className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    {t("auth.name")}
                  </label>
                  <input
                    type="text"
                    defaultValue="Иван"
                    className="w-full rounded-xl bg-stone-950/70 border border-gray-700 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                    placeholder={t("auth.ivan")}
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    {t("auth.lastName")}
                  </label>
                  <input
                    type="text"
                    defaultValue="Петров"
                    className="w-full rounded-xl bg-stone-950/70 border border-gray-700 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                    placeholder={t("auth.petrov")}
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    {t("auth.email")}
                  </label>
                  <input
                    type="email"
                    defaultValue="client@example.com"
                    className="w-full rounded-xl bg-stone-950/70 border border-gray-700 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                    placeholder="example@domain.com"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    {t("auth.phone")}
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      defaultValue="+7 999 000 00 00"
                      className="w-full rounded-xl bg-stone-950/70 border border-gray-700 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                      placeholder="+7 999 000 00 00"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-full bg-white text-black text-sm font-medium py-2.5 hover:bg-gray-200 transition-colors"
                >
                  {t("profile.saveChanges")}
                </button>
              </form>
            </section>

            <section className="rounded-3xl border border-gray-800 bg-stone-900/80 shadow-[0_0_40px_rgba(0,0,0,0.5)] p-6">
              <h2 className="text-lg font-semibold mb-1">
                {t("profile.changePassword")}
              </h2>
              <p className="text-xs text-gray-400 mb-4">
                {t("profile.changePasswordRecommendation")}
              </p>

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    {t("profile.currentPassword")}
                  </label>
                  <input
                    type="password"
                    className="w-full rounded-xl bg-stone-950/70 border border-gray-700 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                    placeholder={t("profile.currentPasswordPlaceholder")}
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    {t("profile.newPassword")}
                  </label>
                  <input
                    type="password"
                    className="w-full rounded-xl bg-stone-950/70 border border-gray-700 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                    placeholder={t("profile.newPasswordPlaceholder")}
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    {t("profile.confirmNewPassword")}
                  </label>
                  <input
                    type="password"
                    className="w-full rounded-xl bg-stone-950/70 border border-gray-700 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                    placeholder={t("profile.confirmNewPasswordPlaceholder")}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-full bg-stone-950 text-white border border-gray-700 text-sm font-medium py-2.5 hover:bg-gray-900 transition-colors"
                >
                  {t("profile.updatePassword")}
                </button>
              </form>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
