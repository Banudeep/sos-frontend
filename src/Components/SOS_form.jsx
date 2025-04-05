import React, { useState } from "react";
import { MdKeyboardVoice } from "react-icons/md";
import { useLocation } from "react-router-dom";
import {
  FaAmbulance,
  FaImage,
  FaPaperPlane,
  FaMicrophone,
} from "react-icons/fa";
import styles from "./SOS_form.module.css";

export default function SOSForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const location = useLocation();
  const accidentId = location.state?.serverResponse;

  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First, send the voice/text description to Node.js server
      let SOS_API_URL = import.meta.env.VITE_SOS_API_URL + "/voice";
      let response = await fetch(SOS_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          voiceInput: description,
          accidentId: accidentId,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Error submitting description to Node.js server: ${response.status}`
        );
      }
      console.log({
        accidentID: accidentId,
        report: description,
      });

      // Send text data to Flask API
      let VITE_FLASK_API = import.meta.env.VITE_FLASK_API + "/report";
      response = await fetch(VITE_FLASK_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accidentID: accidentId,
          report: description,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error submitting to Flask API: ${response.status}`);
      }

      // If there's an image, send it separately
      if (selectedFile) {
        const reader = new FileReader();
        reader.onload = async () => {
          try {
            const base64Image = reader.result;

            // Send to Node.js server
            SOS_API_URL = import.meta.env.VITE_SOS_API_URL + "/image";
            response = await fetch(SOS_API_URL, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                base64: base64Image,
                accidentId: accidentId,
              }),
            });

            if (!response.ok) {
              throw new Error(
                `Error uploading image to Node.js server: ${response.status}`
              );
            }

            // console.log({
            //   accidentID: accidentId,
            //   image: base64Image.split(",")[1], // Remove data:image/xyz;base64, prefix
            // });

            console.log({
              accidentID: accidentId,
              image: base64Image, // Remove data:image/xyz;base64, prefix
            });

            // Send to Flask API\
            VITE_FLASK_API = import.meta.env.VITE_FLASK_API + "/upload";
            response = await fetch(VITE_FLASK_API, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                accidentID: accidentId,
                image: base64Image, // Remove data:image/xyz;base64, prefix
              }),
            });

            if (!response.ok) {
              throw new Error(
                `Error uploading image to Flask API: ${response.status}`
              );
            }

            setMessage("Details submitted successfully!");
            setDescription("");
            setSelectedFile(null);
          } catch (error) {
            console.error("Error uploading image:", error);
            setMessage("Error uploading image. Please try again.");
          }
        };

        reader.onerror = () => {
          console.error("Error reading file");
          setMessage("Error reading image file. Please try again.");
        };

        reader.readAsDataURL(selectedFile);
      } else {
        setMessage("Details submitted successfully!");
        setDescription("");
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage(
        error.message || "Error submitting details. Please try again."
      );
    } finally {
      setLoading(false);
    }

    // Call for ambulance driver assignment
    // let VITE_FLASK_API = import.meta.env.VITE_FLASK_API + "/";
    // response = await fetch(VITE_FLASK_API, {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({
    //     accidentID: accidentId,
    //   }),
    // });
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window)) {
      setError("Speech recognition is not supported in your browser");
      return;
    }

    setIsRecording(true);
    setError("");

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognition.start();

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setDescription(
        (prevDescription) =>
          prevDescription + (prevDescription ? " " : "") + transcript
      );
      setIsRecording(false);
    };

    recognition.onerror = (event) => {
      setError("Error in speech recognition. Please try again.");
      setIsRecording(false);
      recognition.stop();
    };

    recognition.onend = () => {
      setIsRecording(false);
    };
  };

  return (
    <div className={styles.container}>
      <header className={styles.formHeader}>
        <FaAmbulance className={styles.headerIcon} />
        <h1>Accident Details</h1>
      </header>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.inputGroup}>
          <label className={styles.label}>
            Please describe the accident situation
          </label>
          <div className={styles.inputWrapper}>
            <textarea
              className={styles.textInput}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide details about the accident..."
              required
            />
            <button
              type="button"
              onClick={handleVoiceInput}
              className={styles.voiceButton}
              disabled={isRecording}
              title="Click to use voice input"
            >
              {isRecording ? (
                <FaMicrophone className={styles.pulsingIcon} />
              ) : (
                <MdKeyboardVoice />
              )}
            </button>
          </div>
          {error && <div className={styles.error}>{error}</div>}
        </div>

        <div className={styles.fileInputContainer}>
          <label className={styles.label}>Upload accident scene photo</label>
          <label className={styles.fileButton}>
            <FaImage className={styles.fileIcon} />
            {selectedFile ? selectedFile.name : "Choose an image"}
            <input
              type="file"
              onChange={handleFileChange}
              accept="image/*"
              style={{ display: "none" }}
            />
          </label>
        </div>

        <button
          type="submit"
          className={styles.submitButton}
          disabled={loading || !description}
        >
          {loading ? (
            <div className={styles.spinner} />
          ) : (
            <>
              <FaPaperPlane />
              Submit Details
            </>
          )}
        </button>
      </form>

      {message && (
        <div
          className={`${styles.messageBox} ${
            message.includes("Error") ? styles.error : styles.success
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
}
