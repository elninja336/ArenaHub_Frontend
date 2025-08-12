import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import BookingPage from "./pages/BookingPage";
import LandingPage from "./pages/LandingPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/" element={<LandingPage />} />
      </Routes>
    </Router>
  );
}

export default App;
