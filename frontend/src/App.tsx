import './App.scss'
import Header from "./components/layout/header/Header.tsx";
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import Footer from "./components/layout/footer/Footer.tsx";
import AuthPage from "./components/pages/login/AuthPage.tsx";
import Profile from "./components/pages/profile/Profile.tsx";
import {APP_TYPE, IS_CLIENT, IS_STAFF} from "./config/app.ts";
import { useEffect } from "react";

function App() {
  useEffect(() => {
    console.log(`Running ${APP_TYPE} version`);
  }, []);

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Header />

        <main className="flex-1">
          <Routes>
            {IS_CLIENT && (
            <>
              <Route path="/auth" element={<AuthPage/>}/>
              <Route path="/profile" element={<Profile/>}/>
            </>)}
            {IS_STAFF && (
              <>
              </>
            )}
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App
