import './App.scss'
import Header from "./components/layout/header/Header.tsx";
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route></Route>
      </Routes>
    </Router>
  )
}

export default App
