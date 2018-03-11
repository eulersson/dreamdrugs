const express = require('express')
const multer = require('multer')
const app = express()

var storage = multer.diskStorage({
  destination: function(req, file, callback) {
    callback(null, './uploads');
  },
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});

app.get('/', (req, res) => res.send("Hello from frontend!"))
app.listen(3000, () => console.log(`Example app listening! NODE_ENV: ${process.env.NODE_ENV}`))


