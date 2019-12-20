const axios = require("axios");
const express = require("express");
const fs = require("fs");
const multer = require("multer");
const redis = require("redis");

// Setup redis client.
const client = redis.createClient({
  host: process.env.REDIS_HOST,
  password: process.env.REDIS_PASSWORD
});
client.on("error", err => console.error(err));

// Setup server and sockets.
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const websockets = {};

// When client socket connects it will greet with the job id to keep track of.
io.on("connection", socket => {
  console.log("New socket connection established.");
  socket.on("greet", jobId => {
    // Add the socket to a global object so we can keep track of it and send
    // progress information through it every time redis pulls messages.
    websockets[jobId] = socket;
  });
});

// Check if this is a production deploy or development.
const isDev = process.env.NODE_ENV !== "production";

// Describe the callback that reads the progress.
client.on("message", (chan, msg) => {
  console.log(`Job ${chan} progress: ${msg} received from redis. Emitting.`);
  websockets[chan].emit(chan, msg); // Let React frontend know about it.

  if (msg === "FINISHED") {
    console.log(`Task completed. Unsubscribing from ${chan}.`);
    client.unsubscribe(chan);

    // Clean up the socket.
    websockets[chan].disconnect(chan);
    delete websockets[chan];
  }
});

// Express settings.
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

// Setup webpack and live reloading if in dev mode.
if (isDev) {
  const webpack = require("webpack");
  const webpackConfig = require("./webpack.config");
  const webpackCompiler = webpack(webpackConfig);
  app.use(require("webpack-dev-middleware")(webpackCompiler, {}));
  app.use(require("webpack-hot-middleware")(webpackCompiler));
} else {
  app.use(express.static("dist"));
}

// In charge to send the image to the backend. Returns a promise.
// TODO: Move out hardcoded values to client code.
function passImageToBackend(modelParameters, res) {
  axios
    .post("http://dreamdrugs-backend:8080/dream", modelParameters)
    .then(response => {
      client.subscribe(response.data);
      res.json({
        status: response.status,
        message: "all good",
        body: response.data
      });
    })
    .catch(error => {
      res.json({
        status: error.response.status,
        message: error.response.statusText,
        body: error.response.data
      });
    });
}

// Configure multer to handle file uploads.
const storage = multer.diskStorage({
  destination: (req, file, callback) => callback(null, "/uploads"),
  filename: (req, file, callback) => callback(null, file.originalname)
});

const upload = multer({ storage }).single("file");

// When selecting a file from a folder and uploading it.
// TODO: Request must have in the data object all the parameters for the model.
app.post("/upload", (req, res) => {
  upload(req, res, err => {
    if (err) {
      res.end("Error uploading file.");
    }
    passImageToBackend(req.file.path, res);
  });
});

// When using the webcam (getting base64 data from canvas).
// TODO: Request must have in the data object all the parameters for the model.
app.post("/snap", (req, res) => {
  fs.writeFile(
    "/uploads/out.jpg",
    req.body.image.replace(/^data:image\/png;base64,/, ""),
    "base64",
    err => console.error(err)
  );
  const modelParameters = {
    ...req.body.parameters,
    image: "/uploads/out.jpg"
  };
  passImageToBackend(modelParameters, res);
});

app.get("/models", (req, res) => {
  axios
    .get("http://dreamdrugs-backend:8080/models")
    .then(response => res.json(response.data))
    .catch(err => console.error(err));
});

app.get("/signature/:model", (req, res) => {
  axios
    .get(`http://dreamdrugs-backend:8080/signature/${req.param("model")}`)
    .then(response => res.json(response.data))
    .catch(err => console.error(err));
});

app.post("/cancel/:jobId", (req, res) => {
  axios
    .post(`http://dreamdrugs-backend:8080/cancel/${req.param("jobId")}`)
    .then(response => res.json(response.data))
    .catch(err => console.error(err));
});

http.listen(3000, () => {
  console.log(`dreamdrugs app listening! NODE_ENV: ${process.env.NODE_ENV}`);
});
