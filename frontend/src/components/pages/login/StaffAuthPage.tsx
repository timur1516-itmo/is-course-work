import { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import { authService, extractApiError, type AccountRole } from "../../../services/api";
import type { TFunction } from "i18next";

const PASSWORD_REGEX = /^[A-Za-z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+$/;

const getLoginSchema = (t: TFunction) => Yup.object({
  username: Yup.string()
    .required(t("auth.requiredField")),
  password: Yup.string()
    .required(t("auth.inputPassword"))
    .min(8, t("auth.minLength"))
    .matches(PASSWORD_REGEX, t("auth.invalidPassword")),
});

function StaffAuthPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authService.isAuthenticated()) {
      const role = authService.getRole();
      const defaultRoute = getDefaultRouteForRole(role);
      const from = (location.state as { from?: string })?.from || defaultRoute;
      navigate(from, { replace: true });
    }
  }, [navigate, location]);

  const getDefaultRouteForRole = (role: AccountRole | null): string => {
    switch (role) {
      case 'SALES_MANAGER':
        return '/manager';
      case 'CONSTRUCTOR':
        return '/designer';
      case 'CNC_OPERATOR':
        return '/operator';
      case 'WAREHOUSE_WORKER':
        return '/warehouse';
      case 'SUPPLY_MANAGER':
        return '/warehouse';
      case 'ADMIN':
        return '/admin';
      default:
        return '/manager';
    }
  };

  const loginSchema = getLoginSchema(t);

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-950 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-gray-800 bg-stone-900/80 shadow-[0_0_40px_rgba(0,0,0,0.5)] backdrop-blur-md p-8">
          <h1 className="text-2xl font-semibold text-white mb-6 text-center">
            {t("auth.staffLogin")}
          </h1>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/40 text-red-400 text-sm">
              {error}
            </div>
          )}

          <Formik
            initialValues={{ username: "", password: "" }}
            validationSchema={loginSchema}
            onSubmit={async (values) => {
              try {
                setLoading(true);
                setError(null);
                const loginResponse = await authService.login({
                  username: values.username,
                  password: values.password,
                });
                const defaultRoute = getDefaultRouteForRole(loginResponse.role);
                const from = (location.state as { from?: string })?.from || defaultRoute;
                navigate(from, { replace: true });
              } catch (err) {
                const apiError = extractApiError(err);
                setError(apiError.message || t("auth.loginError"));
              } finally {
                setLoading(false);
              }
            }}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">
                    {t("auth.username")}
                  </label>
                  <Field
                    name="username"
                    type="text"
                    autoComplete="username"
                    className="w-full rounded-xl bg-stone-950/70 border border-gray-700 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                    placeholder={t("auth.usernamePlaceholder")}
                  />
                  <div className="min-h-[18px]">
                    <ErrorMessage
                      name="username"
                      component="div"
                      className="mt-1 text-xs text-red-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-1">
                    {t("auth.password")}
                  </label>
                  <Field
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    className="w-full rounded-xl bg-stone-950/70 border border-gray-700 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                    placeholder={t("auth.inputPassword")}
                  />
                  <div className="min-h-[18px]">
                    <ErrorMessage
                      name="password"
                      component="div"
                      className="mt-1 text-xs text-red-400"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || loading}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium transition-colors"
                >
                  {loading ? t("auth.loggingIn") : t("auth.signIn")}
                </button>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
}

export default StaffAuthPage;

