import { ffmpeg } from "../App";

export async function createVideo(images: ArrayBuffer[]) {
    console.log("Starting FFmpeg");
    
    ffmpeg.on("log", ({ message }) => {
      console.log(message);
    });
  
    console.log('FFmpeg loaded');
  
    console.time("execution")

    console.log('Writing images')
    
    for (let i = 0; i < images.length; i++) {
        const img = images[i];
        const filename = `image_${i}.jpg`;
      
        try {
          await ffmpeg.writeFile(filename, new Uint8Array(img));
          console.log(`Written file: ${filename}, size: ${img.byteLength} bytes`);
        } catch (error) {
          console.error(`Error processing ${filename}:`, error);
        }
      }

    console.log('images written')
  
    console.log('Executing FFmpeg command');
    try {
      await ffmpeg.exec(['-framerate', '30', '-i', 'image_%d.jpg', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', 'output.mp4']);
      console.log('FFmpeg command executed successfully');
    } catch (error) {
      console.error('Error executing FFmpeg command:', error);
    }
  
    console.log('reading video')

    const videoData = await ffmpeg.readFile('output.mp4') as unknown as Uint8Array;

    console.log(videoData)
    
    if (videoData.byteLength === 9) {
      console.error('Output video file is empty');
      throw new Error('Failed to create video');
    }
    console.timeEnd('execution')

    console.log('creating blob')
  
    const videoBlob = new Blob([videoData.buffer], { type: 'video/mp4' });
    const videoUrl = URL.createObjectURL(videoBlob);
  
    console.log('Video URL:', videoUrl);
    return videoUrl;
  }
