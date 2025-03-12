import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Home.module.css";
import { useLocation } from "react-router-dom";

export default function App() {
  const [message, setMessage] = useState("");
  const navigate = useNavigate(); // Hook to get the navigate function
  const VITE_SOS_API_URL = process.env.VITE_SOS_API_URL;
  const goToSOSPage = (serverResponse) => {
    navigate("/sos", { state: { serverResponse } }); // Navigate to the SOS page after sending SOS
  };

  const sendSOS = () => {
    setMessage("SOS Alert Sent!");
    console.log("🚨 SOS Alert Sent! 🚨");
    alert("SOS Alert Sent!");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const timestamp = new Date().toISOString(); // ISO format timestamp

        // Optionally add reverse geocoding to fetch city and state
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

            // Log the data before sending it to the server
            console.log("Sending the following data to the server:", {
              timestamp,
              location: locationDetails,
            });
            let SOS_API_URL = import.meta.env.VITE_SOS_API_URL + "/report";
            // Send data to Node.js server
            fetch(SOS_API_URL, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                timestamp,
                location: locationDetails,
              }),
            })
              .then((response) => response.json())
              .then((serverResponse) => {
                alert(`Response from server: ${serverResponse.message}`);
                console.log({ serverResponse });
                goToSOSPage(serverResponse.accidentId); // Navigate after successful server response
              })
              .catch((error) => console.error("Error:", error));
          })
          .catch((error) =>
            console.error("Error with reverse geocoding:", error)
          );
      },
      (error) => {
        console.error("Error getting location:", error);
      }
    );
  };

  return (
    <div className={styles.container}>
      <header className="bg-red-500 text-white py-4 px-8 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold">SOS Alert System</h1>
      </header>
      <button onClick={sendSOS}>Send SOS 🚨</button>
      {message && <p className="mt-4 text-lg text-red-700">{message}</p>}
    </div>
  );
}
