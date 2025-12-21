import { Link, useNavigate } from "react-router-dom";
import {useTranslation} from "react-i18next";
import { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { ordersService, authService, extractApiError, type CurrentUserDto } from "../../../services/api";
import type { ClientOrderResponseDto, OrderStatus } from "../../../services/api/types";

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

const PASSWORD_REGEX = /^[A-Za-z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+$/;

function ProfilePage() {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [orders, setOrders] = useState<ClientOrderResponseDto[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUserDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate("/auth?mode=login", { state: { from: "/profile" } });
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [ordersData, userData] = await Promise.all([
          ordersService.getOrders(),
          authService.getCurrentUser(),
        ]);
        
        setOrders(ordersData);
        setCurrentUser(userData);
      } catch (err) {
        const apiError = extractApiError(err);
        setError(apiError.message || 'Ошибка загрузки данных');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [navigate]);

  const currentOrders = orders.filter(
    (order) => order.status !== "COMPLETED"
  );
  const historyOrders = orders.filter(
    (order) => order.status === "COMPLETED"
  );

  const profileInitialValues = {
    firstName: currentUser?.client?.person?.firstName || currentUser?.person?.firstName || "",
    lastName: currentUser?.client?.person?.lastName || currentUser?.person?.lastName || "",
    email: currentUser?.client?.email || "",
    phoneNumber: currentUser?.client?.phoneNumber || "",
  };

  const profileValidationSchema = Yup.object({
    firstName: Yup.string().required(t("auth.enterName")),
    lastName: Yup.string().required(t("auth.enterLastName")),
    email: Yup.string()
      .required(t("auth.enterEmail"))
      .email(t("auth.invalidEmail")),
    phoneNumber: Yup.string().required(t("auth.enterPhone")),
  });

  const passwordValidationSchema = Yup.object({
    currentPassword: Yup.string().required(t("profile.currentPassword")),
    newPassword: Yup.string()
      .required(t("auth.inputPassword"))
      .min(8, t("auth.minLength"))
      .matches(PASSWORD_REGEX, t("auth.invalidPassword")),
    confirmNewPassword: Yup.string()
      .required(t("auth.confirmPassword"))
      .oneOf([Yup.ref("newPassword")], t("auth.passwordsDoNotMatch")),
  });

  const handleUpdateContacts = async (values: typeof profileInitialValues) => {
    try {
      setProfileError(null);
      setProfileSuccess(false);
      await authService.updateProfile(values);
      setProfileSuccess(true);
      const userData = await authService.getCurrentUser();
      setCurrentUser(userData);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err) {
      const apiError = extractApiError(err);
      setProfileError(apiError.message || t("auth.loginError"));
    }
  };

  const handleChangePassword = async (values: {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
  }) => {
    try {
      setPasswordError(null);
      setPasswordSuccess(false);
      await authService.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      setPasswordSuccess(true);
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err) {
      const apiError = extractApiError(err);
      setPasswordError(apiError.message || t("auth.loginError"));
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-72px-72px)] bg-stone-950 text-white px-4 py-10 flex items-center justify-center">
        <div className="text-gray-400">{t("catalog.loading")}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-72px-72px)] bg-stone-950 text-white px-4 py-10 flex items-center justify-center">
        <div className="text-red-400">{error}</div>
      </div>
    );
  }

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

        <div className="flex flex-col lg:flex-row gap-8 transition-all duration-500 ease-in-out">
          <div className="space-y-6 transition-all duration-500 ease-in-out lg:flex-1 lg:min-w-0">
            <div className={`transition-all duration-500 ease-in-out overflow-hidden ${
              isSettingsOpen
                ? 'opacity-0 max-h-0 scale-y-0'
                : 'opacity-100 scale-y-100'
            }`}>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="w-full rounded-full bg-white text-black text-sm font-medium py-2.5 hover:bg-gray-200 transition-colors"
              >
                {t("profile.openProfileSettings")}
              </button>
            </div>
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
                    {currentOrders.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-3 py-8 text-center text-gray-500">
                          {t("manager.noOrders")}
                        </td>
                      </tr>
                    ) : (
                      currentOrders.map((order) => (
                        <tr key={order.id}>
                          <td className="px-3 py-3">
                            <div className="text-sm font-medium">Заказ #{order.id}</div>
                            <div className="text-xs text-gray-500">ID: {order.id}</div>
                          </td>
                          <td className="px-3 py-3 text-xs text-gray-300">
                            {new Date(order.createdAt).toLocaleDateString('ru-RU')}
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
                      ))
                    )}
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
                  {historyOrders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-3 py-8 text-center text-gray-500">
                        {t("manager.noOrders")}
                      </td>
                    </tr>
                  ) : (
                    historyOrders.map((order) => (
                      <tr key={order.id}>
                        <td className="px-3 py-1">
                          <div className="text-sm font-medium">
                            Заказ #{order.id}
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: {order.id}
                          </div>
                        </td>
                        <td className="px-3 py-1 text-xs text-gray-300">
                          {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                        </td>
                        <td className="px-3 py-1 text-xs text-gray-300">
                          —
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
                    ))
                  )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <aside className={`space-y-6 transition-all duration-500 ease-in-out origin-top ${
            isSettingsOpen 
              ? 'opacity-100 max-h-[5000px] scale-y-100 overflow-visible lg:w-[33.333%] lg:min-w-[300px]' 
              : 'opacity-0 max-h-0 scale-y-0 overflow-hidden lg:w-0 lg:min-w-0'
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

              {profileError && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/40 text-red-400 text-sm">
                  {profileError}
                </div>
              )}
              {profileSuccess && (
                <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 text-sm">
                  {t("profile.saveChanges")} {t("profile.success")}
                </div>
              )}
              <Formik
                initialValues={profileInitialValues}
                validationSchema={profileValidationSchema}
                enableReinitialize
                onSubmit={handleUpdateContacts}
              >
                {({ isSubmitting }) => (
                  <Form className="space-y-4">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">
                        {t("auth.name")}
                      </label>
                      <Field
                        name="firstName"
                        type="text"
                        className="w-full rounded-xl bg-stone-950/70 border border-gray-700 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                        placeholder={t("auth.ivan")}
                      />
                      <div className="min-h-[18px]">
                        <ErrorMessage
                          name="firstName"
                          component="div"
                          className="mt-1 text-xs text-red-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-400 mb-1">
                        {t("auth.lastName")}
                      </label>
                      <Field
                        name="lastName"
                        type="text"
                        className="w-full rounded-xl bg-stone-950/70 border border-gray-700 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                        placeholder={t("auth.petrov")}
                      />
                      <div className="min-h-[18px]">
                        <ErrorMessage
                          name="lastName"
                          component="div"
                          className="mt-1 text-xs text-red-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-400 mb-1">
                        {t("auth.email")}
                      </label>
                      <Field
                        name="email"
                        type="email"
                        className="w-full rounded-xl bg-stone-950/70 border border-gray-700 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                        placeholder="example@domain.com"
                      />
                      <div className="min-h-[18px]">
                        <ErrorMessage
                          name="email"
                          component="div"
                          className="mt-1 text-xs text-red-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-400 mb-1">
                        {t("auth.phone")}
                      </label>
                      <div className="relative">
                        <Field
                          name="phoneNumber"
                          type="tel"
                          className="w-full rounded-xl bg-stone-950/70 border border-gray-700 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                          placeholder="+7 999 000 00 00"
                        />
                      </div>
                      <div className="min-h-[18px]">
                        <ErrorMessage
                          name="phoneNumber"
                          component="div"
                          className="mt-1 text-xs text-red-400"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full rounded-full bg-white text-black text-sm font-medium py-2.5 hover:bg-gray-200 transition-colors disabled:opacity-70"
                    >
                      {t("profile.saveChanges")}
                    </button>
                  </Form>
                )}
              </Formik>
            </section>

            <section className="rounded-3xl border border-gray-800 bg-stone-900/80 shadow-[0_0_40px_rgba(0,0,0,0.5)] p-6">
              <h2 className="text-lg font-semibold mb-1">
                {t("profile.changePassword")}
              </h2>
              <p className="text-xs text-gray-400 mb-4">
                {t("profile.changePasswordRecommendation")}
              </p>

              {passwordError && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/40 text-red-400 text-sm">
                  {passwordError}
                </div>
              )}
              {passwordSuccess && (
                <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 text-sm">
                  {t("profile.updatePassword")} {t("profile.success")}
                </div>
              )}
              <Formik
                initialValues={{
                  currentPassword: "",
                  newPassword: "",
                  confirmNewPassword: "",
                }}
                validationSchema={passwordValidationSchema}
                onSubmit={handleChangePassword}
              >
                {({ isSubmitting }) => (
                  <Form className="space-y-4">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">
                        {t("profile.currentPassword")}
                      </label>
                      <Field
                        name="currentPassword"
                        type="password"
                        className="w-full rounded-xl bg-stone-950/70 border border-gray-700 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                        placeholder={t("profile.currentPasswordPlaceholder")}
                      />
                      <div className="min-h-[18px]">
                        <ErrorMessage
                          name="currentPassword"
                          component="div"
                          className="mt-1 text-xs text-red-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-400 mb-1">
                        {t("profile.newPassword")}
                      </label>
                      <Field
                        name="newPassword"
                        type="password"
                        className="w-full rounded-xl bg-stone-950/70 border border-gray-700 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                        placeholder={t("profile.newPasswordPlaceholder")}
                      />
                      <div className="min-h-[18px]">
                        <ErrorMessage
                          name="newPassword"
                          component="div"
                          className="mt-1 text-xs text-red-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-400 mb-1">
                        {t("profile.confirmNewPassword")}
                      </label>
                      <Field
                        name="confirmNewPassword"
                        type="password"
                        className="w-full rounded-xl bg-stone-950/70 border border-gray-700 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                        placeholder={t("profile.confirmNewPasswordPlaceholder")}
                      />
                      <div className="min-h-[18px]">
                        <ErrorMessage
                          name="confirmNewPassword"
                          component="div"
                          className="mt-1 text-xs text-red-400"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full rounded-full bg-stone-950 text-white border border-gray-700 text-sm font-medium py-2.5 hover:bg-gray-900 transition-colors disabled:opacity-70"
                    >
                      {t("profile.updatePassword")}
                    </button>
                  </Form>
                )}
              </Formik>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
