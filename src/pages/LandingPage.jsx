import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../axiosInstance";
import "../styles/LandingPage.css";

export default function LandingPage() {
  const [stadiums, setStadiums] = useState([]);
  const [selectedStadiumID, setSelectedStadiumID] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axiosInstance.get("/stadiums")
      .then(res => setStadiums(res.data))
      .catch(err => console.error("Error fetching stadiums:", err));
  }, []);

  const handleCardClick = (stadiumID) => {
    setSelectedStadiumID(stadiumID);
  };

  const handleViewBookClick = () => {
    if (selectedStadiumID) {
      navigate("/booking", { state: { stadiumID: selectedStadiumID } });
    }
  };

  return (
    <>
      <header className="header">
        <div className="container header-container">
          <h1 className="logo">ArenaHub</h1>
          <nav>
            <ul className="nav-links">
              <li><a href="#about">About</a></li>
              <li><a href="#stadiums">Stadiums</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="main-content container">
        <section className="hero" id="about">
          <h2>Welcome to ArenaHub</h2>
          <p>Your premier destination to book stadium slots effortlessly and securely.</p>
          <p>Explore our stadiums below and select the perfect venue for your event.</p>
        </section>

        <section className="stadium-selection" id="stadiums">
          <h3>Choose Your Stadium</h3>
          <div className="stadiums-grid">
            {stadiums.length === 0 && <p>Loading stadiums...</p>}
            {stadiums.map((stadium) => (
              <div
                key={stadium.stadiumID}
                className={`stadium-card ${selectedStadiumID === stadium.stadiumID ? "selected" : ""}`}
                onClick={() => handleCardClick(stadium.stadiumID)}
                tabIndex={0}
                role="button"
                onKeyDown={(e) => { if (e.key === "Enter") handleCardClick(stadium.stadiumID); }}
                aria-pressed={selectedStadiumID === stadium.stadiumID}
              >
                <h4>{stadium.name}</h4>
                <p><strong>Location:</strong> {stadium.location.city}, {stadium.location.region}</p>
                <p><strong>Capacity:</strong> {stadium.playerCapacity} players</p>
                <p><strong>Price:</strong> TZS - {stadium.price.toFixed(2)}</p>

                {selectedStadiumID === stadium.stadiumID && (
                  <button
                    className="btn-view-book"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewBookClick();
                    }}
                    aria-label={`View and book ${stadium.name}`}
                  >
                    View &amp; Book
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="contact-us" id="contact">
          <h3>Need Assistance?</h3>
          <p>Contact our support team at <a href="mailto:support@arenahub.com">support@arenahub.com</a> or call <a href="tel:+1234567890">+1 234 567 890</a>.</p>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer-container">
          <p>© 2025 ArenaHub. All rights reserved.</p>
          <div className="social-links">
            <a href="#" aria-label="Facebook" target="_blank" rel="noopener noreferrer">Facebook</a> |{" "}
            <a href="#" aria-label="Twitter" target="_blank" rel="noopener noreferrer">Twitter</a> |{" "}
            <a href="#" aria-label="Instagram" target="_blank" rel="noopener noreferrer">Instagram</a>
          </div>
        </div>
      </footer>
    </>
  );
}
