/* global console */

const axios = require('axios');
const express = require('express');
const fs = require('fs');
const multer = require('multer');

const redis = require('redis');

const client = redis.createClient({ host: 'database' });
client.on('error', err => console.error(err));

const isDev = process.env.NODE_ENV !== 'production';
const app = express();
const http = require('http').Server(app);

const io = require('socket.io')(http);

let websocket;

// Describe the callback that reads the progress.
client.on('message', (chan, msg) => {
  console.log(`Job ${chan} progress: ${msg}% received from redis. Emitting.`);
  websocket.emit(chan, msg);
  if (msg === 'FINISHED') {
    console.log(`Task completed. Unsubscribing from ${chan}.`);
    client.unsubscribe(chan);
    websocket.disconnect(chan);
  }
});

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// Setup webpack and live reloading if in dev mode.
if (isDev) {
  const webpack = require('webpack');
  const webpackConfig = require('./webpack.config');
  const webpackMiddleware = require('webpack-dev-middleware');
  const webpackHotMiddleware = require('webpack-hot-middleware');

  const webpackCompiler = webpack(webpackConfig);
  const wpmw = webpackMiddleware(webpackCompiler, {});
  app.use(wpmw);

  const wphmw = webpackHotMiddleware(webpackCompiler);
  app.use(wphmw);
} else {
  app.use(express.static('dist'));
}

// TODO: Setup socket.io server code. Each channel has to be the job id, and
// when a connection is created, we should subscribe to redis to that same
// channel name and emit the progress back to the React client code.

// In charge to send the image to the backend. Returns a promise.
// TODO: Move out hardcoded values to client code.
function passImageToBackend(imagePath, res) {
  axios
    .post('http://api.dreambox.com/dream', {
      model: 'inception5h',
      image: imagePath,
      blend: 0.2,
      depth_level: 2,
      feature_channel: undefined,
      layer_name: 'mixed4b',
      num_iterations: 10,
      rescale_factor: 0.7,
      squared: true,
      step_size: 1.5,
    })
    .then((response) => {
      console.log("Response from api is");
      console.log(response.data);
      client.subscribe(response.data);
      res.json({
        status: response.status,
        message: 'all good',
        body: response.data,
      });
    })
    .catch((error) => {
      console.error("oooops");
      res.json({
        status: error.response.status,
        message: error.response.statusText,
        body: error.response.data,
      });
    });
}

// Configure multer to handle file uploads.
const storage = multer.diskStorage({
  destination: (req, file, callback) => callback(null, '/uploads'),
  filename: (req, file, callback) => callback(null, file.originalname),
});
const upload = multer({ storage }).single('file');

// When selecting a file from a folder and uploading it.
app.post('/upload', (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      res.end('Error uploading file.');
    }
    passImageToBackend(req.file.path, res);
  });
});

// When using the webcam (getting base64 data from canvas).
app.post('/snap', (req, res) => {
  const base64Data = req.body.image.replace(/^data:image\/png;base64,/, '');
  fs.writeFile('/uploads/out.jpg', base64Data, 'base64', (err) => {
    console.log(err);
  });
  console.log("im snapping");
  passImageToBackend('/uploads/out.jpg', res);
});

io.on('connection', (socket) => {
  console.log('Someone connected.');
  websocket = socket;
  socket.on('message', msg => {
    console.log("OMG!" + msg)
    socket.emit('message', `tou said${msg}`)
  });
  socket.on('disconnect', () => console.log('Good bye.'));
});

http.listen(3000, () => console.log(`Dreambox app listening! NODE_ENV: ${process.env.NODE_ENV}`));
