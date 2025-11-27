import './App.scss'
import Header from "./components/layout/header/Header.tsx";
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import Footer from "./components/layout/footer/Footer.tsx";
import AuthPage from "./components/pages/login/AuthPage.tsx";

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Header />

        <main className="flex-1">
          <Routes>
            <Route path="/auth" element={<AuthPage/>}/>
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App
