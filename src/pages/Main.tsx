import {
  Box,
  Button,
  ButtonGroup,
  Container,
  LinearProgress,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from "@suid/material";
import AppBarPer from "../components/AppBarPer";
import { createEffect, createSignal, For, onCleanup } from "solid-js";
import { saveAs } from "file-saver";
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { createVideo } from "../lib/makeVideo";
import { ffmpeg } from "../App";

export default function Main() {
  const [isBlinking, setIsBlinking] = createSignal(false);
  const [videoUrl, setVideoUrl] = createSignal(null);
  const [videos, setVideos] = createSignal([]);
  const [isButtonDisabled, setIsButtonDisabled] = createSignal(false);
  const [progress, setProgress] = createSignal(0);
  const [streamUrl, setStreamUrl] = createSignal('http://' + window.location.hostname + ':8080')
  const ffmpegRef = new FFmpeg()
  let canvas;
  let recordingId;
  let images = [];

  const handleBlink = () => {
    setIsBlinking(true);
    setTimeout(() => setIsBlinking(false), 130); // ms
    handleDownloadImage();
  };

  const handleDownloadImage = () => {
    const imageUrl = streamUrl() + "/?action=snapshot";
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
      .replace(/\..+/, "")}.mp4`;
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const recordSnapshot = async () => {
    const imageUrl = streamUrl() + "/?action=snapshot";
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      if (arrayBuffer.byteLength > 0) {
        images.push(arrayBuffer);
        console.log(`Fetched image size: ${arrayBuffer.byteLength} bytes`);
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

  createEffect(() => {
    const img = document.querySelector('#stream-image');
    img.src = `${streamUrl()}/?action=stream`;
  });

  ffmpeg.on('progress', ({ progress, time }) => {
    console.log('Progress: ' + progress * 100)
    setProgress(progress * 100)
  })

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
            <img
              src={streamUrl() + '/?action=stream'}
              alt="Stream"
              id="stream-image"
              style={{
                width: '100%',
                "max-width": '800px',
                height: 'auto'
              }}
            />
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

        <LinearProgress variant="buffer" value={progress()} sx={{ p: "5px" }} />

        <TextField id="outlined-basic"
        label="Set IP"
        variant="outlined"
        defaultValue={streamUrl()}
        onInput={(e) => setStreamUrl((e.target as HTMLInputElement).value)}
        />

        <List>
          <For each={videos()}>
            {(video, i) => (
              <ListItem>
                <ListItemButton ref={(el) => (video.url = el)}>
                  <Typography color="white">{video.date}</Typography>
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
