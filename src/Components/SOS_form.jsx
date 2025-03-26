import React, { useState, useRef, useEffect } from "react";
import { MdKeyboardVoice } from "react-icons/md";
import { FaImage } from "react-icons/fa";
import styles from "./SOS_form.module.css"; // Import the CSS module
import { useLocation } from "react-router-dom";

function SOSForm() {
  const [text, setText] = useState("");
  const fileInputRef = useRef(null); // Ref to handle file input
  const [image, setImage] = useState();

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

      let FLASK_API = import.meta.env.VITE_FLASK_API + "/report";
      fetch(FLASK_API, {
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

  function handleFileChange(event) {
    console.log(event);
    var reader = new FileReader();
    reader.readAsDataURL(event.target.files[0]);
    reader.onload = () => {
      setImage(reader.result);
      console.log(reader.result);
    };
    reader.onerror = (error) => {
      console.log("Error: ", error);
    };
  }

  useEffect(() => {
    // console.log("Image changed: ", image);
    uploadImage();
  }, [image]);

  function uploadImage() {
    // console.log("Uploading image to server...", image, accidentId);
    let SOS_API_URL = import.meta.env.VITE_SOS_API_URL + "/image";
    fetch(SOS_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        base64: image,
        accidentId: accidentId,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        // setImages([...images, data.url]);
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("Failed to upload image to server.");
      });
  }

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
          <input type="file" accept="image/" onChange={handleFileChange} />
          {image == "" || image == null ? (
            ""
          ) : (
            <img width={100} height={100} src={image} />
          )}
        </div>
        <button type="submit" className={styles.submitButton}>
          Submit Report
        </button>
      </form>
    </div>
  );
}

export default SOSForm;
