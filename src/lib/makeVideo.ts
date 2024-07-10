import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from '@ffmpeg/util';

const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';

export async function createVideo(images: ArrayBuffer[]) {
  console.log("Starting FFmpeg");
  const ffmpeg = new FFmpeg();
  
  ffmpeg.on("log", ({ message }) => {
    console.log(message);
  });
  
  ffmpeg.on("progress", ({ progress, time }) => {
    console.log(`${progress * 100} %, time: ${time / 1000000} s`);
  });

  console.log('Initializing FFmpeg');
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  });

  console.log('FFmpeg loaded');
  
  // Write each image to the virtual filesystem
  images.forEach((img, i) => {
    const filename = `image_${i}.jpg`;
    ffmpeg.writeFile(filename, new Uint8Array(img));
    console.log(`Written file: ${filename}`);
  });

  console.log('Executing FFmpeg command');
  try {
    await ffmpeg.exec(['-framerate', '30', '-i', 'image_%d.jpg', 'output.mp4']);
    console.log('FFmpeg command executed successfully');
  } catch (error) {
    console.error('Error executing FFmpeg command:', error);
  }

  const videoData = ffmpeg.readFile('output.mp4') as unknown as Uint8Array;
  
  if (videoData.byteLength === 0) {
    console.error('Output video file is empty');
    throw new Error('Failed to create video');
  }

  const videoBlob = new Blob([videoData.buffer], { type: 'video/mp4' });
  const videoUrl = URL.createObjectURL(videoBlob);

  console.log('Video URL:', videoUrl);
  return videoUrl;
}
