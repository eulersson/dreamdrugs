const express = require('express')
const app = express()

app.get('/', (req, res) => res.send("Hello from frontend!"))
app.listen(3000, () => console.log(`Example app listening! NODE_ENV: ${process.env.NODE_ENV}`))
