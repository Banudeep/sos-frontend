import React from "react";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { FaAmbulance } from "react-icons/fa";
import styles from "./Ambulance.module.css";

function Ambulance() {
  let { accidentId } = useParams();
  const [predictedClass, setPredictedClass] = useState(null);
  const [bodyParts, setBodyParts] = useState([]);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await Promise.all([
          retrieveAccidentDetails(accidentId),
          retrieveImage(accidentId),
        ]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (accidentId) {
      fetchData();
    }
  }, [accidentId]);

  async function retrieveImage() {
    try {
      let SOS_API_URL =
        import.meta.env.VITE_SOS_API_URL + "/report/" + accidentId;
      const response = await fetch(SOS_API_URL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch image");
      }

      const data = await response.json();
      setImage(data.image);
    } catch (error) {
      console.error("Error:", error);
      throw new Error("Failed to retrieve image");
    }
  }

  async function retrieveAccidentDetails() {
    try {
      let SOS_API_URL =
        import.meta.env.VITE_SOS_API_URL + "/ambulance/" + accidentId;
      const response = await fetch(SOS_API_URL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch accident details");
      }

      const data = await response.json();
      setPredictedClass(data.PredictedClass);
      setBodyParts(data.body_parts || []);
    } catch (error) {
      console.error("Error:", error);
      throw new Error("Failed to retrieve accident details");
    }
  }

  const getSeverityText = (predictedClass) => {
    switch (predictedClass) {
      case 0:
        return "Minor Accident";
      case 1:
        return "Moderate Accident";
      case 2:
        return "Severe Accident";
      default:
        return "Unknown Severity";
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <FaAmbulance className={styles.headerIcon} />
          <h1>Loading...</h1>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <FaAmbulance className={styles.headerIcon} />
          <h1>Error</h1>
        </div>
        <div className={styles.content}>
          <div className={styles.infoSection}>
            <div className={styles.infoValue}>{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <FaAmbulance className={styles.headerIcon} />
        <h1>Accident Details</h1>
      </div>

      <div className={styles.content}>
        {image && (
          <div className={styles.infoSection}>
            <div className={styles.infoLabel}>Accident Scene</div>
            <div className={styles.imageContainer}>
              <img src={image} alt="Accident scene" />
            </div>
          </div>
        )}

        <div className={styles.infoSection}>
          <div className={styles.infoLabel}>Severity Assessment</div>
          <div className={styles.infoValue}>
            {getSeverityText(predictedClass)}
          </div>
        </div>

        {bodyParts && bodyParts.length > 0 && (
          <div className={styles.infoSection}>
            <div className={styles.infoLabel}>Reported Injuries</div>
            <div className={styles.bodyParts}>
              {bodyParts.map((part, index) => (
                <span key={index} className={styles.bodyPart}>
                  {part}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Ambulance;
