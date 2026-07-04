import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Test from "./pages/Test";
import Result from "./pages/Result";
import AllTypes from "./pages/AllTypes";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/test" element={<Test />} />
                <Route path="/result" element={<Result />} />
                <Route path="/all" element={<AllTypes />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
