const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { exec } = require('child_process');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', (socket) => {
  console.log('a user connected');

  // Handle start recording
  socket.on('start-recording', () => {
    exec('raspivid -o video.h264 -t 60000', (err, stdout, stderr) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log(stdout);
    });
  });

  // Handle stop recording
  socket.on('stop-recording', () => {
    exec('pkill raspivid', (err, stdout, stderr) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log('Recording stopped.');
    });
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});
