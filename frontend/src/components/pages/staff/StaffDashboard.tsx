import { useUserRole } from "../../../hooks/useUserRole.ts";
import ManagerDashboard from "../manager/ManagerDashboard.tsx";
import DesignerDashboard from "../designer/DesignerDashboard.tsx";
import OperatorDashboard from "../operator/OperatorDashboard.tsx";
import WarehouseDashboard from "../warehouse/WarehouseDashboard.tsx";
import AdminDashboard from "../admin/AdminDashboard.tsx";
import ApplicationsList from "../manager/ApplicationsList.tsx";
import { useLocation } from "react-router-dom";

function StaffDashboard() {
  const { role, loading } = useUserRole();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (location.pathname === "/manager/applications" || location.pathname === "/applications") {
    return <ApplicationsList />;
  }

  switch (role) {
    case "SALES_MANAGER":
      return <ManagerDashboard />;
    case "CONSTRUCTOR":
      return <DesignerDashboard />;
    case "CNC_OPERATOR":
      return <OperatorDashboard />;
    case "WAREHOUSE_WORKER":
    case "SUPPLY_MANAGER":
      return <WarehouseDashboard />;
    case "ADMIN":
      return <AdminDashboard />;
    default:
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-white">Unknown role: {role}</div>
        </div>
      );
  }
}

export default StaffDashboard;

