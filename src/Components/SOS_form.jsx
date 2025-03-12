import React, { useState, useRef } from "react";
import { MdKeyboardVoice } from "react-icons/md";
import { FaImage } from "react-icons/fa";
import styles from "./SOS_form.module.css"; // Import the CSS module
import { useLocation } from "react-router-dom";

function SOSForm() {
  const [text, setText] = useState("");
  const [images, setImages] = useState([]);
  const fileInputRef = useRef(null); // Ref to handle file input
  const VITE_SOS_API_URL = process.env.VITE_SOS_API_URL;

  const location = useLocation();
  const accidentId = location.state?.serverResponse;
  // console.log(accidentId, "accidentId");

  const handleTextChange = (event) => {
    setText(event.target.value);
  };

  const handleVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert(
        "Your browser does not support speech recognition. Please use a different browser or switch to text input."
      );
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognition.start();

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      console.log("Recognized Speech:", transcript); // Debugging output
      setText(transcript); // Update local state
      recognition.stop();

      const payload = {
        voiceInput: transcript,
        accidentId: accidentId,
      };

      console.log("Sending to server:", JSON.stringify(payload)); // Print JSON string before sending
      let SOS_API_URL = import.meta.env.VITE_SOS_API_URL + "/voice";
      // Send the transcript to the Node.js server
      fetch(SOS_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
        .then((response) => response.json())
        .then((data) => {
          alert(`Response from server: ${data.message}`);
          console.log("API call for voice: ", data);
        })
        .catch((error) => {
          console.error("Error:", error);
          alert("Failed to send voice data to server.");
        });
    };

    recognition.onerror = (event) => {
      alert("Error occurred in speech recognition: " + event.error);
      recognition.stop();
    };
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    console.log(event);
    if (!file) {
      alert("Please select an image to upload.");
      return;
    }

    const reader = new FileReader();
    reader.onload = function (evt) {
      const base64Image = evt.target.result; // This is the Base64-encoded image

      // Now send this Base64 string to the server as part of the JSON object
      sendDataToServer(base64Image);
    };
    reader.readAsDataURL(file);
  };

  const sendDataToServer = (base64Image) => {
    const payload = {
      image: base64Image,
      accidentId: accidentId, // Assuming 'accidentId' is available in your scope
    };
    let SOS_API_URL = import.meta.env.VITE_SOS_API_URL + "/image";
    fetch(SOS_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((response) => response.json())
      .then((data) => {
        alert(`Server response: ${data.message}`);
      })
      .catch((error) => {
        console.error("Error uploading image:", error);
        alert("Failed to upload image.");
      });
  };

  const submitAccidentReport = (event) => {
    event.preventDefault();
    // console.log("Submitting Accident Report:", { text, images });
    // Further processing or server submission would go here
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.formHeader}>Accident Report Form</h1>
      <form onSubmit={submitAccidentReport}>
        <div className={styles.inputGroup}>
          <textarea
            value={text}
            onChange={handleTextChange}
            placeholder="Type here or use voice input..."
            className={styles.textInput}
          />
          <button onClick={handleVoiceInput} className={styles.voiceButton}>
            <MdKeyboardVoice />
          </button>
        </div>
        <div className={styles.fileInputContainer}>
          <button
            onClick={() => fileInputRef.current.click()}
            className={styles.fileButton}
          >
            Upload Images <FaImage className={styles.iconLeftMargin} />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            id="accidentImages"
            multiple
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
        </div>
        <button type="submit" className={styles.submitButton}>
          Submit Report
        </button>
      </form>
    </div>
  );
}

export default SOSForm;
