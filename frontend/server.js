const axios = require('axios')
const express = require('express')
const multer = require('multer')

const app = express()

const storage = multer.diskStorage({
  destination: (req, file, callback) => callback(null, '/uploads'),
  filename: (req, file, callback) => callback(null, file.originalname)
});

const upload = multer({storage: storage}).single('file');
app.post('/upload', (req, res) => {
  upload(req, res, err => {
    if (err) {
      res.end("Error uploading file.");
    }
    axios.get(`http://api.dreambox.com/newimage?image=${req.file.path}`)
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
  })
});

app.listen(3001, () => console.log(`Example app listening! NODE_ENV: ${process.env.NODE_ENV}`))
