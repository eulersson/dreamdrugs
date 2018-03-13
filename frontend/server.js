const axios = require('axios')
const express = require('express')
const multer = require('multer')
const app = express()

const storage = multer.diskStorage({
  destination: (req, file, callback) => callback(null, '/uploads'),
  filename: (req, file, callback) => callback(null, file.originalname)
});

const upload = multer({storage: storage}).single('me');
app.post('/upload', (req, res) => {
  upload(req, res, err => {
    if (err) {
      return res.end("Error uploading file.");
    }
    axios.get('http://api.dreambox.com/newimage?image=3')
      .then(response => console.log(response))
      .catch(error => console.log(error))
    res.send("File is uploaded.");
  })
});

app.get('/', (req, res) => res.send("Hello from frontend!"))
app.listen(3000, () => console.log(`Example app listening! NODE_ENV: ${process.env.NODE_ENV}`))
