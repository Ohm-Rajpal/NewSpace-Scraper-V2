import express from "express"
import cors from "cors"

const app = express()
const port = 3000

// middleware
app.use(cors()); // communication with frontend  
app.use(express.json()); // parse JSON


// hello world
app.get('/', (req, res) => {
    res.send('Hello World!')
})
  
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})