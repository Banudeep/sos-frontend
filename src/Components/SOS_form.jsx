import React, { useState, useRef } from "react";
import { MdKeyboardVoice } from "react-icons/md";
import { FaImage } from "react-icons/fa";
import styles from "./SOS_form.module.css"; // Import the CSS module

function SOSForm() {
  const [text, setText] = useState("");
  const [images, setImages] = useState([]);
  const fileInputRef = useRef(null); // Ref to handle file input

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
      const transcript = event.results[0][0].transcript; // Capture the speech transcript
      setText(transcript); // Update local state
      recognition.stop();

      // Send the transcript to the Node.js server
      fetch("http://localhost:3000/Voice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ voiceInput: transcript }),
      })
        .then((response) => response.json())
        .then((data) => {
          alert(`Response from server: ${data.message}`);
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
    const files = event.target.files;
    setImages([...files]);

    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append("images", file);
    });

    fetch("http://localhost:3000/Image", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => alert(`Response from server: ${data.message}`))
      .catch((error) => console.error("Error:", error));
  };

  const submitAccidentReport = (event) => {
    event.preventDefault();
    console.log("Submitting Accident Report:", { text, images });
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
