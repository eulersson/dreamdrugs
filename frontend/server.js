const axios = require('axios')
const express = require('express')
const multer = require('multer')

var isDev = process.env.NODE_ENV !== 'production';
const app = express()

app.use(express.json({ limit: '5mb'}));
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
  app.use(express.static('dist'))
}

// In charge to send the image to the backend. Returns a promise.
// TODO: Move out hardcoded values to client code.
function passImageToBackend(imagePath, res) {
  axios.get('http://api.dreambox.com/dream', {
    params: {
      model: 'inception5h',
      image: imagePath,
      blend: 0.2,
      depth_level: 2,
      feature_channel: undefined,
      layer_name: 'mixed4b',
      num_iterations: 10,
      rescale_factor: 0.7,
      squared: true,
      step_size: 1.5
    }
  })
    .then(response => {
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
  destination: (req, file, callback) => callback(null, '/uploads'),
  filename: (req, file, callback) => callback(null, file.originalname)
});
const upload = multer({storage: storage}).single('file');

// When selecting a file from a folder and uploading it.
app.post('/upload', (req, res) => {
  upload(req, res, err => {
    if (err) {
      res.end("Error uploading file.");
    }
    passImageToBackend(req.file.path, res);
  });
});


// When using the webcam (getting base64 data from canvas).
app.post('/snap', (req, res) => {
	const base64Data = req.body.image.replace(/^data:image\/png;base64,/, "");
	require("fs").writeFile("/uploads/out.jpg", base64Data, 'base64', function(err) {
		console.log(err);
	});
  passImageToBackend("/uploads/out.jpg", res);
});


// Queries the progress coming from the backend server.
app.get('/progress', (req, res) => {
  console.log("server says getting progress");
  axios.get(`http://api.dreambox.com/progress`)
    .then(response => {
      res.json({
        progress: response.data
      });
    })
    .catch(error => {
      console.error(error);
    });
});


app.listen(3000, () => console.log(`Dreambox app listening! NODE_ENV: ${process.env.NODE_ENV}`))
