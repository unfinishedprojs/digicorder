import { createTheme, ThemeProvider } from "@suid/material";
import { Route, Router } from "@solidjs/router";
import MainPage from "./pages/Main";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";

const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';

async function loadFfmpeg() {
  const ffmpeg = new FFmpeg();

  ffmpeg.on("log", ({ message }) => {
    console.log(message);
  });

  ffmpeg.on("progress", ({ progress, time }) => {
    console.log(`${progress * 100} %, time: ${time / 1000000} s`);
  });

  console.log("Initializing FFmpeg");
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
  });

  return ffmpeg
}

export const ffmpeg = await loadFfmpeg()

export default function App() {
  const darkTheme = createTheme({
    palette: {
      mode: "dark",
    },
  });

  return (
    <ThemeProvider theme={darkTheme}>
      <Router>
        <Route path="/" component={MainPage} />
      </Router>
    </ThemeProvider>
  );
}
