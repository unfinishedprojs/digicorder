import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import {fileTypeFromBuffer} from 'file-type';

const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';

function arrayBufferToUint8Array(buffer: ArrayBuffer): Uint8Array {
    return new Uint8Array(buffer);
}

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

  console.time("execution")
  
  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    const filename = `image_${i}.jpg`;
  
    try {  
      // Write image data to FFmpeg
      await ffmpeg.writeFile(filename, new Uint8Array(img));
      console.log(`Written file: ${filename}, size: ${img.byteLength} bytes`);
    } catch (error) {
      console.error(`Error processing ${filename}:`, error);
    }
  }

  console.log('Executing FFmpeg command');
  try {
    console.log(await ffmpeg.listDir('.'))

    console.log(await ffmpeg.readFile('image_1.jpg'))

    await ffmpeg.exec(['-framerate', '30', '-pattern_type', 'glob', '-i', '*.jpg', 'output.mp4']);
    console.log('FFmpeg command executed successfully');
  } catch (error) {
    console.error('Error executing FFmpeg command:', error);
  }

  const videoData = ffmpeg.readFile('output.mp4') as unknown as Uint8Array;
  
  if (videoData.byteLength === 0) {
    console.error('Output video file is empty');
    throw new Error('Failed to create video');
  }
  console.timeEnd('execution')

  const videoBlob = new Blob([videoData.buffer], { type: 'video/mp4' });
  const videoUrl = URL.createObjectURL(videoBlob);

  console.log('Video URL:', videoUrl);
  return videoUrl;
}
