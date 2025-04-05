import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaAmbulance,
  FaLocationArrow,
  FaExclamationTriangle,
} from "react-icons/fa";
import styles from "./Home.module.css";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const goToSOSPage = (serverResponse) => {
    navigate("/sos", { state: { serverResponse } });
  };

  const sendSOS = () => {
    setLoading(true);
    console.log("🚨 SOS Alert Sent! 🚨");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const timestamp = new Date().toISOString();

        fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
        )
          .then((response) => response.json())
          .then((data) => {
            const locationDetails = {
              latitude,
              longitude,
              city: data.city || "Unknown city",
              state: data.principalSubdivision || "Unknown state",
            };

            console.log("Sending the following data to the server: ", {
              timestamp,
              location: locationDetails,
            });
            let SOS_API_URL = import.meta.env.VITE_SOS_API_URL + "/report";

            return fetch(SOS_API_URL, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                timestamp,
                location: locationDetails,
              }),
            });
          })
          .then((response) => response.json())
          .then((serverResponse) => {
            console.log({ serverResponse });
            setLoading(false);
            goToSOSPage(serverResponse.accidentId);
          })
          .catch((error) => {
            console.error("Error:", error);
            setLoading(false);
            setMessage("Error sending SOS. Please try again.");
          });
      },
      (error) => {
        console.error("Error getting location:", error);
        setLoading(false);
        setMessage("Error getting location. Please enable location services.");
      }
    );
  };
  //
  return (
    <div className={styles.container}>
      <header className={styles.emergencyHeader}>
        <FaAmbulance className={styles.headerIcon} />
        <h1>Emergency Response System</h1>
      </header>

      <main className={styles.mainContent}>
        <div className={styles.sosButtonContainer}>
          <button
            className={styles.sosButton}
            onClick={sendSOS}
            disabled={loading}
          >
            {loading ? (
              <div className={styles.spinner} />
            ) : (
              <div className={styles.sosText}>
                <FaExclamationTriangle />
                SOS
              </div>
            )}
          </button>
        </div>

        <div className={styles.locationInfo}>
          <FaLocationArrow className={styles.locationIcon} />
          Your location will be automatically shared with emergency services
        </div>

        {message && <div className={styles.messageBox}>{message}</div>}

        <footer className={styles.footer}>
          In case of emergency, tap the SOS button above
          <div className={styles.disclaimer}>
            This will immediately alert emergency services
          </div>
        </footer>
      </main>
    </div>
  );
}
