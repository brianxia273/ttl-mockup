import { Route, Routes } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import HomePage from "./pages/HomePage";
import MyToysPage from "./pages/MyToysPage";

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/mytoys" element={<MyToysPage />} />
      </Routes>
      <Footer />
    </>
  );
}
