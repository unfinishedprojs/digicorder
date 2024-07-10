import {
  Box,
  Button,
  ButtonGroup,
  Container,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  Typography,
} from "@suid/material";
import AppBarPer from "../components/AppBarPer";
import StreamImage from "../components/StreamImage";
import { createSignal, For, onCleanup } from "solid-js";
import { saveAs } from "file-saver";
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { createVideo } from "../lib/makeVideo";

export default function Main() {
  const [isBlinking, setIsBlinking] = createSignal(false);
  const [videoUrl, setVideoUrl] = createSignal(null);
  const [videos, setVideos] = createSignal([]);
  const [isButtonDisabled, setIsButtonDisabled] = createSignal(false);
  const ffmpegRef = new FFmpeg()
  let canvas;
  let recordingId;
  let images: Blob[] = [];

  const handleBlink = () => {
    setIsBlinking(true);
    setTimeout(() => setIsBlinking(false), 130); // ms
    handleDownloadImage();
  };

  const handleDownloadImage = () => {
    const imageUrl = "http://192.168.1.137:8080/?action=snapshot";
    const imageName = `${new Date()
      .toISOString()
      .replace(/T/, " ")
      .replace(/\..+/, "")}.jpg`;

    fetch(imageUrl)
      .then((response) => response.blob())
      .then((blob) => {
        saveAs(blob, imageName);
      })
      .catch((error) => console.error("Error downloading the image:", error));
  };

  const start = async () => {
      const videoURL = await createVideo(images)
      setVideoUrl(videoURL);
      setVideos((prev) => [
        ...prev,
        {
          url: videoURL,
          date: new Date().toISOString().replace(/T/, " ").replace(/\..+/, ""),
        },
      ]);
      const downloadLink = document.createElement("a");
      downloadLink.href = videoURL;
      downloadLink.download = `${new Date()
        .toISOString()
        .replace(/T/, " ")
        .replace(/\..+/, "")}.webm`;
      downloadLink.style.display = "none";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
  };

  const recordSnapshot = async () => {
    const imageUrl = "http://192.168.1.137:8080/?action=snapshot";
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const arrayBuffer = await response.blob();
      if (arrayBuffer.size > 0) {
        images.push(arrayBuffer);
        console.log(`Fetched image size: ${arrayBuffer.size} bytes`);
      } else {
        console.error("Fetched image is empty");
      }
    } catch (error) {
      console.error("Error downloading the image:", error);
    }
  };

  const startRecording = () => {
    images = [];
    recordingId = setInterval(recordSnapshot, 1000 / 30); // FPS
    setIsButtonDisabled(true)
  };

  const stopRecording = () => {
    clearInterval(recordingId);
    setIsButtonDisabled(false)
    start();
  };

  onCleanup(() => {
    if (videoUrl()) {
      URL.revokeObjectURL(videoUrl());
    }
  });

  return (
    <Container>
      <Box
        sx={{
          position: "fixed",
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          background: "#303030",
        }}
      >
        <AppBarPer />

        <Stack>
          <div style={{ position: "relative", display: "inline-block" }}>
            <StreamImage />
            {isBlinking() && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  "background-color": "white",
                  opacity: 0.7,
                  animation: "blink-animation 5s linear",
                }}
              />
            )}
          </div>

          <ButtonGroup
            variant="contained"
            aria-label="outlined primary button group"
            sx={{
              position: "static",
            }}
          >
            <Button color="error" onClick={startRecording} disabled={isButtonDisabled()}>
              Record
            </Button>
            <Button color="error" onClick={stopRecording} disabled={!(isButtonDisabled())}>
              Stop
            </Button>
            <Button onClick={handleBlink}>Screenshot</Button>
            <Button color="warning">Power off</Button>
          </ButtonGroup>
        </Stack>

        <List>
          <For each={videos()}>
            {(video, i) => (
              <ListItem>
                <ListItemButton ref={(el) => (video.url = el)}>
                  <Typography>{video.date}</Typography>
                </ListItemButton>
              </ListItem>
            )}
          </For>
        </List>

        <canvas
          ref={(el) => (canvas = el)}
          style={{ display: "none" }}
        ></canvas>
      </Box>
    </Container>
  );
}
