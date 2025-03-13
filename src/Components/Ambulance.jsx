import React from "react";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import styles from "./Ambulance.module.css";

function Ambulance() {
  let { accidentId } = useParams();
  useEffect(() => {
    console.log("Accident ID from URL:", accidentId);
    // You can now use `accidentId` to fetch data or perform other actions
    retrieveAccidentDetails(accidentId);
  }, [accidentId]);

  const [PredictedClass, setPredictedClass] = useState();
  const [body_parts, setBody_parts] = useState();

  useEffect(() => {
    console.log(PredictedClass, body_parts);
  }, [PredictedClass, body_parts]);

  function retrieveAccidentDetails() {
    // console.log("Uploading image to server...", image, accidentId);
    let SOS_API_URL =
      import.meta.env.VITE_SOS_API_URL + "/ambulance/" + accidentId;
    fetch(SOS_API_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (response.ok) {
          return response.json(); // Parse the JSON of the response if the call was successful
        }
        throw new Error("Network response was not ok."); // Throw an error if the call was not successful
      })
      .then((data) => {
        console.log(data); // Log the data returned from the server
        setPredictedClass(data.PredictedClass);
        setBody_parts(data.body_parts);
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("Failed to retrieve data from server.");
      });
  }

  return (
    <div className={styles.container}>
      <h1>Ambulance</h1>
      <br></br>
      <div>Predicted Class: {PredictedClass}</div>
      <br></br>
      <div>Injured body parts: {body_parts}</div>
    </div>
  );
}

export default Ambulance;
