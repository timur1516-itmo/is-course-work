import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { authService } from "../../services/api";

type AuthState = "unknown" | "authed" | "unauthed";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const [state, setState] = useState<AuthState>("unknown");

  useEffect(() => {
    let alive = true;

    authService.getCurrentUser()
        .then(() => { if (alive) setState("authed"); })
        .catch((_) => {
          // если это 401 — точно не залогинен
          if (alive) setState("unauthed");
        });

    return () => { alive = false; };
  }, [location.pathname]);

  if (state === "unknown") {
    // можно заменить на свой спиннер
    return null;
  }

  if (state === "unauthed") {
    // В BFF не надо вести на "/auth", ведём на gateway login:
    // либо через Navigate на страницу, где ты сам сделаешь window.location,
    // либо напрямую window.location тут (проще).
    authService.login(); // делает redirect на /oauth2/authorization/gateway
    return null;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
