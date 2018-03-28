const axios = require('axios')
const express = require('express')
const multer = require('multer')

const app = express()
app.use('/pictures', express.static('/uploads'))
app.use('/static', express.static(__dirname + '/static'))


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
    axios.get(`http://api.dreambox.com/newimage?image=${req.file.path}`)
      .then(response => console.log(response))
      .catch(error => console.log(error))
    res.send("File is uploaded.");
  })
});

app.get('/', (req, res) => res.send('Hello from frontend! <img src="/pictures/deep_me.jpg">'))
app.listen(3000, () => console.log(`Example app listening! NODE_ENV: ${process.env.NODE_ENV}`))
