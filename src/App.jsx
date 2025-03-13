import { StrictMode } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Components/Home";
import SOS_form from "./Components/SOS_form";
import Ambulance from "./Components/Ambulance";

function App() {
  return (
    <StrictMode>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sos" element={<SOS_form />} />
          <Route path="/ambulance/:accidentId" element={<Ambulance />} />
        </Routes>
      </BrowserRouter>
    </StrictMode>
  );
}

export default App;
