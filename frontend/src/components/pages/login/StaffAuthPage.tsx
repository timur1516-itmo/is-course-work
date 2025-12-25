import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import { authService, extractApiError, type AccountRole } from "../../../services/api";

function StaffAuthPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [redirecting, setRedirecting] = useState(false);

  const getDefaultRouteForRole = (role: AccountRole | null): string => {
    switch (role) {
      case "SALES_MANAGER":
        return "/manager";
      case "CONSTRUCTOR":
        return "/designer";
      case "CNC_OPERATOR":
        return "/operator";
      case "WAREHOUSE_WORKER":
      case "SUPPLY_MANAGER":
        return "/warehouse";
      case "ADMIN":
        return "/admin";
      default:
        return "/manager";
    }
  };

  const from = useMemo(() => {
    const stateFrom = (location.state as { from?: string })?.from;
    return stateFrom || null;
  }, [location.state]);

  // 1) Если уже залогинен — сразу отправляем на нужную страницу
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setChecking(true);
        setError(null);

        const me = await authService.getCurrentUser(); // /me
        if (!alive) return;

        const defaultRoute = getDefaultRouteForRole(me.role);
        navigate(from || defaultRoute, { replace: true });
      } catch (err: any) {
        if (!alive) return;

        // 401 = просто не залогинен → остаёмся на странице и показываем кнопку входа
        if (err?.status === 401) {
          setChecking(false);
          return;
        }

        const apiError = extractApiError(err);
        setError(apiError.message || "Ошибка проверки авторизации");
        setChecking(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [navigate, from]);

  // 2) Вход = redirect на gateway
  const handleLogin = () => {
    try {
      setRedirecting(true);
      setError(null);
      authService.login(); // window.location.href на /oauth2/authorization/gateway
    } catch (e) {
      setRedirecting(false);
      const apiError = extractApiError(e);
      setError(apiError.message || t("auth.loginError"));
    }
  };

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

            {checking ? (
                <div className="text-center text-sm text-gray-400">
                  {t("catalog.loading")}
                </div>
            ) : (
                <button
                    type="button"
                    onClick={handleLogin}
                    disabled={redirecting}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium transition-colors"
                >
                  {redirecting ? t("auth.loggingIn") : t("auth.signIn")}
                </button>
            )}

            <p className="mt-4 text-xs text-gray-500 text-center">
              {/* Можно оставить подсказку */}
              Вход выполняется через сервер авторизации.
            </p>
          </div>
        </div>
      </div>
  );
}

export default StaffAuthPage;
