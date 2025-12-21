import './App.scss'
import Header from "./components/layout/header/Header.tsx";
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import Footer from "./components/layout/footer/Footer.tsx";
import AuthPage from "./components/pages/login/AuthPage.tsx";
import Profile from "./components/pages/profile/Profile.tsx";
import ManagerDashboard from "./components/pages/manager/ManagerDashboard.tsx";
import ApplicationsList from "./components/pages/manager/ApplicationsList.tsx";
import DesignerDashboard from "./components/pages/designer/DesignerDashboard.tsx";
import Catalog from "./components/pages/catalog/Catalog.tsx";
import ProductCard from "./components/pages/catalog/ProductCard.tsx";
import HomePage from "./components/pages/home/HomePage.tsx";
import CreateApplication from "./components/pages/application/CreateApplication.tsx";
import OrderDetails from "./components/pages/order/OrderDetails.tsx";
import StaffAuthPage from "./components/pages/login/StaffAuthPage.tsx";
import ProtectedRoute from "./components/common/ProtectedRoute.tsx";
import AboutPage from "./components/pages/about/AboutPage.tsx";
import DiscountsPage from "./components/pages/discounts/DiscountsPage.tsx";
import LegalPage from "./components/pages/legal/LegalPage.tsx";
import {APP_TYPE, IS_CLIENT, IS_STAFF} from "./config/app.ts";
import { useEffect } from "react";
import OperatorDashboard from "./components/pages/operator/OperatorDashboard.tsx";
import WarehouseDashboard from "./components/pages/warehouse/WarehouseDashboard.tsx";

function App() {
  useEffect(() => {
    console.log(`Running ${APP_TYPE} version`);
  }, []);

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Header />

        <main className="flex-1 bg-stone-950">
          <Routes>
            {IS_CLIENT && (
            <>
              <Route path="/" element={<HomePage/>}/>
              <Route path="/about" element={<AboutPage/>}/>
              <Route path="/discounts" element={<DiscountsPage/>}/>
              <Route path="/legal" element={<LegalPage/>}/>
              <Route path="/catalog" element={<Catalog/>}/>
              <Route path="/catalog/:id" element={<ProductCard/>}/>
              <Route path="/applications/create" element={<CreateApplication/>}/>
              <Route path="/orders/:id" element={<OrderDetails/>}/>
              <Route path="/auth" element={<AuthPage/>}/>
              <Route path="/profile" element={<Profile/>}/>
            </>)}
            {IS_STAFF && (
              <>
                <Route path="/auth" element={<StaffAuthPage/>}/>
                <Route
                  path="/manager"
                  element={
                    <ProtectedRoute>
                      <ManagerDashboard/>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/manager/applications"
                  element={
                    <ProtectedRoute>
                      <ApplicationsList/>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders/:id"
                  element={
                    <ProtectedRoute>
                      <OrderDetails/>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/designer"
                  element={
                    <ProtectedRoute>
                      <DesignerDashboard/>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/operator"
                  element={
                    <ProtectedRoute>
                      <OperatorDashboard/>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/warehouse"
                  element={
                    <ProtectedRoute>
                      <WarehouseDashboard/>
                    </ProtectedRoute>
                  }
                />
              </>
            )}
          </Routes>
        </main>

        {IS_CLIENT && (
          <Footer />
        )}
      </div>
    </Router>
  );
}

export default App
