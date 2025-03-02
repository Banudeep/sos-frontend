import { StrictMode } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Components/Home";
import SOS_form from "./Components/SOS_form";

function App() {
  return (
    <StrictMode>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sos" element={<SOS_form />} />
        </Routes>
      </BrowserRouter>
    </StrictMode>
  );
}

export default App;
