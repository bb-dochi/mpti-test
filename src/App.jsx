import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Test from "./pages/Test";
import Result from "./pages/Result";
import AllTypes from "./pages/AllTypes";
import { LanguageProvider } from "./components/LanguageContext";
import LanguageSelector from "./components/LanguageSelector";

function App() {
    return (
        <BrowserRouter>
            <LanguageProvider>
                <LanguageSelector />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/test" element={<Test />} />
                    <Route path="/result" element={<Result />} />
                    <Route path="/all" element={<AllTypes />} />
                </Routes>
            </LanguageProvider>
        </BrowserRouter>
    );
}
export default App;
