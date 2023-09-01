import React, { useEffect, useState, useRef } from "react";
import { styled } from "@mui/material/styles";
import "../App.css";
import Button from "@mui/material/Button";
import Navbar from "../components/Navbar";
import { Container, Row, Col, Spinner } from "react-bootstrap";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import { sizing } from "@mui/system";
import axios from "axios";
import { CircularProgress, LinearProgress } from "@mui/material";
import Stack from "@mui/material/Stack";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));

function Home() {
  const [file, setFile] = useState(null);
  const [prediction, setPrediction] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [results, setResults] = useState([]);
  const [loadingChatGPT, setLoadingChatGPT] = useState(false);
  const [loadingPrediction, setLoadingPrediction] = useState(false);
  const [open, setOpen] = React.useState(false);
  const titles = [
    "Details:",
    "Symptoms:",
    "Recommended Treatments:",
    "Preventive Measures:",
  ];

  const inputFileRef = useRef(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
    setPrediction("");
    setResults([]);
  };

  const handleCapturePhoto = () => {
    inputFileRef.current.click();
  };

  const handleCaptureCamera = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then(function (stream) {
          const mediaStreamTrack = stream.getVideoTracks()[0];
          const imageCapture = new ImageCapture(mediaStreamTrack);
          imageCapture
            .takePhoto()
            .then(function (blob) {
              setFile(blob);
              setPreviewUrl(URL.createObjectURL(blob));
            })
            .catch(function (error) {
              console.log("Error taking photo:", error);
            });
        })
        .catch(function (error) {
          console.log("Error accessing camera:", error);
        });
    } else {
      console.log("Camera not supported");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoadingPrediction(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/predict", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setPrediction(data.prediction);
        setLoadingPrediction(false);
        sendPredictionToAPI(data.prediction); // Send prediction to API
      } else {
        throw new Error("Request failed");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const splitByTitles = (informationString) => {
    const regex = new RegExp(`(${titles.join("|")})`, "g");
    const sections = informationString.split(regex);

    // Remove empty sections and trim whitespace
    const filteredSections = sections.filter(
      (section) => section.trim() !== ""
    );

    return filteredSections;
  };

  const sendPredictionToAPI = async (prediction) => {
    try {
      setLoadingChatGPT(true);
      let command = `list out separately the details, symptoms, recommended treatments, and preventive measures of ${
        prediction.split("___")[1]
      } disease`;
      const response = await axios.post("http://localhost:3000/", {
        prompt: command,
      });
      setResults(splitByTitles(response.data.completion));
      setLoadingChatGPT(false);
      console.log(splitByTitles(response.data.completion));
    } catch (error) {
      console.log(error);
    }
  };

  const sendData = async () => {
    try {
      const dataToSend = {
        prediction: prediction,
        details: results[1],
        symptoms: results[3],
        treatments: results[5],
        preventiveMeasures: results[7],
      };

      const response = await axios.post(
        "http://localhost:3000/results",
        dataToSend
      );
      setOpen(true);
    } catch (error) {
      console.error("Failed to send data:", error);
    }
  };

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };

  return (
    <div className="App">
      <Navbar />

      <div className="container">
        <div className="row">
          <div className="col-md-6 offset-md-3">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <input
                  ref={inputFileRef}
                  type="file"
                  className="form-control-file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
              </div>

              <div className="text-center" style={{ marginTop: "20px" }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleCapturePhoto}
                  style={{ marginRight: "10px" }}
                >
                  Upload a Photo
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleCaptureCamera}
                >
                  Capture from Camera
                </Button>
              </div>
              {previewUrl && (
                <div className="text-center">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    style={{ maxWidth: "300px", margin: "10px" }}
                  />
                </div>
              )}
              <div className="text-center">
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  style={{ margin: "10px" }}
                >
                  Search
                </Button>
              </div>
            </form>
            {prediction && (
              <div className="text-center mt-3">
                <h4>With high confidence the disease is: </h4>{" "}
                <h3>{prediction.replace("___", " ").replace("_", " ")}</h3>
              </div>
            )}

            {loadingPrediction && (
              <div className="text-center mt-3">
                <h4>Loading ... </h4>
              </div>
            )}

            <hr />

            {/* results display */}
            {results.length > 0 && (
              <>
                <>
                  <div className="col-md-6">
                    <div className="bg-info p-3 mb-3">
                      <h2>{results[0]}</h2>
                      <p>{results[1]}</p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="bg-info p-3 mb-3">
                      <h2>{results[2]}</h2>
                      <p>{results[3]}</p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="bg-info p-3 mb-3">
                      <h2>{results[4]}</h2>
                      <p>{results[5]}</p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="bg-info p-3 mb-3">
                      <h2>{results[6]}</h2>
                      <p>{results[7]}</p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <Button
                      variant="contained"
                      color="primary"
                      type="submit"
                      onClick={sendData}
                      style={{ margin: "10px" }}
                    >
                      Save
                    </Button>
                  </div>
                </>
              </>
            )}

            <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
                    <Alert onClose={handleClose} severity="success" sx={{ width: '100%' }}>
                    Information saved successfully!
                    </Alert>
                </Snackbar>

            {loadingChatGPT && <CircularProgress color="secondary" />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
