import React from "react";
import { useParams } from "react-router-dom";
import React, { useState, useEffect } from "react";

function Ambulance() {
  let { accidentId } = useParams();
  useEffect(() => {
    console.log("Accident ID from URL:", accidentId);
    // You can now use `accidentId` to fetch data or perform other actions
    retrieveAccidentDetails(accidentId);
  }, [accidentId]);

  const [PredictedClass, setPredictedClass] = useState();
  const [body_parts, setBody_parts] = useState();
  retrieve();
  function retrieve() {
    // console.log("Uploading image to server...", image, accidentId);
    let SOS_API_URL = import.meta.env.VITE_SOS_API_URL + "/ambulance";
    fetch(SOS_API_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        base64: image,
        accidentId: accidentId,
      }),
    })
      .then((response) => {
        if (response.ok) {
          setPredictedClass(response.json(PredictedClass));
          setBody_parts(response.json(body_parts));
          return response.json(); // Parse the JSON of the response if the call was successful
        }
        throw new Error("Network response was not ok."); // Throw an error if the call was not successful
      })
      .then((data) => {
        console.log(data); // Log the data returned from the server
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("Failed to retrieve data from server.");
      });
  }

  return (
    <>
      <div>Ambulance</div>
      <div>{PredictedClass}</div>
      <div>{body_parts}</div>
    </>
  );
}

export default Ambulance;
